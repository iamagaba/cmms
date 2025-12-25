'use client'

import { motion } from 'framer-motion'
import { 
  Play, 
  Phone, 
  Camera, 
  CheckCircle, 
  FileText, 
  MapPin, 
  Clock,
  AlertTriangle,
  User,
  Wrench
} from 'lucide-react'
import type { WorkOrder } from '@/types/database'

interface Action {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  primary?: boolean
  color?: string
  bgColor?: string
  action: () => void
  disabled?: boolean
  loading?: boolean
}

interface ContextualActionsProps {
  workOrder: WorkOrder
  onAction: (actionId: string, workOrder: WorkOrder) => void
  className?: string
}

export function ContextualActions({ workOrder, onAction, className = '' }: ContextualActionsProps) {
  const getActionsForStatus = (order: WorkOrder): Action[] => {
    const baseActions: Action[] = []

    switch (order.status) {
      case 'Open':
        baseActions.push(
          {
            id: 'start-work',
            label: 'Start Work',
            icon: Play,
            primary: true,
            color: 'white',
            bgColor: 'var(--brand-primary)',
            action: () => onAction('start-work', order)
          },
          {
            id: 'call-customer',
            label: 'Call Customer',
            icon: Phone,
            color: 'var(--brand-primary)',
            bgColor: '#F8F5FC',
            action: () => onAction('call-customer', order)
          }
        )
        break

      case 'In Progress':
        baseActions.push(
          {
            id: 'add-photos',
            label: 'Add Photos',
            icon: Camera,
            color: 'var(--brand-primary)',
            bgColor: '#F8F5FC',
            action: () => onAction('add-photos', order)
          },
          {
            id: 'complete-work',
            label: 'Complete',
            icon: CheckCircle,
            primary: true,
            color: 'white',
            bgColor: '#52c41a',
            action: () => onAction('complete-work', order)
          }
        )
        break

      case 'Completed':
        baseActions.push(
          {
            id: 'view-report',
            label: 'View Report',
            icon: FileText,
            color: 'var(--brand-primary)',
            bgColor: '#F8F5FC',
            action: () => onAction('view-report', order)
          }
        )
        break

      case 'On Hold':
        baseActions.push(
          {
            id: 'resume-work',
            label: 'Resume Work',
            icon: Play,
            primary: true,
            color: 'white',
            bgColor: 'var(--brand-primary)',
            action: () => onAction('resume-work', order)
          },
          {
            id: 'update-status',
            label: 'Update Status',
            icon: AlertTriangle,
            color: '#faad14',
            bgColor: '#fffbe6',
            action: () => onAction('update-status', order)
          }
        )
        break

      default:
        baseActions.push(
          {
            id: 'view-details',
            label: 'View Details',
            icon: FileText,
            color: 'var(--brand-primary)',
            bgColor: '#F8F5FC',
            action: () => onAction('view-details', order)
          }
        )
    }

    // Add common actions based on context
    if (order.priority === 'High') {
      baseActions.unshift({
        id: 'urgent-action',
        label: 'Urgent',
        icon: AlertTriangle,
        color: 'white',
        bgColor: '#ff4d4f',
        action: () => onAction('urgent-action', order)
      })
    }

    // Add location-based actions if coordinates exist
    if (order.customerLat && order.customerLng) {
      baseActions.push({
        id: 'navigate',
        label: 'Navigate',
        icon: MapPin,
        color: '#52c41a',
        bgColor: '#f6ffed',
        action: () => onAction('navigate', order)
      })
    }

    return baseActions
  }

  const actions = getActionsForStatus(workOrder)

  if (actions.length === 0) return null

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {actions.map((action, index) => {
        const IconComponent = action.icon
        const isPrimary = action.primary
        
        return (
          <motion.button
            key={action.id}
            onClick={action.action}
            disabled={action.disabled || action.loading}
            className={`
              flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium text-sm
              transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
              ${isPrimary ? 'min-w-[120px] flex-1' : 'flex-shrink-0'}
            `}
            style={{
              backgroundColor: action.bgColor,
              color: action.color,
            }}
            whileHover={!action.disabled ? { 
              scale: 1.02,
              y: -1,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            } : {}}
            whileTap={!action.disabled ? { scale: 0.98 } : {}}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {action.loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <IconComponent className="w-4 h-4" />
            )}
            <span>{action.label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

// Quick Action Floating Button
interface QuickActionFABProps {
  workOrder: WorkOrder
  onAction: (actionId: string, workOrder: WorkOrder) => void
}

export function QuickActionFAB({ workOrder, onAction }: QuickActionFABProps) {
  const getPrimaryAction = (order: WorkOrder): Action | null => {
    switch (order.status) {
      case 'Open':
        return {
          id: 'start-work',
          label: 'Start Work',
          icon: Play,
          primary: true,
          color: 'white',
          bgColor: 'var(--brand-primary)',
          action: () => onAction('start-work', order)
        }
      case 'In Progress':
        return {
          id: 'complete-work',
          label: 'Complete',
          icon: CheckCircle,
          primary: true,
          color: 'white',
          bgColor: '#52c41a',
          action: () => onAction('complete-work', order)
        }
      default:
        return null
    }
  }

  const primaryAction = getPrimaryAction(workOrder)
  if (!primaryAction) return null

  const IconComponent = primaryAction.icon

  return (
    <motion.button
      onClick={primaryAction.action}
      className="fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40"
      style={{ backgroundColor: primaryAction.bgColor }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <IconComponent className="w-6 h-6" style={{ color: primaryAction.color }} />
    </motion.button>
  )
}

export default ContextualActions