import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useProjectStore } from '../store/projectStore'
import { generateWebsite } from '../utils/aiEngine'
import { ZoomIn, ZoomOut, Sparkles, Loader2, Code, Eye, ArrowLeft, Save, AlertTriangle } from 'lucide-react'
import Button from '../components/ui/Button'

export default function BuilderPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { canGenerateAi, incrementAiGenerations } = useAuthStore()
  const { currentProject, loading, getProject, updateProject } = useProjectStore()
  const [html, setHtml] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [followUpPrompt, setFollowUpPrompt] = useState('')
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState('')
  const iframeRef = useRef(null)
  const blobUrlRef = useRef(null)
  const regeneratingRef = useRef(false)
  const autoSaveRef = useRef(null)

  useEffect(() => {
    if (projectId && projectId !== 'new') {
      getProject(projectId).then((project) => {
        if (project?.generatedHtml) setHtml(project.generatedHtml)
      })
    }
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
      if (autoSaveRef.current) clearInterval(autoSaveRef.current)
    }
  }, [projectId])

  useEffect(() => {
    if (html && iframeRef.current) {
      const newUrl = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = newUrl
      iframeRef.current.src = newUrl
    }
  }, [html])

  // Auto-save every 30s
  useEffect(() => {
    if (!projectId || !html) return
    autoSaveRef.current = setInterval(() => {
      updateProject(projectId, { generatedHtml: html }).catch(console.error)
    }, 30000)
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current)
    }
  }, [projectId, html])

  const handleSave = async () => {
    if (!projectId) return
    setSaving(true)
    await updateProject(projectId, { generatedHtml: html })
    setSaving(false)
  }

  const handleRegenerate = async () => {
    if (!followUpPrompt.trim() || regeneratingRef.current) return
    if (!canGenerateAi()) {
      setError('You have used all your AI generations. Upgrade to Pro for more.')
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
      setError(err.message || 'Regeneration failed.')
    }
    setRegenerating(false)
    regeneratingRef.current = false
    setFollowUpPrompt('')
  }

  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave() }
  }, [html, projectId])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const zoomIn = () => setZoom(z => Math.min(z + 0.25, 3))
  const zoomOut = () => setZoom(z => Math.max(z - 0.25, 0.25))
  const zoomReset = () => setZoom(1)

  // Re-render preview when toggling back from code view
  const toggleView = (code) => {
    if (!code && blobUrlRef.current && iframeRef.current && html) {
      const newUrl = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = newUrl
      iframeRef.current.src = newUrl
    }
    setShowCode(code)
  }

  if (loading && !currentProject) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 size={32} className="text-indigo-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      <header className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          <span className="text-sm font-medium text-white truncate max-w-[200px]">
            {currentProject?.name || 'Builder'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700">
            <button onClick={zoomOut} className="p-1.5 text-gray-400 hover:text-white" title="Zoom out">
              <ZoomOut size={14} />
            </button>
            <button onClick={zoomReset} className="px-2 py-1.5 text-xs text-gray-400 hover:text-white font-mono">
              {Math.round(zoom * 100)}%
            </button>
            <button onClick={zoomIn} className="p-1.5 text-gray-400 hover:text-white" title="Zoom in">
              <ZoomIn size={14} />
            </button>
          </div>
          <div className="flex bg-gray-800 rounded-lg border border-gray-700 p-0.5">
            <button
              onClick={() => toggleView(false)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                !showCode ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            ><Eye size={14} /> Preview</button>
            <button
              onClick={() => toggleView(true)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                showCode ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            ><Code size={14} /> Code</button>
          </div>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save size={14} className="mr-1" /> {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </header>

      <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <textarea
            value={followUpPrompt}
            onChange={(e) => setFollowUpPrompt(e.target.value)}
            placeholder="Follow-up prompt: change colors, add sections, redesign..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
            rows={1}
            onKeyDown={(e) => e.key === 'Enter' && (e.metaKey || e.ctrlKey) && handleRegenerate()}
          />
          <button
            onClick={handleRegenerate}
            disabled={regenerating || !followUpPrompt.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-50"
          >
            {regenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Regenerate
          </button>
        </div>
        {error && (
          <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
            <AlertTriangle size={12} />
            {error}
            <button onClick={() => setError('')} className="underline hover:text-red-300">Dismiss</button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto bg-gray-900 flex items-start justify-center p-4">
        <div
          className="bg-white shadow-2xl origin-top transition-transform"
          style={{
            transform: `scale(${zoom})`,
            width: '1200px',
            minHeight: '800px',
            maxWidth: `${100 / zoom}%`,
          }}
        >
          {showCode ? (
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="w-full h-full min-h-[600px] bg-gray-950 text-gray-100 font-mono text-sm p-4 border-0 resize-none"
              spellCheck={false}
            />
          ) : (
            <iframe ref={iframeRef} className="w-full border-0" style={{ minHeight: '600px', height: html ? 'auto' : '600px' }} title="Preview" sandbox="allow-scripts allow-same-origin" />
          )}
        </div>
      </div>

      <footer className="px-4 py-1.5 bg-gray-900 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
        <span>Ctrl+S to save &middot; Auto-saves every 30s</span>
        <span>Follow-up prompts regenerate the full page</span>
      </footer>
    </div>
  )
}
