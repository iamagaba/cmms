import React from 'react';
import { ModernPieChart, formatNumber } from '@/components/charts';
import { WorkOrder } from '@/types/supabase';

interface ComponentFailureChartProps { 
  workOrders: WorkOrder[]; 
}

export const ComponentFailureChart: React.FC<ComponentFailureChartProps> = ({ workOrders }) => { 
  // Process data for the chart
  const partFailures = new Map<string, number>();

  workOrders.forEach(wo => { 
    wo.partsUsed?.forEach(part => { 
      partFailures.set(part.name, (partFailures.get(part.name) || 0) + part.quantity); 
    }); 
  });

  const chartData = Array.from(partFailures.entries()).map(([name, count]) => ({ 
    name: name,
    value: count 
  }));

  return (
    <ModernPieChart
      title="Component Failure Frequency"
      subtitle="Most frequently replaced parts"
      data={chartData}
      height={300}
      variant="pie"
      formatValue={formatNumber}
      accessibilityLabel="Pie chart showing component failure frequency"
      showPercentages
      interactive
    />
  ); 
};
