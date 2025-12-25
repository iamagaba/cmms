import { useState, useEffect, useCallback, useRef } from 'react';
import { performanceManager } from '../utils/performance';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeolocationState {
  location: Coordinates | null;
  error: string | null;
  loading: boolean;
  accuracy: number | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
  lastUpdate: number;
  updateCount: number;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  cacheTimeout?: number; // Cache timeout in milliseconds (default: 5 minutes)
}

interface CachedLocation {
  coordinates: Coordinates;
  accuracy: number;
  timestamp: number;
}

const DEFAULT_OPTIONS: Required<GeolocationOptions> = {
  enableHighAccuracy: false,
  timeout: 10000,
  maximumAge: 300000, // 5 minutes
  cacheTimeout: 300000, // 5 minutes
};

const CACHE_KEY = 'geolocation_cache';

export function useGeolocation(options: GeolocationOptions = {}): GeolocationState {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: false,
    accuracy: null,
    permissionStatus: 'unknown',
    lastUpdate: 0,
    updateCount: 0
  });

  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const updateIntervalRef = useRef<number>(opts.cacheTimeout);
  const lastPositionRef = useRef<Coordinates | null>(null);

  // Load cached location on mount
  useEffect(() => {
    const cached = getCachedLocation();
    if (cached && Date.now() - cached.timestamp < opts.cacheTimeout) {
      setState(prev => ({
        ...prev,
        location: cached.coordinates,
        accuracy: cached.accuracy
      }));
    }
  }, [opts.cacheTimeout]);

  const getCachedLocation = useCallback((): CachedLocation | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }, []);

  const setCachedLocation = useCallback((coordinates: Coordinates, accuracy: number) => {
    try {
      const cacheData: CachedLocation = {
        coordinates,
        accuracy,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch {
      // Silently fail if localStorage is not available
    }
  }, []);

  const checkPermission = useCallback(async (): Promise<'granted' | 'denied' | 'prompt'> => {
    if (!navigator.permissions) {
      return 'unknown' as any;
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state as 'granted' | 'denied' | 'prompt';
    } catch {
      return 'unknown' as any;
    }
  }, []);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const coordinates: Coordinates = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    
    const accuracy = position.coords.accuracy;
    const now = Date.now();
    
    // Performance optimization: Check if location has changed significantly
    const hasSignificantChange = !lastPositionRef.current || 
      calculateDistance(lastPositionRef.current, coordinates) > 0.01; // 10 meters
    
    if (hasSignificantChange) {
      // Cache the location
      setCachedLocation(coordinates, accuracy);
      
      // Calculate optimal update interval based on movement and battery
      const currentSpeed = position.coords.speed || undefined;
      updateIntervalRef.current = performanceManager.getOptimalLocationUpdateInterval(
        lastPositionRef.current ? {
          ...lastPositionRef.current,
          timestamp: lastUpdateRef.current
        } : undefined,
        currentSpeed
      );
      
      setState(prev => ({
        ...prev,
        location: coordinates,
        accuracy,
        error: null,
        loading: false,
        lastUpdate: now,
        updateCount: prev.updateCount + 1
      }));

      lastPositionRef.current = coordinates;
      lastUpdateRef.current = now;
    } else {
      // Just update loading state without triggering re-renders
      setState(prev => ({
        ...prev,
        loading: false,
        lastUpdate: now
      }));
    }
  }, [setCachedLocation]);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage: string;
    let permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown' = 'unknown';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied. Please enable location services to see nearby work orders.';
        permissionStatus = 'denied';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable. Please check your device settings.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out. Please try again.';
        break;
      default:
        errorMessage = 'An unknown error occurred while getting your location.';
        break;
    }

    // Use comprehensive error handling
    import('@/utils/errorHandling').then(({ handleError: handleAppError }) => {
      handleAppError(
        new Error(errorMessage),
        {
          feature: 'geolocation',
          action: 'get_position',
        },
        error.code === error.PERMISSION_DENIED ? 'medium' : 'low',
        {
          showNotification: false, // We handle UI updates ourselves
          reportError: true,
          hapticFeedback: true
        }
      );
    });

    setState(prev => ({
      ...prev,
      error: errorMessage,
      loading: false,
      permissionStatus
    }));
  }, []);

  const getCurrentPosition = useCallback(async () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this device.',
        loading: false
      }));
      return;
    }

    // Check if we have a recent cached location
    const cached = getCachedLocation();
    if (cached && Date.now() - cached.timestamp < opts.cacheTimeout) {
      return; // Use cached location, don't fetch new one
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    // Check permission status
    const permission = await checkPermission();
    setState(prev => ({ ...prev, permissionStatus: permission }));

    if (permission === 'denied') {
      setState(prev => ({
        ...prev,
        error: 'Location access denied. Please enable location services in your browser settings.',
        loading: false
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: opts.enableHighAccuracy,
        timeout: opts.timeout,
        maximumAge: opts.maximumAge
      }
    );
  }, [opts, getCachedLocation, checkPermission, handleSuccess, handleError]);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation || watchIdRef.current !== null) {
      return;
    }

    // Use performance-optimized position watching
    const throttledHandleSuccess = performanceManager.throttle(
      handleSuccess,
      'geolocation_update',
      { delay: updateIntervalRef.current, leading: true, trailing: false }
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      throttledHandleSuccess,
      handleError,
      {
        enableHighAccuracy: opts.enableHighAccuracy,
        timeout: opts.timeout,
        maximumAge: updateIntervalRef.current // Use dynamic cache age
      }
    );
  }, [opts, handleSuccess, handleError]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Start getting location on mount
  useEffect(() => {
    getCurrentPosition();
    
    return () => {
      stopWatching();
    };
  }, [getCurrentPosition, stopWatching]);

  return {
    ...state,
    getCurrentPosition,
    startWatching,
    stopWatching
  } as GeolocationState & {
    getCurrentPosition: () => Promise<void>;
    startWatching: () => void;
    stopWatching: () => void;
  };
}

import { calculateDistance } from '../utils/distance';