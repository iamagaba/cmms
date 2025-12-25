'use client'

import { useState } from 'react'
import { DashboardStats } from '@/components/DashboardStats'
import { QuickActions } from '@/components/QuickActions'
import { RecentWorkOrders } from '@/components/RecentWorkOrders'
import { MobileHeader } from '@/components/MobileHeader'
import { MobileNavigation } from '@/components/MobileNavigation'
import { PullToRefresh } from '@/components/PullToRefresh'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { useBadges } from '@/context/BadgeContext'

export default function DashboardPage() {
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const { profile } = useAuth()
  const { badges, refreshBadges } = useBadges()

  const handleRefresh = async () => {
    setRefreshing(true)
    // Refresh badges and simulate API call
    await Promise.all([
      refreshBadges(),
      new Promise(resolve => setTimeout(resolve, 1500))
    ])
    setLastRefresh(new Date())
    setRefreshing(false)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      <MobileHeader 
        title="Dashboard" 
        showNotifications 
        notificationCount={2}
      />
      
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <main className="px-4 py-6 space-y-6 pb-20">
          {/* Welcome Section */}
          <div className="card-mobile text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0077ce, #0c96f1)' }}>
              <span className="text-white text-xl font-bold">👋</span>
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}!
            </h1>
            <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
              Here&apos;s your work summary for today
            </p>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#f0f9ff', color: '#0369a1' }}>
              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#52c41a' }}></div>
              Online • Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
          </div>

          {/* Dashboard Stats - Actionable Insights */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 px-1">What Needs Your Attention</h2>
            <DashboardStats refreshing={refreshing} />
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 px-1">Quick Actions</h2>
            <QuickActions />
          </div>

          {/* Recent Work Orders */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 px-1">Recent Work Orders</h2>
            <RecentWorkOrders />
          </div>
        </main>
      </PullToRefresh>

      <MobileNavigation activeTab="dashboard" badges={badges} />
      </div>
    </ProtectedRoute>
  )
}