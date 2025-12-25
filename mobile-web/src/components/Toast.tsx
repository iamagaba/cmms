'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastMessage {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastProps {
  toast: ToastMessage
  onClose: (id: string) => void
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
}

const toastStyles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    title: 'text-green-900',
    message: 'text-green-700',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    title: 'text-red-900',
    message: 'text-red-700',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-900',
    message: 'text-blue-700',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    title: 'text-yellow-900',
    message: 'text-yellow-700',
  },
}

function Toast({ toast, onClose }: ToastProps) {
  const Icon = toastIcons[toast.type]
  const styles = toastStyles[toast.type]

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id)
    }, toast.duration || 4000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`${styles.bg} ${styles.border} border rounded-xl p-4 shadow-lg backdrop-blur-md backdrop-saturate-150 max-w-sm w-full`}
    >
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 ${styles.icon} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${styles.title}`}>
            {toast.title}
          </p>
          {toast.message && (
            <p className={`text-sm mt-1 ${styles.message}`}>
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className={`${styles.icon} hover:opacity-70 transition-opacity flex-shrink-0`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Toast hook for easy usage
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const success = (title: string, message?: string) => {
    addToast({ type: 'success', title, message })
  }

  const error = (title: string, message?: string) => {
    addToast({ type: 'error', title, message })
  }

  const info = (title: string, message?: string) => {
    addToast({ type: 'info', title, message })
  }

  const warning = (title: string, message?: string) => {
    addToast({ type: 'warning', title, message })
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
  }
}