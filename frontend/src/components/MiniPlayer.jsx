import { useAudioPlayer } from '../context/AudioPlayerContext'
import { Play, Pause, SkipBack, SkipForward, X, Volume2, VolumeX, Music } from 'lucide-react'
import { useState } from 'react'

function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    tracks,
    currentTrackIndex,
    togglePlay,
    stop,
    seekTo,
    setVolume,
    toggleMute,
    nextTrack,
    previousTrack,
  } = useAudioPlayer()

  const [showVolume, setShowVolume] = useState(false)

  // Don't render if no track
  if (!currentTrack) return null

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    seekTo(percent * duration)
  }

  const hasNext = currentTrackIndex < tracks.length - 1
  const hasPrevious = currentTrackIndex > 0 || currentTime > 3

  return (
    <div className="fixed left-0 right-0 bg-white/95 dark:bg-gray-900/95 mini-player border-t border-gray-200 dark:border-gray-700 shadow-lg z-40 bottom-16 md:bottom-0">
      {/* Progress bar (clickable) */}
      <div 
        className="h-1 bg-gray-100 dark:bg-gray-800 cursor-pointer group"
        onClick={handleProgressClick}
      >
        <div 
          className="h-full bg-gray-900 dark:bg-white transition-all duration-100 relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-900 dark:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
              {currentTrack.cover_url ? (
                <img
                  src={currentTrack.cover_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                {currentTrack.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={previousTrack}
              disabled={!hasPrevious}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              disabled={!hasNext}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Time & Volume */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums hidden sm:block">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Volume Control */}
            <div className="relative hidden sm:block">
              <button
                onClick={toggleMute}
                onContextMenu={(e) => { e.preventDefault(); setShowVolume(!showVolume) }}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              {showVolume && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-24 h-2 accent-gray-900 dark:accent-white volume-slider"
                  />
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={stop}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Close player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MiniPlayer
