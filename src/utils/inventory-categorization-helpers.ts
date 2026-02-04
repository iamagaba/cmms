import { 
  Settings, 
  Wrench, 
  Zap, 
  Package, 
  Droplet, 
  ShieldCheck, 
  Nut, 
  Filter, 
  Battery, 
  CircleDot,
  MoreHorizontal 
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  InventoryItem,
  ItemCategory,
  UnitOfMeasure
} from '@/types/supabase';



// Define unit of measure labels
export const UNIT_OF_MEASURE_LABELS: Record<string, string> = {
  each: 'Unit',
  pair: 'Pair',
  box: 'Box',
  case: 'Case',
  pack: 'Pack',
  roll: 'Roll',
  gallon: 'Gallon',
  liter: 'Liter',
  pound: 'Pound',
  kilogram: 'Kilogram'
};

// Define item category labels
export const ITEM_CATEGORY_LABELS: Record<string, string> = {
  electrical: 'Electrical',
  mechanical: 'Mechanical',
  consumables: 'Consumables',
  fluids: 'Fluids',
  safety: 'Safety',
  tools: 'Tools',
  fasteners: 'Fasteners',
  filters: 'Filters',
  battery: 'Battery',
  tires: 'Tires',
  other: 'Other'
};

/**
 * Format storage location for display
 * Pattern: "Warehouse > Zone > Aisle-Bin-Shelf"
 */
export function formatStorageLocation(item: InventoryItem): string {
  const parts: string[] = [];

  if (item.warehouse) {
    parts.push(item.warehouse);
  }

  if (item.zone) {
    parts.push(item.zone);
  }

  // Combine aisle, bin, shelf with dashes
  const locationParts: string[] = [];
  if (item.aisle) locationParts.push(item.aisle);
  if (item.bin) locationParts.push(item.bin);
  if (item.shelf) locationParts.push(item.shelf);

  if (locationParts.length > 0) {
    parts.push(locationParts.join('-'));
  }

  return parts.join(' > ') || 'Not specified';
}

/**
 * Calculate base unit quantity from package quantity
 */
export function calculateBaseUnits(quantity: number, unitsPerPackage: number): number {
  return quantity * (unitsPerPackage || 1);
}

/**
 * Format quantity with unit and base unit conversion
 */
export function formatQuantityWithUnit(
  quantity: number,
  unit: UnitOfMeasure = 'each',
  unitsPerPackage: number = 1
): string {
  const unitLabel = UNIT_OF_MEASURE_LABELS[unit] || unit;

  if (unit === 'each' || unitsPerPackage === 1) {
    return `${quantity} ${unitLabel}${quantity !== 1 ? 's' : ''}`;
  }

  const baseUnits = calculateBaseUnits(quantity, unitsPerPackage);
  return `${quantity} ${unitLabel}${quantity !== 1 ? 'es' : ''} (${baseUnits} units)`;
}

/**
 * Get category badge color class
 */
export function getCategoryBadgeColor(category: ItemCategory): string {
  const colors: Record<ItemCategory, string> = {
    electrical: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    mechanical: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    consumables: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    fluids: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800',
    safety: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    tools: 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30',
    fasteners: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    filters: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    battery: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    tires: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    other: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
  };
  return colors[category] || colors.other;
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: ItemCategory): LucideIcon {
  const icons: Record<ItemCategory, LucideIcon> = {
    electrical: Zap,
    mechanical: Settings,
    consumables: Package,
    fluids: Droplet,
    safety: ShieldCheck,
    tools: Wrench,
    fasteners: Nut,
    filters: Filter,
    battery: Battery,
    tires: CircleDot,
    other: MoreHorizontal,
  };
  return icons[category] || icons.other;
}

/**
 * Filter inventory items by multiple criteria
 */
export interface InventoryFilterCriteria {
  stockStatus?: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
  categories?: ItemCategory[];
  supplierId?: string | null;
  warehouse?: string | null;
  searchTerm?: string;
}

export function filterInventoryItems(
  items: InventoryItem[],
  filters: InventoryFilterCriteria
): InventoryItem[] {
  return items.filter(item => {
    // Stock status filter
    if (filters.stockStatus && filters.stockStatus !== 'all') {
      const qty = item.quantity_on_hand ?? 0;
      const reorderLvl = item.reorder_level ?? 0;

      if (filters.stockStatus === 'in-stock' && qty <= reorderLvl) return false;
      if (filters.stockStatus === 'low-stock' && (qty === 0 || qty > reorderLvl)) return false;
      if (filters.stockStatus === 'out-of-stock' && qty !== 0) return false;
    }

    // Category filter (item must have at least one matching category)
    if (filters.categories && filters.categories.length > 0) {
      const itemCategories = item.categories || [];
      const hasMatchingCategory = filters.categories.some(cat =>
        itemCategories.includes(cat)
      );
      if (!hasMatchingCategory) return false;
    }

    // Supplier filter
    if (filters.supplierId && item.supplier_id !== filters.supplierId) {
      return false;
    }

    // Warehouse filter
    if (filters.warehouse && item.warehouse !== filters.warehouse) {
      return false;
    }

    // Search term filter
    if (filters.searchTerm) {
      const query = filters.searchTerm.toLowerCase();
      const matchesSearch =
        item.name?.toLowerCase().includes(query) ||
        item.sku?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    return true;
  });
}

/**
 * Get unique warehouses from inventory items
 */
export function getUniqueWarehouses(items: InventoryItem[]): string[] {
  const warehouses = new Set<string>();
  items.forEach(item => {
    if (item.warehouse) {
      warehouses.add(item.warehouse);
    }
  });
  return Array.from(warehouses).sort();
}

/**
 * All available categories
 */
export const ALL_CATEGORIES: ItemCategory[] = [
  'electrical',
  'mechanical',
  'consumables',
  'fluids',
  'safety',
  'tools',
  'fasteners',
  'filters',
  'battery',
  'tires',
  'other',
];

/**
 * All available units of measure
 */
export const ALL_UNITS: UnitOfMeasure[] = [
  'each',
  'pair',
  'box',
  'case',
  'pack',
  'roll',
  'gallon',
  'liter',
  'pound',
  'kilogram',
];
