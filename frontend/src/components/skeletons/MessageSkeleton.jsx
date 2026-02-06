import { SkeletonBlock, SkeletonText } from './Skeleton'

function MessageCardSkeleton() {
  return (
    <div className="py-6 border-b border-gray-100 dark:border-gray-800 -mx-4 px-4">
      {/* Title */}
      <SkeletonBlock className="h-6 w-2/3 mb-3" />
      {/* Excerpt */}
      <SkeletonText lines={2} className="mb-3" />
      {/* Date */}
      <SkeletonBlock className="h-3 w-28 mt-3" />
    </div>
  )
}

export function MessageListSkeleton({ count = 4 }) {
  return (
    <div>
      {/* Header skeleton */}
      <div className="py-8">
        <SkeletonBlock className="h-7 w-32 mb-3" />
        <SkeletonBlock className="h-4 w-56" />
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {Array.from({ length: count }).map((_, i) => (
          <MessageCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function MessageDetailSkeleton() {
  return (
    <div className="py-6">
      {/* Back link */}
      <SkeletonBlock className="h-4 w-28 mb-8" />
      {/* Title */}
      <SkeletonBlock className="h-9 w-4/5 mb-4" />
      {/* Date */}
      <SkeletonBlock className="h-4 w-36 mb-8" />
      {/* Content paragraphs */}
      <div className="space-y-5">
        <SkeletonText lines={4} />
        <SkeletonText lines={5} />
        <SkeletonText lines={3} />
      </div>
    </div>
  )
}

export default MessageCardSkeleton
