function LoadingSpinner({ size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div
        className={`${sizeClasses[size]} border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-white rounded-full animate-spin`}
      />
    </div>
  )
}

export default LoadingSpinner
