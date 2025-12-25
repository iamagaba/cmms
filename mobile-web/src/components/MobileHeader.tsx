'use client'

import { ArrowLeft, Menu, Bell } from 'lucide-react'
import { useMenu } from '@/components/LayoutProvider'
import { Breadcrumb, BreadcrumbItem } from '@/components/Breadcrumb'

interface MobileHeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  showMenu?: boolean
  showNotifications?: boolean
  notificationCount?: number
  breadcrumbs?: BreadcrumbItem[]
  showBreadcrumbs?: boolean
}

export function MobileHeader({ 
  title, 
  showBack = false, 
  onBack,
  showMenu = true,
  showNotifications = true,
  notificationCount = 0,
  breadcrumbs,
  showBreadcrumbs = false
}: MobileHeaderProps) {
  const { openMenu } = useMenu()

  return (
    <header 
      className="sticky top-0 z-40 safe-area backdrop-blur-md backdrop-saturate-150"
      style={{ 
        backgroundColor: 'rgba(var(--bg-container-rgb), 0.85)', 
        borderBottom: '1px solid var(--border-primary)' 
      }}
    >
      <div className="flex items-center justify-between px-4 py-4">
        {/* Left side */}
        <div className="flex items-center">
          {showBack ? (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            </button>
          ) : showMenu ? (
            <button
              onClick={openMenu}
              className="p-2 -ml-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <Menu className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            </button>
          ) : (
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6A0DAD, #7838C7)' }}
            >
              <span className="text-white text-sm font-bold">G</span>
            </div>
          )}
        </div>

        {/* Center - Title or Breadcrumbs */}
        <div className="flex-1 mx-4 min-w-0">
          {showBreadcrumbs && breadcrumbs ? (
            <Breadcrumb items={breadcrumbs} />
          ) : (
            <h1 className="text-xl font-bold truncate text-center" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h1>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center">
          {showNotifications && (
            <button 
              onClick={() => window.location.href = '/profile'}
              className="relative p-2 -mr-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <Bell className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              {notificationCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg"
                  style={{ backgroundColor: '#ff4d4f' }}
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}