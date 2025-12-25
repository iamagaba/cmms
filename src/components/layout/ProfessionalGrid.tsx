/**
 * Professional CMMS Grid System
 * 
 * A comprehensive grid system optimized for desktop CMMS workflows.
 * Features responsive breakpoints, flexible layouts, and professional spacing
 * designed for data-heavy interfaces and complex forms.
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================
// TYPE DEFINITIONS
// ============================================

type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type GridSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full' | 'auto';
type GridGap = 'none' | 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
type GridAlign = 'start' | 'center' | 'end' | 'stretch';
type GridJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

interface ResponsiveGridConfig {
  xs?: GridColumns;
  sm?: GridColumns;
  md?: GridColumns;
  lg?: GridColumns;
  xl?: GridColumns;
  '2xl'?: GridColumns;
}

interface ResponsiveSpanConfig {
  xs?: GridSpan;
  sm?: GridSpan;
  md?: GridSpan;
  lg?: GridSpan;
  xl?: GridSpan;
  '2xl'?: GridSpan;
}

interface ResponsiveGapConfig {
  xs?: GridGap;
  sm?: GridGap;
  md?: GridGap;
  lg?: GridGap;
  xl?: GridGap;
  '2xl'?: GridGap;
}

// ============================================
// COMPONENT INTERFACES
// ============================================

export interface ProfessionalGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns (responsive)
   */
  columns?: GridColumns | ResponsiveGridConfig;
  
  /**
   * Gap between grid items (responsive)
   */
  gap?: GridGap | ResponsiveGapConfig;
  
  /**
   * Vertical alignment of grid items
   */
  alignItems?: GridAlign;
  
  /**
   * Horizontal alignment of grid items
   */
  justifyItems?: GridAlign;
  
  /**
   * Content alignment
   */
  justifyContent?: GridJustify;
  
  /**
   * Whether to use auto-fit for responsive columns
   */
  autoFit?: boolean;
  
  /**
   * Minimum column width for auto-fit
   */
  minColumnWidth?: string;
  
  /**
   * Animation configuration
   */
  animate?: boolean;
  
  /**
   * Custom className
   */
  className?: string;
  
  /**
   * Grid children
   */
  children: React.ReactNode;
}

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Column span (responsive)
   */
  span?: GridSpan | ResponsiveSpanConfig;
  
  /**
   * Column start position
   */
  start?: number;
  
  /**
   * Column end position
   */
  end?: number;
  
  /**
   * Row span
   */
  rowSpan?: number;
  
  /**
   * Row start position
   */
  rowStart?: number;
  
  /**
   * Row end position
   */
  rowEnd?: number;
  
  /**
   * Self alignment
   */
  alignSelf?: GridAlign;
  
  /**
   * Self justification
   */
  justifySelf?: GridAlign;
  
  /**
   * Animation delay for staggered animations
   */
  animationDelay?: number;
  
  /**
   * Custom className
   */
  className?: string;
  
  /**
   * Grid item children
   */
  children: React.ReactNode;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

const getGridClasses = (
  columns: GridColumns | ResponsiveGridConfig,
  gap: GridGap | ResponsiveGapConfig,
  alignItems?: GridAlign,
  justifyItems?: GridAlign,
  justifyContent?: GridJustify,
  autoFit?: boolean,
  minColumnWidth?: string
): string => {
  const classes: string[] = ['grid'];

  // Handle columns
  if (typeof columns === 'number') {
    classes.push(`grid-cols-${columns}`);
  } else {
    // Responsive columns
    Object.entries(columns).forEach(([breakpoint, cols]) => {
      if (breakpoint === 'xs') {
        classes.push(`grid-cols-${cols}`);
      } else {
        classes.push(`${breakpoint}:grid-cols-${cols}`);
      }
    });
  }

  // Handle gap
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-2',
    sm: 'gap-4',
    base: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-10',
    '2xl': 'gap-12',
  };

  if (typeof gap === 'string') {
    classes.push(gapClasses[gap]);
  } else {
    // Responsive gap
    Object.entries(gap).forEach(([breakpoint, gapValue]) => {
      if (breakpoint === 'xs') {
        classes.push(gapClasses[gapValue]);
      } else {
        classes.push(`${breakpoint}:${gapClasses[gapValue]}`);
      }
    });
  }

  // Handle alignment
  if (alignItems) {
    classes.push(`items-${alignItems}`);
  }

  if (justifyItems) {
    classes.push(`justify-items-${justifyItems}`);
  }

  if (justifyContent) {
    classes.push(`justify-${justifyContent}`);
  }

  // Handle auto-fit
  if (autoFit && minColumnWidth) {
    classes.push(`grid-cols-[repeat(auto-fit,minmax(${minColumnWidth},1fr))]`);
  }

  return classes.join(' ');
};

const getGridItemClasses = (
  span?: GridSpan | ResponsiveSpanConfig,
  start?: number,
  end?: number,
  rowSpan?: number,
  rowStart?: number,
  rowEnd?: number,
  alignSelf?: GridAlign,
  justifySelf?: GridAlign
): string => {
  const classes: string[] = [];

  // Handle span
  if (span) {
    if (typeof span === 'string' || typeof span === 'number') {
      if (span === 'full') {
        classes.push('col-span-full');
      } else if (span === 'auto') {
        classes.push('col-auto');
      } else {
        classes.push(`col-span-${span}`);
      }
    } else {
      // Responsive span
      Object.entries(span).forEach(([breakpoint, spanValue]) => {
        if (breakpoint === 'xs') {
          if (spanValue === 'full') {
            classes.push('col-span-full');
          } else if (spanValue === 'auto') {
            classes.push('col-auto');
          } else {
            classes.push(`col-span-${spanValue}`);
          }
        } else {
          if (spanValue === 'full') {
            classes.push(`${breakpoint}:col-span-full`);
          } else if (spanValue === 'auto') {
            classes.push(`${breakpoint}:col-auto`);
          } else {
            classes.push(`${breakpoint}:col-span-${spanValue}`);
          }
        }
      });
    }
  }

  // Handle column positioning
  if (start) {
    classes.push(`col-start-${start}`);
  }

  if (end) {
    classes.push(`col-end-${end}`);
  }

  // Handle row positioning
  if (rowSpan) {
    classes.push(`row-span-${rowSpan}`);
  }

  if (rowStart) {
    classes.push(`row-start-${rowStart}`);
  }

  if (rowEnd) {
    classes.push(`row-end-${rowEnd}`);
  }

  // Handle self alignment
  if (alignSelf) {
    classes.push(`self-${alignSelf}`);
  }

  if (justifySelf) {
    classes.push(`justify-self-${justifySelf}`);
  }

  return classes.join(' ');
};

// ============================================
// MAIN GRID COMPONENT
// ============================================

const ProfessionalGrid = forwardRef<HTMLDivElement, ProfessionalGridProps>(
  (
    {
      columns = 12,
      gap = 'base',
      alignItems,
      justifyItems,
      justifyContent,
      autoFit = false,
      minColumnWidth = '250px',
      animate = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const gridClasses = getGridClasses(
      columns,
      gap,
      alignItems,
      justifyItems,
      justifyContent,
      autoFit,
      minColumnWidth
    );

    const GridComponent = animate ? motion.div : 'div';

    return (
      <GridComponent
        ref={ref}
        className={cn(gridClasses, className)}
        {...(animate && {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.3 },
        })}
        {...props}
      >
        {children}
      </GridComponent>
    );
  }
);

ProfessionalGrid.displayName = 'ProfessionalGrid';

// ============================================
// GRID ITEM COMPONENT
// ============================================

const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  (
    {
      span,
      start,
      end,
      rowSpan,
      rowStart,
      rowEnd,
      alignSelf,
      justifySelf,
      animationDelay = 0,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const itemClasses = getGridItemClasses(
      span,
      start,
      end,
      rowSpan,
      rowStart,
      rowEnd,
      alignSelf,
      justifySelf
    );

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.3, 
          delay: animationDelay * 0.1,
          ease: 'easeOut'
        }}
        className={cn(itemClasses, className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GridItem.displayName = 'GridItem';

// ============================================
// SPECIALIZED GRID LAYOUTS
// ============================================

interface DashboardGridProps extends Omit<ProfessionalGridProps, 'columns'> {
  /**
   * Dashboard layout variant
   */
  variant?: 'standard' | 'compact' | 'wide';
}

const DashboardGrid = forwardRef<HTMLDivElement, DashboardGridProps>(
  ({ variant = 'standard', gap = 'lg', ...props }, ref) => {
    const columnConfig: ResponsiveGridConfig = {
      xs: 1,
      sm: 2,
      md: variant === 'compact' ? 2 : 3,
      lg: variant === 'compact' ? 3 : variant === 'wide' ? 4 : 3,
      xl: variant === 'compact' ? 4 : variant === 'wide' ? 6 : 4,
      '2xl': variant === 'compact' ? 4 : variant === 'wide' ? 8 : 6,
    };

    return (
      <ProfessionalGrid
        ref={ref}
        columns={columnConfig}
        gap={gap}
        animate
        {...props}
      />
    );
  }
);

DashboardGrid.displayName = 'DashboardGrid';

interface FormGridProps extends Omit<ProfessionalGridProps, 'columns'> {
  /**
   * Form layout variant
   */
  variant?: 'single' | 'double' | 'triple';
}

const FormGrid = forwardRef<HTMLDivElement, FormGridProps>(
  ({ variant = 'double', gap = 'base', ...props }, ref) => {
    const columnConfig: ResponsiveGridConfig = {
      xs: 1,
      sm: variant === 'single' ? 1 : 2,
      md: variant === 'triple' ? 3 : variant === 'double' ? 2 : 1,
      lg: variant === 'triple' ? 3 : variant === 'double' ? 2 : 1,
    };

    return (
      <ProfessionalGrid
        ref={ref}
        columns={columnConfig}
        gap={gap}
        alignItems="start"
        {...props}
      />
    );
  }
);

FormGrid.displayName = 'FormGrid';

interface DataGridProps extends Omit<ProfessionalGridProps, 'columns'> {
  /**
   * Data grid density
   */
  density?: 'comfortable' | 'compact' | 'spacious';
}

const DataGrid = forwardRef<HTMLDivElement, DataGridProps>(
  ({ density = 'comfortable', ...props }, ref) => {
    const gapConfig: ResponsiveGapConfig = {
      xs: density === 'compact' ? 'xs' : density === 'spacious' ? 'lg' : 'sm',
      sm: density === 'compact' ? 'sm' : density === 'spacious' ? 'xl' : 'base',
      lg: density === 'compact' ? 'base' : density === 'spacious' ? '2xl' : 'lg',
    };

    return (
      <ProfessionalGrid
        ref={ref}
        autoFit
        minColumnWidth={density === 'compact' ? '200px' : density === 'spacious' ? '350px' : '280px'}
        gap={gapConfig}
        alignItems="stretch"
        {...props}
      />
    );
  }
);

DataGrid.displayName = 'DataGrid';

// ============================================
// UTILITY COMPONENTS
// ============================================

interface GridContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Container max width
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  
  /**
   * Container padding
   */
  padding?: 'none' | 'sm' | 'base' | 'lg' | 'xl';
  
  /**
   * Whether to center the container
   */
  centered?: boolean;
  
  children: React.ReactNode;
}

const GridContainer = forwardRef<HTMLDivElement, GridContainerProps>(
  (
    {
      maxWidth = '7xl',
      padding = 'base',
      centered = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const paddingClasses = {
      none: '',
      sm: 'px-4',
      base: 'px-6',
      lg: 'px-8',
      xl: 'px-12',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          maxWidth !== 'full' && `max-w-${maxWidth}`,
          centered && 'mx-auto',
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GridContainer.displayName = 'GridContainer';

// ============================================
// EXPORTS
// ============================================

export default ProfessionalGrid;
export {
  GridItem,
  DashboardGrid,
  FormGrid,
  DataGrid,
  GridContainer,
};

export type {
  ProfessionalGridProps,
  GridItemProps,
  DashboardGridProps,
  FormGridProps,
  DataGridProps,
  GridContainerProps,
};