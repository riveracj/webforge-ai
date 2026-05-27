import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useProjectStore } from '../store/projectStore'
import { generateWebsite } from '../utils/aiEngine'
import { MODELS } from '../utils/constants'
import { ArrowLeft, Sparkles, Loader2, AlertTriangle, Coins } from 'lucide-react'
import ModelSelector from '../components/generation/ModelSelector'
import BuyCreditsModal from '../components/billing/BuyCreditsModal'

export default function PreviewPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { canGenerateAi, canAffordGeneration, getCreditBalance, deductCredits } = useAuthStore()
  const { currentProject, loading, getProject, updateProject } = useProjectStore()
  const [html, setHtml] = useState('')
  const [followUpPrompt, setFollowUpPrompt] = useState('')
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState('')
  const [selectedModel, setSelectedModel] = useState(searchParams.get('model') || 'gemini-2.5-flash-lite')
  const [showBuyModal, setShowBuyModal] = useState(false)
  const iframeRef = useRef(null)
  const blobUrlRef = useRef(null)
  const regeneratingRef = useRef(false)

  useEffect(() => {
    if (projectId) {
      getProject(projectId).then((project) => {
        if (project?.generatedHtml) setHtml(project.generatedHtml)
      })
    }
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    }
  }, [projectId])

  useEffect(() => {
    if (currentProject?.generatedHtml && !html) setHtml(currentProject.generatedHtml)
  }, [currentProject])

  useEffect(() => {
    if (html && iframeRef.current) {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
      iframeRef.current.src = blobUrlRef.current
    }
  }, [html])

  const handleRegenerate = async () => {
    if (!followUpPrompt.trim() || regeneratingRef.current) return
    if (!canGenerateAi()) { setError('AI generations used up.'); return }

    const modelConfig = MODELS.find(m => m.id === selectedModel) || MODELS[0]
    if (!canAffordGeneration(modelConfig.credits)) {
      setError(`Insufficient credits. This model costs ${modelConfig.credits} credit(s).`)
      return
    }

    regeneratingRef.current = true
    setRegenerating(true)
    setError('')
    try {
      const result = await generateWebsite(followUpPrompt, html, selectedModel)
      if (result?.html) {
        await deductCredits(modelConfig.credits)
        setHtml(result.html)
        if (projectId) await updateProject(projectId, { generatedHtml: result.html })
      }
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('Insufficient credits')) {
        setError(msg)
      } else if (msg.includes('429') || msg.includes('quota')) {
        setError(msg.includes('prepayment') || msg.includes('prepay') ? 'Gemini prepay credits depleted. Add funds at https://ai.studio/projects' : 'Gemini quota exceeded. Try again in a minute.')
      } else {
        setError(msg || 'Regeneration failed.')
      }
    }
    setRegenerating(false)
    regeneratingRef.current = false
    setFollowUpPrompt('')
  }

  const balance = getCreditBalance()
  const selectedModelConfig = MODELS.find(m => m.id === selectedModel) || MODELS[0]

  if (loading && !html) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={28} className="text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (!loading && !html) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
        <p className="text-gray-500 text-sm">No generated content found</p>
        <button onClick={() => navigate('/generate')} className="text-indigo-600 text-sm font-medium hover:underline">Generate a website</button>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-white relative flex flex-col">
      <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{currentProject?.name || 'Website'}</span>
        </div>
        <div className="flex items-center gap-3">
          {regenerating ? (
            <div className="flex items-center gap-2 text-sm text-indigo-600">
              <Loader2 size={14} className="animate-spin" />
              Regenerating...
            </div>
          ) : (
            <button onClick={() => setShowBuyModal(true)} className="flex items-center gap-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-medium text-indigo-700 transition-all">
              <Coins size={12} />
              {balance.total}
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 relative">
        <iframe ref={iframeRef} className="w-full h-full border-0" title="Website Preview" sandbox="allow-scripts allow-same-origin" />

        {regenerating && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center max-w-sm">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                <Loader2 size={32} className="text-indigo-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Updating your site</h3>
              <p className="text-sm text-gray-500">Applying your changes with AI</p>
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/90 to-transparent pt-12">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <ModelSelector selected={selectedModel} onSelect={setSelectedModel} disabled={regenerating} />
              <span className="text-xs text-gray-400">
                {selectedModelConfig.credits} credit{selectedModelConfig.credits > 1 ? 's' : ''} per update
              </span>
            </div>
            <div className="flex items-center gap-2">
              <textarea
                value={followUpPrompt}
                onChange={(e) => setFollowUpPrompt(e.target.value)}
                placeholder="Follow-up: change colors, add a section, redesign..."
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none shadow-sm"
                rows={1}
                onKeyDown={(e) => e.key === 'Enter' && (e.metaKey || e.ctrlKey) && handleRegenerate()}
              />
              <button
                onClick={handleRegenerate}
                disabled={regenerating || !followUpPrompt.trim()}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50"
              >
                {regenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Update
              </button>
            </div>
          </div>
          {error && (
            <div className="max-w-2xl mx-auto mt-2 flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle size={12} className="text-red-500 flex-shrink-0" />
              <span className="text-xs text-red-700">{error}</span>
              <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700 text-xs font-medium">Dismiss</button>
            </div>
          )}
        </div>
      </div>
      <BuyCreditsModal isOpen={showBuyModal} onClose={() => setShowBuyModal(false)} />
    </div>
  )
}
