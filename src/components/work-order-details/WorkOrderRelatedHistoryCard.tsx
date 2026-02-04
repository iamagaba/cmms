import { Clock } from 'lucide-react';
import React from 'react';


import { WorkOrder, Vehicle } from '@/types/supabase';
import { getWorkOrderNumber } from '@/utils/work-order-display';
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
  'New': { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-slate-500' },
  'Confirmation': { bg: 'bg-primary/5', text: 'text-primary', dot: 'bg-primary' },
  'On Hold': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Ready': { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-blue-500' },
  'In Progress': { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-orange-500' },
  'Completed': { bg: 'bg-muted', text: 'text-foreground', dot: 'bg-emerald-500' },
  'Cancelled': { bg: 'bg-destructive/10', text: 'text-destructive', dot: 'bg-destructive' },
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
    <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-muted flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">History</h3>
          {vehicleHistory && vehicleHistory.length > 0 && (
            <span className="bg-muted text-muted-foreground text-xs px-1 py-0.5 rounded-full font-medium">
              {vehicleHistory.length}
            </span>
          )}
        </div>
        {vehicle && (
          <span className="text-xs text-muted-foreground font-medium">{vehicle.license_plate}</span>
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
            <TableHeader className="text-xs font-semibold text-muted-foreground uppercase bg-muted border-b border-border">
              <TableRow className="bg-muted hover:bg-muted border-none">
                <TableHead className="px-3 py-2 w-[140px] h-auto font-semibold">Work Order</TableHead>
                <TableHead className="px-3 py-2 h-auto font-semibold">Issue</TableHead>
                <TableHead className="px-3 py-2 w-[140px] h-auto font-semibold">Status</TableHead>
                <TableHead className="px-3 py-2 w-[100px] text-right h-auto font-semibold">Created</TableHead>
                <TableHead className="px-3 py-2 w-[100px] text-right h-auto font-semibold">Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {vehicleHistory.map((wo) => {
                const rWo = wo as any;
                const categoryLabel = serviceCategories?.find(cat => cat.id === rWo.service)?.label;
                const description = categoryLabel || rWo.title || rWo.service || rWo.initialDiagnosis || rWo.description;
                const statusConfig = STATUS_CONFIG[rWo.status || 'New'] || STATUS_CONFIG['New'];

                return (
                  <TableRow
                    key={rWo.id}
                    onClick={() => onViewWorkOrder?.(rWo.id)}
                    className="hover:bg-primary/5 hover:shadow-sm transition-all cursor-pointer group border-b border-border last:border-0"
                  >
                    <TableCell className="px-3 py-2 font-medium text-foreground whitespace-nowrap text-sm">
                      {getWorkOrderNumber(rWo)}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-muted-foreground text-sm">
                      <div className="truncate max-w-[300px]">
                        {description || 'General Service'}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} border-current/20`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                        {rWo.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-2 text-right text-muted-foreground whitespace-nowrap text-xs">
                      {rWo.created_at ? dayjs(rWo.created_at).fromNow() : 'Unknown'}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-right">
                      {rWo.priority && (
                        <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-medium border ${rWo.priority === 'Critical' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                          rWo.priority === 'High' ? 'bg-muted text-muted-foreground border-orange-200' :
                            rWo.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-muted text-muted-foreground border-border'
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
          <div className="mx-auto w-8 h-8 bg-muted rounded-lg flex items-center justify-center mb-1.5">
            <Clock className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-xs font-medium text-foreground mb-0.5">No previous work orders</p>
          <p className="text-xs text-muted-foreground">This vehicle has no service history</p>
        </div>
      )}
    </div>
  );
};

export default WorkOrderRelatedHistoryCard;




