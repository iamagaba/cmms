/**
 * Page Layout Component
 * 
 * Standardized page structure for detail/content pages:
 * - Header with breadcrumbs and actions
 * - Content area with proper padding
 * - Optional sidebar for additional navigation
 * 
 * Usage:
 * <PageLayout
 *   header={<ModernBreadcrumbs actions={<Button>Save</Button>} />}
 *   content={<FormContent />}
 * />
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface PageLayoutProps {
  /** Page header (typically breadcrumbs + actions) */
  header?: React.ReactNode;
  /** Main page content */
  content: React.ReactNode;
  /** Optional sidebar for page-level navigation */
  sidebar?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Width of the sidebar if provided */
  sidebarWidth?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  header,
  content,
  sidebar,
  className,
  sidebarWidth = '280px',
}) => {
  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Header - Sticky */}
      {header && (
        <div className="sticky top-0 z-10 bg-white/85 backdrop-blur-md backdrop-saturate-150 border-b border-gray-200">
          {header}
        </div>
      )}

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {content}
        </div>

        {/* Optional Sidebar */}
        {sidebar && (
          <aside
            className="flex-none border-l border-gray-200 bg-white overflow-auto"
            style={{ width: sidebarWidth }}
          >
            {sidebar}
          </aside>
        )}
      </div>
    </div>
  );
};

/**
 * Content Container
 * 
 * Standardized content wrapper with consistent padding.
 * Use inside PageLayout content prop.
 * 
 * Usage:
 * <ContentContainer>
 *   <Panel>...</Panel>
 * </ContentContainer>
 */
export interface ContentContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Padding size variant */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingVariants = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const ContentContainer: React.FC<ContentContainerProps> = ({
  children,
  className,
  padding = 'md',
}) => {
  return (
    <div className={cn(paddingVariants[padding], className)}>
      {children}
    </div>
  );
};
