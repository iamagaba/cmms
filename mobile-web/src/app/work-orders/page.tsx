'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { MobileHeader } from '@/components/MobileHeader'
import { MobileNavigation } from '@/components/MobileNavigation'
import { EmptyState } from '@/components/EmptyState'
import { EnhancedButton } from '@/components/EnhancedButton'
import { OptimizedLoader, WorkOrderSkeleton } from '@/components/OptimizedLoader'
import { usePerformance } from '@/hooks/usePerformance'
import { Clock, MapPin, Car, ChevronRight, Search, Plus, Navigation, Filter, Phone } from 'lucide-react'
import { useHaptic } from '@/utils/haptic'
import { useBadges } from '@/context/BadgeContext'
import { supabase } from '@/lib/supabase'
import { getStatusColor, getPriorityColor } from '@/utils/statusColors'
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
  
  const { location, locationError, locationLoading } = useGeolocation()
  const { tap } = useHaptic()
  const { badges } = useBadges()
  const { getPerformanceSettings } = usePerformance()
  const perfSettings = getPerformanceSettings()

  const [workOrdersCache, setWorkOrdersCache] = useState<WorkOrder[]>([])
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const CACHE_DURATION = 30000

  useEffect(() => {
    const fetchWorkOrders = async () => {
      const now = Date.now()
      
      if (workOrdersCache.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
        setWorkOrders(workOrdersCache)
        setLoading(false)
        return
      }

      setLoading(true)
      
      try {
        const { data, error } = await supabase
          .from('work_orders')
          .select(`
            *,
            vehicles (
              id,
              license_plate,
              make,
              model,
              year
            ),
            customers (
              id,
              name,
              phone
            )
          `)
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) {
          console.error('Error fetching work orders:', error)
        } else if (data) {
          const transformedData = data.map((workOrder: any) => snakeToCamelCase(workOrder) as WorkOrder)
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
    const color = getStatusColor(status)
    return {
      backgroundColor: color,
      color: 'white',
    }
  }

  const getPriorityStyle = (priority: WorkOrder['priority']) => {
    const color = getPriorityColor(priority)
    return {
      backgroundColor: color,
      color: 'white',
    }
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

  const workOrdersWithDistance = useMemo(() => {
    return workOrders.map(workOrder => ({
      ...workOrder,
      distanceFromUser: getWorkOrderDistance(workOrder)
    }))
  }, [workOrders, location])

  const sortedWorkOrders = useMemo(() => {
    let sorted = [...workOrdersWithDistance]
    
    if (sortBy === 'proximity' && location) {
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
        return dateB - dateA
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

  const filteredOrders = useMemo(() => {
    return sortedWorkOrders.filter(order => {
      const matchesFilter = filter === 'all' || 
        (filter === 'open' && order.status === 'New') ||
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

  const filterCounts = useMemo(() => ({
    all: workOrdersWithDistance.length,
    open: workOrdersWithDistance.filter(o => o.status === 'New').length,
    progress: workOrdersWithDistance.filter(o => o.status === 'In Progress').length,
    completed: workOrdersWithDistance.filter(o => o.status === 'Completed').length,
    nearby: location ? workOrdersWithDistance.filter(o => 
      o.distanceFromUser !== null && o.distanceFromUser !== undefined && o.distanceFromUser <= 10
    ).length : 0,
  }), [workOrdersWithDistance, location])

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
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Work Orders" />
      
      <main className="pb-24">
        {/* Search Section - Improved spacing and styling */}
        <div className="px-4 pt-4 pb-3 bg-white border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search work orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-base"
            />
          </div>
        </div>

        {/* Sort Options - Redesigned for better UX */}
        <div className="px-4 py-3 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Sort by</span>
            {sortBy === 'proximity' && location && (
              <span className="text-xs text-primary-600 font-medium">Smart sorting active</span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'proximity', label: 'Distance', icon: Navigation, disabled: !location },
              { key: 'date', label: 'Date', icon: Clock },
              { key: 'priority', label: 'Priority', icon: Filter },
            ].map((option) => (
              <motion.button
                key={option.key}
                onClick={() => !option.disabled && setSortBy(option.key as typeof sortBy)}
                disabled={option.disabled}
                className={`flex flex-col items-center justify-center space-y-1.5 px-3 py-3 rounded-xl text-xs font-medium transition-all min-h-[68px] ${
                  sortBy === option.key
                    ? 'bg-primary-600 text-white shadow-md'
                    : option.disabled
                    ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                }`}
                whileTap={!option.disabled ? { scale: 0.95 } : {}}
              >
                <option.icon className="w-5 h-5" />
                <span className="font-medium">{option.label}</span>
                {option.key === 'proximity' && !location && (
                  <span className="text-[10px] opacity-75">Enable location</span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Smart Sorting Indicator */}
        {sortBy === 'proximity' && location && (
          <motion.div
            className="mx-4 mt-3 bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Navigation className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary-900 mb-0.5">Smart Proximity Sorting</p>
                <p className="text-xs text-primary-700 leading-relaxed">
                  High priority within 5km first, then medium priority within 10km, then by distance
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filter Tabs - Improved design */}
        <div className="px-4 py-4">
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { key: 'all', label: 'All', count: filterCounts.all },
              { key: 'open', label: 'New', count: filterCounts.open },
              { key: 'progress', label: 'In Progress', count: filterCounts.progress },
              { key: 'completed', label: 'Completed', count: filterCounts.completed },
              { key: 'nearby', label: 'Near Me', count: filterCounts.nearby, icon: Navigation, disabled: !location },
            ].map((tab) => (
              <motion.button
                key={tab.key}
                onClick={() => !tab.disabled && setFilter(tab.key as typeof filter)}
                disabled={tab.disabled}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center space-x-2 ${
                  filter === tab.key
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                    : tab.disabled
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
                whileTap={!tab.disabled ? { scale: 0.95 } : {}}
              >
                {tab.icon && <tab.icon className="w-4 h-4" />}
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-xs font-bold ${
                  filter === tab.key ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {tab.count}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Work Orders List */}
        <div className="px-4">
          <OptimizedLoader
            isLoading={loading}
            delay={100}
            minDisplayTime={200}
            fallback={
              <div className="space-y-3">
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
                className="space-y-3"
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
                      className={`work-order-card priority-${(order.priority || 'low').toLowerCase()} hover:shadow-lg transition-all overflow-hidden bg-white rounded-2xl`}
                    >
                      {/* Compact View */}
                      <motion.div
                        className="p-4 cursor-pointer active:bg-gray-50"
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCardExpansion(order.id)
                        }}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1.5">
                              {order.priority === 'High' && (
                                <div className="w-2 h-2 bg-error-500 rounded-full animate-pulse"></div>
                              )}
                              <h3 className="font-bold text-gray-900 text-base truncate">
                                {order.vehicles?.license_plate || order.customerName || 'Unknown Vehicle'}
                              </h3>
                            </div>
                            {order.service && (
                              <p className="text-sm text-gray-600 line-clamp-1">{order.service}</p>
                            )}
                          </div>
                          <span 
                            className="px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 ml-3"
                            style={getStatusStyle(order.status)}
                          >
                            {order.status}
                          </span>
                        </div>

                        {/* Location and Distance */}
                        <div className="space-y-2 mb-3">
                          {(order.customerAddress || order.locations?.address) && (
                            <div className="flex items-start space-x-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                              <span className="line-clamp-1 flex-1">
                                {order.customerAddress || 'No address provided'}
                              </span>
                            </div>
                          )}
                          
                          {order.distanceFromUser !== null && order.distanceFromUser !== undefined ? (
                            <div className="inline-flex items-center space-x-1.5 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
                              <Navigation className="w-4 h-4" />
                              <span>{formatDistance(order.distanceFromUser)} away</span>
                            </div>
                          ) : locationLoading ? (
                            <div className="inline-flex items-center space-x-1.5 bg-gray-50 text-gray-500 px-3 py-1.5 rounded-lg text-sm">
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                              <span>Locating...</span>
                            </div>
                          ) : null}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-xs font-medium text-gray-500">{order.workOrderNumber}</span>
                          <div className="flex items-center space-x-1 text-xs text-primary-600 font-medium">
                            <span>{isExpanded ? 'Less' : 'More'} details</span>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="w-4 h-4 transform rotate-90" />
                            </motion.div>
                          </div>
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
                        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 bg-gray-50">
                          <div className="pt-4 space-y-3">
                            {(order.vehicles || order.vehicleModel) && (
                              <div className="flex items-center space-x-3 p-3 bg-white rounded-xl">
                                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Car className="w-5 h-5 text-primary-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-500 font-medium">Vehicle</p>
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {order.vehicles 
                                      ? `${order.vehicles.license_plate} - ${order.vehicles.year || ''} ${order.vehicles.make || ''} ${order.vehicles.model || ''}`.trim()
                                      : order.vehicleModel
                                    }
                                  </p>
                                </div>
                              </div>
                            )}

                            {order.customers && (
                              <div className="flex items-center space-x-3 p-3 bg-white rounded-xl">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <span className="text-lg">👤</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-500 font-medium">Customer</p>
                                  <p className="text-sm font-semibold text-gray-900 truncate">{order.customers.name}</p>
                                </div>
                              </div>
                            )}

                            {order.initialDiagnosis && (
                              <div className="p-3 bg-white rounded-xl">
                                <p className="text-xs font-semibold text-gray-700 mb-1.5">Initial Diagnosis</p>
                                <p className="text-sm text-gray-600 leading-relaxed">{order.initialDiagnosis}</p>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                              {order.appointmentDate && (
                                <div className="flex items-center space-x-2 p-3 bg-white rounded-xl">
                                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-xs text-gray-500 font-medium">Appointment</p>
                                    <p className="text-xs font-semibold text-gray-900 truncate">{formatDate(order.appointmentDate)}</p>
                                  </div>
                                </div>
                              )}

                              {order.priority && (
                                <div className="flex items-center space-x-2 p-3 bg-white rounded-xl">
                                  <div className="min-w-0">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Priority</p>
                                    <span 
                                      className="inline-block px-2 py-1 rounded-lg text-xs font-bold"
                                      style={getPriorityStyle(order.priority)}
                                    >
                                      {order.priority}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <EnhancedButton
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (order.customerPhone) {
                                    window.location.href = `tel:${order.customerPhone}`
                                  }
                                }}
                                variant="outline"
                                size="lg"
                                disabled={!order.customerPhone}
                                className="flex items-center justify-center space-x-2"
                              >
                                <Phone className="w-4 h-4" />
                                <span>Call</span>
                              </EnhancedButton>

                              <EnhancedButton
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleNavigateToDetails(order.id)
                                }}
                                size="lg"
                                className="flex items-center justify-center space-x-2"
                              >
                                <span>View Details</span>
                              </EnhancedButton>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </OptimizedLoader>
        </div>
      </main>
      
      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-24 right-5 z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <button
          onClick={() => window.location.href = '/work-orders/new'}
          className="w-16 h-16 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-2xl shadow-primary-600/40 flex items-center justify-center transition-all"
        >
          <Plus className="w-7 h-7" />
        </button>
      </motion.div>

      <MobileNavigation activeTab="work-orders" badges={badges} />
    </div>
  )
}
