import React from 'react';
import { Steps, Card, Typography, Space, Tag, Tooltip, Empty } from 'antd';
import { WorkOrder } from '@/types/supabase';
import dayjs from 'dayjs';
import { Icon } from '@iconify/react';

const { Text, Paragraph } = Typography;
const { Step } = Steps;

interface AssetRepairTimelineProps {
  workOrders: WorkOrder[];
}

const statusIconMap: Record<WorkOrder['status'], string> = {
  'Open': 'ph:folder-open-fill',
  'Confirmation': 'ph:phone-call-fill',
  'Ready': 'ph:check-circle-fill',
  'In Progress': 'ph:wrench-fill',
  'On Hold': 'ph:pause-circle-fill',
  'Completed': 'ph:flag-checkered-fill',
};

const statusColorMap: Record<WorkOrder['status'], string> = {
  'Open': 'blue',
  'Confirmation': 'cyan',
  'Ready': 'default',
  'In Progress': 'orange',
  'On Hold': 'red',
  'Completed': 'green',
};

export const AssetRepairTimeline: React.FC<AssetRepairTimelineProps> = ({ workOrders }) => {
  // Sort work orders chronologically by creation date
  const sortedWorkOrders = [...workOrders].sort((a, b) =>
    dayjs(a.created_at).diff(dayjs(b.created_at))
  );

  if (sortedWorkOrders.length === 0) {
    return (
      <Card title="Repair History Timeline" style={{ marginBottom: 16 }}>
        <Empty description="No repair history found for this asset." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    );
  }

  const steps = sortedWorkOrders.map((order, index) => {
    const isCompleted = order.status === 'Completed';
    const eventDate = isCompleted && order.completedAt ? dayjs(order.completedAt) : dayjs(order.created_at);
    const eventDateFormatted = eventDate.format('MMM D, YYYY');

    let stepStatus: 'wait' | 'process' | 'finish' | 'error' = 'wait';
    if (isCompleted) {
      stepStatus = 'finish';
    } else if (order.status === 'In Progress') {
      stepStatus = 'process';
    } else if (order.status === 'On Hold') {
      stepStatus = 'error';
    } else {
      stepStatus = 'wait';
    }

    const descriptionContent = (
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <Text strong>{order.workOrderNumber}</Text>
        <Tag color={statusColorMap[order.status || 'Open']} icon={<Icon icon={statusIconMap[order.status || 'Open']} />}>
          {order.status}
        </Tag>
        <Paragraph ellipsis={{ rows: 2, tooltip: order.initialDiagnosis || order.service }} style={{ margin: 0 }}>
          {order.initialDiagnosis || order.service || 'No description'}
        </Paragraph>
        {order.faultCode && (
          <Text type="secondary" ellipsis={{ tooltip: order.faultCode }}>
            Fault: {order.faultCode}
          </Text>
        )}
        {order.maintenanceNotes && (
          <Text type="secondary" ellipsis={{ tooltip: order.maintenanceNotes }}>
            Notes: {order.maintenanceNotes}
          </Text>
        )}
      </Space>
    );

    return (
      <Step
        key={order.id}
        title={<Text strong>{eventDateFormatted}</Text>}
        description={descriptionContent}
        status={stepStatus}
      />
    );
  });

  return (
    <Card title="Repair History Timeline" style={{ marginBottom: 16 }}>
      <div style={{ overflowX: 'auto', paddingBottom: '16px' }} className="hide-scrollbar">
        <Steps
          current={-1} // No step is actively selected, just showing history
          direction="horizontal"
          size="small"
          style={{ minWidth: `${sortedWorkOrders.length * 200}px` }} // Ensure enough width for horizontal display
        >
          {steps}
        </Steps>
      </div>
    </Card>
  );
};