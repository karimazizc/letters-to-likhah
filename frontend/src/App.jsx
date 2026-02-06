import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

// Skeleton fallbacks
import { PostListSkeleton, MessageListSkeleton, MusicPageSkeleton, MemoriesPageSkeleton, MessageDetailSkeleton } from './components/skeletons'

// ── Public pages: lazy-loaded ─────────────────────────────────────────
const Home = lazy(() => import('./pages/Home'))
const Messages = lazy(() => import('./pages/Messages'))
const MessageDetail = lazy(() => import('./pages/MessageDetail'))
const MusicPage = lazy(() => import('./pages/MusicPage'))
const Memories = lazy(() => import('./pages/Memories'))

// ── Admin pages: lazy-loaded (heavy, tiptap editor, recharts, etc.) ───
const Login = lazy(() => import('./pages/admin/Login'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminPosts = lazy(() => import('./pages/admin/AdminPosts'))
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'))
const AdminMusic = lazy(() => import('./pages/admin/AdminMusic'))
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))

// Tiny generic fallback for admin
function AdminFallback() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
    </div>
  )
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Suspense fallback={<PostListSkeleton count={5} />}><Home /></Suspense>} />
        <Route path="message" element={<Suspense fallback={<MessageListSkeleton count={4} />}><Messages /></Suspense>} />
        <Route path="message/:slug" element={<Suspense fallback={<MessageDetailSkeleton />}><MessageDetail /></Suspense>} />
        <Route path="music" element={<Suspense fallback={<MusicPageSkeleton count={6} />}><MusicPage /></Suspense>} />
        <Route path="memories" element={<Suspense fallback={<MemoriesPageSkeleton count={12} />}><Memories /></Suspense>} />
      </Route>

      {/* Auth Routes */}
      <Route path="/admin/login" element={<Suspense fallback={<AdminFallback />}><Login /></Suspense>} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Suspense fallback={<AdminFallback />}><Dashboard /></Suspense>} />
        <Route path="posts" element={<Suspense fallback={<AdminFallback />}><AdminPosts /></Suspense>} />
        <Route path="messages" element={<Suspense fallback={<AdminFallback />}><AdminMessages /></Suspense>} />
        <Route path="music" element={<Suspense fallback={<AdminFallback />}><AdminMusic /></Suspense>} />
        <Route path="gallery" element={<Suspense fallback={<AdminFallback />}><AdminGallery /></Suspense>} />
        <Route path="analytics" element={<Suspense fallback={<AdminFallback />}><AdminAnalytics /></Suspense>} />
      </Route>
    </Routes>
  )
}

export default App
