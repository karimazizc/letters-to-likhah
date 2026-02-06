import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Image, Video } from 'lucide-react'
import { galleryApi, formatDate } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

function AdminGallery() {
  const [mediaItems, setMediaItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    url: '',
    thumbnail_url: '',
    caption: '',
    media_type: 'image',
  })
  const [saving, setSaving] = useState(false)

  const fetchMedia = async () => {
    try {
      const data = await galleryApi.getAll(200, 0)
      setMediaItems(data.media || [])
    } catch (err) {
      console.error('Failed to fetch gallery:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [])

  const openCreateModal = () => {
    setEditingItem(null)
    setFormData({ url: '', thumbnail_url: '', caption: '', media_type: 'image' })
    setShowModal(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setFormData({
      url: item.url || '',
      thumbnail_url: item.thumbnail_url || '',
      caption: item.caption || '',
      media_type: item.media_type || 'image',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingItem(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.url.trim()) {
      alert('Media URL is required')
      return
    }

    setSaving(true)

    try {
      if (editingItem) {
        await galleryApi.update(editingItem.id, formData)
      } else {
        await galleryApi.create(formData)
      }
      closeModal()
      fetchMedia()
    } catch (err) {
      console.error('Failed to save media:', err)
      alert('Failed to save media')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this media item?')) return
    try {
      await galleryApi.delete(id)
      fetchMedia()
    } catch (err) {
      console.error('Failed to delete media:', err)
      alert('Failed to delete media')
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Gallery</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Photo & video gallery</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Media
        </button>
      </header>

      {mediaItems.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
          <p className="text-gray-500 dark:text-gray-400">No media yet</p>
          <button onClick={openCreateModal} className="mt-4 text-gray-900 dark:text-white underline">
            Add your first photo or video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mediaItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative">
                {item.media_type === 'video' ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : item.url ? (
                  <img
                    src={item.thumbnail_url || item.url}
                    alt={item.caption || ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-black/50 text-white flex items-center gap-1">
                    {item.media_type === 'video' ? <Video className="w-3 h-3" /> : <Image className="w-3 h-3" />}
                    {item.media_type}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {item.caption || 'No caption'}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(item.created_at)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingItem ? 'Edit Media' : 'Add Media'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Media Type
                </label>
                <select
                  value={formData.media_type}
                  onChange={(e) => setFormData({ ...formData, media_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 focus:outline-none"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Media URL *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 focus:outline-none"
                  placeholder="https://example.com/photo.jpg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 focus:outline-none"
                  placeholder="https://example.com/photo-thumb.jpg"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Optional smaller image for grid display</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Caption
                </label>
                <textarea
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 focus:outline-none resize-none"
                  rows={3}
                  placeholder="Describe this photo or video..."
                />
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
                  {saving ? 'Saving...' : editingItem ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminGallery