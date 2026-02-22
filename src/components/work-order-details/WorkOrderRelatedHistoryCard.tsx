import { Clock, Check, ArrowRight, Pause, Flag, PhoneOff } from 'lucide-react';
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

// Status colors for circular icons - UNIFIED SYSTEM
// These colors match the badge variants in src/components/ui/badge.tsx
const STATUS_COLORS: Record<string, { color: string; label: string; icon: 'dashed' | 'check' | 'arrow' | 'pause' | 'phoneOff' }> = {
  'New': { color: '#64748b', label: 'New', icon: 'dashed' },           // slate-500
  'Open': { color: '#64748b', label: 'New', icon: 'dashed' },          // slate-500
  'Confirmation': { color: '#64748b', label: 'Confirmation', icon: 'phoneOff' }, // slate-500 (same as Open/New)
  'Ready': { color: '#64748b', label: 'Ready', icon: 'arrow' },         // slate-500 (same as Open/New)
  'On Hold': { color: '#f97316', label: 'On Hold', icon: 'pause' },     // orange-500
  'In Progress': { color: '#f59e0b', label: 'In Progress', icon: 'arrow' }, // amber-500
  'Completed': { color: '#10b981', label: 'Completed', icon: 'check' }, // emerald-500
  'Cancelled': { color: '#6b7280', label: 'Cancelled', icon: 'dashed' }, // gray-500
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
    <div className="space-y-2">
      {/* Header - Detached */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-bold text-foreground">History</h3>
          {vehicleHistory && vehicleHistory.length > 0 && (
            <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full font-medium">
              {vehicleHistory.length}
            </span>
          )}
        </div>
        {vehicle && (
          <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-md border border-border/50">
            {vehicle.license_plate}
          </span>
        )}
      </div>

      {/* Content - Card */}
      <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-3 space-y-1.5">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : vehicleHistory && vehicleHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="px-3 py-2 w-[140px] h-9 font-semibold text-xs">Work Order</TableHead>
                  <TableHead className="px-3 py-2 h-9 font-semibold text-xs">Issue</TableHead>
                  <TableHead className="px-3 py-2 w-[140px] h-9 font-semibold text-xs">Status</TableHead>
                  <TableHead className="px-3 py-2 w-[100px] text-right h-9 font-semibold text-xs">Created</TableHead>
                  <TableHead className="px-3 py-2 w-[100px] text-right h-9 font-semibold text-xs">Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {vehicleHistory.map((wo) => {
                  const rWo = wo as any;
                  const categoryLabel = serviceCategories?.find(cat => cat.id === rWo.service)?.label;
                  const description = categoryLabel || rWo.title || rWo.service || rWo.initialDiagnosis || rWo.description;
                  const status = rWo.status || 'New';
                  const statusConfig = STATUS_COLORS[status] || STATUS_COLORS['New'];

                  const renderStatusIcon = () => {
                    if (statusConfig.icon === 'dashed') {
                      return (
                        <div
                          className="w-5 h-5 rounded-full flex-shrink-0 border-2 border-dashed"
                          style={{ borderColor: statusConfig.color }}
                        />
                      );
                    }

                    if (statusConfig.icon === 'check') {
                      return (
                        <div
                          className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: statusConfig.color }}
                        >
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      );
                    }

                    if (statusConfig.icon === 'arrow') {
                      return (
                        <div
                          className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: statusConfig.color }}
                        >
                          <ArrowRight className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      );
                    }

                    if (statusConfig.icon === 'pause') {
                      return (
                        <div
                          className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: statusConfig.color }}
                        >
                          <Pause className="w-3 h-3 text-white" strokeWidth={3} fill="white" />
                        </div>
                      );
                    }

                    if (statusConfig.icon === 'phoneOff') {
                      return (
                        <div
                          className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: statusConfig.color }}
                        >
                          <PhoneOff className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      );
                    }
                  };

                  const priority = (rWo.priority || 'none').toLowerCase();
                  const priorityConfig: Record<string, { color: string; label: string }> = {
                    'critical': { color: '#ef4444', label: 'High' },
                    'urgent': { color: '#ef4444', label: 'High' },
                    'high': { color: '#ef4444', label: 'High' },
                    'medium': { color: '#22c55e', label: 'Low' },
                    'normal': { color: '#22c55e', label: 'Low' },
                    'low': { color: '#22c55e', label: 'Low' },
                    'routine': { color: '#94a3b8', label: 'None' },
                    'none': { color: '#94a3b8', label: 'None' },
                  };

                  const prioConfig = priorityConfig[priority] || priorityConfig['none'];

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
                        <div className="flex items-center gap-2">
                          {renderStatusIcon()}
                          <span className="text-sm text-foreground">{statusConfig.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2 text-right text-muted-foreground whitespace-nowrap text-xs">
                        {(() => {
                          const createdAt = rWo.createdAt || rWo.created_at;
                          if (!createdAt) return 'Unknown';
                          const now = dayjs();
                          const created = dayjs(createdAt);
                          const diffDays = now.diff(created, 'day');
                          if (diffDays === 0) return 'Today';
                          if (diffDays === 1) return '1d ago';
                          if (diffDays < 7) return `${diffDays}d ago`;
                          const diffWeeks = Math.floor(diffDays / 7);
                          if (diffWeeks < 4) return `${diffWeeks}w ago`;
                          const diffMonths = now.diff(created, 'month');
                          if (diffMonths < 12) return `${diffMonths}mo ago`;
                          const diffYears = now.diff(created, 'year');
                          return `${diffYears}y ago`;
                        })()}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Flag className="w-4 h-4 flex-shrink-0" style={{ color: prioConfig.color }} fill={prioConfig.color} />
                          <span className="text-sm text-foreground">{prioConfig.label}</span>
                        </div>
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
    </div>
  );
};

export default WorkOrderRelatedHistoryCard;




