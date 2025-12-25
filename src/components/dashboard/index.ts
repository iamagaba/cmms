/**
 * Professional Dashboard Components
 * 
 * Centralized exports for all dashboard components with modern design,
 * desktop-optimized interactions, and professional CMMS styling.
 */

// Main Dashboard Component
export { default as ProfessionalDashboard } from './ProfessionalDashboard';

// Core Dashboard Components
export { default as ModernKPICard, KPICardSkeleton } from './ModernKPICard';
export { default as DashboardSection } from './DashboardSection';
export { default as QuickActionsPanel } from './QuickActionsPanel';
export { default as ActivityFeed } from './ActivityFeed';
export { default as AssetStatusOverview } from './AssetStatusOverview';

// Type Exports
export type { ModernKPICardProps } from './ModernKPICard';
export type { DashboardSectionProps } from './DashboardSection';
export type { QuickActionsPanelProps, QuickAction } from './QuickActionsPanel';
export type { ActivityFeedProps, Activity } from './ActivityFeed';
export type { AssetStatusOverviewProps, AssetStatus } from './AssetStatusOverview';