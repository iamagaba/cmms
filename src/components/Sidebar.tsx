import { NavLink, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  ToolOutlined,
  UsergroupAddOutlined,
  EnvironmentOutlined,
  BarChartOutlined,
  SettingOutlined,
  FireOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

const navItems = [
  { key: "/", label: "Dashboard", icon: <DashboardOutlined /> },
  { key: "/work-orders", label: "Work Orders", icon: <ToolOutlined /> },
  { key: "/technicians", label: "Technicians", icon: <UsergroupAddOutlined /> },
  { key: "/locations", label: "Locations", icon: <EnvironmentOutlined /> },
  { key: "/analytics", label: "Analytics", icon: <BarChartOutlined /> },
  { key: "/settings", label: "Settings", icon: <SettingOutlined /> },
];

interface AppSidebarProps {
  collapsed: boolean;
}

const AppSidebar = ({ collapsed }: AppSidebarProps) => {
  const location = useLocation();

  return (
    <Sider trigger={null} collapsible collapsed={collapsed}>
      <div style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}>
         <FireOutlined style={{color: '#fff', fontSize: '20px'}} />
         {!collapsed && <span style={{color: '#fff', marginLeft: '8px', fontWeight: 'bold'}}>GOGO Electric</span>}
      </div>
      <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]}>
        {navItems.map(item => (
          <Menu.Item key={item.key} icon={item.icon}>
            <NavLink to={item.key}>{item.label}</NavLink>
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
};

export default AppSidebar;