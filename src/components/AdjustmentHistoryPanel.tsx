import { Clock } from 'lucide-react';
import React, { useState } from 'react';


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
    if (delta < 0) return 'text-destructive';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getUserName = (adjustment: StockAdjustment) => {
    if (adjustment.profiles && (adjustment.profiles.first_name || adjustment.profiles.last_name)) {
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
    console.error('Adjustment history error:', error, 'Item ID:', inventoryItemId);
    return (
      <div className="p-4 text-center">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
        <p className="text-sm text-destructive">Failed to load history</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
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
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${showFilters || Object.keys(filters).length > 0
                ? 'bg-primary/10 text-primary'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <FilterIcon className="w-4 h-4" />
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
      <div className="overflow-auto pl-2 pr-4 py-2" style={{ maxHeight }}>
        {!adjustments || adjustments.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No adjustment history</p>
          </div>
        ) : (
          <div className="relative space-y-0">
            {/* Vertical Timeline Track */}
            <div className="absolute left-[135px] top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-800" />

            {adjustments.map((adjustment) => {
              const isPositive = adjustment.quantity_delta > 0;
              const isNegative = adjustment.quantity_delta < 0;

              const deltaColorClass = isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : isNegative
                  ? 'text-destructive'
                  : 'text-gray-600 dark:text-gray-400';

              const dotColorClass = isPositive
                ? 'bg-emerald-500 ring-4 ring-white dark:ring-gray-900'
                : isNegative
                  ? 'bg-destructive ring-4 ring-white dark:ring-gray-900'
                  : 'bg-gray-400 ring-4 ring-white dark:ring-gray-900';

              return (
                <div key={adjustment.id} className="relative flex group py-3 first:pt-0 last:pb-0">

                  {/* Left: Date & Time */}
                  <div className="w-[120px] pt-1 text-right flex-none pr-4">
                    <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {new Date(adjustment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                      {new Date(adjustment.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Middle: Timeline Dot */}
                  <div className="absolute left-[131px] top-[14px] z-10 flex-none">
                    <div className={`h-2.5 w-2.5 rounded-full ${dotColorClass}`} />
                  </div>

                  {/* Right: Content */}
                  <div className="flex-1 pl-6 pt-0.5">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1">

                        {/* Reason Badge & User */}
                        <div className="flex items-center gap-2 mb-0.5">
                          <AdjustmentReasonBadge reason={adjustment.reason} size="sm" showIcon={false} />
                          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                            by {getUserName(adjustment)}
                          </span>
                        </div>

                        {/* Delta & Context */}
                        <div className="flex items-baseline gap-2">
                          <span className={`text-sm font-bold tabular-nums ${deltaColorClass}`}>
                            {formatDelta(adjustment.quantity_delta)}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {adjustment.quantity_before} <span className="mx-0.5">→</span> {adjustment.quantity_after}
                          </span>
                        </div>

                        {/* Notes */}
                        {adjustment.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-0.5">
                            {adjustment.notes}
                          </p>
                        )}
                      </div>

                      {/* Item Name (Global View) - Optional Right Side Info */}
                      {isGlobal && adjustment.inventory_items && (
                        <div className="text-right pl-4">
                          <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                            {adjustment.inventory_items.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {adjustment.inventory_items.sku}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};





