import React from 'react';
import { Layout, Menu } from 'antd';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  DashboardOutlined,
  ToolOutlined,
  UsergroupAddOutlined,
  EnvironmentOutlined,
  BarChartOutlined,
  GlobalOutlined,
  CalendarOutlined,
  SettingOutlined,
  FireOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const navGroups = [
  [
    { key: "/", label: "Dashboard", icon: <DashboardOutlined /> },
    { key: "/work-orders", label: "Work Orders", icon: <ToolOutlined /> },
    { key: "/calendar", label: "Calendar", icon: <CalendarOutlined /> },
    { key: "/map", label: "Map View", icon: <GlobalOutlined /> },
  ],
  [
    { key: "/technicians", label: "Technicians", icon: <UsergroupAddOutlined /> },
    { key: "/locations", label: "Locations", icon: <EnvironmentOutlined /> },
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
      <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
        {!collapsed && (
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <FireOutlined style={{color: '#6A0DAD', fontSize: '24px'}} />
            <span style={{color: '#6A0DAD', marginLeft: '8px', fontWeight: 'bold', fontSize: '18px'}}>GOGO</span>
          </Link>
        )}
      </div>
      <Menu theme="light" mode="inline" selectedKeys={[location.pathname]}>
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