import React from 'react';
import { Layout, Menu, Typography, Badge, Button, Space, Avatar, Spin } from 'antd';
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
  FireOutlined, // For the logo
  BellOutlined, // For notifications
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useNotifications } from '@/context/NotificationsContext';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useSession } from '@/context/SessionContext';
import { useQuery } from '@tanstack/react-query';
import { Profile } from '@/types/supabase';

const { Sider } = Layout;
const { Title, Text } = Typography;

interface SideNavigationProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  logoUrl: string | null; // Added logoUrl prop
}

type MenuItem = Required<MenuProps>['items'][number];

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
  } as MenuItem;
}

const SideNavigation = ({ collapsed, onCollapse, logoUrl }: SideNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useSession();
  const user = session?.user;
  const { unreadCount } = useNotifications(); // Get unread count

  const { data: profile, isLoading: isLoadingProfile } = useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!user?.id,
  });

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError('Failed to log out: ' + error.message);
    } else {
      showSuccess('You have been logged out.');
      navigate('/login');
    }
  };

  // Helper to determine selected key for menu highlighting
  const getSelectedKey = (pathname: string, search: string) => {
    if (pathname === '/settings') {
      const params = new URLSearchParams(search);
      const tab = params.get('tab');
      if (tab) return `/settings?tab=${tab}`;
      return '/settings?tab=user-management'; // Default settings tab
    }
    if (pathname.startsWith('/work-orders/')) return '/work-orders';
    if (pathname.startsWith('/customers/')) return '/customers';
    if (pathname.startsWith('/assets/')) return '/assets';
    if (pathname.startsWith('/technicians/')) return '/technicians';
    if (pathname.startsWith('/locations/')) return '/locations';
    if (pathname.startsWith('/notifications')) return '/notifications'; // Handle notifications directly
    
    return pathname;
  };

  const selectedKey = getSelectedKey(location.pathname, location.search);

  const displayName = profile?.first_name || user?.email || 'Guest';
  const displayAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url;

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

    // Settings SubMenu
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      children: [
        getItem(<NavLink to="/settings?tab=user-management">User Management</NavLink>, "/settings?tab=user-management"),
        getItem(<NavLink to="/settings?tab=service-sla">Service & SLA</NavLink>, "/settings?tab=service-sla"),
        getItem(<NavLink to="/settings?tab=system-settings">System Settings</NavLink>, "/settings?tab=system-settings"),
      ],
    },

    // Profile SubMenu - now includes Notifications and Logout
    {
      key: 'profile-section',
      icon: <UserOutlined />,
      label: 'Profile',
      className: 'menu-bottom-group', // Apply class here to push to bottom
      children: [
        getItem(<NavLink to="/settings?tab=profile-settings">My Profile</NavLink>, "/settings?tab=profile-settings"),
        getItem(
          <NavLink to="/notifications">
            <Badge count={unreadCount} size="small" offset={[5, 0]} style={{ backgroundColor: '#6A0DAD' }}>
              Notifications
            </Badge>
          </NavLink>,
          "/notifications",
        ),
        { type: 'divider', key: 'profile-divider' },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Logout',
          danger: true,
          onClick: handleLogout,
        },
      ],
    },
  ];

  return (
    <Sider
      collapsed={collapsed}
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
        borderRadius: 8,
      }}
    >
      {/* Logo Area */}
      <NavLink to="/" className="sider-logo-area">
        {logoUrl ? (
          <img src={logoUrl} alt="System Logo" style={{ height: '32px' }} />
        ) : (
          <FireOutlined style={{ color: '#6A0DAD', fontSize: '28px' }} />
        )}
        {!collapsed && (
          <Typography.Title level={4} style={{ margin: 0, color: '#6A0DAD', whiteSpace: 'nowrap' }}>
            GOGO Electric
          </Typography.Title>
        )}
      </NavLink>

      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems} // All items are now passed via the 'items' prop
        className="main-sider-menu"
      >
        {/* No direct <SubMenu> children here anymore */}
      </Menu>

      {/* Custom trigger button */}
      <div className={`sider-custom-trigger ${!collapsed ? 'sider-custom-trigger-expanded' : ''}`}>
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