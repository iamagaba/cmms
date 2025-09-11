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
import { useSession } from '@/context/SessionContext';
import { useQuery } from '@tanstack/react-query';
import { Profile } from '@/types/supabase';

const { Sider } = Layout;
const { Title, Text } = Typography;
const { SubMenu } = Menu; // Destructure SubMenu

interface SideNavigationProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
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

const SideNavigation = ({ collapsed, onCollapse }: SideNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useSession();
  const user = session?.user;

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
  ];

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
    
    return pathname;
  };

  const selectedKey = getSelectedKey(location.pathname, location.search);

  const displayName = profile?.first_name || user?.email || 'Guest';
  const displayAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url;

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
      {/* Removed logo area from here, now in GlobalHeader */}
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        className="main-sider-menu"
      >
        {/* Add the Settings SubMenu */}
        <SubMenu key="/settings" icon={<SettingOutlined />} title="Settings">
          <Menu.Item key="/settings?tab=user-management">
            <NavLink to="/settings?tab=user-management">User Management</NavLink>
          </Menu.Item>
          <Menu.Item key="/settings?tab=service-sla">
            <NavLink to="/settings?tab=service-sla">Service & SLA</NavLink>
          </Menu.Item>
          <Menu.Item key="/settings?tab=system-settings">
            <NavLink to="/settings?tab=system-settings">System Settings</NavLink>
          </Menu.Item>
          <Menu.Item key="/settings?tab=profile-settings">
            <NavLink to="/settings?tab=profile-settings">My Profile</NavLink>
          </Menu.Item>
        </SubMenu>
      </Menu>

      {/* Persistent User Info at the bottom */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {isLoadingProfile ? (
          <Spin size="small" />
        ) : (
          <>
            <Avatar size="default" src={displayAvatar || undefined} icon={<UserOutlined />} />
            {!collapsed && <Text strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</Text>}
          </>
        )}
      </div>

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