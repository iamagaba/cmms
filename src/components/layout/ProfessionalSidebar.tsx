/**
 * Professional CMMS Sidebar Navigation
 * 
 * A modern, industrial-themed sidebar navigation component that replaces
 * emoji icons with professional maintenance-specific iconography.
 * Features smooth animations, active states, search, collapsible sections, and accessibility support.
 */

import React, { useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Home01Icon,
  ClipboardIcon,
  Building01Icon,
  Store01Icon,
  Wrench01Icon,
  PackageIcon,
  Location01Icon,
  Calendar01Icon,
  TimelineIcon,
  MessageIcon,
  Settings01Icon,
  GridIcon,
  Search01Icon,
  Cancel01Icon,
  UserIcon
} from '@hugeicons/core-free-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================
// NAVIGATION CONFIGURATION
// ============================================

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: any; // Hugeicons icon object
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
        icon: Home01Icon,
        description: 'Overview and metrics',
        keywords: ['home', 'overview', 'metrics', 'stats'],
      },
      {
        id: 'work-orders',
        label: 'Work Orders',
        href: '/work-orders',
        icon: ClipboardIcon,
        description: 'Maintenance requests and tasks',
        keywords: ['work', 'orders', 'tasks', 'maintenance', 'requests'],
      },
      {
        id: 'assets',
        label: 'Assets',
        href: '/assets',
        icon: Building01Icon,
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
        icon: Store01Icon,
        description: 'Customer management',
        keywords: ['customers', 'clients', 'contacts'],
      },
      {
        id: 'technicians',
        label: 'Technicians',
        href: '/technicians',
        icon: Wrench01Icon,
        description: 'Staff and assignments',
        keywords: ['technicians', 'staff', 'team', 'workers'],
      },
      {
        id: 'inventory',
        label: 'Inventory',
        href: '/inventory',
        icon: PackageIcon,
        description: 'Parts and supplies',
        keywords: ['inventory', 'parts', 'supplies', 'stock'],
      },
      {
        id: 'locations',
        label: 'Service Centers',
        href: '/locations',
        icon: Location01Icon,
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
        icon: Calendar01Icon,
        description: 'Maintenance planning',
        keywords: ['scheduling', 'calendar', 'planning', 'appointments'],
      },
      {
        id: 'reports',
        label: 'Reports',
        href: '/reports',
        icon: TimelineIcon,
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
        icon: MessageIcon,
        description: 'WhatsApp customer support',
        keywords: ['chat', 'messages', 'whatsapp', 'support'],
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/settings',
        icon: Settings01Icon,
        description: 'Configuration and preferences',
        keywords: ['settings', 'config', 'preferences', 'options'],
      },
      {
        id: 'design-system',
        label: 'Design System',
        href: '/design-system',
        icon: GridIcon,
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
  onNavigate?: () => void;
}

interface NavigationItemProps {
  item: NavigationItem;
  isCollapsed: boolean;
  isActive: boolean;
  onNavigate?: () => void;
}

interface NavigationSectionProps {
  section: NavigationSection;
  isCollapsed: boolean;
  onNavigate?: () => void;
}

// ============================================
// NAVIGATION ITEM COMPONENT
// ============================================

const NavigationItemComponent: React.FC<NavigationItemProps> = ({
  item,
  isCollapsed,
  isActive,
  onNavigate,
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
      onClick={onNavigate}
    >
      {/* Icon - larger when collapsed for better visibility */}
      <div className={cn(
        'flex items-center justify-center flex-shrink-0',
        isActive ? 'text-purple-700' : 'text-gray-400'
      )}>
        <HugeiconsIcon
          icon={item.icon}
          size={isCollapsed ? 20 : 16}
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
  onNavigate,
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
              onNavigate={onNavigate}
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
  onNavigate,
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
          <HugeiconsIcon icon={Wrench01Icon} size={24} className="text-white" />
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
                <HugeiconsIcon icon={Search01Icon} size={14} className="text-gray-400" />
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
                  <HugeiconsIcon icon={Cancel01Icon} size={12} className="text-gray-500" />
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
              onNavigate={onNavigate}
            />
          ))
        ) : (
          isExpanded && searchQuery && (
            <div className="text-center py-8 text-gray-500">
              <HugeiconsIcon icon={Search01Icon} size={32} className="mx-auto mb-2 text-gray-400" />
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
            <HugeiconsIcon icon={UserIcon} size={16} className="text-white" />
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