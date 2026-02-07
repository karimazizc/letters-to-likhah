import { useState, useRef, useEffect, memo } from 'react'
import { ChevronDown } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { stripHtml, truncate, analyticsApi, getSessionId } from '../services/api'
import { useLazyImages } from '../hooks/useLazyImages'

function PostCard({ post }) {
  const { title, excerpt, content, created_at, view_count } = post
  const [expanded, setExpanded] = useState(false)
  const contentRef = useRef(null)
  const lazyRef = useLazyImages()
  const [contentHeight, setContentHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [content, expanded])

  const smartDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true })
    }
    return format(date, 'MMM d, yyyy')
  }

  const preview = excerpt || truncate(stripHtml(content), 180)

  return (
    <article className="py-6 border-b border-gray-100 dark:border-gray-800 animate-fade-in">
      {/* Clickable header */}
      <button
        onClick={() => {
          const next = !expanded
          setExpanded(next)
          if (next && post.id) {
            analyticsApi.track('post', post.id, getSessionId())
          }
        }}
        className="w-full text-left group cursor-pointer"
      >
        {/* Title */}
        {title && (
          <h2 className="font-serif text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
            {title}
          </h2>
        )}

        {/* Excerpt (only when collapsed) */}
        {!expanded && preview && (
          <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed line-clamp-3">
            {preview}
          </p>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center gap-3 text-sm text-gray-400 dark:text-gray-500">
          <span>{smartDate(created_at)}</span>
          {/* {view_count > 0 && (
            <span>· {view_count} {view_count === 1 ? 'view' : 'views'}</span>
          )} */}
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            {expanded ? 'Collapse' : 'Read'}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            />
          </span>
        </div>
      </button>

      {/* Expandable content */}
      <div
        className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
        style={{ maxHeight: expanded ? `${contentHeight}px` : '0px' }}
      >
        <div ref={contentRef} className="pt-5">
          {content && (
            <div
              ref={lazyRef}
              className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-serif prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-gray-900 dark:prose-a:text-gray-100 prose-a:underline prose-blockquote:border-l-gray-300 dark:prose-blockquote:border-l-gray-600 prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400 prose-img:rounded-xl prose-video:rounded-xl"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
      </div>
    </article>
  )
}

export default memo(PostCard)
