import { api } from '../api/api'

function mockAIResponse(prompt) {
  const sections = []
  const prompt_lower = prompt.toLowerCase()

  if (prompt_lower.includes('hero') || sections.length === 0) {
    sections.push({
      id: `section-${Date.now()}-1`,
      type: 'hero',
      componentType: 'hero',
      props: {
        headline: 'Build Your Online Presence',
        subheadline: 'Create stunning websites with AI in minutes',
        ctaText: 'Get Started Free',
        ctaLink: '#',
        backgroundStyle: 'gradient',
        alignment: 'center',
        styles: { padding: '100px 20px', textAlign: 'center' },
      },
    })
  }

  if (prompt_lower.includes('service') || prompt_lower.includes('feature')) {
    sections.push({
      id: `section-${Date.now()}-2`,
      type: 'services',
      componentType: 'services',
      props: {
        title: 'Our Services',
        subtitle: 'Everything you need to succeed',
        services: [
          { icon: 'Zap', title: 'Lightning Fast', description: 'Optimized for speed and performance' },
          { icon: 'Shield', title: 'Secure', description: 'Enterprise-grade security built in' },
          { icon: 'Smartphone', title: 'Responsive', description: 'Looks great on all devices' },
        ],
        styles: { padding: '80px 20px', background: '#f8fafc' },
      },
    })
  }

  if (prompt_lower.includes('pricing') || prompt_lower.includes('plan')) {
    sections.push({
      id: `section-${Date.now()}-3`,
      type: 'pricing',
      componentType: 'pricing',
      props: {
        title: 'Simple Pricing',
        subtitle: 'Choose the plan that fits your needs',
        plans: [
          { name: 'Free', price: '$0', features: ['1 Website', 'Basic Components', 'Community Support'], cta: 'Get Started' },
          { name: 'Pro', price: '$19', features: ['10 Websites', 'All Components', 'Custom Domain', 'Priority Support'], cta: 'Start Trial', highlighted: true },
          { name: 'Enterprise', price: '$49', features: ['Unlimited', 'Custom Solutions', 'Dedicated Support', 'SLA'], cta: 'Contact Us' },
        ],
        styles: { padding: '80px 20px' },
      },
    })
  }

  if (prompt_lower.includes('contact')) {
    sections.push({
      id: `section-${Date.now()}-4`,
      type: 'contact',
      componentType: 'contact',
      props: {
        title: 'Get In Touch',
        subtitle: "We'd love to hear from you",
        email: 'hello@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main St, City',
        styles: { padding: '80px 20px', background: '#f8fafc' },
      },
    })
  }

  sections.push({
    id: `section-${Date.now()}-footer`,
    type: 'footer',
    componentType: 'footer',
    props: {
      text: '© 2025 WebForge AI. All rights reserved.',
      links: [
        { label: 'Privacy Policy', url: '#' },
        { label: 'Terms of Service', url: '#' },
      ],
      styles: { padding: '40px 20px', background: '#1e293b', color: '#ffffff' },
    },
  })

  return sections
}

export async function generateWebsite(prompt) {
  try {
    const result = await api.generate.website({ prompt })
    return (result.data || []).map((s, i) => ({
      ...s,
      id: s.id || `section-${Date.now()}-${i}`,
    }))
  } catch {
    return mockAIResponse(prompt).map((s, i) => ({
      ...s,
      id: s.id || `section-${Date.now()}-${i}`,
    }))
  }
}

export async function generateSection(prompt, existingSections = []) {
  try {
    const result = await api.generate.section({ prompt, existingSections })
    return result.data || null
  } catch {
    const context = existingSections.map((s) => s.type).join(', ')
    const sections = mockAIResponse(`${context}. ${prompt}`)
    return sections[0] || null
  }
}
