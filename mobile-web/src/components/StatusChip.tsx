'use client'

import React from 'react'
import { motion } from 'framer-motion'

export type StatusKind = 'Open' | 'Confirmation' | 'Ready' | 'In Progress' | 'On Hold' | 'Completed'
export type PriorityKind = 'High' | 'Medium' | 'Low'

export interface StatusChipProps {
  kind: 'status' | 'priority' | 'tech' | 'custom'
  value: string | number
  clickable?: boolean
  onClick?: () => void
  color?: string
  className?: string
}

export function StatusChip({
  kind,
  value,
  clickable = false,
  onClick,
  color,
  className = '',
}: StatusChipProps) {
  const getStatusStyles = () => {
    if (color) {
      return {
        backgroundColor: color,
        color: 'white',
      }
    }

    if (kind === 'status') {
      const status = String(value) as StatusKind
      switch (status) {
        case 'Open':
          return { backgroundColor: '#2f54eb', color: 'white' }
        case 'Confirmation':
          return { backgroundColor: '#13c2c2', color: 'white' }
        case 'Ready':
          return { backgroundColor: '#8c8c8c', color: 'white' }
        case 'In Progress':
          return { backgroundColor: '#fa8c16', color: 'white' }
        case 'On Hold':
          return { backgroundColor: '#faad14', color: 'white' }
        case 'Completed':
          return { backgroundColor: '#52c41a', color: 'white' }
        default:
          return { backgroundColor: '#2f54eb', color: 'white' }
      }
    }

    if (kind === 'priority') {
      const priority = String(value) as PriorityKind
      switch (priority) {
        case 'High':
          return { backgroundColor: '#ff4d4f', color: 'white' }
        case 'Medium':
          return { backgroundColor: '#faad14', color: 'white' }
        case 'Low':
          return { backgroundColor: '#52c41a', color: 'white' }
        default:
          return { backgroundColor: '#8c8c8c', color: 'white' }
      }
    }

    if (kind === 'tech') {
      const status = String(value).toLowerCase()
      if (status === 'available') return { backgroundColor: '#52c41a', color: 'white' }
      if (status === 'busy') return { backgroundColor: '#faad14', color: 'white' }
      if (status === 'offline') return { backgroundColor: '#8c8c8c', color: 'white' }
      return { backgroundColor: '#2f54eb', color: 'white' }
    }

    // Default custom
    return { backgroundColor: '#2f54eb', color: 'white' }
  }

  const styles = getStatusStyles()

  const chipContent = (
    <span
      className={`
        inline-flex items-center px-2 py-1 rounded text-xs font-medium
        transition-all duration-200 select-none
        ${clickable ? 'cursor-pointer hover:opacity-80 active:scale-95' : 'cursor-default'}
        ${className}
      `}
      style={styles}
      onClick={clickable ? onClick : undefined}
    >
      {String(value)}
    </span>
  )

  if (clickable) {
    return (
      <motion.div
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        {chipContent}
      </motion.div>
    )
  }

  return chipContent
}

export default StatusChip