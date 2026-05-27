import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useProjectStore } from '../store/projectStore'
import { generateWebsite } from '../utils/aiEngine'
import { ArrowLeft, Sparkles, Loader2, AlertTriangle } from 'lucide-react'

export default function PreviewPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { canGenerateAi, incrementAiGenerations } = useAuthStore()
  const { currentProject, loading, getProject, updateProject } = useProjectStore()
  const [html, setHtml] = useState('')
  const [followUpPrompt, setFollowUpPrompt] = useState('')
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)
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
    if (currentProject?.generatedHtml && !html) {
      setHtml(currentProject.generatedHtml)
    }
  }, [currentProject])

  useEffect(() => {
    if (html && iframeRef.current) {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
      const newUrl = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
      blobUrlRef.current = newUrl
      iframeRef.current.src = newUrl
    }
  }, [html])

  const handleRegenerate = async () => {
    if (!followUpPrompt.trim() || regeneratingRef.current) return
    if (!canGenerateAi()) {
      setError('AI generations used up. Upgrade to Pro for more.')
      return
    }
    regeneratingRef.current = true
    setRegenerating(true)
    setError('')
    try {
      const result = await generateWebsite(followUpPrompt, html)
      if (result?.html) {
        setHtml(result.html)
        await incrementAiGenerations()
        if (projectId) await updateProject(projectId, { generatedHtml: result.html })
      }
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('429') || msg.includes('quota')) {
        setError('Gemini quota exceeded. Try again in a minute.')
      } else {
        setError(msg || 'Regeneration failed.')
      }
    }
    setRegenerating(false)
    regeneratingRef.current = false
    setFollowUpPrompt('')
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowPrompt(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (loading && !html) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={28} className="text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (!loading && !html) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-gray-500 text-sm">No generated content found</p>
        <button onClick={() => navigate('/generate')} className="text-indigo-600 text-sm font-medium hover:underline">
          Generate a website
        </button>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2 bg-gradient-to-b from-black/40 to-transparent">
        <button onClick={() => navigate('/dashboard')} className="text-white/80 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <span className="text-xs text-white/60">{currentProject?.name || 'Website'}</span>
        <div className="w-5" />
      </div>

      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        title="Website Preview"
        sandbox="allow-scripts allow-same-origin"
      />

      {showPrompt && (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/60 via-black/30 to-transparent pt-12">
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <textarea
              value={followUpPrompt}
              onChange={(e) => setFollowUpPrompt(e.target.value)}
              placeholder="Follow-up prompt: change colors, add section, redesign..."
              className="flex-1 bg-white/95 backdrop-blur border-0 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none shadow-lg"
              rows={1}
              onKeyDown={(e) => e.key === 'Enter' && (e.metaKey || e.ctrlKey) && handleRegenerate()}
            />
            <button
              onClick={handleRegenerate}
              disabled={regenerating || !followUpPrompt.trim()}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-all shadow-lg disabled:opacity-50"
            >
              {regenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            </button>
          </div>
          {error && (
            <div className="max-w-2xl mx-auto mt-2 flex items-center gap-1.5 px-3 py-2 bg-red-500/20 backdrop-blur rounded-lg">
              <AlertTriangle size={12} className="text-red-300 flex-shrink-0" />
              <span className="text-xs text-red-200">{error}</span>
              <button onClick={() => setError('')} className="ml-auto text-red-300 hover:text-red-100 text-xs">Dismiss</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
