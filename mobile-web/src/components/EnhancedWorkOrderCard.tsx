'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Car, MapPin, Clock, User, Phone, ChevronDown, ChevronRight,
  Play, CheckCircle, Camera, FileText, AlertTriangle
} from 'lucide-react'
import { StatusChip } from './StatusChip'
import { getStatusColor, getPriorityColor } from '@/utils/statusColors'
import type { WorkOrder } from '@/types/database'

interface EnhancedWorkOrderCardProps {
  order: WorkOrder & {
    customers?: { name: string; phone?: string } | null
    vehicles?: { license_plate: string; make: string; model: string } | null
    distance?: number
    estimatedTime?: number
  }
  onAction: (action: string, orderId: string) => void
}

export function EnhancedWorkOrderCard({ order, onAction }: EnhancedWorkOrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Smart contextual actions based on status
  const getContextualActions = () => {
    switch (order.status) {
      case 'Open':
        return [
          { 
            id: 'start', 
            label: 'Start Work', 
            icon: Play, 
            primary: true, 
            color: 'bg-green-600 hover:bg-green-700 text-white' 
          },
          { 
            id: 'call', 
            label: 'Call Customer', 
            icon: Phone, 
            color: 'bg-blue-600 hover:bg-blue-700 text-white' 
          }
        ]
      case 'In Progress':
        return [
          { 
            id: 'photos', 
            label: 'Add Photos', 
            icon: Camera, 
            color: 'bg-primary-600 hover:bg-primary-700 text-white' 
          },
          { 
            id: 'complete', 
            label: 'Complete', 
            icon: CheckCircle, 
            primary: true, 
            color: 'bg-green-600 hover:bg-green-700 text-white' 
          }
        ]
      case 'Completed':
        return [
          { 
            id: 'report', 
            label: 'View Report', 
            icon: FileText, 
            color: 'bg-gray-600 hover:bg-gray-700 text-white' 
          }
        ]
      default:
        return []
    }
  }

  const actions = getContextualActions()
  const priorityColor = getPriorityColor(order.priority)

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200"
      style={{ borderTop: `4px solid ${priorityColor}` }}
      whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
      layout
    >
      {/* Primary Information - Always Visible */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Icon with status indicator */}
            <div className="relative">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${getStatusColor(order.status)}20` }}
              >
                <Car 
                  className="w-5 h-5" 
                  style={{ color: getStatusColor(order.status) }}
                />
              </div>
              {order.priority === 'High' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            
            {/* Primary Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {order.workOrderNumber}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {order.customerName || 'Unknown Customer'}
              </p>
            </div>
          </div>
          
          {/* Status Chip */}
          <StatusChip kind="status" value={order.status || 'Open'} />
        </div>

        {/* Secondary Info - Contextual */}
        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex items-center space-x-4">
            {order.distance && (
              <span className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                {order.distance.toFixed(1)}km away
              </span>
            )}
            {order.estimatedTime && (
              <span className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                {order.estimatedTime}min
              </span>
            )}
          </div>
          
          {/* Priority indicator */}
          {order.priority && (
            <span 
              className="px-2 py-1 rounded text-xs font-medium"
              style={{ 
                backgroundColor: priorityColor, 
                color: 'white' 
              }}
            >
              {order.priority}
            </span>
          )}
        </div>

        {/* Vehicle Info */}
        {order.vehicleModel && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <span className="font-medium">
              {order.vehicleModel}
            </span>
          </div>
        )}

        {/* Service Description - Truncated */}
        {(order.service || order.initialDiagnosis) && (
          <p className="text-sm text-gray-700 line-clamp-2 mb-3">
            {order.service || order.initialDiagnosis}
          </p>
        )}

        {/* Quick Actions */}
        {actions.length > 0 && (
          <div className="flex space-x-2 mb-3">
            {actions.slice(0, 2).map((action) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.id}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${action.color}`}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onAction(action.id, order.id)}
                >
                  <Icon className="w-4 h-4" />
                  <span>{action.label}</span>
                </motion.button>
              )
            })}
          </div>
        )}

        {/* Expand/Collapse Toggle */}
        <button
          className="w-full flex items-center justify-center py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="mr-2">
            {isExpanded ? 'Show Less' : 'Show More'}
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100"
          >
            <div className="p-4 space-y-3">
              {/* Customer Contact */}
              {order.customerPhone && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Customer Phone</span>
                  <button
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                    onClick={() => onAction('call', order.id)}
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">{order.customerPhone}</span>
                  </button>
                </div>
              )}

              {/* Appointment Date */}
              {order.appointmentDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Appointment</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(order.appointmentDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* SLA Due */}
              {order.slaDue && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">SLA Due</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(order.slaDue).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Full Description */}
              {order.initialDiagnosis && (
                <div>
                  <span className="text-sm text-gray-600 block mb-1">Diagnosis</span>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {order.initialDiagnosis}
                  </p>
                </div>
              )}

              {/* Additional Actions */}
              {actions.length > 2 && (
                <div className="flex space-x-2 pt-2">
                  {actions.slice(2).map((action) => {
                    const Icon = action.icon
                    return (
                      <motion.button
                        key={action.id}
                        className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${action.color}`}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAction(action.id, order.id)}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{action.label}</span>
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}