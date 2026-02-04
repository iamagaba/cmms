'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw, Filter, Plus, AlertCircle } from 'lucide-react'
import { PullToRefresh } from '@/components/PullToRefresh'
import { TimelineItem } from './TimelineItem'
import { TimelineFilters as TimelineFiltersComponent } from './TimelineFilters'
import { AddNoteInterface } from './AddNoteInterface'
import { timelineService } from '@/services/timeline-service'
import { getActivityTypeConfig } from '@/utils/activity-type-config'
import type { 
  Activity, 
  TimelineFilters, 
  TimelineComponentProps,
  TimelineDisplayConfig 
} from '@/types/activity-timeline'

/**
 * Default configuration for mobile timeline display
 */
const DEFAULT_CONFIG: TimelineDisplayConfig = {
  showDateSeparators: true,
  groupByDate: true,
  showUserAvatars: true,
  showMetadata: true,
  enableRealTimeUpdates: true,
  maxActivitiesPerPage: 25,
  enablePullToRefresh: true,
  touchOptimized: true
}

/**
 * TimelineContainer - Main timeline component for mobile web
 * Features touch-optimized interactions, pull-to-refresh, and responsive design
 */
export function TimelineContainer({
  workOrderId,
  filters: initialFilters,
  config: userConfig,
  onActivityAdd,
  onFilterChange,
  className = ''
}: TimelineComponentProps) {
  // State management
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TimelineFilters>(initialFilters || {})
  const [showFilters, setShowFilters] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Merge user config with defaults
  const config = useMemo(() => ({ ...DEFAULT_CONFIG, ...userConfig }), [userConfig])

  /**
   * Handle activity item click
   */
  const handleActivityClick = useCallback((activity: Activity) => {
    // TODO: Implement activity detail view or actions
    console.log('Activity clicked:', activity)
  }, [])

  /**
   * Load activities with error handling and loading states
   */
  const loadActivities = useCallback(async (
    currentFilters: TimelineFilters = filters,
    append: boolean = false
  ) => {
    try {
      if (!append) {
        setLoading(true)
        setError(null)
      } else {
        setLoadingMore(true)
      }

      // Calculate offset for pagination
      const offset = append ? activities.length : 0
      const paginatedFilters = {
        ...currentFilters,
        limit: config.maxActivitiesPerPage,
        offset
      }

      const newActivities = await timelineService.getActivities(workOrderId, paginatedFilters)
      
      if (append) {
        setActivities(prev => [...prev, ...newActivities])
        setHasMore(newActivities.length === config.maxActivitiesPerPage)
      } else {
        setActivities(newActivities)
        setHasMore(newActivities.length === config.maxActivitiesPerPage)
      }
    } catch (err) {
      console.error('Error loading activities:', err)
      setError(err instanceof Error ? err.message : 'Failed to load activities')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [workOrderId, filters, activities.length, config.maxActivitiesPerPage])

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await loadActivities(filters, false)
    } finally {
      setRefreshing(false)
    }
  }, [loadActivities, filters])

  /**
   * Handle filter changes
   */
  const handleFilterChange = useCallback((newFilters: TimelineFilters) => {
    setFilters(newFilters)
    onFilterChange?.(newFilters)
    loadActivities(newFilters, false)
  }, [loadActivities, onFilterChange])

  /**
   * Load more activities (infinite scroll)
   */
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadActivities(filters, true)
    }
  }, [loadActivities, filters, loadingMore, hasMore])

  /**
   * Handle new activity addition
   */
  const handleActivityAdd = useCallback((activity: Activity) => {
    setActivities(prev => [activity, ...prev])
    onActivityAdd?.(activity)
  }, [onActivityAdd])

  // Initial load
  useEffect(() => {
    loadActivities()
  }, [workOrderId]) // Only depend on workOrderId to avoid infinite loops

  // Real-time updates subscription
  useEffect(() => {
    if (!config.enableRealTimeUpdates) return

    const unsubscribe = timelineService.subscribeToUpdates(workOrderId, (newActivity) => {
      console.log('Real-time activity received:', newActivity)
      handleActivityAdd(newActivity)
    })

    return unsubscribe
  }, [workOrderId, config.enableRealTimeUpdates, handleActivityAdd])

  /**
   * Group activities by date for display
   */
  const groupedActivities = useMemo(() => {
    if (!config.groupByDate) {
      return { 'all': activities }
    }

    return activities.reduce((groups, activity) => {
      const date = new Date(activity.created_at).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(activity)
      return groups
    }, {} as Record<string, Activity[]>)
  }, [activities, config.groupByDate])

  /**
   * Format date for display
   */
  const formatDateGroup = (dateString: string): string => {
    if (dateString === 'all') return ''
    
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
  }

  /**
   * Render activity item with touch-optimized styling
   */
  const renderActivity = (activity: Activity, isLatest: boolean = false) => {
    return (
      <TimelineItem
        key={activity.id}
        activity={activity}
        showAvatar={config.showUserAvatars}
        showMetadata={config.showMetadata}
        isLatest={isLatest}
        onClick={handleActivityClick}
      />
    )
  }

  /**
   * Render loading skeleton
   */
  const renderLoadingSkeleton = () => (
    <div className="space-y-4 p-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-3 animate-pulse">
          <div className="w-8 h-8 bg-slate-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
            <div className="h-3 bg-slate-200 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-2">
        No activities yet
      </h3>
      <p className="text-sm text-slate-500 mb-6 max-w-sm">
        Activities will appear here as work progresses on this order.
      </p>
    </div>
  )

  /**
   * Render error state
   */
  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-2">
        Failed to load activities
      </h3>
      <p className="text-sm text-slate-500 mb-6 max-w-sm">
        {error}
      </p>
      <button
        onClick={() => loadActivities()}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium
                   hover:bg-primary-700 active:bg-primary-800 transition-colors
                   min-h-[44px] touch-manipulation"
      >
        Try Again
      </button>
    </div>
  )

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Activity Timeline
          </h2>
          <div className="flex items-center gap-2">
            {/* Filter button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px]
                touch-manipulation flex items-center justify-center
                ${showFilters 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
              aria-label="Toggle filters"
            >
              <Filter className="w-5 h-5" />
            </button>

            {/* Add note button */}
            <button
              onClick={() => {/* TODO: Implement add note */}}
              className="p-2 bg-secondary-500 text-white rounded-lg 
                         hover:bg-secondary-600 active:bg-secondary-700
                         transition-colors min-h-[44px] min-w-[44px]
                         touch-manipulation flex items-center justify-center"
              aria-label="Add note"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter summary */}
        {(filters.activityTypes?.length || filters.searchQuery || filters.dateRange) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.activityTypes?.map(type => (
              <span
                key={type}
                className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
              >
                {getActivityTypeConfig(type).label}
              </span>
            ))}
            {filters.searchQuery && (
              <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                Search: &quot;{filters.searchQuery}&quot;
              </span>
            )}
            {filters.dateRange && (
              <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                Date range applied
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-h-[70vh] overflow-y-auto">
        {config.enablePullToRefresh ? (
          <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
            {loading ? (
              renderLoadingSkeleton()
            ) : error ? (
              renderErrorState()
            ) : activities.length === 0 ? (
              renderEmptyState()
            ) : (
              <div>
                {/* Add Note Interface */}
                <div className="p-4 border-b border-slate-200">
                  <AddNoteInterface
                    workOrderId={workOrderId}
                    onNoteAdded={(activity) => {
                      console.log('Note added:', activity)
                      handleActivityAdd(activity)
                    }}
                  />
                </div>

                {Object.entries(groupedActivities).map(([dateGroup, groupActivities]) => (
                  <div key={dateGroup}>
                    {/* Date separator */}
                    {config.showDateSeparators && config.groupByDate && dateGroup !== 'all' && (
                      <div className="sticky top-0 bg-slate-50 px-4 py-2 border-b border-slate-200 z-10">
                        <h3 className="text-sm font-medium text-slate-700">
                          {formatDateGroup(dateGroup)}
                        </h3>
                      </div>
                    )}

                    {/* Activities */}
                    {groupActivities.map((activity, index) => 
                      renderActivity(activity, index === 0 && dateGroup === Object.keys(groupedActivities)[0])
                    )}
                  </div>
                ))}

                {/* Load more button */}
                {hasMore && (
                  <div className="p-4 border-t border-slate-200">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="w-full py-3 text-sm font-medium text-primary-600 
                                 hover:text-primary-700 disabled:text-slate-400
                                 min-h-[44px] touch-manipulation
                                 flex items-center justify-center gap-2"
                    >
                      {loadingMore ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Loading more...
                        </>
                      ) : (
                        'Load more activities'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </PullToRefresh>
        ) : (
          <div>
            {loading ? (
              renderLoadingSkeleton()
            ) : error ? (
              renderErrorState()
            ) : activities.length === 0 ? (
              renderEmptyState()
            ) : (
              <div>
                {/* Add Note Interface */}
                <div className="p-4 border-b border-slate-200">
                  <AddNoteInterface
                    workOrderId={workOrderId}
                    onNoteAdded={(activity) => {
                      console.log('Note added:', activity)
                      handleActivityAdd(activity)
                    }}
                  />
                </div>

                {Object.entries(groupedActivities).map(([dateGroup, groupActivities]) => (
                  <div key={dateGroup}>
                    {config.showDateSeparators && config.groupByDate && dateGroup !== 'all' && (
                      <div className="sticky top-0 bg-slate-50 px-4 py-2 border-b border-slate-200 z-10">
                        <h3 className="text-sm font-medium text-slate-700">
                          {formatDateGroup(dateGroup)}
                        </h3>
                      </div>
                    )}
                    {groupActivities.map((activity, index) => 
                      renderActivity(activity, index === 0 && dateGroup === Object.keys(groupedActivities)[0])
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      <TimelineFiltersComponent
        filters={filters}
        onFiltersChange={handleFilterChange}
        availableTechnicians={[]} // TODO: Fetch from API
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </div>
  )
}