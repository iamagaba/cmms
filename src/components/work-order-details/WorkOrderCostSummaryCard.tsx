import React, { useState } from 'react';
import { Plus, Package, ChevronUp, ChevronDown, Trash2, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    const p = part as any;
    const item = p.inventory_items || p.inventoryItems || p.inventory_item || p.inventoryItem;
    const price = p.price_at_time_of_use || p.priceAtTimeOfUse || item?.unit_price || item?.unitPrice || 0;
    const qty = p.quantity_used ?? p.quantityUsed ?? 0;
    return sum + (price * qty);
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
    <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
      {setIsAddPartDialogOpen && (
        <div className="px-3 py-2 border-b border-border flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddPartDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add
          </Button>
        </div>
      )}

      <div className="px-3 py-2 space-y-2">
        {/* Parts Section - Collapsible */}
        <div>
          <button
            onClick={() => setShowParts(!showParts)}
            className="w-full flex items-center justify-between px-2 py-1.5 bg-muted rounded-lg hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center">
                <Package className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-foreground">Parts ({usedParts.length})</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">{formatCurrency(partsCost)}</span>
              {showParts ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </button>

          {/* Parts List */}
          {showParts && (
            <div className="mt-1.5 space-y-1 max-h-40 overflow-y-auto">
              {usedParts.length === 0 ? (
                <div className="text-center py-3 bg-muted rounded-lg">
                  <Package className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">No parts added yet</p>
                </div>
              ) : (
                usedParts.map((part) => {
                  const p = part as any;
                  const item = p.inventory_items || p.inventoryItems || p.inventory_item || p.inventoryItem;
                  const price = p.price_at_time_of_use || p.priceAtTimeOfUse || item?.unit_price || item?.unitPrice || 0;
                  const qty = p.quantity_used ?? p.quantityUsed ?? 0;
                  const lineTotal = price * qty;

                  return (
                    <div key={part.id} className="flex items-center justify-between px-2 py-1.5 bg-muted rounded-lg group">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {item?.name || 'Unknown'}
                          {item?.model && <span className="font-normal text-muted-foreground"> ({item.model})</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {qty} × {formatCurrency(price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-foreground">{formatCurrency(lineTotal)}</span>
                        {handleRemovePart && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemovePart(part.id)}
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
        <div className="flex items-center justify-between px-2 py-1.5 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center">
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Labor</p>
              <p className="text-xs text-muted-foreground">
                {actualLaborHours > 0
                  ? `${formatHours(actualLaborHours)} @ ${laborRate}/hr`
                  : estimatedHours > 0
                    ? `${formatHours(estimatedHours)} est.`
                    : 'Not estimated'
                }
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-foreground">
            {actualLaborHours > 0 ? formatCurrency(actualLaborCost) : formatCurrency(laborCost)}
          </span>
        </div>

        {/* Total Section */}
        <div className="border-t border-border pt-2 space-y-1">
          {estimatedHours > 0 && actualLaborHours === 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Estimated</span>
              <span className="font-medium text-muted-foreground">{formatCurrency(estimatedTotal)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              Total
            </span>
            <span className="text-base font-bold text-foreground">{formatCurrency(actualTotal)}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WorkOrderCostSummaryCard;


