// Re-export from generated types
export * from './supabase-generated';

// Re-export activity timeline types
export * from './activity-timeline';

// Custom type aliases for convenience
export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  description?: string | null;
  quantity_on_hand: number;
  reorder_level: number;
  unit_price: number;
  categories?: string[] | null;
  supplier_id?: string | null;
  unit_of_measure: string;
  units_per_package: number;
  warehouse?: string | null;
  zone?: string | null;
  aisle?: string | null;
  bin?: string | null;
  shelf?: string | null;
  model?: string | null;
  created_at: string;
  updated_at: string;
};

export type ItemCategory =
  | 'electrical'
  | 'mechanical'
  | 'consumables'
  | 'fluids'
  | 'safety'
  | 'tools'
  | 'fasteners'
  | 'filters'
  | 'battery'
  | 'tires'
  | 'other';

export type UnitOfMeasure =
  | 'each'
  | 'pair'
  | 'box'
  | 'case'
  | 'pack'
  | 'roll'
  | 'gallon'
  | 'liter'
  | 'pound'
  | 'kilogram';

export type Supplier = {
  id: string;
  name: string;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type Customer = {
  id: string;
  name: string;
  phone?: string | null;
  customer_type?: string | null;
  customerType?: string | null; // Alias for camelCase access after snakeToCamelCase conversion
  created_at: string;
  updated_at: string;
};


export type Technician = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  status?: string | null;
  lat?: number | null;
  lng?: number | null;
  specializations?: string[] | null;
  max_concurrent_orders?: number | null;
  location_id?: string | null;
  user_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkOrder = {
  id: string;
  work_order_number?: string | null;
  vehicle_id?: string | null;
  customer_id?: string | null;
  vehicle_model?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  status?: string | null;
  priority?: string | null;
  assigned_technician_id?: string | null;
  location_id?: string | null;
  service?: string | null;
  service_notes?: string | null;
  parts_used?: any | null;
  activity_log?: any | null;
  sla_due?: string | null;
  completed_at?: string | null;
  customer_lat?: number | null;
  customerLat?: number | null; // Alias for camelCase
  customer_lng?: number | null;
  customerLng?: number | null; // Alias for camelCase
  customer_address?: string | null;
  on_hold_reason?: string | null;
  appointment_date?: string | null;
  created_by?: string | null;
  channel?: string | null;
  service_category_id?: string | null;
  confirmed_at?: string | null;
  work_started_at?: string | null;
  created_at: string;
  updated_at: string;
  technician?: Technician;
  customer?: any;
  confirmation_call_completed?: boolean | null;
  confirmation_call_notes?: string | null;
  confirmation_call_by?: string | null;
  confirmation_call_at?: string | null;
  confirmation_status_entered_at?: string | null;
  vehicle?: any;
};

export type Location = {
  id: string;
  name: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  status?: string | null;
  created_at: string;
  updated_at: string;
};

export type Shift = {
  id: string;
  technician_id: string;
  start_datetime: string;
  end_datetime: string;
  location_id?: string | null;
  shift_type: string;
  status: string;
  notes?: string | null;
  break_duration_minutes?: number | null;
  created_by?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  technician?: Technician;
  location?: Location;
};

export type ScheduleEvent = {
  id: string;
  title: string;
  date: string;
  event_type?: string | null;
  all_day?: boolean | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkOrderPart = {
  id: string;
  work_order_id: string;
  inventory_item_id: string;
  quantity_used: number;
  unit_cost: number;
  total_cost?: number | null;
  notes?: string | null;
  added_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  inventory_item?: InventoryItem;
};

export type Vehicle = {
  id: string;
  license_plate: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  customer_id?: string | null;
  status?: string | null;
  mileage?: number | null;
  battery_capacity?: number | null;
  motor_number?: string | null;
  date_of_manufacture?: string | null;
  release_date?: string | null;
  warranty_start_date?: string | null;
  warranty_end_date?: string | null;
  warranty_months?: number | null;
  is_company_asset?: boolean | null;
  is_emergency_bike?: boolean | null;
  created_at: string;
  updated_at: string;
};


export type AdjustmentReason =
  | 'received'
  | 'damaged'
  | 'returned'
  | 'cycle_count'
  | 'theft'
  | 'expired'
  | 'transfer_out'
  | 'transfer_in'
  | 'initial_stock'
  | 'other';

export const ADJUSTMENT_REASON_LABELS: Record<AdjustmentReason, string> = {
  received: 'Received',
  damaged: 'Damaged',
  returned: 'Returned',
  cycle_count: 'Cycle Count',
  theft: 'Theft',
  expired: 'Expired',
  transfer_out: 'Transfer Out',
  transfer_in: 'Transfer In',
  initial_stock: 'Initial Stock',
  other: 'Other'
};

export type StockAdjustment = {
  id: string;
  inventory_item_id?: string | null;
  quantity_before: number;
  quantity_after: number;
  quantity_delta: number;
  reason: AdjustmentReason;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  inventory_item?: InventoryItem;
  inventory_items?: { id: string; name: string; sku: string };
  profiles?: { first_name?: string | null; last_name?: string | null };
};

export type BatchAdjustmentInput = {
  items: Array<{
    inventory_item_id: string;
    quantity_delta: number;
  }>;
  reason: AdjustmentReason;
  notes?: string;
};


export type LossType =
  | 'theft'
  | 'damage'
  | 'expiration'
  | 'administrative_error'
  | 'vendor_error'
  | 'unknown';

export const LOSS_TYPE_LABELS: Record<LossType, string> = {
  theft: 'Theft',
  damage: 'Damage',
  expiration: 'Expiration',
  administrative_error: 'Administrative Error',
  vendor_error: 'Vendor Error',
  unknown: 'Unknown'
};
