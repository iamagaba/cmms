/**
 * Master-Detail Layout Component
 * 
 * Standardized 3-column layout structure:
 * - Left: Main navigation sidebar (fixed width: 280px expanded, 80px collapsed)
 * - Middle: List/Master view (fixed width: 320px)
 * - Right: Detail view (flexible, takes remaining space)
 * 
 * This layout enforces:
 * - Border-based separation (no shadows)
 * - Full-height columns
 * - Proper overflow handling
 * - Consistent spacing
 * 
 * Usage:
 * <MasterDetailLayout
 *   sidebar={<ProfessionalSidebar />}
 *   list={<WorkOrderList />}
 *   detail={<WorkOrderDetails />}
 * />
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface MasterDetailLayoutProps {
  /** Main navigation sidebar (left column) */
  sidebar: React.ReactNode;
  /** List/Master view (middle column) */
  list: React.ReactNode;
  /** Detail view (right column) */
  detail: React.ReactNode;
  /** Additional CSS classes for the container */
  className?: string;
  /** Width of the list column (default: 320px) */
  listWidth?: string;
}

export const MasterDetailLayout: React.FC<MasterDetailLayoutProps> = ({
  sidebar,
  list,
  detail,
  className,
  listWidth = '320px',
}) => {
  return (
    <div className={cn('flex h-screen w-full bg-white overflow-hidden', className)}>
      {/* Main Navigation Sidebar - Handled by ProfessionalSidebar component */}
      {sidebar}

      {/* Middle List Column - Fixed Width */}
      <aside
        className="flex-none border-r border-gray-200 bg-white flex flex-col"
        style={{ width: listWidth }}
      >
        {list}
      </aside>

      {/* Main Detail Content - Flexible */}
      <main className="flex-1 overflow-auto bg-white">
        {detail}
      </main>
    </div>
  );
};

/**
 * Two-Column Layout (Sidebar + Content)
 * 
 * Simplified layout for pages that don't need the middle list column.
 * 
 * Usage:
 * <TwoColumnLayout
 *   sidebar={<ProfessionalSidebar />}
 *   content={<DashboardContent />}
 * />
 */
export interface TwoColumnLayoutProps {
  /** Main navigation sidebar */
  sidebar: React.ReactNode;
  /** Main content area */
  content: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  sidebar,
  content,
  className,
}) => {
  return (
    <div className={cn('flex h-screen w-full bg-white overflow-hidden', className)}>
      {/* Main Navigation Sidebar */}
      {sidebar}

      {/* Main Content - Flexible */}
      <main className="flex-1 overflow-auto bg-white">
        {content}
      </main>
    </div>
  );
};
