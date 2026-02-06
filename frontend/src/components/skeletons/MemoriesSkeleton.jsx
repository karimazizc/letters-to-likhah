import { SkeletonBlock } from './Skeleton'

function MemoryTileSkeleton() {
  return (
    <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
      <SkeletonBlock className="w-full h-full !rounded-none" />
    </div>
  )
}

export function MemoriesPageSkeleton({ count = 12 }) {
  return (
    <div>
      {/* Header */}
      <div className="py-8">
        <SkeletonBlock className="h-7 w-32 mb-3" />
        <SkeletonBlock className="h-4 w-48" />
      </div>
      {/* 3×3 grid */}
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: count }).map((_, i) => (
          <MemoryTileSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export default MemoryTileSkeleton
