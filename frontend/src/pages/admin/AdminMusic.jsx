import { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, Trash2, X, Music, Play, Pause } from 'lucide-react'
import { musicApi, formatDate } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

function AdminMusic() {
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTrack, setEditingTrack] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    audio_url: '',
    cover_url: '',
    duration: 0,
    is_active: true,
  })
  const [saving, setSaving] = useState(false)
  const [playingId, setPlayingId] = useState(null)
  const audioRef = useRef(null)

  const fetchTracks = async () => {
    try {
      const data = await musicApi.getAll()
      setTracks(data.tracks || [])
    } catch (err) {
      console.error('Failed to fetch tracks:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTracks()
    return () => {
      if (audioRef.current) audioRef.current.pause()
    }
  }, [])

  const openCreateModal = () => {
    setEditingTrack(null)
    setFormData({ title: '', artist: '', audio_url: '', cover_url: '', duration: 0, is_active: true })
    setShowModal(true)
  }

  const openEditModal = (track) => {
    setEditingTrack(track)
    setFormData({
      title: track.title,
      artist: track.artist,
      audio_url: track.audio_url || '',
      cover_url: track.cover_url || '',
      duration: track.duration || 0,
      is_active: track.is_active,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingTrack(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.artist.trim()) {
      alert('Title and artist are required')
      return
    }
    if (!formData.audio_url.trim()) {
      alert('Audio URL is required')
      return
    }

    setSaving(true)

    try {
      if (editingTrack) {
        await musicApi.update(editingTrack.id, formData)
      } else {
        await musicApi.create(formData)
      }
      closeModal()
      fetchTracks()
    } catch (err) {
      console.error('Failed to save track:', err)
      alert('Failed to save track')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this track?')) return
    try {
      await musicApi.delete(id)
      fetchTracks()
    } catch (err) {
      console.error('Failed to delete track:', err)
      alert('Failed to delete track')
    }
  }

  const toggleActive = async (track) => {
    try {
      await musicApi.update(track.id, { ...track, is_active: !track.is_active })
      fetchTracks()
    } catch (err) {
      console.error('Failed to update track:', err)
    }
  }

  const togglePlay = (track) => {
    if (playingId === track.id) {
      audioRef.current?.pause()
      setPlayingId(null)
    } else {
      if (audioRef.current) audioRef.current.pause()
      const audio = new Audio(track.audio_url)
      audio.play()
      audio.onended = () => setPlayingId(null)
      audioRef.current = audio
      setPlayingId(track.id)
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Music</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Manage tracks and songs</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Track
        </button>
      </header>

      {tracks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
          <p className="text-gray-500 dark:text-gray-400">No tracks yet</p>
          <button onClick={openCreateModal} className="mt-4 text-gray-900 dark:text-white underline">
            Add your first song
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {tracks.map((track) => (
              <div key={track.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex items-center gap-4">
                  {/* Cover */}
                  <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    {track.cover_url ? (
                      <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{track.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{track.artist}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`inline-flex items-center text-xs ${track.is_active ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {track.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDuration(track.duration)}
                      </span>
                      {track.audio_url && (
                        <button
                          onClick={() => togglePlay(track)}
                          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {playingId === track.id ? (
                            <><Pause className="w-3 h-3" /> Pause</>
                          ) : (
                            <><Play className="w-3 h-3" /> Play</>
                          )}
                        </button>
                      )}
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(track.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleActive(track)}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors ${track.is_active ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                      {track.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => openEditModal(track)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(track.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingTrack ? 'Edit Track' : 'New Track'}
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
                  placeholder="Song title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Artist *
                </label>
                <input
                  type="text"
                  value={formData.artist}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 focus:outline-none"
                  placeholder="Artist name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Audio URL *
                </label>
                <input
                  type="url"
                  value={formData.audio_url}
                  onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 focus:outline-none"
                  placeholder="https://example.com/song.mp3"
                  required
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Direct link to the audio file (MP3, WAV, OGG)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={formData.cover_url}
                  onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 focus:outline-none"
                  placeholder="https://example.com/cover.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 focus:outline-none"
                  placeholder="180"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">
                  Active (visible to visitors)
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
                  {saving ? 'Saving...' : editingTrack ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMusic