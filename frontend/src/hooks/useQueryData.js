/**
 * Cached data-fetching hooks using TanStack React Query.
 *
 * Each hook wraps a raw API call and returns { data, isLoading, error, ... }.
 * Data is automatically cached by route key:
 *   - Revisiting a page instantly shows cached data.
 *   - Background refetch keeps data fresh (staleTime = 2 min).
 *   - Identical in-flight requests are deduplicated.
 */

import { useQuery } from '@tanstack/react-query'
import { postsApi, messagesApi, musicApi, galleryApi } from '../services/api'

// ── Posts (Home) ──────────────────────────────────────────────────────
export function usePosts(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['posts', page, pageSize],
    queryFn: () => postsApi.getAll(page, pageSize, false),
    keepPreviousData: true,           // smooth page transitions
    staleTime: 2 * 60 * 1000,
  })
}

// ── Messages ──────────────────────────────────────────────────────────
export function useMessages(page = 1, pageSize = 50) {
  return useQuery({
    queryKey: ['messages', page, pageSize],
    queryFn: () => messagesApi.getAll(page, pageSize, false),
    staleTime: 2 * 60 * 1000,
  })
}

// ── Single message by slug ────────────────────────────────────────────
export function useMessageBySlug(slug) {
  return useQuery({
    queryKey: ['message', slug],
    queryFn: () => messagesApi.getBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,        // message content changes less often
  })
}

// ── Music / Vibes ─────────────────────────────────────────────────────
export function useMusic() {
  return useQuery({
    queryKey: ['music'],
    queryFn: () => musicApi.getAll(),
    staleTime: 5 * 60 * 1000,
  })
}

// ── Memories / Gallery ────────────────────────────────────────────────
export function useMemories(limit = 100) {
  return useQuery({
    queryKey: ['memories', limit],
    queryFn: () => galleryApi.getAll(limit, 0),
    staleTime: 5 * 60 * 1000,
  })
}
