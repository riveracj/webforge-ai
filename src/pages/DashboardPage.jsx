import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useProjectStore } from '../store/projectStore'
import { Plus, Sparkles, FolderOpen } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import ProjectCard from '../components/dashboard/ProjectCard'

export default function DashboardPage() {
  const { user, profile } = useAuthStore()
  const { projects, loading, fetchProjects, createProject, cloneProject, deleteProject } = useProjectStore()
  const navigate = useNavigate()
  const [showNewModal, setShowNewModal] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (user) fetchProjects(user.uid)
  }, [user])

  const handleCreate = async () => {
    if (!projectName.trim()) return
    setCreating(true)
    try {
      const project = await createProject(user.uid, { name: projectName.trim() })
      setShowNewModal(false)
      setProjectName('')
      navigate(`/builder/${project.id}`)
    } catch (err) {
      console.error(err)
    }
    setCreating(false)
  }

  const handleClone = async (projectId) => {
    await cloneProject(projectId, user.uid)
  }

  const handleDelete = async (projectId) => {
    await deleteProject(projectId)
  }

  const handleAICreate = () => {
    setShowNewModal(false)
    navigate('/builder/new?mode=ai')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, {profile?.name || 'User'}
          </p>
        </div>
        <Button onClick={() => setShowNewModal(true)}>
          <Plus size={18} className="mr-1" />
          New Project
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="pt-20" />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No projects yet"
          description="Create your first website project to get started with WebForge AI"
          actionLabel="Create Project"
          onAction={() => setShowNewModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClone={handleClone}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="Create New Project">
        <div className="space-y-4">
          <Input
            label="Project Name"
            placeholder="My Awesome Website"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleAICreate}
            >
              <Sparkles size={16} className="mr-1" />
              Generate with AI
            </Button>
            <Button className="flex-1" onClick={handleCreate} disabled={creating || !projectName.trim()}>
              {creating ? 'Creating...' : 'Create Blank'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
