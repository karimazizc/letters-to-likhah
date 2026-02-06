import { useState, useEffect, useCallback } from 'react'
import {
  BarChart3, Eye, Users, Globe, Clock, Monitor, TrendingUp,
  ChevronLeft, ChevronRight, Filter, RefreshCw, Calendar,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { analyticsApi, formatDateTime } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const COLORS = [
  '#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe',
  '#818cf8', '#4f46e5', '#7c3aed', '#5b21b6', '#3730a3',
  '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af',
]

const PAGE_LABELS = {
  home: 'Home',
  post: 'Posts',
  message: 'Messages',
  music: 'Music',
  memories: 'Memories',
}

function parseDevice(str) {
  if (!str) return { device: 'Unknown', browser: 'Unknown' }
  const parts = str.split(' / ')
  return { device: parts[0] || 'Unknown', browser: parts[1] || 'Unknown' }
}

/* ── Stat Card ────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

/* ── Custom Tooltip ───────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

/* ── Main Analytics Dashboard ─────────────────────────────────────── */
function AdminAnalytics() {
  const [stats, setStats] = useState(null)
  const [visitors, setVisitors] = useState(null)
  const [sessions, setSessions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') // overview | visitors | sessions
  const [visitorPage, setVisitorPage] = useState(1)
  const [sessionPage, setSessionPage] = useState(1)
  const [pageTypeFilter, setPageTypeFilter] = useState('')
  const [days, setDays] = useState(30)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAll = useCallback(async () => {
    try {
      const statsData = await analyticsApi.getStats(days)
      setStats(statsData)
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [days])

  useEffect(() => {
    setLoading(true)
    fetchAll()
  }, [fetchAll])

  // Fetch visitors when tab or pagination changes
  useEffect(() => {
    if (activeTab === 'visitors') {
      analyticsApi.getVisitors(visitorPage, 30, pageTypeFilter || null)
        .then(setVisitors)
        .catch(console.error)
    }
  }, [activeTab, visitorPage, pageTypeFilter])

  // Fetch sessions
  useEffect(() => {
    if (activeTab === 'sessions') {
      analyticsApi.getSessions(sessionPage, 30)
        .then(setSessions)
        .catch(console.error)
    }
  }, [activeTab, sessionPage])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAll()
  }

  if (loading) return <LoadingSpinner />

  if (!stats) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">No analytics data available yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Views will appear here as visitors browse your site</p>
      </div>
    )
  }

  // ── Chart data preparation ──────────────────────────────────────
  const dailyData = stats.daily_stats?.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    views: d.views,
  })) || []

  const pageTypeData = stats.page_type_stats?.map(p => ({
    name: PAGE_LABELS[p.page_type] || p.page_type,
    views: p.views,
    unique: p.unique_visitors,
  })) || []

  const geoData = stats.geo_stats?.map(g => ({
    name: g.country,
    value: g.count,
  })) || []

  const hourlyData = stats.hourly_stats?.map(h => ({
    hour: `${h.hour.toString().padStart(2, '0')}:00`,
    views: h.views,
  })) || []

  // Split device stats into device vs browser
  const browserCounts = {}
  const deviceCounts = {}
  stats.device_stats?.forEach(d => {
    const { device, browser } = parseDevice(d.device)
    deviceCounts[device] = (deviceCounts[device] || 0) + d.count
    browserCounts[browser] = (browserCounts[browser] || 0) + d.count
  })
  const browserData = Object.entries(browserCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
  const deviceData = Object.entries(deviceCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Analytics
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Visitor insights and traffic overview</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'visitors', label: 'Visitors', icon: Users },
          { id: 'sessions', label: 'Sessions', icon: Monitor },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════ OVERVIEW TAB ════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon={Eye} label="Total Views" value={stats.total_views} />
            <StatCard icon={Users} label="Unique Visitors" value={stats.total_unique_visitors} />
            <StatCard icon={Eye} label="Views Today" value={stats.views_today} />
            <StatCard icon={Calendar} label="This Week" value={stats.views_this_week} />
            <StatCard icon={TrendingUp} label="This Period" value={stats.views_this_month} />
            <StatCard icon={BarChart3} label="Total Posts" value={stats.total_posts} />
          </div>

          {/* Daily Views Chart */}
          {dailyData.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Daily Views</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="Views"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#viewsGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Two-column charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Page Type Breakdown */}
            {pageTypeData.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Views by Page</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={pageTypeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="#9ca3af" width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="views" name="Total Views" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="unique" name="Unique" fill="#a78bfa" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Geographic Distribution */}
            {geoData.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Visitor Locations
                </h2>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={geoData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {geoData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Hourly Activity */}
            {hourlyData.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Activity by Hour
                </h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="views" name="Views" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Devices & Browsers */}
            {(deviceData.length > 0 || browserData.length > 0) && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Monitor className="w-4 h-4" /> Devices & Browsers
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  {/* Devices */}
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Devices</h3>
                    <div className="space-y-2">
                      {deviceData.slice(0, 6).map((d, i) => {
                        const total = deviceData.reduce((sum, x) => sum + x.value, 0)
                        const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0
                        return (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300 truncate">{d.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                                />
                              </div>
                              <span className="text-gray-400 dark:text-gray-500 text-xs w-10 text-right">{pct}%</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  {/* Browsers */}
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Browsers</h3>
                    <div className="space-y-2">
                      {browserData.slice(0, 6).map((d, i) => {
                        const total = browserData.reduce((sum, x) => sum + x.value, 0)
                        const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0
                        return (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300 truncate">{d.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${pct}%`, backgroundColor: COLORS[(i + 5) % COLORS.length] }}
                                />
                              </div>
                              <span className="text-gray-400 dark:text-gray-500 text-xs w-10 text-right">{pct}%</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Top Resources Table */}
          {stats.top_resources?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Top Content</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                      <th className="pb-3 font-medium">Content</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium text-right">Views</th>
                      <th className="pb-3 font-medium text-right">Unique</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {stats.top_resources.map((res, i) => (
                      <tr key={i} className="text-gray-700 dark:text-gray-300">
                        <td className="py-3 max-w-xs truncate">{res.title || `#${res.resource_id}`}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            {PAGE_LABELS[res.page_type] || res.page_type}
                          </span>
                        </td>
                        <td className="py-3 text-right font-medium">{res.views}</td>
                        <td className="py-3 text-right">{res.unique_visitors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Post Stats Table */}
          {stats.posts_stats?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Post Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                      <th className="pb-3 font-medium">Post</th>
                      <th className="pb-3 font-medium text-right">Views</th>
                      <th className="pb-3 font-medium text-right">Unique Visitors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {stats.posts_stats.map((post) => (
                      <tr key={post.post_id} className="text-gray-700 dark:text-gray-300">
                        <td className="py-3 max-w-xs truncate">{post.title}</td>
                        <td className="py-3 text-right font-medium">{post.view_count}</td>
                        <td className="py-3 text-right">{post.unique_visitors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════ VISITORS TAB ════════════════ */}
      {activeTab === 'visitors' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={pageTypeFilter}
              onChange={(e) => { setPageTypeFilter(e.target.value); setVisitorPage(1) }}
              className="px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
            >
              <option value="">All Pages</option>
              <option value="home">Home</option>
              <option value="post">Posts</option>
              <option value="message">Messages</option>
              <option value="music">Music</option>
              <option value="memories">Memories</option>
            </select>
            {visitors && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {visitors.total} total entries
              </span>
            )}
          </div>

          {/* Visitors Table */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Page</th>
                    <th className="px-4 py-3 font-medium">Content</th>
                    <th className="px-4 py-3 font-medium">IP Address</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Device</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {visitors?.visitors?.map((v) => (
                    <tr key={v.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 text-xs whitespace-nowrap">{formatDateTime(v.timestamp)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          {PAGE_LABELS[v.page_type] || v.page_type || 'Post'}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate">
                        {v.resource_title || '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{v.ip_address || '—'}</td>
                      <td className="px-4 py-3 text-xs">
                        {v.country && v.city ? `${v.city}, ${v.country}` : v.country || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs max-w-[250px] truncate" title={v.user_agent}>
                        {v.user_agent ? v.user_agent.substring(0, 60) + '…' : '—'}
                      </td>
                    </tr>
                  ))}
                  {(!visitors?.visitors || visitors.visitors.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                        No visitor data yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {visitors && visitors.total_pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Page {visitors.page} of {visitors.total_pages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setVisitorPage(p => Math.max(1, p - 1))}
                    disabled={visitorPage <= 1}
                    className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setVisitorPage(p => Math.min(visitors.total_pages, p + 1))}
                    disabled={visitorPage >= visitors.total_pages}
                    className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ SESSIONS TAB ════════════════ */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {sessions && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {sessions.total} unique sessions tracked
            </p>
          )}

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-4 py-3 font-medium">IP Address</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Device</th>
                    <th className="px-4 py-3 font-medium text-right">Total Visits</th>
                    <th className="px-4 py-3 font-medium text-right">Pages</th>
                    <th className="px-4 py-3 font-medium">First Seen</th>
                    <th className="px-4 py-3 font-medium">Last Seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {sessions?.sessions?.map((s, i) => (
                    <tr key={i} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{s.ip_address || '—'}</td>
                      <td className="px-4 py-3 text-xs">
                        {s.country && s.city ? `${s.city}, ${s.country}` : s.country || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs">{s.device || '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold">{s.visit_count}</td>
                      <td className="px-4 py-3 text-right">{s.pages_viewed}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">{formatDateTime(s.first_seen)}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">{formatDateTime(s.last_seen)}</td>
                    </tr>
                  ))}
                  {(!sessions?.sessions || sessions.sessions.length === 0) && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                        No session data yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {sessions && sessions.total_pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Page {sessions.page} of {sessions.total_pages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSessionPage(p => Math.max(1, p - 1))}
                    disabled={sessionPage <= 1}
                    className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSessionPage(p => Math.min(sessions.total_pages, p + 1))}
                    disabled={sessionPage >= sessions.total_pages}
                    className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminAnalytics
