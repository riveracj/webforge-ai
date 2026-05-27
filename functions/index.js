import { onCall } from 'firebase-functions/v2/https'
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { defineSecret } from 'firebase-functions/params'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import Stripe from 'stripe'

initializeApp()
const db = getFirestore()

const geminiApiKey = defineSecret('GEMINI_API_KEY')
const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY')

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key, { apiVersion: '2025-03-31' })
}

function getWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET || ''
}

const PLANS_PRICES = {
  pro: { priceId: process.env.STRIPE_PRO_PRICE_ID || '', credits: 100, projects: 20 },
  business: { priceId: process.env.STRIPE_BUSINESS_PRICE_ID || '', credits: 500, projects: 100 },
}

function requireFields(data, fields) {
  for (const field of fields) {
    if (data[field] === null || data[field] === undefined) {
      throw new Error(`Missing required field: ${field}`)
    }
  }
}

function sanitizeString(val, maxLen = 2000) {
  if (typeof val !== 'string') return ''
  return val.slice(0, maxLen).trim()
}

function sanitizeHtmlContent(val) {
  if (typeof val !== 'string') return ''
  return val.slice(0, 50000).trim()
}

// In-memory rate limiter: max `limit` requests per `windowMs` per user
const rateLimitMap = new Map()
function checkRateLimit(userId, limit = 5, windowMs = 60000) {
  const now = Date.now()
  const timestamps = rateLimitMap.get(userId) || []
  const recent = timestamps.filter(t => now - t < windowMs)
  if (recent.length >= limit) {
    const oldest = recent[0]
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000)
    throw new Error(`Rate limit exceeded. Max ${limit} generations per ${windowMs / 1000}s. Retry in ${retryAfter}s.`)
  }
  recent.push(now)
  rateLimitMap.set(userId, recent)
}

// Daily Firestore rate limiter
async function checkDailyLimit(userId) {
  const today = new Date().toISOString().slice(0, 10)
  const ref = db.collection('rateLimits').doc(`gen_${userId}_${today}`)
  const snap = await ref.get()
  const count = snap.exists ? (snap.data().count || 0) : 0
  if (count >= 200) {
    throw new Error('Daily generation limit reached (200/day). Try again tomorrow or enable billing for higher quotas.')
  }
  await ref.set({ count: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() }, { merge: true })
}

const PLAN_LIMITS = {
  free: { projects: 20, aiGenerations: 100 },
  pro: { projects: 20, aiGenerations: 100 },
  business: { projects: 100, aiGenerations: 500 },
}

export const createProject = onCall(async (request) => {
  if (!request.auth) throw new Error('Unauthorized')
  requireFields(request.data, ['userId'])
  if (request.data.userId !== request.auth.uid) throw new Error('Forbidden')

  const userDoc = await db.collection('users').doc(request.auth.uid).get()
  if (!userDoc.exists) {
    await db.collection('users').doc(request.auth.uid).set({
      uid: request.auth.uid,
      email: request.auth.token.email || '',
      name: request.auth.token.name || '',
      role: 'user',
      createdAt: Date.now(),
      usage: { projectCount: 0, aiGenerationsUsed: 0, plan: 'free' },
    })
  }

  const usage = (await db.collection('users').doc(request.auth.uid).get()).data()?.usage || { projectCount: 0, plan: 'free' }
  const limits = PLAN_LIMITS[usage.plan] || PLAN_LIMITS.free

  if (usage.projectCount >= limits.projects) {
    throw new Error(`You've reached the ${usage.plan} plan limit of ${limits.projects} projects. Upgrade to create more.`)
  }

  const project = {
    name: sanitizeString(request.data.name) || 'Untitled Project',
    userId: request.auth.uid,
    generatedHtml: sanitizeHtmlContent(request.data.generatedHtml),
    prompt: sanitizeString(request.data.prompt),
    status: 'draft',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  const ref = await db.collection('projects').add(project)

  await db.collection('users').doc(request.auth.uid).update({
    'usage.projectCount': FieldValue.increment(1),
  })

  return { id: ref.id, ...project }
})

export const getProject = onCall(async (request) => {
  if (!request.auth) throw new Error('Unauthorized')
  requireFields(request.data, ['projectId'])

  const doc = await db.collection('projects').doc(request.data.projectId).get()
  if (!doc.exists) throw new Error('Project not found')

  const data = doc.data()
  if (data.userId !== request.auth.uid) throw new Error('Forbidden')

  return { id: doc.id, ...data }
})

export const updateProject = onCall(async (request) => {
  if (!request.auth) throw new Error('Unauthorized')
  requireFields(request.data, ['projectId'])

  const doc = await db.collection('projects').doc(request.data.projectId).get()
  if (!doc.exists) throw new Error('Project not found')
  if (doc.data().userId !== request.auth.uid) throw new Error('Forbidden')

  const { projectId, ...data } = request.data
  await db.collection('projects').doc(projectId).update({
    ...data,
    updatedAt: Date.now(),
  })
  return { success: true }
})

export const deleteProject = onCall(async (request) => {
  if (!request.auth) throw new Error('Unauthorized')
  requireFields(request.data, ['projectId'])

  const doc = await db.collection('projects').doc(request.data.projectId).get()
  if (!doc.exists) throw new Error('Project not found')
  if (doc.data().userId !== request.auth.uid) throw new Error('Forbidden')

  await db.collection('projects').doc(request.data.projectId).delete()
  return { success: true }
})

export const listProjects = onCall(async (request) => {
  if (!request.auth) throw new Error('Unauthorized')

  const snap = await db
    .collection('projects')
    .where('userId', '==', request.auth.uid)
    .orderBy('updatedAt', 'desc')
    .get()

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
})

export const generateWebsite = onCall(
  { secrets: [geminiApiKey] },
  async (request) => {
  if (!request.auth) throw new Error('Unauthorized')
  requireFields(request.data, ['prompt'])

  const prompt = sanitizeString(request.data.prompt)
  const currentHtml = sanitizeHtmlContent(request.data.currentHtml)
  if (!prompt) throw new Error('Prompt is required')

  checkRateLimit(request.auth.uid, 5, 60000)
  await checkDailyLimit(request.auth.uid)

  const GEMINI_KEY = geminiApiKey?.value?.() || process.env.GEMINI_API_KEY || ''

  if (!GEMINI_KEY) {
    console.warn('No Gemini API key found, using fallback HTML')
    return { html: generateFallbackHtml(prompt) }
  }

  const isFollowUp = !!currentHtml

  const systemPrompt = isFollowUp
    ? `You are an expert web designer AI. You will receive an existing HTML page and a user request describing what to change. Your job is to modify the existing HTML to fulfill the request while preserving everything else.

Rules:
- Return ONLY the modified HTML code inside \`\`\`html ... \`\`\` markers
- PRESERVE the existing design, layout, colors, fonts and content UNLESS the user explicitly asks to change them
- Make surgical, targeted changes — do not rewrite the entire page unless the user asks for a complete redesign
- Keep all existing CSS styles, JS functionality, and page structure intact
- Maintain responsive design and accessibility
- The output must be a complete <!DOCTYPE html> document`
    : `You are an expert web designer AI. Generate a complete, production-quality single-page HTML website based on the user's description.

Requirements:
- Return ONLY the raw HTML code inside \`\`\`html ... \`\`\` markers
- Use modern HTML5, CSS3, and vanilla JavaScript
- All CSS must be in a <style> tag inside <head>
- All JS must be in a <script> tag before </body>
- Use a clean, professional design with responsive layout
- Include smooth scrolling, hover effects, and modern typography
- Use a color scheme that fits the business/industry from the prompt
- Include Font Awesome or inline SVG icons
- Make it a complete, ready-to-use landing page
- Do NOT include any markdown outside the code block

The HTML must be a complete page with: <!DOCTYPE html>, <html>, <head>, <body> tags.
Use Google Fonts (Inter, Poppins, or similar) for typography.`

  const userMessage = isFollowUp
    ? `Existing HTML:\n\n${currentHtml}\n\nUser request: ${prompt}\n\nModify the existing HTML according to this request. Return the complete modified HTML document.`
    : `User request: ${prompt}`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
        }),
      }
    )
    const data = await res.json()

    if (data.error) {
      const msg = data.error.message || ''
      console.error('Gemini API error:', msg)
      if (data.error.code === 429 || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota') || msg.includes('rate')) {
        if (msg.includes('prepayment')) {
          throw new Error(`Gemini API: prepay credits depleted. Go to https://ai.studio/projects to add funds or switch to pay-as-you-go.`)
        }
        throw new Error(`Gemini API quota exceeded: ${msg}. Enable billing at https://ai.google.dev/pricing or wait a minute and retry.`)
      }
      throw new Error(`Gemini API error: ${msg}`)
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      console.error('Gemini returned empty response:', JSON.stringify(data))
      throw new Error('Gemini returned empty response. Try a more detailed prompt.')
    }

    const match = text.match(/```html\s*([\s\S]*?)```/)
    const html = match ? match[1].trim() : text.replace(/```\s*/g, '').trim()
    if (!html || html.length < 100) {
      console.error('Gemini returned invalid HTML')
      throw new Error('Gemini returned incomplete HTML. Try a more detailed prompt.')
    }
    return { html }
  } catch (err) {
    console.error('Gemini API error:', err.message || err)
    throw new Error(err.message || 'AI generation failed. Please try again.')
  }
})

export const publishProject = onCall(async (request) => {
  if (!request.auth) throw new Error('Unauthorized')
  requireFields(request.data, ['projectId'])

  const doc = await db.collection('projects').doc(request.data.projectId).get()
  if (!doc.exists) throw new Error('Project not found')

  const project = doc.data()
  const customDomain = request.data.customDomain
    ? sanitizeString(request.data.customDomain)
    : null

  const url = customDomain
    ? `https://${customDomain}`
    : `https://${request.data.projectId}.webforge-ai.web.app`

  await db.collection('projects').doc(request.data.projectId).update({
    status: 'published',
    publishedUrl: url,
    publishedAt: Date.now(),
    updatedAt: Date.now(),
  })

  const html = generateStaticHtml(project)

  await db.collection('published_sites').doc(request.data.projectId).set({
    html,
    url,
    publishedAt: Date.now(),
  })

  return { url, success: true }
})

export const createCheckoutSession = onCall({ secrets: [stripeSecretKey] }, async (request) => {
  if (!request.auth) throw new Error('Unauthorized')
  requireFields(request.data, ['priceId'])

  const { priceId, successUrl, cancelUrl } = request.data
  const userId = request.auth.uid

  const userDoc = await db.collection('users').doc(userId).get()
  if (!userDoc.exists) throw new Error('User not found')

  const stripe = getStripe()
  if (!stripe) throw new Error('Stripe not configured')

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: userId,
    customer_email: userDoc.data().email,
    metadata: { userId },
    success_url: successUrl || 'https://webforge-ai-fd9e8.web.app/dashboard?upgrade=success',
    cancel_url: cancelUrl || 'https://webforge-ai-fd9e8.web.app/dashboard?upgrade=cancelled',
  })

  return { url: session.url, sessionId: session.id }
})

export const stripeWebhook = onCall({ secrets: [stripeSecretKey] }, async (request) => {
  const stripe = getStripe()
  if (!stripe) throw new Error('Stripe not configured')

  const sig = request.rawRequest?.headers['stripe-signature']
  if (!sig || !getWebhookSecret()) throw new Error('Missing signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(request.rawBody, sig, getWebhookSecret())
  } catch {
    throw new Error('Invalid signature')
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata?.userId || session.client_reference_id
    const priceId = session.line_items?.data?.[0]?.price?.id

    let plan = 'free'
    for (const [key, config] of Object.entries(PLANS_PRICES)) {
      if (config.priceId === priceId) { plan = key; break }
    }

    if (userId && plan !== 'free') {
      await db.collection('users').doc(userId).update({
        'usage.plan': plan,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
      })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    const userId = subscription.metadata?.userId

    if (userId) {
      await db.collection('users').doc(userId).update({
        'usage.plan': 'free',
        stripeSubscriptionId: null,
      })
    }
  }

  return { received: true }
})

function generateStaticHtml(project) {
  if (project.generatedHtml) return project.generatedHtml

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(project.name)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root">
    <p>${escHtml(project.name)} - Published with WebForge AI</p>
  </div>
</body>
</html>`
}

function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function generateFallbackHtml(prompt) {
  const name = prompt.split(/\.|,|\n/)[0].slice(0, 40) || 'Your Website'
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(name)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1f2937; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 100px 0 80px; text-align: center; }
    header h1 { font-size: 3rem; font-weight: 800; margin-bottom: 16px; }
    header p { font-size: 1.25rem; opacity: 0.9; max-width: 600px; margin: 0 auto 32px; }
    .btn { display: inline-block; padding: 14px 36px; background: white; color: #4f46e5; border-radius: 8px; font-weight: 600; text-decoration: none; transition: transform 0.2s; }
    .btn:hover { transform: translateY(-2px); }
    section { padding: 80px 0; }
    section:nth-child(even) { background: #f9fafb; }
    h2 { font-size: 2rem; font-weight: 700; text-align: center; margin-bottom: 48px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; }
    .card { background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); text-align: center; }
    .card i { font-size: 2rem; color: #4f46e5; margin-bottom: 16px; }
    .card h3 { font-size: 1.25rem; margin-bottom: 8px; }
    .card p { color: #6b7280; }
    footer { background: #111827; color: #9ca3af; text-align: center; padding: 40px 0; }
    @media (max-width: 768px) { header h1 { font-size: 2rem; } header { padding: 60px 0 40px; } }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>${escHtml(name)}</h1>
      <p>${escHtml(prompt.slice(0, 120))}</p>
      <a href="#" class="btn">Get Started</a>
    </div>
  </header>
  <section>
    <div class="container">
      <h2>Features</h2>
      <div class="grid">
        <div class="card"><i class="fas fa-bolt"></i><h3>Fast & Modern</h3><p>Built with cutting-edge technology for maximum performance.</p></div>
        <div class="card"><i class="fas fa-shield-alt"></i><h3>Secure</h3><p>Enterprise-grade security to protect your data.</p></div>
        <div class="card"><i class="fas fa-mobile-alt"></i><h3>Responsive</h3><p>Looks great on any device, from phones to desktops.</p></div>
      </div>
    </div>
  </section>
  <section>
    <div class="container">
      <h2>Contact Us</h2>
      <p style="text-align:center;color:#6b7280;margin-bottom:32px;">We'd love to hear from you. Get in touch today.</p>
      <div style="text-align:center;"><a href="mailto:hello@example.com" style="color:#4f46e5;font-weight:600;">hello@example.com</a></div>
    </div>
  </section>
  <footer>
    <div class="container">
      <p>&copy; 2025 ${escHtml(name)}. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`
}
