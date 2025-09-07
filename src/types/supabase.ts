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
  license_plate: string | null;
  battery_capacity: number | null;
  customer_id: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  status: 'Open' | 'Confirmation' | 'On Hold' | 'Ready' | 'In Progress' | 'Completed' | null;
  priority: 'High' | 'Medium' | 'Low' | null;
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
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
  is_admin: boolean | null; // Added is_admin field
}