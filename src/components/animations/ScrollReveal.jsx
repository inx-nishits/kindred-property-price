import { memo } from 'react'

/**
 * ScrollReveal - Simple wrapper component (animations removed)
 * Just renders children normally
 */
function ScrollReveal({
  children,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  distance = 30,
  className = '',
  once = true,
}) {
  return <div className={className}>{children}</div>
}

// Memoize component to prevent unnecessary re-renders
export default memo(ScrollReveal)

