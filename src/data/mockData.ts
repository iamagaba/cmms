export interface Technician {
  id: string;
  name: string;
  avatar: string;
  status: 'available' | 'busy' | 'offline';
  email: string;
  phone: string;
  specialization: 'Mechanical' | 'Electrical' | 'Diagnostics';
  joinDate: string; // ISO date string
  lat: number;
  lng: number;
  max_concurrent_orders?: number;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface WorkOrder {
  id: string;
  vehicleId: string;
  vehicleModel: string;
  customerName: string;
  customerPhone: string;
  status: 'Open' | 'In Progress' | 'On Hold' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  assignedTechnicianId: string | null;
  locationId: string;
  service: string;
  serviceNotes: string;
  partsUsed: { name: string; quantity: number }[];
  activityLog: { timestamp: string; activity: string }[];
  slaDue: string; // ISO date string
  completedAt: string | null; // ISO date string
  customerLat?: number | null;
  customerLng?: number | null;
  customerAddress?: string | null;
}

export const technicians: Technician[] = [
  { id: 'tech1', name: 'David Okello', avatar: '/placeholder.svg', status: 'available', email: 'david.okello@gogo.com', phone: '+256 772 123456', specialization: 'Electrical', joinDate: '2022-08-15T00:00:00.000Z', lat: 0.335, lng: 32.570, max_concurrent_orders: 5 },
  { id: 'tech2', name: 'Sarah Nakato', avatar: '/placeholder.svg', status: 'busy', email: 'sarah.nakato@gogo.com', phone: '+256 772 234567', specialization: 'Diagnostics', joinDate: '2021-05-20T00:00:00.000Z', lat: 0.315, lng: 32.599, max_concurrent_orders: 3 },
  { id: 'tech3', name: 'Brian Mugisha', avatar: '/placeholder.svg', status: 'available', email: 'brian.mugisha@gogo.com', phone: '+256 772 345678', specialization: 'Mechanical', joinDate: '2023-01-10T00:00:00.000Z', lat: 0.320, lng: 32.585, max_concurrent_orders: 5 },
  { id: 'tech4', name: 'Esther Achen', avatar: '/placeholder.svg', status: 'offline', email: 'esther.achen@gogo.com', phone: '+256 772 456789', specialization: 'Electrical', joinDate: '2022-11-30T00:00:00.000Z', lat: 0.058, lng: 32.460, max_concurrent_orders: 4 },
];

export const locations: Location[] = [
  { id: 'loc1', name: 'GOGO Station - Wandegeya', address: 'Wandegeya, Kampala', lat: 0.3325, lng: 32.5725 },
  { id: 'loc2', name: 'GOGO Hub - Industrial Area', address: 'Industrial Area, Kampala', lat: 0.3136, lng: 32.5941 },
  { id: 'loc3', name: 'GOGO Swap Point - Entebbe Town', address: 'Entebbe Town Road, Entebbe', lat: 0.0527, lng: 32.4637 },
];

export const workOrders: WorkOrder[] = [
  { 
    id: 'WO-001', 
    vehicleId: 'GOGO-087', 
    vehicleModel: 'GOGO S1', 
    customerName: 'John Bosco', 
    customerPhone: '+256 772 987654',
    status: 'Open', 
    priority: 'High', 
    assignedTechnicianId: null, 
    locationId: 'loc1', 
    service: 'Battery Swap Failure', 
    serviceNotes: 'Customer reported that the battery swap station is not releasing the new battery. Needs urgent attention.',
    partsUsed: [],
    activityLog: [
      { timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), activity: 'Work order created.' }
    ],
    slaDue: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
    customerLat: 0.3412,
    customerLng: 32.5701,
    customerAddress: 'Makerere University, Kampala, Uganda',
  },
  { 
    id: 'WO-002', 
    vehicleId: 'GOGO-112', 
    vehicleModel: 'GOGO S2', 
    customerName: 'Mary Nabirye', 
    customerPhone: '+256 772 876543',
    status: 'In Progress', 
    priority: 'Medium', 
    assignedTechnicianId: 'tech2', 
    locationId: 'loc2', 
    service: 'Motor Diagnostic', 
    serviceNotes: 'Vehicle is making a whining noise at high speeds. Technician Sarah is investigating.',
    partsUsed: [],
    activityLog: [
      { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), activity: 'Work order created.' },
      { timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), activity: 'Assigned to Sarah Nakato.' },
      { timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), activity: 'Status changed to In Progress.' }
    ],
    slaDue: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
  },
  { 
    id: 'WO-003', 
    vehicleId: 'GOGO-045', 
    vehicleModel: 'GOGO S1', 
    customerName: 'Robert Ssentamu', 
    customerPhone: '+256 772 765432',
    status: 'Open', 
    priority: 'Low', 
    assignedTechnicianId: null, 
    locationId: 'loc1', 
    service: 'Brake System Check',
    serviceNotes: 'Routine brake check requested by customer.',
    partsUsed: [],
    activityLog: [
      { timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), activity: 'Work order created.' }
    ],
    slaDue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
  },
  { 
    id: 'WO-004', 
    vehicleId: 'GOGO-201', 
    vehicleModel: 'GOGO Cargo', 
    customerName: 'Emily Akankwasa', 
    customerPhone: '+256 772 654321',
    status: 'On Hold', 
    priority: 'Medium', 
    assignedTechnicianId: 'tech1', 
    locationId: 'loc3', 
    service: 'Controller Unit Replacement', 
    serviceNotes: 'Controller unit is faulty. Awaiting new part from supplier. Part ETA is 2 days.',
    partsUsed: [],
    activityLog: [
      { timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), activity: 'Work order created and assigned to David Okello.' },
      { timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(), activity: 'Status changed to On Hold.' }
    ],
    slaDue: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
  },
  { 
    id: 'WO-005', 
    vehicleId: 'GOGO-153', 
    vehicleModel: 'GOGO S2', 
    customerName: 'Michael Okumu', 
    customerPhone: '+256 772 543210',
    status: 'Completed', 
    priority: 'High', 
    assignedTechnicianId: 'tech3', 
    locationId: 'loc2', 
    service: 'Full System Check',
    serviceNotes: 'Completed full system diagnostics and software update. Vehicle is operating normally.',
    partsUsed: [
      { name: 'Fuse 15A', quantity: 1 }
    ],
    activityLog: [
      { timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), activity: 'Work order created.' },
      { timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), activity: 'Assigned to Brian Mugisha.' },
      { timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), activity: 'Status changed to Completed.' }
    ],
    slaDue: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];