'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, Clock, Route, AlertTriangle } from 'lucide-react'
import type { WorkOrder } from '@/types/database'

interface LocationContextProps {
  userLocation: { lat: number; lng: number } | null
  workOrders: WorkOrder[]
  onNavigate: (workOrder: WorkOrder) => void
  onPlanRoute: (workOrders: WorkOrder[]) => void
  className?: string
}

interface NearbyWorkOrder extends WorkOrder {
  distance: number
  estimatedTime: number
}

export function LocationContext({
  userLocation,
  workOrders,
  onNavigate,
  onPlanRoute,
  className = ''
}: LocationContextProps) {
  const [nearbyOrders, setNearbyOrders] = useState<NearbyWorkOrder[]>([])
  const [showAll, setShowAll] = useState(false)

  // Calculate distances and filter nearby work orders
  useEffect(() => {
    if (!userLocation || !workOrders.length) {
      setNearbyOrders([])
      return
    }

    const ordersWithDistance = workOrders
      .filter(order => order.customerLat && order.customerLng && order.status !== 'Completed')
      .map(order => {
        const distance = calculateDistance(
          userLocation,
          { lat: order.customerLat!, lng: order.customerLng! }
        )
        const estimatedTime = Math.round(distance * 2) // Rough estimate: 2 min per km
        
        return {
          ...order,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
          estimatedTime
        }
      })
      .filter(order => order.distance <= 15) // Within 15km
      .sort((a, b) => {
        // Sort by priority first, then distance
        const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 }
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3
        
        if (aPriority !== bPriority) return aPriority - bPriority
        return a.distance - b.distance
      })

    setNearbyOrders(ordersWithDistance)
  }, [userLocation, workOrders])

  const calculateDistance = (
    from: { lat: number; lng: number },
    to: { lat: number; lng: number }
  ): number => {
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

  const toRad = (degrees: number): number => degrees * (Math.PI / 180)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-500'
      case 'In Progress': return 'bg-yellow-500'
      case 'On Hold': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600'
      case 'Medium': return 'text-yellow-600'
      case 'Low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  if (!userLocation) {
    return (
      <div className={`card-mobile ${className}`}>
        <div className="flex items-center space-x-3 text-gray-500">
          <MapPin className="w-5 h-5" />
          <div>
            <p className="font-medium">Location access needed</p>
            <p className="text-sm">Enable location to see nearby work orders</p>
          </div>
        </div>
      </div>
    )
  }

  if (nearbyOrders.length === 0) {
    return (
      <div className={`card-mobile ${className}`}>
        <div className="flex items-center space-x-3 text-gray-500">
          <MapPin className="w-5 h-5" />
          <div>
            <p className="font-medium">No nearby work orders</p>
            <p className="text-sm">All work orders are more than 15km away</p>
          </div>
        </div>
      </div>
    )
  }

  const displayedOrders = showAll ? nearbyOrders : nearbyOrders.slice(0, 3)
  const hasMore = nearbyOrders.length > 3

  return (
    <div className={`card-mobile ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-900">Nearby Work Orders</span>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
            {nearbyOrders.length}
          </span>
        </div>
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {showAll ? 'Show Less' : 'View All'}
          </button>
        )}
      </div>

      {/* Work Orders List */}
      <div className="space-y-3 mb-4">
        <AnimatePresence>
          {displayedOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => onNavigate(order)}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {/* Status indicator */}
                <div className={`w-3 h-3 rounded-full ${getStatusColor(order.status || 'Open')}`} />
                
                {/* Work order info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 text-sm">
                      {order.workOrderNumber}
                    </span>
                    {order.priority === 'High' && (
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {order.customers?.name || 'Unknown Customer'}
                  </p>
                </div>
              </div>

              {/* Distance and time */}
              <div className="flex items-center space-x-3 text-xs text-gray-500 flex-shrink-0">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span className="font-medium">{order.distance}km</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{order.estimatedTime}min</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Route Planning */}
      {nearbyOrders.length > 1 && (
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => onPlanRoute(nearbyOrders)}
            className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <Route className="w-4 h-4" />
            <span>Plan Optimal Route ({nearbyOrders.length} stops)</span>
          </button>
          
          <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-gray-500">
            <span>Total: {nearbyOrders.reduce((sum, order) => sum + order.distance, 0).toFixed(1)}km</span>
            <span>•</span>
            <span>Est: {nearbyOrders.reduce((sum, order) => sum + order.estimatedTime, 0)}min</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Quick Location Actions Component
export function QuickLocationActions({
  userLocation,
  onRequestLocation,
  onOpenMaps,
  className = ''
}: {
  userLocation: { lat: number; lng: number } | null
  onRequestLocation: () => void
  onOpenMaps: () => void
  className?: string
}) {
  if (!userLocation) {
    return (
      <button
        onClick={onRequestLocation}
        className={`flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors ${className}`}
      >
        <MapPin className="w-4 h-4" />
        <span className="font-medium">Enable Location</span>
      </button>
    )
  }

  return (
    <div className={`flex space-x-2 ${className}`}>
      <button
        onClick={onOpenMaps}
        className="flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg hover:bg-green-100 transition-colors flex-1"
      >
        <Navigation className="w-4 h-4" />
        <span className="font-medium">Open Maps</span>
      </button>
    </div>
  )
}

export default LocationContext