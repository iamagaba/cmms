'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useHaptic } from '@/utils/haptic'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const { tap } = useHaptic()

  const handleClick = () => {
    tap()
  }

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
        {items.map((item, index) => (
          <li key={index} className="flex items-center space-x-1 flex-shrink-0">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
            
            {item.current ? (
              <motion.span 
                className="flex items-center space-x-1 text-gray-900 font-medium px-2 py-1 rounded-md bg-gray-100"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span className="truncate max-w-[120px]">{item.label}</span>
              </motion.span>
            ) : item.href ? (
              <Link
                href={item.href}
                onClick={handleClick}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors active:bg-gray-100"
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span className="truncate max-w-[120px]">{item.label}</span>
              </Link>
            ) : (
              <span className="flex items-center space-x-1 text-gray-500 px-2 py-1">
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span className="truncate max-w-[120px]">{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Utility function to generate breadcrumbs based on pathname
export function generateBreadcrumbs(pathname: string, customLabels?: Record<string, string>): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Dashboard',
      href: '/',
      icon: <Home className="w-4 h-4" />
    }
  ]

  let currentPath = ''
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1
    
    // Check if it's a dynamic route (UUID or number)
    const isDynamic = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$|^\d+$/.test(segment)
    
    let label = segment
    
    // Custom labels for known routes
    const routeLabels: Record<string, string> = {
      'work-orders': 'Work Orders',
      'assets': 'Assets',
      'profile': 'Profile',
      'map': 'Map',
      'history': 'History',
      'new': 'New',
      'edit': 'Edit',
      ...customLabels
    }
    
    if (routeLabels[segment]) {
      label = routeLabels[segment]
    } else if (isDynamic) {
      // For dynamic routes, use a generic label or try to get from context
      if (currentPath.includes('/work-orders/')) {
        label = 'Work Order Details'
      } else if (currentPath.includes('/assets/')) {
        label = 'Asset Details'
      } else {
        label = 'Details'
      }
    } else {
      // Capitalize and format the segment
      label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
      current: isLast
    })
  })

  return breadcrumbs
}

// Hook for easy breadcrumb usage
export function useBreadcrumbs(customLabels?: Record<string, string>) {
  if (typeof window === 'undefined') {
    return []
  }
  
  return generateBreadcrumbs(window.location.pathname, customLabels)
}