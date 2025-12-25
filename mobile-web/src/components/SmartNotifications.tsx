'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  User,
  Car,
  Phone,
  Eye,
  MoreHorizontal
} from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info' | 'error' | 'location' | 'assignment'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionable?: boolean
  actionLabel?: string
  onAction?: () => void
  priority: 'low' | 'medium' | 'high'
  relatedId?: string
  relatedType?: 'work_order' | 'asset' | 'customer'
}

interface SmartNotificationsProps {
  isOpen: boolean
  onClose: () => void
  notifications: Notification[]
  onNotificationAction: (notification: Notification) => void
  onMarkAsRead: (notificationId: string) => void
  onMarkAllAsRead: () => void
  onClearAll: () => void
}

export function SmartNotifications({
  isOpen,
  onClose,
  notifications,
  onNotificationAction,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll
}: SmartNotificationsProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'actionable'>('all')

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return CheckCircle
      case 'warning': return AlertTriangle
      case 'error': return AlertTriangle
      case 'location': return MapPin
      case 'assignment': return User
      default: return Bell
    }
  }

  const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'high') return 'text-red-500'
    
    switch (type) {
      case 'success': return 'text-success-600'
      case 'warning': return 'text-warning-600'
      case 'error': return 'text-error-600'
      case 'location': return 'text-primary-600'
      case 'assignment': return 'text-secondary-500'
      default: return 'text-gray-500'
    }
  }

  const getNotificationBg = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'high') return 'bg-red-50'
    
    switch (type) {
      case 'success': return 'bg-green-50'
      case 'warning': return 'bg-yellow-50'
      case 'error': return 'bg-red-50'
      case 'location': return 'bg-blue-50'
      case 'assignment': return 'bg-purple-50'
      default: return 'bg-gray-50'
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.read
      case 'actionable': return notification.actionable
      default: return true
    }
  })

  const unreadCount = notifications.filter(n => !n.read).length
  const actionableCount = notifications.filter(n => n.actionable).length

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* Notification Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-gray-200">
              {[
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'actionable', label: 'Action', count: actionableCount }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as typeof filter)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    filter === tab.key
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-1 text-xs">({tab.count})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Actions Bar */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
                <button
                  onClick={onMarkAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  disabled={unreadCount === 0}
                >
                  Mark All Read
                </button>
                <button
                  onClick={onClearAll}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Bell className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {filter === 'unread' ? 'All caught up!' : 
                     filter === 'actionable' ? 'No actions needed' : 
                     'No notifications'}
                  </h3>
                  <p className="text-sm text-gray-500 text-center">
                    {filter === 'unread' ? 'You have no unread notifications' :
                     filter === 'actionable' ? 'No notifications require action' :
                     'Notifications will appear here'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map((notification, index) => {
                    const IconComponent = getNotificationIcon(notification.type)
                    const iconColor = getNotificationColor(notification.type, notification.priority)
                    const bgColor = getNotificationBg(notification.type, notification.priority)

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Icon */}
                          <div className={`p-2 rounded-lg ${bgColor} flex-shrink-0`}>
                            <IconComponent className={`w-4 h-4 ${iconColor}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${
                                  notification.read ? 'text-gray-700' : 'text-gray-900'
                                }`}>
                                  {notification.title}
                                </p>
                                <p className={`text-sm mt-1 ${
                                  notification.read ? 'text-gray-500' : 'text-gray-600'
                                }`}>
                                  {notification.message}
                                </p>
                              </div>

                              {/* Priority indicator */}
                              {notification.priority === 'high' && (
                                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2" />
                              )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-gray-400">
                                {formatTime(notification.timestamp)}
                              </span>

                              <div className="flex items-center space-x-2">
                                {/* Mark as read */}
                                {!notification.read && (
                                  <button
                                    onClick={() => onMarkAsRead(notification.id)}
                                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Mark as read"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </button>
                                )}

                                {/* Action button */}
                                {notification.actionable && (
                                  <button
                                    onClick={() => onNotificationAction(notification)}
                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium px-2 py-1 rounded bg-primary-50 hover:bg-primary-100 transition-colors"
                                  >
                                    {notification.actionLabel || 'View'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Notification Badge Component
export function NotificationBadge({ 
  count, 
  onClick,
  className = '' 
}: { 
  count: number
  onClick: () => void
  className?: string 
}) {
  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors ${className}`}
    >
      <Bell className="w-5 h-5 text-gray-700" />
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg"
        >
          {count > 9 ? '9+' : count}
        </motion.span>
      )}
    </button>
  )
}

export default SmartNotifications