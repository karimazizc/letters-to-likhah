/**
 * API Client for Letters to Likhah - FastAPI Backend
 * All Spring Boot endpoints removed. Now targets FastAPI at port 10000.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000'

// ─── Helper: Auth Header ──────────────────────────────────────────────
function getAuthHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ─── Generic Fetch Wrapper ────────────────────────────────────────────
async function fetchApi(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers,
    },
  })

  if (!response.ok) {
    // Token expired or invalid — clear it and redirect to login
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token')
      window.location.href = '/admin/login'
      throw new Error('Session expired. Please log in again.')
    }
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
    throw new Error(error.detail || `HTTP error! status: ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

// ─── Auth API (password-only, no email/role) ──────────────────────────
export const authApi = {
  login: async (password) => {
    const response = await fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
    if (response.access_token) {
      localStorage.setItem('token', response.access_token)
    }
    return response
  },

  logout: () => {
    localStorage.removeItem('token')
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },
}

// ─── User Auth API (gate for public site) ─────────────────────────────
export const userAuthApi = {
  login: async (password) => {
    const response = await fetchApi('/api/auth/user-login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
    if (response.access_token) {
      localStorage.setItem('user_token', response.access_token)
    }
    return response
  },

  logout: () => {
    localStorage.removeItem('user_token')
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('user_token')
  },
}

// ─── Posts API ────────────────────────────────────────────────────────
// Response shape: { posts: [], total, page, page_size, total_pages }
// Post shape: { id, title, content, excerpt, published, created_at, updated_at, view_count }
export const postsApi = {
  getAll: async (page = 1, pageSize = 20, includeUnpublished = false) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      include_unpublished: includeUnpublished.toString(),
    })
    return fetchApi(`/api/posts?${params}`)
  },

  getById: async (id) => {
    return fetchApi(`/api/posts/${id}`)
  },

  create: async (data) => {
    return fetchApi('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id, data) => {
    return fetchApi(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id) => {
    return fetchApi(`/api/posts/${id}`, {
      method: 'DELETE',
    })
  },
}

// ─── Messages API ─────────────────────────────────────────────────────
// Response shape: { messages: [], total, page, page_size, total_pages }
// Message shape: { id, title, slug, content, excerpt, published, created_at, updated_at, view_count }
export const messagesApi = {
  getAll: async (page = 1, pageSize = 10, includeUnpublished = false) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      include_unpublished: includeUnpublished.toString(),
    })
    return fetchApi(`/api/messages?${params}`)
  },

  getById: async (id) => {
    return fetchApi(`/api/messages/${id}`)
  },

  getBySlug: async (slug) => {
    return fetchApi(`/api/messages/slug/${slug}`)
  },

  create: async (data) => {
    return fetchApi('/api/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id, data) => {
    return fetchApi(`/api/messages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id) => {
    return fetchApi(`/api/messages/${id}`, {
      method: 'DELETE',
    })
  },

  incrementView: async (id) => {
    return fetchApi(`/api/messages/${id}/view`, {
      method: 'POST',
    })
  },
}

// ─── Gallery API (replaces memoriesAPI) ───────────────────────────────
// Response shape: { media: [], total }
// GalleryMedia shape: { id, media_type, url, thumbnail_url, blur_placeholder, width, height, caption, order_index, created_at }
export const galleryApi = {
  getAll: async (limit = 50, offset = 0) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })
    return fetchApi(`/api/gallery?${params}`)
  },

  getById: async (id) => {
    return fetchApi(`/api/gallery/${id}`)
  },

  create: async (data) => {
    return fetchApi('/api/gallery', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id, data) => {
    return fetchApi(`/api/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id) => {
    return fetchApi(`/api/gallery/${id}`, {
      method: 'DELETE',
    })
  },

  reorder: async (order) => {
    return fetchApi('/api/gallery/reorder', {
      method: 'POST',
      body: JSON.stringify(order),
    })
  },
}

// ─── Music API (replaces vibesAPI) ────────────────────────────────────
// Response shape: { tracks: [], total }
// MusicTrack shape: { id, title, artist, audio_url, cover_url, duration, is_active, order_index, created_at }
export const musicApi = {
  getAll: async (limit = 50, offset = 0) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })
    return fetchApi(`/api/music?${params}`)
  },

  getActive: async () => {
    return fetchApi('/api/music/active')
  },

  getById: async (id) => {
    return fetchApi(`/api/music/${id}`)
  },

  create: async (data) => {
    return fetchApi('/api/music', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id, data) => {
    return fetchApi(`/api/music/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  setActive: async (id) => {
    return fetchApi(`/api/music/${id}/activate`, {
      method: 'PUT',
    })
  },

  delete: async (id) => {
    return fetchApi(`/api/music/${id}`, {
      method: 'DELETE',
    })
  },
}

// ─── Analytics API ────────────────────────────────────────────────────
export const analyticsApi = {
  track: async (pageType, resourceId, sessionId) => {
    try {
      await fetch(`${API_URL}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_type: pageType,
          resource_id: resourceId || null,
          post_id: pageType === 'post' ? resourceId : null,
          session_id: sessionId,
          referrer: document.referrer || null,
        }),
      })
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  },

  getStats: async (days = 30) => {
    const params = new URLSearchParams({ days: days.toString() })
    return fetchApi(`/api/analytics/stats?${params}`)
  },

  getVisitors: async (page = 1, pageSize = 50, pageType = null) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    if (pageType) params.set('page_type', pageType)
    return fetchApi(`/api/analytics/visitors?${params}`)
  },

  getSessions: async (page = 1, pageSize = 50) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    return fetchApi(`/api/analytics/sessions?${params}`)
  },
}

// ─── Session & Utility Helpers ────────────────────────────────────────
export function getSessionId() {
  let sessionId = sessionStorage.getItem('session_id')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem('session_id', sessionId)
  }
  return sessionId
}

export function formatDate(dateString) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatDateTime(dateString) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '')
}

export function truncate(str, length) {
  if (!str) return ''
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
