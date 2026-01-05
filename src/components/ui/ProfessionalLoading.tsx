/**
 * Professional CMMS Loading and Skeleton Components
 * 
 * A comprehensive loading system designed for maintenance management workflows.
 * Includes loading spinners, skeleton patterns, and loading states with
 * industrial design language and consistent timing/easing.
 */

import React, { forwardRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Loading03Icon } from '@hugeicons/core-free-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================
// LOADING SPINNER INTERFACES
// ============================================

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Spinner size
   */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';

  /**
   * Spinner variant with industrial design
   */
  variant?: 'default' | 'industrial' | 'minimal' | 'dots';

  /**
   * Color theme
   */
  theme?: 'default' | 'primary' | 'success' | 'warning' | 'error';

  /**
   * Loading text to display
   */
  text?: string;

  /**
   * Whether to show the spinner inline
   */
  inline?: boolean;
}

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Skeleton variant for different content types
   */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';

  /**
   * Width of the skeleton
   */
  width?: string | number;

  /**
   * Height of the skeleton
   */
  height?: string | number;

  /**
   * Number of lines for text skeleton
   */
  lines?: number;

  /**
   * Animation type
   */
  animation?: 'pulse' | 'wave' | 'none';
}

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether the component is loading
   */
  loading: boolean;

  /**
   * Loading spinner props
   */
  spinnerProps?: Omit<LoadingSpinnerProps, 'className'>;

  /**
   * Skeleton props for content placeholder
   */
  skeletonProps?: Omit<SkeletonProps, 'className'>;

  /**
   * Loading overlay variant
   */
  overlay?: 'none' | 'blur' | 'dim' | 'full';

  /**
   * Minimum loading time in ms to prevent flashing
   */
  minLoadingTime?: number;
}

// ============================================
// STYLE CONFIGURATIONS
// ============================================

const spinnerSizes = {
  xs: {
    size: 'w-3 h-3',
    border: 'border',
    text: 'text-xs',
    gap: 'gap-1',
  },
  sm: {
    size: 'w-4 h-4',
    border: 'border',
    text: 'text-sm',
    gap: 'gap-2',
  },
  base: {
    size: 'w-5 h-5',
    border: 'border-2',
    text: 'text-base',
    gap: 'gap-2',
  },
  lg: {
    size: 'w-6 h-6',
    border: 'border-2',
    text: 'text-lg',
    gap: 'gap-3',
  },
  xl: {
    size: 'w-8 h-8',
    border: 'border-2',
    text: 'text-xl',
    gap: 'gap-3',
  },
};

const spinnerThemes = {
  default: {
    border: 'border-machinery-300',
    active: 'border-t-machinery-600',
    text: 'text-machinery-600',
  },
  primary: {
    border: 'border-steel-300',
    active: 'border-t-steel-600',
    text: 'text-steel-600',
  },
  success: {
    border: 'border-industrial-300',
    active: 'border-t-industrial-600',
    text: 'text-industrial-600',
  },
  warning: {
    border: 'border-maintenance-300',
    active: 'border-t-maintenance-600',
    text: 'text-maintenance-600',
  },
  error: {
    border: 'border-warning-300',
    active: 'border-t-warning-600',
    text: 'text-warning-600',
  },
};

// ============================================
// LOADING SPINNER COMPONENT
// ============================================

const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  (
    {
      size = 'base',
      variant = 'default',
      theme = 'default',
      text,
      inline = false,
      className,
      ...props
    },
    ref
  ) => {
    const sizeConfig = spinnerSizes[size];
    const themeConfig = spinnerThemes[theme];

    const renderSpinner = () => {
      switch (variant) {
        case 'industrial':
          return (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'linear',
              }}
              className={cn(
                sizeConfig.size,
                'relative'
              )}
            >
              {/* Outer ring */}
              <div className={cn(
                'absolute inset-0 rounded-full',
                sizeConfig.border,
                themeConfig.border
              )} />

              {/* Inner rotating element */}
              <div className={cn(
                'absolute inset-0 rounded-full',
                sizeConfig.border,
                'border-transparent',
                themeConfig.active,
                'border-t-2'
              )} />

              {/* Center dot */}
              <div className={cn(
                'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
                'w-1 h-1 rounded-full',
                themeConfig.active.replace('border-t-', 'bg-')
              )} />
            </motion.div>
          );

        case 'minimal':
          return (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: 'linear',
              }}
              className={cn(
                sizeConfig.size,
                'rounded-full',
                sizeConfig.border,
                'border-transparent',
                themeConfig.active
              )}
            />
          );

        case 'dots':
          return (
            <div className={cn('flex', sizeConfig.gap)}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                  className={cn(
                    'w-2 h-2 rounded-full',
                    themeConfig.active.replace('border-t-', 'bg-')
                  )}
                />
              ))}
            </div>
          );

        default:
          return (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }}
              className={cn(
                sizeConfig.size,
                themeConfig.text
              )}
            >
              <HugeiconsIcon icon={Loading03Icon} className="w-full h-full" />
            </motion.div>
          );
      }
    };

    const content = (
      <div
        className={cn(
          'flex items-center',
          inline ? 'inline-flex' : 'flex',
          sizeConfig.gap,
          className
        )}
      >
        {renderSpinner()}
        {text && (
          <span className={cn(
            'font-medium',
            sizeConfig.text,
            themeConfig.text
          )}>
            {text}
          </span>
        )}
      </div>
    );

    return inline ? (
      <div
        ref={ref}
        {...props}
      >
        {content}
      </div>
    ) : (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center',
          className
        )}
        {...props}
      >
        {content}
      </div>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

// ============================================
// SKELETON COMPONENT
// ============================================

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'rectangular',
      width,
      height,
      lines = 1,
      animation = 'pulse',
      className,
      style,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'bg-machinery-200',
      animation === 'pulse' && 'animate-pulse',
      animation === 'wave' && 'animate-pulse', // We'll use pulse for now, wave can be added with custom CSS
    );

    const getVariantStyles = () => {
      switch (variant) {
        case 'text':
          return 'h-4 rounded';
        case 'circular':
          return 'rounded-full aspect-square';
        case 'rounded':
          return 'rounded-lg';
        case 'rectangular':
        default:
          return 'rounded';
      }
    };

    const skeletonStyle = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      ...style,
    };

    if (variant === 'text' && lines > 1) {
      return (
        <div
          ref={ref}
          className={cn('space-y-2', className)}
          {...props}
        >
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                baseStyles,
                getVariantStyles(),
                i === lines - 1 ? 'w-3/4' : 'w-full'
              )}
              style={i === lines - 1 ? { ...skeletonStyle, width: '75%' } : skeletonStyle}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          getVariantStyles(),
          className
        )}
        style={skeletonStyle}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// ============================================
// SKELETON PATTERNS
// ============================================

interface SkeletonPatternProps {
  className?: string;
}

export const CardSkeleton: React.FC<SkeletonPatternProps & React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('p-6 space-y-4', className)} {...props}>
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="space-y-2 flex-1">
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="60%" />
      </div>
    </div>
    <Skeleton variant="text" lines={3} />
  </div>
);

export const TableSkeleton: React.FC<SkeletonPatternProps & { rows?: number; columns?: number } & React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  rows = 5,
  columns = 4,
  ...props
}) => (
  <div className={cn('space-y-3', className)} {...props}>
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`header-${i}`} variant="text" width="80%" />
      ))}
    </div>

    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={`cell-${rowIndex}-${colIndex}`} variant="text" />
        ))}
      </div>
    ))}
  </div>
);

export const FormSkeleton: React.FC<SkeletonPatternProps & { fields?: number } & React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  fields = 4,
  ...props
}) => (
  <div className={cn('space-y-6', className)} {...props}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton variant="text" width="25%" />
        <Skeleton variant="rectangular" height={40} />
      </div>
    ))}
    <div className="flex gap-3 pt-4">
      <Skeleton variant="rectangular" width={100} height={40} />
      <Skeleton variant="rectangular" width={80} height={40} />
    </div>
  </div>
);

export const DashboardSkeleton: React.FC<SkeletonPatternProps & React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('space-y-6', className)} {...props}>
    {/* Header */}
    <div className="flex items-center justify-between">
      <Skeleton variant="text" width="30%" height={32} />
      <Skeleton variant="rectangular" width={120} height={40} />
    </div>

    {/* Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 border border-machinery-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="circular" width={32} height={32} />
          </div>
          <Skeleton variant="text" width="40%" height={24} />
        </div>
      ))}
    </div>

    {/* Chart area */}
    <div className="p-6 border border-machinery-200 rounded-lg">
      <Skeleton variant="text" width="25%" className="mb-4" />
      <Skeleton variant="rectangular" height={300} />
    </div>
  </div>
);

// ============================================
// LOADING STATE WRAPPER
// ============================================

const LoadingState = forwardRef<HTMLDivElement, LoadingStateProps>(
  (
    {
      loading,
      spinnerProps,
      skeletonProps,
      overlay = 'none',
      minLoadingTime = 0,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [showLoading, setShowLoading] = React.useState(loading);
    const [minTimeElapsed, setMinTimeElapsed] = React.useState(minLoadingTime === 0);

    React.useEffect(() => {
      if (loading && minLoadingTime > 0) {
        setMinTimeElapsed(false);
        const timer = setTimeout(() => {
          setMinTimeElapsed(true);
        }, minLoadingTime);
        return () => clearTimeout(timer);
      } else {
        setMinTimeElapsed(true);
      }
    }, [loading, minLoadingTime]);

    React.useEffect(() => {
      if (!loading && minTimeElapsed) {
        setShowLoading(false);
      } else if (loading) {
        setShowLoading(true);
      }
    }, [loading, minTimeElapsed]);

    const overlayStyles = {
      none: '',
      blur: 'backdrop-blur-sm',
      dim: 'bg-white/50',
      full: 'bg-white',
    };

    return (
      <div
        ref={ref}
        className={cn('relative', className)}
        {...props}
      >
        <AnimatePresence>
          {showLoading && overlay !== 'none' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'absolute inset-0 z-10 flex items-center justify-center',
                overlayStyles[overlay]
              )}
            >
              {skeletonProps ? (
                <Skeleton {...skeletonProps} />
              ) : (
                <LoadingSpinner {...spinnerProps} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className={cn(
          showLoading && overlay !== 'none' && 'pointer-events-none opacity-50'
        )}>
          {showLoading && overlay === 'none' ? (
            skeletonProps ? (
              <Skeleton {...skeletonProps} />
            ) : (
              <LoadingSpinner {...spinnerProps} />
            )
          ) : (
            children
          )}
        </div>
      </div>
    );
  }
);

LoadingState.displayName = 'LoadingState';

// ============================================
// BUTTON LOADING STATE
// ============================================

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'base' | 'lg';
  icon?: any;
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      loading = false,
      loadingText,
      variant = 'primary',
      size = 'base',
      icon,
      children,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const sizeConfig = spinnerSizes[size];

    const variantStyles = {
      primary: 'bg-steel-600 hover:bg-steel-700 text-white',
      secondary: 'bg-machinery-600 hover:bg-machinery-700 text-white',
      outline: 'border border-machinery-300 hover:bg-machinery-50 text-machinery-700',
      ghost: 'hover:bg-machinery-100 text-machinery-700',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
          'font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-steel-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeConfig.text,
          className
        )}
        {...props}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <LoadingSpinner
                size={size === 'lg' ? 'base' : 'sm'}
                variant="minimal"
                theme="default"
                inline
                className="text-current"
              />
              {loadingText || children}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              {icon && <HugeiconsIcon icon={icon} size={16} />}
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

// ============================================
// EXPORTS
// ============================================

export default LoadingSpinner;
export {
  Skeleton,
  LoadingState,
  LoadingButton,
};

