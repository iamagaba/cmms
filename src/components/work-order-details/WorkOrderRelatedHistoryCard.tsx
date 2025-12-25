import React from 'react';
import { Icon } from '@iconify/react';
import { WorkOrder, Vehicle } from '@/types/supabase';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { snakeToCamelCase } from '@/utils/data-helpers';
import dayjs from 'dayjs';

interface WorkOrderRelatedHistoryCardProps {
  workOrder: WorkOrder;
  vehicle?: Vehicle | null;
  onViewWorkOrder?: (workOrderId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  'Open': 'bg-blue-100 text-blue-700',
  'Confirmation': 'bg-purple-100 text-purple-700',
  'On Hold': 'bg-amber-100 text-amber-700',
  'Ready': 'bg-cyan-100 text-cyan-700',
  'In Progress': 'bg-orange-100 text-orange-700',
  'Completed': 'bg-emerald-100 text-emerald-700',
};

export const WorkOrderRelatedHistoryCard: React.FC<WorkOrderRelatedHistoryCardProps> = ({
  workOrder,
  vehicle,
  onViewWorkOrder,
}) => {
  // Fetch vehicle history only
  const { data: vehicleHistory, isLoading } = useQuery<WorkOrder[]>({
    queryKey: ['vehicle_work_orders', workOrder.vehicleId],
    queryFn: async () => {
      if (!workOrder.vehicleId) return [];
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .eq('vehicle_id', workOrder.vehicleId)
        .neq('id', workOrder.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) return [];
      return (data || []).map(wo => snakeToCamelCase(wo) as WorkOrder);
    },
    enabled: !!workOrder.vehicleId,
  });

  if (!workOrder.vehicleId) {
    return null;
  }

  return (
    <div className="bg-white">
      <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon icon="tabler:history" className="w-3 h-3 text-gray-500" />
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Vehicle History</h3>
          {vehicleHistory && vehicleHistory.length > 0 && (
            <span className="bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full">
              {vehicleHistory.length}
            </span>
          )}
        </div>
        {vehicle && (
          <span className="text-xs text-gray-500">{vehicle.license_plate}</span>
        )}
      </div>

      <div className="px-3 py-2">
        {isLoading ? (
          <div className="space-y-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : vehicleHistory && vehicleHistory.length > 0 ? (
          <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto">
            {vehicleHistory.map((wo) => {
              const description = wo.title || wo.service || wo.initialDiagnosis;
              const hasDescription = description && description.trim() !== '';
              
              return (
                <div
                  key={wo.id}
                  onClick={() => onViewWorkOrder?.(wo.id)}
                  className="flex items-center justify-between py-2 hover:bg-gray-50 cursor-pointer transition-colors group first:pt-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-gray-900">{wo.workOrderNumber}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_COLORS[wo.status || 'Open']}`}>
                        {wo.status}
                      </span>
                    </div>
                    {hasDescription ? (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{description}</p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5 italic">General maintenance</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {wo.created_at ? dayjs(wo.created_at).format('MMM D, YYYY') : 'Date unknown'}
                    </p>
                  </div>
                  <Icon icon="tabler:chevron-right" className="w-3 h-3 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <Icon icon="tabler:history-off" className="w-6 h-6 text-gray-300 mx-auto mb-1" />
            <p className="text-xs text-gray-400">No previous service history</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkOrderRelatedHistoryCard;
