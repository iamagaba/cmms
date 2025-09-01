export interface Technician {
  id: string;
  name: string;
  avatar: string;
  status: 'available' | 'busy' | 'offline';
}

export interface Location {
  id: string;
  name: string;
  address: string;
}

export interface WorkOrder {
  id: string;
  vehicleId: string;
  vehicleModel: string;
  customerName: string;
  status: 'Open' | 'In Progress' | 'On Hold' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  assignedTechnicianId: string | null;
  locationId: string;
  service: string;
  slaDue: string; // ISO date string
}

export const technicians: Technician[] = [
  { id: 'tech1', name: 'Alex Johnson', avatar: '/placeholder.svg', status: 'available' },
  { id: 'tech2', name: 'Maria Garcia', avatar: '/placeholder.svg', status: 'busy' },
  { id: 'tech3', name: 'James Smith', avatar: '/placeholder.svg', status: 'available' },
  { id: 'tech4', name: 'Patricia Williams', avatar: '/placeholder.svg', status: 'offline' },
];

export const locations: Location[] = [
  { id: 'loc1', name: 'Downtown Service Center', address: '123 Main St, Metropolis' },
  { id: 'loc2', name: 'Northside Charging Hub', address: '456 Oak Ave, Star City' },
  { id: 'loc3', name: 'West End Mobile Unit', address: '789 Pine Ln, Gotham' },
];

export const workOrders: WorkOrder[] = [
  { id: 'WO-001', vehicleId: 'EV-54321', vehicleModel: 'Tesla Model S', customerName: 'John Doe', status: 'Open', priority: 'High', assignedTechnicianId: null, locationId: 'loc1', service: 'Battery Diagnostic', slaDue: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'WO-002', vehicleId: 'EV-98765', vehicleModel: 'Nissan Leaf', customerName: 'Jane Smith', status: 'In Progress', priority: 'Medium', assignedTechnicianId: 'tech2', locationId: 'loc2', service: 'Charging Port Repair', slaDue: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'WO-003', vehicleId: 'EV-11223', vehicleModel: 'Chevy Bolt', customerName: 'Robert Brown', status: 'Open', priority: 'Low', assignedTechnicianId: null, locationId: 'loc1', service: 'Tire Rotation', slaDue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'WO-004', vehicleId: 'EV-44556', vehicleModel: 'Ford Mustang Mach-E', customerName: 'Emily Davis', status: 'On Hold', priority: 'Medium', assignedTechnicianId: 'tech1', locationId: 'loc3', service: 'Software Update (Awaiting Part)', slaDue: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'WO-005', vehicleId: 'EV-66778', vehicleModel: 'Rivian R1T', customerName: 'Michael Wilson', status: 'Completed', priority: 'High', assignedTechnicianId: 'tech3', locationId: 'loc2', service: 'Full System Check', slaDue: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'WO-006', vehicleId: 'EV-88990', vehicleModel: 'Hyundai Ioniq 5', customerName: 'Sarah Miller', status: 'In Progress', priority: 'High', assignedTechnicianId: 'tech2', locationId: 'loc1', service: 'Inverter Replacement', slaDue: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'WO-007', vehicleId: 'EV-12345', vehicleModel: 'Kia EV6', customerName: 'David Martinez', status: 'Open', priority: 'Medium', assignedTechnicianId: null, locationId: 'loc3', service: 'Brake Fluid Change', slaDue: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString() },
];