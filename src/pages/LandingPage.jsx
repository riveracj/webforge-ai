import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Sparkles, Layout, Globe, Zap, Shield, Smartphone, Check, ArrowRight, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { PLANS } from '../utils/constants'

const FEATURES = [
  { icon: Sparkles, title: 'AI Website Generator', description: 'Describe your website and our AI builds it in seconds' },
  { icon: Layout, title: 'Drag & Drop Builder', description: 'Visual editor with real-time preview and undo/redo' },
  { icon: Globe, title: 'Publish to Domain', description: 'Deploy to Firebase Hosting or your custom domain' },
  { icon: Zap, title: 'Lightning Fast', description: 'Optimized for performance with automatic code-splitting' },
  { icon: Shield, title: 'Enterprise Security', description: 'Secure authentication and multi-tenant data isolation' },
  { icon: Smartphone, title: 'Fully Responsive', description: 'Preview and optimize for desktop, tablet, and mobile' },
]

const HOW_IT_WORKS = [
  { step: '1', title: 'Describe', description: 'Tell our AI what kind of website you need' },
  { step: '2', title: 'Generate', description: 'AI creates a complete website with sections and content' },
  { step: '3', title: 'Customize', description: 'Drag & drop to edit, add sections, change styles' },
  { step: '4', title: 'Publish', description: 'Deploy to the web with one click' },
]

export default function LandingPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [mobileMenu, setMobileMenu] = useState(false)

  if (user) {
    navigate('/dashboard', { replace: true })
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={24} />
            <span className="text-xl font-bold text-indigo-600">WebForge AI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">Pricing</a>
            <Link to="/login" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">Sign In</Link>
            <Link to="/register" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">Get Started Free</Link>
          </nav>

          <button className="md:hidden p-2" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3">
            <a href="#features" className="block text-sm text-gray-600 py-2" onClick={() => setMobileMenu(false)}>Features</a>
            <a href="#pricing" className="block text-sm text-gray-600 py-2" onClick={() => setMobileMenu(false)}>Pricing</a>
            <Link to="/login" className="block text-sm text-gray-600 py-2" onClick={() => setMobileMenu(false)}>Sign In</Link>
            <Link to="/register" className="block text-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg" onClick={() => setMobileMenu(false)}>Get Started Free</Link>
          </div>
        )}
      </header>

      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full text-sm font-medium text-indigo-700 mb-8">
            <Sparkles size={16} />
            AI-Powered Website Builder
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
            Build Stunning Websites<br />
            <span className="text-indigo-600">with AI in Minutes</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Describe your vision and let AI generate a complete website. Customize with drag & drop, then publish to your domain — no coding required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
              Get Started Free
            </Link>
            <a href="#how-it-works" className="px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-colors">
              How It Works
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Build, customize, and launch professional websites with powerful tools</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-gray-50 hover:bg-indigo-50 transition-colors group">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                  <feature.icon className="text-indigo-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Four simple steps to your live website</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple Pricing</h2>
            <p className="text-lg text-gray-600">Start free, upgrade when you need more</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {Object.entries(PLANS).map(([key, plan]) => (
              <div
                key={key}
                className={`rounded-2xl p-8 ${
                  key === 'pro'
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 scale-105'
                    : 'bg-gray-50 text-gray-900'
                }`}
              >
                <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                <p className={`text-sm mb-6 ${key === 'pro' ? 'text-indigo-200' : 'text-gray-500'}`}>
                  {key === 'free' ? 'For getting started' : key === 'pro' ? 'For professionals' : 'For teams'}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className={key === 'pro' ? 'text-indigo-200' : 'text-gray-400'}>/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm">
                    <Check size={16} className={key === 'pro' ? 'text-indigo-200' : 'text-emerald-500'} />
                    {plan.projects} Projects
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check size={16} className={key === 'pro' ? 'text-indigo-200' : 'text-emerald-500'} />
                    {plan.aiGenerations} AI Generations/mo
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check size={16} className={key === 'pro' ? 'text-indigo-200' : 'text-emerald-500'} />
                    {plan.pages} Pages/site
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    {plan.customDomain ? (
                      <Check size={16} className={key === 'pro' ? 'text-indigo-200' : 'text-emerald-500'} />
                    ) : (
                      <X size={16} className="text-gray-300" />
                    )}
                    Custom Domain
                  </li>
                </ul>
                <Link
                  to="/register"
                  className={`block text-center py-3 rounded-lg font-semibold transition-colors ${
                    key === 'pro'
                      ? 'bg-white text-indigo-600 hover:bg-gray-100'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {key === 'free' ? 'Get Started Free' : key === 'pro' ? 'Start Free Trial' : 'Contact Us'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Build Your Website?</h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands creating stunning websites with AI. No coding, no hassle.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg text-lg"
          >
            Get Started Free
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-400" size={20} />
            <span className="text-white font-bold">WebForge AI</span>
          </div>
          <p className="text-sm">&copy; 2026 WebForge AI. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
