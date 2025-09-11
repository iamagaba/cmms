import React from 'react';
import { Card, Descriptions, Typography } from 'antd';
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { WorkOrder, Customer, Vehicle } from '@/types/supabase';

const { Text } = Typography;

interface WorkOrderCustomerVehicleCardProps {
  workOrder: WorkOrder;
  customer: Customer | null;
  vehicle: Vehicle | null;
}

export const WorkOrderCustomerVehicleCard: React.FC<WorkOrderCustomerVehicleCardProps> = ({ workOrder, customer, vehicle }) => {
  return (
    <Card title="Customer & Vehicle Details">
      <Descriptions column={1} bordered>
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