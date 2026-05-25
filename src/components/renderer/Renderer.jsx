import { Suspense } from 'react'
import { getComponent } from './ComponentRegistry'
import ErrorBoundary from './ErrorBoundary'

function SectionFallback() {
  return (
    <div className="h-32 flex items-center justify-center bg-gray-50 animate-pulse rounded-lg m-4">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  )
}

export function Renderer({ section }) {
  const Component = getComponent(section?.componentType)

  if (!Component) {
    return (
      <div className="p-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg m-4">
        <p className="text-sm">Unknown component: {section?.componentType}</p>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<SectionFallback />}>
        <Component {...section.props} styles={section.styles} />
      </Suspense>
    </ErrorBoundary>
  )
}

export function SectionRenderer({ sections }) {
  return (
    <>
      {sections.map((section) => (
        <Renderer key={section.id} section={section} />
      ))}
    </>
  )
}
