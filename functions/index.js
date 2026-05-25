import { onCall } from 'firebase-functions/v2/https'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

initializeApp()
const db = getFirestore()

function requireFields(data, fields) {
  for (const field of fields) {
    if (data[field] === null || data[field] === undefined) {
      throw new Error(`Missing required field: ${field}`)
    }
  }
}

function sanitizeString(val) {
  if (typeof val !== 'string') return ''
  return val.slice(0, 2000).trim()
}

export const createProject = onCall(async (request) => {
  if (!request.auth) throw new Error('Unauthorized')
  requireFields(request.data, ['userId'])
  if (request.data.userId !== request.auth.uid) throw new Error('Forbidden')

  const project = {
    name: sanitizeString(request.data.name) || 'Untitled Project',
    userId: request.auth.uid,
    pages: [{
      id: 'page-1',
      name: 'Home',
      slug: 'home',
      sections: [],
    }],
    theme: {
      primaryColor: '#4F46E5',
      secondaryColor: '#7C3AED',
      fontFamily: 'Inter',
      headingFont: 'Inter',
      borderRadius: '8px',
    },
    status: 'draft',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  const ref = await db.collection('projects').add(project)
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

export const generateWebsite = onCall(async (request) => {
  if (!request.auth) throw new Error('Unauthorized')
  requireFields(request.data, ['prompt'])

  const prompt = sanitizeString(request.data.prompt)
  if (!prompt) throw new Error('Prompt is required')

  const GEMINI_KEY = process.env.GEMINI_API_KEY

  if (!GEMINI_KEY) {
    return generateMockResponse(prompt)
  }

  const systemPrompt = 'You are an expert web designer AI. Generate a complete website as a JSON array of sections. Each section must have: id, type, componentType, props. Available types: hero, services, features, testimonials, pricing, contact, footer, gallery, team, faq, stats, cta. Return ONLY valid JSON.'

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${prompt}` }] }],
        }),
      }
    )
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
    return JSON.parse(cleaned)
  } catch (err) {
    console.error('Gemini API error:', err)
    return generateMockResponse(prompt)
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

function generateStaticHtml(project) {
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
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function generateMockResponse(prompt) {
  return [
    {
      id: 'section-hero',
      type: 'hero',
      componentType: 'hero',
      props: {
        headline: 'Build Your Dream Website',
        subheadline: 'Create stunning websites with AI in minutes',
        ctaText: 'Get Started Free',
        ctaLink: '#',
        backgroundStyle: 'gradient',
        alignment: 'center',
      },
    },
    {
      id: 'section-features',
      type: 'features',
      componentType: 'features',
      props: {
        title: 'Powerful Features',
        subtitle: 'Everything you need to succeed online',
        features: [
          { title: 'AI Powered', description: 'Generate websites with AI', icon: 'Zap' },
          { title: 'Drag & Drop', description: 'Easy visual editor', icon: 'Check' },
          { title: 'Responsive', description: 'Looks great on all devices', icon: 'Smartphone' },
        ],
      },
    },
    {
      id: 'section-pricing',
      type: 'pricing',
      componentType: 'pricing',
      props: {
        title: 'Simple Pricing',
        subtitle: 'Start free, upgrade when you need',
        plans: [
          { name: 'Free', price: '$0', features: ['1 Website', 'Basic sections'], cta: 'Get Started' },
          { name: 'Pro', price: '$19', features: ['10 Websites', 'All sections', 'Custom domain'], cta: 'Try Pro', highlighted: true },
          { name: 'Business', price: '$49', features: ['Unlimited', 'Everything', 'Priority support'], cta: 'Contact' },
        ],
      },
    },
    {
      id: 'section-contact',
      type: 'contact',
      componentType: 'contact',
      props: {
        title: 'Get In Touch',
        subtitle: "We'd love to hear from you",
        email: 'hello@example.com',
        phone: '+1 234 567 890',
        address: '123 Main St',
      },
    },
    {
      id: 'section-footer',
      type: 'footer',
      componentType: 'footer',
      props: {
        text: '© 2025 WebForge AI. All rights reserved.',
        links: [{ label: 'Privacy', url: '#' }, { label: 'Terms', url: '#' }],
      },
    },
  ]
}
