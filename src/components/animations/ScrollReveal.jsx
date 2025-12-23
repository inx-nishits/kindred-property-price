'use client'

/**
 * ScrollReveal - Simple wrapper component for scroll animations
 * Uses Framer Motion for smooth reveal effects
 */
import { motion } from 'framer-motion'

function ScrollReveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}

export default ScrollReveal
