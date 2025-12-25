'use client'

import { useState, useEffect } from 'react'
import { Clock, MapPin, Car, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { WorkOrder } from '@/types/database'

export function RecentWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchWorkOrders = async () => {
      setLoading(true)
      
      try {
        const { data, error } = await supabase
          .from('work_orders')
          .select(`
            *,
            customers (id, name, phone),
            vehicles (id, make, model, year, license_plate),
            locations (id, name, address)
          `)
          .in('status', ['Open', 'In Progress', 'Confirmation', 'Ready'])
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) {
          console.error('Error fetching work orders:', error)
        } else if (data) {
          setWorkOrders(data as WorkOrder[])
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
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800'
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Confirmation':
        return 'bg-purple-100 text-purple-800'
      case 'Ready':
        return 'bg-cyan-100 text-cyan-800'
      case 'On Hold':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Work Orders</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (workOrders.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl">📋</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Recent Work Orders</h2>
        <p className="text-gray-500 mb-1">No work orders assigned</p>
        <p className="text-sm text-gray-400">Check back later or contact dispatch</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Work Orders</h2>
        <button className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors">
          View All
        </button>
      </div>
      
      <div className="space-y-3">
        {workOrders.map((order) => {
          const isExpanded = expandedCards.has(order.id)
          
          return (
            <div
              key={order.id}
              className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all"
            >
              {/* Compact View - Critical Info Only */}
              <div
                className="p-4 cursor-pointer active:bg-gray-50"
                onClick={(e) => {
                  e.stopPropagation()
                  setExpandedCards(prev => {
                    const newSet = new Set(prev)
                    if (newSet.has(order.id)) {
                      newSet.delete(order.id)
                    } else {
                      newSet.add(order.id)
                    }
                    return newSet
                  })
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {order.priority === 'High' && (
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                      <span className="font-medium text-gray-900 truncate">
                        {order.customers?.name || 'Unknown'}
                      </span>
                    </div>
                    {order.service && (
                      <p className="text-sm text-gray-600 truncate">{order.service}</p>
                    )}
                    {(order.customerAddress || order.locations?.address) && !isExpanded && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">
                          {order.customerAddress || order.locations?.address}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Expand Indicator */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">{order.workOrderNumber}</span>
                  <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                    <ChevronRight className="w-4 h-4 text-gray-400 transform rotate-90" />
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3 bg-gray-50">
                  {/* Vehicle */}
                  {order.vehicles && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Car className="w-4 h-4" />
                      <span>{order.vehicles.year} {order.vehicles.make} {order.vehicles.model}</span>
                    </div>
                  )}

                  {/* Diagnosis */}
                  {order.initialDiagnosis && (
                    <p className="text-xs text-gray-600 bg-white rounded p-2">
                      {order.initialDiagnosis}
                    </p>
                  )}

                  {/* Appointment */}
                  {order.appointmentDate && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(order.appointmentDate)}</span>
                    </div>
                  )}

                  {/* View Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.location.href = `/work-orders/${order.id}`
                    }}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}