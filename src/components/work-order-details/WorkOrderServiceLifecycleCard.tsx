import React from 'react';
import { Card, Typography, Descriptions, Tag, Space } from 'antd';
import { WorkOrder } from '@/types/supabase';

const { Title, Paragraph, Text } = Typography;

interface WorkOrderServiceLifecycleCardProps {
  workOrder: WorkOrder;
  handleUpdateWorkOrder: (updates: Partial<WorkOrder>) => void;
  usedPartsCount: number;
}

export const WorkOrderServiceLifecycleCard: React.FC<WorkOrderServiceLifecycleCardProps> = ({ workOrder, handleUpdateWorkOrder, usedPartsCount }) => {
  const isServiceCenterChannel = workOrder.channel === 'Service Center';

  return (
    <Card title="Service Information">
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label={<Text strong>Client Report</Text>}>
          <Paragraph editable={{ onChange: (value) => handleUpdateWorkOrder({ clientReport: value }) }} style={{ margin: 0 }}>
            {workOrder.clientReport || <Text type="secondary">No client report provided.</Text>}
          </Paragraph>
        </Descriptions.Item>

        {!isServiceCenterChannel && (
          <Descriptions.Item label={<Text strong>Confirmed Issue</Text>}>
            <Paragraph editable={{ onChange: (value) => handleUpdateWorkOrder({ issueType: value }) }} style={{ margin: 0 }}>
              {workOrder.issueType || <Text type="secondary">No issue confirmed yet.</Text>}
            </Paragraph>
          </Descriptions.Item>
        )}

        <Descriptions.Item label={<Text strong>Maintenance Decision</Text>}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Fault Code:</Text>
            <Paragraph editable={{ onChange: (value) => handleUpdateWorkOrder({ faultCode: value }) }} style={{ margin: 0 }}>
              {workOrder.faultCode || <Text type="secondary">No fault code recorded.</Text>}
            </Paragraph>
            <Text strong>Repair Notes:</Text>
            <Paragraph editable={{ onChange: (value) => handleUpdateWorkOrder({ maintenanceNotes: value }) }} type="secondary" style={{ margin: 0 }}>
              {workOrder.maintenanceNotes || <Text type="secondary">No maintenance notes recorded.</Text>}
            </Paragraph>
            <Text strong>Parts Used:</Text>
            <Text>{usedPartsCount} items recorded</Text>
          </Space>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};