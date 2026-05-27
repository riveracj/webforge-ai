export const SECTION_TYPES = [
  { type: 'hero', label: 'Hero', icon: 'Layout' },
  { type: 'services', label: 'Services', icon: 'Briefcase' },
  { type: 'features', label: 'Features', icon: 'Grid3X3' },
  { type: 'testimonials', label: 'Testimonials', icon: 'MessageSquareQuote' },
  { type: 'pricing', label: 'Pricing', icon: 'DollarSign' },
  { type: 'contact', label: 'Contact', icon: 'Mail' },
  { type: 'footer', label: 'Footer', icon: 'Copyright' },
  { type: 'gallery', label: 'Gallery', icon: 'Image' },
  { type: 'team', label: 'Team', icon: 'Users' },
  { type: 'faq', label: 'FAQ', icon: 'HelpCircle' },
  { type: 'stats', label: 'Stats', icon: 'BarChart3' },
  { type: 'cta', label: 'Call to Action', icon: 'Target' },
]

export const PREVIEW_MODES = [
  { id: 'desktop', label: 'Desktop', icon: 'Monitor' },
  { id: 'tablet', label: 'Tablet', icon: 'Tablet' },
  { id: 'mobile', label: 'Mobile', icon: 'Smartphone' },
]

export const EMPTY_SECTION = {
  id: '',
  type: '',
  componentType: '',
  props: {},
  styles: {},
  children: [],
}

export const defaultProjectStructure = {
  name: 'Untitled Project',
  generatedHtml: '',
  prompt: '',
}

export const PLANS = {
  free: {
    name: 'Free',
    projects: 3,
    pages: 1,
    aiGenerations: 100,
    customDomain: false,
    exportHtml: false,
    price: 0,
  },
  pro: {
    name: 'Pro',
    projects: 20,
    pages: 10,
    aiGenerations: 100,
    customDomain: true,
    exportHtml: true,
    price: 19,
  },
  business: {
    name: 'Business',
    projects: 100,
    pages: 50,
    aiGenerations: 500,
    customDomain: true,
    exportHtml: true,
    price: 49,
  },
}

export const MODELS = [
  { id: 'gemini-2.5-flash-lite', label: 'Fast (Gemini Lite)', credits: 1, provider: 'Google' },
  { id: 'gemini-2.5-flash',      label: 'Balanced (Gemini Flash)', credits: 2, provider: 'Google' },
  { id: 'gemini-2.0-pro',        label: 'Premium (Gemini Pro)', credits: 5, provider: 'Google' },
]

export const CREDIT_PACKS = [
  { id: 'starter', credits: 50,  price: 5,  label: 'Starter Pack', description: 'Try out AI generation', stripePriceId: import.meta.env.VITE_STRIPE_CREDIT_STARTER_PRICE_ID || '' },
  { id: 'popular', credits: 200, price: 15, label: 'Popular Pack', description: 'Best value for regular use', stripePriceId: import.meta.env.VITE_STRIPE_CREDIT_POPULAR_PRICE_ID || '' },
  { id: 'pro',     credits: 500, price: 30, label: 'Pro Pack',     description: 'For power users', stripePriceId: import.meta.env.VITE_STRIPE_CREDIT_PRO_PRICE_ID || '' },
]

export const SIGNUP_CREDIT_GRANTS = {
  free: 10,
  pro: 100,
  business: 500,
}

export const DEFAULT_USAGE = {
  projectCount: 0,
  aiGenerationsUsed: 0,
  plan: 'free',
  freeCreditsTotal: 10,
  freeCreditsUsed: 0,
  purchasedCredits: 0,
}
