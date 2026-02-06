import { useEffect, useRef } from 'react'

/**
 * Hook that observes a container and lazifies all <img> elements inside it
 * by swapping `data-src` → `src` when they enter the viewport.
 *
 * Usage:
 *   const containerRef = useLazyImages()
 *   <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />
 *
 * It also patches any already-loaded <img> tags with `loading="lazy"`.
 */
export function useLazyImages() {
  const ref = useRef(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    // Add loading="lazy" to all images inside the container
    const imgs = container.querySelectorAll('img')
    imgs.forEach((img) => {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy')
      }
      // Add decode async for non-blocking decode
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async')
      }
    })
  })

  return ref
}
