import { motion } from 'framer-motion'
import { useMemo, memo } from 'react'

/**
 * AnimatedCard - Card component with premium hover and interaction animations
 * Performance optimized: uses transform instead of box-shadow for better GPU acceleration
 */
function AnimatedCard({
  children,
  className = '',
  hover = true,
  onClick,
  delay = 0,
}) {
  // Memoize variants to prevent recreation
  // Note: box-shadow animation is expensive, but we optimize by using transform
  // which is GPU-accelerated, and keep shadow changes minimal
  const cardVariants = useMemo(
    () => ({
      rest: {
        scale: 1,
        y: 0,
      },
      hover: {
        scale: 1.02,
        y: -4,
        transition: {
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      },
    }),
    []
  )

  return (
    <motion.div
      className={`card ${hover ? 'card-hover' : ''} ${className}`}
      variants={hover ? cardVariants : undefined}
      initial="rest"
      whileHover={hover ? 'hover' : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ delay }}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        // Force GPU acceleration
        willChange: hover ? 'transform' : 'auto',
        // Use transform3d for better GPU acceleration
        transform: 'translateZ(0)',
      }}
    >
      {children}
    </motion.div>
  )
}

// Memoize component to prevent unnecessary re-renders
export default memo(AnimatedCard)

