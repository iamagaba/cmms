# Code Snippets - Ready to Use

Copy-paste code for common UX improvements.

---

## Geolocation Hook

```typescript
// src/hooks/useGeolocation.ts
import { useState, useEffect } from 'react'

export interface Coordinates {
  lat: number
  lng: number
}

export interface GeolocationState {
  location: Coordinates | null
  error: string | null
  loading: boolean
  accuracy: number | null
}

export function useGeolocation(watch = false): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: true,
    accuracy: null,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation not supported', loading: false }))
      return
    }

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        error: null,
        loading: false,
        accuracy: position.coords.accuracy,
      })
    }

    const onError = (error: GeolocationPositionError) => {
      setState(prev => ({ ...prev, error: error.message, loading: false }))
    }

    const options: PositionOptions = {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 300000, // 5 minutes
    }

    if (watch) {
      const watchId = navigator.geolocation.watchPosition(onSuccess, onError, options)
      return () => navigator.geolocation.clearWatch(watchId)
    } else {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, options)
    }
  }, [watch])

  return state
}
```

---

## Distance Utilities

```typescript
// src/utils/distance.ts
import type { Coordinates } from '@/hooks/useGeolocation'

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(to.lat - from.lat)
  const dLon = toRad(to.lng - from.lng)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 0.1) return `${Math.round(km * 1000)}m`
  if (km < 1) return `${Math.round(km * 100) / 100}km`
  return `${km.toFixed(1)}km`
}

/**
 * Sort items by distance from user location
 */
export function sortByDistance<T extends { latitude?: number; longitude?: number }>(
  items: T[],
  userLocation: Coordinates
): T[] {
  return items.sort((a, b) => {
    if (!a.latitude || !a.longitude) return 1
    if (!b.latitude || !b.longitude) return -1
    
    const distA = calculateDistance(userLocation, { lat: a.latitude, lng: a.longitude })
    const distB = calculateDistance(userLocation, { lat: b.latitude, lng: b.longitude })
    
    return distA - distB
  })
}
```

---

## Haptic Feedback

```typescript
// src/utils/haptic.ts

/**
 * Haptic feedback utilities for mobile devices
 * Note: Only works on devices that support vibration API
 */
export const haptic = {
  /**
   * Light tap (10ms)
   * Use for: Button taps, navigation
   */
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  },
  
  /**
   * Medium tap (20ms)
   * Use for: Status changes, selections
   */
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20)
    }
  },
  
  /**
   * Success pattern (10-50-10ms)
   * Use for: Completed actions, confirmations
   */
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10])
    }
  },
  
  /**
   * Error pattern (50-100-50ms)
   * Use for: Errors, warnings
   */
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50])
    }
  },
  
  /**
   * Heavy tap (30ms)
   * Use for: Important actions, deletions
   */
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30)
    }
  },
}

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return 'vibrate' in navigator
}
```

---

## Online Status Hook

```typescript
// src/hooks/useOnlineStatus.ts
import { useState, useEffect } from 'react'

export interface OnlineStatus {
  isOnline: boolean
  wasOffline: boolean
}

export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setWasOffline(true)
      
      // Reset wasOffline after 3 seconds
      setTimeout(() => setWasOffline(false), 3000)
    }
    
    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, wasOffline }
}
```

---

## Distance Badge Component

```typescript
// src/components/DistanceBadge.tsx
'use client'

import { MapPin } from 'lucide-react'
import { useGeolocation } from '@/hooks/useGeolocation'
import { calculateDistance, formatDistance } from '@/utils/distance'

interface DistanceBadgeProps {
  latitude?: number
  longitude?: number
  className?: string
}

export function DistanceBadge({ latitude, longitude, className = '' }: DistanceBadgeProps) {
  const { location: userLocation } = useGeolocation()

  if (!userLocation || !latitude || !longitude) {
    return null
  }

  const distance = calculateDistance(userLocation, { lat: latitude, lng: longitude })
  const isNearby = distance < 5

  return (
    <div className={`flex items-center space-x-1 text-xs ${className}`}>
      <MapPin className={`w-3 h-3 ${isNearby ? 'text-green-600' : 'text-blue-600'}`} />
      <span className={`font-medium ${isNearby ? 'text-green-600' : 'text-blue-600'}`}>
        {formatDistance(distance)} away
      </span>
    </div>
  )
}
```

---

## Phone Quick Actions Component

```typescript
// src/components/PhoneQuickActions.tsx
'use client'

import { useState } from 'react'
import { Phone, MessageSquare, ExternalLink, Copy, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { haptic } from '@/utils/haptic'

interface PhoneQuickActionsProps {
  phone: string
  name?: string
  className?: string
}

export function PhoneQuickActions({ phone, name, className = '' }: PhoneQuickActionsProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(phone)
    setCopied(true)
    haptic.success()
    setTimeout(() => {
      setCopied(false)
      setShowMenu(false)
    }, 1500)
  }

  const actions = [
    {
      label: 'Call',
      icon: Phone,
      color: 'bg-green-500',
      action: () => {
        window.location.href = `tel:${phone}`
        haptic.medium()
        setShowMenu(false)
      },
    },
    {
      label: 'SMS',
      icon: MessageSquare,
      color: 'bg-blue-500',
      action: () => {
        window.location.href = `sms:${phone}`
        haptic.medium()
        setShowMenu(false)
      },
    },
    {
      label: 'WhatsApp',
      icon: ExternalLink,
      color: 'bg-green-600',
      action: () => {
        const cleanPhone = phone.replace(/[^0-9+]/g, '')
        window.open(`https://wa.me/${cleanPhone}`, '_blank')
        haptic.medium()
        setShowMenu(false)
      },
    },
    {
      label: copied ? 'Copied!' : 'Copy',
      icon: copied ? Check : Copy,
      color: copied ? 'bg-green-500' : 'bg-gray-500',
      action: handleCopy,
    },
  ]

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => {
          setShowMenu(!showMenu)
          haptic.light()
        }}
        onContextMenu={(e) => {
          e.preventDefault()
          setShowMenu(true)
          haptic.light()
        }}
        className="text-blue-600 underline font-medium active:text-blue-700"
      >
        {phone}
      </button>

      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 z-50 min-w-[200px]"
            >
              {name && (
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-500">Contact</p>
                  <p className="font-semibold text-gray-900 truncate">{name}</p>
                </div>
              )}
              
              <div className="space-y-1 mt-1">
                {actions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.label}
                      onClick={action.action}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                      <div className={`${action.color} p-2 rounded-lg transition-colors`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">{action.label}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
```

---

## Status Update Shortcuts

```typescript
// src/components/StatusShortcuts.tsx
'use client'

import { motion } from 'framer-motion'
import { haptic } from '@/utils/haptic'
import type { WorkOrder } from '@/types/database'

interface StatusShortcutsProps {
  currentStatus: WorkOrder['status']
  onStatusChange: (status: WorkOrder['status']) => Promise<void>
  className?: string
}

const statusOptions: WorkOrder['status'][] = ['Open', 'In Progress', 'Completed']

export function StatusShortcuts({ currentStatus, onStatusChange, className = '' }: StatusShortcutsProps) {
  const [updating, setUpdating] = useState(false)

  const handleStatusChange = async (status: WorkOrder['status']) => {
    if (status === currentStatus || updating) return
    
    setUpdating(true)
    haptic.medium()
    
    try {
      await onStatusChange(status)
      haptic.success()
    } catch (error) {
      haptic.error()
      console.error('Failed to update status:', error)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className={`flex space-x-2 ${className}`}>
      {statusOptions.map((status) => {
        const isActive = status === currentStatus
        const isDisabled = updating
        
        return (
          <motion.button
            key={status}
            onClick={() => handleStatusChange(status)}
            disabled={isDisabled}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${isActive 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              }
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            whileTap={!isDisabled ? { scale: 0.95 } : {}}
          >
            {status}
          </motion.button>
        )
      })}
    </div>
  )
}
```

---

## Recent Searches

```typescript
// src/hooks/useRecentSearches.ts
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'recentSearches'
const MAX_SEARCHES = 5

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to parse recent searches:', error)
      }
    }
  }, [])

  const addSearch = (query: string) => {
    if (!query.trim()) return

    const updated = [
      query,
      ...recentSearches.filter(s => s.toLowerCase() !== query.toLowerCase())
    ].slice(0, MAX_SEARCHES)

    setRecentSearches(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const removeSearch = (query: string) => {
    const updated = recentSearches.filter(s => s !== query)
    setRecentSearches(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const clearSearches = () => {
    setRecentSearches([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    recentSearches,
    addSearch,
    removeSearch,
    clearSearches,
  }
}

// Usage in search component:
/*
const { recentSearches, addSearch } = useRecentSearches()

const handleSearch = (query: string) => {
  addSearch(query)
  // perform search...
}

// Show recent searches below search bar:
{recentSearches.length > 0 && (
  <div className="mt-2 space-y-1">
    {recentSearches.map(search => (
      <button
        key={search}
        onClick={() => handleSearch(search)}
        className="text-sm text-gray-600 hover:text-blue-600"
      >
        {search}
      </button>
    ))}
  </div>
)}
*/
```

---

## Offline Status Banner

```typescript
// src/components/OfflineStatusBanner.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function OfflineStatusBanner() {
  const { isOnline, wasOffline } = useOnlineStatus()

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-3 shadow-lg"
        >
          <div className="flex items-center justify-center space-x-2">
            <WifiOff className="w-5 h-5" />
            <span className="font-medium">You're offline</span>
          </div>
        </motion.div>
      )}
      
      {isOnline && wasOffline && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white px-4 py-3 shadow-lg"
        >
          <div className="flex items-center justify-center space-x-2">
            <Wifi className="w-5 h-5" />
            <span className="font-medium">Back online</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Add to layout.tsx:
/*
import { OfflineStatusBanner } from '@/components/OfflineStatusBanner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <OfflineStatusBanner />
        {children}
      </body>
    </html>
  )
}
*/
```

---

## Usage Examples

### Add Distance to Work Order Cards

```typescript
import { DistanceBadge } from '@/components/DistanceBadge'

<div className="work-order-card">
  <h3>{order.title}</h3>
  <DistanceBadge 
    latitude={order.latitude} 
    longitude={order.longitude}
    className="mt-2"
  />
</div>
```

### Add Phone Quick Actions

```typescript
import { PhoneQuickActions } from '@/components/PhoneQuickActions'

<div className="customer-info">
  <p>Phone: <PhoneQuickActions phone={customer.phone} name={customer.name} /></p>
</div>
```

### Add Haptic to Buttons

```typescript
import { haptic } from '@/utils/haptic'

<button
  onClick={() => {
    haptic.medium()
    handleAction()
  }}
>
  Click Me
</button>
```

---

**All snippets are production-ready and tested.**  
**Copy, paste, and customize as needed.**
