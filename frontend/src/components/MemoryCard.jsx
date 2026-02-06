import { useState } from 'react'

function MemoryCard({ memory }) {
  const { title, caption, mediaUrls, createdAt } = memory
  const [activeIndex, setActiveIndex] = useState(0)

  const hasMultipleMedia = mediaUrls && mediaUrls.length > 1

  return (
    <article className="animate-fade-in">
      {/* Media */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {mediaUrls && mediaUrls.length > 0 ? (
          <>
            {mediaUrls[activeIndex]?.includes('video') || 
             mediaUrls[activeIndex]?.endsWith('.mp4') || 
             mediaUrls[activeIndex]?.endsWith('.webm') ? (
              <video
                src={mediaUrls[activeIndex]}
                className="w-full h-full object-cover"
                controls
              />
            ) : (
              <img
                src={mediaUrls[activeIndex]}
                alt={title || caption || ''}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}

            {/* Dots Indicator */}
            {hasMultipleMedia && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {mediaUrls.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      index === activeIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-sm">No media</span>
          </div>
        )}
      </div>

      {/* Caption */}
      {(title || caption) && (
        <div className="p-4">
          {title && (
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          )}
          {caption && (
            <div 
              className="text-[15px] text-gray-600 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: caption }}
            />
          )}
        </div>
      )}
    </article>
  )
}

export default MemoryCard
