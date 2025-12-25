import { useState, useCallback, useMemo } from 'react';
import { WorkOrder } from '../types/supabase';
import { Coordinates } from '../utils/distance';
import {
  optimizeRoute,
  calculateRouteStats,
  generateRouteSummary,
  openMapApplication,
  validateWorkOrdersForRouting,
  detectMapProvider,
  checkMapAvailability,
  RouteOptimizationResult,
  RouteStats
} from '../utils/routePlanning';
import { navigationHaptics } from '../utils/haptic';

export interface RoutePlanningState {
  isOptimizing: boolean;
  optimizationResult: RouteOptimizationResult | null;
  routeStats: RouteStats | null;
  routeSummary: string;
  error: string | null;
  mapAvailability: {
    googleMaps: boolean;
    appleMaps: boolean;
    defaultProvider: 'google' | 'apple';
  };
}

export interface RoutePlanningActions {
  optimizeRoute: (workOrders: WorkOrder[], startLocation: Coordinates) => void;
  openInMaps: (preferredProvider?: 'google' | 'apple') => boolean;
  clearRoute: () => void;
  validateWorkOrders: (workOrders: WorkOrder[]) => {
    valid: WorkOrder[];
    invalid: WorkOrder[];
    hasValidOrders: boolean;
  };
}

export interface RoutePlanningOptions {
  hapticFeedback?: boolean;
  autoOptimize?: boolean;
}

const DEFAULT_OPTIONS: Required<RoutePlanningOptions> = {
  hapticFeedback: true,
  autoOptimize: false
};

/**
 * Custom hook for route planning and optimization
 */
export function useRoutePlanning(
  options: RoutePlanningOptions = {}
): RoutePlanningState & RoutePlanningActions {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<RouteOptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mapAvailability = useMemo(() => checkMapAvailability(), []);

  const routeStats = useMemo(() => {
    if (!optimizationResult) return null;
    return calculateRouteStats(optimizationResult);
  }, [optimizationResult]);

  const routeSummary = useMemo(() => {
    if (!routeStats) return '';
    return generateRouteSummary(optimizationResult!, routeStats);
  }, [optimizationResult, routeStats]);

  const handleOptimizeRoute = useCallback(async (
    workOrders: WorkOrder[],
    startLocation: Coordinates
  ) => {
    if (workOrders.length === 0) {
      setError('No work orders provided for route optimization');
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      const validation = validateWorkOrdersForRouting(workOrders);
      
      if (!validation.hasValidOrders) {
        throw new Error('No work orders have valid location data for route planning');
      }

      if (validation.invalid.length > 0) {
        console.warn(`${validation.invalid.length} work orders excluded from route due to missing location data`);
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const result = optimizeRoute(workOrders, startLocation);
      setOptimizationResult(result);

      if (opts.hapticFeedback) {
        navigationHaptics.menuToggle();
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to optimize route';
      setError(errorMessage);
      
      if (opts.hapticFeedback) {
        navigationHaptics.error();
      }
    } finally {
      setIsOptimizing(false);
    }
  }, [opts.hapticFeedback]);

  const handleOpenInMaps = useCallback((preferredProvider?: 'google' | 'apple') => {
    if (!optimizationResult) {
      setError('No route available to open in maps');
      return false;
    }

    console.warn('Start location not available for map opening. Using default coordinates.');
    const defaultStartLocation: Coordinates = { lat: 0, lng: 0 };

    try {
      const success = openMapApplication(optimizationResult, defaultStartLocation, preferredProvider);
      
      if (success) {
        if (opts.hapticFeedback) {
          navigationHaptics.tabSelect();
        }
        setError(null);
      } else {
        setError('Failed to open map application');
        if (opts.hapticFeedback) {
          navigationHaptics.error();
        }
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open map application';
      setError(errorMessage);
      
      if (opts.hapticFeedback) {
        navigationHaptics.error();
      }
      
      return false;
    }
  }, [optimizationResult, opts.hapticFeedback]);

  const handleClearRoute = useCallback(() => {
    setOptimizationResult(null);
    setError(null);
    
    if (opts.hapticFeedback) {
      navigationHaptics.tabSelect();
    }
  }, [opts.hapticFeedback]);

  const handleValidateWorkOrders = useCallback((workOrders: WorkOrder[]) => {
    return validateWorkOrdersForRouting(workOrders);
  }, []);

  return {
    isOptimizing,
    optimizationResult,
    routeStats,
    routeSummary,
    error,
    mapAvailability,
    optimizeRoute: handleOptimizeRoute,
    openInMaps: handleOpenInMaps,
    clearRoute: handleClearRoute,
    validateWorkOrders: handleValidateWorkOrders
  };
}
/*
*
 * Enhanced hook that includes start location management
 */
export function useRoutePlanningWithLocation(
  options: RoutePlanningOptions = {}
): RoutePlanningState & RoutePlanningActions & {
  startLocation: Coordinates | null;
  setStartLocation: (location: Coordinates) => void;
} {
  const [startLocation, setStartLocation] = useState<Coordinates | null>(null);
  const routePlanning = useRoutePlanning(options);

  const openInMaps = useCallback((preferredProvider?: 'google' | 'apple') => {
    if (!routePlanning.optimizationResult) {
      return false;
    }

    if (!startLocation) {
      console.error('Start location not set for route planning');
      return false;
    }

    try {
      const success = openMapApplication(
        routePlanning.optimizationResult, 
        startLocation, 
        preferredProvider
      );
      
      return success;
    } catch (err) {
      console.error('Failed to open map application:', err);
      return false;
    }
  }, [routePlanning.optimizationResult, startLocation]);

  return {
    ...routePlanning,
    startLocation,
    setStartLocation,
    openInMaps
  };
}

/**
 * Utility hook for route planning validation
 */
export function useRoutePlanningValidation() {
  const validateForRouting = useCallback((workOrders: WorkOrder[]) => {
    const validation = validateWorkOrdersForRouting(workOrders);
    
    const errors: string[] = [];
    const warnings: string[] = [];

    if (workOrders.length === 0) {
      errors.push('No work orders selected for route planning');
    }

    if (!validation.hasValidOrders) {
      errors.push('No work orders have location data for route planning');
    }

    if (validation.invalid.length > 0) {
      warnings.push(`${validation.invalid.length} work orders will be excluded due to missing location data`);
    }

    if (validation.valid.length > 25) {
      warnings.push('Large number of work orders may result in suboptimal routing');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      validCount: validation.valid.length,
      invalidCount: validation.invalid.length
    };
  }, []);

  return { validateForRouting };
}

/**
 * Hook for managing route planning preferences
 */
export function useRoutePlanningPreferences() {
  const [preferences, setPreferences] = useState({
    preferredMapProvider: detectMapProvider(),
    hapticFeedback: true,
    autoOptimize: false,
    priorityWeighting: true
  });

  const updatePreference = useCallback(<K extends keyof typeof preferences>(
    key: K,
    value: typeof preferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  return {
    preferences,
    updatePreference
  };
}