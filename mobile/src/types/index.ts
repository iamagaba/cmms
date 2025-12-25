// Re-export types from the main CMMS project
export * from '../../src/types/supabase';

// Mobile-specific types
export interface MobileWorkOrder {
  id: string;
  workOrderNumber: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled' | 'On Hold';
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  mobileStatus: 'assigned' | 'traveling' | 'on_site' | 'in_progress' | 'completed';
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleId: string;
  vehicleModel: string;
  service: string;
  serviceNotes?: string;
  assignedTechnicianId: string;
  locationId: string;
  customerLat?: number;
  customerLng?: number;
  customerAddress?: string;
  appointmentDate?: string;
  createdAt: string;
  updatedAt: string;
  // Mobile-specific fields
  distanceFromTechnician?: number;
  estimatedTravelTime?: number;
  lastSyncTimestamp?: string;
  localChanges?: boolean;
}

export interface TechnicianLocation {
  id: string;
  technicianId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  isOnSite: boolean;
  currentWorkOrderId?: string;
}

export interface MobileSession {
  technicianId: string;
  deviceId: string;
  lastSyncTimestamp: string;
  isOnline: boolean;
  currentLocation?: TechnicianLocation;
  activeWorkOrderId?: string;
  pendingChanges: number;
}

// Root navigation parameters
export interface NavigationParams {
  Main: undefined;
  Auth: undefined;
}

// Main tab navigation parameters
export interface MainTabParams {
  Dashboard: undefined;
  WorkOrders: undefined;
  Assets: undefined;
  Profile: undefined;
}

// Stack navigation parameters for each tab
export interface DashboardStackParams {
  DashboardHome: undefined;
  MapView: undefined;
}

export interface WorkOrdersStackParams {
  WorkOrdersList: undefined;
  WorkOrderDetails: {workOrderId: string};
  WorkOrderCreate: {assetId?: string};
}

export interface AssetsStackParams {
  AssetsList: undefined;
  AssetDetails: {assetId: string};
  QRScanner: {type: 'asset' | 'part'};
}

export interface ProfileStackParams {
  ProfileHome: undefined;
  Settings: undefined;
  Performance: undefined;
}

export interface AuthStackParams {
  Login: undefined;
  BiometricSetup: undefined;
}

// Location-related types
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface WorkOrderLocation {
  id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Emergency';
  status?: string;
}

export interface NavigationDestination {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export interface ProximityTarget {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
  type: 'work_order' | 'asset' | 'location';
}

export interface ProximityEvent {
  targetId: string;
  targetName: string;
  targetType: string;
  eventType: 'enter' | 'exit';
  distance: number;
  timestamp: number;
  location: LocationCoordinates;
}

// Inventory and Parts Management Types
export interface MobileInventoryItem {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  quantity_on_hand: number;
  reorder_level: number;
  unit_price: number;
  created_at?: string;
  updated_at?: string;
  // Mobile-specific fields
  lastSyncTimestamp?: string;
  localChanges?: boolean;
  isLowStock?: boolean;
}

export interface PartUsage {
  id?: string;
  work_order_id: string;
  item_id: string;
  quantity_used: number;
  price_at_time_of_use: number;
  created_at?: string;
  // Mobile-specific fields
  localId?: string;
  synced?: boolean;
  inventory_item?: MobileInventoryItem;
}

export interface InventoryFilter {
  searchTerm?: string;
  lowStockOnly?: boolean;
  category?: string;
  sortBy?: 'name' | 'sku' | 'quantity' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export interface InventorySearchResult {
  items: MobileInventoryItem[];
  totalCount: number;
  hasMore: boolean;
}

export interface StockValidation {
  isValid: boolean;
  availableQuantity: number;
  requestedQuantity: number;
  message?: string;
}