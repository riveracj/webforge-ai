import { useState } from 'react'
import { Plus } from 'lucide-react'
import { SECTION_TYPES } from '../../utils/constants'

export default function DropZone({ index, onDrop }) {
  const [isHover, setIsHover] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="relative">
      <div
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => { if (!showMenu) setIsHover(false) }}
        className="absolute left-0 right-0 z-10 flex items-center justify-center h-0"
      >
        <div className={`transition-all ${isHover || showMenu ? '-translate-y-3' : ''}`}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`bg-indigo-500 text-white rounded-full p-1 shadow-lg hover:bg-indigo-600 transition-all ${
              isHover || showMenu ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => { setShowMenu(false); setIsHover(false) }} />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 z-30 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-64">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Add Section</p>
            <div className="grid grid-cols-3 gap-1.5">
              {SECTION_TYPES.map((section) => (
                <button
                  key={section.type}
                  onClick={() => { onDrop(section.type); setShowMenu(false); setIsHover(false) }}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 transition-colors"
                >
                  <Plus size={14} />
                  <span className="text-[10px] font-medium">{section.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
