import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  PackageIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Delete01Icon,
  Clock01Icon,
  CheckmarkCircle01Icon,
  Loading01Icon
} from '@hugeicons/core-free-icons';
import { WorkOrder, WorkOrderPart } from '@/types/supabase';

interface WorkOrderCostSummaryCardProps {
  workOrder: WorkOrder;
  usedParts?: WorkOrderPart[];
  laborRate?: number;
  isAddPartDialogOpen?: boolean;
  setIsAddPartDialogOpen?: (open: boolean) => void;
  handleAddPart?: (itemId: string, quantity: number) => void;
  handleRemovePart?: (partId: string) => void;
}

export const WorkOrderCostSummaryCard: React.FC<WorkOrderCostSummaryCardProps> = ({
  workOrder,
  usedParts = [],
  laborRate = 50,
  isAddPartDialogOpen,
  setIsAddPartDialogOpen,
  handleAddPart,
  handleRemovePart,
}) => {
  const [showParts, setShowParts] = useState(true);

  // Calculate parts cost
  const partsCost = usedParts.reduce((sum, part) => {
    const price = part.price_at_time_of_use || part.inventory_items?.unit_price || 0;
    return sum + (price * part.quantity_used);
  }, 0);

  // Calculate labor cost
  const estimatedHours = workOrder.estimatedHours || 0;
  const laborCost = estimatedHours * laborRate;

  // Calculate actual labor if work has started
  let actualLaborHours = 0;
  if (workOrder.work_started_at) {
    const startTime = new Date(workOrder.work_started_at).getTime();
    const endTime = workOrder.completedAt ? new Date(workOrder.completedAt).getTime() : Date.now();
    const pausedSeconds = workOrder.total_paused_duration_seconds || 0;
    actualLaborHours = ((endTime - startTime) / 1000 - pausedSeconds) / 3600;
  }
  const actualLaborCost = actualLaborHours * laborRate;

  const estimatedTotal = partsCost + laborCost;
  const actualTotal = partsCost + (actualLaborHours > 0 ? actualLaborCost : laborCost);

  const formatCurrency = (amount: number) => `UGX ${amount.toLocaleString()}`;
  const formatHours = (hours: number) => hours < 1 ? `${Math.round(hours * 60)}m` : `${hours.toFixed(1)}h`;

  return (
    <div className="bg-white">
      <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Parts & Cost</h3>
        {setIsAddPartDialogOpen && (
          <button
            onClick={() => setIsAddPartDialogOpen(true)}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            <HugeiconsIcon icon={Add01Icon} size={12} />
            Add
          </button>
        )}
      </div>

      <div className="px-3 py-2 space-y-2">
        {/* Parts Section - Collapsible */}
        <div>
          <button
            onClick={() => setShowParts(!showParts)}
            className="w-full flex items-center justify-between px-2 py-1.5 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                <HugeiconsIcon icon={PackageIcon} size={12} className="text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-gray-900">Parts ({usedParts.length})</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-900">{formatCurrency(partsCost)}</span>
              <HugeiconsIcon icon={showParts ? ArrowUp01Icon : ArrowDown01Icon} size={12} className="text-gray-400" />
            </div>
          </button>

          {/* Parts List */}
          {showParts && (
            <div className="mt-1.5 space-y-1 max-h-40 overflow-y-auto">
              {usedParts.length === 0 ? (
                <div className="text-center py-3 bg-gray-50 rounded">
                  <HugeiconsIcon icon={PackageIcon} size={24} className="text-gray-300 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">No parts added yet</p>
                </div>
              ) : (
                usedParts.map((part) => {
                  const item = part.inventory_items;
                  const price = part.price_at_time_of_use || item?.unit_price || 0;
                  const lineTotal = price * part.quantity_used;

                  return (
                    <div key={part.id} className="flex items-center justify-between px-2 py-1.5 bg-gray-50 rounded group">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{item?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">
                          {part.quantity_used} × {formatCurrency(price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-gray-700">{formatCurrency(lineTotal)}</span>
                        {handleRemovePart && (
                          <button
                            onClick={() => handleRemovePart(part.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-opacity"
                          >
                            <HugeiconsIcon icon={Delete01Icon} size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Labor Cost */}
        <div className="flex items-center justify-between px-2 py-1.5 bg-orange-50 rounded">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center">
              <HugeiconsIcon icon={Clock01Icon} size={12} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900">Labor</p>
              <p className="text-xs text-gray-500">
                {actualLaborHours > 0
                  ? `${formatHours(actualLaborHours)} @ ${laborRate}/hr`
                  : estimatedHours > 0
                    ? `${formatHours(estimatedHours)} est.`
                    : 'Not estimated'
                }
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-gray-900">
            {actualLaborHours > 0 ? formatCurrency(actualLaborCost) : formatCurrency(laborCost)}
          </span>
        </div>

        {/* Total Section */}
        <div className="border-t border-gray-200 pt-2 space-y-1">
          {estimatedHours > 0 && actualLaborHours === 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Estimated</span>
              <span className="font-medium text-gray-600">{formatCurrency(estimatedTotal)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">
              {workOrder.status === 'Completed' ? 'Final' : 'Current'}
            </span>
            <span className="text-base font-bold text-gray-900">{formatCurrency(actualTotal)}</span>
          </div>
        </div>

        {/* Status Badge */}
        {workOrder.status === 'Completed' ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded px-2 py-1 flex items-center gap-1.5">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="text-emerald-600" />
            <span className="text-xs text-emerald-700">Completed - Final cost</span>
          </div>
        ) : workOrder.status === 'In Progress' ? (
          <div className="bg-orange-50 border border-orange-200 rounded px-2 py-1 flex items-center gap-1.5">
            <HugeiconsIcon icon={Loading01Icon} size={12} className="text-orange-600" />
            <span className="text-xs text-orange-700">In progress - Cost updating</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default WorkOrderCostSummaryCard;
