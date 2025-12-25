/**
 * Enterprise Badge Component
 * 
 * Standardized badge/pill for status indicators, counts, and labels:
 * - Consistent sizing: text-xs with proper padding
 * - Variant system: predefined color schemes
 * - Border-based: uses borders for definition, not just background
 * 
 * Usage:
 * <Badge variant="purple">Active</Badge>
 * <Badge variant="green">Completed</Badge>
 * <Badge variant="orange">Pending</Badge>
 */

import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 
  | 'default'
  | 'purple'
  | 'green'
  | 'blue'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'gray';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visual variant of the badge */
  variant?: BadgeVariant;
  /** Additional CSS classes */
  className?: string;
  /** Children elements */
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium border',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

/**
 * Status Badge - Specialized badge for work order statuses
 */
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: string;
}

const statusVariantMap: Record<string, BadgeVariant> = {
  'Open': 'blue',
  'Confirmation': 'purple',
  'Ready': 'blue',
  'In Progress': 'orange',
  'Completed': 'green',
  'On Hold': 'gray',
  'Cancelled': 'red',
};

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, className, children, ...props }, ref) => {
    const variant = statusVariantMap[status] || 'default';
    
    return (
      <Badge
        ref={ref}
        variant={variant}
        className={className}
        {...props}
      >
        {children || status}
      </Badge>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

/**
 * Priority Badge - Specialized badge for priority levels
 */
export interface PriorityBadgeProps extends Omit<BadgeProps, 'variant'> {
  priority: string;
}

const priorityVariantMap: Record<string, BadgeVariant> = {
  'Critical': 'red',
  'High': 'orange',
  'Medium': 'yellow',
  'Low': 'green',
};

export const PriorityBadge = React.forwardRef<HTMLSpanElement, PriorityBadgeProps>(
  ({ priority, className, children, ...props }, ref) => {
    const variant = priorityVariantMap[priority] || 'default';
    
    return (
      <Badge
        ref={ref}
        variant={variant}
        className={className}
        {...props}
      >
        {children || priority}
      </Badge>
    );
  }
);

PriorityBadge.displayName = 'PriorityBadge';
