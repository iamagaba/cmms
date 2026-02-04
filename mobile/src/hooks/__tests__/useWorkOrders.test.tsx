import React from 'react';
import {renderHook, waitFor, act} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {
  useWorkOrders,
  useUpdateWorkOrder,
  useOfflineWorkOrders,
  useWorkOrderSubscriptions,
  useWorkOrderFiltersWithStore,
} from '../useWorkOrders';
import {workOrderService} from '@/services/workOrderService';
import {useAuth} from '../useAuth';
import {useNetwork} from '../useNetwork';
import {MobileWorkOrder} from '@/types';

// Mock React Native modules
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(() => Promise.resolve({isConnected: true})),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('react-native-keychain', () => ({
  getInternetCredentials: jest.fn(),
  setInternetCredentials: jest.fn(),
  resetInternetCredentials: jest.fn(),
}));

// Mock dependencies
jest.mock('../useAuth');
jest.mock('../useNetwork');
jest.mock('@/services/workOrderService');
jest.mock('@/store/workOrderStore');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseNetwork = useNetwork as jest.MockedFunction<typeof useNetwork>;
const mockWorkOrderService = workOrderService as jest.Mocked<typeof workOrderService>;

// Mock store
const mockStore = {
  setWorkOrders: jest.fn(),
  setLoading: jest.fn(),
  setError: jest.fn(),
  setOnlineStatus: jest.fn(),
  setLastSyncTimestamp: jest.fn(),
  setFilters: jest.fn(),
  setSortOptions: jest.fn(),
  updateWorkOrder: jest.fn(),
  markForSync: jest.fn(),
  removeFromSync: jest.fn(),
  clearPendingChanges: jest.fn(),
  getFilteredWorkOrders: jest.fn(),
  getSortedWorkOrders: jest.fn(),
  getWorkOrderById: jest.fn(),
  pendingChanges: [],
  filters: {},
  sortOptions: {field: 'priority', direction: 'desc'},
};

jest.mock('@/store/workOrderStore', () => ({
  useWorkOrderStore: () => mockStore,
}));

// Test data
const mockUser = {
  id: 'tech-123',
  email: 'tech@example.com',
  role: 'technician',
};

const mockWorkOrder: MobileWorkOrder = {
  id: 'wo-123',
  workOrderNumber: 'WO-2024-001',
  status: 'New',
  priority: 'High',
  mobileStatus: 'assigned',
  customerId: 'cust-123',
  customerName: 'John Doe',
  customerPhone: '+1234567890',
  vehicleId: 'veh-123',
  vehicleModel: '2020 Toyota Camry',
  service: 'Oil Change',
  serviceNotes: 'Regular maintenance',
  assignedTechnicianId: 'tech-123',
  locationId: 'loc-123',
  customerLat: 40.7128,
  customerLng: -74.0060,
  customerAddress: '123 Main St, New York, NY',
  appointmentDate: '2024-01-15T10:00:00Z',
  createdAt: '2024-01-10T08:00:00Z',
  updatedAt: '2024-01-10T08:00:00Z',
  lastSyncTimestamp: '2024-01-10T08:00:00Z',
  localChanges: false,
};

// Test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({children}: {children: React.ReactNode}) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useWorkOrders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    mockUseNetwork.mockReturnValue({
      isOnline: true,
      isConnected: true,
    });

    mockWorkOrderService.getWorkOrders.mockResolvedValue([mockWorkOrder]);
    mockStore.getFilteredWorkOrders.mockReturnValue([mockWorkOrder]);
    mockStore.getSortedWorkOrders.mockReturnValue([mockWorkOrder]);
  });

  it('should fetch work orders successfully', async () => {
    const wrapper = createWrapper();
    
    const {result} = renderHook(() => useWorkOrders(), {wrapper});

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.workOrders).toEqual([mockWorkOrder]);
    expect(mockWorkOrderService.getWorkOrders).toHaveBeenCalledWith(
      mockUser.id,
      undefined,
      undefined
    );
    expect(mockStore.setWorkOrders).toHaveBeenCalledWith([mockWorkOrder]);
  });

  it('should handle filters and sorting', async () => {
    const wrapper = createWrapper();
    const filters = {status: ['New', 'In Progress']};
    const sort = {field: 'appointmentDate', direction: 'asc'} as const;
    
    const {result} = renderHook(() => useWorkOrders(filters, sort), {wrapper});

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockWorkOrderService.getWorkOrders).toHaveBeenCalledWith(
      mockUser.id,
      filters,
      sort
    );
    expect(mockStore.setFilters).toHaveBeenCalledWith(filters);
    expect(mockStore.setSortOptions).toHaveBeenCalledWith(sort);
  });

  it('should handle offline status', async () => {
    mockUseNetwork.mockReturnValue({
      isOnline: false,
      isConnected: false,
    });

    const wrapper = createWrapper();
    
    renderHook(() => useWorkOrders(), {wrapper});

    expect(mockStore.setOnlineStatus).toHaveBeenCalledWith(false);
  });

  it('should handle authentication errors', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    const wrapper = createWrapper();
    
    const {result} = renderHook(() => useWorkOrders(), {wrapper});

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toContain('User not authenticated');
  });
});

describe('useUpdateWorkOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    mockUseNetwork.mockReturnValue({
      isOnline: true,
      isConnected: true,
    });

    mockWorkOrderService.updateWorkOrder.mockResolvedValue({
      ...mockWorkOrder,
      status: 'In Progress',
      updatedAt: new Date().toISOString(),
    });
  });

  it('should update work order successfully when online', async () => {
    const wrapper = createWrapper();
    
    const {result} = renderHook(() => useUpdateWorkOrder(), {wrapper});

    const updates = {status: 'In Progress'};

    await act(async () => {
      await result.current.mutateAsync({
        id: mockWorkOrder.id,
        updates,
      });
    });

    expect(mockWorkOrderService.updateWorkOrder).toHaveBeenCalledWith(
      mockWorkOrder.id,
      updates
    );
    expect(mockStore.updateWorkOrder).toHaveBeenCalled();
    expect(mockStore.removeFromSync).toHaveBeenCalledWith(mockWorkOrder.id);
  });

  it('should handle offline updates', async () => {
    mockUseNetwork.mockReturnValue({
      isOnline: false,
      isConnected: false,
    });

    const wrapper = createWrapper();
    
    const {result} = renderHook(() => useUpdateWorkOrder(), {wrapper});

    const updates = {status: 'In Progress'};

    await act(async () => {
      try {
        await result.current.mutateAsync({
          id: mockWorkOrder.id,
          updates,
        });
      } catch (error) {
        // Expected to fail when work order not in cache
      }
    });

    expect(mockWorkOrderService.updateWorkOrder).not.toHaveBeenCalled();
    expect(mockStore.updateWorkOrder).toHaveBeenCalledWith(mockWorkOrder.id, updates);
    expect(mockStore.markForSync).toHaveBeenCalledWith(mockWorkOrder.id);
  });

  it('should handle update errors', async () => {
    const error = new Error('Update failed');
    mockWorkOrderService.updateWorkOrder.mockRejectedValue(error);

    const wrapper = createWrapper();
    
    const {result} = renderHook(() => useUpdateWorkOrder(), {wrapper});

    const updates = {status: 'In Progress'};

    await act(async () => {
      try {
        await result.current.mutateAsync({
          id: mockWorkOrder.id,
          updates,
        });
      } catch (e) {
        expect(e).toBe(error);
      }
    });

    expect(result.current.isError).toBe(true);
  });
});

describe('useOfflineWorkOrders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    mockUseNetwork.mockReturnValue({
      isOnline: true,
      isConnected: true,
    });
  });

  it('should return pending changes', () => {
    const pendingWorkOrder = {...mockWorkOrder, localChanges: true};
    mockStore.pendingChanges = [mockWorkOrder.id];
    mockStore.getWorkOrderById.mockReturnValue(pendingWorkOrder);

    const wrapper = createWrapper();
    
    const {result} = renderHook(() => useOfflineWorkOrders(), {wrapper});

    const pendingChanges = result.current.getPendingChanges();
    
    expect(pendingChanges).toEqual([pendingWorkOrder]);
    expect(result.current.hasPendingChanges).toBe(true);
    expect(result.current.pendingChangesCount).toBe(1);
  });

  it('should sync pending changes when online', async () => {
    const pendingWorkOrder = {...mockWorkOrder, localChanges: true};
    mockStore.pendingChanges = [mockWorkOrder.id];
    mockStore.getWorkOrderById.mockReturnValue(pendingWorkOrder);
    mockWorkOrderService.updateWorkOrder.mockResolvedValue(mockWorkOrder);

    const wrapper = createWrapper();
    
    const {result} = renderHook(() => useOfflineWorkOrders(), {wrapper});

    await act(async () => {
      const syncResults = await result.current.syncPendingChanges();
      
      expect(syncResults).toEqual([
        {id: mockWorkOrder.id, success: true}
      ]);
    });

    expect(mockWorkOrderService.updateWorkOrder).toHaveBeenCalled();
    expect(mockStore.removeFromSync).toHaveBeenCalledWith(mockWorkOrder.id);
  });

  it('should handle sync errors', async () => {
    const pendingWorkOrder = {...mockWorkOrder, localChanges: true};
    mockStore.pendingChanges = [mockWorkOrder.id];
    mockStore.getWorkOrderById.mockReturnValue(pendingWorkOrder);
    
    const error = new Error('Sync failed');
    mockWorkOrderService.updateWorkOrder.mockRejectedValue(error);

    const wrapper = createWrapper();
    
    const {result} = renderHook(() => useOfflineWorkOrders(), {wrapper});

    await act(async () => {
      const syncResults = await result.current.syncPendingChanges();
      
      expect(syncResults).toEqual([
        {id: mockWorkOrder.id, success: false, error: 'Sync failed'}
      ]);
    });

    expect(mockStore.removeFromSync).not.toHaveBeenCalled();
  });

  it('should throw error when trying to sync offline', async () => {
    mockUseNetwork.mockReturnValue({
      isOnline: false,
      isConnected: false,
    });

    const wrapper = createWrapper();
    
    const {result} = renderHook(() => useOfflineWorkOrders(), {wrapper});

    await act(async () => {
      try {
        await result.current.syncPendingChanges();
      } catch (error) {
        expect(error.message).toBe('Cannot sync while offline');
      }
    });
  });
});

describe('useWorkOrderSubscriptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    mockUseNetwork.mockReturnValue({
      isOnline: true,
      isConnected: true,
    });

    const mockSubscription = {
      unsubscribe: jest.fn(),
    };

    mockWorkOrderService.subscribeToWorkOrderUpdates.mockReturnValue(mockSubscription);
  });

  it('should set up subscription when online and authenticated', () => {
    const wrapper = createWrapper();
    
    const {result} = renderHook(() => useWorkOrderSubscriptions(), {wrapper});

    expect(mockWorkOrderService.subscribeToWorkOrderUpdates).toHaveBeenCalledWith(
      mockUser.id,
      expect.any(Function)
    );
    expect(result.current.isSubscribed).toBe(true);
  });

  it('should not set up subscription when offline', () => {
    mockUseNetwork.mockReturnValue({
      isOnline: false,
      isConnected: false,
    });

    const wrapper = createWrapper();
    
    const {result} = renderHook(() => useWorkOrderSubscriptions(), {wrapper});

    expect(mockWorkOrderService.subscribeToWorkOrderUpdates).not.toHaveBeenCalled();
    expect(result.current.isSubscribed).toBe(false);
  });

  it('should not set up subscription when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    const wrapper = createWrapper();
    
    const {result} = renderHook(() => useWorkOrderSubscriptions(), {wrapper});

    expect(mockWorkOrderService.subscribeToWorkOrderUpdates).not.toHaveBeenCalled();
    expect(result.current.isSubscribed).toBe(false);
  });
});

describe('useWorkOrderFiltersWithStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    mockStore.filters = {};
    mockStore.sortOptions = {field: 'priority', direction: 'desc'};
  });

  it('should apply filters and update store', () => {
    const wrapper = createWrapper();
    
    const {result} = renderHook(() => useWorkOrderFiltersWithStore(), {wrapper});

    const newFilters = {status: ['New']};
    const newSort = {field: 'appointmentDate', direction: 'asc'} as const;

    act(() => {
      result.current.applyFilters(newFilters, newSort);
    });

    expect(mockStore.setFilters).toHaveBeenCalledWith(newFilters);
    expect(mockStore.setSortOptions).toHaveBeenCalledWith(newSort);
  });

  it('should reset filters', () => {
    const wrapper = createWrapper();
    
    const {result} = renderHook(() => useWorkOrderFiltersWithStore(), {wrapper});

    act(() => {
      result.current.resetFilters();
    });

    expect(mockStore.clearFilters).toHaveBeenCalled();
  });

  it('should get filtered and sorted work orders', () => {
    mockStore.getFilteredWorkOrders.mockReturnValue([mockWorkOrder]);
    mockStore.getSortedWorkOrders.mockReturnValue([mockWorkOrder]);

    const wrapper = createWrapper();
    
    const {result} = renderHook(() => useWorkOrderFiltersWithStore(), {wrapper});

    const filteredAndSorted = result.current.getFilteredAndSortedWorkOrders();

    expect(filteredAndSorted).toEqual([mockWorkOrder]);
    expect(mockStore.getFilteredWorkOrders).toHaveBeenCalled();
    expect(mockStore.getSortedWorkOrders).toHaveBeenCalledWith([mockWorkOrder]);
  });
});