import {useState, useEffect, useCallback, useRef} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {
  locationService,
  LocationCoordinates,
  LocationError,
  LocationPermissionStatus,
} from '@/services/locationService';

export interface LocationState {
  currentLocation: LocationCoordinates | null;
  isLoading: boolean;
  error: LocationError | null;
  permissionStatus: LocationPermissionStatus | null;
  isTracking: boolean;
}

export interface UseLocationOptions {
  enableTracking?: boolean;
  trackingInterval?: number;
  requestPermissionOnMount?: boolean;
  enableBackgroundTracking?: boolean;
}

export const useLocation = (options: UseLocationOptions = {}) => {
  const {
    enableTracking = false,
    requestPermissionOnMount = true,
    enableBackgroundTracking = false,
  } = options;

  const [state, setState] = useState<LocationState>({
    currentLocation: null,
    isLoading: false,
    error: null,
    permissionStatus: null,
    isTracking: false,
  });

  const appState = useRef(AppState.currentState);
  const trackingRef = useRef(false);

  /**
   * Update location state
   */
  const updateState = useCallback((updates: Partial<LocationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Check and update permission status
   */
  const checkPermissionStatus = useCallback(async () => {
    try {
      const status = await locationService.checkLocationPermission();
      updateState({ permissionStatus: status });
      return status;
    } catch (error) {
      console.error('Error checking location permission:', error);
      updateState({ permissionStatus: LocationPermissionStatus.DENIED });
      return LocationPermissionStatus.DENIED;
    }
  }, [updateState]);

  /**
   * Request location permission
   */
  const requestPermission = useCallback(async (): Promise<LocationPermissionStatus> => {
    try {
      updateState({ isLoading: true, error: null });
      const status = await locationService.requestLocationPermission();
      updateState({ permissionStatus: status, isLoading: false });
      return status;
    } catch (error) {
      const locationError: LocationError = {
        code: -1,
        message: error instanceof Error ? error.message : 'Failed to request permission',
      };
      updateState({ 
        error: locationError, 
        isLoading: false,
        permissionStatus: LocationPermissionStatus.DENIED 
      });
      return LocationPermissionStatus.DENIED;
    }
  }, [updateState]);

  /**
   * Get current location
   */
  const getCurrentLocation = useCallback(async (): Promise<LocationCoordinates | null> => {
    try {
      updateState({ isLoading: true, error: null });
      
      // Check permission first
      const permissionStatus = await checkPermissionStatus();
      if (permissionStatus !== LocationPermissionStatus.GRANTED) {
        throw new Error(`Location permission not granted: ${permissionStatus}`);
      }

      const location = await locationService.getCurrentLocation();
      updateState({ 
        currentLocation: location, 
        isLoading: false,
        error: null 
      });
      return location;
    } catch (error) {
      const locationError: LocationError = {
        code: error instanceof Error && 'code' in error ? (error as any).code : -1,
        message: error instanceof Error ? error.message : 'Failed to get location',
      };
      updateState({ 
        error: locationError, 
        isLoading: false 
      });
      return null;
    }
  }, [updateState, checkPermissionStatus]);

  /**
   * Start location tracking
   */
  const startTracking = useCallback(async (): Promise<boolean> => {
    try {
      if (trackingRef.current) {
        console.warn('Location tracking is already active');
        return true;
      }

      updateState({ isLoading: true, error: null });

      // Check permission first
      const permissionStatus = await checkPermissionStatus();
      if (permissionStatus !== LocationPermissionStatus.GRANTED) {
        const newStatus = await requestPermission();
        if (newStatus !== LocationPermissionStatus.GRANTED) {
          throw new Error(`Location permission not granted: ${newStatus}`);
        }
      }

      await locationService.startLocationTracking(
        (location: LocationCoordinates) => {
          updateState({ 
            currentLocation: location,
            error: null 
          });
        },
        (error: LocationError) => {
          updateState({ error });
        }
      );

      trackingRef.current = true;
      updateState({ 
        isTracking: true, 
        isLoading: false 
      });
      return true;
    } catch (error) {
      const locationError: LocationError = {
        code: error instanceof Error && 'code' in error ? (error as any).code : -1,
        message: error instanceof Error ? error.message : 'Failed to start tracking',
      };
      updateState({ 
        error: locationError, 
        isLoading: false,
        isTracking: false 
      });
      return false;
    }
  }, [updateState, checkPermissionStatus, requestPermission]);

  /**
   * Stop location tracking
   */
  const stopTracking = useCallback(() => {
    locationService.stopLocationTracking();
    trackingRef.current = false;
    updateState({ isTracking: false });
  }, [updateState]);

  /**
   * Show permission explanation
   */
  const showPermissionExplanation = useCallback(() => {
    locationService.showPermissionExplanation();
  }, []);

  /**
   * Calculate distance to a location
   */
  const calculateDistanceTo = useCallback((
    targetLatitude: number,
    targetLongitude: number
  ): number | null => {
    if (!state.currentLocation) {
      return null;
    }

    return locationService.calculateDistance(
      state.currentLocation.latitude,
      state.currentLocation.longitude,
      targetLatitude,
      targetLongitude
    );
  }, [state.currentLocation]);

  /**
   * Handle app state changes for background tracking
   */
  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // App has come to the foreground
      if (enableBackgroundTracking && trackingRef.current) {
        // Refresh location when app becomes active
        getCurrentLocation();
      }
    }
    appState.current = nextAppState;
  }, [enableBackgroundTracking, getCurrentLocation]);

  /**
   * Initialize location services
   */
  useEffect(() => {
    const initialize = async () => {
      if (requestPermissionOnMount) {
        await checkPermissionStatus();
      }

      if (enableTracking) {
        await startTracking();
      }
    };

    initialize();

    // Set up app state listener for background tracking
    if (enableBackgroundTracking) {
      const subscription = AppState.addEventListener('change', handleAppStateChange);
      return () => subscription?.remove();
    }
  }, [
    requestPermissionOnMount,
    enableTracking,
    enableBackgroundTracking,
    checkPermissionStatus,
    startTracking,
    handleAppStateChange,
  ]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (trackingRef.current) {
        stopTracking();
      }
    };
  }, [stopTracking]);

  return {
    // State
    ...state,
    
    // Actions
    requestPermission,
    getCurrentLocation,
    startTracking,
    stopTracking,
    showPermissionExplanation,
    calculateDistanceTo,
    checkPermissionStatus,
  };
};