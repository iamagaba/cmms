import React from 'react';
import { Card, Typography, Timeline, Space } from 'antd';
import { MessageOutlined, QuestionCircleOutlined, ToolOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { WorkOrder } from '@/types/supabase';

const { Title, Paragraph, Text } = Typography;

interface WorkOrderServiceLifecycleCardProps {
  workOrder: WorkOrder;
  handleUpdateWorkOrder: (updates: Partial<WorkOrder>) => void;
  usedPartsCount: number;
}

export const WorkOrderServiceLifecycleCard: React.FC<WorkOrderServiceLifecycleCardProps> = ({ workOrder, handleUpdateWorkOrder, usedPartsCount }) => {
  const isServiceCenterChannel = workOrder.channel === 'Service Center';

  // Helper to format date or return 'N/A'
  const formatDate = (dateString: string | null | undefined) =>
    dateString ? dayjs(dateString).format('MMM D, YYYY h:mm A') : 'N/A';

  return (
    <Card title="Service Information">
      <Timeline mode="left" className="work-order-timeline"> {/* Added custom class here */}
        {/* Client Report */}
        <Timeline.Item
          dot={<MessageOutlined />}
          label={<Text type="secondary">{formatDate(workOrder.createdAt)}</Text>}
        >
          <Card size="small" title={<Text strong>Client Report</Text>} bordered style={{ width: '100%' }}>
            <Paragraph editable={{ onChange: (value) => handleUpdateWorkOrder({ clientReport: value }) }} style={{ margin: 0, textAlign: 'left' }}>
              {workOrder.clientReport || <Text type="secondary">No client report provided.</Text>}
            </Paragraph>
          </Card>
        </Timeline.Item>

        {/* Confirmed Issue (Conditional) */}
        {!isServiceCenterChannel && (
          <Timeline.Item
            dot={<QuestionCircleOutlined />}
            label={<Text type="secondary">{formatDate(workOrder.confirmed_at || workOrder.work_started_at || workOrder.createdAt)}</Text>}
          >
            <Card size="small" title={<Text strong>Confirmed Issue</Text>} bordered style={{ width: '100%' }}>
              <Space direction="vertical" style={{ width: '100%', textAlign: 'left' }} size={0}>
                <Text strong>Issue Type:</Text>
                <Paragraph editable={{ onChange: (value) => handleUpdateWorkOrder({ issueType: value }) }} style={{ margin: 0 }}>
                  {workOrder.issueType || <Text type="secondary">No issue confirmed yet.</Text>}
                </Paragraph>
                <Text strong>Confirmation Notes:</Text>
                <Paragraph editable={{ onChange: (value) => handleUpdateWorkOrder({ serviceNotes: value }) }} type="secondary" style={{ margin: 0 }}>
                  {workOrder.serviceNotes || <Text type="secondary">No confirmation notes recorded.</Text>}
                </Paragraph>
              </Space>
            </Card>
          </Timeline.Item>
        )}

        {/* Maintenance Decision */}
        <Timeline.Item
          dot={<ToolOutlined />}
          label={<Text type="secondary">{formatDate(workOrder.completedAt)}</Text>}
          color={workOrder.status === 'Completed' ? 'green' : 'blue'}
        >
          <Card size="small" title={<Text strong>Maintenance Decision</Text>} bordered style={{ width: '100%' }}>
            <Space direction="vertical" style={{ width: '100%', textAlign: 'left' }} size={0}>
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
          </Card>
        </Timeline.Item>
      </Timeline>
    </Card>
  );
};