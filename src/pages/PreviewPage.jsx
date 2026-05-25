import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import { SectionRenderer } from '../components/renderer/Renderer'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function PreviewPage() {
  const { projectId } = useParams()
  const { getProject, loading } = useProjectStore()
  const [sections, setSections] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (projectId) {
      getProject(projectId).then((project) => {
        if (project) {
          setSections(project.pages?.[0]?.sections || [])
        } else {
          setError('Project not found')
        }
      })
    }
  }, [projectId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  return <SectionRenderer sections={sections} />
}
