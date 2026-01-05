/**
 * Professional CMMS Sidebar Navigation
 * 
 * A modern, industrial-themed sidebar navigation component that replaces
 * emoji icons with professional maintenance-specific iconography.
 * Features smooth animations, active states, search, collapsible sections, and accessibility support.
 */

import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Home01Icon,
  ClipboardIcon,
  Building01Icon,
  UserMultipleIcon,
  Wrench01Icon,
  Archive01Icon,
  Location03Icon,
  Calendar01Icon,
  ChartLineData01Icon,
  MessageIcon,
  Settings01Icon,
  WebDesign02Icon,

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
        icon: UserMultipleIcon,
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
        icon: Archive01Icon,
        description: 'Parts and supplies',
        keywords: ['inventory', 'parts', 'supplies', 'stock'],
      },
      {
        id: 'locations',
        label: 'Service Centers',
        href: '/locations',
        icon: Location03Icon,
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
        icon: ChartLineData01Icon,
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
        icon: WebDesign02Icon,
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
          strokeWidth={isActive ? 2 : 1.5}
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
              'text-sm leading-tight font-ui',
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

  onNavigate,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isHovered || !collapsed;

  // Notify parent about hover state for content resizing
  React.useEffect(() => {
    const event = new CustomEvent('sidebar-hover', { detail: { isExpanded } });
    window.dispatchEvent(event);
  }, [isExpanded]);

  // Filter navigation items based on search - Simplified to direct return
  const filteredSections = navigationConfig;

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



      {/* Navigation */}
      <nav className="flex-1 py-1 overflow-y-auto scrollbar-hide">
        {filteredSections.map((section) => (
          <NavigationSectionComponent
            key={section.id}
            section={section}
            isCollapsed={!isExpanded}
            onNavigate={onNavigate}
          />
        ))}
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