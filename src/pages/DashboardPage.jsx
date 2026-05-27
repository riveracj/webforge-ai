import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useProjectStore } from '../store/projectStore'
import { Sparkles, FolderOpen, AlertTriangle, Lightbulb } from 'lucide-react'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import ProjectCard from '../components/dashboard/ProjectCard'
import UpgradePrompt from '../components/billing/UpgradePrompt'
import { PLANS } from '../utils/constants'

const QUICK_PROMPTS = [
  { label: 'SaaS Landing Page', prompt: 'A modern SaaS landing page with hero, features, pricing, testimonials, and contact sections. Clean, professional design.' },
  { label: 'Restaurant Site', prompt: 'A beautiful restaurant website with menu showcase, gallery of dishes, reservation form, and location.' },
  { label: 'Portfolio', prompt: 'A creative portfolio for a designer with project showcase, skills, and contact form. Minimal design.' },
  { label: 'Startup', prompt: 'A tech startup website with hero, team members, features grid, stats, and contact. Bold design.' },
]

export default function DashboardPage() {
  const { user, profile } = useAuthStore()
  const { projects, loading, fetchProjects, cloneProject, deleteProject, error } = useProjectStore()
  const navigate = useNavigate()
  const [showUpgrade, setShowUpgrade] = useState(false)

  const plan = profile?.usage?.plan || 'free'
  const projectCount = profile?.usage?.projectCount || 0
  const projectLimit = PLANS[plan]?.projects || 0
  const atLimit = projectCount >= projectLimit

  useEffect(() => {
    if (user) fetchProjects(user.uid)
  }, [user])

  const handleQuickGenerate = (prompt) => {
    if (atLimit) { setShowUpgrade(true); return }
    navigate(`/generate?prompt=${encodeURIComponent(prompt)}`)
  }

  const handleClone = async (projectId) => {
    if (atLimit) { setShowUpgrade(true); return }
    await cloneProject(projectId, user.uid)
  }

  const handleDelete = async (projectId) => {
    await deleteProject(projectId)
  }

  const handleOpenSite = (project) => {
    navigate(project.generatedHtml ? `/site/${project.id}` : `/preview/${project.id}`)
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
          <Button onClick={() => navigate('/generate')}>
            <Sparkles size={18} className="mr-1" />
            New with AI
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
          <Button size="sm" onClick={() => setShowUpgrade(true)}>Upgrade</Button>
        </div>
      )}

      {!atLimit && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} className="text-indigo-500" />
            <h2 className="text-sm font-semibold text-gray-700">Quick Generate</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_PROMPTS.map((item) => (
              <button
                key={item.label}
                onClick={() => handleQuickGenerate(item.prompt)}
                className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all text-center group"
              >
                <Sparkles size={20} className="text-indigo-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-sm font-semibold text-gray-700 mb-4">All Projects</h2>

      {loading ? (
        <LoadingSpinner size="lg" className="pt-10" />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No projects yet"
          description="Generate your first website with AI in seconds"
          actionLabel="Generate with AI"
          onAction={() => navigate('/generate')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClone={handleClone}
              onDelete={handleDelete}
              onClick={() => handleOpenSite(project)}
            />
          ))}
        </div>
      )}

      {showUpgrade && <UpgradePrompt onClose={() => setShowUpgrade(false)} />}
    </div>
  )
}
