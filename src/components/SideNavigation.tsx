import React from 'react';
import { Layout, Menu, Typography, Badge } from 'antd';
import { NavLink, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ToolOutlined,
  UsergroupAddOutlined,
  EnvironmentOutlined,
  BarChartOutlined,
  SettingOutlined,
  CarOutlined,
  ShoppingOutlined,
  ContactsOutlined,
  FireOutlined,
  BellOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useNotifications } from '@/context/NotificationsContext'; // Import useNotifications

const { Sider } = Layout;
const { Title } = Typography;

interface SideNavigationProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  logoUrl: string | null;
}

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  className?: string,
): MenuItem {
  return {
    key,
    icon,
    label,
    className,
  } as MenuItem;
}

const SideNavigation = ({ collapsed, onCollapse, logoUrl }: SideNavigationProps) => {
  const location = useLocation();
  const { unreadCount } = useNotifications(); // Get unreadCount from context

  // All menu items are now in a single list, which is the correct pattern.
  const menuItems: MenuItem[] = [
    getItem(<NavLink to="/">Dashboard</NavLink>, "/", <DashboardOutlined />),
    getItem(<NavLink to="/work-orders">Work Orders</NavLink>, "/work-orders", <ToolOutlined />),
    { type: 'divider', key: 'main-divider-1' },
    getItem(<NavLink to="/customers">Customers</NavLink>, "/customers", <ContactsOutlined />),
    getItem(<NavLink to="/assets">Assets</NavLink>, "/assets", <CarOutlined />),
    getItem(<NavLink to="/technicians">Technicians</NavLink>, "/technicians", <UsergroupAddOutlined />),
    getItem(<NavLink to="/locations">Locations</NavLink>, "/locations", <EnvironmentOutlined />),
    getItem(<NavLink to="/inventory">Inventory</NavLink>, "/inventory", <ShoppingOutlined />),
    { type: 'divider', key: 'main-divider-2' },
    getItem(<NavLink to="/analytics">Analytics</NavLink>, "/analytics", <BarChartOutlined />),
    
    // This divider will be pushed to the bottom by CSS, along with the items below it.
    { type: 'divider', key: 'bottom-section-divider', className: 'menu-bottom-divider' },
    
    getItem(
      <NavLink to="/notifications">
        Notifications
        {unreadCount > 0 && (
          <Badge 
            count={unreadCount} 
            size="small" 
            offset={[10, 0]} 
            style={{ backgroundColor: '#6A0DAD', marginLeft: 'auto' }} 
          />
        )}
      </NavLink>, 
      "/notifications", 
      <BellOutlined />
    ),
    getItem(<NavLink to="/settings?tab=profile-settings">Profile</NavLink>, "/settings?tab=profile-settings", <UserOutlined />),
    getItem(<NavLink to="/settings?tab=system-settings">Settings</NavLink>, "/settings?tab=system-settings", <SettingOutlined />),
  ];

  const getSelectedKey = (pathname: string, search: string) => {
    if (pathname === '/settings') {
      const params = new URLSearchParams(search);
      const tab = params.get('tab');
      if (tab === 'profile-settings') return '/settings?tab=profile-settings';
      if (tab === 'system-settings') return '/settings?tab=system-settings';
      if (tab === 'user-management') return '/settings?tab=user-management';
    }
    if (pathname.startsWith('/work-orders/')) return '/work-orders';
    if (pathname.startsWith('/customers/')) return '/customers';
    if (pathname.startsWith('/assets/')) return '/assets';
    if (pathname.startsWith('/technicians/')) return '/technicians';
    if (pathname.startsWith('/locations/')) return '/locations';
    
    return pathname;
  };

  const selectedKey = getSelectedKey(location.pathname, location.search);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      theme="light"
      width={220}
      style={{
        overflow: 'hidden',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        borderRight: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="sider-logo-area">
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '12px', overflow: 'hidden' }}>
          {logoUrl ? (
            <img src={logoUrl} alt="System Logo" style={{ height: '32px', transition: 'all 0.2s' }} />
          ) : (
            <FireOutlined style={{ color: '#6A0DAD', fontSize: '28px', transition: 'all 0.2s' }} />
          )}
          {!collapsed && (
            <Title level={4} style={{ margin: 0, color: '#6A0DAD', whiteSpace: 'nowrap' }}>
              GOGO Electric
            </Title>
          )}
        </NavLink>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        className="main-sider-menu"
      />
    </Sider>
  );
};

export default SideNavigation;