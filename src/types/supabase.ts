export interface Location {
  id: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Technician {
  id: string;
  name: string;
  avatar: string | null;
  status: 'available' | 'busy' | 'offline' | null;
  email: string | null;
  phone: string | null;
  specialization: string | null;
  joinDate: string | null;
  lat: number | null;
  lng: number | null;
  maxConcurrentOrders: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  battery_capacity: number | null;
  customer_id: string | null;
  createdAt?: string;
  updatedAt?: string;
  date_of_manufacture: string | null;
  release_date: string | null;
  motor_number: string | null;
  mileage: number | null;
  customers?: Customer | null;
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
  is_admin: boolean | null; // Added is_admin field
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  status: 'Open' | 'Confirmation' | 'On Hold' | 'Ready' | 'In Progress' | 'Completed' | null;
  priority: 'High' | 'Medium' | 'Low' | null;
  channel: string | null;
  assignedTechnicianId: string | null;
  locationId: string | null;
  service: string | null;
  serviceNotes: string | null;
  partsUsed: { name: string; quantity: number }[] | null;
  activityLog: { timestamp: string; activity: string }[] | null;
  slaDue: string | null;
  completedAt: string | null;
  customerLat: number | null;
  customerLng: number | null;
  customerAddress: string | null;
  onHoldReason: string | null;
  appointmentDate: string | null;
  createdAt?: string;
  updatedAt?: string;
  customerId: string | null;
  vehicleId: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  vehicleModel?: string | null;
  created_by?: string | null; // Added created_by field
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  quantity_on_hand: number;
  reorder_level: number;
  unit_price: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkOrderPart {
  id: string;
  work_order_id: string;
  item_id: string;
  quantity_used: number;
  price_at_time_of_use: number;
  created_at?: string;
  inventory_items: InventoryItem; // For joined queries
}