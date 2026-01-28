import { Archive, Building2, Calendar, ClipboardList, Home, MapPin, MessageSquare, Palette, Settings, TrendingUp, User, Users, Wrench } from 'lucide-react';
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
        id: 'chat',
        label: 'Chat',
        href: '/chat',
        icon: MessageSquare,
        description: 'WhatsApp customer support',
        keywords: ['chat', 'messages', 'whatsapp', 'support'],
      },
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
      {
        id: 'design-system-nova',
        label: 'Design System (Nova)',
        href: '/design-system-nova',
        icon: Palette,
        description: 'Nova style preview',
        keywords: ['design', 'nova', 'components', 'ui', 'preview'],
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
        // Base styles - Use semantic tokens
        'group relative flex items-center gap-3 py-2.5 transition-all duration-150 w-full text-left rounded-md',
        'text-muted-foreground hover:text-foreground hover:bg-accent',
        'focus:outline-none no-underline',
        // Padding
        isCollapsed ? 'justify-center px-2' : 'px-3',

        // Active state - Use accent color like pages
        isActive && 'bg-accent text-accent-foreground font-medium',
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onNavigate}
    >
      {/* Icon */}
      <div className={cn(
        'flex items-center justify-center flex-shrink-0',
        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
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
              className="flex items-center justify-center min-w-4 h-4 w-4 h-4 px-1 bg-destructive text-white text-xs font-semibold rounded-full"
            >
              {item.badge}
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 w-4 h-4 px-1 bg-destructive text-white text-xs font-bold rounded-full border border-white"
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
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
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

  // Filter navigation items based on search - Simplified to direct return
  const filteredSections = navigationConfig;

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
        'bg-card', // Use semantic token for dark mode support
        'border-r border-border', // Use semantic token
        'flex flex-col overflow-hidden',
        'transition-[width] duration-300 ease-in-out',
        '!rounded-none !shadow-none !m-0',
        className
      )}
    >
      {/* Header */}
      <div className={cn(
        'flex items-center gap-3 px-3 py-3 border-b border-border',
        !isExpanded && 'justify-center px-2'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg shadow-sm flex-shrink-0">
          <Wrench className="w-4 h-4 text-primary-foreground" />
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
              <h1 className="text-base font-semibold text-foreground">
                GOGO CMMS
              </h1>
              <p className="text-xs text-muted-foreground">
                Maintenance
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>



      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto scrollbar-hide">
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
          'hover:bg-accent',
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
                <div className="text-sm font-medium text-foreground truncate">
                  Admin User
                </div>
                <div className="text-xs text-muted-foreground">
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



