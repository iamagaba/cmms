/**
 * Enterprise Panel Component
 * 
 * Standardized container that enforces the "Border, No Shadow" rule:
 * - Background: bg-white - clean, professional
 * - Border: border-gray-200 - subtle separation
 * - Corners: rounded-lg - consistent with design system
 * - No shadows: Enterprise grid uses borders, not elevation
 * 
 * Usage:
 * <Panel>
 *   <PanelHeader>Title</PanelHeader>
 *   <PanelContent>Content here</PanelContent>
 * </Panel>
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes */
  className?: string;
  /** Children elements */
  children: React.ReactNode;
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white border border-gray-200 rounded-lg overflow-hidden',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Panel.displayName = 'Panel';

/**
 * Panel Header - Standardized header section
 */
export interface PanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const PanelHeader = React.forwardRef<HTMLDivElement, PanelHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-4 py-3 border-b border-gray-200 bg-white',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PanelHeader.displayName = 'PanelHeader';

/**
 * Panel Content - Standardized content section
 */
export interface PanelContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const PanelContent = React.forwardRef<HTMLDivElement, PanelContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-4', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PanelContent.displayName = 'PanelContent';

/**
 * Panel Footer - Standardized footer section
 */
export interface PanelFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const PanelFooter = React.forwardRef<HTMLDivElement, PanelFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-4 py-3 border-t border-gray-200 bg-gray-50',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PanelFooter.displayName = 'PanelFooter';
