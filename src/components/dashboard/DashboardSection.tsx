/**
 * Dashboard Section Component
 * 
 * Reusable section wrapper for dashboard content with consistent
 * styling, headers, and action buttons.
 */

import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import type { IconSvgElement } from '@hugeicons/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';


// ============================================
// INTERFACES
// ============================================

export interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  icon?: IconSvgElement;
  action?: {
    label: string;
    onClick: () => void;
    icon?: string;
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
  icon,
  action,
  children,
  className,
  headerClassName,
  contentClassName
}) => {


  return (
    <section className={cn('p-6 bg-white rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm', className)}>
      {/* Section Header */}
      <div className={cn(
        'flex items-center justify-between',
        headerClassName
      )}>
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 bg-steel-100 rounded-lg">
              <HugeiconsIcon icon={icon} size={20} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-machinery-900 truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-machinery-600 mt-1 truncate">
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
              {action.icon && <HugeiconsIcon icon={action.icon} size={16} className="mr-2" />}
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