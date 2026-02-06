import { useState, useEffect } from 'react'
import { postsApi, analyticsApi, getSessionId } from '../services/api'
import PostCard from '../components/PostCard'
import LoadingSpinner from '../components/LoadingSpinner'

function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchPosts = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1 && !append) setLoading(true)
      else setLoadingMore(true)

      const data = await postsApi.getAll(pageNum, 20, false)

      if (append) {
        setPosts((prev) => [...prev, ...data.posts])
      } else {
        setPosts(data.posts)
      }

      setTotalPages(data.total_pages)
      setPage(pageNum)
    } catch (err) {
      setError('Failed to load posts')
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchPosts()
    analyticsApi.track('home', null, getSessionId())
  }, [])

  const loadMore = () => {
    if (!loadingMore && page < totalPages) {
      fetchPosts(page + 1, true)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">{error}</p>
        <button
          onClick={() => fetchPosts()}
          className="mt-4 text-gray-900 dark:text-white underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">No posts yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Check back soon for updates</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {posts.map((post) => (
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
