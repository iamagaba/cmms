'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface OptimizedLoaderProps {
  isLoading: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
  delay?: number
  minDisplayTime?: number
}

export function OptimizedLoader({ 
  isLoading, 
  children, 
  fallback,
  delay = 0,
  minDisplayTime = 300
}: OptimizedLoaderProps) {
  const [showLoader, setShowLoader] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    let delayTimer: NodeJS.Timeout
    let minDisplayTimer: NodeJS.Timeout

    if (isLoading) {
      // Show loader after delay to prevent flash for quick loads
      delayTimer = setTimeout(() => {
        setShowLoader(true)
      }, delay)
    } else {
      // Hide loader and show content
      if (showLoader) {
        // Ensure loader is shown for minimum time for better UX
        minDisplayTimer = setTimeout(() => {
          setShowLoader(false)
          setShowContent(true)
        }, minDisplayTime)
      } else {
        setShowContent(true)
      }
    }

    return () => {
      clearTimeout(delayTimer)
      clearTimeout(minDisplayTimer)
    }
  }, [isLoading, delay, minDisplayTime, showLoader])

  if (isLoading && showLoader) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {fallback || <DefaultLoader />}
      </motion.div>
    )
  }

  if (showContent) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        {children}
      </motion.div>
    )
  }

  return null
}

function DefaultLoader() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-purple-600 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Skeleton loader for work order cards
export function WorkOrderSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="flex items-center justify-between">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-4"></div>
        </div>
      </div>
    </div>
  )
}

// Optimized skeleton for work order details
export function WorkOrderDetailsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="animate-pulse">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div className="h-5 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              {i % 2 === 0 && <div className="h-3 bg-gray-200 rounded w-1/2"></div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}