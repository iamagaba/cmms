'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { MobileHeader } from '@/components/MobileHeader'
import { MobileNavigation } from '@/components/MobileNavigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { EmptyState } from '@/components/EmptyState'
import { EnhancedButton } from '@/components/EnhancedButton'
import { OptimizedLoader, WorkOrderSkeleton } from '@/components/OptimizedLoader'
import { usePerformance } from '@/hooks/usePerformance'
import { Clock, MapPin, Car, ChevronRight, Search, Plus, Navigation, Filter } from 'lucide-react'
import { useHaptic } from '@/utils/haptic'
import { useBadges } from '@/context/BadgeContext'
import { supabase } from '@/lib/supabase'
import { getStatusClass, getPriorityClass } from '@/utils/statusColors'
import { useGeolocation } from '@/hooks/useGeolocation'
import { calculateDistance, formatDistance, sortByProximityAndPriority } from '@/utils/distance'
import { snakeToCamelCase } from '@/utils/data-helpers'
import type { WorkOrder } from '@/types/database'
import type { Coordinates } from '@/hooks/useGeolocation'

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'open' | 'progress' | 'completed' | 'nearby'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'proximity' | 'date' | 'priority'>('proximity')
  
  // Geolocation integration
  const { location, locationError, locationLoading, permissionStatus } = useGeolocation()
  const { tap, select } = useHaptic()
  const { badges } = useBadges()
  const { measureNavigation, getPerformanceSettings } = usePerformance()

  // Performance settings
  const perfSettings = getPerformanceSettings()

  // Cache for work orders to prevent unnecessary re-fetching
  const [workOrdersCache, setWorkOrdersCache] = useState<WorkOrder[]>([])
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const CACHE_DURATION = 30000 // 30 seconds cache

  useEffect(() => {
    const fetchWorkOrders = async () => {
      const now = Date.now()
      
      // Use cache if data is fresh
      if (workOrdersCache.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
        setWorkOrders(workOrdersCache)
        setLoading(false)
        return
      }

      setLoading(true)
      
      try {
        const { data, error } = await supabase
          .from('work_orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100) // Limit initial load for better performance

        if (error) {
          console.error('Error fetching work orders:', error)
        } else if (data) {
          // Convert snake_case fields to camelCase to match the main app
          const transformedData = data.map(workOrder => snakeToCamelCase(workOrder) as WorkOrder)
          setWorkOrders(transformedData)
          setWorkOrdersCache(transformedData)
          setLastFetchTime(now)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkOrders()
  }, [])

  const getStatusStyle = (status: WorkOrder['status']) => {
    return getStatusClass(status || 'Open')
  }

  const getPriorityStyle = (priority: WorkOrder['priority']) => {
    return getPriorityClass(priority || 'Low')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Calculate distance for a work order
  const getWorkOrderDistance = (workOrder: WorkOrder): number | null => {
    if (!location || !workOrder.customerLat || !workOrder.customerLng) {
      return null
    }
    
    const workOrderLocation: Coordinates = {
      lat: workOrder.customerLat,
      lng: workOrder.customerLng
    }
    
    return calculateDistance(location, workOrderLocation)
  }

  // Memoized work orders with distance information to prevent recalculation
  const workOrdersWithDistance = useMemo(() => {
    return workOrders.map(workOrder => ({
      ...workOrder,
      distanceFromUser: getWorkOrderDistance(workOrder)
    }))
  }, [workOrders, location])

  // Memoized sorting to prevent unnecessary recalculation
  const sortedWorkOrders = useMemo(() => {
    let sorted = [...workOrdersWithDistance]
    
    if (sortBy === 'proximity' && location) {
      // Use the smart proximity sorting algorithm
      const workOrdersForSorting = sorted.map(wo => ({
        ...wo,
        latitude: wo.customerLat,
        longitude: wo.customerLng,
        priority: (wo.priority?.toLowerCase() || 'low') as 'low' | 'medium' | 'high'
      }))
      
      sorted = sortByProximityAndPriority(workOrdersForSorting, location)
    } else if (sortBy === 'date') {
      sorted.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime()
        const dateB = new Date(b.created_at || 0).getTime()
        return dateB - dateA // Newest first
      })
    } else if (sortBy === 'priority') {
      const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 }
      sorted.sort((a, b) => {
        const priorityA = priorityOrder[a.priority || 'Low']
        const priorityB = priorityOrder[b.priority || 'Low']
        return priorityA - priorityB
      })
    }
    
    return sorted
  }, [workOrdersWithDistance, sortBy, location])

  // Memoized filtering to prevent unnecessary recalculation
  const filteredOrders = useMemo(() => {
    return sortedWorkOrders.filter(order => {
      const matchesFilter = filter === 'all' || 
        (filter === 'open' && order.status === 'Open') ||
        (filter === 'progress' && order.status === 'In Progress') ||
        (filter === 'completed' && order.status === 'Completed') ||
        (filter === 'nearby' && order.distanceFromUser !== null && order.distanceFromUser !== undefined && order.distanceFromUser <= 10)
      
      const matchesSearch = searchQuery === '' || 
        order.workOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (order.service && order.service.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (order.initialDiagnosis && order.initialDiagnosis.toLowerCase().includes(searchQuery.toLowerCase()))
      
      return matchesFilter && matchesSearch
    })
  }, [sortedWorkOrders, filter, searchQuery])

  // Memoized filter counts to prevent recalculation
  const filterCounts = useMemo(() => ({
    all: workOrdersWithDistance.length,
    open: workOrdersWithDistance.filter(o => o.status === 'Open').length,
    progress: workOrdersWithDistance.filter(o => o.status === 'In Progress').length,
    completed: workOrdersWithDistance.filter(o => o.status === 'Completed').length,
    nearby: location ? workOrdersWithDistance.filter(o => 
      o.distanceFromUser !== null && o.distanceFromUser !== undefined && o.distanceFromUser <= 10
    ).length : 0,
  }), [workOrdersWithDistance, location])

  // Optimized card expansion handler
  const handleCardExpansion = useCallback((orderId: string) => {
    tap()
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }, [tap])

  // Optimized navigation handler
  const handleNavigateToDetails = useCallback((orderId: string) => {
    window.location.href = `/work-orders/${orderId}`
  }, [])

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Work Orders" />
      
      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-20 right-4 z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <EnhancedButton
          onClick={() => window.location.href = '/work-orders/new'}
          className="w-14 h-14 rounded-full shadow-lg"
          icon={<Plus className="w-6 h-6" />}
          hapticFeedback={true}
        />
      </motion.div>

      {/* Search and Filter */}
      <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search work orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sort Options */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <div className="flex space-x-2">
              {[
                { key: 'proximity', label: 'Distance', icon: Navigation, disabled: !location },
                { key: 'date', label: 'Date', icon: Clock },
                { key: 'priority', label: 'Priority', icon: ChevronRight },
              ].map((option) => (
                <motion.button
                  key={option.key}
                  onClick={() => !option.disabled && setSortBy(option.key as typeof sortBy)}
                  disabled={option.disabled}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    sortBy === option.key
                      ? 'bg-blue-600 text-white'
                      : option.disabled
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  whileTap={!option.disabled ? { scale: 0.95 } : {}}
                >
                  <option.icon className="w-3 h-3" />
                  <span>{option.label}</span>
                  {option.key === 'proximity' && !location && (
                    <span className="text-xs opacity-75">(needs location)</span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Sort Indicator */}
          {sortBy === 'proximity' && location && (
            <motion.div
              className="bg-blue-50 border border-blue-200 rounded-lg p-2"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-xs text-blue-700">
                <span className="font-medium">Smart sorting active:</span> High priority within 5km first, then medium priority within 10km, then by distance
              </p>
            </motion.div>
          )}

          {/* Near Me Filter Indicator */}
          {filter === 'nearby' && location && (
            <motion.div
              className="bg-green-50 border border-green-200 rounded-lg p-2"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-green-600" />
                <p className="text-xs text-green-700">
                  <span className="font-medium">Showing work orders within 10km</span> of your current location
                </p>
              </div>
            </motion.div>
          )}

          {/* Filter Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2 mb-4">
            {[
              { key: 'all', label: 'All', count: filterCounts.all },
              { key: 'open', label: 'Open', count: filterCounts.open },
              { key: 'progress', label: 'In Progress', count: filterCounts.progress },
              { key: 'completed', label: 'Completed', count: filterCounts.completed },
              { key: 'nearby', label: 'Near Me', count: filterCounts.nearby, icon: Navigation, disabled: !location },
            ].map((tab) => (
              <motion.button
                key={tab.key}
                onClick={() => !tab.disabled && setFilter(tab.key as typeof filter)}
                disabled={tab.disabled}
                className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm transition-colors flex items-center space-x-1 ${
                  filter === tab.key
                    ? 'bg-blue-600 text-white'
                    : tab.disabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                whileTap={!tab.disabled ? { scale: 0.95 } : {}}
              >
                {tab.icon && <tab.icon className="w-4 h-4" />}
                <span>{tab.label} ({tab.count})</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Work Orders List */}
        <OptimizedLoader
          isLoading={loading}
          delay={100}
          minDisplayTime={200}
          fallback={
            <div className="space-y-4">
              {[...Array(perfSettings.enableComplexAnimations ? 8 : 5)].map((_, i) => (
                <WorkOrderSkeleton key={i} />
              ))}
            </div>
          }
        >
          {filteredOrders.length === 0 ? (
          <EmptyState
            illustration="work-orders"
            title="No work orders found"
            description={searchQuery
              ? "No work orders match your search criteria. Try adjusting your search terms or filters."
              : filter === 'nearby'
                ? "No work orders found within 10km of your location. Try expanding your search area."
                : "No work orders match the selected filter. Try selecting a different filter or create a new work order."
            }
            action={{
              label: searchQuery || filter !== 'all' ? 'Clear Filters' : 'Create Work Order',
              onClick: () => {
                if (searchQuery || filter !== 'all') {
                  setSearchQuery('')
                  setFilter('all')
                } else {
                  window.location.href = '/work-orders/new'
                }
              },
              icon: searchQuery || filter !== 'all' ? <Filter className="w-4 h-4" /> : <Plus className="w-4 h-4" />
            }}
            secondaryAction={searchQuery || filter !== 'all' ? {
              label: 'Create Work Order',
              onClick: () => window.location.href = '/work-orders/new',
              icon: <Plus className="w-4 h-4" />
            } : undefined}
          />
        ) : (
          <motion.div
            className="space-y-4"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredOrders.map((order) => {
              const isExpanded = expandedCards.has(order.id)
              
              return (
                <motion.div
                  key={order.id}
                  variants={itemVariants}
                  className={`work-order-card priority-${(order.priority || 'low').toLowerCase()} hover:shadow-md transition-all overflow-hidden`}
                >
                  {/* Compact View - Always Visible */}
                  <motion.div
                    className="p-4 cursor-pointer active:bg-gray-50"
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCardExpansion(order.id)
                    }}
                  >
                    {/* Critical Info Only */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {order.priority === 'High' && (
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          )}
                          <span className="font-semibold text-gray-900">{order.customerName || 'Unknown Customer'}</span>
                        </div>
                        {order.service && (
                          <p className="text-sm text-gray-600 truncate">{order.service}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Location and Distance */}
                    <div className="flex items-center justify-between mb-2">
                      {(order.customerAddress || order.locations?.address) && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500 flex-1 min-w-0">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {order.customerAddress || 'No address provided'}
                          </span>
                        </div>
                      )}
                      
                      {/* Distance Badge */}
                      {order.distanceFromUser !== null && order.distanceFromUser !== undefined ? (
                        <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0">
                          <Navigation className="w-3 h-3" />
                          <span>{formatDistance(order.distanceFromUser)}</span>
                        </div>
                      ) : locationLoading ? (
                        <div className="flex items-center space-x-1 bg-gray-50 text-gray-500 px-2 py-1 rounded-full text-xs ml-2 flex-shrink-0">
                          <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                          <span>Locating...</span>
                        </div>
                      ) : locationError ? (
                        <div className="flex items-center space-x-1 bg-orange-50 text-orange-600 px-2 py-1 rounded-full text-xs ml-2 flex-shrink-0">
                          <MapPin className="w-3 h-3" />
                          <span>No location</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Expand Indicator */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">{order.workOrderNumber}</span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="w-4 h-4 text-gray-400 transform rotate-90" />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Expanded Details */}
                  <motion.div
                    initial={false}
                    animate={{ 
                      height: isExpanded ? 'auto' : 0,
                      opacity: isExpanded ? 1 : 0
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 py-4 space-y-3 border-t border-gray-100">
                      {/* Vehicle Info */}
                      {order.vehicleModel && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Car className="w-4 h-4 flex-shrink-0" />
                          <span>{order.vehicleModel}</span>
                        </div>
                      )}

                      {/* Diagnosis */}
                      {order.initialDiagnosis && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">Diagnosis</p>
                          <p className="text-xs text-gray-600">{order.initialDiagnosis}</p>
                        </div>
                      )}

                      {/* Appointment */}
                      {order.appointmentDate && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span>{formatDate(order.appointmentDate)}</span>
                        </div>
                      )}

                      {/* Priority Badge */}
                      {order.priority && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Priority:</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityStyle(order.priority)}`}>
                            {order.priority}
                          </span>
                        </div>
                      )}

                      {/* Action Button */}
                      <EnhancedButton
                        onClick={(e) => {
                          e.stopPropagation()
                          handleNavigateToDetails(order.id)
                        }}
                        fullWidth
                        size="md"
                      >
                        View Full Details
                      </EnhancedButton>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </OptimizedLoader>
      </div>
      <MobileNavigation activeTab="work-orders" badges={badges} />
    </ProtectedRoute>
  )
}