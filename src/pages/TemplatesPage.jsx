import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useProjectStore } from '../store/projectStore'
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../utils/templates'
import Button from '../components/ui/Button'
import { Sparkles, Globe, Clock, Layout } from 'lucide-react'

const CATEGORY_ICONS = { Business: Globe, Personal: Sparkles, Content: Layout, 'Local Business': Clock }

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [creating, setCreating] = useState(null)
  const { user } = useAuthStore()
  const { createProject } = useProjectStore()
  const navigate = useNavigate()

  const filteredTemplates = activeCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === activeCategory)

  const handleUseTemplate = async (template) => {
    setCreating(template.id)
    try {
      const project = await createProject(user.uid, {
        name: template.name,
        templateId: template.id,
        theme: template.theme,
      })
      navigate(`/builder/${project.id}`)
    } catch (err) {
      console.error(err)
    }
    setCreating(null)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
        <p className="text-sm text-gray-500 mt-1">Start with a pre-built template and customize it</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
          >
            <div
              className="h-48 flex items-center justify-center relative"
              style={{ backgroundColor: template.theme.primaryColor + '15' }}
            >
              <div className="text-center">
                <Layout size={40} style={{ color: template.theme.primaryColor }} className="opacity-60" />
                <p className="text-sm font-medium mt-2" style={{ color: template.theme.primaryColor }}>
                  {template.name}
                </p>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button
                  size="sm"
                  className="!bg-white !text-gray-900 hover:!bg-gray-100 shadow-lg"
                  onClick={() => handleUseTemplate(template)}
                  disabled={creating === template.id}
                >
                  {creating === template.id ? 'Creating...' : 'Use Template'}
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">
                  {template.category}
                </span>
              </div>
              <p className="text-xs text-gray-500">{template.description}</p>
              <div className="flex gap-1 mt-3">
                {template.sections.map((s) => (
                  <span key={s} className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
