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
    aiGenerations: 5,
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
