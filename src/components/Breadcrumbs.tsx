import { Breadcrumb, Typography, Space, Input, Affix } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';

const { Text } = Typography;

const breadcrumbNameMap: Record<string, { label: string; icon?: React.ReactNode }> = {
  'work-orders': { label: 'Work Orders', icon: <Icon icon="ph:wrench-fill" /> },
  'technicians': { label: 'Technicians', icon: <Icon icon="ph:users-fill" /> },
  'locations': { label: 'Locations', icon: <Icon icon="ph:map-pin-fill" /> },
  'assets': { label: 'Assets', icon: <Icon icon="ph:car-fill" /> },
  'customers': { label: 'Customers', icon: <Icon icon="ph:address-book-fill" /> },
  'inventory': { label: 'Inventory', icon: <Icon icon="ph:shopping-bag-fill" /> },
  'analytics': { label: 'Analytics', icon: <Icon icon="ph:chart-bar-fill" /> },
  'settings': { label: 'Settings', icon: <Icon icon="ph:gear-fill" /> },
  'notifications': { label: 'Notifications', icon: <Icon icon="ph:bell-fill" /> },
  'calendar': { label: 'Calendar', icon: <Icon icon="ph:calendar-fill" /> },
  'map-view': { label: 'Map View', icon: <Icon icon="ph:map-fill" /> },
}

interface AppBreadcrumbProps {
  actions?: React.ReactNode;
  backButton?: React.ReactNode;
  onSearch?: (value: string) => void;
}

const { Search } = Input;


const AppBreadcrumb: React.FC<AppBreadcrumbProps> = ({ actions, backButton, onSearch }) => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter(i => i);

  if (location.pathname === '/login') return null;

  // Only show global search on the dashboard page
  const showGlobalSearch = location.pathname === '/';

  const extraBreadcrumbItems = pathSnippets.map((snippet, idx) => {
    const url = `/${pathSnippets.slice(0, idx + 1).join('/')}`;
    const map = breadcrumbNameMap[snippet];
    return (
      <Breadcrumb.Item key={url}>
        {map?.icon && <span style={{ marginRight: 6 }}>{map.icon}</span>}
        {idx !== pathSnippets.length - 1 ? <Link to={url}>{map?.label || snippet}</Link> : <Text strong>{map?.label || snippet}</Text>}
      </Breadcrumb.Item>
    );
  });

  return (
    <Affix offsetTop={0}>
      <div className="sticky-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          {backButton}
          <Breadcrumb>
            <Breadcrumb.Item key="home">
              <Link to="/"><Icon icon="ph:house-fill" /></Link>
            </Breadcrumb.Item>
            {extraBreadcrumbItems}
          </Breadcrumb>
        </Space>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {showGlobalSearch && (
            <Search
              placeholder="Search work orders, assets, locations..."
              allowClear
              onSearch={onSearch}
              style={{ maxWidth: 350 }}
            />
          )}
          {actions}
        </div>
      </div>
    </Affix>
  );
};

export default AppBreadcrumb;