import { useState } from 'react'
import { ExternalLink, Edit3, Copy, Trash2, Globe, Clock } from 'lucide-react'
import Button from '../ui/Button'

export default function ProjectCard({ project, onClone, onDelete, onClick }) {
  const [showDelete, setShowDelete] = useState(false)

  const timeAgo = (timestamp) => {
    const diff = Date.now() - timestamp
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="h-40 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-4 w-20 h-20 bg-indigo-300 rounded-full blur-xl" />
          <div className="absolute bottom-4 right-4 w-16 h-16 bg-purple-300 rounded-full blur-xl" />
        </div>
        <Globe size={48} className="text-indigo-300" />
        {project.status === 'published' && (
          <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            Published
          </span>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            size="sm"
            onClick={() => onClick(project)}
            className="!bg-white !text-gray-900 hover:!bg-gray-100 shadow-lg"
          >
            <Edit3 size={14} className="mr-1" />
            Open
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Clock size={12} />
              {timeAgo(project.updatedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => onClick(project)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <Edit3 size={14} />
            Open
          </button>
          <button
            onClick={() => onClone(project.id)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <Copy size={14} />
            Clone
          </button>
          {project.publishedUrl && (
            <a
              href={project.publishedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-600 transition-colors"
            >
              <ExternalLink size={14} />
              View
            </a>
          )}
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors ml-auto"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDelete(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 m-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Project?</h3>
            <p className="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setShowDelete(false)}>Cancel</Button>
              <Button variant="danger" onClick={() => { onDelete(project.id); setShowDelete(false) }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
