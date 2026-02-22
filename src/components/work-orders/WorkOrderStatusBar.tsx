import React, { useMemo } from 'react';
import { WorkOrder } from '@/types/supabase';
import { STATUS_CONFIG } from '@/config/status';

interface WorkOrderStatusBarProps {
  workOrders: WorkOrder[];
  className?: string;
}

export const WorkOrderStatusBar: React.FC<WorkOrderStatusBarProps> = ({ 
  workOrders,
  className = ''
}) => {
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;

    workOrders.forEach(wo => {
      const status = wo.status || 'Unknown';
      counts[status] = (counts[status] || 0) + 1;
      total++;
    });

    return { counts, total };
  }, [workOrders]);

  const { counts, total } = statusCounts;

  // Define status order and colors
  const statusOrder = ['New', 'Confirmation', 'Ready', 'In Progress', 'On Hold', 'Completed'];
  
  const getStatusColor = (status: string): string => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
    if (config?.color) {
      // Map color names to hex values
      const colorMap: Record<string, string> = {
        'slate': '#64748b',
        'blue': '#3b82f6',
        'orange': '#f97316',
        'indigo': '#6366f1',
        'green': '#22c55e',
        'yellow': '#eab308',
        'red': '#ef4444',
        'teal': '#14b8a6',
        'purple': '#a855f7',
        'amber': '#f59e0b',
      };
      return colorMap[config.color] || '#6b7280';
    }
    return '#6b7280';
  };

  if (total === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Status counts */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium">Work Orders</span>
        <div className="flex items-center gap-4">
          <span>Total: {total}</span>
          {statusOrder.map(status => {
            const count = counts[status] || 0;
            if (count === 0) return null;
            return (
              <span key={status} className="flex items-center gap-1">
                <span className="capitalize">{status}:</span>
                <span className="font-medium">{count}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Colored bar */}
      <div className="flex h-2 rounded-full overflow-hidden bg-muted">
        {statusOrder.map(status => {
          const count = counts[status] || 0;
          if (count === 0) return null;
          
          const percentage = (count / total) * 100;
          const color = getStatusColor(status);
          
          return (
            <div
              key={status}
              className="transition-all duration-300 hover:opacity-80 cursor-pointer"
              style={{
                width: `${percentage}%`,
                backgroundColor: color,
              }}
              title={`${status}: ${count} (${percentage.toFixed(1)}%)`}
            />
          );
        })}
      </div>
    </div>
  );
};
