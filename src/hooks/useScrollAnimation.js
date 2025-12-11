import { useInView } from 'framer-motion'
import { useRef } from 'react'

/**
 * useScrollAnimation - Custom hook for scroll-triggered animations
 * Returns animation state and ref to attach to elements
 */
export function useScrollAnimation({
  threshold = 0.1,
  once = true,
  margin = '-100px',
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, threshold, margin })

  return { ref, isInView }
}

