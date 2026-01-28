/**
 * Modern KPI Card Component
 * 
 * Enhanced KPI card with modern design patterns, hover effects,
 * trend indicators, and actionable interactions for CMMS dashboards.
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { Icon } from '@/components/icons/Icon';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

// ============================================
// INTERFACES
// ============================================

export interface ModernKPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
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

// Use CSS variables for theming
const colorClasses = {
  primary: {
    border: 'border-l-4 border-l-primary',
    icon: 'text-primary',
    iconBg: 'bg-primary/10',
  },
  success: {
    border: 'border-l-4 border-l-success',
    icon: 'text-success-foreground',
    iconBg: 'bg-success/10',
  },
  warning: {
    border: 'border-l-4 border-l-warning',
    icon: 'text-warning-foreground',
    iconBg: 'bg-warning/10',
  },
  danger: {
    border: 'border-l-4 border-l-destructive',
    icon: 'text-destructive-foreground',
    iconBg: 'bg-destructive/10',
  },
  info: {
    border: 'border-l-4 border-l-info',
    icon: 'text-info-foreground',
    iconBg: 'bg-info/10',
  },
};

// ============================================
// LOADING SKELETON
// ============================================

const KPICardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Card className={cn('h-full', className)}>
    <CardContent className="p-6 space-y-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-3 w-16 bg-muted rounded" />
        </div>
        <div className="h-10 w-10 bg-muted rounded-lg" />
      </div>
      <div className="h-8 w-16 bg-muted rounded" />
      <div className="h-4 w-20 bg-muted rounded" />
    </CardContent>
  </Card>
);

// ============================================
// TREND UTILITIES
// ============================================

const getTrendIcon = (direction: 'up' | 'down' | 'neutral'): LucideIcon => {
  switch (direction) {
    case 'up': return TrendingUp;
    case 'down': return TrendingDown;
    default: return Minus;
  }
};

const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
  switch (direction) {
    case 'up': return 'text-success';
    case 'down': return 'text-destructive';
    default: return 'text-muted-foreground';
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

const ModernKPICard: React.FC<ModernKPICardProps> = ({
  title,
  value,
  icon: IconComponent,
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
      <Card
        className={cn(
          'h-full transition-all duration-200 hover:shadow-md',
          classes.border,
          isClickable && 'cursor-pointer'
        )}
        onClick={isClickable ? onAction : undefined}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {title}
              </p>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <div className={cn('p-2 rounded-lg flex-shrink-0 ml-3', classes.iconBg)}>
              <IconComponent className={cn('w-5 h-5', classes.icon)} />
            </div>
          </div>

          {/* Value */}
          <div className="mb-4">
            <div className="text-3xl font-bold tracking-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {trend && (() => {
              const TrendIcon = getTrendIcon(trend.direction);
              return (
                <div className={cn(
                  'flex items-center gap-1.5 text-xs font-medium',
                  getTrendColor(trend.direction)
                )}>
                  <TrendIcon className="w-4 h-4" />
                  <span>{Math.abs(trend.value)}%</span>
                  <span className="text-muted-foreground">{trend.label}</span>
                </div>
              );
            })()}

            {actionLabel && isClickable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction?.();
                }}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
              >
                {actionLabel}
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default ModernKPICard;
export { KPICardSkeleton };
export type { ModernKPICardProps };