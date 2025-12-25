import {create} from 'zustand';
import {subscribeWithSelector} from 'zustand/middleware';
import {MobileWorkOrder, TechnicianLocation} from '@/types';
import {WorkOrderFilters, WorkOrderSortOptions} from '@/services/workOrderService';

interface WorkOrderState {
  // Work order data
  workOrders: MobileWorkOrder[];
  selectedWorkOrder: MobileWorkOrder | null;
  nearbyWorkOrders: MobileWorkOrder[];
  
  // UI state
  filters: WorkOrderFilters;
  sortOptions: WorkOrderSortOptions;
  isLoading: boolean;
  error: string | null;
  
  // Sync state
  lastSyncTimestamp: string | null;
  pendingChanges: string[]; // Array of work order IDs with pending changes
  isOnline: boolean;
  
  // Location state
  currentLocation: TechnicianLocation | null;
  
  // Actions
  setWorkOrders: (workOrders: MobileWorkOrder[]) => void;
  addWorkOrder: (workOrder: MobileWorkOrder) => void;
  updateWorkOrder: (id: string, updates: Partial<MobileWorkOrder>) => void;
  removeWorkOrder: (id: string) => void;
  setSelectedWorkOrder: (workOrder: MobileWorkOrder | null) => void;
  
  // Nearby work orders
  setNearbyWorkOrders: (workOrders: MobileWorkOrder[]) => void;
  
  // Filtering and sorting
  setFilters: (filters: WorkOrderFilters) => void;
  setSortOptions: (sortOptions: WorkOrderSortOptions) => void;
  clearFilters: () => void;
  
  // UI state management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Sync management
  markForSync: (workOrderId: string) => void;
  removeFromSync: (workOrderId: string) => void;
  clearPendingChanges: () => void;
  setLastSyncTimestamp: (timestamp: string) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  
  // Location management
  setCurrentLocation: (location: TechnicianLocation | null) => void;
  
  // Computed getters
  getFilteredWorkOrders: () => MobileWorkOrder[];
  getSortedWorkOrders: (workOrders: MobileWorkOrder[]) => MobileWorkOrder[];
  getWorkOrderById: (id: string) => MobileWorkOrder | undefined;
  getPendingChangesCount: () => number;
  getWorkOrderStats: () => {
    total: number;
    inProgress: number;
    completed: number;
    overdue: number;
    todayCompleted: number;
  };
}

const defaultFilters: WorkOrderFilters = {};

const defaultSortOptions: WorkOrderSortOptions = {
  field: 'priority',
  direction: 'desc',
};

export const useWorkOrderStore = create<WorkOrderState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    workOrders: [],
    selectedWorkOrder: null,
    nearbyWorkOrders: [],
    filters: defaultFilters,
    sortOptions: defaultSortOptions,
    isLoading: false,
    error: null,
    lastSyncTimestamp: null,
    pendingChanges: [],
    isOnline: true,
    currentLocation: null,

    // Work order management actions
    setWorkOrders: (workOrders) => {
      set({
        workOrders,
        error: null,
        lastSyncTimestamp: new Date().toISOString(),
      });
    },

    addWorkOrder: (workOrder) => {
      set((state) => ({
        workOrders: [...state.workOrders, workOrder],
      }));
    },

    updateWorkOrder: (id, updates) => {
      set((state) => {
        const updatedWorkOrders = state.workOrders.map((wo) =>
          wo.id === id
            ? {
                ...wo,
                ...updates,
                updatedAt: new Date().toISOString(),
                localChanges: !state.isOnline, // Mark as local change if offline
              }
            : wo
        );

        // Update selected work order if it's the one being updated
        const updatedSelectedWorkOrder =
          state.selectedWorkOrder?.id === id
            ? { ...state.selectedWorkOrder, ...updates }
            : state.selectedWorkOrder;

        return {
          workOrders: updatedWorkOrders,
          selectedWorkOrder: updatedSelectedWorkOrder,
          pendingChanges: state.isOnline
            ? state.pendingChanges
            : [...new Set([...state.pendingChanges, id])],
        };
      });
    },

    removeWorkOrder: (id) => {
      set((state) => ({
        workOrders: state.workOrders.filter((wo) => wo.id !== id),
        selectedWorkOrder:
          state.selectedWorkOrder?.id === id ? null : state.selectedWorkOrder,
        pendingChanges: state.pendingChanges.filter((woId) => woId !== id),
      }));
    },

    setSelectedWorkOrder: (workOrder) => {
      set({ selectedWorkOrder: workOrder });
    },

    // Nearby work orders
    setNearbyWorkOrders: (workOrders) => {
      set({ nearbyWorkOrders: workOrders });
    },

    // Filtering and sorting
    setFilters: (filters) => {
      set({ filters });
    },

    setSortOptions: (sortOptions) => {
      set({ sortOptions });
    },

    clearFilters: () => {
      set({ filters: defaultFilters });
    },

    // UI state management
    setLoading: (loading) => {
      set({ isLoading: loading });
    },

    setError: (error) => {
      set({ error });
    },

    // Sync management
    markForSync: (workOrderId) => {
      set((state) => ({
        pendingChanges: [...new Set([...state.pendingChanges, workOrderId])],
      }));
    },

    removeFromSync: (workOrderId) => {
      set((state) => ({
        pendingChanges: state.pendingChanges.filter((id) => id !== workOrderId),
      }));
    },

    clearPendingChanges: () => {
      set({ pendingChanges: [] });
    },

    setLastSyncTimestamp: (timestamp) => {
      set({ lastSyncTimestamp: timestamp });
    },

    setOnlineStatus: (isOnline) => {
      set({ isOnline });
    },

    // Location management
    setCurrentLocation: (location) => {
      set({ currentLocation: location });
    },

    // Computed getters
    getFilteredWorkOrders: () => {
      const { workOrders, filters } = get();
      let filtered = [...workOrders];

      // Apply status filter
      if (filters.status?.length) {
        filtered = filtered.filter((wo) => filters.status!.includes(wo.status));
      }

      // Apply priority filter
      if (filters.priority?.length) {
        filtered = filtered.filter((wo) => filters.priority!.includes(wo.priority));
      }

      // Apply search query filter
      if (filters.searchQuery?.trim()) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (wo) =>
            wo.workOrderNumber.toLowerCase().includes(query) ||
            wo.customerName.toLowerCase().includes(query) ||
            wo.vehicleModel.toLowerCase().includes(query) ||
            wo.service.toLowerCase().includes(query) ||
            wo.customerAddress?.toLowerCase().includes(query)
        );
      }

      // Apply date range filter
      if (filters.dateRange) {
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        filtered = filtered.filter((wo) => {
          if (!wo.appointmentDate) return false;
          const appointmentDate = new Date(wo.appointmentDate);
          return appointmentDate >= startDate && appointmentDate <= endDate;
        });
      }

      return filtered;
    },

    getSortedWorkOrders: (workOrders) => {
      const { sortOptions } = get();
      const sorted = [...workOrders];

      sorted.sort((a, b) => {
        let comparison = 0;

        switch (sortOptions.field) {
          case 'priority': {
            const priorityOrder = { Emergency: 4, High: 3, Medium: 2, Low: 1 };
            comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
            break;
          }
          case 'appointmentDate': {
            const dateA = a.appointmentDate ? new Date(a.appointmentDate).getTime() : 0;
            const dateB = b.appointmentDate ? new Date(b.appointmentDate).getTime() : 0;
            comparison = dateA - dateB;
            break;
          }
          case 'createdAt': {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            comparison = dateA - dateB;
            break;
          }
          case 'distance': {
            const distanceA = a.distanceFromTechnician || Infinity;
            const distanceB = b.distanceFromTechnician || Infinity;
            comparison = distanceA - distanceB;
            break;
          }
          default:
            comparison = 0;
        }

        return sortOptions.direction === 'desc' ? -comparison : comparison;
      });

      return sorted;
    },

    getWorkOrderById: (id) => {
      const { workOrders } = get();
      return workOrders.find((wo) => wo.id === id);
    },

    getPendingChangesCount: () => {
      const { pendingChanges } = get();
      return pendingChanges.length;
    },

    getWorkOrderStats: () => {
      const { workOrders } = get();
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();

      const stats = {
        total: workOrders.length,
        inProgress: 0,
        completed: 0,
        overdue: 0,
        todayCompleted: 0,
      };

      workOrders.forEach((wo) => {
        // Count in progress
        if (wo.status === 'In Progress' || wo.mobileStatus === 'in_progress') {
          stats.inProgress++;
        }

        // Count completed
        if (wo.status === 'Completed' || wo.mobileStatus === 'completed') {
          stats.completed++;
          
          // Count today's completed
          if (wo.updatedAt.startsWith(today)) {
            stats.todayCompleted++;
          }
        }

        // Count overdue (appointment date passed and not completed)
        if (wo.appointmentDate && wo.status !== 'Completed') {
          const appointmentDate = new Date(wo.appointmentDate);
          if (appointmentDate < now) {
            stats.overdue++;
          }
        }
      });

      return stats;
    },
  }))
);

// Selectors for optimized re-renders
export const selectWorkOrders = (state: WorkOrderState) => state.workOrders;
export const selectSelectedWorkOrder = (state: WorkOrderState) => state.selectedWorkOrder;
export const selectNearbyWorkOrders = (state: WorkOrderState) => state.nearbyWorkOrders;
export const selectFilters = (state: WorkOrderState) => state.filters;
export const selectSortOptions = (state: WorkOrderState) => state.sortOptions;
export const selectIsLoading = (state: WorkOrderState) => state.isLoading;
export const selectError = (state: WorkOrderState) => state.error;
export const selectPendingChanges = (state: WorkOrderState) => state.pendingChanges;
export const selectIsOnline = (state: WorkOrderState) => state.isOnline;
export const selectCurrentLocation = (state: WorkOrderState) => state.currentLocation;

// Computed selectors
export const selectFilteredAndSortedWorkOrders = (state: WorkOrderState) => {
  const filtered = state.getFilteredWorkOrders();
  return state.getSortedWorkOrders(filtered);
};

export const selectWorkOrderStats = (state: WorkOrderState) => state.getWorkOrderStats();
export const selectPendingChangesCount = (state: WorkOrderState) => state.getPendingChangesCount();