import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { 
  useItemAdjustmentHistory, 
  useAdjustmentHistory,
  AdjustmentHistoryFilters 
} from '@/hooks/useStockAdjustments';
import { AdjustmentReason, ADJUSTMENT_REASON_LABELS, StockAdjustment } from '@/types/supabase';
import { AdjustmentReasonBadge } from './AdjustmentReasonBadge';

interface AdjustmentHistoryPanelProps {
  inventoryItemId?: string;
  isGlobal?: boolean;
  maxHeight?: string;
}

const ADJUSTMENT_REASONS: AdjustmentReason[] = [
  'received', 'damaged', 'returned', 'cycle_count', 
  'theft', 'expired', 'transfer_out', 'transfer_in', 
  'initial_stock', 'other',
];

export const AdjustmentHistoryPanel: React.FC<AdjustmentHistoryPanelProps> = ({
  inventoryItemId,
  isGlobal = false,
  maxHeight = '400px',
}) => {
  const [filters, setFilters] = useState<AdjustmentHistoryFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Use appropriate hook based on mode
  const itemHistory = useItemAdjustmentHistory(inventoryItemId);
  const globalHistory = useAdjustmentHistory(isGlobal ? filters : {});

  const { data: adjustments, isLoading, error } = isGlobal ? globalHistory : itemHistory;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDelta = (delta: number) => {
    if (delta > 0) return `+${delta}`;
    return delta.toString();
  };

  const getDeltaColor = (delta: number) => {
    if (delta > 0) return 'text-emerald-600 dark:text-emerald-400';
    if (delta < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getUserName = (adjustment: StockAdjustment) => {
    if (adjustment.profiles?.first_name || adjustment.profiles?.last_name) {
      return `${adjustment.profiles.first_name || ''} ${adjustment.profiles.last_name || ''}`.trim();
    }
    return 'System';
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <Icon icon="tabler:alert-circle" className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-600 dark:text-red-400">Failed to load history</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header with Filters (Global mode only) */}
      {isGlobal && (
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Adjustment History
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                showFilters || Object.keys(filters).length > 0
                  ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon icon="tabler:filter" className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Reason</label>
                <select
                  value={filters.reason || ''}
                  onChange={(e) => setFilters({ ...filters, reason: (e.target.value || undefined) as AdjustmentReason | undefined })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">All Reasons</option>
                  {ADJUSTMENT_REASONS.map(r => (
                    <option key={r} value={r}>{ADJUSTMENT_REASON_LABELS[r]}</option>
                  ))}
                </select>
              </div>
              {Object.keys(filters).length > 0 && (
                <button
                  onClick={() => setFilters({})}
                  className="col-span-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* History List */}
      <div className="overflow-auto" style={{ maxHeight }}>
        {!adjustments || adjustments.length === 0 ? (
          <div className="p-8 text-center">
            <Icon icon="tabler:history-off" className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No adjustment history</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {adjustments.map((adjustment) => (
              <div key={adjustment.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${getDeltaColor(adjustment.quantity_delta)}`}>
                      {formatDelta(adjustment.quantity_delta)}
                    </span>
                    <AdjustmentReasonBadge reason={adjustment.reason} size="sm" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(adjustment.created_at)}
                  </span>
                </div>

                {/* Show item name in global view */}
                {isGlobal && adjustment.inventory_items && (
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {adjustment.inventory_items.name}
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      ({adjustment.inventory_items.sku})
                    </span>
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span>{adjustment.quantity_before} → {adjustment.quantity_after}</span>
                  <span>•</span>
                  <span>by {getUserName(adjustment)}</span>
                </div>

                {adjustment.notes && (
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 italic">
                    "{adjustment.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
