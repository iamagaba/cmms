import React from 'react';
import { Card, Descriptions, Typography, Space } from 'antd';
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import dayjs from 'dayjs';
import { WorkOrder, Technician, Location } from '@/types/supabase';
import { Link } from 'react-router-dom';

const { Text } = Typography;

interface WorkOrderAppointmentCardProps {
  workOrder: WorkOrder;
  technician: Technician | null;
  location: Location | null;
}

export const WorkOrderAppointmentCard: React.FC<WorkOrderAppointmentCardProps> = ({ workOrder, technician, location }) => {
  if (!workOrder.appointmentDate) {
    return null; // Only show this card if an appointment date is set
  }

  return (
    <Card size="small" title="Appointment Details">
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label={<Space><Icon icon="ph:calendar-fill" /> Date & Time</Space>} labelStyle={{ width: '150px' }}>
          <Text strong>{dayjs(workOrder.appointmentDate).format('MMM D, YYYY h:mm A')}</Text>
        </Descriptions.Item>
        <Descriptions.Item label={<Space><Icon icon="ph:user-fill" /> Assigned Technician</Space>} labelStyle={{ width: '150px' }}>
          {technician ? (
            <Link to={`/technicians/${technician.id}`}>{technician.name}</Link>
          ) : (
            <Text type="secondary">Unassigned</Text>
          )}
        </Descriptions.Item>
        <Descriptions.Item label={<Space><Icon icon="ph:map-pin-fill" /> Service Location</Space>} labelStyle={{ width: '150px' }}>
          {location ? (
            <Link to={`/locations/${location.id}`}>{location.name.replace(' Service Center', '')}</Link>
          ) : (
            <Text type="secondary">N/A</Text>
          )}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};