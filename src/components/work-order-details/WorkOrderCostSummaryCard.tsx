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
      <div className="flex flex-col h-full">
        {setIsAddPartDialogOpen && (
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-slate-50/50">
            <h3 className="font-semibold text-sm text-foreground">Parts & Cost</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddPartDialogOpen(true)}
              className="h-7 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Part
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          {/* Parts List */}
          <div className="px-4 pt-1">
            <button
              onClick={() => setShowParts(!showParts)}
              className="w-full flex items-center justify-between py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
            >
              <span>Parts ({usedParts.length})</span>
              {showParts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showParts && (
              <div className="space-y-0">
                {usedParts.length === 0 ? (
                  <div className="text-center py-4 border-dashed border border-slate-200 rounded-lg mb-2">
                    <Package className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                    <p className="text-[11px] text-muted-foreground">No parts added</p>
                  </div>
                ) : (
                  usedParts.map((part) => {
                    const p = part as any;
                    const item = p.inventory_items || p.inventoryItems || p.inventory_item || p.inventoryItem;
                    const price = p.price_at_time_of_use || p.priceAtTimeOfUse || item?.unit_price || item?.unitPrice || 0;
                    const qty = p.quantity_used ?? p.quantityUsed ?? 0;
                    const lineTotal = price * qty;

                    return (
                      <div key={part.id} className="flex items-start justify-between py-2 border-b border-slate-100 last:border-0 group">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item?.name || 'Unknown'}
                            {item?.model && <span className="font-normal text-muted-foreground ml-1">({item.model})</span>}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium text-[10px]">{qty}x</span>
                            <span>@ {formatCurrency(price)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-foreground">{formatCurrency(lineTotal)}</span>
                          {handleRemovePart && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemovePart(part.id)}
                              className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
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

          {/* Labor Section */}
          <div className="px-4 py-1 mt-1">
            <div className="flex items-center justify-between py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Labor</span>
            </div>

            <div className="flex items-start justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Service Labor</p>
                  <p className="text-[11px] text-muted-foreground mt-0">
                    {actualLaborHours > 0
                      ? `${formatHours(actualLaborHours)} logged`
                      : estimatedHours > 0
                        ? `${formatHours(estimatedHours)} estimated`
                        : 'Not started'}
                    <span className="mx-1.5 opacity-50">|</span>
                    {laborRate.toLocaleString()}/hr
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${actualLaborHours > 0 || estimatedHours > 0 ? 'text-foreground' : 'text-slate-400'}`}>
                  {actualLaborHours > 0 ? formatCurrency(actualLaborCost) : formatCurrency(laborCost)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Footer */}
        <div className="bg-slate-50 border-t border-border px-4 py-3 mt-auto">
          {estimatedHours > 0 && actualLaborHours === 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Estimated Total</span>
              <span>{formatCurrency(estimatedTotal)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Total Bill</span>
            <span className="text-sm font-bold text-foreground">{formatCurrency(actualTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderCostSummaryCard;


