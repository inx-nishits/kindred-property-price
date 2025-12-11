/**
 * Performance utilities for optimizing animations
 */

/**
 * Throttle function to limit how often a function can be called
 */
export function throttle(func, limit) {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Debounce function to delay execution until after wait time
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Check if device supports hardware acceleration
 */
export function supportsHardwareAcceleration() {
  return (
    'transform' in document.documentElement.style &&
    'perspective' in document.documentElement.style
  )
}

/**
 * Get optimal animation duration based on device performance
 */
export function getOptimalDuration(baseDuration, isLowEndDevice) {
  if (isLowEndDevice) {
    return baseDuration * 0.6 // Reduce duration on low-end devices
  }
  return baseDuration
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

