/**
 * Professional CMMS Sidebar Navigation
 * 
 * A modern, industrial-themed sidebar navigation component that replaces
 * emoji icons with professional maintenance-specific iconography.
 * Features smooth animations, active states, search, collapsible sections, and accessibility support.
 */

import React, { useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================
// NAVIGATION CONFIGURATION
// ============================================

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  description?: string;
  badge?: string | number;
  isActive?: boolean;
  keywords?: string[]; // For search
}

interface NavigationSection {
  id: string;
  label: string;
  items: NavigationItem[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const navigationConfig: NavigationSection[] = [
  {
    id: 'core',
    label: 'Core Operations',
    collapsible: true,
    defaultCollapsed: false,
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/',
        icon: 'tabler:layout-dashboard',
        description: 'Overview and metrics',
        keywords: ['home', 'overview', 'metrics', 'stats'],
      },
      {
        id: 'work-orders',
        label: 'Work Orders',
        href: '/work-orders',
        icon: 'tabler:clipboard-check',
        description: 'Maintenance requests and tasks',
        keywords: ['work', 'orders', 'tasks', 'maintenance', 'requests'],
      },
      {
        id: 'assets',
        label: 'Assets',
        href: '/assets',
        icon: 'tabler:building-factory-2',
        description: 'Equipment and machinery',
        keywords: ['assets', 'equipment', 'machinery', 'vehicles'],
      },
    ],
  },
  {
    id: 'resources',
    label: 'People & Resources',
    collapsible: true,
    defaultCollapsed: false,
    items: [
      {
        id: 'customers',
        label: 'Customers',
        href: '/customers',
        icon: 'tabler:building-store',
        description: 'Customer management',
        keywords: ['customers', 'clients', 'contacts'],
      },
      {
        id: 'technicians',
        label: 'Technicians',
        href: '/technicians',
        icon: 'tabler:tool',
        description: 'Staff and assignments',
        keywords: ['technicians', 'staff', 'team', 'workers'],
      },
      {
        id: 'inventory',
        label: 'Inventory',
        href: '/inventory',
        icon: 'tabler:box-seam',
        description: 'Parts and supplies',
        keywords: ['inventory', 'parts', 'supplies', 'stock'],
      },
      {
        id: 'locations',
        label: 'Service Centers',
        href: '/locations',
        icon: 'tabler:building-warehouse',
        description: 'Maintenance locations and facilities',
        keywords: ['locations', 'service', 'centers', 'facilities', 'sites'],
      },
    ],
  },
  {
    id: 'planning',
    label: 'Planning & Analysis',
    collapsible: true,
    defaultCollapsed: false,
    items: [
      {
        id: 'scheduling',
        label: 'Scheduling',
        href: '/scheduling',
        icon: 'tabler:calendar-event',
        description: 'Maintenance planning',
        keywords: ['scheduling', 'calendar', 'planning', 'appointments'],
      },
      {
        id: 'reports',
        label: 'Reports',
        href: '/reports',
        icon: 'tabler:chart-line',
        description: 'Analytics and insights',
        keywords: ['reports', 'analytics', 'insights', 'data'],
      },
    ],
  },
  {
    id: 'system',
    label: 'System',
    collapsible: true,
    defaultCollapsed: false,
    items: [
      {
        id: 'chat',
        label: 'Chat',
        href: '/chat',
        icon: 'tabler:messages',
        description: 'WhatsApp customer support',
        keywords: ['chat', 'messages', 'whatsapp', 'support'],
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/settings',
        icon: 'tabler:settings',
        description: 'Configuration and preferences',
        keywords: ['settings', 'config', 'preferences', 'options'],
      },
      {
        id: 'design-system',
        label: 'Design System',
        href: '/design-system',
        icon: 'tabler:palette',
        description: 'UI components and design tokens',
        keywords: ['design', 'system', 'components', 'ui', 'tokens', 'theme'],
      },
    ],
  },
];

// ============================================
// COMPONENT INTERFACES
// ============================================

interface ProfessionalSidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavigationItemProps {
  item: NavigationItem;
  isCollapsed: boolean;
  isActive: boolean;
}

interface NavigationSectionProps {
  section: NavigationSection;
  isCollapsed: boolean;
}

// ============================================
// NAVIGATION ITEM COMPONENT
// ============================================

const NavigationItemComponent: React.FC<NavigationItemProps> = ({
  item,
  isCollapsed,
  isActive,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Show tooltip instantly on hover when collapsed
  React.useEffect(() => {
    if (isCollapsed && isHovered) {
      setShowTooltip(true);
    } else {
      setShowTooltip(false);
    }
  }, [isCollapsed, isHovered]);

  return (
    <Link
      to={item.href}
      className={cn(
        // Base styles - matches WorkOrderSidebar item density
        'group relative flex items-center gap-2.5 py-2.5 transition-colors duration-150 w-full text-left',
        'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
        'focus:outline-none no-underline',
        // Padding - flush to edges
        isCollapsed ? 'justify-center px-3 py-3' : 'pl-4 pr-4',

        // Active state - background only, no border
        isActive && 'bg-purple-50 text-purple-900',
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon - larger when collapsed for better visibility */}
      <div className={cn(
        'flex items-center justify-center flex-shrink-0',
        isActive ? 'text-purple-700' : 'text-gray-400'
      )}>
        <Icon
          icon={item.icon}
          className={isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}
        />
      </div>

      {/* Label - matches WorkOrderSidebar text style */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="flex-1 min-w-0"
          >
            <span className={cn(
              'text-sm leading-tight',
              isActive && 'font-semibold'
            )}>
              {item.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge - Compact to match density */}
      {item.badge && (
        <AnimatePresence>
          {!isCollapsed ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center justify-center min-w-[18px] h-[18px] px-1.5 bg-red-500 text-white text-[10px] font-semibold rounded-full"
            >
              {item.badge}
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[14px] h-[14px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full border border-white"
            >
              {item.badge}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Tooltip for collapsed state */}
      {isCollapsed && showTooltip && (
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -5 }}
          transition={{ duration: 0.1 }}
          className={cn(
            'absolute left-full ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded shadow-lg z-50',
            'pointer-events-none whitespace-nowrap'
          )}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 bg-alert-600 text-white text-[10px] font-bold rounded-full">
                {item.badge}
              </span>
            )}
          </div>
          {item.description && (
            <div className="text-xs text-gray-300 mt-0.5">
              {item.description}
            </div>
          )}

          {/* Arrow */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
        </motion.div>
      )}
    </Link>
  );
};

// ============================================
// NAVIGATION SECTION COMPONENT
// ============================================

const NavigationSectionComponent: React.FC<NavigationSectionProps> = ({
  section,
  isCollapsed,
}) => {
  const location = useLocation();

  return (
    <div>
      {/* Section Items - No headers, just items */}
      <div className="space-y-0.5">
        {section.items.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== '/' && location.pathname.startsWith(item.href));

          return (
            <NavigationItemComponent
              key={item.id}
              item={item}
              isCollapsed={isCollapsed}
              isActive={isActive}
            />
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// MAIN SIDEBAR COMPONENT
// ============================================

const ProfessionalSidebar: React.FC<ProfessionalSidebarProps> = ({
  className,
  collapsed = false,
  onToggleCollapse,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isExpanded = isHovered || !collapsed;

  // Notify parent about hover state for content resizing
  React.useEffect(() => {
    const event = new CustomEvent('sidebar-hover', { detail: { isExpanded } });
    window.dispatchEvent(event);
  }, [isExpanded]);

  // Filter navigation items based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return navigationConfig;

    const query = searchQuery.toLowerCase();
    return navigationConfig
      .map(section => ({
        ...section,
        items: section.items.filter(item =>
          item.label.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.keywords?.some(keyword => keyword.includes(query))
        )
      }))
      .filter(section => section.items.length > 0);
  }, [searchQuery]);

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: isExpanded ? '280px' : '80px',
        left: 0,
        top: 0,
        bottom: 0,
        borderRadius: 0,
        boxShadow: 'none',
        margin: 0,
      }}
      className={cn(
        'fixed left-0 top-0 bottom-0 z-40 bg-white',
        'border-r border-gray-200',
        'flex flex-col overflow-hidden',
        'transition-[width] duration-300 ease-in-out',
        '!rounded-none !shadow-none !m-0',
        className
      )}
    >
      {/* Header */}
      <div className={cn(
        'flex items-center gap-3 p-4 border-b border-gray-200',
        !isExpanded && 'justify-center px-2'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-xl shadow-lg flex-shrink-0">
          <Icon icon="tabler:tools" className="w-6 h-6 text-white" />
        </div>

        {/* Brand Name */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 min-w-0"
            >
              <h1 className="text-xl font-bold text-gray-900">
                GOGO CMMS
              </h1>
              <p className="text-xs text-gray-500">
                Maintenance Management
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Bar - matches WorkOrderSidebar exactly */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="px-4 py-3 border-b border-gray-200"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Icon icon="tabler:search" className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search navigation..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded transition-colors"
                >
                  <Icon icon="tabler:x" className="w-3 h-3 text-gray-500" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 py-1 overflow-y-auto scrollbar-hide">
        {filteredSections.length > 0 ? (
          filteredSections.map((section) => (
            <NavigationSectionComponent
              key={section.id}
              section={section}
              isCollapsed={!isExpanded}
            />
          ))
        ) : (
          isExpanded && searchQuery && (
            <div className="text-center py-8 text-gray-500">
              <Icon icon="tabler:search-off" className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No results found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )
        )}
      </nav>

      {/* Footer */}
      <div className={cn(
        'p-4 border-t border-gray-200',
        !isExpanded && 'px-2'
      )}>
        <div className={cn(
          'flex items-center gap-3 p-2',
          !isExpanded && 'justify-center'
        )}>
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <Icon icon="tabler:user" className="w-4 h-4 text-white" />
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0"
              >
                <div className="text-sm font-medium text-gray-900 truncate">
                  Admin User
                </div>
                <div className="text-xs text-gray-500">
                  System Administrator
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
};

export default ProfessionalSidebar;