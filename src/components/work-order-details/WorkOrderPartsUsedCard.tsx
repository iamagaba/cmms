import React from 'react';
import { Icon } from '@iconify/react';
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
    <div className="bg-white">
      <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Parts Used</h3>
          {usedParts.length > 0 && (
            <span className="bg-gray-200 text-gray-700 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
              {usedParts.length}
            </span>
          )}
        </div>
        {setIsAddPartDialogOpen && (
          <button
            onClick={() => setIsAddPartDialogOpen(true)}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            <Icon icon="tabler:plus" className="w-3 h-3" />
            Add
          </button>
        )}
      </div>
      <div className="px-3 py-2">
        {usedParts.length === 0 ? (
          <div className="text-center py-4">
            <Icon icon="tabler:package-off" className="w-6 h-6 text-gray-300 mx-auto mb-1" />
            <p className="text-xs text-gray-400">No parts used yet</p>
            {setIsAddPartDialogOpen && (
              <button
                onClick={() => setIsAddPartDialogOpen(true)}
                className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Add first part
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="divide-y divide-gray-100">
              {usedParts.map((part) => {
                const item = part.inventory_items;
                const price = part.price_at_time_of_use || item?.unit_price || 0;
                const lineTotal = price * part.quantity_used;

                return (
                  <div key={part.id} className="flex items-start gap-2 py-2 group first:pt-0 last:pb-0">
                    <div className="w-6 h-6 bg-white border border-gray-200 rounded flex items-center justify-center flex-shrink-0">
                      <Icon icon="tabler:package" className="w-3 h-3 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {item?.name || 'Unknown Part'}
                          </p>
                          {item?.sku && <p className="text-xs text-gray-500">SKU: {item.sku}</p>}
                        </div>
                        {handleRemovePart && (
                          <button
                            onClick={() => handleRemovePart(part.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-gray-400 hover:text-red-500"
                            title="Remove part"
                          >
                            <Icon icon="tabler:trash" className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="text-gray-500">
                          Qty: <span className="font-medium text-gray-700">{part.quantity_used}</span>
                        </span>
                        <span className="text-gray-500">
                          @ <span className="font-medium text-gray-700">UGX {price.toLocaleString()}</span>
                        </span>
                        <span className="text-gray-900 font-semibold">UGX {lineTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Total Parts Cost</span>
              <span className="text-sm font-bold text-gray-900">UGX {totalCost.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkOrderPartsUsedCard;
