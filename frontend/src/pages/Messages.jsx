import { useState, useEffect } from 'react'
import { messagesApi, analyticsApi, getSessionId } from '../services/api'
import MessageCard from '../components/MessageCard'
import LoadingSpinner from '../components/LoadingSpinner'

function Messages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await messagesApi.getAll(1, 50, false)
        setMessages(data.messages)
      } catch (err) {
        setError('Failed to load messages')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
    analyticsApi.track('message', null, getSessionId())
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">{error}</p>
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
