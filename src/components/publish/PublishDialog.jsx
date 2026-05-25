import { useState } from 'react'
import { useProjectStore } from '../../store/projectStore'
import { useBuilderStore } from '../../store/builderStore'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { Globe, Loader2, CheckCircle, ExternalLink, Copy } from 'lucide-react'

export default function PublishDialog({ isOpen, onClose }) {
  const { currentProject, updateProject } = useProjectStore()
  const { sections } = useBuilderStore()
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [publishedUrl, setPublishedUrl] = useState('')
  const [customDomain, setCustomDomain] = useState('')

  const handlePublish = async () => {
    setPublishing(true)
    try {
      await new Promise((r) => setTimeout(r, 2000))
      const url = customDomain
        ? `https://${customDomain}`
        : `https://${currentProject?.id}.webforge-ai.web.app`

      if (currentProject?.id) {
        await updateProject(currentProject.id, {
          status: 'published',
          publishedUrl: url,
          publishedAt: Date.now(),
        })
      }

      setPublishedUrl(url)
      setPublished(true)
    } catch (err) {
      console.error(err)
    }
    setPublishing(false)
  }

  const handleCopyUrl = () => {
    navigator.clipboard?.writeText(publishedUrl)
  }

  const handleReset = () => {
    setPublished(false)
    setPublishedUrl('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Publish Website" size="md">
      {published ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Published Successfully!</h3>
          <p className="text-sm text-gray-500 mb-4">Your website is now live</p>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 mb-6">
            <Globe size={16} className="text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-700 truncate flex-1">{publishedUrl}</span>
            <button onClick={handleCopyUrl} className="p-1 hover:bg-gray-200 rounded">
              <Copy size={14} />
            </button>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleReset}>
              Update
            </Button>
            <a href={publishedUrl} target="_blank" rel="noopener noreferrer">
              <Button>
                <ExternalLink size={16} className="mr-1" />
                View Site
              </Button>
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <div className="flex items-center gap-3 mb-2">
              <Globe size={20} className="text-indigo-600" />
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Firebase Hosting</h4>
                <p className="text-xs text-gray-500">Your site will be deployed to Firebase Hosting</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default URL</label>
              <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600 font-mono">
                {currentProject?.id || 'project-id'}.webforge-ai.web.app
              </div>
            </div>

            <Input
              label="Custom Domain (optional)"
              placeholder="www.yourdomain.com"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Publishing Summary</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Pages: {currentProject?.pages?.length || 1}</p>
              <p>Sections: {sections.length}</p>
              <p>Custom Domain: {customDomain || 'Not set'}</p>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handlePublish} disabled={publishing}>
              {publishing ? (
                <>
                  <Loader2 size={16} className="mr-1 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Globe size={16} className="mr-1" />
                  Publish Now
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
