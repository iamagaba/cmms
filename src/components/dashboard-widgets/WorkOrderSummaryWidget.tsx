import React from 'react';
import { Card, List, Typography, Tag, Empty, Col, Skeleton } from 'antd';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/supabase';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface WorkOrderSummaryWidgetProps {
  widgetId: string;
  limit?: number;
}

const priorityColors: Record<string, string> = { High: "red", Medium: "gold", Low: "green" };

const WorkOrderSummaryWidget: React.FC<WorkOrderSummaryWidgetProps> = ({ limit = 5 }) => {
  const { data: workOrders, isLoading } = useQuery<WorkOrder[]>({
    queryKey: ['recent_work_orders_widget'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  if (isLoading) {
    return <Col span={24}><Skeleton active paragraph={{ rows: limit }} /></Col>;
  }

  return (
    <Col span={24}>
      <Card title="Recent Work Orders" style={{ height: '100%' }}>
        {workOrders && workOrders.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={workOrders}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={<Link to={`/work-orders/${item.id}`}>{item.workOrderNumber} - {item.service}</Link>}
                  description={<Text type="secondary">{dayjs(item.createdAt).format('MMM D, YYYY h:mm A')}</Text>}
                />
                <Tag color={priorityColors[item.priority || 'Low']}>{item.priority}</Tag>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="No recent work orders." image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>
    </Col>
  );
};

export default WorkOrderSummaryWidget;