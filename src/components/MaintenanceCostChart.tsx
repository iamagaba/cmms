import React from 'react';
import { ModernLineChart, formatCurrency, formatDate } from '@/components/charts';
import { WorkOrder } from '@/types/supabase';
import dayjs from 'dayjs';


interface MaintenanceCostChartProps {
  workOrders: WorkOrder[];
}

export const MaintenanceCostChart: React.FC<MaintenanceCostChartProps> = ({ workOrders }) => {


  // Process data for the chart
  const chartData = workOrders.map(wo => ({
    name: formatDate(wo.created_at),
    cost: wo.partsUsed?.reduce((acc, part) => acc + (part.quantity * 100), 0) || 0, // Placeholder cost
  }));

  return (
    <ModernLineChart
      title="Maintenance Costs Over Time"
      subtitle="Daily maintenance cost trends"
      data={chartData}
      series={[{
        name: 'Cost (UGX)',
        dataKey: 'cost',
        strokeWidth: 3,
        dot: true
      }]}
      height={300}
      formatValue={(value) => `UGX ${Number(value).toLocaleString()}`}
      formatLabel={formatDate}
      accessibilityLabel="Line chart showing maintenance costs over time"
      smooth
      interactive
    />
  );
};
