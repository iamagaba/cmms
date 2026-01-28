import { Calendar, ClipboardList, Clock, Loader2, Wrench } from 'lucide-react';
import React from 'react';


import { usePartsForInventoryItem, useReservationsForInventoryItem } from '@/hooks/useWorkOrderParts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface InventoryPartsUsagePanelProps {
  inventoryItemId: string;
  maxHeight?: string;
}

export const InventoryPartsUsagePanel: React.FC<InventoryPartsUsagePanelProps> = ({
  inventoryItemId,
  maxHeight = '400px',
}) => {
  const { data: usedParts, isLoading: isLoadingParts } = usePartsForInventoryItem(inventoryItemId);
  const { data: reservations, isLoading: isLoadingReservations } = useReservationsForInventoryItem(inventoryItemId);

  const isLoading = isLoadingParts || isLoadingReservations;

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        Loading usage data...
      </div>
    );
  }

  const hasData = (usedParts?.length || 0) > 0 || (reservations?.length || 0) > 0;

  if (!hasData) {
    return (
      <div className="p-6 text-center">
        <ClipboardList className="w-5 h-5 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No work order usage history</p>
        <p className="text-xs text-gray-400 mt-1">Parts used on work orders will appear here</p>
      </div>
    );
  }

  // Calculate totals
  const totalUsed = (usedParts || []).reduce((sum, p) => sum + p.quantity_used, 0);
  const totalReserved = (reservations || []).reduce((sum, r) => sum + r.quantity_reserved, 0);
  const totalCost = (usedParts || []).reduce((sum, p) => sum + (p.total_cost || 0), 0);

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800" style={{ maxHeight, overflowY: 'auto' }}>
      {/* Summary Stats */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{totalUsed}</p>
            <p className="text-xs text-gray-500">Total Used</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-muted-foreground">{totalReserved}</p>
            <p className="text-xs text-gray-500">Reserved</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">UGX {Math.round(totalCost).toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Value</p>
          </div>
        </div>
      </div>

      {/* Active Reservations */}
      {reservations && reservations.length > 0 && (
        <div className="p-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Active Reservations ({reservations.length})
          </h4>
          <div className="space-y-2">
            {reservations.map(res => (
              <div
                key={res.id}
                className="flex items-center justify-between p-2 bg-muted dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {(res as any).work_orders?.work_order_number || 'Work Order'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(res as any).work_orders?.title || 'No title'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">
                    {res.quantity_reserved} reserved
                  </p>
                  {res.expires_at && (
                    <p className="text-xs text-gray-500">
                      Expires {dayjs(res.expires_at).fromNow()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage History */}
      {usedParts && usedParts.length > 0 && (
        <div className="p-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Usage History ({usedParts.length} work orders)
          </h4>
          <div className="space-y-2">
            {usedParts.map(part => (
              <div
                key={part.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {(part as any).work_orders?.work_order_number || 'Work Order'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(part as any).work_orders?.title || 'No title'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {part.quantity_used} used
                  </p>
                  <p className="text-xs text-gray-500">
                    {dayjs(part.created_at).fromNow()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


