import { api } from '../api/api'

const SECTION_BLUEPRINTS = {
  hero: (data = {}) => ({
    type: 'hero',
    componentType: 'hero',
    props: {
      headline: data.headline || 'Build Your Dream Website',
      subheadline: data.subheadline || 'Create stunning websites with AI in minutes',
      ctaText: data.ctaText || 'Get Started Free',
      ctaLink: '#',
      backgroundStyle: 'gradient',
      alignment: 'center',
      styles: { padding: '100px 20px' },
    },
  }),
  features: (data = {}) => ({
    type: 'features',
    componentType: 'features',
    props: {
      title: data.title || 'Why Choose Us',
      subtitle: data.subtitle || 'Everything you need to succeed',
      features: data.items || [
        { title: 'AI Powered', description: 'Generate websites with AI in seconds', icon: 'Zap' },
        { title: 'Drag & Drop', description: 'Easy visual editor for customization', icon: 'Layout' },
        { title: 'Responsive', description: 'Looks great on all devices', icon: 'Smartphone' },
        { title: 'Fast Hosting', description: 'Deployed on global CDN', icon: 'Globe' },
      ],
      styles: { padding: '80px 20px', background: '#f8fafc' },
    },
  }),
  services: (data = {}) => ({
    type: 'services',
    componentType: 'services',
    props: {
      title: data.title || 'Our Services',
      subtitle: data.subtitle || 'What we offer',
      services: data.items || [
        { icon: 'Zap', title: 'Web Design', description: 'Beautiful, modern designs' },
        { icon: 'Shield', title: 'Development', description: 'Clean, performant code' },
        { icon: 'Smartphone', title: 'Marketing', description: 'Grow your audience' },
      ],
      styles: { padding: '80px 20px' },
    },
  }),
  testimonials: (data = {}) => ({
    type: 'testimonials',
    componentType: 'testimonials',
    props: {
      title: data.title || 'What Our Clients Say',
      testimonials: data.items || [
        { name: 'Sarah J.', role: 'CEO, TechStart', content: 'This platform transformed how we build websites.', rating: 5 },
        { name: 'Mike R.', role: 'Designer', content: 'Incredibly easy to use. The AI generation is mind-blowing.', rating: 5 },
      ],
      styles: { padding: '80px 20px', background: '#ffffff' },
    },
  }),
  pricing: (data = {}) => ({
    type: 'pricing',
    componentType: 'pricing',
    props: {
      title: data.title || 'Simple Pricing',
      subtitle: data.subtitle || 'Choose the plan that fits you',
      plans: data.items || [
        { name: 'Starter', price: '$9', features: ['1 Website', 'Basic sections', 'Community support'], cta: 'Get Started' },
        { name: 'Pro', price: '$29', features: ['10 Websites', 'All sections', 'Custom domain', 'Priority support'], cta: 'Start Trial', highlighted: true },
        { name: 'Enterprise', price: '$99', features: ['Unlimited', 'Everything', 'Dedicated support'], cta: 'Contact Us' },
      ],
      styles: { padding: '80px 20px', background: '#f8fafc' },
    },
  }),
  contact: (data = {}) => ({
    type: 'contact',
    componentType: 'contact',
    props: {
      title: data.title || 'Get In Touch',
      subtitle: data.subtitle || "We'd love to hear from you",
      email: data.email || 'hello@example.com',
      phone: data.phone || '+1 (555) 123-4567',
      address: data.address || '123 Main Street, City',
      styles: { padding: '80px 20px' },
    },
  }),
  footer: (data = {}) => ({
    type: 'footer',
    componentType: 'footer',
    props: {
      text: data.text || '© 2025 WebForge AI. All rights reserved.',
      links: data.links || [
        { label: 'Privacy Policy', url: '#' },
        { label: 'Terms of Service', url: '#' },
      ],
      styles: { padding: '40px 20px', background: '#1e293b', color: '#ffffff' },
    },
  }),
  cta: (data = {}) => ({
    type: 'cta',
    componentType: 'cta',
    props: {
      headline: data.headline || 'Ready to Get Started?',
      subheadline: data.subheadline || 'Join thousands building with AI',
      buttonText: data.buttonText || 'Get Started Free',
      buttonLink: '#',
      styles: { padding: '80px 20px' },
    },
  }),
  stats: (data = {}) => ({
    type: 'stats',
    componentType: 'stats',
    props: {
      title: data.title || 'Our Impact',
      stats: data.items || [
        { value: '10K+', label: 'Users' },
        { value: '99.9%', label: 'Uptime' },
        { value: '150+', label: 'Countries' },
        { value: '1M+', label: 'Sites Built' },
      ],
      styles: { padding: '80px 20px' },
    },
  }),
  gallery: (data = {}) => ({
    type: 'gallery',
    componentType: 'gallery',
    props: {
      title: data.title || 'Our Work',
      images: data.images || [
        { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600', alt: 'Work 1' },
        { src: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600', alt: 'Work 2' },
        { src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600', alt: 'Work 3' },
      ],
      styles: { padding: '80px 20px', background: '#f8fafc' },
    },
  }),
  team: (data = {}) => ({
    type: 'team',
    componentType: 'team',
    props: {
      title: data.title || 'Meet Our Team',
      members: data.items || [
        { name: 'Alex', role: 'CEO & Founder', bio: 'Visionary leader' },
        { name: 'Jordan', role: 'CTO', bio: 'Tech genius' },
        { name: 'Taylor', role: 'Design Lead', bio: 'Creative mind' },
      ],
      styles: { padding: '80px 20px' },
    },
  }),
  faq: (data = {}) => ({
    type: 'faq',
    componentType: 'faq',
    props: {
      title: data.title || 'FAQs',
      items: data.items || [
        { question: 'How does the AI work?', answer: 'Simply describe your website and our AI generates it.' },
        { question: 'Can I customize after generation?', answer: 'Yes! Use our drag-and-drop editor to tweak anything.' },
        { question: 'Can I publish to my own domain?', answer: 'Yes, with Pro plan you can use a custom domain.' },
      ],
      styles: { padding: '80px 20px', background: '#f8fafc' },
    },
  }),
}

function generateWebsiteFromPrompt(prompt) {
  const lower = prompt.toLowerCase()
  const business = extractBusinessInfo(prompt)
  const pageStructure = determinePageStructure(lower)
  const name = business.name || 'Your Business'
  const sections = []

  const sectionHeadlines = {
    hero: business.name
      ? { headline: `Welcome to ${business.name}`, subheadline: business.industry ? `Your trusted ${business.industry} partner` : 'Built for you' }
      : { headline: 'Build Something Great', subheadline: prompt.slice(0, 80) },
    features: { title: `Why ${name}`, subtitle: 'Everything you need to succeed' },
    services: { title: 'What We Offer' },
    pricing: { title: 'Simple Pricing' },
    cta: { headline: `Ready to Work with ${name}?` },
    contact: { title: 'Get In Touch' },
    stats: { title: `${name} by the Numbers` },
    team: { title: `Meet the ${name} Team` },
    gallery: { title: 'Our Work' },
    faq: { title: 'Frequently Asked Questions' },
  }

  for (const sectionType of pageStructure) {
    const blueprint = SECTION_BLUEPRINTS[sectionType]
    if (blueprint) {
      const ctx = sectionHeadlines[sectionType] || {}
      const data = generateSectionData(sectionType, business, lower)
      sections.push(blueprint({ ...data, ...ctx }))
    }
  }

  sections.push(SECTION_BLUEPRINTS.footer({ text: `© 2025 ${name}. All rights reserved.` }))

  return sections.map((s, i) => ({
    ...s,
    id: s.id || `section-${Date.now()}-${i}`,
  }))
}

function extractBusinessInfo(prompt) {
  const info = { name: '', industry: '', style: '' }

  const nameMatch = prompt.match(/(?:called|named|for|my)\s+([A-Z][a-zA-Z0-9\s]+?)(?:\s+(?:website|site|business|company|brand|app)|,|\.|$)/i)
  if (nameMatch) info.name = nameMatch[1].trim()

  const industries = ['tech', 'saas', 'restaurant', 'cafe', 'bakery', 'fitness', 'gym', 'yoga', 'photography',
    'portfolio', 'agency', 'consulting', 'legal', 'law', 'medical', 'health', 'wellness', 'real estate',
    'construction', 'education', 'tutorial', 'blog', 'magazine', 'news', 'ecommerce', 'shop', 'store',
    'music', 'artist', 'designer', 'developer', 'startup', 'nonprofit', 'charity', 'church', 'event',
    'travel', 'hotel', 'spa', 'salon', 'barber', 'wedding', 'fashion', 'food', 'coffee']

  const promptLower = prompt.toLowerCase()
  for (const ind of industries) {
    if (promptLower.includes(ind)) {
      info.industry = ind
      break
    }
  }

  const stylesList = ['modern', 'minimal', 'bold', 'creative', 'elegant', 'professional', 'playful',
    'dark', 'light', 'colorful', 'corporate', 'luxury', 'simple', 'clean']
  for (const style of stylesList) {
    if (promptLower.includes(style)) {
      info.style = style
      break
    }
  }

  return info
}

function determinePageStructure(promptLower) {
  const needs = {
    hero: true,
    features: false,
    services: false,
    testimonials: false,
    pricing: false,
    contact: true,
    cta: false,
    stats: false,
    gallery: false,
    team: false,
    faq: false,
  }

  if (promptLower.includes('service') || promptLower.includes('offer') ||promptLower.includes('what we do')) {
    needs.services = true
  }

  if (promptLower.includes('feature') || promptLower.includes('why') || promptLower.includes('benefit') ||
      promptLower.includes('advantage') || promptLower.includes('capability')) {
    needs.features = true
  }

  if (promptLower.includes('testimonial') || promptLower.includes('review') || promptLower.includes('client') ||
      promptLower.includes('customer say') || promptLower.includes('quote')) {
    needs.testimonials = true
  }

  if (promptLower.includes('pricing') || promptLower.includes('price') || promptLower.includes('plan') ||
      promptLower.includes('subscription') || promptLower.includes('cost') || promptLower.includes('premium')) {
    needs.pricing = true
  }

  if (promptLower.includes('gallery') || promptLower.includes('portfolio') || promptLower.includes('work') ||
      promptLower.includes('project') || promptLower.includes('showcase') || promptLower.includes('photo')) {
    needs.gallery = true
  }

  if (promptLower.includes('team') || promptLower.includes('about us') || promptLower.includes('staff') ||
      promptLower.includes('people') || promptLower.includes('founder') || promptLower.includes('member')) {
    needs.team = true
  }

  if (promptLower.includes('faq') || promptLower.includes('question') || promptLower.includes('help')) {
    needs.faq = true
  }

  if (promptLower.includes('stat') || promptLower.includes('number') || promptLower.includes('counter') ||
      promptLower.includes('metric') || promptLower.includes('achievement') || promptLower.includes('result')) {
    needs.stats = true
  }

  if (promptLower.includes('call') || promptLower.includes('action') || promptLower.includes('sign up') ||
      promptLower.includes('get started') || promptLower.includes('join') || promptLower.includes('newsletter')) {
    needs.cta = true
  }

  const page = []
  page.push('hero')

  if (needs.stats) page.push('stats')
  if (needs.features) page.push('features')
  if (needs.services) page.push('services')
  if (needs.gallery) page.push('gallery')
  if (needs.team) page.push('team')
  if (needs.testimonials) page.push('testimonials')
  if (needs.pricing) page.push('pricing')
  if (needs.faq) page.push('faq')
  if (needs.cta && !needs.pricing) page.push('cta')

  if (page.length <= 1) {
    page.push('features')
    page.push('services')
    if (!needs.pricing) page.push('testimonials')
    if (!needs.cta) page.push('pricing')
  }

  page.push('contact')

  return page
}

function generateSectionData(sectionType, business, promptLower) {
  const name = business.name || 'Your Business'
  const industry = business.industry || 'professional'

  const industryContexts = {
    tech: { headline: 'Build the Future', subheadline: 'Innovative technology solutions for modern businesses', style: 'bold' },
    saas: { headline: 'Scale Your Business', subheadline: 'Enterprise-grade SaaS platform', style: 'corporate' },
    restaurant: { headline: 'Exceptional Dining', subheadline: 'Handcrafted cuisine with fresh ingredients', style: 'elegant' },
    cafe: { headline: 'Your Daily Brew', subheadline: 'Artisanal coffee in a cozy atmosphere', style: 'warm' },
    fitness: { headline: 'Transform Your Body', subheadline: 'Expert training for all fitness levels', style: 'bold' },
    gym: { headline: 'Unlock Your Potential', subheadline: 'State-of-the-art equipment and expert coaches', style: 'bold' },
    photography: { headline: 'Capturing Moments', subheadline: 'Professional photography for every occasion', style: 'creative' },
    portfolio: { headline: 'Creative Works', subheadline: 'Design, develop, deliver exceptional results', style: 'minimal' },
    agency: { headline: 'Ideas That Inspire', subheadline: 'Full-service creative agency', style: 'creative' },
    consulting: { headline: 'Strategic Solutions', subheadline: 'Expert consulting to grow your business', style: 'professional' },
    legal: { headline: 'Trusted Counsel', subheadline: 'Experienced legal representation', style: 'professional' },
    'real estate': { headline: 'Find Your Dream Home', subheadline: 'Premium properties in prime locations', style: 'luxury' },
    education: { headline: 'Learn Without Limits', subheadline: 'Quality education for every student', style: 'clean' },
    blog: { headline: 'Stories That Matter', subheadline: 'Insights, ideas, and inspiration', style: 'minimal' },
    ecommerce: { headline: 'Shop the Best', subheadline: 'Curated products delivered to your door', style: 'modern' },
    music: { headline: 'Feel the Rhythm', subheadline: 'Music that moves your soul', style: 'bold' },
    artist: { headline: 'Art in Motion', subheadline: 'Original artwork that inspires', style: 'creative' },
    startup: { headline: 'Disrupt the Norm', subheadline: 'Building the next big thing', style: 'bold' },
    nonprofit: { headline: 'Make a Difference', subheadline: 'Together we can change the world', style: 'clean' },
    travel: { headline: 'Explore the World', subheadline: 'Curated travel experiences', style: 'modern' },
    food: { headline: 'Flavors That Delight', subheadline: 'Fresh, delicious, made with love', style: 'warm' },
    coffee: { headline: 'Wake Up & Smell the Coffee', subheadline: 'Premium beans, perfect brew', style: 'warm' },
  }

  const ctx = industryContexts[industry] || {}
  const headline = ctx.headline || `Welcome to ${name}`
  const subheadline = ctx.subheadline || `Your trusted ${industry} partner`

  const data = {
    hero: { headline, subheadline },
    features: { title: `Why ${name}` },
    services: { title: 'What We Offer' },
    pricing: { title: 'Our Plans' },
    cta: { headline: `Ready to Work with ${name}?` },
    contact: { title: 'Get In Touch' },
    stats: { title: `${name} by the Numbers` },
    team: { title: `Meet the ${name} Team` },
    gallery: { title: 'Our Work' },
    faq: { title: 'Frequently Asked Questions' },
  }

  return data[sectionType] || {}
}

export async function generateWebsite(prompt, currentHtml = '') {
  const fallbackSections = generateWebsiteFromPrompt(prompt)

  try {
    const backendResult = await api.generate.website({ prompt, currentHtml })
    const data = backendResult.data || backendResult

    if (data && data.html) {
      console.log('✅ Using Gemini backend (HTML generation)')
      return { html: data.html, sections: fallbackSections }
    }

    if (Array.isArray(data) && data.length > 0) {
      console.log('✅ Using Gemini backend (section generation)')
      return {
        html: null,
        sections: data.map((s, i) => ({
          ...s,
          id: s.id || `section-${Date.now()}-${i}`,
        })),
      }
    }
  } catch (e) {
    const msg = e.message || ''
    if (msg.includes('quota') || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('billing')) {
      throw e
    }
    console.warn('⚠️ Gemini backend failed, using client-side:', msg)
  }

  console.log('⚙️ Using client-side generation')
  return { html: null, sections: fallbackSections }
}

export async function generateSection(prompt, existingSections = []) {
  const lower = prompt.toLowerCase()
  const types = Object.keys(SECTION_BLUEPRINTS)

  for (const type of types) {
    if (lower.includes(type)) {
      const business = extractBusinessInfo(prompt)
      const data = generateSectionData(type, business, lower)
      const section = SECTION_BLUEPRINTS[type](data)
      return {
        ...section,
        id: `section-${Date.now()}`,
      }
    }
  }

  const defaultSection = SECTION_BLUEPRINTS.features({
    title: prompt,
    subtitle: 'Custom section based on your request',
  })
  return {
    ...defaultSection,
    id: `section-${Date.now()}`,
  }
}
