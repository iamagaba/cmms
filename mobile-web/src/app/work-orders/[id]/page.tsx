'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MobileHeader } from '@/components/MobileHeader'
import { MobileNavigation } from '@/components/MobileNavigation'
import { generateBreadcrumbs } from '@/components/Breadcrumb'
import { useBadges } from '@/context/BadgeContext'
import { OptimizedLoader, WorkOrderDetailsSkeleton } from '@/components/OptimizedLoader'
import { usePerformance } from '@/hooks/usePerformance'
import { 
  Clock, MapPin, User, Car, Phone, Calendar, 
  FileText, Wrench, AlertCircle, CheckCircle2,
  Package, Activity, DollarSign, Timer, TrendingUp,
  Circle, CheckCircle, XCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { snakeToCamelCase } from '@/utils/data-helpers'
import { getStatusColor, getPriorityColor } from '@/utils/statusColors'
import type { WorkOrder } from '@/types/database'

export default function WorkOrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const { badges } = useBadges()
  const { measureNavigation } = usePerformance()

  // Memoized breadcrumbs to prevent regeneration
  const breadcrumbs = useMemo(() => 
    generateBreadcrumbs('/work-orders/' + params.id, {
      [params.id as string]: workOrder?.workOrderNumber || 'Work Order Details'
    }), [params.id, workOrder?.workOrderNumber])

  useEffect(() => {
    const fetchWorkOrder = async () => {
      if (!params.id) return

      const navigation = measureNavigation('WorkOrderDetails')
      setLoading(true)
      
      try {
        // Optimized query with only necessary fields for faster loading
        const { data, error } = await supabase
          .from('work_orders')
          .select(`
            id, work_order_number, status, priority, customer_name, customer_phone,
            customer_address, vehicle_model, service, initial_diagnosis, issue_type,
            fault_code, maintenance_notes, service_notes, appointment_date,
            assigned_technician_id, parts_used, activity_log, created_at,
            confirmed_at, work_started_at, completed_at, sla_due, channel,
            on_hold_reason
          `)
          .eq('id', params.id)
          .single()

        if (error) {
          console.error('Error fetching work order:', error)
        } else if (data) {
          // Convert snake_case fields to camelCase to match the main app
          const transformedData = snakeToCamelCase(data) as WorkOrder
          setWorkOrder(transformedData)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
        navigation.complete()
      }
    }

    fetchWorkOrder()
  }, [params.id])

  const getStatusStyle = (status: WorkOrder['status']) => {
    const color = getStatusColor(status)
    return {
      backgroundColor: color + '20', // 20% opacity
      color: color,
      borderColor: color + '40', // 40% opacity
    }
  }

  const getPriorityStyle = (priority: WorkOrder['priority']) => {
    const color = getPriorityColor(priority)
    return {
      backgroundColor: color,
      color: 'white',
    }
  }

  // Calculate labor hours
  const calculateLaborHours = () => {
    if (!workOrder?.work_started_at) return null
    
    const startTime = new Date(workOrder.work_started_at).getTime()
    const endTime = workOrder.completedAt 
      ? new Date(workOrder.completedAt).getTime()
      : Date.now()
    
    const hours = (endTime - startTime) / (1000 * 60 * 60)
    return hours.toFixed(2)
  }

  // Calculate estimated costs
  const calculateCosts = () => {
    const laborRate = 50 // $50 per hour (configurable)
    const laborHours = parseFloat(calculateLaborHours() || '0')
    const laborCost = laborHours * laborRate
    
    // Calculate parts cost from partsUsed
    const partsCost = workOrder?.partsUsed?.reduce((total, part) => {
      // Assuming each part has a cost property, or use a default
      const partCost = (part as any).cost || 25 // Default $25 per part
      return total + (partCost * part.quantity)
    }, 0) || 0
    
    const totalCost = laborCost + partsCost
    const estimatedCost = totalCost * 1.2 // Add 20% buffer for estimate
    
    return {
      labor: laborCost,
      parts: partsCost,
      total: totalCost,
      estimated: estimatedCost
    }
  }

  // Timeline data
  const getTimelineEvents = () => {
    if (!workOrder) return []
    
    const events = []
    
    if (workOrder.created_at) {
      events.push({
        title: 'Work Order Created',
        timestamp: workOrder.created_at,
        icon: Circle,
        status: 'completed',
        description: `Created via ${workOrder.channel || 'system'}`
      })
    }
    
    if (workOrder.confirmed_at) {
      events.push({
        title: 'Confirmed',
        timestamp: workOrder.confirmed_at,
        icon: CheckCircle,
        status: 'completed',
        description: 'Customer confirmed appointment'
      })
    }
    
    if (workOrder.work_started_at) {
      events.push({
        title: 'Work Started',
        timestamp: workOrder.work_started_at,
        icon: Wrench,
        status: 'completed',
        description: 'Technician began work'
      })
    }
    
    if (workOrder.completedAt) {
      events.push({
        title: 'Completed',
        timestamp: workOrder.completedAt,
        icon: CheckCircle2,
        status: 'completed',
        description: 'Work order completed successfully'
      })
    } else if (workOrder.status === 'On Hold') {
      events.push({
        title: 'On Hold',
        timestamp: new Date().toISOString(),
        icon: XCircle,
        status: 'hold',
        description: workOrder.onHoldReason || 'Work paused'
      })
    } else if (workOrder.status === 'In Progress') {
      events.push({
        title: 'In Progress',
        timestamp: new Date().toISOString(),
        icon: Activity,
        status: 'active',
        description: 'Currently being worked on'
      })
    }
    
    return events.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader 
          title="Work Order Details" 
          showBack 
          onBack={() => router.back()}
          breadcrumbs={breadcrumbs}
          showBreadcrumbs={true}
        />
        <main className="px-4 py-6 pb-20">
          <OptimizedLoader 
            isLoading={true}
            delay={50}
            minDisplayTime={150}
            fallback={<WorkOrderDetailsSkeleton />}
          >
            <div />
          </OptimizedLoader>
        </main>
        <MobileNavigation badges={badges} />
      </div>
    )
  }

  if (!workOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader 
          title="Work Order Details" 
          showBack 
          onBack={() => router.back()}
          breadcrumbs={breadcrumbs}
          showBreadcrumbs={true}
        />
        <main className="px-4 py-6 pb-20">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Work Order Not Found</h3>
            <p className="text-gray-500 mb-4">The work order you&apos;re looking for doesn&apos;t exist.</p>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </main>
        <MobileNavigation badges={badges} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader 
        title={workOrder.workOrderNumber} 
        showBack 
        onBack={() => router.back()}
        breadcrumbs={breadcrumbs}
        showBreadcrumbs={true}
      />
      
      <main className="px-4 py-6 pb-20 space-y-4">
        {/* Status Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Status</h2>
            {workOrder.priority && (
              <span 
                className="px-3 py-1 rounded-lg text-sm font-semibold"
                style={getPriorityStyle(workOrder.priority)}
              >
                {workOrder.priority} Priority
              </span>
            )}
          </div>
          <div 
            className="px-4 py-3 rounded-xl border-2 font-semibold text-center text-lg"
            style={getStatusStyle(workOrder.status)}
          >
            {workOrder.status}
          </div>
          {workOrder.onHoldReason && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>On Hold Reason:</strong> {workOrder.onHoldReason}
              </p>
            </div>
          )}
        </div>

        {/* Visual Timeline */}
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center space-x-2 mb-6">
            <Activity className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {/* Timeline events */}
            <div className="space-y-6">
              {getTimelineEvents().map((event, index) => {
                const Icon = event.icon
                const isCompleted = event.status === 'completed'
                const isActive = event.status === 'active'
                const isHold = event.status === 'hold'
                
                return (
                  <motion.div
                    key={index}
                    className="relative flex items-start space-x-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Icon */}
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted ? 'bg-success-500' :
                      isActive ? 'bg-primary-500 animate-pulse' :
                      isHold ? 'bg-warning-500' :
                      'bg-gray-300'
                    }`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <span className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{event.description}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Labor Hours & Cost Breakdown */}
        {workOrder.work_started_at && (
          <motion.div 
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-2 mb-6">
              <DollarSign className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Cost Breakdown</h2>
            </div>
            
            {/* Labor Hours */}
            <div className="mb-6 p-4 bg-primary-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Timer className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-gray-900">Labor Hours</span>
                </div>
                <span className="text-2xl font-bold text-primary-600">
                  {calculateLaborHours()}h
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {workOrder.completedAt ? 'Total time spent' : 'Time elapsed so far'}
              </p>
            </div>

            {/* Cost Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Labor Cost</span>
                <span className="font-semibold text-gray-900">
                  ${calculateCosts().labor.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Parts Cost</span>
                <span className="font-semibold text-gray-900">
                  ${calculateCosts().parts.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-3 bg-gray-50 rounded-lg px-3 mt-3">
                <span className="font-semibold text-gray-900">Total Cost</span>
                <span className="text-xl font-bold text-primary-600">
                  ${calculateCosts().total.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2 text-sm">
                <span className="text-gray-500">Estimated Cost</span>
                <span className="text-gray-600">
                  ${calculateCosts().estimated.toFixed(2)}
                </span>
              </div>
              
              {/* Cost comparison */}
              {calculateCosts().total < calculateCosts().estimated && (
                <div className="flex items-center space-x-2 p-3 bg-success-50 rounded-lg mt-3">
                  <TrendingUp className="w-4 h-4 text-success-600" />
                  <span className="text-sm text-success-700 font-medium">
                    Under budget by ${(calculateCosts().estimated - calculateCosts().total).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Customer Information */}
        {workOrder.customerName && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Customer</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-base font-medium text-gray-900">{workOrder.customerName}</p>
              </div>
              {workOrder.customerPhone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <a 
                    href={`tel:${workOrder.customerPhone}`}
                    className="text-base font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{workOrder.customerPhone}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vehicle Information */}
        {workOrder.vehicleModel && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <Car className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Vehicle</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Model</p>
                <p className="text-base font-medium text-gray-900">{workOrder.vehicleModel}</p>
              </div>
            </div>
          </div>
        )}

        {/* Service Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <Wrench className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Service Details</h2>
          </div>
          <div className="space-y-3">
            {workOrder.service && (
              <div>
                <p className="text-sm text-gray-500">Service Type</p>
                <p className="text-base font-medium text-gray-900">{workOrder.service}</p>
              </div>
            )}
            {workOrder.initialDiagnosis && (
              <div>
                <p className="text-sm text-gray-500">Initial Diagnosis</p>
                <p className="text-base text-gray-900">{workOrder.initialDiagnosis}</p>
              </div>
            )}
            {workOrder.issueType && (
              <div>
                <p className="text-sm text-gray-500">Issue Type</p>
                <p className="text-base text-gray-900">{workOrder.issueType}</p>
              </div>
            )}
            {workOrder.faultCode && (
              <div>
                <p className="text-sm text-gray-500">Fault Code</p>
                <p className="text-base font-mono text-sm text-gray-900">{workOrder.faultCode}</p>
              </div>
            )}
            {workOrder.maintenanceNotes && (
              <div>
                <p className="text-sm text-gray-500">Maintenance Notes</p>
                <p className="text-base text-gray-900">{workOrder.maintenanceNotes}</p>
              </div>
            )}
            {workOrder.serviceNotes && (
              <div>
                <p className="text-sm text-gray-500">Service Notes</p>
                <p className="text-base text-gray-900">{workOrder.serviceNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Schedule & Location */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Schedule & Location</h2>
          </div>
          <div className="space-y-3">
            {workOrder.appointmentDate && (
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Appointment</p>
                  <p className="text-base font-medium text-gray-900">{formatDate(workOrder.appointmentDate)}</p>
                </div>
              </div>
            )}
            {workOrder.customerAddress && (
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-base text-gray-900">{workOrder.customerAddress}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Technician */}
        {workOrder.assignedTechnicianId && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Assigned Technician</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Technician ID</p>
                <p className="text-base font-medium text-gray-900">{workOrder.assignedTechnicianId}</p>
              </div>
            </div>
          </div>
        )}

        {/* Parts Used - Enhanced */}
        {workOrder.partsUsed && workOrder.partsUsed.length > 0 && (
          <motion.div 
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">Parts Used</h2>
              </div>
              <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-sm font-semibold">
                {workOrder.partsUsed.length} {workOrder.partsUsed.length === 1 ? 'Part' : 'Parts'}
              </span>
            </div>
            
            <div className="space-y-3">
              {workOrder.partsUsed.map((part, index) => {
                const partCost = (part as any).cost || 25 // Default cost if not available
                const totalPartCost = partCost * part.quantity
                
                return (
                  <motion.div 
                    key={index} 
                    className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{part.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <span className="font-medium">Qty:</span>
                            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded font-semibold">
                              {part.quantity}
                            </span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <span className="font-medium">Unit:</span>
                            <span>${partCost.toFixed(2)}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Total</p>
                        <p className="text-lg font-bold text-primary-600">
                          ${totalPartCost.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Part status indicator */}
                    <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200">
                      <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">In Stock</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
            
            {/* Parts Summary */}
            <div className="mt-4 p-4 bg-primary-50 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Total Parts Cost</span>
                <span className="text-xl font-bold text-primary-600">
                  ${calculateCosts().parts.toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Activity Log */}
        {workOrder.activityLog && workOrder.activityLog.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Activity Log</h2>
            </div>
            <div className="space-y-3">
              {workOrder.activityLog.map((log, index) => (
                <div key={index} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-base text-gray-900">{log.activity}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(log.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Info */}
        {workOrder.channel && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Channel</p>
                <p className="text-base font-medium text-gray-900">{workOrder.channel}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <MobileNavigation badges={badges} />
    </div>
  )
}
