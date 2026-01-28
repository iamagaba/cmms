import { 
  ArrowLeft, 
  Clock, 
  RefreshCw, 
  Settings, 
  Download, 
  AlertCircle, 
  Trash2, 
  ArrowRight, 
  Package, 
  MoreHorizontal 
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { InventoryItem, AdjustmentReason, BatchAdjustmentInput } from '@/types/supabase';


export interface AdjustmentValidationResult {
  valid: boolean;
  error?: string;
}

export interface BatchValidationResult {
  valid: boolean;
  errors: Array<{
    itemId: string;
    itemName: string;
    error: string;
  }>;
}

/**
 * Validates a single stock adjustment to ensure it won't result in negative quantity
 */
export function validateAdjustment(
  item: InventoryItem,
  quantityDelta: number
): AdjustmentValidationResult {
  const currentQuantity = item.quantity_on_hand ?? 0;
  const projectedQuantity = currentQuantity + quantityDelta;

  if (projectedQuantity < 0) {
    return {
      valid: false,
      error: `Adjustment would result in negative quantity (${projectedQuantity}). Current: ${currentQuantity}, Delta: ${quantityDelta}`,
    };
  }

  return { valid: true };
}

/**
 * Calculates the projected quantity after an adjustment
 */
export function calculateProjectedQuantity(
  currentQuantity: number,
  quantityDelta: number
): number {
  return currentQuantity + quantityDelta;
}

/**
 * Validates a batch of adjustments
 */
export function validateBatchAdjustment(
  items: Array<{ item: InventoryItem; quantityDelta: number }>,
  reason: AdjustmentReason | null,
  notes: string | null
): BatchValidationResult {
  const errors: BatchValidationResult['errors'] = [];

  // Check if there are any items
  if (items.length === 0) {
    return {
      valid: false,
      errors: [{ itemId: '', itemName: '', error: 'Please add at least one item to adjust' }],
    };
  }

  // Check if reason is selected
  if (!reason) {
    return {
      valid: false,
      errors: [{ itemId: '', itemName: '', error: 'Please select a reason for this adjustment' }],
    };
  }

  // Check if "other" reason has notes
  if (reason === 'other' && (!notes || notes.trim() === '')) {
    return {
      valid: false,
      errors: [{ itemId: '', itemName: '', error: 'Please provide notes explaining this adjustment' }],
    };
  }

  // Validate each item
  for (const { item, quantityDelta } of items) {
    // Check if quantity delta is zero
    if (quantityDelta === 0) {
      errors.push({
        itemId: item.id,
        itemName: item.name,
        error: 'Quantity change cannot be zero',
      });
      continue;
    }

    const validation = validateAdjustment(item, quantityDelta);
    if (!validation.valid) {
      errors.push({
        itemId: item.id,
        itemName: item.name,
        error: validation.error || 'Invalid adjustment',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Formats a batch adjustment input for the API
 */
export function formatBatchAdjustmentInput(
  items: Array<{ item: InventoryItem; quantityDelta: number }>,
  reason: AdjustmentReason,
  notes?: string
): BatchAdjustmentInput {
  return {
    items: items.map(({ item, quantityDelta }) => ({
      inventory_item_id: item.id,
      quantity_delta: quantityDelta,
    })),
    reason,
    notes: notes?.trim() || undefined,
  };
}

/**
 * Gets the color class for an adjustment reason badge
 */
export function getReasonBadgeColor(reason: AdjustmentReason): string {
  switch (reason) {
    case 'received':
    case 'transfer_in':
    case 'returned':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
    case 'damaged':
    case 'theft':
    case 'expired':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    case 'transfer_out':
      return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
    case 'cycle_count':
    case 'initial_stock':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    case 'other':
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
  }
}

/**
 * Gets the icon for an adjustment reason
 */
export function getReasonIcon(reason: AdjustmentReason): LucideIcon {
  switch (reason) {
    case 'received':
      return Download;
    case 'damaged':
      return AlertCircle;
    case 'returned':
      return RefreshCw;
    case 'cycle_count':
      return Settings;
    case 'theft':
      return Trash2;
    case 'expired':
      return Clock;
    case 'transfer_out':
      return ArrowRight;
    case 'transfer_in':
      return ArrowLeft;
    case 'initial_stock':
      return Package;
    case 'other':
    default:
      return MoreHorizontal;
  }
}
