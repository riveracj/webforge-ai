import { useBuilderStore } from '../../store/builderStore'
import { Renderer } from '../renderer/Renderer'
import { Plus, GripVertical, Sparkles, X, Loader2 } from 'lucide-react'
import DropZone from './DropZone'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import { generateSection } from '../../utils/aiEngine'

function SortableSection({ section, isSelected, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  })
  const { sections, replaceSection } = useBuilderStore()
  const [showAIPrompt, setShowAIPrompt] = useState(false)
  const [aiPrompt, setAiPrompt] = useState(`Make this ${section.componentType} section more compelling`)
  const [regenerating, setRegenerating] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      const result = await generateSection(aiPrompt, sections)
      if (result) {
        replaceSection(section.id, { ...result, id: section.id })
        setShowAIPrompt(false)
      }
    } catch (err) {
      console.error(err)
    }
    setRegenerating(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group cursor-pointer transition-all hover:ring-2 hover:ring-indigo-200 ${
        isSelected ? 'ring-2 ring-indigo-500' : ''
      } ${isDragging ? 'z-50' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(section.id)
      }}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-white shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:bg-gray-50"
        aria-label="Drag to reorder section"
      >
        <GripVertical size={14} className="text-gray-400" />
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); setShowAIPrompt(true) }}
        className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 text-gray-500 hover:text-indigo-600"
        title="Regenerate with AI"
      >
        <Sparkles size={14} />
      </button>

      <Renderer section={section} />

      {showAIPrompt && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 mx-4 w-full max-w-md">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-500" />
                Regenerate {section.componentType} section
              </h4>
              <button
                onClick={() => setShowAIPrompt(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X size={14} />
              </button>
            </div>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-3"
              placeholder="Describe the section you want..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAIPrompt(false)}
                className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerate}
                disabled={regenerating || !aiPrompt.trim()}
                className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
              >
                {regenerating ? (
                  <><Loader2 size={12} className="animate-spin" /> Regenerating...</>
                ) : (
                  <><Sparkles size={12} /> Regenerate</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyCanvas() {
  return (
    <div className="flex flex-col items-center justify-center h-[600px] text-gray-400">
      <Plus size={48} className="mb-4 opacity-50" />
      <p className="text-lg font-medium">Start building your page</p>
      <p className="text-sm">Add sections from the sidebar</p>
    </div>
  )
}

export default function Canvas() {
  const { sections, addSection, moveSection, selectedSectionId, selectSection, setIsDragging, previewMode } = useBuilderStore()
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
    setIsDragging(true)
  }

  const handleDragEnd = (event) => {
    setActiveId(null)
    setIsDragging(false)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sections.findIndex((s) => s.id === active.id)
    const newIndex = sections.findIndex((s) => s.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) {
      moveSection(oldIndex, newIndex)
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setIsDragging(false)
  }

  const widthClasses = {
    desktop: 'max-w-full',
    tablet: 'max-w-[768px]',
    mobile: 'max-w-[375px]',
  }

  return (
    <div className="flex justify-center py-8 px-4 min-h-full">
      <div
        className={`w-full ${widthClasses[previewMode]} bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300`}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div
            className="min-h-[600px]"
            onClick={() => selectSection(null)}
          >
            {sections.length === 0 ? (
              <EmptyCanvas />
            ) : (
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {sections.map((section, index) => (
                  <div key={section.id}>
                    {index > 0 && (
                      <DropZone
                        index={index}
                        onDrop={(type) => {
                          const newSection = {
                            id: `section-${Date.now()}`,
                            type,
                            componentType: type,
                            props: {},
                            styles: { padding: '60px 20px' },
                          }
                          addSection(newSection, index)
                        }}
                      />
                    )}
                    <SortableSection
                      section={section}
                      isSelected={selectedSectionId === section.id}
                      onSelect={selectSection}
                    />
                  </div>
                ))}
              </SortableContext>
            )}
          </div>
          <DragOverlay>
            {activeId ? (
              <div className="ring-2 ring-indigo-500 rounded-lg bg-white shadow-xl opacity-90 p-4">
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="text-indigo-400" />
                  <span className="text-sm font-medium text-gray-600">Move section</span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
