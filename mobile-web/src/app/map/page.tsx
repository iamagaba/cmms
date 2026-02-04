'use client'

import { useState, useEffect } from 'react'
import { MobileHeader } from '@/components/MobileHeader'
import { MobileNavigation } from '@/components/MobileNavigation'
import { 
  MapPin, Navigation, Search, 
  Car, User, Clock, Phone, ChevronRight
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { WorkOrder } from '@/types/database'
import { MobileMapbox } from '@/components/MobileMapbox'
import { getStatusColor, getPriorityColor } from '@/utils/statusColors'

export default function MapViewPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'today' | 'nearby'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Location access denied:', error)
        }
      )
    }

    const fetchWorkOrders = async () => {
      setLoading(true)
      
      try {
        const { data, error } = await supabase
          .from('work_orders')
          .select(`
            *,
            customers (id, name, phone),
            vehicles (id, make, model, year, license_plate),
            locations (id, name, address, lat, lng),
            technicians (id, name, phone)
          `)
          .not('customerLat', 'is', null)
          .not('customerLng', 'is', null)
          .in('status', ['New', 'In Progress', 'Confirmation', 'Ready'])
          .order('created_at', { ascending: false })

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

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const filteredOrders = workOrders.filter(order => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const matchesFilter = filter === 'all' || 
      (filter === 'today' && order.appointmentDate && 
       new Date(order.appointmentDate).toDateString() === today.toDateString()) ||
      (filter === 'nearby' && userLocation && order.customerLat && order.customerLng &&
       calculateDistance(userLocation.lat, userLocation.lng, order.customerLat, order.customerLng) <= 10)
    
    const matchesSearch = searchQuery === '' || 
      order.workOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customers?.name && order.customers.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customerAddress && order.customerAddress.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesFilter && matchesSearch
  })



  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date set'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const openInMaps = (lat: number, lng: number) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const url = isIOS 
      ? `maps://maps.google.com/maps?daddr=${lat},${lng}&amp;ll=`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Map View" />
      
      <main className="pb-20">
        {/* Search and Filter - Improved Design */}
        <div className="px-4 pt-4 pb-3 bg-white border-b border-gray-100 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-base"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { key: 'all', label: 'All Locations', icon: MapPin },
              { key: 'today', label: 'Today', icon: Clock },
              { key: 'nearby', label: 'Nearby', icon: Navigation },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as typeof filter)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center space-x-2 ${
                    filter === tab.key
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Interactive Map - Enhanced Container */}
        <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <MobileMapbox
            center={userLocation ? [userLocation.lng, userLocation.lat] : [32.58, 0.32]}
            zoom={userLocation ? 13 : 10}
            height="400px"
            markers={filteredOrders.map(order => ({
              lng: order.customerLng!,
              lat: order.customerLat!,
              color: order.priority === 'High' ? getPriorityColor(order.priority) : getStatusColor(order.status),
              workOrderId: order.id,
              status: order.status || '',
              priority: order.priority || '',
              popupText: `
                <div style="padding: 8px;">
                  <div style="font-weight: bold; margin-bottom: 4px;">${order.workOrderNumber}</div>
                  <div style="margin-bottom: 4px;">Status: <span style="color: ${getStatusColor(order.status)}">${order.status}</span></div>
                  ${order.priority ? `<div style="margin-bottom: 4px;">Priority: ${order.priority}</div>` : ''}
                  ${order.customers?.name ? `<div style="margin-bottom: 4px;">Customer: ${order.customers.name}</div>` : ''}
                  ${order.vehicles ? `<div style="margin-bottom: 4px;">Vehicle: ${order.vehicles.year} ${order.vehicles.make} ${order.vehicles.model}</div>` : ''}
                  ${order.service ? `<div style="margin-bottom: 4px;">Service: ${order.service}</div>` : ''}
                  ${order.customerAddress ? `<div style="margin-bottom: 4px;">Address: ${order.customerAddress}</div>` : ''}
                  ${order.appointmentDate ? `<div>Appointment: ${formatDate(order.appointmentDate)}</div>` : ''}
                </div>
              `
            }))}
            onMarkerClick={(workOrderId) => {
              window.location.href = `/work-orders/${workOrderId}`
            }}
          />
          
          {/* Map Legend - Enhanced Design */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center space-x-4 flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full shadow-sm" 
                    style={{ backgroundColor: getPriorityColor('High') }}
                  ></div>
                  <span className="text-sm text-gray-700 font-medium">High Priority</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full shadow-sm" 
                    style={{ backgroundColor: getStatusColor('In Progress') }}
                  ></div>
                  <span className="text-sm text-gray-700 font-medium">In Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full shadow-sm" 
                    style={{ backgroundColor: getStatusColor('New') }}
                  ></div>
                  <span className="text-sm text-gray-700 font-medium">New</span>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-semibold">
                {filteredOrders.length} locations
              </div>
            </div>
          </div>
        </div>

        {/* Location List - Enhanced Design */}
        <div className="px-4 mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Work Order Locations</h2>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">{filteredOrders.length} total</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No locations found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm" 
                        style={{ backgroundColor: order.priority === 'High' ? getPriorityColor(order.priority) : getStatusColor(order.status) }}
                      ></div>
                      <div>
                        <p className="font-bold text-gray-900">{order.workOrderNumber}</p>
                        <p className="text-sm text-gray-500">{order.status}</p>
                      </div>
                    </div>
                    {order.priority === 'High' && (
                      <span className="px-2.5 py-1 bg-error-100 text-error-800 text-xs font-bold rounded-lg">
                        High Priority
                      </span>
                    )}
                  </div>

                  {/* Customer & Vehicle */}
                  <div className="space-y-2 mb-3">
                    {order.customers && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 text-gray-700 flex-1 min-w-0">
                          <User className="w-4 h-4 flex-shrink-0 text-gray-400" />
                          <span className="truncate font-medium">{order.customers.name}</span>
                        </div>
                        {order.customers.phone && (
                          <a 
                            href={`tel:${order.customers.phone}`}
                            className="ml-2 p-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}
                    {order.vehicles && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Car className="w-4 h-4 flex-shrink-0 text-gray-400" />
                        <span className="truncate">{order.vehicles.year} {order.vehicles.make} {order.vehicles.model}</span>
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="mb-3 p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-start space-x-2 text-sm">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-medium line-clamp-2">
                          {order.customerAddress || order.locations?.address || 'Address not available'}
                        </p>
                        {userLocation && order.customerLat && order.customerLng && (
                          <p className="text-xs text-primary-600 font-semibold mt-1">
                            {calculateDistance(
                              userLocation.lat, 
                              userLocation.lng, 
                              order.customerLat, 
                              order.customerLng
                            ).toFixed(1)} km away
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Appointment */}
                  {order.appointmentDate && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3 p-2 bg-blue-50 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">{formatDate(order.appointmentDate)}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => window.location.href = `/work-orders/${order.id}`}
                      className="flex-1 flex items-center justify-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold text-sm py-2.5 px-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    
                    {order.customerLat && order.customerLng && (
                      <button
                        onClick={() => openInMaps(
                          order.customerLat!, 
                          order.customerLng!
                        )}
                        className="flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl hover:bg-primary-700 transition-colors text-sm font-semibold shadow-sm"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>Navigate</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location Stats - Enhanced Design */}
        {!loading && workOrders.length > 0 && (
          <div className="mx-4 mt-6 mb-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Location Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-4 bg-primary-50 rounded-xl">
                <p className="text-3xl font-bold text-primary-600">{workOrders.length}</p>
                <p className="text-sm text-primary-700 font-medium mt-1">Total Locations</p>
              </div>
              <div className="text-center p-4 bg-warning-50 rounded-xl">
                <p className="text-3xl font-bold text-warning-600">
                  {workOrders.filter(o => o.status === 'In Progress').length}
                </p>
                <p className="text-sm text-warning-700 font-medium mt-1">In Progress</p>
              </div>
              <div className="text-center p-4 bg-success-50 rounded-xl">
                <p className="text-3xl font-bold text-success-600">
                  {workOrders.filter(o => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    return o.appointmentDate && 
                           new Date(o.appointmentDate).toDateString() === today.toDateString()
                  }).length}
                </p>
                <p className="text-sm text-success-700 font-medium mt-1">Today</p>
              </div>
              <div className="text-center p-4 bg-error-50 rounded-xl">
                <p className="text-3xl font-bold text-error-600">
                  {workOrders.filter(o => o.priority === 'High').length}
                </p>
                <p className="text-sm text-error-700 font-medium mt-1">High Priority</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <MobileNavigation />
    </div>
  )
}