import { SkeletonBlock, SkeletonText } from './Skeleton'

function PostCardSkeleton() {
  return (
    <div className="py-6 border-b border-gray-100 dark:border-gray-800">
      {/* Title */}
      <SkeletonBlock className="h-5 w-3/4 mb-3" />
      {/* Excerpt lines */}
      <SkeletonText lines={3} className="mb-3" />
      {/* Meta row */}
      <div className="flex items-center gap-3 mt-3">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-3 w-12" />
        <div className="ml-auto">
          <SkeletonBlock className="h-3 w-10" />
        </div>
      </div>
    </div>
  )
}

export function PostListSkeleton({ count = 5 }) {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}

export default PostCardSkeleton
