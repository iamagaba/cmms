import React, { useState } from 'react';
import { Card, Descriptions, Typography, theme } from 'antd';
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { WorkOrder, Customer, Vehicle } from '@/types/supabase';

const { Text } = Typography;

interface WorkOrderCustomerVehicleCardProps {
  workOrder: WorkOrder;
  customer: Customer | null;
  vehicle: Vehicle | null;
}

export const WorkOrderCustomerVehicleCard: React.FC<WorkOrderCustomerVehicleCardProps> = ({ customer, vehicle }) => {
  const { token } = theme.useToken();
  const [cardHover, setCardHover] = useState(false);
  const cardStyle = {
    borderRadius: 16,
    background: token.colorBgContainer,
    border: `1px solid ${cardHover ? token.colorBorder : token.colorSplit}`,
    boxShadow: cardHover ? token.boxShadowSecondary : token.boxShadowTertiary,
    transition: 'box-shadow 0.18s, border 0.18s, background 0.18s',
  } as React.CSSProperties;

  return (
    <Card
      title="Customer & Vehicle Details"
      style={cardStyle}
      bodyStyle={{ padding: 16 }}
      onMouseEnter={() => setCardHover(true)}
      onMouseLeave={() => setCardHover(false)}
    >
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Customer" labelStyle={{ width: '150px' }}>
          <Text>{customer?.name || 'N/A'}</Text>
        </Descriptions.Item>
        <Descriptions.Item label={<><Icon icon="ph:phone-fill" /> Phone</>} labelStyle={{ width: '150px' }}>
          <Text>{customer?.phone || 'N/A'}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Vehicle" labelStyle={{ width: '150px' }}>
          <Text>{vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'N/A'}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="VIN" labelStyle={{ width: '150px' }}>
          <Text code>{vehicle?.vin || 'N/A'}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="License Plate" labelStyle={{ width: '150px' }}>
          <Text>{vehicle?.license_plate || 'N/A'}</Text>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};