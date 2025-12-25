'use client'

import { motion } from 'framer-motion'
import { EnhancedButton } from './EnhancedButton'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  illustration?: 'search' | 'work-orders' | 'assets' | 'generic'
}

const illustrations = {
  search: '🔍',
  'work-orders': '📋',
  assets: '🚗',
  generic: '📱'
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  illustration = 'generic'
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      {/* Illustration */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6"
      >
        {icon || (
          <span className="text-4xl" role="img" aria-label="Empty state">
            {illustrations[illustration]}
          </span>
        )}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="space-y-3 mb-8"
      >
        <h3 className="text-xl font-semibold text-gray-900">
          {title}
        </h3>
        <p className="text-gray-500 max-w-sm leading-relaxed">
          {description}
        </p>
      </motion.div>

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 w-full max-w-xs"
        >
          {action && (
            <EnhancedButton
              onClick={action.onClick}
              icon={action.icon}
              fullWidth
              size="lg"
            >
              {action.label}
            </EnhancedButton>
          )}
          
          {secondaryAction && (
            <EnhancedButton
              variant="outline"
              onClick={secondaryAction.onClick}
              icon={secondaryAction.icon}
              fullWidth
              size="lg"
            >
              {secondaryAction.label}
            </EnhancedButton>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}