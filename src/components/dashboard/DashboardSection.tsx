/**
 * Dashboard Section Component
 * 
 * Reusable section wrapper for dashboard content with consistent
 * styling, headers, and action buttons.
 */

import React from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import ProfessionalButton from '@/components/ui/ProfessionalButton';

// ============================================
// INTERFACES
// ============================================

export interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  icon?: string;
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
    <section className={cn('space-y-4', className)}>
      {/* Section Header */}
      <div className={cn(
        'flex items-center justify-between',
        headerClassName
      )}>
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 bg-steel-100 rounded-lg">
              <Icon icon={icon} className="w-5 h-5 text-steel-600" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-machinery-900 truncate">
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
            <ProfessionalButton
              variant={action.variant || 'outline'}
              size="sm"
              icon={action.icon}
              onClick={action.onClick}
            >
              {action.label}
            </ProfessionalButton>
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
export type { DashboardSectionProps };