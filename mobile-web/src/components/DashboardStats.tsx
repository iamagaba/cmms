'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle, AlertTriangle, Calendar, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useHaptic } from '@/utils/haptic'

interface StatsData {
  total: number
  inProgress: number
  completed: number
  open: number
  todayCompleted: number
}

interface DashboardStatsProps {
  refreshing?: boolean
}

export function DashboardStats({ refreshing = false }: DashboardStatsProps) {
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    inProgress: 0,
    completed: 0,
    open: 0,
    todayCompleted: 0,
  })
  const [loading, setLoading] = useState(true)
  const { tap } = useHaptic()

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      
      try {
        // Get all work orders
        const { data: allOrders, error: allError } = await supabase
          .from('work_orders')
          .select('id, status, completedAt')

        if (allError) {
          console.error('Error fetching stats:', allError)
          setLoading(false)
          return
        }

        // Calculate stats
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const statsData: StatsData = {
          total: allOrders?.length || 0,
          inProgress: allOrders?.filter(o => o.status === 'In Progress').length || 0,
          completed: allOrders?.filter(o => o.status === 'Completed').length || 0,
          open: allOrders?.filter(o => o.status === 'New').length || 0,
          todayCompleted: allOrders?.filter(o => {
            if (o.status === 'Completed' && o.completedAt) {
              const completedDate = new Date(o.completedAt)
              completedDate.setHours(0, 0, 0, 0)
              return completedDate.getTime() === today.getTime()
            }
            return false
          }).length || 0,
        }

        setStats(statsData)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [refreshing])

  // Actionable insights instead of raw numbers
  const statCards = [
    {
      title: stats.open > 0 ? `${stats.open} orders need attention` : 'No pending orders',
      subtitle: 'Open work orders',
      value: stats.open,
      icon: AlertTriangle,
      color: '#fa8c16',
      bgColor: '#fff7e6',
      actionable: stats.open > 0,
      priority: 1,
    },
    {
      title: stats.inProgress > 0 ? `${stats.inProgress} in progress` : 'Nothing in progress',
      subtitle: 'Active work',
      value: stats.inProgress,
      icon: Clock,
      color: '#faad14',
      bgColor: '#fffbe6',
      actionable: stats.inProgress > 0,
      priority: 2,
    },
    {
      title: stats.todayCompleted > 0 ? `${stats.todayCompleted} completed today` : 'No completions yet',
      subtitle: 'Today\'s progress',
      value: stats.todayCompleted,
      icon: CheckCircle,
      color: '#52c41a',
      bgColor: '#f6ffed',
      actionable: false,
      priority: 3,
    },
    {
      title: `${stats.total} total orders`,
      subtitle: 'All time',
      value: stats.total,
      icon: Calendar,
      color: '#0077ce',
      bgColor: '#f0f7ff',
      actionable: false,
      priority: 4,
    },
  ]

  if (loading && !refreshing) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {statCards.map((card, index) => {
        const Icon = card.icon
        return (
          <div 
            key={index} 
            className={`card-mobile transition-all ${
              card.actionable 
                ? 'cursor-pointer active:scale-[0.98]' 
                : ''
            }`}
            style={card.actionable ? {
              borderColor: '#faad14',
              borderWidth: '1px'
            } : {}}
            onClick={() => {
              if (card.actionable) {
                tap()
                window.location.href = '/work-orders'
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div 
                  className="p-3 rounded-xl shadow-sm"
                  style={{ backgroundColor: card.bgColor }}
                >
                  <Icon className="w-6 h-6" style={{ color: card.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{card.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{card.subtitle}</p>
                </div>
              </div>
              {card.actionable && (
                <ChevronRight className="w-5 h-5 flex-shrink-0 ml-2" style={{ color: 'var(--text-tertiary)' }} />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}