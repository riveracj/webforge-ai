import { useState } from 'react'
import { Sparkles, Loader2, Lightbulb, X } from 'lucide-react'
import Button from '../ui/Button'
import { generateWebsite } from '../../utils/aiEngine'
import { useBuilderStore } from '../../store/builderStore'

const SUGGESTIONS = [
  'A modern SaaS landing page for a project management tool',
  'A restaurant website with menu, gallery, and reservation',
  'A professional portfolio for a freelance photographer',
  'A fitness studio site with classes, pricing, and testimonials',
  'A tech startup website with features, team, and contact',
  'An e-commerce storefront for handmade crafts',
  'A consulting firm site with services and case studies',
  'A coffee shop website with menu and location',
]

export default function AIPromptModal({ onClose, onUseSections }) {
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [step, setStep] = useState('prompt')
  const [generatedSections, setGeneratedSections] = useState([])
  const { setSections, setPages } = useBuilderStore()

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setGenerating(true)

    try {
      const sections = await generateWebsite(prompt)
      setGeneratedSections(sections)
      setStep('preview')
    } catch (err) {
      console.error(err)
    }
    setGenerating(false)
  }

  const handleUseSections = () => {
    if (onUseSections) {
      onUseSections(generatedSections)
    } else {
      setSections(generatedSections)
      setPages([{ id: 'page-1', name: 'Home', slug: 'home', sections: generatedSections }])
    }
    onClose()
  }

  const handleRegenerate = () => {
    setStep('prompt')
    setGeneratedSections([])
  }

  const previewTypeCount = generatedSections.reduce((acc, s) => {
    acc[s.componentType] = (acc[s.componentType] || 0) + 1
    return acc
  }, {})

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Generate Website with AI</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {step === 'prompt' && (
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your website
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A modern SaaS landing page for a project management tool called 'TaskFlow' with features, pricing, and a contact section..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleGenerate())}
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Be specific: describe the business type, sections you want, style, and any key details
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Lightbulb size={12} />
                Try these ideas
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(suggestion)}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-colors text-gray-600"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button onClick={handleGenerate} disabled={generating || !prompt.trim()} size="lg">
                {generating ? (
                  <><Loader2 size={16} className="mr-1 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles size={16} className="mr-1" /> Generate Website</>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles size={20} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-medium text-emerald-800 text-sm">Website generated successfully!</h3>
                <p className="text-xs text-emerald-600">
                  {generatedSections.length} sections created
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Generated sections:</p>
              <div className="space-y-2">
                {generatedSections.map((section, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-sm text-gray-700 capitalize">
                      {section.componentType} section
                    </span>
                    {section.props?.headline && (
                      <span className="text-xs text-gray-400 truncate flex-1 text-right">
                        "{section.props.headline}"
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" onClick={handleRegenerate}>
                Try again
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Save for later
              </Button>
              <Button onClick={handleUseSections} size="lg">
                <Sparkles size={16} className="mr-1" />
                Open in Builder
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
