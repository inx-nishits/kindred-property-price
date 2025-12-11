import { useEffect, useState } from 'react'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

/**
 * useNumberCounter - Custom hook for smooth number counting animation
 * Returns the current animated value and a ref to attach to the element
 */
export function useNumberCounter({
  targetValue,
  duration = 2000,
  decimals = 0,
  startOnView = true,
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!startOnView || (startOnView && isInView)) {
      const startTime = Date.now()
      const startValue = 0

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Easing function for smooth animation
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
        const easedProgress = easeOutCubic(progress)

        const currentValue = startValue + (targetValue - startValue) * easedProgress
        setDisplayValue(currentValue)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setDisplayValue(targetValue)
        }
      }

      requestAnimationFrame(animate)
    }
  }, [targetValue, duration, decimals, isInView, startOnView])

  return { displayValue: displayValue.toFixed(decimals), ref }
}

