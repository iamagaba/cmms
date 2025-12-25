'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MobileHeader } from '@/components/MobileHeader'
import { MobileNavigation } from '@/components/MobileNavigation'
import { generateBreadcrumbs } from '@/components/Breadcrumb'
import { useBadges } from '@/context/BadgeContext'
import { OptimizedLoader, WorkOrderDetailsSkeleton } from '@/components/OptimizedLoader'
import { usePerformance } from '@/hooks/usePerformance'
import { 
  Clock, MapPin, User, Car, Phone, Calendar, 
  FileText, Wrench, AlertCircle, CheckCircle2,
  Package, Activity
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { snakeToCamelCase } from '@/utils/data-helpers'
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
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Completed':
        return 'bg-success-100 text-success-800 border-success-200'
      case 'Confirmation':
        return 'bg-primary-100 text-primary-800 border-primary-200'
      case 'Ready':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'On Hold':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityStyle = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500 text-white'
      case 'Medium':
        return 'bg-blue-500 text-white'
      case 'Low':
        return 'bg-gray-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
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
              <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getPriorityStyle(workOrder.priority)}`}>
                {workOrder.priority} Priority
              </span>
            )}
          </div>
          <div className={`px-4 py-3 rounded-xl border-2 ${getStatusStyle(workOrder.status)} font-semibold text-center text-lg`}>
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

        {/* Parts Used */}
        {workOrder.partsUsed && workOrder.partsUsed.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Parts Used</h2>
            </div>
            <div className="space-y-2">
              {workOrder.partsUsed.map((part, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-base text-gray-900">{part.name}</span>
                  <span className="text-sm font-medium text-gray-600">Qty: {part.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Log */}
        {workOrder.activityLog && workOrder.activityLog.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Activity Log</h2>
            </div>
            <div className="space-y-3">
              {workOrder.activityLog.map((log, index) => (
                <div key={index} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
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

        {/* Timestamps */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
          </div>
          <div className="space-y-3">
            {workOrder.created_at && (
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-base text-gray-900">{formatDate(workOrder.created_at)}</p>
              </div>
            )}
            {workOrder.confirmed_at && (
              <div>
                <p className="text-sm text-gray-500">Confirmed</p>
                <p className="text-base text-gray-900">{formatDate(workOrder.confirmed_at)}</p>
              </div>
            )}
            {workOrder.work_started_at && (
              <div>
                <p className="text-sm text-gray-500">Work Started</p>
                <p className="text-base text-gray-900">{formatDate(workOrder.work_started_at)}</p>
              </div>
            )}
            {workOrder.completedAt && (
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-base font-medium text-green-600">{formatDate(workOrder.completedAt)}</p>
                </div>
              </div>
            )}
            {workOrder.slaDue && (
              <div>
                <p className="text-sm text-gray-500">SLA Due</p>
                <p className="text-base text-gray-900">{formatDate(workOrder.slaDue)}</p>
              </div>
            )}
          </div>
        </div>

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
