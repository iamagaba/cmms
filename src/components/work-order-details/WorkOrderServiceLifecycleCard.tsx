import React from 'react';
import { Card, Typography, Space } from 'antd';
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
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Client Report Card */}
        <Card
          size="small"
          title={
            <Space>
              <MessageOutlined />
              <Text strong>Client Report</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{formatDate(workOrder.createdAt)}</Text>
            </Space>
          }
          bordered
          style={{ width: '100%' }}
        >
          {workOrder.clientReport ? (
            <Paragraph style={{ margin: 0, textAlign: 'left' }}>
              {workOrder.clientReport}
            </Paragraph>
          ) : (
            <Text type="secondary">No client report provided.</Text>
          )}
        </Card>

        {/* Confirmed Issue Card (Conditional) */}
        {!isServiceCenterChannel && (
          <Card
            size="small"
            title={
              <Space>
                <QuestionCircleOutlined />
                <Text strong>Confirmed Issue</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{formatDate(workOrder.confirmed_at || workOrder.work_started_at || workOrder.createdAt)}</Text>
              </Space>
            }
            bordered
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%', textAlign: 'left' }} size={0}>
              {workOrder.issueType && (
                <>
                  <Text strong>Issue Type:</Text>
                  <Paragraph style={{ margin: 0 }}>
                    {workOrder.issueType}
                  </Paragraph>
                </>
              )}
              {workOrder.serviceNotes && (
                <>
                  <Text strong>Confirmation Notes:</Text>
                  <Paragraph type="secondary" style={{ margin: 0 }}>
                    {workOrder.serviceNotes}
                  </Paragraph>
                </>
              )}
              {!workOrder.issueType && !workOrder.serviceNotes && (
                <Text type="secondary">No issue confirmed yet.</Text>
              )}
            </Space>
          </Card>
        )}

        {/* Maintenance Decision Card */}
        <Card
          size="small"
          title={
            <Space>
              <ToolOutlined />
              <Text strong>Maintenance Decision</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{formatDate(workOrder.completedAt)}</Text>
            </Space>
          }
          bordered
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%', textAlign: 'left' }} size={0}>
            {workOrder.faultCode && (
              <>
                <Text strong>Fault Code:</Text>
                <Paragraph style={{ margin: 0 }}>
                  {workOrder.faultCode}
                </Paragraph>
              </>
            )}
            {workOrder.maintenanceNotes && (
              <>
                <Text strong>Repair Notes:</Text>
                <Paragraph type="secondary" style={{ margin: 0 }}>
                  {workOrder.maintenanceNotes}
                </Paragraph>
              </>
            )}
            <Text strong>Parts Used:</Text>
            <Text>{usedPartsCount} items recorded</Text>
            {!workOrder.faultCode && !workOrder.maintenanceNotes && (
              <Text type="secondary">No maintenance decision recorded.</Text>
            )}
          </Space>
        </Card>
      </Space>
    </Card>
  );
};