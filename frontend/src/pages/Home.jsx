import { useState, useEffect, useCallback } from 'react'
import { analyticsApi, getSessionId, postsApi } from '../services/api'
import { usePosts } from '../hooks/useQueryData'
import PostCard from '../components/PostCard'
import { PostListSkeleton } from '../components/skeletons'

function Home() {
  const [page, setPage] = useState(1)
  const [allPosts, setAllPosts] = useState([])
  const [loadingMore, setLoadingMore] = useState(false)

  // First page is React-Query cached
  const { data, isLoading, error, refetch } = usePosts(1, 20)

  // Seed allPosts from cached first page
  useEffect(() => {
    if (data?.posts) {
      setAllPosts(data.posts)
      setPage(1)
    }
  }, [data])

  // Analytics – fire once
  useEffect(() => {
    analyticsApi.track('home', null, getSessionId())
  }, [])

  const totalPages = data?.total_pages ?? 1

  const loadMore = useCallback(async () => {
    if (loadingMore || page >= totalPages) return
    setLoadingMore(true)
    try {
      const next = page + 1
      const more = await postsApi.getAll(next, 20, false)
      setAllPosts((prev) => [...prev, ...more.posts])
      setPage(next)
    } catch {
      // silently ignore
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, page, totalPages])

  if (isLoading) return <PostListSkeleton count={5} />

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">Failed to load posts</p>
        <button
          onClick={() => refetch()}
          className="mt-4 text-gray-900 dark:text-white underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (allPosts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">No posts yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Check back soon for updates</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {allPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Load More */}
      {page < totalPages && (
        <div className="py-8 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
          >
            {loadingMore ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Home
