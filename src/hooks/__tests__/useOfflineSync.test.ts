import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOfflineSync } from '../useOfflineSync';

// Mock the useOnlineStatus hook
vi.mock('../useOnlineStatus', () => ({
  useOnlineStatus: vi.fn(() => ({ isOnline: true }))
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useOfflineSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should initialize with empty queue', () => {
    const { result } = renderHook(() => useOfflineSync());
    
    expect(result.current.syncQueue).toEqual([]);
    expect(result.current.queueCount).toBe(0);
    expect(result.current.isSyncing).toBe(false);
  });

  it('should add actions to queue', () => {
    const { result } = renderHook(() => useOfflineSync());
    
    act(() => {
      result.current.addToQueue({
        type: 'status_update',
        workOrderId: 'wo-123',
        data: { status: 'completed' },
        maxRetries: 3
      });
    });

    expect(result.current.queueCount).toBe(1);
    expect(result.current.syncQueue[0]).toMatchObject({
      type: 'status_update',
      workOrderId: 'wo-123',
      data: { status: 'completed' },
      status: 'pending',
      retryCount: 0
    });
  });

  it('should remove actions from queue', () => {
    const { result } = renderHook(() => useOfflineSync());
    
    act(() => {
      result.current.addToQueue({
        type: 'status_update',
        workOrderId: 'wo-123',
        data: { status: 'completed' },
        maxRetries: 3
      });
    });

    const actionId = result.current.syncQueue[0].id;

    act(() => {
      result.current.removeFromQueue(actionId);
    });

    expect(result.current.queueCount).toBe(0);
    expect(result.current.syncQueue).toEqual([]);
  });

  it('should clear entire queue', () => {
    const { result } = renderHook(() => useOfflineSync());
    
    act(() => {
      result.current.addToQueue({
        type: 'status_update',
        workOrderId: 'wo-123',
        data: { status: 'completed' },
        maxRetries: 3
      });
      result.current.addToQueue({
        type: 'note_add',
        workOrderId: 'wo-456',
        data: { note: 'Test note' },
        maxRetries: 3
      });
    });

    expect(result.current.queueCount).toBe(2);

    act(() => {
      result.current.clearQueue();
    });

    expect(result.current.queueCount).toBe(0);
    expect(result.current.syncQueue).toEqual([]);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('offline_sync_queue');
  });

  it('should persist queue to localStorage', () => {
    const { result } = renderHook(() => useOfflineSync());
    
    act(() => {
      result.current.addToQueue({
        type: 'status_update',
        workOrderId: 'wo-123',
        data: { status: 'completed' },
        maxRetries: 3
      });
    });

    // Wait for the effect to run
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'offline_sync_queue',
      expect.stringContaining('"type":"status_update"')
    );
  });

  it('should load queue from localStorage on initialization', () => {
    const mockQueue = [{
      id: 'test-id',
      type: 'status_update',
      workOrderId: 'wo-123',
      data: { status: 'completed' },
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3,
      status: 'pending'
    }];

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockQueue));

    const { result } = renderHook(() => useOfflineSync());

    expect(result.current.queueCount).toBe(1);
    expect(result.current.syncQueue[0]).toMatchObject({
      type: 'status_update',
      workOrderId: 'wo-123',
      status: 'pending'
    });
  });

  it('should handle corrupted localStorage data gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json');

    const { result } = renderHook(() => useOfflineSync());

    expect(result.current.queueCount).toBe(0);
    expect(result.current.syncQueue).toEqual([]);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('offline_sync_queue');
  });
});