/**
 * Performance optimization hook for mobile web app
 * Provides utilities for improving navigation and rendering performance
 */

import { useCallback, useRef, useEffect } from 'react'

interface PerformanceMetrics {
  navigationStart: number
  loadComplete: number
  renderTime: number
}

export function usePerformance() {
  const metricsRef = useRef<PerformanceMetrics>({
    navigationStart: 0,
    loadComplete: 0,
    renderTime: 0
  })

  // Debounce function for expensive operations
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }, [])

  // Throttle function for frequent operations
  const throttle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }, [])

  // Optimized scroll handler
  const createOptimizedScrollHandler = useCallback((
    handler: (event: Event) => void,
    options: { passive?: boolean; throttleMs?: number } = {}
  ) => {
    const { passive = true, throttleMs = 16 } = options
    const throttledHandler = throttle(handler, throttleMs)
    
    return {
      handler: throttledHandler,
      options: { passive }
    }
  }, [throttle])

  // Measure navigation performance
  const measureNavigation = useCallback((pageName: string) => {
    const navigationStart = performance.now()
    metricsRef.current.navigationStart = navigationStart

    return {
      complete: () => {
        const loadComplete = performance.now()
        const renderTime = loadComplete - navigationStart
        
        metricsRef.current.loadComplete = loadComplete
        metricsRef.current.renderTime = renderTime

        // Log performance metrics in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`📊 Navigation Performance - ${pageName}:`, {
            renderTime: `${renderTime.toFixed(2)}ms`,
            isOptimal: renderTime < 100 ? '✅ Fast' : renderTime < 300 ? '⚠️ Moderate' : '❌ Slow'
          })
        }

        return { renderTime, isOptimal: renderTime < 100 }
      }
    }
  }, [])

  // Preload critical resources
  const preloadResource = useCallback((href: string, as: string = 'fetch') => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = href
      link.as = as
      document.head.appendChild(link)
    }
  }, [])

  // Optimize images for mobile
  const optimizeImage = useCallback((src: string, options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'avif' | 'auto'
  } = {}) => {
    const { width, height, quality = 80, format = 'auto' } = options
    
    // In a real app, you'd use a service like Cloudinary or Next.js Image Optimization
    // For now, return the original src with potential query parameters
    const params = new URLSearchParams()
    if (width) params.set('w', width.toString())
    if (height) params.set('h', height.toString())
    if (quality !== 80) params.set('q', quality.toString())
    if (format !== 'auto') params.set('f', format)
    
    const queryString = params.toString()
    return queryString ? `${src}?${queryString}` : src
  }, [])

  // Batch DOM updates
  const batchUpdates = useCallback((updates: (() => void)[]) => {
    requestAnimationFrame(() => {
      updates.forEach(update => update())
    })
  }, [])

  // Check if device has good performance capabilities
  const isHighPerformanceDevice = useCallback(() => {
    if (typeof window === 'undefined') return true
    
    // Check for hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 2
    
    // Check for device memory (if available)
    const memory = (navigator as any).deviceMemory || 4
    
    // Check for connection speed
    const connection = (navigator as any).connection
    const effectiveType = connection?.effectiveType || '4g'
    
    return cores >= 4 && memory >= 4 && ['4g', '5g'].includes(effectiveType)
  }, [])

  // Adaptive performance settings
  const getPerformanceSettings = useCallback(() => {
    const isHighPerf = isHighPerformanceDevice()
    
    return {
      animationDuration: isHighPerf ? 200 : 100,
      enableComplexAnimations: isHighPerf,
      maxConcurrentRequests: isHighPerf ? 6 : 3,
      cacheSize: isHighPerf ? 100 : 50,
      enablePrefetch: isHighPerf,
      throttleMs: isHighPerf ? 16 : 32
    }
  }, [isHighPerformanceDevice])

  return {
    debounce,
    throttle,
    createOptimizedScrollHandler,
    measureNavigation,
    preloadResource,
    optimizeImage,
    batchUpdates,
    isHighPerformanceDevice,
    getPerformanceSettings,
    metrics: metricsRef.current
  }
}

// Hook for measuring component render performance
export function useRenderPerformance(componentName: string) {
  const renderStartRef = useRef<number>(0)

  useEffect(() => {
    renderStartRef.current = performance.now()
  })

  useEffect(() => {
    const renderTime = performance.now() - renderStartRef.current
    
    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(`🐌 Slow render detected - ${componentName}: ${renderTime.toFixed(2)}ms`)
    }
  })
}

// Hook for optimizing list rendering
export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const totalHeight = items.length * itemHeight

  const getVisibleItems = useCallback((scrollTop: number) => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + visibleCount + overscan,
      items.length - 1
    )

    const visibleItems = items.slice(
      Math.max(0, startIndex - overscan),
      endIndex + 1
    )

    return {
      items: visibleItems,
      startIndex: Math.max(0, startIndex - overscan),
      offsetY: Math.max(0, startIndex - overscan) * itemHeight
    }
  }, [items, itemHeight, visibleCount, overscan])

  return {
    totalHeight,
    getVisibleItems
  }
}