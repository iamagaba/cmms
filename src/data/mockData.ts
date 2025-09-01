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
  { id: 'loc1', name: 'Kampala Central Hub', address: '123 Kampala Rd, Kampala' },
  { id: 'loc2', name: 'Entebbe Road Station', address: '456 Entebbe Rd, Entebbe' },
  { id: 'loc3', name: 'Makerere Mobile Unit', address: '789 Makerere Hill, Kampala' },
];

export const workOrders: WorkOrder[] = [
  { id: 'WO-001', vehicleId: 'ZEM-001', vehicleModel: 'Zembo Storm Z-2', customerName: 'John Bosco', status: 'Open', priority: 'High', assignedTechnicianId: null, locationId: 'loc1', service: 'Battery Swap', slaDue: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'WO-002', vehicleId: 'BDW-002', vehicleModel: 'Bodawerk E-Boda', customerName: 'Mary Nabirye', status: 'In Progress', priority: 'Medium', assignedTechnicianId: 'tech2', locationId: 'loc2', service: 'Motor Controller Check', slaDue: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'WO-003', vehicleId: 'GUG-003', vehicleModel: 'Gugu M-1', customerName: 'Robert Ssentamu', status: 'Open', priority: 'Low', assignedTechnicianId: null, locationId: 'loc1', service: 'Brake Pad Replacement', slaDue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'WO-004', vehicleId: 'ZEM-004', vehicleModel: 'Zembo Storm Z-3', customerName: 'Emily Akankwasa', status: 'On Hold', priority: 'Medium', assignedTechnicianId: 'tech1', locationId: 'loc3', service: 'Software Update (Awaiting Part)', slaDue: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'WO-005', vehicleId: 'BDW-005', vehicleModel: 'Bodawerk Cargo', customerName: 'Michael Okumu', status: 'Completed', priority: 'High', assignedTechnicianId: 'tech3', locationId: 'loc2', service: 'Full System Check', slaDue: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'WO-006', vehicleId: 'GUG-006', vehicleModel: 'Gugu M-2', customerName: 'Sandra Adongo', status: 'In Progress', priority: 'High', assignedTechnicianId: 'tech2', locationId: 'loc1', service: 'Inverter Replacement', slaDue: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'WO-007', vehicleId: 'ZEM-007', vehicleModel: 'Zembo Classic', customerName: 'David Martinez', status: 'Open', priority: 'Medium', assignedTechnicianId: null, locationId: 'loc3', service: 'Chain and Sprocket Service', slaDue: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString() },
];