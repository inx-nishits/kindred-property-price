import { motion, useInView } from 'framer-motion'
import { useRef, useMemo, memo } from 'react'

/**
 * ScrollReveal - Component that animates children when they come into view
 * Performance optimized with GPU acceleration and memoization
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
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: '-100px' })

  // Memoize variants to prevent recreation on every render
  const variants = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
        x: direction === 'left' ? distance : direction === 'right' ? -distance : 0,
        scale: direction === 'scale' ? 0.9 : 1,
      },
      visible: {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        transition: {
          duration,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94], // Premium easing curve
        },
      },
    }),
    [direction, distance, duration, delay]
  )

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
      style={{
        // Force GPU acceleration
        willChange: isInView ? 'transform, opacity' : 'auto',
        transform: 'translateZ(0)', // Force hardware acceleration
      }}
    >
      {children}
    </motion.div>
  )
}

// Memoize component to prevent unnecessary re-renders
export default memo(ScrollReveal)

