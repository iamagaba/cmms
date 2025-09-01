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
  { id: 'tech1', name: 'David Okello', avatar: '/placeholder.svg', status: 'available' },
  { id: 'tech2', name: 'Sarah Nakato', avatar: '/placeholder.svg', status: 'busy' },
  { id: 'tech3', name: 'Brian Mugisha', avatar: '/placeholder.svg', status: 'available' },
  { id: 'tech4', name: 'Esther Achen', avatar: '/placeholder.svg', status: 'offline' },
];

export const locations: Location[] = [
  { id: 'loc1', name: 'GOGO Station - Wandegeya', address: 'Wandegeya, Kampala' },
  { id: 'loc2', name: 'GOGO Hub - Industrial Area', address: 'Industrial Area, Kampala' },
  { id: 'loc3', name: 'GOGO Swap Point - Entebbe Town', address: 'Entebbe Town Road, Entebbe' },
];

export const workOrders: WorkOrder[] = [
  { id: 'WO-001', vehicleId: 'GOGO-087', vehicleModel: 'GOGO S1', customerName: 'John Bosco', status: 'Open', priority: 'High', assignedTechnicianId: null, locationId: 'loc1', service: 'Battery Swap Failure', slaDue: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'WO-002', vehicleId: 'GOGO-112', vehicleModel: 'GOGO S2', customerName: 'Mary Nabirye', status: 'In Progress', priority: 'Medium', assignedTechnicianId: 'tech2', locationId: 'loc2', service: 'Motor Diagnostic', slaDue: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'WO-003', vehicleId: 'GOGO-045', vehicleModel: 'GOGO S1', customerName: 'Robert Ssentamu', status: 'Open', priority: 'Low', assignedTechnicianId: null, locationId: 'loc1', service: 'Brake System Check', slaDue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'WO-004', vehicleId: 'GOGO-201', vehicleModel: 'GOGO Cargo', customerName: 'Emily Akankwasa', status: 'On Hold', priority: 'Medium', assignedTechnicianId: 'tech1', locationId: 'loc3', service: 'Controller Unit Replacement (Awaiting Part)', slaDue: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'WO-005', vehicleId: 'GOGO-153', vehicleModel: 'GOGO S2', customerName: 'Michael Okumu', status: 'Completed', priority: 'High', assignedTechnicianId: 'tech3', locationId: 'loc2', service: 'Full System Check', slaDue: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'WO-006', vehicleId: 'GOGO-099', vehicleModel: 'GOGO S1', customerName: 'Sandra Adongo', status: 'In Progress', priority: 'High', assignedTechnicianId: 'tech2', locationId: 'loc1', service: 'Dashboard Display Fault', slaDue: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'WO-007', vehicleId: 'GOGO-178', vehicleModel: 'GOGO S2', customerName: 'David Martinez', status: 'Open', priority: 'Medium', assignedTechnicianId: null, locationId: 'loc3', service: 'Scheduled Maintenance', slaDue: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString() },
];