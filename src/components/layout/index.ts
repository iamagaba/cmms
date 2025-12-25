/**
 * Professional CMMS Layout System
 * 
 * Centralized exports for all layout components and utilities.
 * Provides a comprehensive layout system for desktop CMMS workflows.
 */

// Main Layout Components
export { default as AppLayout } from './AppLayout';
export { default as ProfessionalSidebar } from './ProfessionalSidebar';
export { default as ProfessionalPageLayout, PageHeader, ContentSection, Breadcrumb } from './ProfessionalPageLayout';

// Grid System
export { default as ResponsiveGrid, ResponsiveGridItem, ResponsiveFlex, ResponsiveStack as GridStack } from './ResponsiveGrid';
export { default as ProfessionalGrid, GridItem, DashboardGrid, FormGrid, DataGrid, GridContainer } from './ProfessionalGrid';

// Navigation Components
export { default as ProfessionalBreadcrumb, ProfessionalTabs, ProfessionalPagination, ContextualNavigation } from './ProfessionalNavigation';

// Responsive Patterns (primary exports)
export {
  ResponsiveContainer,
  AdaptiveLayout,
  ResponsiveStack,
  ResponsiveVisibility,
  ResponsiveColumns,
  useBreakpoint,
  useCurrentBreakpoint,
  breakpoints,
} from './ResponsivePatterns';

// Type Exports
export type {
  // Page Layout Types
  PageLayoutProps,
  PageHeaderProps,
  ContentSectionProps,
} from './ProfessionalPageLayout';

export type {
  // Grid Types
  ProfessionalGridProps,
  GridItemProps,
  DashboardGridProps,
  FormGridProps,
  DataGridProps,
  GridContainerProps,
} from './ProfessionalGrid';

export type {
  // Navigation Types
  ProfessionalBreadcrumbProps,
  ProfessionalTabsProps,
  ProfessionalPaginationProps,
  ContextualNavigationProps,
} from './ProfessionalNavigation';

export type {
  // Responsive Pattern Types
  ResponsiveContainerProps,
  AdaptiveLayoutProps,
  ResponsiveStackProps,
  ResponsiveVisibilityProps,
  ResponsiveColumnsProps,
  Breakpoint,
} from './ResponsivePatterns';

export type {
  // Original Grid Types
  ResponsiveGridProps,
  ResponsiveGridItemProps,
  ResponsiveFlexProps,
  ResponsiveContainerProps as OriginalResponsiveContainerProps,
  ResponsiveStackProps as OriginalResponsiveStackProps,
} from './ResponsiveGrid';