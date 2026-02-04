'use client'

import { useState } from 'react'
import { 
  Play, CheckCircle, Camera, FileText, Phone, MapPin, 
  Clock, AlertTriangle, User, Wrench, Calendar
} from 'lucide-react'

export interface ContextualAction {
  id: string
  label: string
  icon: any
  primary?: boolean
  color: string
  description?: string
  requiresConfirmation?: boolean
}

export function useContextualActions() {
  const [loading, setLoading] = useState<string | null>(null)

  const getWorkOrderActions = (status: string, priority?: string): ContextualAction[] => {
    const baseActions: Record<string, ContextualAction[]> = {
      'New': [
        {
          id: 'start',
          label: 'Start Work',
          icon: Play,
          primary: true,
          color: 'bg-green-600 hover:bg-green-700 text-white',
          description: 'Begin working on this order'
        },
        {
          id: 'call',
          label: 'Call Customer',
          icon: Phone,
          color: 'bg-blue-600 hover:bg-blue-700 text-white',
          description: 'Contact the customer'
        },
        {
          id: 'navigate',
          label: 'Navigate',
          icon: MapPin,
          color: 'bg-purple-600 hover:bg-purple-700 text-white',
          description: 'Get directions to location'
        }
      ],
      'In Progress': [
        {
          id: 'photos',
          label: 'Add Photos',
          icon: Camera,
          color: 'bg-purple-600 hover:bg-purple-700 text-white',
          description: 'Document the work with photos'
        },
        {
          id: 'complete',
          label: 'Complete',
          icon: CheckCircle,
          primary: true,
          color: 'bg-green-600 hover:bg-green-700 text-white',
          description: 'Mark work order as completed',
          requiresConfirmation: true
        },
        {
          id: 'hold',
          label: 'Put on Hold',
          icon: Clock,
          color: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          description: 'Temporarily pause this work order'
        }
      ],
      'Completed': [
        {
          id: 'report',
          label: 'View Report',
          icon: FileText,
          color: 'bg-gray-600 hover:bg-gray-700 text-white',
          description: 'View completion report'
        },
        {
          id: 'invoice',
          label: 'Generate Invoice',
          icon: FileText,
          color: 'bg-blue-600 hover:bg-blue-700 text-white',
          description: 'Create invoice for customer'
        }
      ],
      'On Hold': [
        {
          id: 'resume',
          label: 'Resume Work',
          icon: Play,
          primary: true,
          color: 'bg-green-600 hover:bg-green-700 text-white',
          description: 'Continue working on this order'
        },
        {
          id: 'cancel',
          label: 'Cancel Order',
          icon: AlertTriangle,
          color: 'bg-red-600 hover:bg-red-700 text-white',
          description: 'Cancel this work order',
          requiresConfirmation: true
        }
      ]
    }

    let actions = baseActions[status] || []

    // Add priority-specific actions
    if (priority === 'High') {
      actions = actions.map(action => ({
        ...action,
        primary: action.id === 'start' || action.id === 'complete' ? true : action.primary
      }))
    }

    return actions
  }

  const getAssetActions = (assetType: string, health?: number): ContextualAction[] => {
    const baseActions: ContextualAction[] = [
      {
        id: 'inspect',
        label: 'Quick Inspect',
        icon: Wrench,
        color: 'bg-blue-600 hover:bg-blue-700 text-white',
        description: 'Perform quick inspection'
      },
      {
        id: 'service',
        label: 'Schedule Service',
        icon: Calendar,
        color: 'bg-purple-600 hover:bg-purple-700 text-white',
        description: 'Schedule maintenance service'
      }
    ]

    // Add health-based actions
    if (health && health < 70) {
      baseActions.unshift({
        id: 'urgent_service',
        label: 'Urgent Service',
        icon: AlertTriangle,
        primary: true,
        color: 'bg-red-600 hover:bg-red-700 text-white',
        description: 'Schedule urgent maintenance',
        requiresConfirmation: true
      })
    }

    return baseActions
  }

  const executeAction = async (actionId: string, entityId: string, entityType: 'workorder' | 'asset') => {
    setLoading(actionId)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      switch (actionId) {
        case 'start':
          console.log(`Starting work order ${entityId}`)
          break
        case 'complete':
          console.log(`Completing work order ${entityId}`)
          break
        case 'call':
          console.log(`Calling customer for ${entityId}`)
          break
        case 'navigate':
          console.log(`Navigating to ${entityId}`)
          break
        case 'photos':
          console.log(`Adding photos to ${entityId}`)
          break
        case 'inspect':
          console.log(`Inspecting asset ${entityId}`)
          break
        default:
          console.log(`Executing ${actionId} on ${entityId}`)
      }
      
      return { success: true }
    } catch (error) {
      console.error(`Failed to execute ${actionId}:`, error)
      return { success: false, error }
    } finally {
      setLoading(null)
    }
  }

  return {
    getWorkOrderActions,
    getAssetActions,
    executeAction,
    loading
  }
}