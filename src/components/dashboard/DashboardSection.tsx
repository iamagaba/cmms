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
import ProfessionalButton from '@/components/ui/ProfessionalButton';
import { useDensitySpacing } from '@/hooks/useDensitySpacing';
import { useDensity } from '@/context/DensityContext';

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
  const spacing = useDensitySpacing();
  const { isCompact } = useDensity();
  
  return (
    <section className={cn(spacing.section, className)}>
      {/* Section Header */}
      <div className={cn(
        'flex items-center justify-between',
        headerClassName
      )}>
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`${isCompact ? 'p-1.5' : 'p-2'} bg-steel-100 rounded-lg`}>
              <HugeiconsIcon icon={icon} size={spacing.icon.md} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className={`${spacing.text.heading} font-semibold text-machinery-900 truncate`}>
              {title}
            </h2>
            {subtitle && (
              <p className={`${spacing.text.caption} text-machinery-600 mt-1 truncate`}>
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