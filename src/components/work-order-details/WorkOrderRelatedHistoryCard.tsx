import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Clock02Icon, Clock01Icon } from '@hugeicons/core-free-icons';
import { WorkOrder, Vehicle } from '@/types/supabase';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { snakeToCamelCase } from '@/utils/data-helpers';
import dayjs from 'dayjs';

import { DiagnosticCategoryRow } from '@/types/diagnostic';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';


interface WorkOrderRelatedHistoryCardProps {
  workOrder: WorkOrder;
  vehicle?: Vehicle | null;
  onViewWorkOrder?: (workOrderId: string) => void;
  serviceCategories?: DiagnosticCategoryRow[];
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
  serviceCategories = [],
}) => {
  // Fetch vehicle history only
  const { data: vehicleHistory, isLoading } = useQuery<WorkOrder[]>({
    queryKey: ['vehicle_work_orders', (workOrder as any).vehicleId],
    queryFn: async () => {
      const vehicleId = (workOrder as any).vehicleId || (workOrder as any).vehicle_id;
      if (!vehicleId) return [];
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .neq('id', workOrder.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) return [];
      return (data || []).map(wo => snakeToCamelCase(wo) as WorkOrder);
    },
    enabled: !!((workOrder as any).vehicleId || (workOrder as any).vehicle_id),
  });

  if (!(workOrder as any).vehicleId && !(workOrder as any).vehicle_id) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <HugeiconsIcon icon={Clock02Icon} size={14} className="text-gray-500" />
          <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">History</h3>
          {vehicleHistory && vehicleHistory.length > 0 && (
            <span className="bg-gray-200 text-gray-600 text-[10px] px-1 py-0.5 rounded-full font-medium">
              {vehicleHistory.length}
            </span>
          )}
        </div>
        {vehicle && (
          <span className="text-[10px] text-gray-500 font-medium">{vehicle.license_plate}</span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="p-3 space-y-1.5">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : vehicleHistory && vehicleHistory.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="text-[11px] font-semibold text-gray-600 uppercase bg-gray-50 border-b border-gray-200">
              <TableRow className="bg-gray-50 hover:bg-gray-50 border-none">
                <TableHead className="px-3 py-2 w-[140px] h-auto font-semibold">Work Order</TableHead>
                <TableHead className="px-3 py-2 h-auto font-semibold">Issue</TableHead>
                <TableHead className="px-3 py-2 w-[140px] h-auto font-semibold">Status</TableHead>
                <TableHead className="px-3 py-2 w-[100px] text-right h-auto font-semibold">Created</TableHead>
                <TableHead className="px-3 py-2 w-[100px] text-right h-auto font-semibold">Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100">
              {vehicleHistory.map((wo) => {
                const rWo = wo as any;
                const categoryLabel = serviceCategories?.find(cat => cat.id === rWo.service)?.label;
                const description = categoryLabel || rWo.title || rWo.service || rWo.initialDiagnosis || rWo.description;
                const statusConfig = STATUS_CONFIG[rWo.status || 'Open'] || STATUS_CONFIG['Open'];

                return (
                  <TableRow
                    key={rWo.id}
                    onClick={() => onViewWorkOrder?.(rWo.id)}
                    className="hover:bg-primary-50/30 hover:shadow-sm transition-all cursor-pointer group border-b border-gray-100 last:border-0"
                  >
                    <TableCell className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap text-sm">
                      {rWo.workOrderNumber || `WO-${rWo.id.substring(0, 6).toUpperCase()}`}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-gray-600 text-sm">
                      <div className="truncate max-w-[300px]">
                        {description || 'General Service'}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} border-current/20`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                        {rWo.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-2 text-right text-gray-500 whitespace-nowrap text-xs">
                      {rWo.created_at ? dayjs(rWo.created_at).fromNow() : 'Unknown'}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-right">
                      {rWo.priority && (
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${rWo.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                          rWo.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            rWo.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              'bg-gray-50 text-gray-600 border-gray-200'
                          }`}>
                          {rWo.priority.charAt(0).toUpperCase() + rWo.priority.slice(1).toLowerCase()}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="mx-auto w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-1.5">
            <HugeiconsIcon icon={Clock01Icon} size={16} className="text-gray-400" />
          </div>
          <p className="text-xs font-medium text-gray-900 mb-0.5">No previous work orders</p>
          <p className="text-[10px] text-gray-500">This vehicle has no service history</p>
        </div>
      )}
    </div>
  );
};

export default WorkOrderRelatedHistoryCard;
