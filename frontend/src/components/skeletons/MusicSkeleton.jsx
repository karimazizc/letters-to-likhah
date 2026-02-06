import { SkeletonBlock, SkeletonCircle } from './Skeleton'

function TrackCardSkeleton() {
  return (
    <div className="py-6 border-b border-gray-100 dark:border-gray-800">
      <div className="flex gap-4">
        {/* Cover */}
        <SkeletonBlock className="w-16 h-16 flex-shrink-0 !rounded-lg" />
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="h-4 w-3/5 mb-2" />
              <SkeletonBlock className="h-3 w-2/5" />
            </div>
            <SkeletonBlock className="h-3 w-10 flex-shrink-0" />
          </div>
          <SkeletonBlock className="h-3 w-24 mt-3" />
        </div>
      </div>
    </div>
  )
}

export function MusicPageSkeleton({ count = 6 }) {
  return (
    <div>
      {/* Hero skeleton: vinyl + info */}
      <div className="py-10 flex flex-col md:flex-row items-center gap-8">
        {/* Vinyl placeholder */}
        <SkeletonCircle size="w-44 h-44 md:w-52 md:h-52 flex-shrink-0" />
        <div className="text-center md:text-left w-full max-w-xs">
          <SkeletonBlock className="h-7 w-24 mb-3 mx-auto md:mx-0" />
          <SkeletonBlock className="h-4 w-48 mx-auto md:mx-0" />
          <SkeletonBlock className="h-3 w-32 mt-4 mx-auto md:mx-0" />
        </div>
      </div>
      {/* Track list */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {Array.from({ length: count }).map((_, i) => (
          <TrackCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export default TrackCardSkeleton
