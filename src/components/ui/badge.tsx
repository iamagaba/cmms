import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-purple-100 text-purple-800",
        secondary: "border-transparent bg-gray-100 text-gray-800",
        destructive: "border-transparent bg-red-100 text-red-800",
        outline: "text-foreground",
        // Status variants
        purple: "border-transparent bg-purple-100 text-purple-800",
        green: "border-transparent bg-emerald-100 text-emerald-800",
        blue: "border-transparent bg-blue-100 text-blue-800",
        orange: "border-transparent bg-orange-100 text-orange-800",
        red: "border-transparent bg-red-100 text-red-800",
        yellow: "border-transparent bg-yellow-100 text-yellow-800",
        gray: "border-transparent bg-gray-100 text-gray-800",
        // Work Order Status
        "status-open": "border-transparent bg-blue-100 text-blue-800",
        "status-in-progress": "border-transparent bg-amber-100 text-amber-800",
        "status-completed": "border-transparent bg-emerald-100 text-emerald-800",
        "status-on-hold": "border-transparent bg-orange-100 text-orange-800",
        "status-cancelled": "border-transparent bg-gray-100 text-gray-800",
        // Priority
        "priority-critical": "border-transparent bg-red-100 text-red-800",
        "priority-high": "border-transparent bg-orange-100 text-orange-800",
        "priority-medium": "border-transparent bg-yellow-100 text-yellow-800",
        "priority-low": "border-transparent bg-blue-100 text-blue-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

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
  'Open': 'status-open',
  'Confirmation': 'status-open',
  'Ready': 'status-open',
  'In Progress': 'status-in-progress',
  'On Hold': 'status-on-hold',
  'Completed': 'status-completed',
  'Cancelled': 'status-cancelled',
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
}

const priorityVariantMap: Record<string, BadgeProps['variant']> = {
  'Critical': 'priority-critical',
  'High': 'priority-high',
  'Medium': 'priority-medium',
  'Low': 'priority-low',
};

export function PriorityBadge({ priority, className, children, ...props }: PriorityBadgeProps) {
  const variant = priorityVariantMap[priority] || 'default';
  return (
    <Badge variant={variant} className={className} {...props}>
      {children || priority}
    </Badge>
  );
}

// Legacy exports for backward compatibility
export const WorkOrderStatusBadge = StatusBadge;
export const AssetStatusBadge = StatusBadge;
