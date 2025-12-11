import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

/**
 * PageTransition - Smooth page transition wrapper
 * Provides elegant fade and slide transitions between routes
 */
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

function PageTransition({ children }) {
  const location = useLocation()

  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      style={{
        width: '100%',
        // GPU acceleration
        willChange: 'transform, opacity',
        transform: 'translateZ(0)',
      }}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition

