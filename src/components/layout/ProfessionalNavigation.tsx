/**
 * Professional CMMS Navigation System
 * 
 * Enhanced navigation components for desktop CMMS workflows including
 * breadcrumbs, tabs, pagination, and contextual navigation patterns.
 * Optimized for keyboard navigation and accessibility.
 */

import React, { forwardRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ProfessionalButton from '@/components/ui/ProfessionalButton';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
  onClick?: () => void;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

// ============================================
// ENHANCED BREADCRUMB COMPONENT
// ============================================

export interface ProfessionalBreadcrumbProps {
  /**
   * Breadcrumb items
   */
  items: BreadcrumbItem[];

  /**
   * Separator icon
   */
  separator?: string;

  /**
   * Maximum items to show before collapsing
   */
  maxItems?: number;

  /**
   * Custom className
   */
  className?: string;
}

const ProfessionalBreadcrumb = forwardRef<HTMLNavElement, ProfessionalBreadcrumbProps>(
  (
    {
      items,
      separator = 'tabler:chevron-right',
      maxItems = 5,
      className,
    },
    ref
  ) => {
    const [showAll, setShowAll] = useState(false);

    const shouldCollapse = items.length > maxItems;
    const displayItems = shouldCollapse && !showAll
      ? [items[0], ...items.slice(-2)]
      : items;

    const collapsedCount = shouldCollapse && !showAll
      ? items.length - 3
      : 0;

    return (
      <nav
        ref={ref}
        className={cn(
          'flex items-center space-x-2 text-sm',
          className
        )}
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center space-x-2">
          {displayItems.map((item, index) => {
            const isLast = index === displayItems.length - 1;
            const isFirst = index === 0;

            return (
              <React.Fragment key={`${item.label}-${index}`}>
                {/* Collapsed indicator */}
                {shouldCollapse && !showAll && index === 1 && collapsedCount > 0 && (
                  <>
                    <li>
                      <button
                        onClick={() => setShowAll(true)}
                        className="flex items-center gap-1 px-2 py-1 text-machinery-500 hover:text-machinery-700 hover:bg-machinery-100 rounded transition-colors"
                        title={`Show ${collapsedCount} hidden items`}
                      >
                        <Icon icon="tabler:dots" className="w-4 h-4" />
                        <span className="text-xs">+{collapsedCount}</span>
                      </button>
                    </li>
                    <Icon
                      icon={separator}
                      className="w-4 h-4 text-machinery-400"
                    />
                  </>
                )}

                <li className="flex items-center">
                  <div className="flex items-center gap-1.5">
                    {item.icon && (
                      <Icon
                        icon={item.icon}
                        className="w-4 h-4 text-machinery-500"
                      />
                    )}
                    {item.href && !isLast ? (
                      <a
                        href={item.href}
                        className="text-machinery-600 hover:text-steel-600 transition-colors focus:outline-none focus:ring-2 focus:ring-steel-500 focus:ring-offset-1 rounded"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <span className={cn(
                        isLast
                          ? 'text-machinery-900 font-medium'
                          : 'text-machinery-600'
                      )}>
                        {item.label}
                      </span>
                    )}
                  </div>
                </li>

                {!isLast && (
                  <Icon
                    icon={separator}
                    className="w-4 h-4 text-machinery-400"
                  />
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </nav>
    );
  }
);

ProfessionalBreadcrumb.displayName = 'ProfessionalBreadcrumb';

// ============================================
// PROFESSIONAL TABS COMPONENT
// ============================================

export interface ProfessionalTabsProps {
  /**
   * Tab items
   */
  items: NavigationItem[];

  /**
   * Active tab ID
   */
  activeTab: string;

  /**
   * Tab change handler
   */
  onTabChange: (tabId: string) => void;

  /**
   * Tab variant
   */
  variant?: 'default' | 'pills' | 'underline' | 'cards';

  /**
   * Tab size
   */
  size?: 'sm' | 'base' | 'lg';

  /**
   * Whether tabs should fill container width
   */
  fullWidth?: boolean;

  /**
   * Custom className
   */
  className?: string;
}

const ProfessionalTabs = forwardRef<HTMLDivElement, ProfessionalTabsProps>(
  (
    {
      items,
      activeTab,
      onTabChange,
      variant = 'default',
      size = 'base',
      fullWidth = false,
      className,
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      base: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const variantClasses = {
      default: {
        container: 'border-b border-machinery-200',
        tab: 'border-b-2 border-transparent hover:border-machinery-300 hover:text-machinery-700',
        active: 'border-steel-600 text-steel-600',
      },
      pills: {
        container: 'bg-machinery-100 p-1 rounded-lg',
        tab: 'rounded-md hover:bg-white hover:text-machinery-700',
        active: 'bg-white text-steel-600 shadow-sm',
      },
      underline: {
        container: '',
        tab: 'border-b-2 border-transparent hover:border-machinery-300',
        active: 'border-steel-600 text-steel-600',
      },
      cards: {
        container: 'gap-2',
        tab: 'border border-machinery-200 rounded-lg hover:border-machinery-300 hover:bg-machinery-50',
        active: 'border-steel-600 bg-steel-50 text-steel-600',
      },
    };

    const config = variantClasses[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          fullWidth && 'w-full',
          config.container,
          className
        )}
        role="tablist"
      >
        {items.map((item) => {
          const isActive = item.id === activeTab;

          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${item.id}`}
              disabled={item.disabled}
              onClick={() => !item.disabled && onTabChange(item.id)}
              className={cn(
                // Base styles
                'relative flex items-center gap-2 font-medium transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-steel-500 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',

                // Size styles
                sizeClasses[size],

                // Variant styles
                config.tab,
                isActive && config.active,

                // Full width
                fullWidth && 'flex-1 justify-center',

                // Default colors
                !isActive && 'text-machinery-600'
              )}
            >
              {/* Icon */}
              {item.icon && (
                <Icon
                  icon={item.icon}
                  className="w-4 h-4 flex-shrink-0"
                />
              )}

              {/* Label */}
              <span className="truncate">{item.label}</span>

              {/* Badge */}
              {item.badge && (
                <span className="ml-1 px-1.5 py-0.5 bg-machinery-200 text-machinery-700 text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}

              {/* Active indicator for pills variant */}
              {variant === 'pills' && isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-md shadow-sm -z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }
);

ProfessionalTabs.displayName = 'ProfessionalTabs';

// ============================================
// PROFESSIONAL PAGINATION COMPONENT
// ============================================

export interface ProfessionalPaginationProps {
  /**
   * Current page (1-based)
   */
  currentPage: number;

  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Page change handler
   */
  onPageChange: (page: number) => void;

  /**
   * Number of page buttons to show around current page
   */
  siblingCount?: number;

  /**
   * Show first/last page buttons
   */
  showFirstLast?: boolean;

  /**
   * Show previous/next buttons
   */
  showPrevNext?: boolean;

  /**
   * Show page size selector
   */
  showPageSize?: boolean;

  /**
   * Available page sizes
   */
  pageSizes?: number[];

  /**
   * Current page size
   */
  pageSize?: number;

  /**
   * Page size change handler
   */
  onPageSizeChange?: (size: number) => void;

  /**
   * Total items count
   */
  totalItems?: number;

  /**
   * Pagination size
   */
  size?: 'sm' | 'base' | 'lg';

  /**
   * Custom className
   */
  className?: string;
}

const ProfessionalPagination = forwardRef<HTMLDivElement, ProfessionalPaginationProps>(
  (
    {
      currentPage,
      totalPages,
      onPageChange,
      siblingCount = 1,
      showFirstLast = true,
      showPrevNext = true,
      showPageSize = false,
      pageSizes = [10, 25, 50, 100],
      pageSize = 25,
      onPageSizeChange,
      totalItems,
      size = 'base',
      className,
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-8 px-2 text-sm',
      base: 'h-10 px-3 text-sm',
      lg: 'h-12 px-4 text-base',
    };

    // Generate page numbers to display
    const generatePageNumbers = () => {
      const pages: (number | 'ellipsis')[] = [];

      // Always show first page
      if (showFirstLast) {
        pages.push(1);
      }

      // Calculate range around current page
      const startPage = Math.max(showFirstLast ? 2 : 1, currentPage - siblingCount);
      const endPage = Math.min(showFirstLast ? totalPages - 1 : totalPages, currentPage + siblingCount);

      // Add ellipsis after first page if needed
      if (showFirstLast && startPage > 2) {
        pages.push('ellipsis');
      }

      // Add pages around current page
      for (let i = startPage; i <= endPage; i++) {
        if (!showFirstLast || (i !== 1 && i !== totalPages)) {
          pages.push(i);
        }
      }

      // Add ellipsis before last page if needed
      if (showFirstLast && endPage < totalPages - 1) {
        pages.push('ellipsis');
      }

      // Always show last page
      if (showFirstLast && totalPages > 1) {
        pages.push(totalPages);
      }

      return pages;
    };

    const pageNumbers = generatePageNumbers();

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems || 0);

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col sm:flex-row items-center justify-between gap-4',
          className
        )}
      >
        {/* Page info and size selector */}
        <div className="flex items-center gap-4 text-sm text-machinery-600">
          {totalItems && (
            <span>
              Showing {startItem.toLocaleString()} to {endItem.toLocaleString()} of {totalItems.toLocaleString()} results
            </span>
          )}

          {showPageSize && onPageSizeChange && (
            <div className="flex items-center gap-2">
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="input-base w-auto min-w-[4rem]"
              >
                {pageSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-1">
          {/* First page */}
          {showFirstLast && (
            <ProfessionalButton
              variant="ghost"
              size={size}
              icon="tabler:chevrons-left"
              disabled={currentPage === 1}
              onClick={() => onPageChange(1)}
              className={sizeClasses[size]}
              aria-label="Go to first page"
            />
          )}

          {/* Previous page */}
          {showPrevNext && (
            <ProfessionalButton
              variant="ghost"
              size={size}
              icon="tabler:chevron-left"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className={sizeClasses[size]}
              aria-label="Go to previous page"
            />
          )}

          {/* Page numbers */}
          {pageNumbers.map((page, index) => (
            <React.Fragment key={index}>
              {page === 'ellipsis' ? (
                <span className="px-2 text-machinery-400">…</span>
              ) : (
                <ProfessionalButton
                  variant={page === currentPage ? 'primary' : 'ghost'}
                  size={size}
                  onClick={() => onPageChange(page)}
                  className={sizeClasses[size]}
                  aria-label={`Go to page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </ProfessionalButton>
              )}
            </React.Fragment>
          ))}

          {/* Next page */}
          {showPrevNext && (
            <ProfessionalButton
              variant="ghost"
              size={size}
              icon="tabler:chevron-right"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className={sizeClasses[size]}
              aria-label="Go to next page"
            />
          )}

          {/* Last page */}
          {showFirstLast && (
            <ProfessionalButton
              variant="ghost"
              size={size}
              icon="tabler:chevrons-right"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(totalPages)}
              className={sizeClasses[size]}
              aria-label="Go to last page"
            />
          )}
        </div>
      </div>
    );
  }
);

ProfessionalPagination.displayName = 'ProfessionalPagination';

// ============================================
// CONTEXTUAL NAVIGATION COMPONENT
// ============================================

export interface ContextualNavigationProps {
  /**
   * Navigation items
   */
  items: NavigationItem[];

  /**
   * Current active item
   */
  activeItem?: string;

  /**
   * Navigation title
   */
  title?: string;

  /**
   * Navigation variant
   */
  variant?: 'sidebar' | 'horizontal' | 'dropdown';

  /**
   * Whether navigation is collapsible
   */
  collapsible?: boolean;

  /**
   * Initial collapsed state
   */
  defaultCollapsed?: boolean;

  /**
   * Custom className
   */
  className?: string;
}

const ContextualNavigation = forwardRef<HTMLDivElement, ContextualNavigationProps>(
  (
    {
      items,
      activeItem,
      title,
      variant = 'sidebar',
      collapsible = false,
      defaultCollapsed = false,
      className,
    },
    ref
  ) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    const variantClasses = {
      sidebar: 'flex flex-col space-y-1',
      horizontal: 'flex flex-row space-x-1',
      dropdown: 'flex flex-col space-y-1',
    };

    return (
      <nav
        ref={ref}
        className={cn(
          'bg-white border border-machinery-200 rounded-lg p-4',
          className
        )}
      >
        {/* Navigation Header */}
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-machinery-900">
              {title}
            </h3>
            {collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 text-machinery-500 hover:text-machinery-700 rounded"
              >
                <Icon
                  icon={isCollapsed ? 'tabler:chevron-down' : 'tabler:chevron-up'}
                  className="w-4 h-4"
                />
              </button>
            )}
          </div>
        )}

        {/* Navigation Items */}
        <AnimatePresence>
          {(!collapsible || !isCollapsed) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={variantClasses[variant]}
            >
              {items.map((item) => {
                const isActive = item.id === activeItem;

                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    disabled={item.disabled}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-steel-500 focus:ring-offset-2',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      isActive
                        ? 'bg-steel-100 text-steel-700'
                        : 'text-machinery-600 hover:text-machinery-900 hover:bg-machinery-50'
                    )}
                  >
                    {item.icon && (
                      <Icon
                        icon={item.icon}
                        className="w-4 h-4 flex-shrink-0"
                      />
                    )}
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-1.5 py-0.5 bg-machinery-200 text-machinery-700 text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    );
  }
);

ContextualNavigation.displayName = 'ContextualNavigation';

// ============================================
// EXPORTS
// ============================================

export default ProfessionalBreadcrumb;
export {
  ProfessionalTabs,
  ProfessionalPagination,
  ContextualNavigation,
};

export type {
  ProfessionalBreadcrumbProps,
  ProfessionalTabsProps,
  ProfessionalPaginationProps,
  ContextualNavigationProps,
};