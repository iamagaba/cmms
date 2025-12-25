/**
 * Professional Metric Card Component
 * 
 * A KPI card component with industrial styling, trend indicators,
 * sparkline integration, and responsive design for dashboard metrics.
 */

import React from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================
// INTERFACES
// ============================================

export interface TrendData {
  value: number;
  timestamp: string | Date;
}

export interface MetricCardProps {
  // Core metric data
  title: string;
  value: string | number;
  unit?: string;
  description?: string;
  
  // Trend and comparison
  previousValue?: string | number;
  changePercentage?: number;
  trendData?: TrendData[];
  trendDirection?: 'up' | 'down' | 'neutral';
  
  // Visual styling
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  variant?: 'default' | 'compact' | 'detailed' | 'minimal';
  size?: 'sm' | 'base' | 'lg';
  
  // Interactive features
  onClick?: () => void;
  href?: string;
  loading?: boolean;
  
  // Status and alerts
  status?: 'normal' | 'warning' | 'critical' | 'good';
  threshold?: {
    warning: number;
    critical: number;
  };
  
  // Additional content
  subtitle?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  
  // Accessibility
  ariaLabel?: string;
  
  // Styling
  className?: string;
}

// ============================================
// COLOR MAPPINGS
// ============================================

const colorMappings = {
  primary: {
    bg: 'bg-steel-50',
    border: 'border-steel-200',
    icon: 'text-steel-600',
    value: 'text-steel-900',
    trend: {
      up: 'text-success-600',
      down: 'text-error-600',
      neutral: 'text-machinery-500',
    },
  },
  success: {
    bg: 'bg-success-50',
    border: 'border-success-200',
    icon: 'text-success-600',
    value: 'text-success-900',
    trend: {
      up: 'text-success-600',
      down: 'text-error-600',
      neutral: 'text-machinery-500',
    },
  },
  warning: {
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    icon: 'text-warning-600',
    value: 'text-warning-900',
    trend: {
      up: 'text-success-600',
      down: 'text-error-600',
      neutral: 'text-machinery-500',
    },
  },
  error: {
    bg: 'bg-error-50',
    border: 'border-error-200',
    icon: 'text-error-600',
    value: 'text-error-900',
    trend: {
      up: 'text-success-600',
      down: 'text-error-600',
      neutral: 'text-machinery-500',
    },
  },
  info: {
    bg: 'bg-info-50',
    border: 'border-info-200',
    icon: 'text-info-600',
    value: 'text-info-900',
    trend: {
      up: 'text-success-600',
      down: 'text-error-600',
      neutral: 'text-machinery-500',
    },
  },
  neutral: {
    bg: 'bg-machinery-50',
    border: 'border-machinery-200',
    icon: 'text-machinery-600',
    value: 'text-machinery-900',
    trend: {
      up: 'text-success-600',
      down: 'text-error-600',
      neutral: 'text-machinery-500',
    },
  },
};

// ============================================
// SIZE MAPPINGS
// ============================================

const sizeMappings = {
  sm: {
    container: 'p-4',
    icon: 'w-8 h-8',
    iconSize: 'w-4 h-4',
    title: 'text-sm',
    value: 'text-lg',
    subtitle: 'text-xs',
    trend: 'text-xs',
  },
  base: {
    container: 'p-6',
    icon: 'w-10 h-10',
    iconSize: 'w-5 h-5',
    title: 'text-sm',
    value: 'text-2xl',
    subtitle: 'text-sm',
    trend: 'text-sm',
  },
  lg: {
    container: 'p-8',
    icon: 'w-12 h-12',
    iconSize: 'w-6 h-6',
    title: 'text-base',
    value: 'text-3xl',
    subtitle: 'text-base',
    trend: 'text-base',
  },
};

// ============================================
// TREND INDICATOR COMPONENT
// ============================================

interface TrendIndicatorProps {
  changePercentage?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  color: keyof typeof colorMappings;
  size: keyof typeof sizeMappings;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  changePercentage,
  trendDirection,
  color,
  size,
}) => {
  if (!changePercentage && !trendDirection) return null;

  const direction = trendDirection || (changePercentage && changePercentage > 0 ? 'up' : changePercentage && changePercentage < 0 ? 'down' : 'neutral');
  const colors = colorMappings[color];
  const sizes = sizeMappings[size];

  const getIcon = () => {
    switch (direction) {
      case 'up':
        return 'tabler:trending-up';
      case 'down':
        return 'tabler:trending-down';
      default:
        return 'tabler:minus';
    }
  };

  return (
    <div className={cn('flex items-center gap-1', colors.trend[direction])}>
      <Icon icon={getIcon()} className={cn('w-4 h-4', sizes.trend)} />
      {changePercentage !== undefined && (
        <span className={cn('font-medium', sizes.trend)}>
          {Math.abs(changePercentage).toFixed(1)}%
        </span>
      )}
    </div>
  );
};

// ============================================
// SPARKLINE COMPONENT
// ============================================

interface SparklineProps {
  data: TrendData[];
  color: keyof typeof colorMappings;
  height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color, height = 40 }) => {
  if (!data || data.length === 0) return null;

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = ((max - d.value) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const colors = colorMappings[color];
  const strokeColor = colors.icon.replace('text-', '').replace('-600', '');

  return (
    <div className="w-full" style={{ height }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={colors.icon}
        />
      </svg>
    </div>
  );
};

// ============================================
// STATUS INDICATOR COMPONENT
// ============================================

interface StatusIndicatorProps {
  status: 'normal' | 'warning' | 'critical' | 'good';
  size: keyof typeof sizeMappings;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, size }) => {
  const statusConfig = {
    normal: { color: 'text-machinery-400', icon: 'tabler:circle' },
    good: { color: 'text-success-500', icon: 'tabler:circle-check' },
    warning: { color: 'text-warning-500', icon: 'tabler:alert-triangle' },
    critical: { color: 'text-error-500', icon: 'tabler:alert-circle' },
  };

  const config = statusConfig[status];
  const sizes = sizeMappings[size];

  return (
    <Icon
      icon={config.icon}
      className={cn('w-4 h-4', config.color, sizes.iconSize)}
    />
  );
};

// ============================================
// LOADING SKELETON COMPONENT
// ============================================

interface LoadingSkeletonProps {
  variant: 'default' | 'compact' | 'detailed' | 'minimal';
  size: keyof typeof sizeMappings;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ variant, size }) => {
  const sizes = sizeMappings[size];

  return (
    <div className={cn('animate-pulse', sizes.container)}>
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-machinery-200 rounded w-24" />
          {variant === 'detailed' && (
            <div className="h-3 bg-machinery-200 rounded w-32" />
          )}
        </div>
        <div className={cn('bg-machinery-200 rounded', sizes.icon)} />
      </div>
      
      <div className="space-y-2">
        <div className={cn('h-8 bg-machinery-200 rounded w-20', sizes.value)} />
        {variant !== 'minimal' && (
          <div className="h-3 bg-machinery-200 rounded w-16" />
        )}
      </div>
      
      {variant === 'detailed' && (
        <div className="mt-4 h-10 bg-machinery-200 rounded" />
      )}
    </div>
  );
};

// ============================================
// MAIN METRIC CARD COMPONENT
// ============================================

const ProfessionalMetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  description,
  previousValue,
  changePercentage,
  trendData,
  trendDirection,
  icon,
  color = 'neutral',
  variant = 'default',
  size = 'base',
  onClick,
  href,
  loading = false,
  status,
  threshold,
  subtitle,
  footer,
  children,
  ariaLabel,
  className,
}) => {
  const colors = colorMappings[color];
  const sizes = sizeMappings[size];

  // Determine status based on threshold if provided
  const computedStatus = useMemo(() => {
    if (status) return status;
    if (!threshold || typeof value !== 'number') return 'normal';
    
    if (value >= threshold.critical) return 'critical';
    if (value >= threshold.warning) return 'warning';
    return 'good';
  }, [status, threshold, value]);

  // Loading state
  if (loading) {
    return (
      <div className={cn(
        'bg-white rounded-lg border shadow-sm',
        colors.border,
        className
      )}>
        <LoadingSkeleton variant={variant} size={size} />
      </div>
    );
  }

  // Base card component
  const CardComponent = href ? 'a' : onClick ? 'button' : 'div';
  const cardProps = {
    ...(href && { href }),
    ...(onClick && { onClick }),
    ...(ariaLabel && { 'aria-label': ariaLabel }),
    className: cn(
      'bg-white rounded-lg border shadow-sm transition-all duration-200',
      colors.border,
      (onClick || href) && 'hover:shadow-md hover:border-steel-300 cursor-pointer',
      onClick && 'text-left w-full',
      className
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CardComponent {...cardProps}>
        <div className={sizes.container}>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn('font-medium text-machinery-700 truncate', sizes.title)}>
                  {title}
                </h3>
                {status && <StatusIndicator status={computedStatus} size={size} />}
              </div>
              {subtitle && (
                <p className={cn('text-machinery-500 truncate', sizes.subtitle)}>
                  {subtitle}
                </p>
              )}
            </div>
            
            {icon && (
              <div className={cn(
                'flex items-center justify-center rounded-lg flex-shrink-0',
                colors.bg,
                sizes.icon
              )}>
                <Icon icon={icon} className={cn(colors.icon, sizes.iconSize)} />
              </div>
            )}
          </div>

          {/* Value and Trend */}
          <div className="flex items-end justify-between mb-2">
            <div className="flex items-baseline gap-1">
              <span className={cn('font-bold', colors.value, sizes.value)}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              {unit && (
                <span className={cn('text-machinery-500 font-medium', sizes.subtitle)}>
                  {unit}
                </span>
              )}
            </div>
            
            <TrendIndicator
              changePercentage={changePercentage}
              trendDirection={trendDirection}
              color={color}
              size={size}
            />
          </div>

          {/* Description */}
          {description && variant !== 'minimal' && (
            <p className={cn('text-machinery-600 mb-3', sizes.subtitle)}>
              {description}
            </p>
          )}

          {/* Sparkline */}
          {trendData && variant === 'detailed' && (
            <div className="mb-4">
              <Sparkline data={trendData} color={color} height={size === 'lg' ? 60 : 40} />
            </div>
          )}

          {/* Previous Value Comparison */}
          {previousValue && variant !== 'minimal' && (
            <div className={cn('text-machinery-500', sizes.subtitle)}>
              Previous: {typeof previousValue === 'number' ? previousValue.toLocaleString() : previousValue}
              {unit && ` ${unit}`}
            </div>
          )}

          {/* Custom Children */}
          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}

          {/* Footer */}
          {footer && (
            <div className="mt-4 pt-4 border-t border-machinery-100">
              {footer}
            </div>
          )}
        </div>
      </CardComponent>
    </motion.div>
  );
};

// ============================================
// METRIC CARD GRID COMPONENT
// ============================================

interface MetricCardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6;
  gap?: 'sm' | 'base' | 'lg';
  className?: string;
}

export const MetricCardGrid: React.FC<MetricCardGridProps> = ({
  children,
  columns = 3,
  gap = 'base',
  className,
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  const gapClasses = {
    sm: 'gap-3',
    base: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div className={cn('grid', gridCols[columns], gapClasses[gap], className)}>
      {children}
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default ProfessionalMetricCard;
export type { MetricCardProps, TrendData };