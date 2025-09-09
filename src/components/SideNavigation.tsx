import React from 'react';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Users,
  Wrench,
  CalendarDays,
  FileText,
  Settings,
  Bell,
  UserCircle,
} from 'lucide-react';

// Define the MenuItem type based on Ant Design's MenuProps
type MenuItem = Required<MenuProps>['items'][number];

// Helper function to create a MenuItem
function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem; // Explicit cast to ensure type compatibility
}

// Interface for our raw navigation item data
interface RawNavItem {
  key?: string; // Optional for divider type
  icon?: React.ReactNode; // Optional for divider type
  label?: string; // Optional for divider type
  type?: 'divider'; // Optional for regular items
}

// Raw data for main navigation items
const rawMainNavigationItems: RawNavItem[] = [
  { key: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
  { key: '/locations', icon: <MapPin />, label: 'Locations' },
  { key: '/users', icon: <Users />, label: 'Users' },
  { key: '/assets', icon: <Wrench />, label: 'Assets' },
  { key: '/schedule', icon: <CalendarDays />, label: 'Schedule' },
  { key: '/reports', icon: <FileText />, label: 'Reports' },
  { type: 'divider' },
  { key: '/settings', icon: <Settings />, label: 'Settings' },
];

// Raw data for bottom navigation items (Notifications and Profile)
const rawBottomNavigationItems: RawNavItem[] = [
  { key: '/notifications', icon: <Bell />, label: 'Notifications' },
  { key: '/profile', icon: <UserCircle />, label: 'Profile' },
];

// Process raw data into Ant Design MenuItem format for the main menu
const mainMenuItems: MenuItem[] = rawMainNavigationItems.map((item) => {
  if (item.type === 'divider') {
    return { type: 'divider' };
  }
  // For regular items, key and label are expected to exist
  return getItem(
    <NavLink to={item.key!}>{item.label!}</NavLink>, // Use non-null assertion as we've checked for divider
    item.key!,
    item.icon,
  );
});

// Process raw data into Ant Design MenuItem format for the bottom menu
const bottomMenuItems: MenuItem[] = rawBottomNavigationItems.map((item) => {
  return getItem(
    <NavLink to={item.key!}>{item.label!}</NavLink>,
    item.key!,
    item.icon,
  );
});

// Define props for SideNavigation
interface SideNavigationProps {
  collapsed: boolean;
  onCollapse: React.Dispatch<React.SetStateAction<boolean>>;
  logoUrl: string;
}

export default function SideNavigation({ collapsed, onCollapse, logoUrl }: SideNavigationProps) {
  return (
    <div className="flex h-full flex-col bg-white shadow-md">
      {/* Logo Section */}
      <div className="flex items-center justify-center p-4 mb-4">
        <img src={logoUrl} alt="System Logo" className="h-12 w-12 rounded-full object-cover" />
        {!collapsed && <span className="ml-3 text-xl font-semibold text-gray-800">GOGO Electric</span>}
      </div>

      {/* Main Navigation Menu */}
      <Menu
        mode="inline"
        theme="light"
        inlineCollapsed={collapsed}
        style={{ borderRight: 0, flexGrow: 1, overflowY: 'auto' }}
        items={mainMenuItems}
      />

      {/* Bottom Navigation Menu */}
      <div className="mt-auto border-t border-gray-200"> {/* Pushes this section to the bottom */}
        <Menu
          mode="inline"
          theme="light"
          inlineCollapsed={collapsed}
          style={{ borderRight: 0 }}
          items={bottomMenuItems}
        />
      </div>
    </div>
  );
}