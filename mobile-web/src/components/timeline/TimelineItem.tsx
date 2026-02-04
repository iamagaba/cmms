'use client'

import { useMemo } from 'react'
import { 
  Plus, User, Play, Pause, Check, MessageSquare, 
  ArrowRight, AlertTriangle 
} from 'lucide-react'
import { getActivityTypeConfig, getActivityTypeBgColor } from '@/utils/activity-type-config'
import type { ActivityItemProps } from '@/types/activity-timeline'

/**
 * Icon mapping for activity types
 */
const ACTIVITY_ICONS = {
  created: Plus,
  assigned: User,
  started: Play,
  paused: Pause,
  completed: Check,
  note_added: MessageSquare,
  status_changed: ArrowRight,
  priority_changed: AlertTriangle,
}

/**
 * TimelineItem - Mobile-optimized activity display component
 * Features:
 * - Touch-friendly interactions with proper tap target sizes (min 44px)
 * - Industrial color system (steel blue, safety orange)
 * - Enhanced visual feedback for touch interactions
 * - Improved accessibility with proper contrast and spacing
 */
export function TimelineItem({
  activity,
  showAvatar = true,
  showMetadata = true,
  isLatest = false,
  onClick,
  className = ''
}: ActivityItemProps) {
  const typeConfig = getActivityTypeConfig(activity.activity_type)
  const IconComponent = ACTIVITY_ICONS[activity.activity_type]
  const bgColor = getActivityTypeBgColor(activity.activity_type)
  
  const formattedTime = useMemo(() => {
    const date = new Date(activity.created_at)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }, [activity.created_at])

  const formattedDate = useMemo(() => {
    const date = new Date(activity.created_at)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }, [activity.created_at])

  const handleClick = () => {
    onClick?.(activity)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onClick(activity)
    }
  }

  return (
    <div
      className={`
        relative flex gap-4 p-4 
        ${isLatest ? 'bg-primary-50 border-l-4 border-l-primary-600' : 'bg-white'}
        border-b border-gray-200 last:border-b-0
        min-h-[60px] touch-manipulation
        ${onClick ? 'hover:bg-gray-50 active:bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset' : ''}
        transition-all duration-200 ease-in-out
        ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `View details for ${activity.title}` : undefined}
    >
      {/* Activity type indicator - Enhanced for mobile */}
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-full 
        flex items-center justify-center
        ${bgColor}
        border-2 ${typeConfig.color.replace('text-', 'border-')}
        shadow-sm
      `}>
        <IconComponent className={`w-5 h-5 ${typeConfig.color}`} />
      </div>

      {/* Activity content */}
      <div className="flex-1 min-w-0">
        {/* Header with improved spacing */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-semibold text-gray-900 leading-tight">
            {activity.title}
          </h3>
          <div className="flex flex-col items-end text-right flex-shrink-0">
            <time className="text-xs text-gray-500 font-medium">
              {formattedTime}
            </time>
            <span className="text-xs text-gray-400 mt-0.5">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Description with better readability */}
        {activity.description && (
          <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-3">
            {activity.description}
          </p>
        )}

        {/* User info with enhanced touch targets */}
        <div className="flex items-center gap-3 mb-2">
          {showAvatar && (
            <>
              {activity.user_avatar ? (
                <img
                  src={activity.user_avatar}
                  alt={activity.user_name}
                  className="w-6 h-6 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center border border-gray-200">
                  <span className="text-xs text-gray-700 font-semibold">
                    {activity.user_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </>
          )}
          <span className="text-sm text-gray-600 font-medium truncate">
            {activity.user_name}
          </span>
          <span className="text-gray-300">•</span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${bgColor} ${typeConfig.color}`}>
            {typeConfig.label}
          </span>
        </div>

        {/* Enhanced metadata display */}
        {showMetadata && activity.metadata && (
          <div className="space-y-2">
            {/* Status/Priority changes with industrial styling */}
            {activity.metadata.previous_value && activity.metadata.new_value && (
              <div className="text-sm bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary-600" />
                  <span className="font-medium text-gray-700">Status Change:</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded font-mono text-xs">
                    {activity.metadata.previous_value}
                  </span>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded font-mono text-xs">
                    {activity.metadata.new_value}
                  </span>
                </div>
              </div>
            )}

            {/* Assignment info with enhanced styling */}
            {activity.metadata.assigned_to && activity.metadata.assigned_by && (
              <div className="text-sm bg-success-50 rounded-lg px-3 py-2 border border-success-200">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-success-600" />
                  <span className="font-medium text-success-700">Assignment:</span>
                </div>
                <div className="mt-1 text-sm text-success-700">
                  <span className="font-semibold">{activity.metadata.assigned_to}</span>
                  <span className="text-success-600"> assigned by </span>
                  <span className="font-semibold">{activity.metadata.assigned_by}</span>
                </div>
              </div>
            )}

            {/* Work order details with industrial styling */}
            {activity.metadata.work_order_number && (
              <div className="text-sm bg-secondary-50 rounded-lg px-3 py-2 border border-secondary-200">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-secondary-700">Work Order:</span>
                  <span className="text-secondary-800 font-mono font-bold">
                    #{activity.metadata.work_order_number}
                  </span>
                </div>
              </div>
            )}

            {/* Note content preview */}
            {activity.activity_type === 'note_added' && activity.metadata.note_content && (
              <div className="text-sm bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="font-medium text-gray-700 block mb-1">Note:</span>
                    <p className="text-gray-600 line-clamp-2 leading-relaxed">
                      {activity.metadata.note_content}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced latest indicator */}
      {isLatest && (
        <div className="absolute -left-2 top-6">
          <div className="w-5 h-5 bg-primary-600 rounded-full border-3 border-white shadow-md animate-pulse" />
        </div>
      )}

      {/* Touch feedback overlay */}
      {onClick && (
        <div className="absolute inset-0 bg-primary-600 opacity-0 active:opacity-5 transition-opacity duration-75 pointer-events-none rounded-lg" />
      )}
    </div>
  )
}