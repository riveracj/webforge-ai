import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import { SectionRenderer } from '../components/renderer/Renderer'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function PreviewPage() {
  const { projectId } = useParams()
  const { getProject, loading } = useProjectStore()
  const [sections, setSections] = useState([])
  const [html, setHtml] = useState('')
  const [error, setError] = useState(null)
  const iframeRef = useRef(null)

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
  }, [projectId])

  useEffect(() => {
    if (html && iframeRef.current) {
      const blob = new Blob([html], { type: 'text/html' })
      iframeRef.current.src = URL.createObjectURL(blob)
    }
  }, [html])

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
      <div className="w-full h-screen bg-white">
        <iframe ref={iframeRef} className="w-full h-full border-0" title="Preview" />
      </div>
    )
  }

  return <SectionRenderer sections={sections} />
}
