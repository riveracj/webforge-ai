export default function BuilderLayout({ sidebar, canvas, propertiesPanel }) {
  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto hidden lg:block">
        {sidebar}
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-100">
        {canvas}
      </div>

      <div className="w-72 flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto hidden xl:block">
        {propertiesPanel}
      </div>
    </div>
  )
}
