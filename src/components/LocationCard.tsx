import { Card, Typography, Space, Badge, Dropdown, Menu, Button, theme } from 'antd';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Location, WorkOrder } from '@/types/supabase';

const { Title } = Typography;

interface LocationCardProps {
  location: Location;
  workOrders: WorkOrder[];
}

export const LocationCard = ({ location, workOrders }: LocationCardProps) => {
  const openWorkOrders = workOrders.filter(wo => wo.locationId === location.id && wo.status !== 'Completed').length;
  const navigate = useNavigate();
  const [cardHover, setCardHover] = useState(false);
  const { token } = theme.useToken();
  const [menuHover, setMenuHover] = useState(false);

  const handleCardClick = () => {
    navigate(`/locations/${location.id}`);
  };

  const menu = (
    <Menu>
      <Menu.Item
        key="view"
        icon={<Icon icon="ph:map-pin-line" />}
        onClick={(e) => { e.domEvent.stopPropagation(); navigate(`/locations/${location.id}`); }}
      >
        View Details
      </Menu.Item>
    </Menu>
  );

  const cardStyle = {
    height: '100%',
    cursor: 'pointer',
    padding: 0,
    minWidth: 0,
    borderRadius: token.borderRadiusLG,
    background: token.colorBgContainer,
    border: cardHover ? `1.5px solid ${token.colorBorder}` : `1px solid ${token.colorSplit}`,
    boxShadow: cardHover ? token.boxShadowSecondary : token.boxShadowTertiary,
    transition: 'box-shadow 0.18s, border 0.18s',
  } as React.CSSProperties;

  return (
  <Card size="small"
      hoverable
      className="lift-on-hover location-card-responsive"
      style={cardStyle}
      bodyStyle={{ padding: 20 }}
      onMouseEnter={() => setCardHover(true)}
      onMouseLeave={() => setCardHover(false)}
      onClick={handleCardClick}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <Title level={5} style={{ margin: 0 }}>
            {location.name.replace(' Service Center', '')}
          </Title>
          <Typography.Text type="secondary" style={{ display: 'block', marginTop: 8, marginBottom: 16 }}>
            <Icon icon="ph:map-pin-fill" style={{ marginRight: 8 }} />
            {location.address}
          </Typography.Text>
        </div>
        <Dropdown overlay={menu} trigger={["click"]}>
          <Button
            type="text"
            icon={
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: menuHover ? token.colorPrimary : 'transparent',
                  transition: 'background 0.18s',
                }}
                onMouseEnter={() => setMenuHover(true)}
                onMouseLeave={() => setMenuHover(false)}
                onClick={(e) => e.stopPropagation()}
              >
                <Icon icon="ph:dots-three-horizontal-fill" color={menuHover ? token.colorTextLightSolid : token.colorPrimary} width={22} height={22} />
              </span>
            }
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: 0,
              background: 'none',
              border: 'none',
              boxShadow: 'none',
              minWidth: 0,
              minHeight: 0,
              lineHeight: 1,
            }}
          />
        </Dropdown>
      </div>
      <Space>
  <Badge count={openWorkOrders} showZero color={token.colorPrimary} />
        <Typography.Text>Open Work Orders</Typography.Text>
      </Space>
    </Card>
  );
};