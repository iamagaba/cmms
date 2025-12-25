export interface WorkOrder {
  id: string
  workOrderNumber: string
  status: 'Open' | 'Confirmation' | 'On Hold' | 'Ready' | 'In Progress' | 'Completed' | null
  priority: 'High' | 'Medium' | 'Low' | null
  channel: string | null
  assignedTechnicianId: string | null
  locationId: string | null
  service: string | null
  serviceNotes: string | null
  partsUsed: { name: string; quantity: number }[] | null
  activityLog: { timestamp: string; activity: string; userId: string | null }[] | null
  slaDue: string | null
  completedAt: string | null
  customerLat: number | null
  customerLng: number | null
  customerAddress: string | null
  onHoldReason: string | null
  appointmentDate: string | null
  created_at?: string
  updated_at?: string
  customerId: string | null
  vehicleId: string | null
  customerName?: string | null
  customerPhone?: string | null
  vehicleModel?: string | null
  created_by?: string | null
  service_category_id: string | null
  confirmed_at: string | null
  work_started_at: string | null
  sla_timers_paused_at: string | null
  total_paused_duration_seconds: number | null
  initialDiagnosis: string | null
  issueType: string | null
  faultCode: string | null
  maintenanceNotes: string | null
  hasActiveLoaner?: boolean | null
  has_active_loaner?: boolean | null
  emergency_bike_notified_at?: string | null
  is_emergency_bike_eligible?: boolean
  // Joined data
  customers?: Customer | null
  vehicles?: Vehicle | null
  technicians?: Technician | null
  locations?: Location | null
}

export interface Customer {
  id: string
  name: string
  phone: string | null
  customerType?: 'WATU' | 'Cash' | 'B2B' | null
  customer_type?: 'WATU' | 'Cash' | 'B2B' | null
  created_at?: string
  updated_at?: string
}

export interface Vehicle {
  id: string
  vin: string
  make: string
  model: string
  year: number
  license_plate: string
  battery_capacity: number | null
  customer_id: string | null
  is_company_asset?: boolean | null
  is_emergency_bike?: boolean | null
  status?: 'Normal' | 'Available' | 'In Repair' | 'Decommissioned' | null
  created_at?: string
  updated_at?: string
  date_of_manufacture: string | null
  release_date: string | null
  motor_number: string | null
  mileage: number | null
}

export interface Technician {
  id: string
  name: string
  avatar: string | null
  status: 'available' | 'busy' | 'offline' | null
  email: string | null
  phone: string | null
  specializations: string[] | null
  lat: number | null
  lng: number | null
  max_concurrent_orders: number | null
  location_id?: string | null
  created_at?: string
  updated_at?: string
}

export interface Location {
  id: string
  name: string
  address: string | null
  lat: number | null
  lng: number | null
  created_at?: string
  updated_at?: string
}
