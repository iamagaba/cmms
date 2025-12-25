import { useState, useEffect, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';

export interface QueuedAction {
  id: string;
  type: 'status_update' | 'note_add' | 'photo_upload' | 'location_update' | 'time_tracking';
  workOrderId: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
}

interface OfflineSyncState {
  isOnline: boolean;
  syncQueue: QueuedAction[];
  queueCount: number;
  isInitialized: boolean;
  isSyncing: boolean;
  lastSyncAttempt: number | null;
  sync: () => Promise<void>;
  addToQueue: (action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount' | 'status'>) => void;
  removeFromQueue: (actionId: string) => void;
  clearQueue: () => void;
  retryFailedActions: () => Promise<void>;
}

const STORAGE_KEY = 'offline_sync_queue';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base delay

/**
 * Hook for managing offline sync queue
 * Handles action queuing, persistence, and automatic sync when online
 */
export function useOfflineSync(): OfflineSyncState {
  const { isOnline } = useOnlineStatus();
  const [syncQueue, setSyncQueue] = useState<QueuedAction[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAttempt, setLastSyncAttempt] = useState<number | null>(null);

  // Load queue from localStorage on initialization
  useEffect(() => {
    const loadQueue = () => {
      try {
        const storedQueue = localStorage.getItem(STORAGE_KEY);
        if (storedQueue) {
          const parsedQueue: QueuedAction[] = JSON.parse(storedQueue);
          // Reset syncing status on app restart
          const resetQueue = parsedQueue.map(action => ({
            ...action,
            status: action.status === 'syncing' ? 'pending' as const : action.status
          }));
          setSyncQueue(resetQueue);
        }
      } catch (error) {
        console.error('Failed to load sync queue from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsInitialized(true);
      }
    };

    loadQueue();
  }, []);

  // Persist queue to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(syncQueue));
      } catch (error) {
        console.error('Failed to persist sync queue to localStorage:', error);
      }
    }
  }, [syncQueue, isInitialized]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && isInitialized && syncQueue.length > 0) {
      // Delay sync slightly to ensure connection is stable
      const timeoutId = setTimeout(() => {
        sync();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [isOnline, isInitialized, syncQueue.length]);

  // Generate unique ID for actions
  const generateActionId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Add action to queue
  const addToQueue = useCallback((actionData: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount' | 'status'>) => {
    const newAction: QueuedAction = {
      ...actionData,
      id: generateActionId(),
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
      maxRetries: actionData.maxRetries || MAX_RETRY_ATTEMPTS,
    };

    setSyncQueue(prev => [...prev, newAction]);
  }, [generateActionId]);

  // Remove action from queue
  const removeFromQueue = useCallback((actionId: string) => {
    setSyncQueue(prev => prev.filter(action => action.id !== actionId));
  }, []);

  // Clear entire queue
  const clearQueue = useCallback(() => {
    setSyncQueue([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Simulate API call for different action types
  const executeAction = async (action: QueuedAction): Promise<void> => {
    // This would be replaced with actual API calls
    switch (action.type) {
      case 'status_update':
        // Simulate status update API call
        await new Promise(resolve => setTimeout(resolve, 500));
        if (Math.random() < 0.1) { // 10% failure rate for testing
          throw new Error('Status update failed');
        }
        break;
      
      case 'note_add':
        // Simulate note addition API call
        await new Promise(resolve => setTimeout(resolve, 300));
        if (Math.random() < 0.05) { // 5% failure rate for testing
          throw new Error('Note addition failed');
        }
        break;
      
      case 'photo_upload':
        // Simulate photo upload API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (Math.random() < 0.15) { // 15% failure rate for testing
          throw new Error('Photo upload failed');
        }
        break;
      
      case 'location_update':
        // Simulate location update API call
        await new Promise(resolve => setTimeout(resolve, 200));
        break;
      
      case 'time_tracking':
        // Simulate time tracking API call
        await new Promise(resolve => setTimeout(resolve, 100));
        break;
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  };

  // Sync all pending actions
  const sync = useCallback(async (): Promise<void> => {
    if (!isOnline || isSyncing) {
      return;
    }

    const pendingActions = syncQueue.filter(action => 
      action.status === 'pending' || action.status === 'failed'
    );

    if (pendingActions.length === 0) {
      return;
    }

    setIsSyncing(true);
    setLastSyncAttempt(Date.now());

    const syncPromises = pendingActions.map(async (action) => {
      // Mark as syncing
      setSyncQueue(prev => prev.map(a => 
        a.id === action.id ? { ...a, status: 'syncing' as const } : a
      ));

      try {
        await executeAction(action);
        
        // Mark as completed and remove from queue
        setSyncQueue(prev => prev.filter(a => a.id !== action.id));
        
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
        
        const newRetryCount = action.retryCount + 1;
        const shouldRetry = newRetryCount < action.maxRetries;
        
        setSyncQueue(prev => prev.map(a => 
          a.id === action.id 
            ? { 
                ...a, 
                status: shouldRetry ? 'pending' as const : 'failed' as const,
                retryCount: newRetryCount 
              }
            : a
        ));

        // Schedule retry with exponential backoff
        if (shouldRetry) {
          const retryDelay = RETRY_DELAY_BASE * Math.pow(2, newRetryCount - 1);
          setTimeout(() => {
            if (isOnline) {
              sync();
            }
          }, retryDelay);
        }
      }
    });

    try {
      await Promise.allSettled(syncPromises);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, syncQueue]);

  // Retry only failed actions
  const retryFailedActions = useCallback(async (): Promise<void> => {
    const failedActions = syncQueue.filter(action => action.status === 'failed');
    
    if (failedActions.length === 0) {
      return;
    }

    // Reset failed actions to pending and retry
    setSyncQueue(prev => prev.map(action => 
      action.status === 'failed' 
        ? { ...action, status: 'pending' as const, retryCount: 0 }
        : action
    ));

    // Trigger sync
    if (isOnline) {
      await sync();
    }
  }, [syncQueue, isOnline, sync]);

  const queueCount = syncQueue.length;

  return {
    isOnline,
    syncQueue,
    queueCount,
    isInitialized,
    isSyncing,
    lastSyncAttempt,
    sync,
    addToQueue,
    removeFromQueue,
    clearQueue,
    retryFailedActions,
  };
}