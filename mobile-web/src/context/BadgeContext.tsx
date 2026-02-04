'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

interface BadgeData {
  count: number | string
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple'
}

interface BadgeContextType {
  badges: Record<string, BadgeData>
  updateBadge: (key: string, data: BadgeData) => void
  clearBadge: (key: string) => void
  refreshBadges: () => Promise<void>
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined)

export function BadgeProvider({ children }: { children: ReactNode }) {
  const [badges, setBadges] = useState<Record<string, BadgeData>>({})

  const updateBadge = (key: string, data: BadgeData) => {
    setBadges(prev => ({
      ...prev,
      [key]: data
    }))
  }

  const clearBadge = (key: string) => {
    setBadges(prev => {
      const newBadges = { ...prev }
      delete newBadges[key]
      return newBadges
    })
  }

  const refreshBadges = async () => {
    try {
      // Fetch work orders counts
      const { data: workOrders, error: workOrdersError } = await supabase
        .from('work_orders')
        .select('id, status, priority, created_at')

      if (!workOrdersError && workOrders) {
        const openCount = workOrders.filter(wo => wo.status === 'New').length
        const urgentCount = workOrders.filter(wo => 
          wo.priority === 'High' && wo.status !== 'Completed'
        ).length
        
        // Update work orders badge
        if (urgentCount > 0) {
          updateBadge('work-orders', { count: urgentCount, color: 'red' })
        } else if (openCount > 0) {
          updateBadge('work-orders', { count: openCount, color: 'blue' })
        } else {
          clearBadge('work-orders')
        }
      }

      // Fetch assets counts
      const { data: assets, error: assetsError } = await supabase
        .from('vehicles')
        .select('id, is_emergency_bike')

      if (!assetsError && assets) {
        const emergencyCount = assets.filter(asset => asset.is_emergency_bike).length
        
        if (emergencyCount > 0) {
          updateBadge('assets', { count: emergencyCount, color: 'green' })
        } else {
          clearBadge('assets')
        }
      }

      // You can add more badge logic here for other tabs
      // For example, notifications, messages, etc.

    } catch (error) {
      console.error('Error refreshing badges:', error)
    }
  }

  // Refresh badges on mount and periodically
  useEffect(() => {
    refreshBadges()
    
    // Refresh badges every 30 seconds
    const interval = setInterval(refreshBadges, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Listen for real-time updates (if you have real-time subscriptions)
  useEffect(() => {
    const workOrdersSubscription = supabase
      .channel('work_orders_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'work_orders' },
        () => {
          // Refresh badges when work orders change
          setTimeout(refreshBadges, 1000) // Small delay to ensure data is updated
        }
      )
      .subscribe()

    const assetsSubscription = supabase
      .channel('vehicles_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        () => {
          // Refresh badges when assets change
          setTimeout(refreshBadges, 1000)
        }
      )
      .subscribe()

    return () => {
      workOrdersSubscription.unsubscribe()
      assetsSubscription.unsubscribe()
    }
  }, [])

  return (
    <BadgeContext.Provider value={{ badges, updateBadge, clearBadge, refreshBadges }}>
      {children}
    </BadgeContext.Provider>
  )
}

export function useBadges() {
  const context = useContext(BadgeContext)
  if (context === undefined) {
    throw new Error('useBadges must be used within a BadgeProvider')
  }
  return context
}

// Convenience hooks for specific badges
export function useWorkOrdersBadge() {
  const { badges } = useBadges()
  return badges['work-orders']
}

export function useAssetsBadge() {
  const { badges } = useBadges()
  return badges['assets']
}

export function useNotificationsBadge() {
  const { badges } = useBadges()
  return badges['notifications']
}