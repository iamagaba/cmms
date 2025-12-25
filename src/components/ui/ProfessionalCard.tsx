/**
 * Professional CMMS Card Component System
 * 
 * A comprehensive card system designed for maintenance management workflows.
 * Includes base cards, metric cards, data cards, and action cards with
 * consistent styling, proper semantic markup, and accessibility features.
 */

import React, { forwardRef } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================
// BASE CARD INTERFACES
// ============================================

export interface BaseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Card variant determines the visual style and purpose
   */
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  
  /**
   * Card size affects padding and spacing
   */
  size?: 'sm' | 'base' | 'lg';
  
  /**
   * Whether the card is interactive (clickable)
   */
  interactive?: boolean;
  
  /**
   * Whether the card is loading
   */
  loading?: boolean;
  
  /**
   * Custom padding override
   */
  padding?: 'none' | 'sm' | 'base' | 'lg';
}

export interface ProfessionalCardProps extends BaseCardProps {
  /**
   * Card header content
   */
  header?: React.ReactNode;
  
  /**
   * Card footer content
   */
  footer?: React.ReactNode;
  
  /**
   * Card title
   */
  title?: string;
  
  /**
   * Card subtitle or description
   */
  subtitle?: string;
  
  /**
   * Icon to display in the header
   */
  icon?: string;
  
  /**
   * Action buttons or elements
   */
  actions?: React.ReactNode;
}

export interface MetricCardProps extends BaseCardProps {
  /**
   * Primary metric value
   */
  value: string | number;
  
  /**
   * Metric label
   */
  label: string;
  
  /**
   * Optional secondary value or change indicator
   */
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
    label?: string;
  };
  
  /**
   * Icon for the metric
   */
  icon?: string;
  
  /**
   * Color theme for the metric
   */
  theme?: 'default' | 'success' | 'warning' | 'error' | 'info';
  
  /**
   * Optional trend chart or visualization
   */
  chart?: React.ReactNode;
}

export interface DataCardProps extends BaseCardProps {
  /**
   * Data items to display
   */
  data: Array<{
    label: string;
    value: string | number;
    icon?: string;
    color?: string;
  }>;
  
  /**
   * Card title
   */
  title?: string;
  
  /**
   * Whether to show dividers between items
   */
  showDividers?: boolean;
}

export interface ActionCardProps extends BaseCardProps {
  /**
   * Card title
   */
  title: string;
  
  /**
   * Card description
   */
  description?: string;
  
  /**
   * Primary action button
   */
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: string;
    loading?: boolean;
  };
  
  /**
   * Secondary action button
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: string;
  };
  
  /**
   * Icon for the card
   */
  icon?: string;
  
  /**
   * Color theme for the card
   */
  theme?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

// ============================================
// STYLE VARIANTS
// ============================================

const cardVariants = {
  default: [
    'bg-white dark:bg-gray-900 border border-machinery-200 dark:border-gray-800',
    'shadow-sm',
  ],
  elevated: [
    'bg-white dark:bg-gray-900 border border-machinery-200 dark:border-gray-800',
    'shadow-md hover:shadow-lg',
  ],
  outlined: [
    'bg-white dark:bg-gray-900 border-2 border-machinery-300 dark:border-gray-700',
    'shadow-none',
  ],
  filled: [
    'bg-machinery-50 dark:bg-gray-800 border border-machinery-200 dark:border-gray-700',
    'shadow-none',
  ],
};

const cardSizes = {
  sm: {
    padding: 'p-4',
    gap: 'space-y-3',
    headerGap: 'gap-2',
  },
  base: {
    padding: 'p-6',
    gap: 'space-y-4',
    headerGap: 'gap-3',
  },
  lg: {
    padding: 'p-8',
    gap: 'space-y-6',
    headerGap: 'gap-4',
  },
};

const paddingOverrides = {
  none: 'p-0',
  sm: 'p-4',
  base: 'p-6',
  lg: 'p-8',
};

const interactiveStyles = [
  'cursor-pointer transition-all duration-200',
  'hover:shadow-md hover:border-machinery-300 dark:hover:border-gray-600',
  'focus:outline-none focus:ring-2 focus:ring-steel-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
];

const themeColors = {
  default: {
    icon: 'text-machinery-500',
    accent: 'text-steel-600',
    bg: 'bg-steel-50',
    border: 'border-steel-200',
  },
  success: {
    icon: 'text-industrial-500',
    accent: 'text-industrial-600',
    bg: 'bg-industrial-50',
    border: 'border-industrial-200',
  },
  warning: {
    icon: 'text-maintenance-500',
    accent: 'text-maintenance-600',
    bg: 'bg-maintenance-50',
    border: 'border-maintenance-200',
  },
  error: {
    icon: 'text-warning-500',
    accent: 'text-warning-600',
    bg: 'bg-warning-50',
    border: 'border-warning-200',
  },
  info: {
    icon: 'text-steel-500',
    accent: 'text-steel-600',
    bg: 'bg-steel-50',
    border: 'border-steel-200',
  },
};

// ============================================
// LOADING SKELETON COMPONENT
// ============================================

const CardSkeleton: React.FC<{ lines?: number; showHeader?: boolean }> = ({ 
  lines = 3, 
  showHeader = true 
}) => {
  return (
    <div className="animate-pulse space-y-4">
      {showHeader && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-machinery-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-machinery-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-3 bg-machinery-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-3 bg-machinery-200 dark:bg-gray-700 rounded',
              i === lines - 1 ? 'w-2/3' : 'w-full'
            )}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================
// BASE CARD COMPONENT
// ============================================

const ProfessionalCard = forwardRef<HTMLDivElement, ProfessionalCardProps>(
  (
    {
      variant = 'default',
      size = 'base',
      interactive = false,
      loading = false,
      padding,
      header,
      footer,
      title,
      subtitle,
      icon,
      actions,
      className,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const sizeConfig = cardSizes[size];
    const paddingClass = padding ? paddingOverrides[padding] : sizeConfig.padding;

    const cardContent = (
      <>
        {/* Header */}
        {(header || title || subtitle || icon || actions) && (
          <div className={cn('flex items-start justify-between', sizeConfig.headerGap)}>
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {icon && (
                <div className="flex-shrink-0 mt-0.5">
                  <Icon icon={icon} className="w-5 h-5 text-machinery-500 dark:text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {header || (
                  <>
                    {title && (
                      <h3 className="text-lg font-semibold text-machinery-900 dark:text-gray-100 truncate">
                        {title}
                      </h3>
                    )}
                    {subtitle && (
                      <p className="text-sm text-machinery-600 dark:text-gray-400 mt-1">
                        {subtitle}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex-shrink-0 ml-4">
                {actions}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        {children && (
          <div className={cn(
            (header || title || subtitle || icon || actions) && 'mt-4'
          )}>
            {children}
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="mt-4 pt-4 border-t border-machinery-200 dark:border-gray-700">
            {footer}
          </div>
        )}
      </>
    );

    return (
      <motion.div
        ref={ref}
        whileHover={interactive ? { y: -2 } : undefined}
        transition={{ duration: 0.2 }}
        className={cn(
          // Base styles
          'rounded-lg',
          'transition-all duration-200',
          
          // Variant styles
          cardVariants[variant],
          
          // Size and padding
          paddingClass,
          
          // Interactive styles
          interactive && interactiveStyles,
          
          // Custom className
          className
        )}
        onClick={interactive ? onClick : undefined}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        {...props}
      >
        {loading ? <CardSkeleton /> : cardContent}
      </motion.div>
    );
  }
);

ProfessionalCard.displayName = 'ProfessionalCard';

// ============================================
// METRIC CARD COMPONENT
// ============================================

const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
  (
    {
      value,
      label,
      change,
      icon,
      theme = 'default',
      chart,
      className,
      ...props
    },
    ref
  ) => {
    const themeConfig = themeColors[theme];

    return (
      <ProfessionalCard
        ref={ref}
        variant="elevated"
        className={cn('relative overflow-hidden', className)}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Label */}
            <p className="text-sm font-medium text-machinery-600 dark:text-gray-400 mb-2">
              {label}
            </p>
            
            {/* Value */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-machinery-900 dark:text-gray-100">
                {value}
              </span>
              
              {/* Change indicator */}
              {change && (
                <div className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  change.type === 'increase' && 'text-industrial-600',
                  change.type === 'decrease' && 'text-warning-600',
                  change.type === 'neutral' && 'text-machinery-600'
                )}>
                  <Icon
                    icon={
                      change.type === 'increase'
                        ? 'tabler:trending-up'
                        : change.type === 'decrease'
                        ? 'tabler:trending-down'
                        : 'tabler:minus'
                    }
                    className="w-4 h-4"
                  />
                  <span>{change.value}</span>
                  {change.label && (
                    <span className="text-machinery-500">
                      {change.label}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Icon */}
          {icon && (
            <div className={cn(
              'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center',
              themeConfig.bg
            )}>
              <Icon icon={icon} className={cn('w-6 h-6', themeConfig.icon)} />
            </div>
          )}
        </div>
        
        {/* Chart */}
        {chart && (
          <div className="mt-4">
            {chart}
          </div>
        )}
      </ProfessionalCard>
    );
  }
);

MetricCard.displayName = 'MetricCard';

// ============================================
// DATA CARD COMPONENT
// ============================================

const DataCard = forwardRef<HTMLDivElement, DataCardProps>(
  (
    {
      data,
      title,
      showDividers = true,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <ProfessionalCard
        ref={ref}
        title={title}
        className={className}
        {...props}
      >
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  {item.icon && (
                    <Icon
                      icon={item.icon}
                      className={cn(
                        'w-4 h-4',
                        item.color || 'text-machinery-500'
                      )}
                    />
                  )}
                  <span className="text-sm font-medium text-machinery-700">
                    {item.label}
                  </span>
                </div>
                <span className="text-sm font-semibold text-machinery-900">
                  {item.value}
                </span>
              </div>
              {showDividers && index < data.length - 1 && (
                <div className="border-t border-machinery-200" />
              )}
            </div>
          ))}
        </div>
      </ProfessionalCard>
    );
  }
);

DataCard.displayName = 'DataCard';

// ============================================
// ACTION CARD COMPONENT
// ============================================

const ActionCard = forwardRef<HTMLDivElement, ActionCardProps>(
  (
    {
      title,
      description,
      primaryAction,
      secondaryAction,
      icon,
      theme = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const themeConfig = themeColors[theme];

    return (
      <ProfessionalCard
        ref={ref}
        variant="outlined"
        className={cn('text-center', className)}
        {...props}
      >
        {/* Icon */}
        {icon && (
          <div className={cn(
            'w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4',
            themeConfig.bg
          )}>
            <Icon icon={icon} className={cn('w-8 h-8', themeConfig.icon)} />
          </div>
        )}
        
        {/* Content */}
        <div className="space-y-2 mb-6">
          <h3 className="text-lg font-semibold text-machinery-900">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-machinery-600">
              {description}
            </p>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              disabled={primaryAction.loading}
              className={cn(
                'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
                'font-medium text-sm transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                themeConfig.accent.replace('text-', 'bg-'),
                'text-white hover:opacity-90',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {primaryAction.loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                />
              ) : primaryAction.icon ? (
                <Icon icon={primaryAction.icon} className="w-4 h-4" />
              ) : null}
              {primaryAction.label}
            </button>
          )}
          
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className={cn(
                'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
                'font-medium text-sm transition-colors',
                'border border-machinery-300 text-machinery-700',
                'hover:bg-machinery-50 hover:border-machinery-400',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-machinery-500'
              )}
            >
              {secondaryAction.icon && (
                <Icon icon={secondaryAction.icon} className="w-4 h-4" />
              )}
              {secondaryAction.label}
            </button>
          )}
        </div>
      </ProfessionalCard>
    );
  }
);

ActionCard.displayName = 'ActionCard';

// ============================================
// CONTAINER COMPONENTS
// ============================================

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Container size determines max width
   */
  size?: 'sm' | 'base' | 'lg' | 'xl' | 'full';
  
  /**
   * Whether to center the container
   */
  centered?: boolean;
  
  /**
   * Custom padding
   */
  padding?: 'none' | 'sm' | 'base' | 'lg';
}

const containerSizes = {
  sm: 'max-w-2xl',
  base: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      size = 'base',
      centered = true,
      padding = 'base',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'w-full',
          
          // Size
          containerSizes[size],
          
          // Centering
          centered && 'mx-auto',
          
          // Padding
          padding === 'sm' && 'px-4',
          padding === 'base' && 'px-6',
          padding === 'lg' && 'px-8',
          
          // Custom className
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

// ============================================
// CARD GRID COMPONENT
// ============================================

interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns (responsive)
   */
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  
  /**
   * Gap between cards
   */
  gap?: 'sm' | 'base' | 'lg';
}

const CardGrid = forwardRef<HTMLDivElement, CardGridProps>(
  (
    {
      columns = { default: 1, md: 2, lg: 3 },
      gap = 'base',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const gridCols = cn(
      columns.default && `grid-cols-${columns.default}`,
      columns.sm && `sm:grid-cols-${columns.sm}`,
      columns.md && `md:grid-cols-${columns.md}`,
      columns.lg && `lg:grid-cols-${columns.lg}`,
      columns.xl && `xl:grid-cols-${columns.xl}`
    );

    const gapClass = {
      sm: 'gap-4',
      base: 'gap-6',
      lg: 'gap-8',
    }[gap];

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          gridCols,
          gapClass,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardGrid.displayName = 'CardGrid';

// ============================================
// EXPORTS
// ============================================

export default ProfessionalCard;
export {
  MetricCard,
  DataCard,
  ActionCard,
  Container,
  CardGrid,
  CardSkeleton,
};

export type {
  ProfessionalCardProps,
  MetricCardProps,
  DataCardProps,
  ActionCardProps,
  ContainerProps,
};