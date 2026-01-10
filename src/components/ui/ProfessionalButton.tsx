/**
 * Professional CMMS Button Component
 * 
 * A comprehensive button component that implements the professional design system
 * with industrial-inspired styling, multiple variants, and accessibility features.
 * 
 * Now with density mode support for compact/cozy layouts.
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon, ICON_SIZES, type IconSize } from '@/components/ui/Icon';
import { useDensity } from '@/context/DensityContext';

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
   * Icon to display before the button text (Hugeicons icon component)
   */
  icon?: any;
  
  /**
   * Icon to display after the button text (Hugeicons icon component)
   */
  iconRight?: any;
  
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
// STYLE VARIANTS - Industrial Design
// ============================================

const buttonVariants = {
  // Primary - Purple brand for main actions
  primary: [
    'bg-purple-600 text-white border-purple-700',
    'hover:bg-purple-700 hover:border-purple-800',
    'active:bg-purple-800 active:border-purple-900',
    'focus:ring-purple-500 focus:ring-offset-2',
    'disabled:bg-slate-300 disabled:border-slate-300 disabled:text-slate-500',
    'shadow-sm hover:shadow-md',
  ],
  
  // Secondary - Industrial slate for secondary actions
  secondary: [
    'bg-white text-slate-700 border-slate-300',
    'hover:bg-slate-50 hover:border-slate-400',
    'active:bg-slate-100 active:border-slate-500',
    'focus:ring-slate-500 focus:ring-offset-2',
    'disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400',
    'shadow-sm hover:shadow-md',
  ],
  
  // Outline - Transparent with border
  outline: [
    'bg-transparent text-purple-600 border-purple-500',
    'hover:bg-purple-50 hover:text-purple-700',
    'active:bg-purple-100 active:text-purple-800',
    'focus:ring-purple-500 focus:ring-offset-2',
    'disabled:bg-transparent disabled:border-slate-300 disabled:text-slate-400',
  ],
  
  // Ghost - Minimal styling
  ghost: [
    'bg-transparent text-slate-600 border-transparent',
    'hover:bg-slate-100 hover:text-slate-700',
    'active:bg-slate-200 active:text-slate-800',
    'focus:ring-slate-500 focus:ring-offset-2',
    'disabled:bg-transparent disabled:text-slate-400',
  ],
  
  // Danger - Alert red for destructive actions
  danger: [
    'bg-red-600 text-white border-red-700',
    'hover:bg-red-700 hover:border-red-800',
    'active:bg-red-800 active:border-red-900',
    'focus:ring-red-500 focus:ring-offset-2',
    'disabled:bg-slate-300 disabled:border-slate-300 disabled:text-slate-500',
    'shadow-sm hover:shadow-md',
  ],
  
  // Success - Operational green for positive actions
  success: [
    'bg-green-600 text-white border-green-700',
    'hover:bg-green-700 hover:border-green-800',
    'active:bg-green-800 active:border-green-900',
    'focus:ring-green-500 focus:ring-offset-2',
    'disabled:bg-slate-300 disabled:border-slate-300 disabled:text-slate-500',
    'shadow-sm hover:shadow-md',
  ],
};

// Industrial sizing - slightly more compact
const buttonSizes = {
  sm: {
    compact: 'h-7 px-2.5 text-[11px] gap-1',
    cozy: 'h-8 px-3 text-xs gap-1.5',
  },
  base: {
    compact: 'h-8 px-3 text-[11px] gap-1.5',
    cozy: 'h-9 px-4 text-xs gap-2',
  },
  lg: {
    compact: 'h-9 px-4 text-xs gap-2',
    cozy: 'h-10 px-5 text-sm gap-2',
  },
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
    const { isCompact } = useDensity();
    const densityMode = isCompact ? 'compact' : 'cozy';

    return (
      <motion.button
        ref={ref}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.1 }}
        className={cn(
          // Base styles - Industrial: sharper corners, uppercase for small buttons
          'inline-flex items-center justify-center font-semibold rounded border',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-60',
          'uppercase tracking-wide',
          
          // Variant styles
          buttonVariants[variant],
          
          // Size styles with density support
          buttonSizes[size][densityMode],
          
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
          <Icon icon={icon} size={isCompact ? 'sm' : 'base'} className="flex-shrink-0" />
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
          <Icon icon={iconRight} size={isCompact ? 'sm' : 'base'} className="flex-shrink-0" />
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
  icon: any; // Hugeicons icon component
  'aria-label': string;
}

const ProfessionalIconButton = forwardRef<HTMLButtonElement, ProfessionalIconButtonProps>(
  ({ icon, size = 'base', className, ...props }, ref) => {
    const { isCompact } = useDensity();
    
    const sizeClasses = {
      sm: isCompact ? 'w-7 h-7' : 'w-8 h-8',
      base: isCompact ? 'w-8 h-8' : 'w-10 h-10',
      lg: isCompact ? 'w-9 h-9' : 'w-12 h-12',
    };
    
    // Map button size to icon size using standardized sizes
    const iconSizeMap: Record<'sm' | 'base' | 'lg', IconSize> = {
      sm: isCompact ? 'xs' : 'sm',
      base: isCompact ? 'sm' : 'base',
      lg: isCompact ? 'base' : 'lg',
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
        <Icon icon={icon} size={iconSizeMap[size]} />
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