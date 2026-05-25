import { lazy } from 'react'

const HeroSection = lazy(() => import('../sections/HeroSection'))
const ServicesSection = lazy(() => import('../sections/ServicesSection'))
const FeaturesSection = lazy(() => import('../sections/FeaturesSection'))
const TestimonialsSection = lazy(() => import('../sections/TestimonialsSection'))
const PricingSection = lazy(() => import('../sections/PricingSection'))
const ContactSection = lazy(() => import('../sections/ContactSection'))
const FooterSection = lazy(() => import('../sections/FooterSection'))
const GallerySection = lazy(() => import('../sections/GallerySection'))
const TeamSection = lazy(() => import('../sections/TeamSection'))
const FaqSection = lazy(() => import('../sections/FaqSection'))
const StatsSection = lazy(() => import('../sections/StatsSection'))
const CtaSection = lazy(() => import('../sections/CtaSection'))

export const ComponentRegistry = {
  hero: HeroSection,
  services: ServicesSection,
  features: FeaturesSection,
  testimonials: TestimonialsSection,
  pricing: PricingSection,
  contact: ContactSection,
  footer: FooterSection,
  gallery: GallerySection,
  team: TeamSection,
  faq: FaqSection,
  stats: StatsSection,
  cta: CtaSection,
}

export function getComponent(type) {
  return ComponentRegistry[type] || null
}
