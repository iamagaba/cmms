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
} from '@ant-design/icons';

const { Sider } = Layout;
const { Title } = Typography;

const navGroups = [
  [
    { key: "/", label: "Dashboard", icon: <DashboardOutlined /> },
    { key: "/work-orders", label: "Work Orders", icon: <ToolOutlined /> },
  ],
  [
    { key: "/customers", label: "Customers", icon: <ContactsOutlined /> },
    { key: "/assets", label: "Assets", icon: <CarOutlined /> },
    { key: "/technicians", label: "Technicians", icon: <UsergroupAddOutlined /> },
    { key: "/locations", label: "Locations", icon: <EnvironmentOutlined /> },
    { key: "/inventory", label: "Inventory", icon: <ShoppingOutlined /> },
  ],
  [
    { key: "/analytics", label: "Analytics", icon: <BarChartOutlined /> },
    { key: "/settings", label: "Settings", icon: <SettingOutlined /> },
  ]
];

interface SideNavigationProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  logoUrl: string | null;
}

const SideNavigation = ({ collapsed, onCollapse, logoUrl }: SideNavigationProps) => {
  const location = useLocation();

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse} theme="light" width={220}>
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 16px',
      }}>
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '12px', overflow: 'hidden' }}>
          {logoUrl ? (
            <img src={logoUrl} alt="System Logo" style={{ height: '32px', transition: 'all 0.2s' }} />
          ) : (
            <FireOutlined style={{ color: '#6A0DAD', fontSize: '28px', transition: 'all 0.2s' }} />
          )}
          {!collapsed && (
            <Title level={5} style={{ margin: 0, color: '#6A0DAD', whiteSpace: 'nowrap' }}>
              GOGO Electric
            </Title>
          )}
        </NavLink>
      </div>
      <Menu theme="light" mode="inline" selectedKeys={[location.pathname]} style={{ borderRight: 0 }}>
        {navGroups.map((group, index) => (
          <React.Fragment key={index}>
            {index > 0 && <Menu.Divider />}
            {group.map(item => (
              <Menu.Item key={item.key} icon={item.icon}>
                <NavLink to={item.key}>{item.label}</NavLink>
              </Menu.Item>
            ))}
          </React.Fragment>
        ))}
      </Menu>
    </Sider>
  );
};

export default SideNavigation;