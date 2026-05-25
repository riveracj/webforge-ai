import { create } from 'zustand'

export const useBuilderStore = create((set, get) => ({
  pages: [],
  currentPageIndex: 0,
  sections: [],
  selectedSectionId: null,
  editingComponent: null,
  previewMode: 'desktop',
  history: [],
  historyIndex: -1,
  isDragging: false,

  setPages: (pages) => set({ pages }),

  setCurrentPage: (index) => set({ currentPageIndex: index }),

  setSections: (sections) => {
    const history = get().history
    const historyIndex = get().historyIndex
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ sections: get().sections })
    set({
      sections,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    })
  },

  addSection: (section, index) => {
    const sections = [...get().sections]
    const insertAt = index ?? sections.length
    sections.splice(insertAt, 0, section)
    get().pushHistory(sections)
    set({ sections, selectedSectionId: section.id })
  },

  updateSection: (sectionId, updates) => {
    const sections = get().sections.map((s) =>
      s.id === sectionId ? { ...s, ...updates } : s
    )
    get().pushHistory(sections)
    set({ sections })
  },

  removeSection: (sectionId) => {
    const sections = get().sections.filter((s) => s.id !== sectionId)
    get().pushHistory(sections)
    set({
      sections,
      selectedSectionId:
        get().selectedSectionId === sectionId ? null : get().selectedSectionId,
    })
  },

  moveSection: (fromIndex, toIndex) => {
    const sections = [...get().sections]
    const [moved] = sections.splice(fromIndex, 1)
    sections.splice(toIndex, 0, moved)
    get().pushHistory(sections)
    set({ sections })
  },

  selectSection: (sectionId) => set({ selectedSectionId: sectionId, editingComponent: sectionId ? get().sections.find(s => s.id === sectionId)?.componentType || null : null }),

  updateComponentProps: (sectionId, props) => {
    const sections = get().sections.map((s) =>
      s.id === sectionId ? { ...s, props: { ...s.props, ...props } } : s
    )
    get().pushHistory(sections)
    set({ sections })
  },

  setPreviewMode: (mode) => set({ previewMode: mode }),

  pushHistory: (sections) => {
    const history = get().history
    const historyIndex = get().historyIndex
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ sections: [...sections] })
    if (newHistory.length > 50) newHistory.shift()
    set({ history: newHistory, historyIndex: newHistory.length - 1 })
  },

  undo: () => {
    const { historyIndex, history } = get()
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      set({
        sections: [...history[newIndex].sections],
        historyIndex: newIndex,
      })
    }
  },

  redo: () => {
    const { historyIndex, history } = get()
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      set({
        sections: [...history[newIndex].sections],
        historyIndex: newIndex,
      })
    }
  },

  setIsDragging: (isDragging) => set({ isDragging }),

  reset: () =>
    set({
      pages: [],
      currentPageIndex: 0,
      sections: [],
      selectedSectionId: null,
      editingComponent: null,
      previewMode: 'desktop',
      history: [],
      historyIndex: -1,
    }),
}))
