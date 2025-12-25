import {create} from 'zustand';
import {
  LocationCoordinates,
  LocationError,
  LocationPermissionStatus,
  locationService,
} from '@/services/locationService';

export interface TechnicianLocation extends LocationCoordinates {
  technicianId: string;
  isOnSite: boolean;
  currentWorkOrderId?: string;
  address?: string;
}

export interface LocationStore {
  // State
  currentLocation: LocationCoordinates | null;
  technicianLocation: TechnicianLocation | null;
  permissionStatus: LocationPermissionStatus | null;
  isTracking: boolean;
  isLoading: boolean;
  error: LocationError | null;
  lastUpdateTime: number | null;

  // Actions
  setCurrentLocation: (location: LocationCoordinates | null) => void;
  setTechnicianLocation: (location: TechnicianLocation | null) => void;
  setPermissionStatus: (status: LocationPermissionStatus) => void;
  setTracking: (isTracking: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: LocationError | null) => void;
  updateLastUpdateTime: () => void;
  
  // Computed
  getDistanceTo: (latitude: number, longitude: number) => number | null;
  isLocationStale: (maxAgeMinutes?: number) => boolean;
  hasValidLocation: () => boolean;
  
  // Async actions
  requestLocationPermission: () => Promise<LocationPermissionStatus>;
  getCurrentLocation: () => Promise<LocationCoordinates | null>;
  startLocationTracking: () => Promise<boolean>;
  stopLocationTracking: () => void;
  updateTechnicianPosition: (technicianId: string, workOrderId?: string) => Promise<void>;
}

export const useLocationStore = create<LocationStore>((set, get) => ({
  // Initial state
  currentLocation: null,
  technicianLocation: null,
  permissionStatus: null,
  isTracking: false,
  isLoading: false,
  error: null,
  lastUpdateTime: null,

  // State setters
  setCurrentLocation: (location) => {
    set({ 
      currentLocation: location,
      lastUpdateTime: location ? Date.now() : null,
      error: null 
    });
  },

  setTechnicianLocation: (location) => {
    set({ technicianLocation: location });
  },

  setPermissionStatus: (status) => {
    set({ permissionStatus: status });
  },

  setTracking: (isTracking) => {
    set({ isTracking });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error });
  },

  updateLastUpdateTime: () => {
    set({ lastUpdateTime: Date.now() });
  },

  // Computed getters
  getDistanceTo: (latitude, longitude) => {
    const { currentLocation } = get();
    if (!currentLocation) {
      return null;
    }

    return locationService.calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      latitude,
      longitude
    );
  },

  isLocationStale: (maxAgeMinutes = 5) => {
    const { lastUpdateTime } = get();
    if (!lastUpdateTime) {
      return true;
    }

    const maxAgeMs = maxAgeMinutes * 60 * 1000;
    return Date.now() - lastUpdateTime > maxAgeMs;
  },

  hasValidLocation: () => {
    const { currentLocation } = get();
    return currentLocation !== null && currentLocation.accuracy <= 100;
  },

  // Async actions
  requestLocationPermission: async () => {
    const { setLoading, setError, setPermissionStatus } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      const status = await locationService.requestLocationPermission();
      setPermissionStatus(status);
      setLoading(false);
      
      return status;
    } catch (error) {
      const locationError: LocationError = {
        code: -1,
        message: error instanceof Error ? error.message : 'Failed to request permission',
      };
      setError(locationError);
      setLoading(false);
      setPermissionStatus(LocationPermissionStatus.DENIED);
      
      return LocationPermissionStatus.DENIED;
    }
  },

  getCurrentLocation: async () => {
    const { 
      setLoading, 
      setError, 
      setCurrentLocation, 
      permissionStatus,
      requestLocationPermission 
    } = get();
    
    try {
      setLoading(true);
      setError(null);

      // Check permission
      if (permissionStatus !== LocationPermissionStatus.GRANTED) {
        const newStatus = await requestLocationPermission();
        if (newStatus !== LocationPermissionStatus.GRANTED) {
          throw new Error(`Location permission not granted: ${newStatus}`);
        }
      }

      const location = await locationService.getCurrentLocation();
      setCurrentLocation(location);
      setLoading(false);
      
      return location;
    } catch (error) {
      const locationError: LocationError = {
        code: error instanceof Error && 'code' in error ? (error as any).code : -1,
        message: error instanceof Error ? error.message : 'Failed to get location',
      };
      setError(locationError);
      setLoading(false);
      
      return null;
    }
  },

  startLocationTracking: async () => {
    const { 
      setLoading, 
      setError, 
      setTracking, 
      setCurrentLocation,
      permissionStatus,
      requestLocationPermission,
      isTracking 
    } = get();
    
    if (isTracking) {
      console.warn('Location tracking is already active');
      return true;
    }

    try {
      setLoading(true);
      setError(null);

      // Check permission
      if (permissionStatus !== LocationPermissionStatus.GRANTED) {
        const newStatus = await requestLocationPermission();
        if (newStatus !== LocationPermissionStatus.GRANTED) {
          throw new Error(`Location permission not granted: ${newStatus}`);
        }
      }

      await locationService.startLocationTracking(
        (location: LocationCoordinates) => {
          setCurrentLocation(location);
        },
        (error: LocationError) => {
          setError(error);
        }
      );

      setTracking(true);
      setLoading(false);
      
      return true;
    } catch (error) {
      const locationError: LocationError = {
        code: error instanceof Error && 'code' in error ? (error as any).code : -1,
        message: error instanceof Error ? error.message : 'Failed to start tracking',
      };
      setError(locationError);
      setLoading(false);
      setTracking(false);
      
      return false;
    }
  },

  stopLocationTracking: () => {
    const { setTracking } = get();
    
    locationService.stopLocationTracking();
    setTracking(false);
  },

  updateTechnicianPosition: async (technicianId: string, workOrderId?: string) => {
    const { currentLocation, setTechnicianLocation, getCurrentLocation } = get();
    
    try {
      // Get current location if we don't have one
      const location = currentLocation || await getCurrentLocation();
      
      if (!location) {
        throw new Error('Unable to get current location');
      }

      // Create technician location object
      const technicianLocation: TechnicianLocation = {
        ...location,
        technicianId,
        currentWorkOrderId: workOrderId,
        isOnSite: false, // Will be determined by proximity detection
      };

      setTechnicianLocation(technicianLocation);

      // Here you would typically send this to your backend
      // await apiClient.updateTechnicianLocation(technicianLocation);
      
    } catch (error) {
      console.error('Failed to update technician position:', error);
      throw error;
    }
  },
}));