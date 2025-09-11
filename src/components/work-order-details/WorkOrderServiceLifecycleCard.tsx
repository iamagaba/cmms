import React from 'react';
import { Card, Typography, Space } from 'antd';
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
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Client Report Section */}
        <Card size="small" title={<Text strong>Client Report</Text>} bordered>
          <Paragraph editable={{ onChange: (value) => handleUpdateWorkOrder({ clientReport: value }) }} style={{ margin: 0, textAlign: 'left' }}>
            {workOrder.clientReport || <Text type="secondary">No client report provided.</Text>}
          </Paragraph>
        </Card>

        {/* Confirmed Issue Section (Conditional) */}
        {!isServiceCenterChannel && (
          <Card size="small" title={<Text strong>Confirmed Issue</Text>} bordered>
            <Space direction="vertical" style={{ width: '100%', textAlign: 'left' }}>
              <Text strong>Issue Type:</Text>
              <Paragraph editable={{ onChange: (value) => handleUpdateWorkOrder({ issueType: value }) }} style={{ margin: 0, textAlign: 'left' }}>
                {workOrder.issueType || <Text type="secondary">No issue confirmed yet.</Text>}
              </Paragraph>
              <Text strong>Confirmation Notes:</Text>
              <Paragraph editable={{ onChange: (value) => handleUpdateWorkOrder({ serviceNotes: value }) }} type="secondary" style={{ margin: 0, textAlign: 'left' }}>
                {workOrder.serviceNotes || <Text type="secondary">No confirmation notes recorded.</Text>}
              </Paragraph>
            </Space>
          </Card>
        )}

        {/* Maintenance Decision Section */}
        <Card size="small" title={<Text strong>Maintenance Decision</Text>} bordered>
          <Space direction="vertical" style={{ width: '100%', textAlign: 'left' }}>
            <Text strong>Fault Code:</Text>
            <Paragraph editable={{ onChange: (value) => handleUpdateWorkOrder({ faultCode: value }) }} style={{ margin: 0, textAlign: 'left' }}>
              {workOrder.faultCode || <Text type="secondary">No fault code recorded.</Text>}
            </Paragraph>
            <Text strong>Repair Notes:</Text>
            <Paragraph editable={{ onChange: (value) => handleUpdateWorkOrder({ maintenanceNotes: value }) }} type="secondary" style={{ margin: 0, textAlign: 'left' }}>
              {workOrder.maintenanceNotes || <Text type="secondary">No maintenance notes recorded.</Text>}
            </Paragraph>
            <Text strong>Parts Used:</Text>
            <Text>{usedPartsCount} items recorded</Text>
          </Space>
        </Card>
      </Space>
    </Card>
  );
};