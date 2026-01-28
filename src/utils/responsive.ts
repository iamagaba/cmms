/**
 * Professional Responsive Design System
 * 
 * Comprehensive responsive utilities for the Fleet CMMS desktop application.
 * Provides breakpoint management, responsive props, touch-friendly sizing,
 * and adaptive component behavior for optimal cross-device experience.
 * 
 * Note: This is specifically for the desktop web application (src/).
 * Mobile web and native mobile apps have their own responsive systems.
 */

import { useState, useEffect, useMemo } from 'react';

// ============================================
// BREAKPOINT SYSTEM
// ============================================

export const breakpoints = {
  xs: 0,      // Extra small devices (phones in landscape)
  sm: 640,    // Small devices (tablets)
  md: 768,    // Medium devices (small laptops)
  lg: 1024,   // Large devices (desktops)
  xl: 1280,   // Extra large devices (large desktops)
  '2xl': 1536, // 2X large devices (very large screens)
} as const;

export type Breakpoint = keyof typeof breakpoints;

// ============================================
// RESPONSIVE HOOKS
// ============================================

/**
 * Hook to get current screen size and breakpoint information
 */
export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentBreakpoint = useMemo((): Breakpoint => {
    const width = windowSize.width;
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  }, [windowSize.width]);

  const isBreakpoint = useMemo(() => ({
    xs: windowSize.width >= breakpoints.xs,
    sm: windowSize.width >= breakpoints.sm,
    md: windowSize.width >= breakpoints.md,
    lg: windowSize.width >= breakpoints.lg,
    xl: windowSize.width >= breakpoints.xl,
    '2xl': windowSize.width >= breakpoints['2xl'],
  }), [windowSize.width]);

  const isMobile = windowSize.width < breakpoints.md;
  const isTablet = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg;
  const isDesktop = windowSize.width >= breakpoints.lg;

  return {
    windowSize,
    currentBreakpoint,
    isBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
  };
};

/**
 * Hook for responsive values based on breakpoints
 */
export const useResponsiveValue = <T>(values: Partial<Record<Breakpoint, T>>): T | undefined => {
  const { currentBreakpoint } = useResponsive();
  
  // Find the appropriate value for current breakpoint
  const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  return undefined;
};

// ============================================
// RESPONSIVE PROP TYPES
// ============================================

export type ResponsiveProp<T> = T | Partial<Record<Breakpoint, T>>;

/**
 * Resolve responsive prop to current value
 */
export const resolveResponsiveProp = <T>(
  prop: ResponsiveProp<T>,
  currentBreakpoint: Breakpoint
): T | undefined => {
  if (typeof prop === 'object' && prop !== null && !Array.isArray(prop)) {
    const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
    
    for (let i = currentIndex; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if ((prop as Record<Breakpoint, T>)[bp] !== undefined) {
        return (prop as Record<Breakpoint, T>)[bp];
      }
    }
    return undefined;
  }
  
  return prop as T;
};

// ============================================
// TOUCH-FRIENDLY SIZING
// ============================================

export const touchTargetSizes = {
  xs: '32px',    // Minimum for accessibility
  sm: '40px',    // Small touch targets
  base: '44px',  // Standard touch target (iOS/Android recommendation)
  lg: '48px',    // Large touch targets
  xl: '56px',    // Extra large touch targets
} as const;

export type TouchTargetSize = keyof typeof touchTargetSizes;

/**
 * Get touch-friendly sizing based on device type
 */
export const getTouchFriendlySize = (
  size: TouchTargetSize = 'base',
  isTouchDevice?: boolean
): string => {
  // Auto-detect touch device if not specified
  if (isTouchDevice === undefined) {
    isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
  
  // Use larger sizes for touch devices
  if (isTouchDevice) {
    const touchSizeMap: Record<TouchTargetSize, TouchTargetSize> = {
      xs: 'sm',
      sm: 'base',
      base: 'lg',
      lg: 'xl',
      xl: 'xl',
    };
    return touchTargetSizes[touchSizeMap[size]];
  }
  
  return touchTargetSizes[size];
};

// ============================================
// RESPONSIVE GRID SYSTEM
// ============================================

export interface GridProps {
  columns?: ResponsiveProp<number>;
  gap?: ResponsiveProp<string>;
  align?: ResponsiveProp<'start' | 'center' | 'end' | 'stretch'>;
  justify?: ResponsiveProp<'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'>;
}

/**
 * Generate responsive grid classes
 */
export const getResponsiveGridClasses = (
  props: GridProps,
  currentBreakpoint: Breakpoint
): string => {
  const classes: string[] = ['grid'];
  
  // Columns
  const columns = resolveResponsiveProp(props.columns, currentBreakpoint);
  if (columns) {
    classes.push(`grid-cols-${columns}`);
  }
  
  // Gap
  const gap = resolveResponsiveProp(props.gap, currentBreakpoint);
  if (gap) {
    classes.push(`gap-${gap}`);
  }
  
  // Alignment
  const align = resolveResponsiveProp(props.align, currentBreakpoint);
  if (align) {
    classes.push(`items-${align}`);
  }
  
  const justify = resolveResponsiveProp(props.justify, currentBreakpoint);
  if (justify) {
    classes.push(`justify-${justify}`);
  }
  
  return classes.join(' ');
};

// ============================================
// RESPONSIVE CONTAINER SYSTEM
// ============================================

export interface ContainerProps {
  maxWidth?: ResponsiveProp<string>;
  padding?: ResponsiveProp<string>;
  margin?: ResponsiveProp<string>;
  centered?: boolean;
}

/**
 * Generate responsive container classes
 */
export const getResponsiveContainerClasses = (
  props: ContainerProps,
  currentBreakpoint: Breakpoint
): string => {
  const classes: string[] = [];
  
  // Max width
  const maxWidth = resolveResponsiveProp(props.maxWidth, currentBreakpoint);
  if (maxWidth) {
    classes.push(`max-w-${maxWidth}`);
  }
  
  // Padding
  const padding = resolveResponsiveProp(props.padding, currentBreakpoint);
  if (padding) {
    classes.push(`p-${padding}`);
  }
  
  // Margin
  const margin = resolveResponsiveProp(props.margin, currentBreakpoint);
  if (margin) {
    classes.push(`m-${margin}`);
  }
  
  // Centered
  if (props.centered) {
    classes.push('mx-auto');
  }
  
  return classes.join(' ');
};

// ============================================
// RESPONSIVE TYPOGRAPHY
// ============================================

export interface ResponsiveTextProps {
  size?: ResponsiveProp<string>;
  weight?: ResponsiveProp<string>;
  lineHeight?: ResponsiveProp<string>;
  align?: ResponsiveProp<'left' | 'center' | 'right' | 'justify'>;
}

/**
 * Generate responsive typography classes
 */
export const getResponsiveTextClasses = (
  props: ResponsiveTextProps,
  currentBreakpoint: Breakpoint
): string => {
  const classes: string[] = [];
  
  // Font size
  const size = resolveResponsiveProp(props.size, currentBreakpoint);
  if (size) {
    classes.push(`text-${size}`);
  }
  
  // Font weight
  const weight = resolveResponsiveProp(props.weight, currentBreakpoint);
  if (weight) {
    classes.push(`font-${weight}`);
  }
  
  // Line height
  const lineHeight = resolveResponsiveProp(props.lineHeight, currentBreakpoint);
  if (lineHeight) {
    classes.push(`leading-${lineHeight}`);
  }
  
  // Text alignment
  const align = resolveResponsiveProp(props.align, currentBreakpoint);
  if (align) {
    classes.push(`text-${align}`);
  }
  
  return classes.join(' ');
};

// ============================================
// RESPONSIVE SPACING
// ============================================

export interface ResponsiveSpacingProps {
  p?: ResponsiveProp<string>;  // padding
  px?: ResponsiveProp<string>; // padding horizontal
  py?: ResponsiveProp<string>; // padding vertical
  pt?: ResponsiveProp<string>; // padding top
  pr?: ResponsiveProp<string>; // padding right
  pb?: ResponsiveProp<string>; // padding bottom
  pl?: ResponsiveProp<string>; // padding left
  m?: ResponsiveProp<string>;  // margin
  mx?: ResponsiveProp<string>; // margin horizontal
  my?: ResponsiveProp<string>; // margin vertical
  mt?: ResponsiveProp<string>; // margin top
  mr?: ResponsiveProp<string>; // margin right
  mb?: ResponsiveProp<string>; // margin bottom
  ml?: ResponsiveProp<string>; // margin left
}

/**
 * Generate responsive spacing classes
 */
export const getResponsiveSpacingClasses = (
  props: ResponsiveSpacingProps,
  currentBreakpoint: Breakpoint
): string => {
  const classes: string[] = [];
  
  // Padding
  const spacingProps = [
    { prop: props.p, prefix: 'p' },
    { prop: props.px, prefix: 'px' },
    { prop: props.py, prefix: 'py' },
    { prop: props.pt, prefix: 'pt' },
    { prop: props.pr, prefix: 'pr' },
    { prop: props.pb, prefix: 'pb' },
    { prop: props.pl, prefix: 'pl' },
    { prop: props.m, prefix: 'm' },
    { prop: props.mx, prefix: 'mx' },
    { prop: props.my, prefix: 'my' },
    { prop: props.mt, prefix: 'mt' },
    { prop: props.mr, prefix: 'mr' },
    { prop: props.mb, prefix: 'mb' },
    { prop: props.ml, prefix: 'ml' },
  ];
  
  spacingProps.forEach(({ prop, prefix }) => {
    if (prop !== undefined) {
      const value = resolveResponsiveProp(prop, currentBreakpoint);
      if (value) {
        classes.push(`${prefix}-${value}`);
      }
    }
  });
  
  return classes.join(' ');
};

// ============================================
// MEDIA QUERY UTILITIES
// ============================================

/**
 * Generate CSS media queries for breakpoints
 */
export const mediaQuery = {
  up: (breakpoint: Breakpoint): string => 
    `@media (min-width: ${breakpoints[breakpoint]}px)`,
  
  down: (breakpoint: Breakpoint): string => 
    `@media (max-width: ${breakpoints[breakpoint] - 1}px)`,
  
  between: (min: Breakpoint, max: Breakpoint): string => 
    `@media (min-width: ${breakpoints[min]}px) and (max-width: ${breakpoints[max] - 1}px)`,
  
  only: (breakpoint: Breakpoint): string => {
    const breakpointKeys = Object.keys(breakpoints) as Breakpoint[];
    const currentIndex = breakpointKeys.indexOf(breakpoint);
    const nextBreakpoint = breakpointKeys[currentIndex + 1];
    
    if (nextBreakpoint) {
      return `@media (min-width: ${breakpoints[breakpoint]}px) and (max-width: ${breakpoints[nextBreakpoint] - 1}px)`;
    } else {
      return `@media (min-width: ${breakpoints[breakpoint]}px)`;
    }
  },
};

// ============================================
// RESPONSIVE COMPONENT UTILITIES
// ============================================

/**
 * Check if device supports hover (non-touch devices)
 */
export const supportsHover = (): boolean => {
  return window.matchMedia('(hover: hover)').matches;
};

/**
 * Check if device is touch-enabled
 */
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Get optimal component size based on device type
 */
export const getOptimalComponentSize = (
  baseSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl',
  isMobile?: boolean
): 'xs' | 'sm' | 'base' | 'lg' | 'xl' => {
  if (isMobile === undefined) {
    isMobile = window.innerWidth < breakpoints.md;
  }
  
  // Use smaller sizes on mobile for better space utilization
  if (isMobile) {
    const mobileSizeMap = {
      xs: 'xs' as const,
      sm: 'xs' as const,
      base: 'sm' as const,
      lg: 'base' as const,
      xl: 'lg' as const,
    };
    return mobileSizeMap[baseSize];
  }
  
  return baseSize;
};

// ============================================
// EXPORTS
// ============================================

export type {
  ResponsiveProp,
  TouchTargetSize,
  GridProps,
  ContainerProps,
  ResponsiveTextProps,
  ResponsiveSpacingProps,
};

// Note: All functions are already exported inline with 'export const'
// This block is kept for backwards compatibility but items are already exported above