import { useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard,
  FolderOpen,
  Grid3X3,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronDown,
} from 'lucide-react'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/templates', label: 'Templates', icon: Grid3X3 },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { profile, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={24} />
            <span className="text-xl font-bold text-indigo-600">WebForge AI</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>

          <div className="relative ml-auto">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {profile?.name?.[0] || 'U'}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {profile?.name || 'User'}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{profile?.name}</p>
                    <p className="text-xs text-gray-500">{profile?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
