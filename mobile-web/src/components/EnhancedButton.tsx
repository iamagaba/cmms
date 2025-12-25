'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { useHaptic } from '@/utils/haptic'
import { Loader2 } from 'lucide-react'

export interface EnhancedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  hapticFeedback?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const buttonVariants = {
  primary: 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 border-purple-600',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 border-gray-200',
  outline: 'bg-transparent text-purple-600 hover:bg-purple-50 active:bg-purple-100 border-purple-600 border-2',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 border-transparent',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border-red-600'
}

const buttonSizes = {
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  md: 'px-4 py-2.5 text-base min-h-[44px]',
  lg: 'px-6 py-3 text-lg min-h-[52px]'
}

export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    variant = 'primary',
    size = 'md',
    loading = false,
    hapticFeedback = true,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    children,
    className = '',
    onClick,
    disabled,
    ...props
  }, ref) => {
    const { buttonPress } = useHaptic()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return
      
      if (hapticFeedback) {
        buttonPress()
      }
      
      onClick?.(e)
    }

    const baseClasses = `
      inline-flex items-center justify-center
      font-medium rounded-xl
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${buttonVariants[variant]}
      ${buttonSizes[size]}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ')

    return (
      <motion.div
        whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
        whileHover={!disabled && !loading ? { y: -1 } : {}}
        transition={{ duration: 0.1 }}
        className="inline-block"
      >
        <button
          ref={ref}
          className={baseClasses}
          onClick={handleClick}
          disabled={disabled || loading}
          {...props}
        >
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className="mr-2">{icon}</span>
        )}
        
        {children}
        
        {!loading && icon && iconPosition === 'right' && (
          <span className="ml-2">{icon}</span>
        )}
        </button>
      </motion.div>
    )
  }
)

EnhancedButton.displayName = 'EnhancedButton'