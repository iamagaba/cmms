import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Clock02Icon, Clock01Icon } from '@hugeicons/core-free-icons';
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

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  'Open': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Confirmation': { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  'On Hold': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Ready': { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  'In Progress': { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  'Completed': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Cancelled': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Clock02Icon} size={16} className="text-gray-500" />
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">History</h3>
          {vehicleHistory && vehicleHistory.length > 0 && (
            <span className="bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
              {vehicleHistory.length}
            </span>
          )}
        </div>
        {vehicle && (
          <span className="text-xs text-gray-500 font-medium">{vehicle.license_plate}</span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="p-4 space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : vehicleHistory && vehicleHistory.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2.5 font-medium">Work Order</th>
                <th className="px-4 py-2.5 font-medium">Summary</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Created</th>
                <th className="px-4 py-2.5 font-medium text-right">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vehicleHistory.map((wo) => {
                const description = wo.title || wo.service || wo.initialDiagnosis || wo.description;
                const statusConfig = STATUS_CONFIG[wo.status || 'Open'] || STATUS_CONFIG['Open'];

                return (
                  <tr
                    key={wo.id}
                    onClick={() => onViewWorkOrder?.(wo.id)}
                    className="hover:bg-primary-50/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-2.5 font-medium text-gray-900 whitespace-nowrap">
                      {wo.workOrderNumber || `WO-${wo.id.substring(0, 6).toUpperCase()}`}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 max-w-[180px] truncate">
                      {description || 'General Service'}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} border-current/20`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                        {wo.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-500 whitespace-nowrap">
                      {wo.created_at ? dayjs(wo.created_at).fromNow() : 'Unknown'}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {wo.priority && (
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border ${wo.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                            wo.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              wo.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                'bg-gray-50 text-gray-600 border-gray-200'
                          }`}>
                          {wo.priority}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
            <HugeiconsIcon icon={Clock01Icon} size={20} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-0.5">No previous work orders</p>
          <p className="text-xs text-gray-500">This vehicle has no service history</p>
        </div>
      )}
    </div>
  );
};

export default WorkOrderRelatedHistoryCard;
