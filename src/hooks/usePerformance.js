import { useState, useEffect, useMemo } from 'react'

/**
 * usePerformance - Hook to detect device performance and adjust animations accordingly
 * Helps maintain smooth performance on low-end devices
 */
export function usePerformance() {
  const [isLowEndDevice, setIsLowEndDevice] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    // Detect low-end device based on hardware concurrency and device memory
    const hardwareConcurrency = navigator.hardwareConcurrency || 4
    const deviceMemory = navigator.deviceMemory || 4

    // Consider device low-end if:
    // - Less than 4 CPU cores, OR
    // - Less than 4GB RAM, OR
    // - Connection is slow (2G/3G)
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection

    const isSlowConnection =
      connection &&
      (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g')

    const shouldReduceAnimations =
      hardwareConcurrency < 4 ||
      deviceMemory < 4 ||
      isSlowConnection

    setIsLowEndDevice(shouldReduceAnimations)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return useMemo(
    () => ({
      isLowEndDevice,
      prefersReducedMotion,
      shouldReduceAnimations: isLowEndDevice || prefersReducedMotion,
    }),
    [isLowEndDevice, prefersReducedMotion]
  )
}

