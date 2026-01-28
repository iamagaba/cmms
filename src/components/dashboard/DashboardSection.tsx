/**
 * Dashboard Section Component
 * 
 * Reusable section wrapper for dashboard content with consistent
 * styling, headers, and action buttons.
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ============================================
// INTERFACES
// ============================================

export interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  };
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  subtitle,
  icon: IconComponent,
  action,
  children,
  className,
  headerClassName,
  contentClassName
}) => {
  const ActionIcon = action?.icon;

  return (
    <section className={cn('p-6 bg-card rounded-xl border border-border shadow-sm', className)}>
      {/* Section Header */}
      <div className={cn(
        'flex items-center justify-between',
        headerClassName
      )}>
        <div className="flex items-center gap-3">
          {IconComponent && (
            <div className="p-2 bg-muted rounded-lg">
              <IconComponent className="w-5 h-5 text-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-foreground truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {action && (
          <div className="flex-shrink-0 ml-4">
            <Button
              variant={action.variant || 'outline'}
              size="sm"
              onClick={action.onClick}
            >
              {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
              {action.label}
            </Button>
          </div>
        )}
      </div>

      {/* Section Content */}
      <div className={contentClassName}>
        {children}
      </div>
    </section>
  );
};

// ============================================
// EXPORTS
// ============================================

export default DashboardSection;
