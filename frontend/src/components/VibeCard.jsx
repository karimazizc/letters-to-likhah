import { memo } from 'react'
import { Music, Play, Pause } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAudioPlayer } from '../context/AudioPlayerContext'

function TrackCard({ track, allTracks, index }) {
  const { title, artist, audio_url, cover_url, created_at, duration } = track
  const { currentTrack, isPlaying, playTrackAtIndex } = useAudioPlayer()

  const isCurrentTrack = currentTrack?.id === track.id
  const isCurrentlyPlaying = isCurrentTrack && isPlaying

  const handlePlay = () => {
    if (audio_url) {
      playTrackAtIndex(index)
    }
  }

  const formatDuration = (secs) => {
    if (!secs) return ''
    const mins = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${mins}:${s.toString().padStart(2, '0')}`
  }

  return (
    <article className="py-6 border-b border-gray-100 dark:border-gray-800 animate-fade-in">
      <div className="flex gap-4">
        {/* Cover Image with Play Button */}
        <button
          onClick={handlePlay}
          disabled={!audio_url}
          className="w-16 h-16 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden relative group disabled:cursor-not-allowed"
        >
          {cover_url ? (
            <img
              src={cover_url}
              alt={`${title} cover`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>
          )}
          
          {/* Play/Pause Overlay */}
          {audio_url && (
            <div className={`absolute inset-0 flex items-center justify-center transition-all ${
              isCurrentlyPlaying 
                ? 'bg-black/40' 
                : 'bg-black/0 group-hover:bg-black/40'
            }`}>
              <div className={`transition-all ${
                isCurrentlyPlaying 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'
              }`}>
                {isCurrentlyPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white ml-0.5" />
                )}
              </div>
            </div>
          )}

          {/* Now Playing Indicator */}
          {isCurrentlyPlaying && (
            <div className="absolute bottom-1 left-1 right-1">
              <div className="flex items-end justify-center gap-0.5 h-3">
                <div className="w-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms', height: '60%' }} />
                <div className="w-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms', height: '100%' }} />
                <div className="w-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms', height: '40%' }} />
              </div>
            </div>
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold truncate text-gray-900 dark:text-white">
                {title}
                {isCurrentlyPlaying && (
                  <span className="ml-2 text-xs font-normal text-green-600 dark:text-green-400">Now Playing</span>
                )}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{artist}</p>
            </div>
            {duration > 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums flex-shrink-0">
                {formatDuration(duration)}
              </span>
            )}
          </div>

          {/* Timestamp */}
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </article>
  )
}

export default memo(TrackCard)
