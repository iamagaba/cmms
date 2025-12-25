import {useState, useEffect, useCallback, useRef} from 'react';
import {
  proximityService,
  ProximityTarget,
  ProximityEvent,
  ProximityEventHandler,
} from '@/services/proximityService';

export interface ProximityState {
  isMonitoring: boolean;
  targets: ProximityTarget[];
  targetsInRange: string[];
  lastEvent: ProximityEvent | null;
  error: string | null;
}

export interface UseProximityOptions {
  autoStart?: boolean;
  targets?: ProximityTarget[];
  onProximityEvent?: ProximityEventHandler;
}

export const useProximity = (options: UseProximityOptions = {}) => {
  const {autoStart = false, targets = [], onProximityEvent} = options;

  const [state, setState] = useState<ProximityState>({
    isMonitoring: false,
    targets: [],
    targetsInRange: [],
    lastEvent: null,
    error: null,
  });

  const eventHandlerRef = useRef<ProximityEventHandler | null>(null);

  /**
   * Update proximity state
   */
  const updateState = useCallback((updates: Partial<ProximityState>) => {
    setState(prev => ({...prev, ...updates}));
  }, []);

  /**
   * Internal event handler
   */
  const handleProximityEvent = useCallback((event: ProximityEvent) => {
    updateState({
      lastEvent: event,
      targetsInRange: proximityService.getTargetsInRange(),
    });

    // Call external handler if provided
    if (onProximityEvent) {
      onProximityEvent(event);
    }
  }, [updateState, onProximityEvent]);

  /**
   * Start proximity monitoring
   */
  const startMonitoring = useCallback(async (): Promise<boolean> => {
    try {
      updateState({error: null});
      
      await proximityService.startMonitoring();
      
      updateState({
        isMonitoring: true,
        targets: proximityService.getTargets(),
        targetsInRange: proximityService.getTargetsInRange(),
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start monitoring';
      updateState({
        error: errorMessage,
        isMonitoring: false,
      });
      return false;
    }
  }, [updateState]);

  /**
   * Stop proximity monitoring
   */
  const stopMonitoring = useCallback(() => {
    proximityService.stopMonitoring();
    updateState({
      isMonitoring: false,
      targetsInRange: [],
      error: null,
    });
  }, [updateState]);

  /**
   * Add proximity target
   */
  const addTarget = useCallback((target: ProximityTarget) => {
    proximityService.addTarget(target);
    updateState({
      targets: proximityService.getTargets(),
    });
  }, [updateState]);

  /**
   * Remove proximity target
   */
  const removeTarget = useCallback((targetId: string) => {
    proximityService.removeTarget(targetId);
    updateState({
      targets: proximityService.getTargets(),
      targetsInRange: proximityService.getTargetsInRange(),
    });
  }, [updateState]);

  /**
   * Clear all targets
   */
  const clearTargets = useCallback(() => {
    proximityService.clearTargets();
    updateState({
      targets: [],
      targetsInRange: [],
    });
  }, [updateState]);

  /**
   * Check proximity to specific target
   */
  const checkTargetProximity = useCallback((targetId: string) => {
    return proximityService.checkTargetProximity(targetId);
  }, []);

  /**
   * Get distance to target
   */
  const getDistanceToTarget = useCallback((targetId: string): number | null => {
    return proximityService.getDistanceToTarget(targetId);
  }, []);

  /**
   * Format distance for display
   */
  const formatDistance = useCallback((distance: number): string => {
    return proximityService.formatDistance(distance);
  }, []);

  /**
   * Create work order target
   */
  const createWorkOrderTarget = useCallback((
    workOrderId: string,
    name: string,
    latitude: number,
    longitude: number,
    radius?: number
  ): ProximityTarget => {
    return proximityService.createWorkOrderTarget(workOrderId, name, latitude, longitude, radius);
  }, []);

  /**
   * Create asset target
   */
  const createAssetTarget = useCallback((
    assetId: string,
    name: string,
    latitude: number,
    longitude: number,
    radius?: number
  ): ProximityTarget => {
    return proximityService.createAssetTarget(assetId, name, latitude, longitude, radius);
  }, []);

  /**
   * Set up event handler
   */
  useEffect(() => {
    eventHandlerRef.current = handleProximityEvent;
    proximityService.addEventHandler(handleProximityEvent);

    return () => {
      if (eventHandlerRef.current) {
        proximityService.removeEventHandler(eventHandlerRef.current);
      }
    };
  }, [handleProximityEvent]);

  /**
   * Initialize targets
   */
  useEffect(() => {
    if (targets.length > 0) {
      // Clear existing targets and add new ones
      proximityService.clearTargets();
      targets.forEach(target => {
        proximityService.addTarget(target);
      });
      
      updateState({
        targets: proximityService.getTargets(),
      });
    }
  }, [targets, updateState]);

  /**
   * Auto-start monitoring
   */
  useEffect(() => {
    if (autoStart) {
      startMonitoring();
    }

    return () => {
      if (proximityService.isMonitoringActive()) {
        stopMonitoring();
      }
    };
  }, [autoStart, startMonitoring, stopMonitoring]);

  /**
   * Update state when monitoring status changes
   */
  useEffect(() => {
    const checkStatus = () => {
      const isMonitoring = proximityService.isMonitoringActive();
      if (isMonitoring !== state.isMonitoring) {
        updateState({
          isMonitoring,
          targets: proximityService.getTargets(),
          targetsInRange: proximityService.getTargetsInRange(),
        });
      }
    };

    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, [state.isMonitoring, updateState]);

  return {
    // State
    ...state,
    
    // Actions
    startMonitoring,
    stopMonitoring,
    addTarget,
    removeTarget,
    clearTargets,
    checkTargetProximity,
    getDistanceToTarget,
    formatDistance,
    createWorkOrderTarget,
    createAssetTarget,
  };
};