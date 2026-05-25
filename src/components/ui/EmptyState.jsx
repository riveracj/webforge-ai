import { FolderOpen } from 'lucide-react'
import Button from './Button'

export default function EmptyState({ icon: Icon = FolderOpen, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="p-4 bg-gray-100 rounded-full mb-4">
        <Icon size={40} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">{description}</p>
      {actionLabel && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  )
}
