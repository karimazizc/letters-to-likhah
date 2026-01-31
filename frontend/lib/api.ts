/**
 * API Client for Letters to Likhah Backend
 * Handles all API requests with authentication and error handling
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Types
export interface Post {
  id: number
  title: string
  content: string
  excerpt: string | null
  published: boolean
  created_at: string
  updated_at: string
  view_count: number
}

export interface PostListResponse {
  posts: Post[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface PostCreate {
  title: string
  content: string
  excerpt?: string
  published?: boolean
}

export interface PostUpdate {
  title?: string
  content?: string
  excerpt?: string
  published?: boolean
}

export interface Visitor {
  id: number
  post_id: number | null
  post_title: string | null
  ip_address: string | null
  country: string | null
  city: string | null
  user_agent: string | null
  timestamp: string
}

export interface PostStats {
  post_id: number
  title: string
  view_count: number
  unique_visitors: number
}

export interface GeoStats {
  country: string
  count: number
}

export interface DailyStats {
  date: string
  views: number
}

export interface StatsResponse {
  total_views: number
  total_unique_visitors: number
  total_posts: number
  views_today: number
  views_this_week: number
  views_this_month: number
  posts_stats: PostStats[]
  geo_stats: GeoStats[]
  daily_stats: DailyStats[]
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

// Helper function to get auth header
function getAuthHeader(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
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
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
    throw new Error(error.detail || `HTTP error! status: ${response.status}`)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T
  }

  return response.json()
}

// Auth API
export const authApi = {
  login: async (password: string): Promise<AuthResponse> => {
    const response = await fetchApi<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
    
    // Store token
    if (typeof window !== 'undefined' && response.access_token) {
      localStorage.setItem('token', response.access_token)
    }
    
    return response
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('token')
  },
}

// Posts API
export const postsApi = {
  getAll: async (
    page: number = 1,
    pageSize: number = 10,
    includeUnpublished: boolean = false
  ): Promise<PostListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      include_unpublished: includeUnpublished.toString(),
    })
    return fetchApi<PostListResponse>(`/api/posts?${params}`)
  },

  getById: async (id: number): Promise<Post> => {
    return fetchApi<Post>(`/api/posts/${id}`)
  },

  create: async (data: PostCreate): Promise<Post> => {
    return fetchApi<Post>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: number, data: PostUpdate): Promise<Post> => {
    return fetchApi<Post>(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(`/api/posts/${id}`, {
      method: 'DELETE',
    })
  },
}

// Analytics API
export const analyticsApi = {
  track: async (postId?: number, sessionId?: string): Promise<void> => {
    await fetch(`${API_URL}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        post_id: postId,
        session_id: sessionId,
      }),
    })
  },

  getStats: async (): Promise<StatsResponse> => {
    return fetchApi<StatsResponse>('/api/analytics/stats')
  },

  getVisitors: async (page: number = 1, pageSize: number = 50): Promise<Visitor[]> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    return fetchApi<Visitor[]>(`/api/analytics/visitors?${params}`)
  },
}

// Session ID generator for analytics
export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  let sessionId = sessionStorage.getItem('session_id')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem('session_id', sessionId)
  }
  return sessionId
}

// Gallery Types
export interface GalleryMedia {
  id: number
  media_type: 'image' | 'video'
  url: string
  thumbnail_url: string | null
  caption: string | null
  order_index: number
  created_at: string
}

export interface GalleryMediaListResponse {
  media: GalleryMedia[]
  total: number
}

export interface GalleryMediaCreate {
  media_type: 'image' | 'video'
  url: string
  thumbnail_url?: string
  caption?: string
  order_index?: number
}

// Music Types
export interface MusicTrack {
  id: number
  title: string
  artist: string | null
  audio_url: string
  cover_url: string | null
  duration: number | null
  is_active: boolean
  order_index: number
  created_at: string
}

export interface MusicTrackListResponse {
  tracks: MusicTrack[]
  total: number
}

export interface MusicTrackCreate {
  title: string
  artist?: string
  audio_url: string
  cover_url?: string
  duration?: number
  is_active?: boolean
  order_index?: number
}

// Gallery API
export const galleryApi = {
  getAll: async (limit: number = 50, offset: number = 0): Promise<GalleryMediaListResponse> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })
    return fetchApi<GalleryMediaListResponse>(`/api/gallery?${params}`)
  },

  getById: async (id: number): Promise<GalleryMedia> => {
    return fetchApi<GalleryMedia>(`/api/gallery/${id}`)
  },

  create: async (data: GalleryMediaCreate): Promise<GalleryMedia> => {
    return fetchApi<GalleryMedia>('/api/gallery', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: number, data: Partial<GalleryMediaCreate>): Promise<GalleryMedia> => {
    return fetchApi<GalleryMedia>(`/api/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(`/api/gallery/${id}`, {
      method: 'DELETE',
    })
  },

  reorder: async (order: { id: number; order_index: number }[]): Promise<void> => {
    return fetchApi<void>('/api/gallery/reorder', {
      method: 'POST',
      body: JSON.stringify(order),
    })
  },
}

// Music API
export const musicApi = {
  getAll: async (limit: number = 50, offset: number = 0): Promise<MusicTrackListResponse> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })
    return fetchApi<MusicTrackListResponse>(`/api/music?${params}`)
  },

  getActive: async (): Promise<MusicTrack> => {
    return fetchApi<MusicTrack>('/api/music/active')
  },

  getById: async (id: number): Promise<MusicTrack> => {
    return fetchApi<MusicTrack>(`/api/music/${id}`)
  },

  create: async (data: MusicTrackCreate): Promise<MusicTrack> => {
    return fetchApi<MusicTrack>('/api/music', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: number, data: Partial<MusicTrackCreate>): Promise<MusicTrack> => {
    return fetchApi<MusicTrack>(`/api/music/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  setActive: async (id: number): Promise<MusicTrack> => {
    return fetchApi<MusicTrack>(`/api/music/${id}/activate`, {
      method: 'PUT',
    })
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(`/api/music/${id}`, {
      method: 'DELETE',
    })
  },
}
