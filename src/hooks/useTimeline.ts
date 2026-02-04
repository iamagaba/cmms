/**
 * useTimeline Hook
 * React hook for managing timeline data and real-time updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { timelineService } from '@/services/timeline-service';
import { realtimeManager } from '@/services/realtime-manager';
import type { 
  Activity, 
  TimelineFilters, 
  RealtimeSubscription 
} from '@/types/activity-timeline';

interface UseTimelineOptions {
  workOrderId: string;
  filters?: TimelineFilters;
  enableRealTime?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseTimelineReturn {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addNote: (content: string, userId: string) => Promise<void>;
  updateFilters: (filters: TimelineFilters) => void;
  isConnected: boolean;
}

/**
 * Hook for managing timeline data with real-time updates
 */
export function useTimeline(options: UseTimelineOptions): UseTimelineReturn {
  const {
    workOrderId,
    filters,
    enableRealTime = true,
    autoRefresh = false,
    refreshInterval = 30000 // 30 seconds
  } = options;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<TimelineFilters | undefined>(filters);

  const subscriptionRef = useRef<RealtimeSubscription | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch activities from the service
   */
  const fetchActivities = useCallback(async () => {
    try {
      setError(null);
      const data = await timelineService.getActivities(workOrderId, currentFilters);
      setActivities(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch activities';
      setError(errorMessage);
      console.error('Error fetching timeline activities:', err);
    } finally {
      setLoading(false);
    }
  }, [workOrderId, currentFilters]);

  /**
   * Handle new activity from real-time updates
   */
  const handleNewActivity = useCallback((newActivity: Activity) => {
    setActivities(prev => {
      // Check if activity already exists (prevent duplicates)
      const exists = prev.some(activity => activity.id === newActivity.id);
      if (exists) {
        return prev;
      }

      // Insert in chronological order (most recent first)
      const updated = [newActivity, ...prev];
      return updated.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, []);

  /**
   * Handle activity updates from real-time
   */
  const handleActivityUpdate = useCallback((updatedActivity: Activity) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === updatedActivity.id ? updatedActivity : activity
      )
    );
  }, []);

  /**
   * Setup real-time subscription
   */
  const setupRealTimeSubscription = useCallback(() => {
    if (!enableRealTime || subscriptionRef.current) {
      return;
    }

    console.log(`Setting up real-time subscription for work order: ${workOrderId}`);

    subscriptionRef.current = realtimeManager.subscribe({
      workOrderId,
      onActivityAdded: handleNewActivity,
      onActivityUpdated: handleActivityUpdate,
      onConnectionChange: setIsConnected,
      onError: (err) => {
        console.error('Real-time subscription error:', err);
        setError(`Real-time connection error: ${err.message}`);
      }
    });
  }, [workOrderId, enableRealTime, handleNewActivity, handleActivityUpdate]);

  /**
   * Cleanup real-time subscription
   */
  const cleanupRealTimeSubscription = useCallback(() => {
    if (subscriptionRef.current) {
      console.log('Cleaning up real-time subscription');
      realtimeManager.unsubscribe(subscriptionRef.current);
      subscriptionRef.current = null;
      setIsConnected(false);
    }
  }, []);

  /**
   * Setup auto-refresh interval
   */
  const setupAutoRefresh = useCallback(() => {
    if (!autoRefresh || refreshIntervalRef.current) {
      return;
    }

    refreshIntervalRef.current = setInterval(() => {
      console.log('Auto-refreshing timeline activities');
      fetchActivities();
    }, refreshInterval);
  }, [autoRefresh, refreshInterval, fetchActivities]);

  /**
   * Cleanup auto-refresh interval
   */
  const cleanupAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  /**
   * Add a note to the timeline
   */
  const addNote = useCallback(async (content: string, userId: string) => {
    try {
      setError(null);
      const newActivity = await timelineService.addNote(workOrderId, content, userId);
      
      // If real-time is disabled, manually add the activity
      if (!enableRealTime) {
        handleNewActivity(newActivity);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add note';
      setError(errorMessage);
      throw err;
    }
  }, [workOrderId, enableRealTime, handleNewActivity]);

  /**
   * Update filters and refetch data
   */
  const updateFilters = useCallback((newFilters: TimelineFilters) => {
    setCurrentFilters(newFilters);
  }, []);

  /**
   * Manual refetch function
   */
  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchActivities();
  }, [fetchActivities]);

  // Initial data fetch
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Setup real-time subscription
  useEffect(() => {
    setupRealTimeSubscription();
    return cleanupRealTimeSubscription;
  }, [setupRealTimeSubscription, cleanupRealTimeSubscription]);

  // Setup auto-refresh
  useEffect(() => {
    setupAutoRefresh();
    return cleanupAutoRefresh;
  }, [setupAutoRefresh, cleanupAutoRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRealTimeSubscription();
      cleanupAutoRefresh();
    };
  }, [cleanupRealTimeSubscription, cleanupAutoRefresh]);

  return {
    activities,
    loading,
    error,
    refetch,
    addNote,
    updateFilters,
    isConnected
  };
}