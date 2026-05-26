import { useState } from 'react'
import { useBuilderStore } from '../../store/builderStore'
import { useAuthStore } from '../../store/authStore'
import { SECTION_TYPES, PLANS } from '../../utils/constants'
import { generateSection, generateWebsite } from '../../utils/aiEngine'
import {
  Layout,
  Sparkles,
  ChevronDown,
  GripVertical,
  Search,
  Plus,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import UpgradePrompt from '../billing/UpgradePrompt'

const SECTION_ICONS = {
  Layout, Sparkles, ChevronDown, GripVertical, Search, Plus,
}

export default function Sidebar() {
  const { sections, addSection, setSections, setPages } = useBuilderStore()
  const { profile, canGenerateAi, incrementAiGenerations, getPlan } = useAuthStore()
  const [activeTab, setActiveTab] = useState('add')
  const [aiPrompt, setAiPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [regeneratingAll, setRegeneratingAll] = useState(false)
  const [regeneratePrompt, setRegeneratePrompt] = useState('')

  const plan = getPlan()
  const planLimit = PLANS[plan]?.aiGenerations || 0
  const usage = profile?.usage?.aiGenerationsUsed || 0

  const filteredSections = SECTION_TYPES.filter((s) =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddSection = (type) => {
    const newSection = {
      id: `section-${Date.now()}`,
      type,
      componentType: type,
      props: getDefaultProps(type),
      styles: { padding: '60px 20px' },
    }
    addSection(newSection)
  }

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return

    if (!canGenerateAi()) {
      setShowUpgrade(true)
      return
    }

    setGenerating(true)
    try {
      const result = await generateSection(aiPrompt, sections)
      if (result) {
        addSection(result)
        setAiPrompt('')
        await incrementAiGenerations()
      }
    } catch (err) {
      console.error(err)
    }
    setGenerating(false)
  }

  const handleRegenerateAll = async () => {
    if (!regeneratePrompt.trim()) return
    if (!canGenerateAi()) { setShowUpgrade(true); return }

    setRegeneratingAll(true)
    try {
      const newSections = await generateWebsite(regeneratePrompt)
      setSections(newSections)
      setPages([{ id: 'page-1', name: 'Home', slug: 'home', sections: newSections }])
      await incrementAiGenerations()
      setRegeneratePrompt('')
    } catch (err) {
      console.error(err)
    }
    setRegeneratingAll(false)
  }

  return (
    <div className="p-4">
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4">
        <button
          onClick={() => setActiveTab('add')}
          className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'add' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'
          }`}
        >
          Add
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'pages' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'
          }`}
        >
          Pages
        </button>
      </div>

      {activeTab === 'add' && (
        <div className="space-y-4">
          <div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Components
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {filteredSections.map((section) => (
                <button
                  key={section.type}
                  onClick={() => handleAddSection(section.type)}
                  className="flex flex-col items-center gap-1.5 p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-grab active:cursor-grabbing"
                >
                  <Layout size={18} className="text-indigo-500" />
                  <span className="text-xs font-medium text-gray-600">{section.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles size={12} />
                Add Section with AI
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Usage: {usage}/{planLimit}</span>
                  <span className="capitalize">{plan} plan</span>
                </div>
                {usage >= planLimit ? (
                  <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                    <AlertTriangle size={14} className="flex-shrink-0" />
                    <span>AI limit reached. <button onClick={() => setShowUpgrade(true)} className="underline font-medium">Upgrade</button></span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="Describe a section..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
                    />
                    <Button size="sm" className="w-full" onClick={handleAIGenerate} disabled={generating}>
                      {generating ? 'Generating...' : 'Generate Section'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <RefreshCw size={12} />
                Regenerate All
              </h3>
              <p className="text-xs text-gray-400 mb-2">
                Describe how you want your entire page to look
              </p>
              <div className="space-y-2">
                {usage >= planLimit ? (
                  <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                    <AlertTriangle size={14} className="flex-shrink-0" />
                    <span>AI limit reached. <button onClick={() => setShowUpgrade(true)} className="underline font-medium">Upgrade</button></span>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={regeneratePrompt}
                      onChange={(e) => setRegeneratePrompt(e.target.value)}
                      placeholder="e.g., A modern dark-themed SaaS page with hero, features, testimonials and pricing..."
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={handleRegenerateAll}
                      disabled={regeneratingAll || !regeneratePrompt.trim()}
                    >
                      {regeneratingAll ? (
                        <><Loader2 size={14} className="mr-1 animate-spin" /> Regenerating...</>
                      ) : (
                        <><RefreshCw size={14} className="mr-1" /> Regenerate All Sections</>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {showUpgrade && <UpgradePrompt onClose={() => setShowUpgrade(false)} />}
        </div>
      )}

      {activeTab === 'pages' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pages</h3>
            <button className="p-1 rounded hover:bg-gray-100">
              <Plus size={14} />
            </button>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <p className="text-sm font-medium text-indigo-700">Home</p>
            <p className="text-xs text-indigo-500">{sections.length} sections</p>
          </div>
        </div>
      )}
    </div>
  )
}

function getDefaultProps(type) {
  const defaults = {
    hero: {
      headline: 'Your Headline Here',
      subheadline: 'Your subheading text goes here',
      ctaText: 'Get Started',
      ctaLink: '#',
      backgroundStyle: 'gradient',
      alignment: 'center',
    },
    services: {
      title: 'Our Services',
      subtitle: 'What we offer',
      services: [
        { icon: 'Zap', title: 'Service 1', description: 'Description here' },
        { icon: 'Shield', title: 'Service 2', description: 'Description here' },
        { icon: 'Star', title: 'Service 3', description: 'Description here' },
      ],
    },
    features: {
      title: 'Features',
      subtitle: 'Why choose us',
      features: [
        { title: 'Feature 1', description: 'Description here', icon: 'Check' },
        { title: 'Feature 2', description: 'Description here', icon: 'Check' },
        { title: 'Feature 3', description: 'Description here', icon: 'Check' },
      ],
    },
    testimonials: {
      title: 'What Our Clients Say',
      testimonials: [
        { name: 'John Doe', role: 'CEO', content: 'Amazing service!', avatar: null },
        { name: 'Jane Smith', role: 'Designer', content: 'Great experience!', avatar: null },
      ],
    },
    pricing: {
      title: 'Pricing Plans',
      subtitle: 'Choose the right plan',
      plans: [
        { name: 'Basic', price: '$9', features: ['Feature 1', 'Feature 2'], cta: 'Get Started' },
        { name: 'Pro', price: '$29', features: ['All Basic features', 'Feature 3'], cta: 'Start Trial', highlighted: true },
        { name: 'Enterprise', price: '$99', features: ['All Pro features', 'Custom'], cta: 'Contact' },
      ],
    },
    contact: {
      title: 'Get In Touch',
      subtitle: "We'd love to hear from you",
      email: 'hello@example.com',
      phone: '+1 234 567 890',
      address: '123 Main St',
    },
    footer: {
      text: '© 2025 WebForge AI. All rights reserved.',
      links: [
        { label: 'Privacy', url: '#' },
        { label: 'Terms', url: '#' },
      ],
    },
    gallery: {
      title: 'Our Gallery',
      images: [
        { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600', alt: 'Image 1' },
        { src: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600', alt: 'Image 2' },
        { src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600', alt: 'Image 3' },
      ],
    },
    team: {
      title: 'Our Team',
      members: [
        { name: 'Alice', role: 'CEO', bio: 'Visionary leader', avatar: null },
        { name: 'Bob', role: 'CTO', bio: 'Tech genius', avatar: null },
        { name: 'Carol', role: 'Designer', bio: 'Creative mind', avatar: null },
      ],
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        { question: 'How does it work?', answer: 'It\'s simple and easy to use.' },
        { question: 'Is it free?', answer: 'We have a free tier available.' },
      ],
    },
    stats: {
      title: 'Our Impact',
      stats: [
        { value: '10K+', label: 'Users' },
        { value: '99.9%', label: 'Uptime' },
        { value: '150+', label: 'Countries' },
      ],
    },
    cta: {
      headline: 'Ready to Get Started?',
      subheadline: 'Join thousands of satisfied customers',
      buttonText: 'Get Started Free',
      buttonLink: '#',
    },
  }
  return defaults[type] || {}
}
