import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, X, ExternalLink } from 'lucide-react'
import { messagesApi, formatDate, stripHtml, truncate } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import RichTextEditor from '../../components/RichTextEditor'

function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMessage, setEditingMessage] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    published: false,
  })
  const [saving, setSaving] = useState(false)

  const fetchMessages = async () => {
    try {
      const data = await messagesApi.getAll(1, 100, true)
      setMessages(data.messages || [])
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const openCreateModal = () => {
    setEditingMessage(null)
    setFormData({ title: '', content: '', excerpt: '', published: false })
    setShowModal(true)
  }

  const openEditModal = (message) => {
    setEditingMessage(message)
    setFormData({
      title: message.title,
      content: message.content,
      excerpt: message.excerpt || '',
      published: message.published,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingMessage(null)
    setFormData({ title: '', content: '', excerpt: '', published: false })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Title and content are required')
      return
    }

    setSaving(true)

    try {
      if (editingMessage) {
        await messagesApi.update(editingMessage.id, formData)
      } else {
        await messagesApi.create(formData)
      }
      closeModal()
      fetchMessages()
    } catch (err) {
      console.error('Failed to save message:', err)
      alert('Failed to save message')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return
    try {
      await messagesApi.delete(id)
      fetchMessages()
    } catch (err) {
      console.error('Failed to delete message:', err)
      alert('Failed to delete message')
    }
  }

  const togglePublished = async (message) => {
    try {
      await messagesApi.update(message.id, {
        title: message.title,
        content: message.content,
        excerpt: message.excerpt,
        published: !message.published,
      })
      fetchMessages()
    } catch (err) {
      console.error('Failed to update message:', err)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Messages</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Long-form personal letters</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Message
        </button>
      </header>

      {messages.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
          <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
          <button onClick={openCreateModal} className="mt-4 text-gray-900 dark:text-white underline">
            Write your first message
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {messages.map((message) => (
              <div key={message.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{message.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                      {truncate(stripHtml(message.content), 100)}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`inline-flex items-center gap-1 text-xs ${message.published ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {message.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {message.published ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(message.created_at)}
                      </span>
                      {message.view_count > 0 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {message.view_count} views
                        </span>
                      )}
                      {message.published && message.slug && (
                        <a
                          href={`/message/${message.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePublished(message)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      title={message.published ? 'Unpublish' : 'Publish'}
                    >
                      {message.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openEditModal(message)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingMessage ? 'Edit Message' : 'New Message'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 focus:outline-none"
                  placeholder="Give your message a title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content *
                </label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(html) => setFormData({ ...formData, content: html })}
                  placeholder="Write your heartfelt message here..."
                  minHeight="300px"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Excerpt (optional)
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 focus:outline-none resize-none"
                  rows={2}
                  placeholder="Short summary for message cards"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="published" className="text-sm text-gray-700 dark:text-gray-300">
                  Publish immediately
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingMessage ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMessages
