import { useState, useEffect } from 'react'
import { musicApi } from '../services/api'
import TrackCard from '../components/VibeCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAudioPlayer } from '../context/AudioPlayerContext'

function MusicPage() {
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { tracks: playerTracks } = useAudioPlayer()

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const data = await musicApi.getAll()
        setTracks(data.tracks || [])
      } catch (err) {
        setError('Failed to load music')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTracks()
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

  if (tracks.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">No music yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Music tracks will appear here</p>
      </div>
    )
  }

  // Filter tracks with audio for the playlist
  const playableTracks = tracks.filter(t => t.audio_url && t.is_active)

  return (
    <div>
      <header className="py-8">
        <h1 className="font-serif text-2xl font-semibold text-gray-900 dark:text-white">Music</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Music that means something</p>
        {playableTracks.length > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {playableTracks.length} playable {playableTracks.length === 1 ? 'track' : 'tracks'}
          </p>
        )}
      </header>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {tracks.map((track, index) => {
          const playableIndex = playableTracks.findIndex(t => t.id === track.id)
          return (
            <TrackCard
              key={track.id}
              track={track}
              allTracks={playableTracks}
              index={playableIndex !== -1 ? playableIndex : 0}
            />
          )
        })}
      </div>
    </div>
  )
}

export default MusicPage
