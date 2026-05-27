import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Sparkles, Code, Eye, Loader2, CheckCircle, Globe, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useProjectStore } from '../store/projectStore'
import { generateWebsite } from '../utils/aiEngine'
import Button from '../components/ui/Button'

const STEPS = [
  { label: 'Analyzing your request', icon: '🔍' },
  { label: 'Designing the layout', icon: '🎨' },
  { label: 'Generating content', icon: '⚡' },
  { label: 'Polishing the result', icon: '✨' },
]

const QUICK_PROMPTS = [
  { label: 'SaaS Landing Page', prompt: 'A modern SaaS landing page with hero, features, pricing, testimonials, and contact sections. Clean, professional design with blue/indigo color scheme.' },
  { label: 'Restaurant Site', prompt: 'A beautiful restaurant website with menu showcase, gallery of dishes, reservation form, location map, and customer reviews. Warm, appetizing color scheme.' },
  { label: 'Portfolio', prompt: 'A creative portfolio for a designer/developer with project showcase, skills, experience timeline, and contact form. Minimal, elegant design.' },
  { label: 'Startup', prompt: 'A tech startup website with hero section, team members, features grid, stats counter, investor info, and contact. Bold, modern design.' },
  { label: 'E-commerce', prompt: 'An e-commerce storefront with product grid, categories, featured items, shopping cart, and newsletter signup. Clean, conversion-focused design.' },
  { label: 'Blog', prompt: 'A modern blog/ magazine website with featured articles, categories, recent posts sidebar, author bio, and newsletter subscription. Clean, readable typography.' },
]

export default function GeneratePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, profile, canGenerateAi, incrementAiGenerations } = useAuthStore()
  const { createProject } = useProjectStore()
  const [prompt, setPrompt] = useState(searchParams.get('prompt') || '')
  const [generating, setGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [generatedHtml, setGeneratedHtml] = useState('')
  const [projectId, setProjectId] = useState(null)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(true)
  const iframeRef = useRef(null)
  const blobUrlRef = useRef(null)
  const generatingRef = useRef(false)

  useEffect(() => {
    if (searchParams.get('prompt') && !generating && !generatingRef.current) {
      handleGenerate()
    }
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    }
  }, [])

  useEffect(() => {
    if (generatedHtml && iframeRef.current) {
      const newUrl = URL.createObjectURL(new Blob([generatedHtml], { type: 'text/html' }))
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = newUrl
      iframeRef.current.src = newUrl
    }
  }, [generatedHtml])

  const handleGenerate = async () => {
    if (!prompt.trim() || generatingRef.current) return
    if (!canGenerateAi()) {
      setError('You have used all your AI generations. Upgrade to Pro for more.')
      return
    }
    generatingRef.current = true
    setGenerating(true)
    setError('')
    setGeneratedHtml('')
    setProjectId(null)
    setCurrentStep(0)

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
    }, 2000)

    try {
      const result = await generateWebsite(prompt)
      const html = result?.html || ''

      clearInterval(stepInterval)
      setCurrentStep(STEPS.length - 1)

      if (!html) {
        setError('AI generation did not return valid HTML. Try a more detailed prompt.')
        setGenerating(false)
        generatingRef.current = false
        return
      }

      setGeneratedHtml(html)

      const project = await createProject(user.uid, {
        name: prompt.split('.')[0].slice(0, 50) || 'AI Generated Site',
        generatedHtml: html,
        prompt,
      })

      await incrementAiGenerations()
      setProjectId(project.id)
    } catch (err) {
      clearInterval(stepInterval)
      setError(err.message || 'Generation failed. Please try again.')
    }
    setGenerating(false)
    generatingRef.current = false
  }

  const handleQuickGenerate = (itemPrompt) => {
    navigate(`/generate?prompt=${encodeURIComponent(itemPrompt)}`)
  }

  if (searchParams.get('prompt') && !generating && !generatedHtml && !error && !generatingRef.current) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Generating your website...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white text-sm transition-colors">
            &larr; Back
          </button>
          <h1 className="text-lg font-semibold text-white">WebForge AI Generator</h1>
          <div className="w-16" />
        </div>

        {!generating && !generatedHtml && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6">
                <Sparkles size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">What do you want to build?</h2>
              <p className="text-gray-400 text-lg">Describe your website and AI will generate it in seconds</p>
            </div>

            {profile?.usage && (
              <div className="text-center mb-4 text-xs text-gray-500">
                {profile.usage.aiGenerationsUsed || 0} / {profile?.usage?.plan === 'free' ? 5 : 100} generations used
              </div>
            )}

            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A modern SaaS landing page for a project management tool with pricing, features, and a contact form..."
                className="w-full h-36 bg-gray-900 border border-gray-700 rounded-xl p-5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none text-base"
                onKeyDown={(e) => e.key === 'Enter' && (e.metaKey || e.ctrlKey) && handleGenerate()}
                maxLength={2000}
              />
              <div className="absolute bottom-4 right-4 text-xs text-gray-500">
                {prompt.length}/2000 &middot; Ctrl+Enter to generate
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || generating}
              className="w-full mt-4 py-3 text-base"
            >
              <Sparkles size={18} className="mr-2" />
              Generate Website
            </Button>

            <div className="mt-10">
              <p className="text-sm text-gray-500 mb-4 text-center">Quick start ideas</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {QUICK_PROMPTS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleQuickGenerate(item.prompt)}
                    className="p-3 bg-gray-900 border border-gray-800 rounded-xl hover:border-indigo-500/50 hover:bg-gray-800/50 transition-all text-left"
                  >
                    <span className="text-sm font-medium text-gray-300 block">{item.label}</span>
                    <span className="text-xs text-gray-500 mt-1 block line-clamp-2">{item.prompt.slice(0, 80)}...</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {generating && (
          <div className="max-w-xl mx-auto pt-16">
            <div className="text-center mb-12">
              <div className="relative inline-flex mb-6">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
                <Loader2 size={48} className="relative text-indigo-400 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Building your website</h2>
              <p className="text-gray-400">This usually takes 10-15 seconds</p>
            </div>

            <div className="space-y-4">
              {STEPS.map((step, i) => (
                <div key={step.label} className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${
                    i < currentStep
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : i === currentStep
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse'
                      : 'bg-gray-800 text-gray-600 border border-gray-700'
                  }`}>
                    {i < currentStep ? <CheckCircle size={16} /> : i === currentStep ? <Loader2 size={14} className="animate-spin" /> : i + 1}
                  </div>
                  <span className={`text-sm font-medium ${
                    i <= currentStep ? 'text-gray-200' : 'text-gray-600'
                  }`}>{step.icon} {step.label}</span>
                  {i <= currentStep && (
                    <div className="ml-auto h-1 flex-1 max-w-[100px] bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${
                        i < currentStep ? 'w-full bg-green-500' : 'w-2/3 bg-indigo-500 animate-pulse'
                      }`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!generating && generatedHtml && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Your website is ready!</h2>
                <p className="text-sm text-gray-400 mt-1">Review the result below</p>
              </div>
              <div className="flex bg-gray-900 rounded-lg border border-gray-700 p-0.5">
                <button
                  onClick={() => setShowPreview(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    showPreview ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Eye size={14} /> Preview
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    !showPreview ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Code size={14} /> Code
                </button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              {showPreview ? (
                <div className="relative bg-white" style={{ height: '70vh' }}>
                  <iframe ref={iframeRef} className="w-full h-full border-0" title="Preview" sandbox="allow-scripts allow-same-origin" />
                </div>
              ) : (
                <div className="p-4">
                  <textarea
                    value={generatedHtml}
                    onChange={(e) => setGeneratedHtml(e.target.value)}
                    className="w-full h-[60vh] bg-gray-950 text-gray-100 font-mono text-sm p-4 rounded-lg border border-gray-800 focus:outline-none focus:border-indigo-500 resize-none"
                    spellCheck={false}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 mt-6">
              <Button onClick={() => projectId && navigate(`/site/${projectId}`)} disabled={!projectId}>
                <Code size={16} className="mr-2" />
                Open in Editor
              </Button>
              <Button variant="secondary" onClick={() => projectId && window.open(`/preview/${projectId}`, '_blank')} disabled={!projectId}>
                <Globe size={16} className="mr-2" />
                Live Preview
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-xl mx-auto mt-8 p-4 bg-red-900/30 border border-red-800/50 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <button onClick={() => { setError(''); setGenerating(false); generatingRef.current = false }} className="mt-3 text-xs text-red-400 hover:text-red-300 underline">
              Try again
            </button>
          </div>
        )}

        {!generating && !generatedHtml && !error && (
          <div className="mt-16 text-center">
            <p className="text-xs text-gray-600">
              Powered by Gemini 2.0 Flash &middot; Generated pages are fully customizable
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
