/**
 * Responsive Navigation Component
 * 
 * A comprehensive navigation system that adapts to different screen sizes,
 * providing desktop sidebar navigation and mobile-friendly drawer/bottom
 * navigation patterns. Optimized for the professional design system.
 */

import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Menu01Icon,
  Cancel01Icon,
  Home01Icon,
  Settings01Icon,
  MoreVerticalIcon
} from '@hugeicons/core-free-icons';
import { Icon } from '@/components/icons/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/utils/responsive';
import { Button } from '@/components/ui/button';

// ============================================
// NAVIGATION INTERFACES
// ============================================

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  children?: NavigationItem[];
  disabled?: boolean;
}

export interface ResponsiveNavigationProps {
  items: NavigationItem[];
  activeItem?: string;
  onItemClick?: (item: NavigationItem) => void;
  logo?: React.ReactNode;
  userMenu?: React.ReactNode;
  className?: string;

  // Desktop sidebar props
  collapsible?: boolean;
  defaultCollapsed?: boolean;

  // Mobile props
  mobileVariant?: 'drawer' | 'bottom' | 'top';
  showMobileToggle?: boolean;
}

// ============================================
// DESKTOP SIDEBAR NAVIGATION
// ============================================

interface DesktopSidebarProps {
  items: NavigationItem[];
  activeItem?: string;
  onItemClick?: (item: NavigationItem) => void;
  logo?: React.ReactNode;
  userMenu?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  items,
  activeItem,
  onItemClick,
  logo,
  userMenu,
  collapsible = true,
  defaultCollapsed = false,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setExpandedItems(new Set()); // Collapse all items when sidebar collapses
    }
  };

  const toggleItemExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.children && item.children.length > 0) {
      toggleItemExpansion(item.id);
    } else {
      onItemClick?.(item);
      if (item.onClick) {
        item.onClick();
      }
    }
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = activeItem === item.id;
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item)}
          disabled={item.disabled}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200',
            'hover:bg-steel-50 focus:outline-none focus:ring-2 focus:ring-steel-500 focus:ring-offset-1',
            isActive && 'bg-steel-100 text-steel-700 font-medium',
            !isActive && 'text-machinery-600 hover:text-machinery-800',
            item.disabled && 'opacity-50 cursor-not-allowed',
            level > 0 && 'ml-6 text-sm',
            isCollapsed && level === 0 && 'justify-center px-2'
          )}
          title={isCollapsed ? item.label : undefined}
        >
          <Icon
            icon={item.icon}
            className={cn(
              'flex-shrink-0 transition-colors',
              isActive ? 'text-steel-600' : 'text-machinery-500',
              isCollapsed ? 'w-6 h-6' : 'w-5 h-5'
            )}
            strokeWidth={isActive ? 2 : 1.5}
          />

          {!isCollapsed && (
            <>
              <span className="flex-1 truncate">{item.label}</span>

              {item.badge && (
                <span className="px-2 py-0.5 text-xs bg-steel-600 text-white rounded-full">
                  {item.badge}
                </span>
              )}

              {hasChildren && (
                <Icon
                  icon={isExpanded ? "tabler:chevron-down" : "tabler:chevron-right"}
                  className="w-4 h-4 text-machinery-400 transition-transform"
                />
              )}
            </>
          )}
        </button>

        {/* Submenu */}
        <AnimatePresence>
          {hasChildren && isExpanded && !isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="py-1 space-y-1">
                {item.children!.map(child => renderNavigationItem(child, level + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? '80px' : '280px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'bg-white border-r border-machinery-200 flex flex-col h-full',
        className
      )}
    >
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between p-4 border-b border-machinery-200',
        isCollapsed && 'justify-center'
      )}>
        {!isCollapsed && logo && (
          <div className="flex-1">{logo}</div>
        )}

        {collapsible && (
          <button
            onClick={toggleCollapse}
            className="p-2 hover:bg-machinery-50 rounded-lg transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon
              icon={isCollapsed ? "tabler:menu-2" : "tabler:x"}
              className="w-5 h-5 text-machinery-600"
            />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {items.map(item => renderNavigationItem(item))}
      </nav>

      {/* User Menu */}
      {userMenu && (
        <div className={cn(
          'p-4 border-t border-machinery-200',
          isCollapsed && 'flex justify-center'
        )}>
          {userMenu}
        </div>
      )}
    </motion.aside>
  );
};

// ============================================
// MOBILE DRAWER NAVIGATION
// ============================================

interface MobileDrawerProps {
  items: NavigationItem[];
  activeItem?: string;
  onItemClick?: (item: NavigationItem) => void;
  logo?: React.ReactNode;
  userMenu?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({
  items,
  activeItem,
  onItemClick,
  logo,
  userMenu,
  isOpen,
  onClose,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItemExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.children && item.children.length > 0) {
      toggleItemExpansion(item.id);
    } else {
      onItemClick?.(item);
      if (item.onClick) {
        item.onClick();
      }
      onClose();
    }
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = activeItem === item.id;
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item)}
          disabled={item.disabled}
          className={cn(
            'w-full flex items-center gap-4 px-4 py-3 text-left transition-colors min-h-[48px]',
            'hover:bg-steel-50 focus:outline-none focus:ring-2 focus:ring-steel-500 focus:ring-inset',
            isActive && 'bg-steel-100 text-steel-700 font-medium',
            !isActive && 'text-machinery-600',
            item.disabled && 'opacity-50 cursor-not-allowed',
            level > 0 && 'ml-8 text-sm'
          )}
        >
          <Icon
            icon={item.icon}
            className={cn(
              'flex-shrink-0 w-6 h-6',
              isActive ? 'text-steel-600' : 'text-machinery-500'
            )}
            strokeWidth={isActive ? 2 : 1.5}
          />

          <span className="flex-1">{item.label}</span>

          {item.badge && (
            <span className="px-2 py-1 text-xs bg-steel-600 text-white rounded-full">
              {item.badge}
            </span>
          )}

          {hasChildren && (
            <Icon
              icon={isExpanded ? "tabler:chevron-down" : "tabler:chevron-right"}
              className="w-5 h-5 text-machinery-400"
            />
          )}
        </button>

        {/* Submenu */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden bg-machinery-25"
            >
              {item.children!.map(child => renderNavigationItem(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md backdrop-saturate-150 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-machinery-200">
              {logo && <div className="flex-1">{logo}</div>}
              <button
                onClick={onClose}
                className="p-2 hover:bg-machinery-50 rounded-lg transition-colors"
                aria-label="Close navigation"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={24} className="text-machinery-600" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto">
              {items.map(item => renderNavigationItem(item))}
            </nav>

            {/* User Menu */}
            {userMenu && (
              <div className="p-4 border-t border-machinery-200">
                {userMenu}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ============================================
// MOBILE BOTTOM NAVIGATION
// ============================================

interface MobileBottomNavProps {
  items: NavigationItem[];
  activeItem?: string;
  onItemClick?: (item: NavigationItem) => void;
  maxItems?: number;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  items,
  activeItem,
  onItemClick,
  maxItems = 5,
}) => {
  const visibleItems = items.slice(0, maxItems);
  const hasMoreItems = items.length > maxItems;

  const handleItemClick = (item: NavigationItem) => {
    onItemClick?.(item);
    if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-machinery-200 z-40">
      <div className="flex">
        {visibleItems.map((item) => {
          const isActive = activeItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[64px]',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-steel-500 focus:ring-inset',
                isActive && 'text-steel-600',
                !isActive && 'text-machinery-500 hover:text-machinery-700',
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="relative">
                <Icon
                  icon={item.icon}
                  className="w-6 h-6 mb-1"
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-steel-600 text-white rounded-full min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}

        {hasMoreItems && (
          <button className="flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[64px] text-machinery-500">
            <HugeiconsIcon icon={MoreVerticalIcon} size={24} className="mb-1" />
            <span className="text-xs font-medium">More</span>
          </button>
        )}
      </div>
    </nav>
  );
};

// ============================================
// MAIN RESPONSIVE NAVIGATION COMPONENT
// ============================================

const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  items,
  activeItem,
  onItemClick,
  logo,
  userMenu,
  className,
  collapsible = true,
  defaultCollapsed = false,
  mobileVariant = 'drawer',
  showMobileToggle = true,
}) => {
  const { isMobile, isDesktop } = useResponsive();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on desktop
  useEffect(() => {
    if (isDesktop) {
      setIsMobileMenuOpen(false);
    }
  }, [isDesktop]);

  // Desktop Navigation
  if (isDesktop) {
    return (
      <DesktopSidebar
        items={items}
        activeItem={activeItem}
        onItemClick={onItemClick}
        logo={logo}
        userMenu={userMenu}
        collapsible={collapsible}
        defaultCollapsed={defaultCollapsed}
        className={className}
      />
    );
  }

  // Mobile Navigation
  return (
    <>
      {/* Mobile Header with Toggle */}
      {showMobileToggle && mobileVariant === 'drawer' && (
        <header className="bg-white border-b border-machinery-200 px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation"
          >
            <HugeiconsIcon icon={Menu01Icon} size={24} />
          </Button>
          {logo && <div className="flex-1 flex justify-center">{logo}</div>}
          <div className="w-10" /> {/* Spacer for centering */}
        </header>
      )}

      {/* Mobile Navigation Content */}
      {mobileVariant === 'drawer' && (
        <MobileDrawer
          items={items}
          activeItem={activeItem}
          onItemClick={onItemClick}
          logo={logo}
          userMenu={userMenu}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}

      {mobileVariant === 'bottom' && (
        <MobileBottomNav
          items={items}
          activeItem={activeItem}
          onItemClick={onItemClick}
        />
      )}
    </>
  );
};

// ============================================
// EXPORTS
// ============================================

export default ResponsiveNavigation;
export {
  DesktopSidebar,
  MobileDrawer,
  MobileBottomNav,
};

export type {
  ResponsiveNavigationProps,
  NavigationItem,
};