import { useEffect, useMemo } from 'react'
import { Music } from 'lucide-react'
import { analyticsApi, getSessionId } from '../services/api'
import { useMusic } from '../hooks/useQueryData'
import TrackCard from '../components/VibeCard'
import { MusicPageSkeleton } from '../components/skeletons'
import { useAudioPlayer } from '../context/AudioPlayerContext'

/* ── Vinyl Record Component ─────────────────────────────────────────── */
function Vinyl({ track, isPlaying }) {
  const hasCover = !!track?.cover_url

  return (
    <div className="relative w-44 h-44 md:w-52 md:h-52 flex-shrink-0">
      {/* Outer disc */}
      <div
        className={`w-full h-full rounded-full shadow-xl ${
          isPlaying ? 'vinyl-spinning' : 'vinyl-paused'
        }`}
        style={{
          background: `
            radial-gradient(circle at center,
              transparent 15%,
              rgba(0,0,0,0.03) 15.5%,
              transparent 16%,
              transparent 28%,
              rgba(0,0,0,0.02) 28.5%,
              transparent 29%,
              transparent 42%,
              rgba(0,0,0,0.02) 42.5%,
              transparent 43%,
              transparent 58%,
              rgba(0,0,0,0.02) 58.5%,
              transparent 59%,
              transparent 72%,
              rgba(0,0,0,0.02) 72.5%,
              transparent 73%
            ),
            conic-gradient(
              from 0deg,
              #1a1a1a 0deg,
              #2a2a2a 30deg,
              #1a1a1a 60deg,
              #222 90deg,
              #1a1a1a 120deg,
              #2a2a2a 150deg,
              #1a1a1a 180deg,
              #222 210deg,
              #1a1a1a 240deg,
              #2a2a2a 270deg,
              #1a1a1a 300deg,
              #222 330deg,
              #1a1a1a 360deg
            )
          `,
          boxShadow: isPlaying
            ? '0 0 40px rgba(0,0,0,0.3), inset 0 0 60px rgba(0,0,0,0.2)'
            : '0 0 20px rgba(0,0,0,0.15), inset 0 0 40px rgba(0,0,0,0.1)',
        }}
      >
        {/* Center label */}
        <div className="absolute inset-0 m-auto w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-gray-700 shadow-inner">
          {hasCover ? (
            <img
              src={track.cover_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
              <Music className="w-5 h-5 text-gray-400" />
            </div>
          )}
          {/* Spindle hole */}
          <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-gray-900 dark:bg-black border border-gray-600" />
        </div>

        {/* Sheen / highlight */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%, rgba(255,255,255,0.03) 100%)',
          }}
        />
      </div>
    </div>
  )
}

/* ── Music Page ─────────────────────────────────────────────────────── */
function MusicPage() {
  const { data, isLoading, error } = useMusic()
  const tracks = data?.tracks ?? []
  const { currentTrack, isPlaying } = useAudioPlayer()

  useEffect(() => {
    analyticsApi.track('music', null, getSessionId())
  }, [])

  const playableTracks = useMemo(
    () => tracks.filter(t => t.audio_url && t.is_active),
    [tracks],
  )

  if (isLoading) return <MusicPageSkeleton count={6} />

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">Failed to load music</p>
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

  return (
    <div>
      {/* ── Hero: vinyl + now-playing info ── */}
      <header className="py-10 flex flex-col md:flex-row items-center gap-8">
        <Vinyl track={currentTrack} isPlaying={isPlaying} />

        <div className="text-center md:text-left">
          <h1 className="font-serif text-2xl font-semibold text-gray-900 dark:text-white">
            Music
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Music that means something
          </p>

          {currentTrack && isPlaying ? (
            <div className="mt-4 flex items-center gap-2 justify-center md:justify-start">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {currentTrack.title}
              </span>
              <span className="text-sm text-gray-400 dark:text-gray-500">
                — {currentTrack.artist}
              </span>
            </div>
          ) : (
            <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
              {playableTracks.length} {playableTracks.length === 1 ? 'track' : 'tracks'} · pick one to spin the vinyl
            </p>
          )}
        </div>
      </header>

      {/* ── Track list ── */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {tracks.map((track) => {
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
