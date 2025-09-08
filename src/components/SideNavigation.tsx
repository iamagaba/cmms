import React from 'react';
import { Layout, Menu } from 'antd';
import { NavLink, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ToolOutlined,
  UsergroupAddOutlined,
  EnvironmentOutlined,
  BarChartOutlined,
  GlobalOutlined, // Re-added
  CalendarOutlined, // Re-added
  SettingOutlined,
  CarOutlined,
  ShoppingOutlined,
  ContactsOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const navGroups = [
  [
    { key: "/", label: "Dashboard", icon: <DashboardOutlined /> },
    { key: "/work-orders", label: "Work Orders", icon: <ToolOutlined /> },
    { key: "/calendar", label: "Calendar", icon: <CalendarOutlined /> }, // Re-added
    { key: "/map", label: "Map View", icon: <GlobalOutlined /> }, // Re-added
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
}

const SideNavigation = ({ collapsed, onCollapse }: SideNavigationProps) => {
  const location = useLocation();

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse} theme="light" width={200}>
      <Menu theme="light" mode="inline" selectedKeys={[location.pathname]} style={{ marginTop: '16px' }}>
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