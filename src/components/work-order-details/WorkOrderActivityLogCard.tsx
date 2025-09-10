import React from 'react';
import { Card, Timeline, Typography } from 'antd';
import dayjs from 'dayjs';
import { WorkOrder } from '@/types/supabase';

const { Text } = Typography;

interface WorkOrderActivityLogCardProps {
  workOrder: WorkOrder;
  profileMap: Map<string, string>;
}

export const WorkOrderActivityLogCard: React.FC<WorkOrderActivityLogCardProps> = ({ workOrder, profileMap }) => {
  return (
    <Card title="Activity Log">
      <Timeline>
        {[...(workOrder.activityLog || [])]
          .sort((a, b) => dayjs(b.timestamp).diff(dayjs(a.timestamp)))
          .map((item, index) => {
            const userName = profileMap.get(item.userId) || (item.userId ? 'A user' : 'System');
            return (
              <Timeline.Item key={index}>
                <Text strong>{item.activity}</Text>
                <br />
                <Text type="secondary">
                  by {userName} on {dayjs(item.timestamp).format('MMM D, YYYY h:mm A')}
                </Text>
              </Timeline.Item>
            );
          })}
      </Timeline>
    </Card>
  );
};