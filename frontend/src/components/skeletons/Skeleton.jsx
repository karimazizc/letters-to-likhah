/**
 * Base skeleton primitives — lightweight, zero-dependency.
 * Every skeleton block is just a pulsing <div> styled via Tailwind.
 */

export function SkeletonBlock({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200 dark:bg-gray-800 ${className}`}
    />
  )
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock
          key={i}
          className={`h-3.5 ${i === lines - 1 ? 'w-3/5' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

export function SkeletonCircle({ size = 'w-10 h-10' }) {
  return <div className={`animate-pulse rounded-full bg-gray-200 dark:bg-gray-800 ${size}`} />
}
