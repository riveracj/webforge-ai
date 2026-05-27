import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import { SectionRenderer } from '../components/renderer/Renderer'
import { Code, Sparkles } from 'lucide-react'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function PreviewPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { getProject, loading } = useProjectStore()
  const [sections, setSections] = useState([])
  const [html, setHtml] = useState('')
  const [error, setError] = useState(null)
  const [showFab, setShowFab] = useState(true)
  const iframeRef = useRef(null)
  const blobUrlRef = useRef(null)

  useEffect(() => {
    if (projectId) {
      getProject(projectId).then((project) => {
        if (project) {
          setSections(project.pages?.[0]?.sections || [])
          setHtml(project.generatedHtml || '')
        } else {
          setError('Project not found')
        }
      })
    }
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    }
  }, [projectId])

  useEffect(() => {
    if (html && iframeRef.current) {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
      const newUrl = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
      blobUrlRef.current = newUrl
      iframeRef.current.src = newUrl
    }
  }, [html])

  let fabTimer = null

  const handleMouseMove = () => {
    setShowFab(true)
    clearTimeout(fabTimer)
    fabTimer = setTimeout(() => setShowFab(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <p>{error}</p>
      </div>
    )
  }

  if (html) {
    return (
      <div className="w-full h-screen bg-white relative" onMouseMove={handleMouseMove}>
        <iframe ref={iframeRef} className="w-full h-full border-0" title="Preview" sandbox="allow-scripts allow-same-origin" />
        <div className={`fixed bottom-6 right-6 flex items-center gap-3 transition-all duration-300 ${showFab ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={() => navigate(`/site/${projectId}`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transition-all text-sm font-medium"
          >
            <Code size={16} />
            Open in Editor
          </button>
          <button
            onClick={() => navigate(`/generate`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all text-sm font-medium"
          >
            <Sparkles size={16} />
            New Generation
          </button>
        </div>
      </div>
    )
  }

  return <SectionRenderer sections={sections} />
}
