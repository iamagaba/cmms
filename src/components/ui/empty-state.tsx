import React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * EmptyState Component
 * 
 * Standardized empty state component for consistent "no data" scenarios.
 * Uses shadcn/ui design patterns with proper spacing and typography.
 * 
 * Usage:
 * - Master-detail views with no selection
 * - Data tables with no results
 * - Search pages with no matches
 * - Dashboard widgets with no data
 */
export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      {/* Icon Container */}
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      
      {/* Title */}
      <h3 className="text-sm font-medium text-foreground mb-1">
        {title}
      </h3>
      
      {/* Description */}
      {description && (
        <p className="text-xs text-muted-foreground mb-4 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      
      {/* Action Button */}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}

export default EmptyState;