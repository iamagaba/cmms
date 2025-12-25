'use client'

import { useState, useRef, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void
  refreshing: boolean
  children: React.ReactNode
  threshold?: number
}

export function PullToRefresh({ 
  onRefresh, 
  refreshing, 
  children, 
  threshold = 80 
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const startY = useRef(0)
  const currentY = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || refreshing) return

    currentY.current = e.touches[0].clientY
    const distance = Math.max(0, currentY.current - startY.current)
    
    if (distance > 0 && window.scrollY === 0) {
      e.preventDefault()
      setPullDistance(Math.min(distance, threshold * 1.5))
    }
  }, [isPulling, refreshing, threshold])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return

    setIsPulling(false)
    
    if (pullDistance >= threshold && !refreshing) {
      await onRefresh()
    }
    
    setPullDistance(0)
  }, [isPulling, pullDistance, threshold, refreshing, onRefresh])

  const pullProgress = Math.min(pullDistance / threshold, 1)
  const shouldTrigger = pullDistance >= threshold

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      {(isPulling || refreshing) && (
        <div 
          className="pull-refresh"
          style={{
            transform: `translateY(${Math.min(pullDistance, threshold)}px)`,
            opacity: pullProgress,
          }}
        >
          <RefreshCw 
            className={`w-5 h-5 ${
              refreshing ? 'animate-spin' : shouldTrigger ? 'text-primary-600' : 'text-gray-400'
            }`}
          />
          <span className="ml-2 text-sm">
            {refreshing ? 'Refreshing...' : shouldTrigger ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      )}
      
      {/* Content */}
      <div
        style={{
          transform: isPulling ? `translateY(${Math.min(pullDistance * 0.5, threshold * 0.5)}px)` : 'none',
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  )
}