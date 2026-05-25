import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useProjectStore } from '../store/projectStore'
import { useBuilderStore } from '../store/builderStore'
import BuilderLayout from '../components/builder/BuilderLayout'
import Canvas from '../components/builder/Canvas'
import Sidebar from '../components/builder/Sidebar'
import PropertiesPanel from '../components/builder/PropertiesPanel'
import TopBar from '../components/builder/TopBar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { generateWebsite } from '../utils/aiEngine'

export default function BuilderPage() {
  const { projectId } = useParams()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const { currentProject, loading, getProject, updateProject } = useProjectStore()
  const { sections, setSections, setPages, reset } = useBuilderStore()
  const [saving, setSaving] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    reset()
    if (projectId && projectId !== 'new') {
      getProject(projectId).then((project) => {
        if (project) {
          setPages(project.pages || [])
          setSections(project.pages?.[0]?.sections || [])
        }
        setInitialized(true)
      })
    } else {
      const mode = searchParams.get('mode')
      if (mode === 'ai') {
        const mockPrompt = 'Create a modern business website with hero, services, pricing, and contact sections'
        generateWebsite(mockPrompt).then((generatedSections) => {
          setSections(generatedSections)
          setPages([{ id: 'page-1', name: 'Home', slug: 'home', sections: generatedSections }])
          setInitialized(true)
        })
      } else {
        setInitialized(true)
      }
    }
    return () => reset()
  }, [projectId])

  const handleSave = useCallback(async () => {
    if (!currentProject?.id) return
    setSaving(true)
    const page = { id: 'page-1', name: 'Home', slug: 'home', sections }
    await updateProject(currentProject.id, {
      pages: [page],
      updatedAt: Date.now(),
    })
    setSaving(false)
  }, [currentProject, sections, updateProject])

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentProject?.id && sections.length > 0) {
        handleSave()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [handleSave, sections])

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <TopBar onSave={handleSave} saving={saving} />
      <BuilderLayout
        sidebar={<Sidebar />}
        canvas={<Canvas />}
        propertiesPanel={<PropertiesPanel />}
      />
    </div>
  )
}
