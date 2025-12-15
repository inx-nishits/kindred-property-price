import { memo } from 'react'

/**
 * AnimatedCard - Simple card component (animations removed)
 * Just renders children normally
 */
function AnimatedCard({
  children,
  className = '',
  hover = true,
  onClick,
  delay = 0,
}) {
  return (
    <div
      className={`card ${hover ? 'card-hover' : ''} ${className}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {children}
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders
export default memo(AnimatedCard)

