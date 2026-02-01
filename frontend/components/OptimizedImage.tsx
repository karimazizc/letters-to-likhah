'use client'

import { useState, useEffect, memo } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  thumbnailSrc?: string | null
  blurPlaceholder?: string | null
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  onClick?: () => void
}

/**
 * OptimizedImage component with progressive loading.
 * Shows blur placeholder → thumbnail → full image
 */
function OptimizedImageComponent({
  src,
  thumbnailSrc,
  blurPlaceholder,
  alt,
  width,
  height,
  className,
  priority = false,
  onClick,
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState(thumbnailSrc || src)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showBlur, setShowBlur] = useState(!!blurPlaceholder)

  // Progressive loading: thumbnail → full image
  useEffect(() => {
    if (thumbnailSrc && thumbnailSrc !== src) {
      // Preload full image
      const img = new window.Image()
      img.src = src
      img.onload = () => {
        setCurrentSrc(src)
        setIsLoaded(true)
        setShowBlur(false)
      }
    } else {
      setIsLoaded(true)
    }
  }, [src, thumbnailSrc])

  // Handle load complete
  const handleLoadingComplete = () => {
    setIsLoaded(true)
    setShowBlur(false)
  }

  // Check if src is base64
  const isBase64 = src.startsWith('data:')

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-zinc-900',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Blur placeholder */}
      {showBlur && blurPlaceholder && (
        <div
          className="absolute inset-0 blur-xl scale-110 transition-opacity duration-300"
          style={{
            backgroundImage: `url(${blurPlaceholder})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Image */}
      {isBase64 ? (
        // For base64 images, use regular img tag
        <img
          src={currentSrc}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoadingComplete}
        />
      ) : (
        // For URL images, use Next.js Image
        <Image
          src={currentSrc}
          alt={alt}
          width={width || 800}
          height={height || 600}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          quality={85}
          onLoadingComplete={handleLoadingComplete}
        />
      )}

      {/* Loading shimmer */}
      {!isLoaded && !blurPlaceholder && (
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 animate-shimmer" />
      )}
    </div>
  )
}

// Memoize to prevent unnecessary re-renders
export const OptimizedImage = memo(OptimizedImageComponent)
export default OptimizedImage
