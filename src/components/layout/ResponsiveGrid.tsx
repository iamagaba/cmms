/**
 * Responsive Grid Component
 * 
 * A flexible grid system for the professional design system that adapts
 * to different screen sizes and provides consistent spacing and alignment.
 * Optimized for desktop web application with touch-friendly mobile support.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  useResponsive, 
  getResponsiveGridClasses,
  type GridProps,
  type ResponsiveProp 
} from '@/utils/responsive';

// ============================================
// RESPONSIVE GRID COMPONENT
// ============================================

export interface ResponsiveGridProps extends GridProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  as: Component = 'div',
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = { xs: '4', sm: '6', lg: '8' },
  align,
  justify,
  ...props
}) => {
  const { currentBreakpoint } = useResponsive();
  
  const gridClasses = getResponsiveGridClasses(
    { columns, gap, align, justify },
    currentBreakpoint
  );

  return (
    <Component
      className={cn(gridClasses, className)}
      {...props}
    >
      {children}
    </Component>
  );
};

// ============================================
// RESPONSIVE GRID ITEM COMPONENT
// ============================================

export interface ResponsiveGridItemProps {
  children: React.ReactNode;
  span?: ResponsiveProp<number>;
  start?: ResponsiveProp<number>;
  end?: ResponsiveProp<number>;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const ResponsiveGridItem: React.FC<ResponsiveGridItemProps> = ({
  children,
  span,
  start,
  end,
  className,
  as: Component = 'div',
  ...props
}) => {
  const { currentBreakpoint } = useResponsive();
  
  const classes: string[] = [];
  
  // Column span
  if (typeof span === 'object' && span !== null) {
    const breakpointOrder = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'] as const;
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
    
    for (let i = currentIndex; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (span[bp] !== undefined) {
        classes.push(`col-span-${span[bp]}`);
        break;
      }
    }
  } else if (typeof span === 'number') {
    classes.push(`col-span-${span}`);
  }
  
  // Column start
  if (typeof start === 'object' && start !== null) {
    const breakpointOrder = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'] as const;
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
    
    for (let i = currentIndex; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (start[bp] !== undefined) {
        classes.push(`col-start-${start[bp]}`);
        break;
      }
    }
  } else if (typeof start === 'number') {
    classes.push(`col-start-${start}`);
  }
  
  // Column end
  if (typeof end === 'object' && end !== null) {
    const breakpointOrder = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'] as const;
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
    
    for (let i = currentIndex; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (end[bp] !== undefined) {
        classes.push(`col-end-${end[bp]}`);
        break;
      }
    }
  } else if (typeof end === 'number') {
    classes.push(`col-end-${end}`);
  }

  return (
    <Component
      className={cn(classes.join(' '), className)}
      {...props}
    >
      {children}
    </Component>
  );
};

// ============================================
// RESPONSIVE FLEX COMPONENT
// ============================================

export interface ResponsiveFlexProps {
  children: React.ReactNode;
  direction?: ResponsiveProp<'row' | 'col' | 'row-reverse' | 'col-reverse'>;
  wrap?: ResponsiveProp<'wrap' | 'nowrap' | 'wrap-reverse'>;
  align?: ResponsiveProp<'start' | 'center' | 'end' | 'stretch' | 'baseline'>;
  justify?: ResponsiveProp<'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'>;
  gap?: ResponsiveProp<string>;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const ResponsiveFlex: React.FC<ResponsiveFlexProps> = ({
  children,
  direction = 'row',
  wrap = 'wrap',
  align = 'start',
  justify = 'start',
  gap = '4',
  className,
  as: Component = 'div',
  ...props
}) => {
  const { currentBreakpoint } = useResponsive();
  
  const resolveValue = <T,>(prop: ResponsiveProp<T>): T | undefined => {
    if (typeof prop === 'object' && prop !== null && !Array.isArray(prop)) {
      const breakpointOrder = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'] as const;
      const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
      
      for (let i = currentIndex; i < breakpointOrder.length; i++) {
        const bp = breakpointOrder[i];
        if ((prop as any)[bp] !== undefined) {
          return (prop as any)[bp];
        }
      }
      return undefined;
    }
    return prop as T;
  };
  
  const classes: string[] = ['flex'];
  
  // Direction
  const resolvedDirection = resolveValue(direction);
  if (resolvedDirection) {
    classes.push(`flex-${resolvedDirection}`);
  }
  
  // Wrap
  const resolvedWrap = resolveValue(wrap);
  if (resolvedWrap) {
    classes.push(`flex-${resolvedWrap}`);
  }
  
  // Align
  const resolvedAlign = resolveValue(align);
  if (resolvedAlign) {
    classes.push(`items-${resolvedAlign}`);
  }
  
  // Justify
  const resolvedJustify = resolveValue(justify);
  if (resolvedJustify) {
    classes.push(`justify-${resolvedJustify}`);
  }
  
  // Gap
  const resolvedGap = resolveValue(gap);
  if (resolvedGap) {
    classes.push(`gap-${resolvedGap}`);
  }

  return (
    <Component
      className={cn(classes.join(' '), className)}
      {...props}
    >
      {children}
    </Component>
  );
};

// ============================================
// RESPONSIVE CONTAINER COMPONENT
// ============================================

export interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: ResponsiveProp<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'>;
  padding?: ResponsiveProp<string>;
  margin?: ResponsiveProp<string>;
  centered?: boolean;
  fluid?: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = { xs: 'full', sm: 'sm', md: 'md', lg: 'lg', xl: 'xl', '2xl': '2xl' },
  padding = { xs: '4', sm: '6', lg: '8' },
  margin,
  centered = true,
  fluid = false,
  className,
  as: Component = 'div',
  ...props
}) => {
  const { currentBreakpoint } = useResponsive();
  
  const resolveValue = <T,>(prop: ResponsiveProp<T>): T | undefined => {
    if (typeof prop === 'object' && prop !== null && !Array.isArray(prop)) {
      const breakpointOrder = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'] as const;
      const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
      
      for (let i = currentIndex; i < breakpointOrder.length; i++) {
        const bp = breakpointOrder[i];
        if ((prop as any)[bp] !== undefined) {
          return (prop as any)[bp];
        }
      }
      return undefined;
    }
    return prop as T;
  };
  
  const classes: string[] = ['w-full'];
  
  // Max width
  if (!fluid) {
    const resolvedMaxWidth = resolveValue(maxWidth);
    if (resolvedMaxWidth) {
      classes.push(`max-w-${resolvedMaxWidth}`);
    }
  }
  
  // Padding
  const resolvedPadding = resolveValue(padding);
  if (resolvedPadding) {
    classes.push(`px-${resolvedPadding}`);
  }
  
  // Margin
  const resolvedMargin = resolveValue(margin);
  if (resolvedMargin) {
    classes.push(`mx-${resolvedMargin}`);
  }
  
  // Centered
  if (centered && !fluid) {
    classes.push('mx-auto');
  }

  return (
    <Component
      className={cn(classes.join(' '), className)}
      {...props}
    >
      {children}
    </Component>
  );
};

// ============================================
// RESPONSIVE STACK COMPONENT
// ============================================

export interface ResponsiveStackProps {
  children: React.ReactNode;
  spacing?: ResponsiveProp<string>;
  align?: ResponsiveProp<'start' | 'center' | 'end' | 'stretch'>;
  direction?: ResponsiveProp<'vertical' | 'horizontal'>;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  spacing = '4',
  align = 'start',
  direction = 'vertical',
  className,
  as: Component = 'div',
  ...props
}) => {
  const { currentBreakpoint } = useResponsive();
  
  const resolveValue = <T,>(prop: ResponsiveProp<T>): T | undefined => {
    if (typeof prop === 'object' && prop !== null && !Array.isArray(prop)) {
      const breakpointOrder = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'] as const;
      const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
      
      for (let i = currentIndex; i < breakpointOrder.length; i++) {
        const bp = breakpointOrder[i];
        if ((prop as any)[bp] !== undefined) {
          return (prop as any)[bp];
        }
      }
      return undefined;
    }
    return prop as T;
  };
  
  const resolvedDirection = resolveValue(direction);
  const resolvedSpacing = resolveValue(spacing);
  const resolvedAlign = resolveValue(align);
  
  const classes: string[] = ['flex'];
  
  // Direction
  if (resolvedDirection === 'horizontal') {
    classes.push('flex-row');
    if (resolvedSpacing) {
      classes.push(`gap-x-${resolvedSpacing}`);
    }
  } else {
    classes.push('flex-col');
    if (resolvedSpacing) {
      classes.push(`gap-y-${resolvedSpacing}`);
    }
  }
  
  // Alignment
  if (resolvedAlign) {
    if (resolvedDirection === 'horizontal') {
      classes.push(`items-${resolvedAlign}`);
    } else {
      classes.push(`items-${resolvedAlign}`);
    }
  }

  return (
    <Component
      className={cn(classes.join(' '), className)}
      {...props}
    >
      {children}
    </Component>
  );
};

// ============================================
// EXPORTS
// ============================================

export default ResponsiveGrid;
export {
  ResponsiveGridItem,
  ResponsiveFlex,
  ResponsiveContainer,
  ResponsiveStack,
};

export type {
  ResponsiveGridProps,
  ResponsiveGridItemProps,
  ResponsiveFlexProps,
  ResponsiveContainerProps,
  ResponsiveStackProps,
};