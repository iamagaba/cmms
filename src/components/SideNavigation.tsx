import React, { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
import { NavLink, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ToolOutlined,
  UsergroupAddOutlined,
  EnvironmentOutlined,
  BarChartOutlined,
  GlobalOutlined,
  CalendarOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;
const { Text } = Typography;

const navItems = [
  { key: "/", label: "Dashboard", icon: <DashboardOutlined /> },
  { key: "/work-orders", label: "Work Orders", icon: <ToolOutlined /> },
  { key: "/calendar", label: "Calendar", icon: <CalendarOutlined /> },
  { key: "/map", label: "Map View", icon: <GlobalOutlined /> },
  { key: "/technicians", label: "Technicians", icon: <UsergroupAddOutlined /> },
  { key: "/locations", label: "Locations", icon: <EnvironmentOutlined /> },
  { key: "/analytics", label: "Analytics", icon: <BarChartOutlined /> },
  { key: "/settings", label: "Settings", icon: <SettingOutlined /> },
];

interface SideNavigationProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const SideNavigation = ({ collapsed, onCollapse }: SideNavigationProps) => {
  const location = useLocation();

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse} theme="light" width={220}>
      <div className="demo-logo-vertical" />
      <Menu theme="light" mode="inline" selectedKeys={[location.pathname]}>
        {navItems.map(item => (
          <Menu.Item key={item.key} icon={item.icon}>
            <NavLink to={item.key}>{item.label}</NavLink>
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
};

export default SideNavigation;