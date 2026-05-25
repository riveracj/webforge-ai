import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBuilderStore } from '../../store/builderStore'
import { useProjectStore } from '../../store/projectStore'
import { ArrowLeft, Save, Undo2, Redo2, Eye, Monitor, Tablet, Smartphone, Globe } from 'lucide-react'
import Button from '../ui/Button'
import PublishDialog from '../publish/PublishDialog'

export default function TopBar({ onSave, saving }) {
  const navigate = useNavigate()
  const { previewMode, setPreviewMode, undo, redo, historyIndex, history, sections } = useBuilderStore()
  const { currentProject } = useProjectStore()
  const [showPublish, setShowPublish] = useState(false)

  const previewModes = [
    { id: 'desktop', icon: Monitor },
    { id: 'tablet', icon: Tablet },
    { id: 'mobile', icon: Smartphone },
  ]

  return (
    <>
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="h-6 w-px bg-gray-200" />
          <h1 className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
            {currentProject?.name || 'New Project'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-0.5">
            {previewModes.map((mode) => {
              const Icon = mode.icon
              return (
                <button
                  key={mode.id}
                  onClick={() => setPreviewMode(mode.id)}
                  className={`p-2 rounded-md transition-colors ${
                    previewMode === mode.id
                      ? 'bg-white shadow-sm text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  aria-label={`${mode.id} preview mode`}
                  title={mode.id}
                >
                  <Icon size={16} />
                </button>
              )
            })}
          </div>

          <div className="h-6 w-px bg-gray-200 mx-1" />

          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Undo"
            title="Undo"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Redo"
            title="Redo"
          >
            <Redo2 size={16} />
          </button>

          <div className="h-6 w-px bg-gray-200 mx-1" />

          <Button variant="secondary" size="sm" onClick={onSave}>
            <Save size={14} className="mr-1" />
            {saving ? 'Saving...' : 'Save'}
          </Button>

          <Button size="sm" onClick={() => setShowPublish(true)}>
            <Globe size={14} className="mr-1" />
            Publish
          </Button>
        </div>
      </div>

      <PublishDialog isOpen={showPublish} onClose={() => setShowPublish(false)} />
    </>
  )
}
