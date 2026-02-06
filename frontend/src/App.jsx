import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

// Public Pages
import Home from './pages/Home'
import Messages from './pages/Messages'
import MessageDetail from './pages/MessageDetail'
import MusicPage from './pages/MusicPage'
import Memories from './pages/Memories'

// Admin Pages
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import AdminPosts from './pages/admin/AdminPosts'
import AdminMessages from './pages/admin/AdminMessages'
import AdminMusic from './pages/admin/AdminMusic'
import AdminGallery from './pages/admin/AdminGallery'
import AdminAnalytics from './pages/admin/AdminAnalytics'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="message" element={<Messages />} />
        <Route path="message/:slug" element={<MessageDetail />} />
        <Route path="music" element={<MusicPage />} />
        <Route path="memories" element={<Memories />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/admin/login" element={<Login />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="posts" element={<AdminPosts />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="music" element={<AdminMusic />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>
    </Routes>
  )
}

export default App
