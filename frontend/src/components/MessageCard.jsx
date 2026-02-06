import { Link } from 'react-router-dom'
import { formatDate, stripHtml, truncate } from '../services/api'

function MessageCard({ message }) {
  const { title, slug, content, excerpt, created_at } = message

  // Use excerpt if available, otherwise strip HTML from content
  const displayExcerpt = excerpt || truncate(stripHtml(content), 150)

  return (
    <Link to={`/message/${slug}`}>
      <article className="py-6 border-b border-gray-100 dark:border-gray-800 animate-fade-in hover:bg-gray-50 dark:hover:bg-gray-900/50 -mx-4 px-4 transition-colors">
        <h2 className="font-serif text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-[15px] leading-relaxed line-clamp-3">
          {displayExcerpt}
        </p>
        <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">
          {formatDate(created_at)}
        </p>
      </article>
    </Link>
  )
}

export default MessageCard
