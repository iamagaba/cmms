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
    <Card title="Appointment Details">
      <Descriptions column={1} bordered>
        <Descriptions.Item label={<><Icon icon="si:calendar" /> Date & Time</>} labelStyle={{ width: '150px' }}>
          <Text strong>{dayjs(workOrder.appointmentDate).format('MMM D, YYYY h:mm A')}</Text>
        </Descriptions.Item>
        <Descriptions.Item label={<><Icon icon="si:user" /> Assigned Technician</>} labelStyle={{ width: '150px' }}>
          {technician ? (
            <Link to={`/technicians/${technician.id}`}>{technician.name}</Link>
          ) : (
            <Text type="secondary">Unassigned</Text>
          )}
        </Descriptions.Item>
        <Descriptions.Item label={<><Icon icon="si:map-pin" /> Service Location</>} labelStyle={{ width: '150px' }}>
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