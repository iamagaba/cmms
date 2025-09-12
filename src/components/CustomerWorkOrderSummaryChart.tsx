import React, { useMemo } from 'react';
import { Card, Typography, Empty, Skeleton } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { WorkOrder } from '@/types/supabase';

dayjs.extend(weekOfYear);

const { Title, Text } = Typography;

interface CustomerWorkOrderSummaryChartProps {
  customerId: string;
  customerName: string;
  customerWorkOrders: WorkOrder[];
  isLoading: boolean;
}

interface WeeklySummary {
  weekLabel: string;
  count: number;
}

export const CustomerWorkOrderSummaryChart: React.FC<CustomerWorkOrderSummaryChartProps> = ({
  customerId,
  customerName,
  customerWorkOrders,
  isLoading,
}) => {
  const chartData = useMemo(() => {
    if (isLoading || !customerWorkOrders || customerWorkOrders.length === 0) {
      return [];
    }

    const weeklyCounts: { [key: string]: number } = {};
    const now = dayjs();
    const weeksToDisplay = 12; // Show data for the last 12 weeks

    // Initialize counts for the last 'weeksToDisplay' weeks
    for (let i = 0; i < weeksToDisplay; i++) {
      const weekStart = now.subtract(i, 'week').startOf('week');
      const weekLabel = weekStart.format('MMM DD'); // e.g., "Jan 01"
      weeklyCounts[weekLabel] = 0;
    }

    // Populate counts from actual work orders
    customerWorkOrders.forEach(order => {
      const orderDate = dayjs(order.created_at);
      // Only consider orders within the last 'weeksToDisplay' weeks
      if (orderDate.isAfter(now.subtract(weeksToDisplay, 'week').startOf('week'))) {
        const weekStartLabel = orderDate.startOf('week').format('MMM DD');
        weeklyCounts[weekStartLabel] = (weeklyCounts[weekStartLabel] || 0) + 1;
      }
    });

    // Convert to array and sort chronologically
    const dataArray: WeeklySummary[] = Object.keys(weeklyCounts)
      .map(weekLabel => ({
        weekLabel,
        count: weeklyCounts[weekLabel],
      }))
      .sort((a, b) => dayjs(a.weekLabel, 'MMM DD').unix() - dayjs(b.weekLabel, 'MMM DD').unix());

    return dataArray;
  }, [customerWorkOrders, isLoading]);

  if (isLoading) {
    return (
      <Card title={<Title level={5} style={{ margin: 0 }}>Work Orders for {customerName}</Title>} style={{ marginBottom: 16 }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  return (
    <Card title={<Title level={5} style={{ margin: 0 }}>Work Orders for {customerName}</Title>} style={{ marginBottom: 16 }}>
      {chartData.length > 0 && chartData.some(d => d.count > 0) ? (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="weekLabel" tickFormatter={(label) => dayjs(label, 'MMM DD').format('MMM DD')} />
            <YAxis allowDecimals={false} label={{ value: 'Work Orders', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="count" fill="#6A0DAD" name="Work Orders" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Empty description="No work order history for this customer in the last 12 weeks." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  );
};