import { useState, useEffect, useCallback } from 'react'
import { analyticsApi, getSessionId } from '../services/api'
import { useMemories } from '../hooks/useQueryData'
import { MemoriesPageSkeleton } from '../components/skeletons'
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react'

function Memories() {
  const { data, isLoading, error } = useMemories(100)
  const media = data?.media ?? []
  const [lightbox, setLightbox] = useState({ open: false, currentIndex: 0 })

  useEffect(() => {
    analyticsApi.track('memories', null, getSessionId())
  }, [])

  const openLightbox = useCallback((index) => {
    setLightbox({ open: true, currentIndex: index })
  }, [])

  const closeLightbox = useCallback(() => {
    setLightbox({ open: false, currentIndex: 0 })
  }, [])

  const goToPrevious = useCallback(() => {
    setLightbox(prev => ({
      ...prev,
      currentIndex: prev.currentIndex > 0 ? prev.currentIndex - 1 : media.length - 1
    }))
  }, [media.length])

  const goToNext = useCallback(() => {
    setLightbox(prev => ({
      ...prev,
      currentIndex: prev.currentIndex < media.length - 1 ? prev.currentIndex + 1 : 0
    }))
  }, [media.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightbox.open) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightbox.open])

  const isVideo = (item) => {
    return item.media_type === 'video' || item.url?.endsWith('.mp4') || item.url?.endsWith('.webm') || item.url?.endsWith('.mov')
  }

  if (isLoading) return <MemoriesPageSkeleton count={12} />

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">Failed to load memories</p>
      </div>
    )
  }

  if (media.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">No memories yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Photos and videos will appear here</p>
      </div>
    )
  }

  const currentMedia = lightbox.open ? media[lightbox.currentIndex] : null

  return (
    <div>
      <header className="py-8">
        <h1 className="font-serif text-2xl font-semibold text-gray-900 dark:text-white">Memories</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Moments captured in time</p>
      </header>

      {/* 3x3 Grid Layout */}
      <div className="grid grid-cols-3 gap-1">
        {media.map((item, index) => (
          <button
            key={item.id}
            onClick={() => openLightbox(index)}
            className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden group focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-gray-950"
          >
            {isVideo(item) ? (
              <>
                {item.thumbnail_url ? (
                  <img
                    src={item.thumbnail_url}
                    alt={item.caption || ''}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                )}
                <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5">
                  <Play className="w-3 h-3 text-white fill-white" />
                </div>
              </>
            ) : (
              <img
                src={item.thumbnail_url || item.url}
                alt={item.caption || ''}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />

            {/* Caption overlay at bottom */}
            {item.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-3 pt-8">
                <p className="text-white text-sm font-medium truncate">
                  {item.caption}
                </p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightbox.open && currentMedia && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 text-white">
            <div className="flex-1">
              <h2 className="font-semibold">{currentMedia.caption || 'Untitled'}</h2>
              <p className="text-sm text-gray-400">
                {lightbox.currentIndex + 1} / {media.length}
              </p>
            </div>
            <button
              onClick={closeLightbox}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Media Container */}
          <div className="flex-1 flex items-center justify-center relative px-4 pb-4">
            {/* Previous Button */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            {/* Media */}
            <div className="max-w-full max-h-full flex items-center justify-center">
              {isVideo(currentMedia) ? (
                <video
                  key={currentMedia.url}
                  src={currentMedia.url}
                  className="max-w-full max-h-[calc(100vh-180px)] object-contain rounded-lg"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  key={currentMedia.url}
                  src={currentMedia.url}
                  alt={currentMedia.caption || ''}
                  className="max-w-full max-h-[calc(100vh-180px)] object-contain rounded-lg"
                />
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Caption */}
          {currentMedia.caption && (
            <div className="p-4 pt-0">
              <div className="text-gray-300 text-sm max-w-2xl mx-auto text-center">
                {currentMedia.caption}
              </div>
            </div>
          )}

          {/* Thumbnail Strip */}
          <div className="p-4 pt-2">
            <div className="flex gap-2 justify-center overflow-x-auto pb-2">
              {media.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightbox(prev => ({ ...prev, currentIndex: idx }))}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                    idx === lightbox.currentIndex
                      ? 'ring-2 ring-white opacity-100'
                      : 'opacity-50 hover:opacity-75'
                  }`}
                >
                  {isVideo(item) ? (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <img
                      src={item.thumbnail_url || item.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Memories
