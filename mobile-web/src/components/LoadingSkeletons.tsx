'use client'

import { motion } from 'framer-motion'

// Base skeleton component with shimmer effect
const SkeletonBase = ({ className = '', children }: { className?: string; children?: React.ReactNode }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}>
    {children}
  </div>
)

// Shimmer effect overlay
const ShimmerOverlay = () => (
  <motion.div
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
    initial={{ x: '-100%' }}
    animate={{ x: '100%' }}
    transition={{
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear'
    }}
  />
)

// Work Order Card Skeleton
export function WorkOrderCardSkeleton() {
  return (
    <div className="card-mobile relative overflow-hidden">
      <ShimmerOverlay />
      
      {/* Priority bar */}
      <SkeletonBase className="absolute top-0 left-0 right-0 h-1" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pt-2">
        <div className="flex items-center space-x-3 flex-1">
          <SkeletonBase className="w-10 h-10 rounded-lg" />
          <div className="flex-1">
            <SkeletonBase className="h-4 w-24 mb-2" />
            <SkeletonBase className="h-3 w-32" />
          </div>
        </div>
        <SkeletonBase className="h-6 w-16 rounded-full" />
      </div>
      
      {/* Content */}
      <div className="space-y-2 mb-3">
        <SkeletonBase className="h-3 w-full" />
        <SkeletonBase className="h-3 w-3/4" />
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between">
        <SkeletonBase className="h-3 w-20" />
        <div className="flex items-center space-x-2">
          <SkeletonBase className="w-6 h-6 rounded-full" />
          <SkeletonBase className="w-6 h-6 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// Asset Card Skeleton
export function AssetCardSkeleton() {
  return (
    <div className="card-mobile relative overflow-hidden">
      <ShimmerOverlay />
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <SkeletonBase className="w-12 h-12 rounded-xl" />
          <div className="flex-1">
            <SkeletonBase className="h-4 w-20 mb-2" />
            <SkeletonBase className="h-3 w-28" />
          </div>
        </div>
        <SkeletonBase className="h-6 w-18 rounded" />
      </div>
      
      {/* Technical specs */}
      <div className="space-y-2">
        <SkeletonBase className="h-3 w-full" />
        <SkeletonBase className="h-3 w-2/3" />
        <SkeletonBase className="h-3 w-1/2" />
      </div>
    </div>
  )
}

// Dashboard Stats Skeleton
export function DashboardStatsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card-mobile relative overflow-hidden">
          <ShimmerOverlay />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <SkeletonBase className="w-12 h-12 rounded-xl" />
              <div className="flex-1">
                <SkeletonBase className="h-4 w-32 mb-2" />
                <SkeletonBase className="h-3 w-20" />
              </div>
            </div>
            <SkeletonBase className="w-5 h-5" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Search Results Skeleton
export function SearchResultsSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 bg-white rounded-lg relative overflow-hidden">
          <ShimmerOverlay />
          <SkeletonBase className="w-10 h-10 rounded-lg flex-shrink-0" />
          <div className="flex-1">
            <SkeletonBase className="h-4 w-24 mb-1" />
            <SkeletonBase className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  )
}

// List Item Skeleton (generic)
export function ListItemSkeleton({ showAvatar = true, lines = 2 }: { showAvatar?: boolean; lines?: number }) {
  return (
    <div className="flex items-center space-x-3 p-4 bg-white rounded-lg relative overflow-hidden">
      <ShimmerOverlay />
      
      {showAvatar && <SkeletonBase className="w-10 h-10 rounded-full flex-shrink-0" />}
      
      <div className="flex-1 space-y-2">
        {[...Array(lines)].map((_, i) => (
          <SkeletonBase 
            key={i} 
            className={`h-3 ${i === 0 ? 'w-3/4' : i === lines - 1 ? 'w-1/2' : 'w-full'}`} 
          />
        ))}
      </div>
    </div>
  )
}

// Page Loading Skeleton
export function PageLoadingSkeleton({ type = 'list' }: { type?: 'list' | 'grid' | 'dashboard' }) {
  if (type === 'dashboard') {
    return (
      <div className="space-y-6 p-4">
        {/* Welcome card skeleton */}
        <div className="card-mobile text-center relative overflow-hidden">
          <ShimmerOverlay />
          <SkeletonBase className="w-16 h-16 rounded-full mx-auto mb-4" />
          <SkeletonBase className="h-6 w-48 mx-auto mb-2" />
          <SkeletonBase className="h-4 w-64 mx-auto mb-4" />
          <SkeletonBase className="h-6 w-32 mx-auto rounded-full" />
        </div>
        
        {/* Stats skeleton */}
        <DashboardStatsSkeleton />
      </div>
    )
  }

  if (type === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-4 p-4">
        {[...Array(6)].map((_, i) => (
          <AssetCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Default list type
  return (
    <div className="space-y-4 p-4">
      {[...Array(8)].map((_, i) => (
        <WorkOrderCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Loading state with message
export function LoadingState({ 
  message = 'Loading...', 
  submessage,
  showSpinner = true 
}: { 
  message?: string
  submessage?: string
  showSpinner?: boolean 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {showSpinner && (
        <motion.div
          className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{message}</h3>
      {submessage && (
        <p className="text-sm text-gray-500 text-center">{submessage}</p>
      )}
    </div>
  )
}

// Empty state component
export function EmptyState({ 
  icon: Icon,
  title,
  description,
  action
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">{description}</p>
      
      {action && (
        <motion.button
          onClick={action.onClick}
          className="btn-primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
}

export default {
  WorkOrderCardSkeleton,
  AssetCardSkeleton,
  DashboardStatsSkeleton,
  SearchResultsSkeleton,
  ListItemSkeleton,
  PageLoadingSkeleton,
  LoadingState,
  EmptyState
}