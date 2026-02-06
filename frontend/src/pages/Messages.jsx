import { useEffect } from 'react'
import { analyticsApi, getSessionId } from '../services/api'
import { useMessages } from '../hooks/useQueryData'
import MessageCard from '../components/MessageCard'
import { MessageListSkeleton } from '../components/skeletons'

function Messages() {
  const { data, isLoading, error } = useMessages(1, 50)
  const messages = data?.messages ?? []

  useEffect(() => {
    analyticsApi.track('message', null, getSessionId())
  }, [])

  if (isLoading) return <MessageListSkeleton count={4} />

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">Failed to load messages</p>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Personal letters will appear here</p>
      </div>
    )
  }

  return (
    <div>
      <header className="py-8">
        <h1 className="font-serif text-2xl font-semibold text-gray-900 dark:text-white">Messages</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Personal letters and longer thoughts</p>
      </header>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {messages.map((message) => (
          <MessageCard key={message.id} message={message} />
        ))}
      </div>
    </div>
  )
}

export default Messages
