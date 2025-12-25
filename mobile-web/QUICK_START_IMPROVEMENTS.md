# Quick Start: High-Impact Improvements

This guide helps you implement the top 3 highest-impact improvements in under 2 hours.

---

## 1. Distance Badges (30 minutes)

### Step 1: Create Geolocation Hook

Create `src/hooks/useGeolocation.ts`:

```typescript
import { useState, useEffect } from 'react'

export interface Coordinates {
  lat: number
  lng: number
}

export function useGeolocation() {
  const [location, setLocation] = useState<Coordinates | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => setError(error.message),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    )
  }, [])

  return { location, error }
}
```

### Step 2: Create Distance Utility

Create `src/utils/distance.ts`:

```typescript
import type { Coordinates } from '@/hooks/useGeolocation'

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

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)}km`
}
```

### Step 3: Add to Work Order Cards

In `src/app/work-orders/page.tsx`, add after imports:

```typescript
import { useGeolocation } from '@/hooks/useGeolocation'
import { calculateDistance, formatDistance } from '@/utils/distance'
```

Inside component:

```typescript
const { location: userLocation } = useGeolocation()
```

In the work order card, add after customer name:

```typescript
{userLocation && order.customerAddress && (
  <div className="flex items-center space-x-1 text-xs mt-1">
    <MapPin className="w-3 h-3 text-blue-600" />
    <span className="font-medium text-blue-600">
      {formatDistance(calculateDistance(userLocation, {
        lat: order.latitude || 0,
        lng: order.longitude || 0
      }))} away
    </span>
  </div>
)}
```

---

## 2. Haptic Feedback (15 minutes)

### Step 1: Create Haptic Utility

Create `src/utils/haptic.ts`:

```typescript
export const haptic = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  },
  
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20)
    }
  },
  
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10])
    }
  },
  
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50])
    }
  },
}
```

### Step 2: Add to Buttons

Import in any component:

```typescript
import { haptic } from '@/utils/haptic'
```

Add to button clicks:

```typescript
<button
  onClick={() => {
    haptic.medium()
    // your action
  }}
>
  Click Me
</button>
```

Add to these locations:
- Status update buttons (medium)
- Work order completion (success)
- Navigation tabs (light)
- Error messages (error)

---

## 3. Phone Quick Actions (45 minutes)

### Step 1: Create Phone Menu Component

Create `src/components/PhoneQuickActions.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Phone, MessageSquare, ExternalLink, Copy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { haptic } from '@/utils/haptic'

interface PhoneQuickActionsProps {
  phone: string
  name?: string
}

export function PhoneQuickActions({ phone, name }: PhoneQuickActionsProps) {
  const [showMenu, setShowMenu] = useState(false)

  const actions = [
    {
      label: 'Call',
      icon: Phone,
      color: 'bg-green-500',
      action: () => {
        window.location.href = `tel:${phone}`
        haptic.medium()
      },
    },
    {
      label: 'SMS',
      icon: MessageSquare,
      color: 'bg-blue-500',
      action: () => {
        window.location.href = `sms:${phone}`
        haptic.medium()
      },
    },
    {
      label: 'WhatsApp',
      icon: ExternalLink,
      color: 'bg-green-600',
      action: () => {
        const cleanPhone = phone.replace(/[^0-9]/g, '')
        window.open(`https://wa.me/${cleanPhone}`, '_blank')
        haptic.medium()
      },
    },
    {
      label: 'Copy',
      icon: Copy,
      color: 'bg-gray-500',
      action: () => {
        navigator.clipboard.writeText(phone)
        haptic.success()
        setShowMenu(false)
      },
    },
  ]

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowMenu(!showMenu)}
        onContextMenu={(e) => {
          e.preventDefault()
          setShowMenu(true)
        }}
        className="text-blue-600 underline font-medium"
      >
        {phone}
      </button>

      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            
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
                  <p className="font-semibold text-gray-900">{name}</p>
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
                      <div className={`${action.color} p-2 rounded-lg`}>
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

### Step 2: Use in Work Order Details

In work order detail pages, replace phone number display:

```typescript
import { PhoneQuickActions } from '@/components/PhoneQuickActions'

// Replace this:
<a href={`tel:${customer.phone}`}>{customer.phone}</a>

// With this:
<PhoneQuickActions phone={customer.phone} name={customer.name} />
```

---

## Testing Checklist

After implementing:

- [ ] Distance badges show on all work order cards
- [ ] Distance updates when location changes
- [ ] Haptic feedback works on button taps
- [ ] Phone menu opens on click
- [ ] Call/SMS/WhatsApp links work
- [ ] Copy to clipboard works
- [ ] Test on real mobile device (not just browser)

---

## Next Quick Wins

After these 3, implement:

1. **Recent Searches** (20 min) - Store last 5 searches in localStorage
2. **Status Shortcuts** (30 min) - Add quick status buttons on cards
3. **Smart Sorting** (30 min) - Sort by distance + priority

---

## Troubleshooting

### Geolocation not working
- Check HTTPS (required for geolocation)
- Check browser permissions
- Test on real device (not emulator)

### Haptic not working
- Only works on mobile devices
- Check browser support
- iOS requires user interaction first

### Phone links not working
- Test on real device
- Check phone number format
- WhatsApp requires country code

---

**Time to implement**: ~90 minutes  
**Impact**: Immediate improvement in user experience  
**Next steps**: See UX_IMPROVEMENT_PLAN.md for full roadmap
