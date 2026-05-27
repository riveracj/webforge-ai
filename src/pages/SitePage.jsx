import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Code, Eye, Save, Globe, ArrowLeft, Loader2, Sparkles, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useProjectStore } from '../store/projectStore'
import { generateWebsite } from '../utils/aiEngine'
import Button from '../components/ui/Button'

export default function SitePage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { canGenerateAi, incrementAiGenerations } = useAuthStore()
  const { currentProject, loading, getProject, updateProject } = useProjectStore()
  const [html, setHtml] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [showRegenPrompt, setShowRegenPrompt] = useState(false)
  const [regenPrompt, setRegenPrompt] = useState('')
  const [error, setError] = useState('')
  const iframeRef = useRef(null)
  const blobUrlRef = useRef(null)
  const regeneratingRef = useRef(false)

  useEffect(() => {
    if (projectId) getProject(projectId)
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    }
  }, [projectId])

  useEffect(() => {
    if (currentProject?.generatedHtml) {
      setHtml(currentProject.generatedHtml)
    }
  }, [currentProject])

  useEffect(() => {
    if (html && iframeRef.current) {
      const newUrl = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = newUrl
      iframeRef.current.src = newUrl
    }
  }, [html])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProject(projectId, { generatedHtml: html })
    } catch (err) {
      console.error('Save failed:', err)
    }
    setSaving(false)
  }

  const handleRegenerate = async () => {
    if (!regenPrompt.trim() || regeneratingRef.current) return
    if (!canGenerateAi()) {
      setError('You have used all your AI generations. Upgrade to Pro for more.')
      return
    }
    regeneratingRef.current = true
    setRegenerating(true)
    setError('')
    try {
      const result = await generateWebsite(regenPrompt, html)
      if (result?.html) {
        setHtml(result.html)
        await incrementAiGenerations()
        await updateProject(projectId, { generatedHtml: result.html, prompt: regenPrompt })
      }
    } catch (err) {
      setError(err.message || 'Regeneration failed.')
    }
    setRegenerating(false)
    regeneratingRef.current = false
    setShowRegenPrompt(false)
    setRegenPrompt('')
  }

  const refreshPreview = () => {
    if (blobUrlRef.current && iframeRef.current && html) {
      const newUrl = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = newUrl
      iframeRef.current.src = newUrl
    }
  }

  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      handleSave()
    }
  }, [html, projectId])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 size={32} className="text-indigo-400 animate-spin" />
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Project not found</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-white">{currentProject.name}</h1>
            <p className="text-xs text-gray-500">Generated with AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-800 rounded-lg border border-gray-700 p-0.5">
            <button
              onClick={() => { setShowCode(false); refreshPreview() }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                !showCode ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Eye size={14} /> Preview
            </button>
            <button
              onClick={() => setShowCode(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                showCode ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Code size={14} /> Code
            </button>
          </div>
          <div className="w-px h-6 bg-gray-700" />
          <button
            onClick={() => setShowRegenPrompt(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Regenerate with AI"
          >
            <Sparkles size={14} /> AI
          </button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save size={14} className="mr-1" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </header>

      {showRegenPrompt && (
        <div className="px-4 py-3 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <textarea
              value={regenPrompt}
              onChange={(e) => setRegenPrompt(e.target.value)}
              placeholder="Describe what you want to change..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
              rows={1}
            />
            <Button size="sm" onClick={handleRegenerate} disabled={regenerating || !regenPrompt.trim()}>
              {regenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {regenerating ? ' Regenerating...' : ' Regenerate'}
            </Button>
            <button onClick={() => { setShowRegenPrompt(false); setError('') }} className="text-gray-500 hover:text-gray-300 text-xs">Cancel</button>
          </div>
          {error && (
            <p className="flex items-center gap-1 mt-2 text-xs text-red-400"><AlertTriangle size={12} />{error}</p>
          )}
        </div>
      )}

      <div className="flex-1 flex">
        {showCode ? (
          <div className="flex-1 p-4">
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="w-full h-full bg-gray-950 text-gray-100 font-mono text-sm p-4 rounded-lg border border-gray-800 focus:outline-none focus:border-indigo-500 resize-none"
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="flex-1 bg-white">
            <iframe ref={iframeRef} className="w-full h-full border-0" title="Website Preview" sandbox="allow-scripts allow-same-origin" />
          </div>
        )}
      </div>

      <footer className="px-4 py-2 bg-gray-900 border-t border-gray-800 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {html.length.toLocaleString()} characters
        </span>
        <span className="text-xs text-gray-500">
          Ctrl+S to save
        </span>
      </footer>
    </div>
  )
}
