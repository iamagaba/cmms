/**
 * Professional CMMS Page Layout System
 * 
 * A comprehensive page layout system that provides consistent structure,
 * responsive behavior, and professional styling for all CMMS pages.
 * Includes headers, breadcrumbs, content areas, and action zones.
 */

import React, { forwardRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ChevronRight } from '@hugeicons/core-free-icons';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ============================================
// COMPONENT INTERFACES
// ============================================

export interface PageHeaderProps {
  /**
   * Page title
   */
  title: string;
  
  /**
   * Page subtitle or description
   */
  subtitle?: string;
  
  /**
   * Icon for the page
   */
  icon?: string;
  
  /**
   * Breadcrumb items
   */
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    icon?: string;
  }>;
  
  /**
   * Primary action button
   */
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: string;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  
  /**
   * Secondary actions
   */
  secondaryActions?: Array<{
    label: string;
    onClick: () => void;
    icon?: string;
    variant?: 'secondary' | 'outline' | 'ghost';
  }>;
  
  /**
   * Additional content in header
   */
  children?: React.ReactNode;
  
  /**
   * Custom className
   */
  className?: string;
}

export interface PageLayoutProps {
  /**
   * Page header configuration
   */
  header?: PageHeaderProps;
  
  /**
   * Main content
   */
  children: React.ReactNode;
  
  /**
   * Sidebar content
   */
  sidebar?: React.ReactNode;
  
  /**
   * Footer content
   */
  footer?: React.ReactNode;
  
  /**
   * Layout variant
   */
  variant?: 'default' | 'centered' | 'full-width' | 'sidebar';
  
  /**
   * Container size
   */
  containerSize?: 'sm' | 'base' | 'lg' | 'xl' | 'full';
  
  /**
   * Padding configuration
   */
  padding?: {
    top?: string;
    bottom?: string;
    horizontal?: string;
  };
  
  /**
   * Background variant
   */
  background?: 'default' | 'gray' | 'white';
  
  /**
   * Custom className
   */
  className?: string;
}

export interface ContentSectionProps {
  /**
   * Section title
   */
  title?: string;
  
  /**
   * Section description
   */
  description?: string;
  
  /**
   * Section icon
   */
  icon?: string;
  
  /**
   * Section content
   */
  children: React.ReactNode;
  
  /**
   * Section actions
   */
  actions?: React.ReactNode;
  
  /**
   * Section variant
   */
  variant?: 'default' | 'card' | 'bordered' | 'filled';
  
  /**
   * Custom className
   */
  className?: string;
}

// ============================================
// BREADCRUMB COMPONENT
// ============================================

interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
    icon?: string;
  }>;
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <nav className={cn('flex items-center space-x-2 text-sm', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight 
              className="w-4 h-4 text-machinery-400" 
            />
          )}
          <div className="flex items-center gap-1.5">
            {item.icon && (
              <item.icon 
                className="w-4 h-4 text-machinery-500" 
              />
            )}
            {item.href ? (
              <a
                href={item.href}
                className="text-machinery-600 hover:text-steel-600 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className={cn(
                index === items.length - 1 
                  ? 'text-machinery-900 font-medium' 
                  : 'text-machinery-600'
              )}>
                {item.label}
              </span>
            )}
          </div>
        </React.Fragment>
      ))}
    </nav>
  );
};

// ============================================
// PAGE HEADER COMPONENT
// ============================================

const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    {
      title,
      subtitle,
      icon,
      breadcrumbs,
      primaryAction,
      secondaryActions = [],
      children,
      className,
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'bg-white/85 backdrop-blur-md backdrop-saturate-150 border-b border-machinery-200 sticky top-0 z-30',
          className
        )}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="space-y-4">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <Breadcrumb items={breadcrumbs} />
            )}
            
            {/* Header Content */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Title Section */}
              <div className="flex items-start gap-4">
                {icon && (
                  <div className="flex-shrink-0 w-12 h-12 bg-steel-100 rounded-xl flex items-center justify-center">
                    <icon className="w-6 h-6 text-steel-600" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-machinery-900 truncate">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="mt-1 text-machinery-600 text-base">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Actions Section */}
              {(primaryAction || secondaryActions.length > 0) && (
                <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                  {/* Secondary Actions */}
                  {secondaryActions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || 'secondary'}
                      onClick={action.onClick}
                      size="default"
                    >
                      {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                      {action.label}
                    </Button>
                  ))}
                  
                  {/* Primary Action */}
                  {primaryAction && (
                    <Button
                      variant={primaryAction.variant === 'primary' ? 'default' : primaryAction.variant}
                      onClick={primaryAction.onClick}
                      disabled={primaryAction.loading}
                      size="default"
                    >
                      {primaryAction.loading && <ChevronRight className="w-4 h-4 mr-2 animate-spin" />}
                      {primaryAction.icon && !primaryAction.loading && <primaryAction.icon className="w-4 h-4 mr-2" />}
                      {primaryAction.label}
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {/* Additional Content */}
            {children && (
              <div className="pt-4 border-t border-machinery-200">
                {children}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);

PageHeader.displayName = 'PageHeader';

// ============================================
// CONTENT SECTION COMPONENT
// ============================================

const ContentSection = forwardRef<HTMLDivElement, ContentSectionProps>(
  (
    {
      title,
      description,
      icon,
      children,
      actions,
      variant = 'default',
      className,
    },
    ref
  ) => {
    const sectionClasses = {
      default: '',
      card: 'bg-white rounded-lg border border-machinery-200 shadow-sm p-6',
      bordered: 'border border-machinery-200 rounded-lg p-6',
      filled: 'bg-machinery-50 rounded-lg p-6',
    };

    return (
      <motion.section
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(sectionClasses[variant], className)}
      >
        {/* Section Header */}
        {(title || description || actions) && (
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-start gap-3">
              {icon && (
                <div className="flex-shrink-0 w-8 h-8 bg-steel-100 rounded-lg flex items-center justify-center">
                  <icon className="w-4 h-4 text-steel-600" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                {title && (
                  <h2 className="text-lg font-semibold text-machinery-900">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-1 text-sm text-machinery-600">
                    {description}
                  </p>
                )}
              </div>
            </div>
            
            {actions && (
              <div className="flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        )}
        
        {/* Section Content */}
        <div>
          {children}
        </div>
      </motion.section>
    );
  }
);

ContentSection.displayName = 'ContentSection';

// ============================================
// MAIN PAGE LAYOUT COMPONENT
// ============================================

const ProfessionalPageLayout = forwardRef<HTMLDivElement, PageLayoutProps>(
  (
    {
      header,
      children,
      sidebar,
      footer,
      variant = 'default',
      containerSize = 'xl',
      padding = {
        top: '6',
        bottom: '6',
        horizontal: '6',
      },
      background = 'default',
      className,
    },
    ref
  ) => {
    const backgroundClasses = {
      default: 'bg-machinery-50',
      gray: 'bg-machinery-100',
      white: 'bg-white',
    };

    const layoutClasses = {
      default: 'max-w-7xl mx-auto',
      centered: 'max-w-4xl mx-auto',
      'full-width': 'w-full',
      sidebar: 'max-w-7xl mx-auto',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'min-h-screen',
          backgroundClasses[background],
          className
        )}
      >
        {/* Page Header */}
        {header && <PageHeader {...header} />}
        
        {/* Main Content Area */}
        <div className={cn(
          layoutClasses[variant],
          `px-${padding.horizontal}`,
          `pt-${padding.top}`,
          `pb-${padding.bottom}`
        )}>
          {variant === 'sidebar' && sidebar ? (
            /* Sidebar Layout */
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar */}
              <aside className="lg:w-80 flex-shrink-0">
                {sidebar}
              </aside>
              
              {/* Main Content */}
              <main className="flex-1 min-w-0">
                {children}
              </main>
            </div>
          ) : (
            /* Standard Layout */
            <main>
              {children}
            </main>
          )}
        </div>
        
        {/* Footer */}
        {footer && (
          <footer className="border-t border-machinery-200 bg-white">
            <div className="container mx-auto px-6 py-4">
              {footer}
            </div>
          </footer>
        )}
      </div>
    );
  }
);

ProfessionalPageLayout.displayName = 'ProfessionalPageLayout';

// ============================================
// EXPORTS
// ============================================

export default ProfessionalPageLayout;
export {
  PageHeader,
  ContentSection,
  Breadcrumb,
};

export type {
  PageLayoutProps,
  PageHeaderProps,
  ContentSectionProps,
};

