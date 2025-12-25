'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, AlertTriangle, Info, Loader2 } from 'lucide-react'

export interface FeedbackMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'loading'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface FeedbackSystemProps {
  messages: FeedbackMessage[]
  onDismiss: (id: string) => void
  position?: 'top' | 'bottom'
}

export function FeedbackSystem({ 
  messages, 
  onDismiss, 
  position = 'top' 
}: FeedbackSystemProps) {
  useEffect(() => {
    messages.forEach(message => {
      if (message.type !== 'loading' && message.duration !== 0) {
        const timer = setTimeout(() => {
          onDismiss(message.id)
        }, message.duration || 4000)

        return () => clearTimeout(timer)
      }
    })
  }, [messages, onDismiss])

  const getIcon = (type: FeedbackMessage['type']) => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5" />
      case 'error':
        return <X className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      case 'info':
        return <Info className="w-5 h-5" />
      case 'loading':
        return <Loader2 className="w-5 h-5 animate-spin" />
    }
  }

  const getStyles = (type: FeedbackMessage['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'loading':
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getIconColor = (type: FeedbackMessage['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      case 'info':
        return 'text-blue-600'
      case 'loading':
        return 'text-gray-600'
    }
  }

  return (
    <div 
      className={`fixed left-4 right-4 z-50 space-y-2 ${
        position === 'top' ? 'top-20' : 'bottom-20'
      }`}
    >
      <AnimatePresence>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ 
              opacity: 0, 
              y: position === 'top' ? -50 : 50,
              scale: 0.95 
            }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: 1 
            }}
            exit={{ 
              opacity: 0, 
              y: position === 'top' ? -50 : 50,
              scale: 0.95 
            }}
            transition={{ 
              type: 'spring', 
              stiffness: 400, 
              damping: 25 
            }}
            className={`
              ${getStyles(message.type)}
              border rounded-xl p-4 shadow-lg backdrop-blur-md backdrop-saturate-150
              max-w-sm mx-auto
            `}
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 ${getIconColor(message.type)}`}>
                {getIcon(message.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">
                  {message.title}
                </h4>
                {message.message && (
                  <p className="text-sm mt-1 opacity-90">
                    {message.message}
                  </p>
                )}
                
                {message.action && (
                  <button
                    onClick={message.action.onClick}
                    className="text-sm font-medium underline mt-2 hover:no-underline"
                  >
                    {message.action.label}
                  </button>
                )}
              </div>
              
              {message.type !== 'loading' && (
                <button
                  onClick={() => onDismiss(message.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Hook for managing feedback messages
export function useFeedback() {
  const [messages, setMessages] = useState<FeedbackMessage[]>([])

  const addMessage = (message: Omit<FeedbackMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setMessages(prev => [...prev, { ...message, id }])
    return id
  }

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }

  const clearAll = () => {
    setMessages([])
  }

  // Convenience methods
  const success = (title: string, message?: string, action?: FeedbackMessage['action']) => 
    addMessage({ type: 'success', title, message, action })

  const error = (title: string, message?: string, action?: FeedbackMessage['action']) => 
    addMessage({ type: 'error', title, message, action })

  const warning = (title: string, message?: string, action?: FeedbackMessage['action']) => 
    addMessage({ type: 'warning', title, message, action })

  const info = (title: string, message?: string, action?: FeedbackMessage['action']) => 
    addMessage({ type: 'info', title, message, action })

  const loading = (title: string, message?: string) => 
    addMessage({ type: 'loading', title, message, duration: 0 })

  return {
    messages,
    addMessage,
    removeMessage,
    clearAll,
    success,
    error,
    warning,
    info,
    loading
  }
}