/**
 * Animation configuration for performance optimization
 * Adjust these values based on device performance
 */

// Framer Motion performance settings
export const motionConfig = {
  // Reduce layout animations for better performance
  layout: false,
  // Use transform instead of layout animations
  layoutDependency: false,
  // Optimize for performance
  transition: {
    type: 'tween',
    ease: [0.25, 0.46, 0.45, 0.94],
  },
}

// Animation durations (in milliseconds)
export const animationDurations = {
  fast: 200,
  normal: 300,
  slow: 600,
  pageTransition: 400,
}

// Easing functions for smooth animations
export const easing = {
  easeOut: [0.25, 0.46, 0.45, 0.94],
  easeIn: [0.42, 0, 1, 1],
  easeInOut: [0.42, 0, 0.58, 1],
}

// Performance thresholds
export const performanceThresholds = {
  // Reduce animations if device has less than this many CPU cores
  minCpuCores: 4,
  // Reduce animations if device has less than this much RAM (GB)
  minRam: 4,
  // Reduce animations on slow connections
  slowConnectionTypes: ['2g', 'slow-2g', '3g'],
}

