import React from 'react';
import { Card, Typography } from 'antd';
import { WorkOrder } from '@/types/supabase';

const { Title, Paragraph } = Typography;

interface WorkOrderServiceInfoCardProps {
  workOrder: WorkOrder;
  handleUpdateWorkOrder: (updates: Partial<WorkOrder>) => void;
}

export const WorkOrderServiceInfoCard: React.FC<WorkOrderServiceInfoCardProps> = ({ workOrder, handleUpdateWorkOrder }) => {
  return (
    <Card title="Service Information">
      <Title level={5} editable={{ onChange: (value) => handleUpdateWorkOrder({ service: value }) }}>
        {workOrder.service}
      </Title>
      <Paragraph editable={{ onChange: (value) => handleUpdateWorkOrder({ serviceNotes: value }) }} type="secondary">
        {workOrder.serviceNotes}
      </Paragraph>
    </Card>
  );
};