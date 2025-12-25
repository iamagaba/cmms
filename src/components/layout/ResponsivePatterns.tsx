/**
 * Professional CMMS Responsive Patterns
 * 
 * A collection of responsive layout patterns optimized for desktop CMMS workflows.
 * Includes adaptive layouts, breakpoint utilities, and responsive containers
 * designed for data-heavy interfaces and complex forms.
 */

import React, { forwardRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// ============================================
// BREAKPOINT UTILITIES
// ============================================

export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export type Breakpoint = keyof typeof breakpoints;

export const useBreakpoint = (breakpoint: Breakpoint): boolean => {
  return useMediaQuery(`(min-width: ${breakpoints[breakpoint]})`);
};

export const useCurrentBreakpoint = (): Breakpoint => {
  const is2xl = useMediaQuery(`(min-width: ${breakpoints['2xl']})`);
  const isXl = useMediaQuery(`(min-width: ${breakpoints.xl})`);
  const isLg = useMediaQuery(`(min-width: ${breakpoints.lg})`);
  const isMd = useMediaQuery(`(min-width: ${breakpoints.md})`);
  const isSm = useMediaQuery(`(min-width: ${breakpoints.sm})`);

  if (is2xl) return '2xl';
  if (isXl) return 'xl';
  if (isLg) return 'lg';
  if (isMd) return 'md';
  if (isSm) return 'sm';
  return 'xs';
};

// ============================================
// RESPONSIVE CONTAINER
// ============================================

export interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Container behavior at different breakpoints
   */
  behavior?: {
    xs?: 'fluid' | 'constrained';
    sm?: 'fluid' | 'constrained';
    md?: 'fluid' | 'constrained';
    lg?: 'fluid' | 'constrained';
    xl?: 'fluid' | 'constrained';
    '2xl'?: 'fluid' | 'constrained';
  };
  
  /**
   * Maximum width at different breakpoints
   */
  maxWidth?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
  
  /**
   * Padding at different breakpoints
   */
  padding?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
  
  /**
   * Whether to center the container
   */
  centered?: boolean;
  
  children: React.ReactNode;
}

const ResponsiveContainer = forwardRef<HTMLDivElement, ResponsiveContainerProps>(
  (
    {
      behavior = { xs: 'fluid', lg: 'constrained' },
      maxWidth = { lg: '1024px', xl: '1280px', '2xl': '1536px' },
      padding = { xs: '1rem', sm: '1.5rem', lg: '2rem' },
      centered = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const currentBreakpoint = useCurrentBreakpoint();
    
    // Resolve current values based on breakpoint
    const getCurrentValue = <T,>(config: Record<string, T>, fallback: T): T => {
      const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
      const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
      
      for (let i = currentIndex; i < breakpointOrder.length; i++) {
        const bp = breakpointOrder[i];
        if (config[bp] !== undefined) {
          return config[bp];
        }
      }
      return fallback;
    };
    
    const currentBehavior = getCurrentValue(behavior, 'fluid');
    const currentMaxWidth = getCurrentValue(maxWidth, 'none');
    const currentPadding = getCurrentValue(padding, '1rem');
    
    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          centered && 'mx-auto',
          className
        )}
        style={{
          maxWidth: currentBehavior === 'constrained' ? currentMaxWidth : 'none',
          paddingLeft: currentPadding,
          paddingRight: currentPadding,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ResponsiveContainer.displayName = 'ResponsiveContainer';

// ============================================
// ADAPTIVE LAYOUT
// ============================================

export interface AdaptiveLayoutProps {
  /**
   * Layout configurations for different breakpoints
   */
  layouts: {
    xs?: 'stack' | 'grid' | 'sidebar' | 'tabs';
    sm?: 'stack' | 'grid' | 'sidebar' | 'tabs';
    md?: 'stack' | 'grid' | 'sidebar' | 'tabs';
    lg?: 'stack' | 'grid' | 'sidebar' | 'tabs';
    xl?: 'stack' | 'grid' | 'sidebar' | 'tabs';
    '2xl'?: 'stack' | 'grid' | 'sidebar' | 'tabs';
  };
  
  /**
   * Main content
   */
  main: React.ReactNode;
  
  /**
   * Sidebar content (for sidebar layout)
   */
  sidebar?: React.ReactNode;
  
  /**
   * Additional content sections (for grid layout)
   */
  sections?: React.ReactNode[];
  
  /**
   * Tab items (for tabs layout)
   */
  tabs?: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
  
  /**
   * Custom className
   */
  className?: string;
}

const AdaptiveLayout = forwardRef<HTMLDivElement, AdaptiveLayoutProps>(
  (
    {
      layouts,
      main,
      sidebar,
      sections = [],
      tabs = [],
      className,
    },
    ref
  ) => {
    const currentBreakpoint = useCurrentBreakpoint();
    const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');
    
    // Get current layout
    const getCurrentLayout = (): 'stack' | 'grid' | 'sidebar' | 'tabs' => {
      const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
      const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
      
      for (let i = currentIndex; i < breakpointOrder.length; i++) {
        const bp = breakpointOrder[i];
        if (layouts[bp]) {
          return layouts[bp]!;
        }
      }
      return 'stack';
    };
    
    const currentLayout = getCurrentLayout();
    
    const renderLayout = () => {
      switch (currentLayout) {
        case 'stack':
          return (
            <div className="space-y-6">
              {main}
              {sidebar}
              {sections.map((section, index) => (
                <div key={index}>{section}</div>
              ))}
            </div>
          );
          
        case 'grid':
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="md:col-span-2 lg:col-span-2">{main}</div>
              {sidebar && <div>{sidebar}</div>}
              {sections.map((section, index) => (
                <div key={index}>{section}</div>
              ))}
            </div>
          );
          
        case 'sidebar':
          return (
            <div className="flex flex-col lg:flex-row gap-6">
              {sidebar && (
                <aside className="lg:w-80 flex-shrink-0">
                  {sidebar}
                </aside>
              )}
              <main className="flex-1 min-w-0">
                {main}
                {sections.length > 0 && (
                  <div className="mt-6 space-y-6">
                    {sections.map((section, index) => (
                      <div key={index}>{section}</div>
                    ))}
                  </div>
                )}
              </main>
            </div>
          );
          
        case 'tabs':
          return (
            <div className="space-y-4">
              {/* Tab Navigation */}
              <div className="border-b border-machinery-200">
                <nav className="flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-steel-500 focus:ring-offset-2',
                        activeTab === tab.id
                          ? 'border-steel-600 text-steel-600'
                          : 'border-transparent text-machinery-500 hover:text-machinery-700 hover:border-machinery-300'
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
              
              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {tabs.map((tab) => (
                  activeTab === tab.id && (
                    <motion.div
                      key={tab.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {tab.content}
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
            </div>
          );
          
        default:
          return main;
      }
    };
    
    return (
      <div ref={ref} className={className}>
        {renderLayout()}
      </div>
    );
  }
);

AdaptiveLayout.displayName = 'AdaptiveLayout';

// ============================================
// RESPONSIVE STACK
// ============================================

export interface ResponsiveStackProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Stack direction at different breakpoints
   */
  direction?: {
    xs?: 'vertical' | 'horizontal';
    sm?: 'vertical' | 'horizontal';
    md?: 'vertical' | 'horizontal';
    lg?: 'vertical' | 'horizontal';
    xl?: 'vertical' | 'horizontal';
    '2xl'?: 'vertical' | 'horizontal';
  };
  
  /**
   * Spacing between items at different breakpoints
   */
  spacing?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
  
  /**
   * Alignment at different breakpoints
   */
  align?: {
    xs?: 'start' | 'center' | 'end' | 'stretch';
    sm?: 'start' | 'center' | 'end' | 'stretch';
    md?: 'start' | 'center' | 'end' | 'stretch';
    lg?: 'start' | 'center' | 'end' | 'stretch';
    xl?: 'start' | 'center' | 'end' | 'stretch';
    '2xl'?: 'start' | 'center' | 'end' | 'stretch';
  };
  
  children: React.ReactNode;
}

const ResponsiveStack = forwardRef<HTMLDivElement, ResponsiveStackProps>(
  (
    {
      direction = { xs: 'vertical', lg: 'horizontal' },
      spacing = { xs: '1rem', lg: '1.5rem' },
      align = { xs: 'stretch' },
      className,
      children,
      ...props
    },
    ref
  ) => {
    const currentBreakpoint = useCurrentBreakpoint();
    
    const getCurrentValue = <T,>(config: Record<string, T>, fallback: T): T => {
      const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
      const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
      
      for (let i = currentIndex; i < breakpointOrder.length; i++) {
        const bp = breakpointOrder[i];
        if (config[bp] !== undefined) {
          return config[bp];
        }
      }
      return fallback;
    };
    
    const currentDirection = getCurrentValue(direction, 'vertical');
    const currentSpacing = getCurrentValue(spacing, '1rem');
    const currentAlign = getCurrentValue(align, 'stretch');
    
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          currentDirection === 'vertical' ? 'flex-col' : 'flex-row',
          `items-${currentAlign}`,
          className
        )}
        style={{
          gap: currentSpacing,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ResponsiveStack.displayName = 'ResponsiveStack';

// ============================================
// RESPONSIVE VISIBILITY
// ============================================

export interface ResponsiveVisibilityProps {
  /**
   * Visibility at different breakpoints
   */
  show?: {
    xs?: boolean;
    sm?: boolean;
    md?: boolean;
    lg?: boolean;
    xl?: boolean;
    '2xl'?: boolean;
  };
  
  /**
   * Hide at specific breakpoints
   */
  hide?: {
    xs?: boolean;
    sm?: boolean;
    md?: boolean;
    lg?: boolean;
    xl?: boolean;
    '2xl'?: boolean;
  };
  
  /**
   * Fallback content when hidden
   */
  fallback?: React.ReactNode;
  
  children: React.ReactNode;
}

const ResponsiveVisibility: React.FC<ResponsiveVisibilityProps> = ({
  show,
  hide,
  fallback,
  children,
}) => {
  const currentBreakpoint = useCurrentBreakpoint();
  
  const isVisible = (): boolean => {
    // Check hide conditions first
    if (hide && hide[currentBreakpoint]) {
      return false;
    }
    
    // Check show conditions
    if (show) {
      const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
      const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
      
      for (let i = currentIndex; i < breakpointOrder.length; i++) {
        const bp = breakpointOrder[i];
        if (show[bp] !== undefined) {
          return show[bp]!;
        }
      }
      return false;
    }
    
    return true;
  };
  
  if (!isVisible()) {
    return fallback ? <>{fallback}</> : null;
  }
  
  return <>{children}</>;
};

// ============================================
// RESPONSIVE COLUMNS
// ============================================

export interface ResponsiveColumnsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns at different breakpoints
   */
  columns: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  
  /**
   * Gap between columns
   */
  gap?: string;
  
  /**
   * Minimum column width
   */
  minColumnWidth?: string;
  
  children: React.ReactNode;
}

const ResponsiveColumns = forwardRef<HTMLDivElement, ResponsiveColumnsProps>(
  (
    {
      columns,
      gap = '1.5rem',
      minColumnWidth,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const currentBreakpoint = useCurrentBreakpoint();
    
    const getCurrentColumns = (): number => {
      const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
      const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
      
      for (let i = currentIndex; i < breakpointOrder.length; i++) {
        const bp = breakpointOrder[i];
        if (columns[bp] !== undefined) {
          return columns[bp]!;
        }
      }
      return 1;
    };
    
    const currentColumns = getCurrentColumns();
    
    return (
      <div
        ref={ref}
        className={cn('grid', className)}
        style={{
          gridTemplateColumns: minColumnWidth 
            ? `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))`
            : `repeat(${currentColumns}, 1fr)`,
          gap,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ResponsiveColumns.displayName = 'ResponsiveColumns';

// ============================================
// EXPORTS
// ============================================

// Note: Components and hooks are already exported inline above
// This block only exports the components that are defined as const
export {
  ResponsiveContainer,
  AdaptiveLayout,
  ResponsiveStack,
  ResponsiveVisibility,
  ResponsiveColumns,
};

export type {
  ResponsiveContainerProps,
  AdaptiveLayoutProps,
  ResponsiveStackProps,
  ResponsiveVisibilityProps,
  ResponsiveColumnsProps,
};