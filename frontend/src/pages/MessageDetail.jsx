import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { messagesApi, analyticsApi, getSessionId, formatDate } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

function MessageDetail() {
  const { slug } = useParams()
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const data = await messagesApi.getBySlug(slug)
        setMessage(data)

        // Track view
        if (data?.id) {
          try {
            await messagesApi.incrementView(data.id)
            analyticsApi.track('message', data.id, getSessionId())
          } catch {
            // Silently ignore view tracking errors
          }
        }
      } catch (err) {
        setError('Message not found')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMessage()
  }, [slug])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error || !message) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">{error || 'Message not found'}</p>
        <Link to="/message" className="mt-4 text-gray-900 dark:text-white underline block">
          Back to messages
        </Link>
      </div>
    )
  }

  return (
    <article className="py-6">
      {/* Back Link */}
      <Link
        to="/message"
        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        All messages
      </Link>

      {/* Header */}
      <header className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white leading-tight">
          {message.title}
        </h1>
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          {formatDate(message.created_at)}
        </p>
      </header>

      {/* Content */}
      <div 
        className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-serif prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-gray-900 dark:prose-a:text-gray-100 prose-a:underline prose-blockquote:border-l-gray-300 dark:prose-blockquote:border-l-gray-600 prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400 prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-ol:text-gray-700 dark:prose-ol:text-gray-300 prose-img:rounded-xl prose-video:rounded-xl"
        dangerouslySetInnerHTML={{ __html: message.content }}
      />
    </article>
  )
}

export default MessageDetail
