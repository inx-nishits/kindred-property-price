
/**
 * Skeleton loader component with shimmer effect
 */
function SkeletonLoader({ className = '', lines = 1, height = 'h-4' }) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`${height} bg-gray-200 rounded mb-2 ${
            index === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  )
}

/**
 * Property card skeleton
 */
export function PropertyCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-48 bg-gray-200 rounded-lg mb-4" />
      <SkeletonLoader lines={3} />
      <div className="flex gap-4 mt-4">
        <div className="h-6 w-20 bg-gray-200 rounded" />
        <div className="h-6 w-20 bg-gray-200 rounded" />
        <div className="h-6 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  )
}

/**
 * Text skeleton with shimmer
 */
export function TextSkeleton({ width = 'w-full', height = 'h-4' }) {
  return (
    <div className={`${width} ${height} bg-gray-200 rounded relative overflow-hidden animate-pulse`} />
  )
}

export default SkeletonLoader

