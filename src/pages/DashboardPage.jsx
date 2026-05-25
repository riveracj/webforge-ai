import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useProjectStore } from '../store/projectStore'
import { Plus, Sparkles, FolderOpen, AlertTriangle } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import ProjectCard from '../components/dashboard/ProjectCard'
import UpgradePrompt from '../components/billing/UpgradePrompt'
import { PLANS } from '../utils/constants'

export default function DashboardPage() {
  const { user, profile } = useAuthStore()
  const { projects, loading, fetchProjects, createProject, cloneProject, deleteProject, error } = useProjectStore()
  const navigate = useNavigate()
  const [showNewModal, setShowNewModal] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [creating, setCreating] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const plan = profile?.usage?.plan || 'free'
  const projectCount = profile?.usage?.projectCount || 0
  const projectLimit = PLANS[plan]?.projects || 0
  const atLimit = projectCount >= projectLimit

  useEffect(() => {
    if (user) fetchProjects(user.uid)
  }, [user])

  const handleCreate = async () => {
    if (!projectName.trim()) return
    if (atLimit) {
      setShowNewModal(false)
      setShowUpgrade(true)
      return
    }
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

  const handleAICreate = () => {
    setShowNewModal(false)
    if (atLimit) {
      setShowUpgrade(true)
      return
    }
    navigate('/builder/new?mode=ai')
  }

  const handleClone = async (projectId) => {
    if (atLimit) {
      setShowUpgrade(true)
      return
    }
    await cloneProject(projectId, user.uid)
  }

  const handleDelete = async (projectId) => {
    await deleteProject(projectId)
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
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 bg-gray-100 rounded-lg px-3 py-1.5">
            <span className="capitalize font-medium text-gray-700">{plan} plan</span>
            <span className="text-gray-300">|</span>
            <span>{projectCount}/{projectLimit} projects</span>
          </div>
          <Button onClick={() => setShowNewModal(true)} disabled={atLimit}>
            <Plus size={18} className="mr-1" />
            New Project
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {atLimit && (
        <div className="flex items-center justify-between p-4 mb-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-amber-700">
            <AlertTriangle size={16} />
            <span>You've reached the {plan} plan limit of {projectLimit} projects.</span>
          </div>
          <Button size="sm" onClick={() => setShowUpgrade(true)}>
            Upgrade
          </Button>
        </div>
      )}

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
          {atLimit && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              <AlertTriangle size={16} />
              <span>Project limit reached. <button onClick={() => { setShowNewModal(false); setShowUpgrade(true) }} className="underline font-medium">Upgrade</button></span>
            </div>
          )}
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
              disabled={atLimit}
            >
              <Sparkles size={16} className="mr-1" />
              Generate with AI
            </Button>
            <Button className="flex-1" onClick={handleCreate} disabled={creating || !projectName.trim() || atLimit}>
              {creating ? 'Creating...' : 'Create Blank'}
            </Button>
          </div>
        </div>
      </Modal>

      {showUpgrade && <UpgradePrompt onClose={() => setShowUpgrade(false)} />}
    </div>
  )
}
