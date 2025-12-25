'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, ClipboardList, Wrench, MapPin } from 'lucide-react'
import clsx from 'clsx'
import { useCallback, useMemo } from 'react'
import { useHaptic } from '@/utils/haptic'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: number | string
  badgeColor?: 'red' | 'blue' | 'green' | 'yellow' | 'purple'
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/',
  },
  {
    id: 'work-orders',
    label: 'Work Orders',
    icon: ClipboardList,
    href: '/work-orders',
  },
  {
    id: 'assets',
    label: 'Assets',
    icon: Wrench,
    href: '/assets',
  },
  {
    id: 'map',
    label: 'Map',
    icon: MapPin,
    href: '/map',
  },
]

interface MobileNavigationProps {
  activeTab?: string
  badges?: Record<string, { count: number | string; color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple' }>
}

export function MobileNavigation({ activeTab, badges = {} }: MobileNavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { tap } = useHaptic()

  // Memoize badge color function to prevent recreating on every render
  const getBadgeColor = useMemo(() => {
    const colors = {
      red: 'bg-red-500 text-white',
      blue: 'bg-blue-500 text-white',
      green: 'bg-green-500 text-white',
      yellow: 'bg-yellow-500 text-white',
      purple: 'bg-purple-500 text-white'
    }
    return (color: string = 'red') => colors[color as keyof typeof colors] || colors.red
  }, [])

  // Optimized navigation handler with instant feedback
  const handleNavigation = useCallback((href: string, e: React.MouseEvent) => {
    e.preventDefault()
    tap() // Immediate haptic feedback
    
    // Instant navigation without waiting for animations
    router.push(href)
  }, [router, tap])

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/85 border-t border-gray-200 safe-area backdrop-blur-md backdrop-saturate-150 z-50">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id || pathname === item.href
          const badge = badges[item.id]
          
          return (
            <Link
              key={item.id}
              href={item.href}
              prefetch={true} // Enable prefetching for instant navigation
              onClick={(e) => handleNavigation(item.href, e)}
              className={clsx(
                'flex flex-col items-center justify-center px-3 py-3 rounded-xl nav-item-optimized fast-transition',
                'min-w-[70px] min-h-[60px] relative performance-optimized',
                isActive
                  ? 'shadow-sm'
                  : 'hover:bg-gray-100 active:bg-gray-200'
              )}
              style={isActive ? {
               color: 'var(--brand-primary-900)',
               backgroundColor: '#F8F5FC'
             } : {
               color: 'var(--gray-800)'
             }}
            >
              {isActive && (
                <div 
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                ></div>
              )}
              
              <div className="relative">
                <Icon className="w-6 h-6 mb-1" />
                {badge && (typeof badge.count === 'number' ? badge.count > 0 : badge.count) && (
                  <span 
                    className={`absolute top-0 right-0 text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-semibold shadow-sm ${getBadgeColor(badge.color)}`}
                    style={{ fontSize: '10px' }}
                  >
                    {typeof badge.count === 'number' && badge.count > 99 ? '99+' : badge.count}
                  </span>
                )}
              </div>
              
              <span className="text-xs font-medium">
                {item.label}
              </span>
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary rounded-full animate-bounce"
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}