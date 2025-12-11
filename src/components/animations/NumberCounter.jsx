import { useEffect, useState, useRef, useCallback, useMemo, memo } from 'react'
import { useInView } from 'framer-motion'

/**
 * NumberCounter - Smooth count-up animation for numbers, prices, and stats
 * Performance optimized with proper cleanup and memoization
 */
function NumberCounter({
  value,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  formatter,
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [displayValue, setDisplayValue] = useState(0)
  const animationFrameRef = useRef(null)
  const startTimeRef = useRef(null)

  // Memoize format function to avoid recreation on every render
  const formatValue = useCallback(
    (val) => {
      if (formatter) {
        return formatter(val)
      }
      const fixed = val.toFixed(decimals)
      // Add comma separators for thousands
      return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    [formatter, decimals]
  )

  useEffect(() => {
    if (isInView) {
      startTimeRef.current = Date.now()
      const startValue = 0

      const animate = () => {
        if (!startTimeRef.current) return

        const elapsed = Date.now() - startTimeRef.current
        const progress = Math.min(elapsed / duration, 1)

        // Easing function for smooth animation
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
        const easedProgress = easeOutCubic(progress)

        const currentValue = startValue + (value - startValue) * easedProgress
        setDisplayValue(currentValue)

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate)
        } else {
          setDisplayValue(value)
          animationFrameRef.current = null
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Cleanup function to cancel animation on unmount or dependency change
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      startTimeRef.current = null
    }
  }, [isInView, value, duration])

  // Memoize formatted display value
  const formattedValue = useMemo(
    () => formatValue(displayValue),
    [displayValue, formatValue]
  )

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  )
}

// Memoize component to prevent unnecessary re-renders
export default memo(NumberCounter)

