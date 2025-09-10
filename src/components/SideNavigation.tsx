import React from 'react';
import { Layout, Menu, Typography, Badge, Button } from 'antd';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useNotifications } from '@/context/NotificationsContext';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

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
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError('Failed to log out: ' + error.message);
    } else {
      showSuccess('You have been logged out.');
      navigate('/login');
    }
  };

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
    
    {
      type: 'group',
      label: 'User & System',
      key: 'user-system-group',
      className: 'menu-bottom-group',
      children: [
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
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Logout',
          onClick: handleLogout,
          danger: true,
        },
      ]
    },
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
      // Removed collapsible and onCollapse from Sider to use a custom trigger
      collapsed={collapsed}
      theme="light"
      width={220}
      style={{
        overflow: 'hidden', // Keep overflow hidden for the sider itself
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        borderRight: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column', // Enable flex column for internal layout
        borderRadius: 8, // Added rounded corners
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
      {/* Custom trigger button */}
      <div className="sider-custom-trigger">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapse(!collapsed)}
          style={{ width: '100%', height: '48px', borderRadius: 0 }}
        />
      </div>
    </Sider>
  );
};

export default SideNavigation;