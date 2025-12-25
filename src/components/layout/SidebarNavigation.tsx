import React from 'react';
import { Layout, Menu, Drawer, Image, theme } from 'antd';
import { Icon } from '@iconify/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSystemSettings } from '@/context/SystemSettingsContext';
// use AntD tokens instead of themeConfig colors

const { Sider } = Layout;

interface SidebarNavigationProps {
  collapsed: boolean;
  visible: boolean;
  onCollapse: (collapsed: boolean) => void;
  onClose: () => void;
  logo?: string;
  isMobile: boolean;
}

const menuItems = [
  {
    key: '/',
    icon: 'si:dashboard',
    label: 'Dashboard',
  },
  {
    key: '/work-orders',
    icon: 'si:file-text',
    label: 'Work Orders',
  },
  {
    key: '/assets',
    icon: 'si:box',
    label: 'Assets',
  },
  {
    key: '/inventory',
    icon: 'si:package',
    label: 'Inventory',
  },
  {
    key: '/technicians',
    icon: 'si:users',
    label: 'Technicians',
  },
  {
    key: '/locations',
    icon: 'si:map-pin',
    label: 'Locations',
  },
  {
    key: '/customers',
    icon: 'si:users',
    label: 'Customers',
  },
  {
    key: '/calendar',
    icon: 'si:calendar',
    label: 'Calendar',
  },
  {
    key: '/analytics',
    icon: 'si:chart',
    label: 'Analytics',
  },
  {
    key: '/settings',
    icon: 'si:settings',
    label: 'Settings',
  },
];

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  collapsed,
  visible,
  onCollapse,
  onClose,
  logo,
  isMobile,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSystemSettings();
  const { token } = theme.useToken();

  const sidebarContent = (
    <>
      <div
        style={{
          padding: collapsed ? '16px 8px' : '16px',
          borderBottom: `1px solid ${token.colorSplit}`,
          marginBottom: '8px',
        }}
      >
        <Image
          src={logo || '/logo.png'}
          alt={settings?.organization_name || 'Logo'}
          preview={false}
          style={{
            height: '32px',
            objectFit: 'contain',
          }}
        />
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems.map(item => ({
          key: item.key,
          icon: <Icon icon={item.icon} style={{ fontSize: '20px' }} />,
          label: item.label,
          onClick: () => {
            navigate(item.key);
            if (isMobile) {
              onClose();
            }
          },
        }))}
      />
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        placement="left"
        closable={false}
        onClose={onClose}
        open={visible}
        width={256}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {sidebarContent}
        </div>
      </Drawer>
    );
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      width={256}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
      }}
    >
      {sidebarContent}
    </Sider>
  );
};

export default SidebarNavigation;