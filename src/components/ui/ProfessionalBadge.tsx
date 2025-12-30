/**
 * Professional CMMS Badge System
 * 
 * A comprehensive badge system designed for maintenance management workflows.
 * Includes work order statuses, priority levels, asset conditions, and custom badges
 * with semantic colors and professional styling.
 */

import React, { forwardRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================
// COMPONENT INTERFACES
// ============================================

export interface ProfessionalBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Badge variant determines the visual style and semantic meaning
   */
  variant?: 
    | 'default' 
    | 'success' 
    | 'warning' 
    | 'error' 
    | 'info' 
    | 'primary'
    | 'secondary';
  
  /**
   * Badge size affects padding and font size
   */
  size?: 'xs' | 'sm' | 'base' | 'lg';
  
  /**
   * Icon to display before the badge text
   */
  icon?: string;
  
  /**
   * Badge content
   */
  children: React.ReactNode;
  
  /**
   * Whether the badge should have a dot indicator
   */
  dot?: boolean;
  
  /**
   * Whether the badge should be outlined instead of filled
   */
  outline?: boolean;
  
  /**
   * Whether the badge should be rounded (pill shape)
   */
  rounded?: boolean;
  
  /**
   * Whether the badge should pulse (for active states)
   */
  pulse?: boolean;
}

// Work Order Status specific props
export interface WorkOrderStatusBadgeProps extends Omit<ProfessionalBadgeProps, 'variant' | 'children'> {
  status: 'new' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled' | 'scheduled';
}

// Priority Level specific props
export interface PriorityBadgeProps extends Omit<ProfessionalBadgeProps, 'variant' | 'children'> {
  priority: 'critical' | 'high' | 'medium' | 'low' | 'routine';
}

// Asset Status specific props
export interface AssetStatusBadgeProps extends Omit<ProfessionalBadgeProps, 'variant' | 'children'> {
  status: 'operational' | 'maintenance' | 'out-of-service' | 'retired';
}

// ============================================
// STYLE VARIANTS
// ============================================

const badgeVariants = {
  default: {
    filled: 'bg-machinery-100 text-machinery-700 border-machinery-200',
    outline: 'bg-transparent text-machinery-600 border-machinery-300',
  },
  primary: {
    filled: 'bg-steel-100 text-steel-800 border-steel-200',
    outline: 'bg-transparent text-steel-600 border-steel-400',
  },
  secondary: {
    filled: 'bg-machinery-100 text-machinery-700 border-machinery-200',
    outline: 'bg-transparent text-machinery-600 border-machinery-300',
  },
  success: {
    filled: 'bg-industrial-100 text-industrial-800 border-industrial-200',
    outline: 'bg-transparent text-industrial-600 border-industrial-400',
  },
  warning: {
    filled: 'bg-maintenance-100 text-maintenance-800 border-maintenance-200',
    outline: 'bg-transparent text-maintenance-600 border-maintenance-400',
  },
  error: {
    filled: 'bg-warning-100 text-warning-800 border-warning-200',
    outline: 'bg-transparent text-warning-600 border-warning-400',
  },
  info: {
    filled: 'bg-steel-100 text-steel-800 border-steel-200',
    outline: 'bg-transparent text-steel-600 border-steel-400',
  },
};

const badgeSizes = {
  xs: 'px-1.5 py-0.5 text-xs',
  sm: 'px-2 py-0.5 text-xs',
  base: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-sm',
};

// ============================================
// WORK ORDER STATUS CONFIGURATIONS
// ============================================

const workOrderStatusConfig = {
  new: {
    label: 'New',
    variant: 'info' as const,
    icon: 'tabler:plus-circle',
    color: 'steel',
  },
  'in-progress': {
    label: 'In Progress',
    variant: 'warning' as const,
    icon: 'tabler:clock-play',
    color: 'safety',
  },
  'on-hold': {
    label: 'On Hold',
    variant: 'warning' as const,
    icon: 'tabler:clock-pause',
    color: 'maintenance',
  },
  completed: {
    label: 'Completed',
    variant: 'success' as const,
    icon: 'tabler:circle-check',
    color: 'industrial',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'error' as const,
    icon: 'tabler:circle-x',
    color: 'warning',
  },
  scheduled: {
    label: 'Scheduled',
    variant: 'default' as const,
    icon: 'tabler:calendar-clock',
    color: 'machinery',
  },
};

// ============================================
// PRIORITY LEVEL CONFIGURATIONS
// ============================================

const priorityConfig = {
  critical: {
    label: 'Critical',
    variant: 'error' as const,
    icon: 'tabler:alert-triangle-filled',
    color: 'warning',
  },
  high: {
    label: 'High',
    variant: 'warning' as const,
    icon: 'tabler:arrow-up-circle',
    color: 'safety',
  },
  medium: {
    label: 'Medium',
    variant: 'warning' as const,
    icon: 'tabler:minus-circle',
    color: 'maintenance',
  },
  low: {
    label: 'Low',
    variant: 'default' as const,
    icon: 'tabler:arrow-down-circle',
    color: 'machinery',
  },
  routine: {
    label: 'Routine',
    variant: 'success' as const,
    icon: 'tabler:refresh',
    color: 'industrial',
  },
};

// ============================================
// ASSET STATUS CONFIGURATIONS
// ============================================

const assetStatusConfig = {
  operational: {
    label: 'Operational',
    variant: 'success' as const,
    icon: 'tabler:circle-check',
    color: 'industrial',
  },
  maintenance: {
    label: 'Under Maintenance',
    variant: 'warning' as const,
    icon: 'tabler:tools',
    color: 'maintenance',
  },
  'out-of-service': {
    label: 'Out of Service',
    variant: 'error' as const,
    icon: 'tabler:circle-x',
    color: 'warning',
  },
  retired: {
    label: 'Retired',
    variant: 'default' as const,
    icon: 'tabler:archive',
    color: 'machinery',
  },
};

// ============================================
// MAIN BADGE COMPONENT
// ============================================

const ProfessionalBadge = forwardRef<HTMLSpanElement, ProfessionalBadgeProps>(
  (
    {
      variant = 'default',
      size = 'base',
      icon,
      children,
      dot = false,
      outline = false,
      rounded = true,
      pulse = false,
      className,
      ...props
    },
    ref
  ) => {
    const variantStyles = badgeVariants[variant];
    const styleType = outline ? 'outline' : 'filled';

    return (
      <motion.span
        ref={ref}
        initial={false}
        animate={pulse ? { scale: [1, 1.05, 1] } : undefined}
        transition={pulse ? { duration: 2, repeat: Infinity } : undefined}
        className={cn(
          // Base styles
          'inline-flex items-center gap-1.5 font-medium border',
          'transition-all duration-200',
          
          // Size styles
          badgeSizes[size],
          
          // Variant styles
          variantStyles[styleType],
          
          // Shape styles
          rounded ? 'rounded' : 'rounded-md',
          
          // Pulse animation
          pulse && 'animate-pulse',
          
          // Custom className
          className
        )}
        {...props}
      >
        {/* Dot indicator */}
        {dot && (
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
        )}

        {/* Icon */}
        {icon && (
          <HugeiconsIcon 
            icon={icon} 
            size={16}
            className={cn(
              'flex-shrink-0',
              size === 'xs' ? 'w-3 h-3' : 'w-4 h-4'
            )} 
          />
        )}

        {/* Content */}
        <span className="truncate">{children}</span>
      </motion.span>
    );
  }
);

ProfessionalBadge.displayName = 'ProfessionalBadge';

// ============================================
// WORK ORDER STATUS BADGE
// ============================================

const WorkOrderStatusBadge = forwardRef<HTMLSpanElement, WorkOrderStatusBadgeProps>(
  ({ status, className, ...props }, ref) => {
    const config = workOrderStatusConfig[status];
    
    return (
      <ProfessionalBadge
        ref={ref}
        variant={config.variant}
        icon={config.icon}
        className={cn('font-semibold', className)}
        pulse={status === 'in-progress'}
        {...props}
      >
        {config.label}
      </ProfessionalBadge>
    );
  }
);

WorkOrderStatusBadge.displayName = 'WorkOrderStatusBadge';

// ============================================
// PRIORITY BADGE
// ============================================

const PriorityBadge = forwardRef<HTMLSpanElement, PriorityBadgeProps>(
  ({ priority, className, ...props }, ref) => {
    const config = priorityConfig[priority];
    
    return (
      <ProfessionalBadge
        ref={ref}
        variant={config.variant}
        icon={config.icon}
        className={cn('font-semibold', className)}
        pulse={priority === 'critical'}
        {...props}
      >
        {config.label}
      </ProfessionalBadge>
    );
  }
);

PriorityBadge.displayName = 'PriorityBadge';

// ============================================
// ASSET STATUS BADGE
// ============================================

const AssetStatusBadge = forwardRef<HTMLSpanElement, AssetStatusBadgeProps>(
  ({ status, className, ...props }, ref) => {
    const config = assetStatusConfig[status];
    
    return (
      <ProfessionalBadge
        ref={ref}
        variant={config.variant}
        icon={config.icon}
        className={cn('font-semibold', className)}
        {...props}
      >
        {config.label}
      </ProfessionalBadge>
    );
  }
);

AssetStatusBadge.displayName = 'AssetStatusBadge';

// ============================================
// BADGE GROUP COMPONENT
// ============================================

interface ProfessionalBadgeGroupProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'tight' | 'normal' | 'loose';
}

const ProfessionalBadgeGroup: React.FC<ProfessionalBadgeGroupProps> = ({
  children,
  className,
  spacing = 'normal',
}) => {
  const spacingClasses = {
    tight: 'gap-1',
    normal: 'gap-2',
    loose: 'gap-3',
  };

  return (
    <div className={cn('flex flex-wrap items-center', spacingClasses[spacing], className)}>
      {children}
    </div>
  );
};

// ============================================
// NOTIFICATION BADGE
// ============================================

interface NotificationBadgeProps {
  count: number;
  max?: number;
  showZero?: boolean;
  className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  max = 99,
  showZero = false,
  className,
}) => {
  if (count === 0 && !showZero) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <ProfessionalBadge
      variant="error"
      size="xs"
      className={cn(
        'min-w-[1.25rem] h-5 px-1 justify-center',
        'absolute -top-1 -right-1',
        className
      )}
    >
      {displayCount}
    </ProfessionalBadge>
  );
};

// ============================================
// EXPORTS
// ============================================

export default ProfessionalBadge;
export {
  WorkOrderStatusBadge,
  PriorityBadge,
  AssetStatusBadge,
  ProfessionalBadgeGroup,
  NotificationBadge,
};