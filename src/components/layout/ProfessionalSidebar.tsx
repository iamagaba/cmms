import { Archive, Building2, Calendar, ClipboardList, Home, MapPin, Palette, Settings, TrendingUp, User, Users, Wrench } from 'lucide-react';
/**
 * Professional CMMS Sidebar Navigation
 * 
 * A modern, industrial-themed sidebar navigation component that replaces
 * emoji icons with professional maintenance-specific iconography.
 * Features smooth animations, active states, search, collapsible sections, and accessibility support.
 */

import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';



import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useActiveSystem } from '@/context/ActiveSystemContext';
import { SystemSwitcher } from './SystemSwitcher';
import { ticketingNavigationConfig } from '@/config/ticketingNavigation';

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
        icon: Home,
        description: 'Overview and metrics',
        keywords: ['home', 'overview', 'metrics', 'stats'],
      },
      {
        id: 'work-orders',
        label: 'Work Orders',
        href: '/work-orders',
        icon: ClipboardList,
        description: 'Maintenance requests and tasks',
        keywords: ['work', 'orders', 'tasks', 'maintenance', 'requests'],
      },
      {
        id: 'assets',
        label: 'Assets',
        href: '/assets',
        icon: Building2,
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
        icon: Users,
        description: 'Customer management',
        keywords: ['customers', 'clients', 'contacts'],
      },
      {
        id: 'technicians',
        label: 'Technicians',
        href: '/technicians',
        icon: Wrench,
        description: 'Staff and assignments',
        keywords: ['technicians', 'staff', 'team', 'workers'],
      },
      {
        id: 'inventory',
        label: 'Inventory',
        href: '/inventory',
        icon: Archive,
        description: 'Parts and supplies',
        keywords: ['inventory', 'parts', 'supplies', 'stock'],
      },
      {
        id: 'locations',
        label: 'Service Centers',
        href: '/locations',
        icon: MapPin,
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
        icon: Calendar,
        description: 'Maintenance planning',
        keywords: ['scheduling', 'calendar', 'planning', 'appointments'],
      },
      {
        id: 'reports',
        label: 'Reports',
        href: '/reports',
        icon: TrendingUp,
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
        id: 'settings',
        label: 'Settings',
        href: '/settings',
        icon: Settings,
        description: 'Configuration and preferences',
        keywords: ['settings', 'config', 'preferences', 'options'],
      },
      {
        id: 'design-system',
        label: 'Design System',
        href: '/design-system-v2',
        icon: Palette,
        description: 'shadcn/ui component library',
        keywords: ['design', 'components', 'ui', 'shadcn'],
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
        // Base styles - Enterprise dark theme
        'group relative flex items-center gap-3 py-2.5 transition-all duration-150 w-full text-left rounded-md',
        'text-secondary-foreground dark:text-muted-foreground hover:text-secondary-foreground dark:hover:text-foreground',
        'hover:bg-secondary-foreground/10 dark:hover:bg-muted',
        'focus:outline-none no-underline',
        // Padding
        isCollapsed ? 'justify-center px-2' : 'px-3',

        // Active state - Electric Teal highlight
        isActive && 'bg-primary text-primary-foreground font-medium hover:bg-primary hover:text-primary-foreground',
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onNavigate}
    >
      {/* Icon */}
      <div className={cn(
        'flex items-center justify-center flex-shrink-0',
        isActive ? 'text-primary-foreground' : 'text-secondary-foreground dark:text-muted-foreground group-hover:text-secondary-foreground dark:group-hover:text-foreground'
      )}>
        <item.icon
          size={isCollapsed ? 18 : 16}
        />
      </div>

      {/* Label */}
      {!isCollapsed && (
        <span className={cn(
          "flex-1 min-w-0 text-sm leading-tight",
          isActive ? "font-semibold" : "font-medium"
        )}>
          {item.label}
        </span>
      )}

      {/* Badge - Compact to match density */}
      {item.badge && (
        <AnimatePresence>
          {!isCollapsed ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center justify-center min-w-4 h-4 w-4 h-4 px-1 bg-destructive text-destructive-foreground text-xs font-semibold rounded-full"
            >
              {item.badge}
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 w-4 h-4 px-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full border-2 border-secondary dark:border-background"
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
            'absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg z-50 border border-border',
            'pointer-events-none whitespace-nowrap'
          )}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className="inline-flex items-center justify-center min-w-4 h-4 w-4 h-4 px-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full">
                {item.badge}
              </span>
            )}
          </div>
          {item.description && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {item.description}
            </div>
          )}

          {/* Arrow */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-popover rotate-45 border-l border-b border-border" />
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
    <div className="mb-4">
      {/* Section Header */}
      {!isCollapsed && (
        <div className="px-3 mb-2">
          <h2 className="text-xs font-semibold text-secondary-foreground/60 dark:text-muted-foreground uppercase tracking-wide">
            {section.label}
          </h2>
        </div>
      )}

      {/* Section Items */}
      <div className="space-y-1">
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

  // Switch navigation based on active system
  const { activeSystem } = useActiveSystem();
  const filteredSections = activeSystem === 'ticketing' ? ticketingNavigationConfig : navigationConfig;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: isExpanded ? '200px' : '56px',
        left: 0,
        top: 0,
        bottom: 0,
        borderRadius: 0,
        boxShadow: 'none',
        margin: 0,
      }}
      className={cn(
        'fixed left-0 top-0 bottom-0 z-40',
        'bg-secondary dark:bg-background', // Navy in light mode, pure black in dark mode
        'border-r border-border', // Theme-aware border
        'flex flex-col overflow-hidden',
        'transition-[width] duration-300 ease-in-out',
        '!rounded-none !shadow-none !m-0',
        className
      )}
    >
      {/* Header & Switcher */}
      <SystemSwitcher isCollapsed={!isExpanded} />

      <div className="h-px bg-border/50 mx-3 my-2" />



      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto no-scrollbar">
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
        'px-3 py-3 border-t border-border',
        !isExpanded && 'px-2'
      )}>
        {/* Theme Toggle */}
        <div className={cn(
          'mb-2',
          !isExpanded && 'flex justify-center'
        )}>
          <ThemeToggle />
        </div>

        {/* User Profile */}
        <button className={cn(
          'flex items-center gap-2.5 p-2 w-full rounded-md transition-colors',
          'hover:bg-secondary-foreground/10 dark:hover:bg-muted',
          'text-secondary-foreground dark:text-muted-foreground hover:text-secondary-foreground dark:hover:text-foreground',
          !isExpanded && 'justify-center'
        )}>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0 text-left"
              >
                <div className="text-sm font-medium text-secondary-foreground dark:text-foreground truncate">
                  Admin User
                </div>
                <div className="text-xs text-secondary-foreground/70 dark:text-muted-foreground">
                  Administrator
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </aside>
  );
};

export default ProfessionalSidebar;



