import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Home, Mail, Music, Image, Pencil, Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

function Layout() {
  const { isAuthenticated } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleAdminClick = () => {
    if (isAuthenticated()) {
      navigate('/admin')
    } else {
      navigate('/admin/login')
    }
  }

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/message', icon: Mail, label: 'Messages' },
    { to: '/music', icon: Music, label: 'Music' },
    { to: '/memories', icon: Image, label: 'Memories' },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-50">
        <div className="max-w-feed mx-auto px-4 h-14 flex items-center justify-between">
          <NavLink to="/" className="font-semibold text-lg text-gray-900 dark:text-white">
            Letters & Memories
          </NavLink>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-gray-400 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <button
              onClick={handleAdminClick}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Admin"
            >
              <Pencil className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-14 pb-36 md:pb-24">
        <div className="max-w-feed mx-auto px-4">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 md:hidden">
        <div className="flex justify-around items-center h-16">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-4 transition-colors ${
                  isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                }`
              }
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed left-0 top-14 bottom-0 w-64 border-r border-gray-100 dark:border-gray-800 p-6 bg-white dark:bg-gray-950">
        <div className="space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Desktop Content Offset */}
      <div className="hidden md:block w-64" />
    </div>
  )
}

export default Layout
