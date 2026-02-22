import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",

        // Status variants with dark mode support
        success: "border-transparent bg-success text-success-foreground hover:bg-success/80",
        warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
        error: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        info: "border-transparent bg-info text-info-foreground hover:bg-info/80",

        // Work order status variants with dark mode support
        open: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400",
        "in-progress": "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
        completed: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
        cancelled: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400",

        // Priority variants with dark mode support
        urgent: "border-rose-200 bg-rose-50 text-rose-700 font-bold dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400",
        high: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-400",
        medium: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-400",
        low: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400",

        // Legacy color variants (kept for backward compatibility)
        purple: "border-transparent bg-primary/10 text-primary",
        green: "border-transparent bg-emerald-100 text-emerald-800",
        blue: "border-transparent bg-blue-100 text-blue-800",
        orange: "border-transparent bg-orange-100 text-orange-800",
        red: "border-transparent bg-red-100 text-red-800",
        yellow: "border-transparent bg-yellow-100 text-yellow-800",
        gray: "border-transparent bg-gray-100 text-gray-800",

        // Legacy status variants (kept for backward compatibility)
        "status-open": "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400",
        "status-in-progress": "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
        "status-completed": "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
        "status-on-hold": "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-400",
        "status-cancelled": "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400",

        // Legacy priority variants (kept for backward compatibility)
        "priority-urgent": "border-rose-200 bg-rose-50 text-rose-700 font-bold dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400",
        "priority-high": "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-400",
        "priority-medium": "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-400",
        "priority-low": "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

// Helper components for work order status badges
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: string;
}

const statusVariantMap: Record<string, BadgeProps['variant']> = {
  'New': 'open',
  'Confirmation': 'open',
  'Ready': 'open',
  'In Progress': 'in-progress',
  'On Hold': 'warning',
  'Completed': 'completed',
  'Cancelled': 'cancelled',
  // Lowercase variants for compatibility
  'open': 'open',
  'new': 'open',
  'in-progress': 'in-progress',
  'completed': 'completed',
  'on-hold': 'warning',
  'cancelled': 'cancelled',
};

export function StatusBadge({ status, className, children, ...props }: StatusBadgeProps) {
  const variant = statusVariantMap[status] || 'default';
  return (
    <Badge variant={variant} className={className} {...props}>
      {children || status}
    </Badge>
  );
}

// Helper component for priority badges
export interface PriorityBadgeProps extends Omit<BadgeProps, 'variant'> {
  priority: string;
  size?: 'sm' | 'md' | 'lg';
}

const priorityColorMap: Record<string, { color: string; label: string }> = {
  'critical': { color: '#ef4444', label: 'Critical' },
  'urgent': { color: '#ef4444', label: 'Critical' },
  'high': { color: '#f97316', label: 'High' },
  'medium': { color: '#22c55e', label: 'Medium' },
  'normal': { color: '#22c55e', label: 'Medium' },
  'low': { color: '#22c55e', label: 'Low' },
  'routine': { color: '#94a3b8', label: 'None' },
  'none': { color: '#94a3b8', label: 'None' },
};

export function PriorityBadge({ priority, size = 'md', className, ...props }: PriorityBadgeProps) {
  const normalizedPriority = priority?.toLowerCase() || 'none';
  const config = priorityColorMap[normalizedPriority] || priorityColorMap['none'];
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <svg
        className={sizeClasses[size]}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 4C4 2.89543 4.89543 2 6 2H10L14 6V16C14 17.1046 13.1046 18 12 18H6C4.89543 18 4 17.1046 4 16V4Z"
          fill={config.color}
        />
      </svg>
      <span className="text-sm text-foreground">{config.label}</span>
    </div>
  );
}

// Legacy exports for backward compatibility
export const WorkOrderStatusBadge = StatusBadge;
export const AssetStatusBadge = StatusBadge;
