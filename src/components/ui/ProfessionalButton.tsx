/**
 * Professional CMMS Button Component
 * 
 * A comprehensive button component that implements the professional design system
 * with industrial-inspired styling, multiple variants, and accessibility features.
 */

import React, { forwardRef } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================
// COMPONENT INTERFACES
// ============================================

export interface ProfessionalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant determines the visual style
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  
  /**
   * Button size affects padding and font size
   */
  size?: 'sm' | 'base' | 'lg';
  
  /**
   * Icon to display before the button text
   */
  icon?: string;
  
  /**
   * Icon to display after the button text
   */
  iconRight?: string;
  
  /**
   * Loading state shows spinner and disables interaction
   */
  loading?: boolean;
  
  /**
   * Full width button
   */
  fullWidth?: boolean;
  
  /**
   * Button content (alternative to children)
   */
  children?: React.ReactNode;
}

// ============================================
// STYLE VARIANTS
// ============================================

const buttonVariants = {
  // Primary - Steel blue for main actions
  primary: [
    'bg-steel-600 text-white border-steel-600',
    'hover:bg-steel-700 hover:border-steel-700',
    'active:bg-steel-800 active:border-steel-800',
    'focus:ring-steel-500 focus:ring-offset-2',
    'disabled:bg-machinery-300 disabled:border-machinery-300 disabled:text-machinery-500',
    'shadow-sm hover:shadow-md',
  ],
  
  // Secondary - Neutral for secondary actions
  secondary: [
    'bg-white text-machinery-700 border-machinery-300',
    'hover:bg-machinery-50 hover:border-machinery-400',
    'active:bg-machinery-100 active:border-machinery-500',
    'focus:ring-machinery-500 focus:ring-offset-2',
    'disabled:bg-machinery-100 disabled:border-machinery-200 disabled:text-machinery-400',
    'shadow-sm hover:shadow-md',
  ],
  
  // Outline - Transparent with border
  outline: [
    'bg-transparent text-steel-600 border-steel-600',
    'hover:bg-steel-50 hover:text-steel-700',
    'active:bg-steel-100 active:text-steel-800',
    'focus:ring-steel-500 focus:ring-offset-2',
    'disabled:bg-transparent disabled:border-machinery-300 disabled:text-machinery-400',
  ],
  
  // Ghost - Minimal styling
  ghost: [
    'bg-transparent text-machinery-600 border-transparent',
    'hover:bg-machinery-100 hover:text-machinery-700',
    'active:bg-machinery-200 active:text-machinery-800',
    'focus:ring-machinery-500 focus:ring-offset-2',
    'disabled:bg-transparent disabled:text-machinery-400',
  ],
  
  // Danger - Warning red for destructive actions
  danger: [
    'bg-warning-600 text-white border-warning-600',
    'hover:bg-warning-700 hover:border-warning-700',
    'active:bg-warning-800 active:border-warning-800',
    'focus:ring-warning-500 focus:ring-offset-2',
    'disabled:bg-machinery-300 disabled:border-machinery-300 disabled:text-machinery-500',
    'shadow-sm hover:shadow-md',
  ],
  
  // Success - Industrial green for positive actions
  success: [
    'bg-industrial-600 text-white border-industrial-600',
    'hover:bg-industrial-700 hover:border-industrial-700',
    'active:bg-industrial-800 active:border-industrial-800',
    'focus:ring-industrial-500 focus:ring-offset-2',
    'disabled:bg-machinery-300 disabled:border-machinery-300 disabled:text-machinery-500',
    'shadow-sm hover:shadow-md',
  ],
};

const buttonSizes = {
  sm: [
    'h-8 px-3 text-sm',
    'gap-1.5',
  ],
  base: [
    'h-10 px-4 text-sm',
    'gap-2',
  ],
  lg: [
    'h-12 px-6 text-base',
    'gap-2.5',
  ],
};

// ============================================
// LOADING SPINNER COMPONENT
// ============================================

const LoadingSpinner: React.FC<{ size: 'sm' | 'base' | 'lg' }> = ({ size }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    base: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
      className={cn('border-2 border-current border-t-transparent rounded-full', sizeClasses[size])}
    />
  );
};

// ============================================
// MAIN BUTTON COMPONENT
// ============================================

const ProfessionalButton = forwardRef<HTMLButtonElement, ProfessionalButtonProps>(
  (
    {
      variant = 'primary',
      size = 'base',
      icon,
      iconRight,
      loading = false,
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.1 }}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium rounded-lg border',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-60',
          
          // Variant styles
          buttonVariants[variant],
          
          // Size styles
          buttonSizes[size],
          
          // Full width
          fullWidth && 'w-full',
          
          // Custom className
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {/* Loading spinner or left icon */}
        {loading ? (
          <LoadingSpinner size={size} />
        ) : icon ? (
          <Icon icon={icon} className="flex-shrink-0" />
        ) : null}

        {/* Button text */}
        {children && (
          <span className={cn(
            'truncate',
            (loading || icon || iconRight) && 'mx-1'
          )}>
            {children}
          </span>
        )}

        {/* Right icon */}
        {!loading && iconRight && (
          <Icon icon={iconRight} className="flex-shrink-0" />
        )}
      </motion.button>
    );
  }
);

ProfessionalButton.displayName = 'ProfessionalButton';

// ============================================
// BUTTON GROUP COMPONENT
// ============================================

interface ProfessionalButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

const ProfessionalButtonGroup: React.FC<ProfessionalButtonGroupProps> = ({
  children,
  className,
  orientation = 'horizontal',
}) => {
  return (
    <div
      className={cn(
        'inline-flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        '[&>button]:rounded-none',
        '[&>button:first-child]:rounded-l-lg',
        '[&>button:last-child]:rounded-r-lg',
        orientation === 'vertical' && [
          '[&>button:first-child]:rounded-t-lg [&>button:first-child]:rounded-l-none',
          '[&>button:last-child]:rounded-b-lg [&>button:last-child]:rounded-r-none',
        ],
        '[&>button:not(:first-child)]:border-l-0',
        orientation === 'vertical' && '[&>button:not(:first-child)]:border-l [&>button:not(:first-child)]:border-t-0',
        className
      )}
    >
      {children}
    </div>
  );
};

// ============================================
// ICON BUTTON COMPONENT
// ============================================

interface ProfessionalIconButtonProps
  extends Omit<ProfessionalButtonProps, 'icon' | 'iconRight' | 'children'> {
  icon: string;
  'aria-label': string;
}

const ProfessionalIconButton = forwardRef<HTMLButtonElement, ProfessionalIconButtonProps>(
  ({ icon, size = 'base', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      base: 'w-10 h-10',
      lg: 'w-12 h-12',
    };

    return (
      <ProfessionalButton
        ref={ref}
        size={size}
        className={cn(
          'p-0',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <Icon icon={icon} className="w-5 h-5" />
      </ProfessionalButton>
    );
  }
);

ProfessionalIconButton.displayName = 'ProfessionalIconButton';

// ============================================
// EXPORTS
// ============================================

export default ProfessionalButton;
export { ProfessionalButtonGroup, ProfessionalIconButton };