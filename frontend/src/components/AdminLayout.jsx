import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Home, Mail, Music, Image, LogOut, LayoutDashboard, BarChart3 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/admin/posts', icon: Home, label: 'Posts' },
    { to: '/admin/messages', icon: Mail, label: 'Messages' },
    { to: '/admin/music', icon: Music, label: 'Music' },
    { to: '/admin/gallery', icon: Image, label: 'Gallery' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="px-4 md:px-6 h-14 flex items-center justify-between">
          <NavLink to="/admin" className="font-semibold text-lg text-gray-900 dark:text-white">
            Admin Dashboard
          </NavLink>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-14">
        {/* Sidebar */}
        <aside className="fixed left-0 top-14 bottom-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden md:block">
          <nav className="p-4 space-y-1">
            {navItems.map(({ to, icon: Icon, label, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          
          <div className="absolute bottom-4 left-4 right-4">
            <NavLink
              to="/"
              className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              View Public Site →
            </NavLink>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden z-50">
          <div className="flex justify-around items-center h-16">
            {navItems.map(({ to, icon: Icon, label, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-2 px-2 transition-colors ${
                    isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-1">{label.split(' ')[0]}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 min-h-[calc(100vh-3.5rem)] pb-20 md:pb-6">
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
