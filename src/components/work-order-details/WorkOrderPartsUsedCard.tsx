import React from 'react';
import { Plus, Package, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkOrderPart } from '@/types/supabase';

interface WorkOrderPartsUsedCardProps {
  usedParts: WorkOrderPart[];
  isAddPartDialogOpen?: boolean;
  setIsAddPartDialogOpen?: (open: boolean) => void;
  handleAddPart?: (itemId: string, quantity: number) => void;
  handleRemovePart?: (partId: string) => void;
}

export const WorkOrderPartsUsedCard: React.FC<WorkOrderPartsUsedCardProps> = ({
  usedParts,
  isAddPartDialogOpen,
  setIsAddPartDialogOpen,
  handleAddPart,
  handleRemovePart,
}) => {
  const totalCost = usedParts.reduce((sum, part) => {
    const price = part.price_at_time_of_use || part.inventory_items?.unit_price || 0;
    return sum + (price * part.quantity_used);
  }, 0);

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Parts Used</h3>
          {usedParts.length > 0 && (
            <span className="bg-muted text-foreground text-xs font-medium px-1.5 py-0.5 rounded-full">
              {usedParts.length}
            </span>
          )}
        </div>
        {setIsAddPartDialogOpen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddPartDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add
          </Button>
        )}
      </div>
      <div className="px-3 py-2">
        {usedParts.length === 0 ? (
          <div className="text-center py-4">
            <Package className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">No parts used yet</p>
            {setIsAddPartDialogOpen && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setIsAddPartDialogOpen(true)}
                className="mt-2"
              >
                Add first part
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="divide-y divide-border">
              {usedParts.map((part) => {
                const item = part.inventory_items;
                const price = part.price_at_time_of_use || item?.unit_price || 0;
                const lineTotal = price * part.quantity_used;

                return (
                  <div key={part.id} className="flex items-start gap-2 py-2 group first:pt-0 last:pb-0">
                    <div className="w-6 h-6 bg-white border border-border rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {item?.name || 'Unknown Part'}
                          </p>
                          {item?.sku && <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>}
                        </div>
                        {handleRemovePart && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemovePart(part.id)}
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 hover:text-destructive hover:bg-destructive/10"
                            title="Remove part"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="text-muted-foreground">
                          Qty: <span className="font-medium text-foreground">{part.quantity_used}</span>
                        </span>
                        <span className="text-muted-foreground">
                          @ <span className="font-medium text-foreground">UGX {price.toLocaleString()}</span>
                        </span>
                        <span className="text-foreground font-semibold">UGX {lineTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Parts Cost</span>
              <span className="text-sm font-bold text-foreground">UGX {totalCost.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkOrderPartsUsedCard;



