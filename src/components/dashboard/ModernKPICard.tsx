/**
 * Modern KPI Card Component
 * 
 * Enhanced KPI card with modern design patterns, hover effects,
 * trend indicators, and actionable interactions for CMMS dashboards.
 */

import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AnalyticsUpIcon,
  AnalyticsDownIcon,
  MinusSignIcon,
  ArrowRight01Icon
} from '@hugeicons/core-free-icons';
import { Icon } from '@/components/icons/Icon';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

// ============================================
// INTERFACES
// ============================================

export interface ModernKPICardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  loading?: boolean;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  sparklineData?: number[];
  className?: string;
}

// ============================================
// COLOR SYSTEM
// ============================================

const colorClasses = {
  primary: {
    bg: 'bg-white',
    border: 'border-l-4 border-l-steel-500 border-t border-r border-b border-gray-200',
    icon: 'text-steel-600',
    iconBg: 'bg-steel-50',
    value: 'text-gray-900',
    label: 'text-gray-600',
    hover: 'hover:shadow-md hover:border-gray-300'
  },
  success: {
    bg: 'bg-white',
    border: 'border-l-4 border-l-emerald-500 border-t border-r border-b border-gray-200',
    icon: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    value: 'text-gray-900',
    label: 'text-gray-600',
    hover: 'hover:shadow-md hover:border-gray-300'
  },
  warning: {
    bg: 'bg-white',
    border: 'border-l-4 border-l-amber-500 border-t border-r border-b border-gray-200',
    icon: 'text-amber-600',
    iconBg: 'bg-amber-50',
    value: 'text-gray-900',
    label: 'text-gray-600',
    hover: 'hover:shadow-md hover:border-gray-300'
  },
  danger: {
    bg: 'bg-white',
    border: 'border-l-4 border-l-rose-500 border-t border-r border-b border-gray-200',
    icon: 'text-rose-600',
    iconBg: 'bg-rose-50',
    value: 'text-gray-900',
    label: 'text-gray-600',
    hover: 'hover:shadow-md hover:border-gray-300'
  },
  info: {
    bg: 'bg-white',
    border: 'border-l-4 border-l-slate-500 border-t border-r border-b border-gray-200',
    icon: 'text-slate-600',
    iconBg: 'bg-slate-50',
    value: 'text-gray-900',
    label: 'text-gray-600',
    hover: 'hover:shadow-md hover:border-gray-300'
  }
};

// ============================================
// LOADING SKELETON
// ============================================

const KPICardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Card className={cn('h-full animate-pulse', className)}>
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-machinery-200 rounded" />
          <div className="h-3 w-16 bg-machinery-200 rounded" />
        </div>
        <div className="h-10 w-10 bg-machinery-200 rounded-lg" />
      </div>
      <div className="h-8 w-16 bg-machinery-200 rounded" />
      <div className="h-4 w-20 bg-machinery-200 rounded" />
    </div>
  </Card>
);

// ============================================
// TREND UTILITIES
// ============================================

const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
  switch (direction) {
    case 'up': return AnalyticsUpIcon;
    case 'down': return AnalyticsDownIcon;
    default: return MinusSignIcon;
  }
};

const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
  switch (direction) {
    case 'up': return 'text-emerald-600';
    case 'down': return 'text-rose-600';
    default: return 'text-gray-500';
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

const ModernKPICard: React.FC<ModernKPICardProps> = ({
  title,
  value,
  icon,
  trend,
  color,
  loading = false,
  subtitle,
  actionLabel,
  onAction,
  sparklineData = [],
  className
}) => {
  const classes = colorClasses[color];

  if (loading) {
    return <KPICardSkeleton className={className} />;
  }

  const isClickable = !!onAction;

  return (
    <motion.div
      whileHover={isClickable ? { y: -1 } : undefined}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={cn('h-full', className)}
    >
      <div
        className={cn(
          'h-full transition-all duration-200 rounded-lg',
          classes.bg,
          classes.border,
          classes.hover,
          isClickable && 'cursor-pointer'
        )}
        onClick={isClickable ? onAction : undefined}
      >
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 min-w-0">
              <p className={cn('text-xs font-medium uppercase tracking-wider mb-1', classes.label)}>
                {title}
              </p>
              {subtitle && (
                <p className="text-xs text-gray-500">{subtitle}</p>
              )}
            </div>
            <div className={cn('p-2 rounded-lg flex-shrink-0 ml-3', classes.iconBg)}>
              <HugeiconsIcon icon={icon} size={20} className={cn(classes.icon)} />
            </div>
          </div>

          {/* Value */}
          <div className="mb-4">
            <div className={cn('text-3xl font-bold tracking-tight', classes.value)}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {trend && (
              <div className={cn(
                'flex items-center gap-1.5 text-xs font-medium',
                getTrendColor(trend.direction)
              )}>
                <HugeiconsIcon icon={getTrendIcon(trend.direction)} size={14} />
                <span>{Math.abs(trend.value)}%</span>
                <span className="text-gray-500">{trend.label}</span>
              </div>
            )}

            {actionLabel && isClickable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction?.();
                }}
                className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1 group"
              >
                {actionLabel}
                <Icon
                  icon="tabler:arrow-right"
                  className="w-3 h-3 transition-transform group-hover:translate-x-0.5"
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default ModernKPICard;
export { KPICardSkeleton };
export type { ModernKPICardProps };
