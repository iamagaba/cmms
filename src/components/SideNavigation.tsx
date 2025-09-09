import React from 'react';
import { Layout, Menu, Typography } from 'antd';
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

const { Sider } = Layout;
const { Title } = Typography;

interface SideNavigationProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  logoUrl: string | null;
}

const SideNavigation = ({ collapsed, onCollapse, logoUrl }: SideNavigationProps) => {
  const location = useLocation();

  const mainMenuItems = [
    { key: "/", label: "Dashboard", icon: <DashboardOutlined /> },
    { key: "/work-orders", label: "Work Orders", icon: <ToolOutlined /> },
    { type: 'divider' as const },
    { key: "/customers", label: "Customers", icon: <ContactsOutlined /> },
    { key: "/assets", label: "Assets", icon: <CarOutlined /> },
    { key: "/technicians", label: "Technicians", icon: <UsergroupAddOutlined /> },
    { key: "/locations", label: "Locations", icon: <EnvironmentOutlined /> },
    { key: "/inventory", label: "Inventory", icon: <ShoppingOutlined /> },
    { type: 'divider' as const },
    { key: "/analytics", label: "Analytics", icon: <BarChartOutlined /> },
  ].map(item => {
    if (item.type === 'divider') return { type: 'divider' };
    return {
      key: item.key,
      icon: item.icon,
      label: <NavLink to={item.key}>{item.label}</NavLink>,
    };
  });

  const bottomMenuItems = [
    { key: "/notifications", label: "Notifications", icon: <BellOutlined /> },
    { key: "/settings?tab=profile-settings", label: "Profile", icon: <UserOutlined /> },
    { key: "/settings?tab=system-settings", label: "Settings", icon: <SettingOutlined /> },
  ].map(item => ({
    key: item.key,
    icon: item.icon,
    label: <NavLink to={item.key}>{item.label}</NavLink>,
  }));

  // Determine selected key for menu items, handling query params for settings
  const getSelectedKey = (pathname: string, search: string) => {
    if (pathname === '/settings') {
      const params = new URLSearchParams(search);
      const tab = params.get('tab');
      if (tab === 'profile-settings') return '/settings?tab=profile-settings';
      if (tab === 'system-settings') return '/settings?tab=system-settings';
      if (tab === 'user-management') return '/settings?tab=user-management'; // Also handle user management tab
    }
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
        style={{ borderRight: 0, flexGrow: 1, overflowY: 'auto' }}
        items={mainMenuItems}
      />
      <Menu.Divider style={{ margin: '0 0 8px 0' }} />
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{ borderRight: 0, flexShrink: 0 }}
        items={bottomMenuItems}
      />
    </Sider>
  );
};

export default SideNavigation;