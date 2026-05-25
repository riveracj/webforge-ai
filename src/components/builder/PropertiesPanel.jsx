import { useState, useEffect } from 'react'
import { useBuilderStore } from '../../store/builderStore'
import { SECTION_TYPES } from '../../utils/constants'
import { Settings, Trash2, Copy, ArrowUp, ArrowDown, Sparkles } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'

export default function PropertiesPanel() {
  const { sections, selectedSectionId, updateSection, removeSection, moveSection, updateComponentProps } = useBuilderStore()
  const selectedSection = sections.find((s) => s.id === selectedSectionId)

  if (!selectedSection) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <Settings size={32} className="mb-2 opacity-50" />
          <p className="text-sm font-medium">No section selected</p>
          <p className="text-xs">Click on a section to edit its properties</p>
        </div>
      </div>
    )
  }

  const sectionIndex = sections.findIndex((s) => s.id === selectedSectionId)
  const sectionInfo = SECTION_TYPES.find((s) => s.type === selectedSection.componentType)

  const handlePropChange = (key, value) => {
    updateComponentProps(selectedSection.id, { [key]: value })
  }

  const renderPropsEditor = () => {
    const props = selectedSection.props || {}
    switch (selectedSection.componentType) {
      case 'hero':
        return (
          <div className="space-y-3">
            <Input label="Headline" value={props.headline || ''} onChange={(e) => handlePropChange('headline', e.target.value)} />
            <Input label="Subheadline" value={props.subheadline || ''} onChange={(e) => handlePropChange('subheadline', e.target.value)} />
            <Input label="CTA Text" value={props.ctaText || ''} onChange={(e) => handlePropChange('ctaText', e.target.value)} />
            <Input label="CTA Link" value={props.ctaLink || ''} onChange={(e) => handlePropChange('ctaLink', e.target.value)} />
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Background</label>
              <select
                value={props.backgroundStyle || 'gradient'}
                onChange={(e) => handlePropChange('backgroundStyle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="gradient">Gradient</option>
                <option value="solid">Solid</option>
                <option value="image">Image</option>
              </select>
            </div>
          </div>
        )
      case 'services':
      case 'features':
        return (
          <div className="space-y-3">
            <Input label="Title" value={props.title || ''} onChange={(e) => handlePropChange('title', e.target.value)} />
            <Input label="Subtitle" value={props.subtitle || ''} onChange={(e) => handlePropChange('subtitle', e.target.value)} />
          </div>
        )
      case 'pricing':
        return (
          <div className="space-y-3">
            <Input label="Title" value={props.title || ''} onChange={(e) => handlePropChange('title', e.target.value)} />
            <Input label="Subtitle" value={props.subtitle || ''} onChange={(e) => handlePropChange('subtitle', e.target.value)} />
          </div>
        )
      case 'contact':
        return (
          <div className="space-y-3">
            <Input label="Title" value={props.title || ''} onChange={(e) => handlePropChange('title', e.target.value)} />
            <Input label="Email" value={props.email || ''} onChange={(e) => handlePropChange('email', e.target.value)} />
            <Input label="Phone" value={props.phone || ''} onChange={(e) => handlePropChange('phone', e.target.value)} />
          </div>
        )
      case 'footer':
        return (
          <Input label="Copyright Text" value={props.text || ''} onChange={(e) => handlePropChange('text', e.target.value)} />
        )
      default:
        return (
          <div className="space-y-3">
            <Input label="Title" value={props.title || ''} onChange={(e) => handlePropChange('title', e.target.value)} />
            <Input label="Subtitle" value={props.subtitle || ''} onChange={(e) => handlePropChange('subtitle', e.target.value)} />
          </div>
        )
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{sectionInfo?.label || 'Section'}</h3>
          <p className="text-xs text-gray-500">{selectedSection.componentType}</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => moveSection(sectionIndex, sectionIndex - 1)}
            disabled={sectionIndex === 0}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"
          >
            <ArrowUp size={14} />
          </button>
          <button
            onClick={() => moveSection(sectionIndex, sectionIndex + 1)}
            disabled={sectionIndex === sections.length - 1}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"
          >
            <ArrowDown size={14} />
          </button>
          <button
            onClick={() => removeSection(selectedSection.id)}
            className="p-1.5 rounded hover:bg-red-50 text-red-500"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Content</h4>
        {renderPropsEditor()}
      </div>

      <div className="border-t border-gray-200 pt-4 mt-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Styles</h4>
        <div className="space-y-3">
          <Input
            label="Padding"
            value={selectedSection.styles?.padding || '60px 20px'}
            onChange={(e) => updateSection(selectedSection.id, { styles: { ...selectedSection.styles, padding: e.target.value } })}
          />
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Background Color</label>
            <input
              type="color"
              value={selectedSection.styles?.background || '#ffffff'}
              onChange={(e) => updateSection(selectedSection.id, { styles: { ...selectedSection.styles, background: e.target.value } })}
              className="w-full h-8 rounded border border-gray-300 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
