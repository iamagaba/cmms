import React from 'react';
import { Layout, Menu, Typography, Button, Avatar, Tooltip, Dropdown, theme } from 'antd';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  ToolOutlined,
  ContactsOutlined,
  CarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useSession } from '@/context/SessionContext';
import { Icon } from '@iconify/react';

const { Sider } = Layout;

interface SideNavigationProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  logoUrl: string | null;
  isDarkMode: boolean;
  onThemeChange: (isDark: boolean) => void;
}

type MenuItemWithRoles = Required<MenuProps>['items'][number] & {
  roles?: string[];
};

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItemWithRoles[],
  roles: string[] = []
): MenuItemWithRoles {
  return { key, icon, children, label, roles } as MenuItemWithRoles;
}

const SideNavigation = ({ collapsed, onCollapse, logoUrl, isDarkMode, onThemeChange }: SideNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { session } = useSession();
  const userRole = session?.user?.user_metadata?.role || 'technician';

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError('Failed to log out: ' + error.message);
    } else {
      showSuccess('You have been logged out.');
      navigate('/login');
    }
  };

  const getSelectedKey = (pathname: string) => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 1 && parts[0] !== 'settings') {
      return `/${parts[0]}`;
    }
    return pathname;
  };

  const selectedKey = getSelectedKey(location.pathname);

  const allMenuItems: (MenuItemWithRoles | { type: 'divider' | 'group', label?: string, key?: string, roles?: string[] })[] = [
    getItem(<NavLink to="/">Dashboard</NavLink>, '/', <DashboardOutlined />, undefined, ['admin', 'manager', 'technician', 'maintenance_frontdesk', 'maintenance_backoffice', 'superadmin']),
    getItem(<NavLink to="/work-orders">Work Orders</NavLink>, '/work-orders', <ToolOutlined />, undefined, ['admin', 'manager', 'technician', 'maintenance_frontdesk', 'maintenance_backoffice', 'call_center_agent', 'superadmin']),
    getItem(<NavLink to="/scheduling">Scheduling</NavLink>, '/scheduling', <CalendarOutlined />, undefined, ['admin', 'manager', 'maintenance_frontdesk', 'superadmin']),
    { type: 'divider', roles: ['admin', 'manager', 'technician', 'maintenance_frontdesk', 'maintenance_backoffice', 'call_center_agent', 'superadmin'] },
    { type: 'group', label: collapsed ? '' : 'Resources', key: 'grp-resources', roles: ['admin', 'manager', 'technician', 'maintenance_frontdesk', 'maintenance_backoffice', 'call_center_agent', 'superadmin'] },
    getItem(<NavLink to="/assets">Assets</NavLink>, '/assets', <CarOutlined />, undefined, ['admin', 'manager', 'technician', 'maintenance_frontdesk', 'maintenance_backoffice', 'call_center_agent', 'superadmin']),
    getItem(<NavLink to="/inventory">Inventory</NavLink>, '/inventory', <ShoppingOutlined />, undefined, ['admin', 'manager', 'maintenance_backoffice', 'maintenance_frontdesk', 'technician', 'superadmin']),
    getItem(<NavLink to="/customers">Customers</NavLink>, '/customers', <ContactsOutlined />, undefined, ['admin', 'manager', 'maintenance_frontdesk', 'call_center_agent', 'superadmin']),
    getItem(<NavLink to="/technicians">Technicians</NavLink>, '/technicians', <TeamOutlined />, undefined, ['admin', 'manager', 'maintenance_frontdesk', 'superadmin']),
    getItem(<NavLink to="/locations">Locations</NavLink>, '/locations', <EnvironmentOutlined />, undefined, ['admin', 'manager', 'maintenance_frontdesk', 'maintenance_backoffice', 'superadmin']),
    { type: 'divider', roles: ['admin', 'manager', 'superadmin'] },
    { type: 'group', label: collapsed ? '' : 'Analysis', key: 'grp-analysis', roles: ['admin', 'manager', 'superadmin'] },
    getItem(<NavLink to="/analytics">Analytics</NavLink>, '/analytics', <BarChartOutlined />, undefined, ['admin', 'manager', 'superadmin']),
    { type: 'divider', roles: ['admin', 'manager', 'technician', 'maintenance_frontdesk', 'maintenance_backoffice', 'call_center_agent', 'superadmin'] },
    getItem(<NavLink to="/settings">Settings</NavLink>, '/settings', <SettingOutlined />, undefined, ['admin', 'manager', 'technician', 'maintenance_frontdesk', 'maintenance_backoffice', 'call_center_agent', 'superadmin']),
  ];

  const menuItems = allMenuItems.filter(item => {
    if (item.roles) {
      return item.roles.includes(userRole);
    }
    return true; // for dividers and groups
  });

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} danger onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      theme="light"
      width={220}
      collapsedWidth={64}
      className="ht-sider"
      style={{
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
      }}
      trigger={null} // We use a custom trigger
    >
      {/* Logo Section */}
      <div
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: `0 ${collapsed ? 16 : 24}px`,
          flexShrink: 0,
        }}
      >
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={logoUrl || '/favicon.ico'} alt="Logo" style={{ height: 32, width: 32 }} />
          {!collapsed && (
            <Typography.Title level={4} style={{ margin: 0, color: token.colorPrimary, whiteSpace: 'nowrap' }}>
              GOGO Electric
            </Typography.Title>
          )}
        </NavLink>
      </div>

      {/* Menu Section (Scrollable) */}
      <div style={{ flex: '1 1 auto', overflowY: 'auto', overflowX: 'hidden' }}>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </div>

      {/* Bottom User Profile Section (Fixed) */}
      <div className="user-profile" style={{ 
        flexShrink: 0, 
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer 
      }}>
        <div style={{ padding: collapsed ? '4px' : '4px 8px' }}>
          {/* User Profile Dropdown */}
          <Dropdown overlay={userMenu} placement="topRight" trigger={['click']}>
            <Button type="text" style={{ 
              width: '100%', 
              height: collapsed ? 48 : 56,
              padding: collapsed ? '8px' : '8px 16px', 
              background: 'transparent',
              borderRadius: 6,
              transition: 'all 0.2s ease',
              margin: 0
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: collapsed ? 0 : 12, 
                justifyContent: collapsed ? 'center' : 'flex-start' 
              }}>
                <Avatar size={collapsed ? 32 : 36} src={session?.user?.user_metadata?.avatar_url}>
                  {session?.user?.user_metadata?.full_name?.[0] || session?.user?.email?.[0]}
                </Avatar>
                {!collapsed && (
                  <div style={{ textAlign: 'left', overflow: 'hidden', flex: 1 }}>
                    <Typography.Text strong ellipsis style={{ display: 'block', fontSize: 14 }}>
                      {session?.user?.user_metadata?.full_name || 'User'}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {session?.user?.user_metadata?.role === 'superadmin' ? 'Super Admin' : 
                       session?.user?.user_metadata?.role?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Technician'}
                    </Typography.Text>
                  </div>
                )}
              </div>
            </Button>
          </Dropdown>
        </div>
      </div>

      {/* Bottom System Controls (Fixed) */}
      <div className="bottom-controls" style={{
        flexShrink: 0,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgElevated,
        padding: collapsed ? '8px 4px' : '8px',
        marginTop: 'auto',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'space-between',
          alignItems: 'center',
          gap: collapsed ? 8 : 12,
        }}>
          <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'} placement="top">
            <Button
              type="text"
              size="small"
              icon={<Icon icon={isDarkMode ? 'ph:sun-fill' : 'ph:moon-fill'} width={16} />}
              onClick={() => onThemeChange(!isDarkMode)}
              style={{ borderRadius: 6, width: 32, height: 32 }}
            />
          </Tooltip>
          <Tooltip title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'} placement="top">
            <Button
              type="text"
              size="small"
              icon={<Icon icon={collapsed ? 'ph:arrow-line-right-bold' : 'ph:arrow-line-left-bold'} width={16} />}
              onClick={() => onCollapse(!collapsed)}
              style={{ borderRadius: 6, width: 32, height: 32 }}
            />
          </Tooltip>
        </div>
      </div>
    </Sider>
  );
};

export default SideNavigation;