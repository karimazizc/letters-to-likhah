import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Home, Mail, Music, Image, Plus, BarChart3, Users, Eye } from 'lucide-react'
import { postsApi, messagesApi, galleryApi, musicApi, analyticsApi } from '../../services/api'

function Dashboard() {
  const [stats, setStats] = useState({
    posts: 0,
    messages: 0,
    tracks: 0,
    media: 0,
  })
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [postsData, messagesData, musicData, galleryData] = await Promise.all([
          postsApi.getAll(1, 1, true),
          messagesApi.getAll(1, 1, true),
          musicApi.getAll(),
          galleryApi.getAll(1, 0),
        ])

        setStats({
          posts: postsData.total || 0,
          messages: messagesData.total || 0,
          tracks: musicData.total || musicData.tracks?.length || 0,
          media: galleryData.total || galleryData.media?.length || 0,
        })

        // Fetch analytics
        try {
          const analyticsData = await analyticsApi.getStats()
          setAnalytics(analyticsData)
        } catch {
          // Analytics may not be available
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const cards = [
    { name: 'Posts', count: stats.posts, icon: Home, link: '/admin/posts', color: 'bg-gray-100 dark:bg-gray-800' },
    { name: 'Messages', count: stats.messages, icon: Mail, link: '/admin/messages', color: 'bg-gray-100 dark:bg-gray-800' },
    { name: 'Music', count: stats.tracks, icon: Music, link: '/admin/music', color: 'bg-gray-100 dark:bg-gray-800' },
    { name: 'Gallery', count: stats.media, icon: Image, link: '/admin/gallery', color: 'bg-gray-100 dark:bg-gray-800' },
  ]

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Manage your content</p>
      </header>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <Eye className="w-4 h-4" />
              <span className="text-sm">Total Views</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{analytics.total_views || 0}</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">Unique Visitors</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{analytics.total_unique_visitors || 0}</p>
          </div>
          <Link to="/admin/analytics" className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">Views Today</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{analytics.views_today || 0}</p>
            <p className="text-xs text-indigo-500 mt-1">View full analytics →</p>
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(({ name, count, icon: Icon, link, color }) => (
          <Link
            key={name}
            to={link}
            className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
          >
            <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-4`}>
              <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {loading ? '—' : count}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{name}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cards.map(({ name, link }) => (
            <Link
              key={name}
              to={link}
              className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New {name === 'Gallery' ? 'Media' : name.replace(/s$/, '')}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard


