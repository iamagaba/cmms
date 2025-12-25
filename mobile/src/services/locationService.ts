import {PermissionsAndroid, Platform, Alert} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export enum LocationPermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  NEVER_ASK_AGAIN = 'never_ask_again',
  RESTRICTED = 'restricted',
}

export interface LocationServiceConfig {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
  distanceFilter: number;
}

class LocationService {
  private watchId: number | null = null;
  private isTracking = false;
  private config: LocationServiceConfig = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 10000,
    distanceFilter: 10, // meters
  };

  /**
   * Request location permissions with user-friendly explanations
   */
  async requestLocationPermission(): Promise<LocationPermissionStatus> {
    if (Platform.OS === 'ios') {
      return this.requestIOSLocationPermission();
    } else {
      return this.requestAndroidLocationPermission();
    }
  }

  /**
   * Request iOS location permissions
   */
  private async requestIOSLocationPermission(): Promise<LocationPermissionStatus> {
    return new Promise((resolve) => {
      Geolocation.requestAuthorization(
        // Success callback
        () => {
          resolve(LocationPermissionStatus.GRANTED);
        },
        // Error callback
        (error) => {
          console.log('iOS location permission error:', error);
          if (error.code === 1) {
            resolve(LocationPermissionStatus.DENIED);
          } else {
            resolve(LocationPermissionStatus.RESTRICTED);
          }
        }
      );
    });
  }

  /**
   * Request Android location permissions
   */
  private async requestAndroidLocationPermission(): Promise<LocationPermissionStatus> {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission Required',
          message: 'This app needs access to your location to help you navigate to work orders and track your position for automatic check-ins.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      switch (granted) {
        case PermissionsAndroid.RESULTS.GRANTED:
          return LocationPermissionStatus.GRANTED;
        case PermissionsAndroid.RESULTS.DENIED:
          return LocationPermissionStatus.DENIED;
        case PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN:
          return LocationPermissionStatus.NEVER_ASK_AGAIN;
        default:
          return LocationPermissionStatus.DENIED;
      }
    } catch (err) {
      console.warn('Error requesting location permission:', err);
      return LocationPermissionStatus.DENIED;
    }
  }

  /**
   * Check current location permission status
   */
  async checkLocationPermission(): Promise<LocationPermissionStatus> {
    if (Platform.OS === 'android') {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return hasPermission ? LocationPermissionStatus.GRANTED : LocationPermissionStatus.DENIED;
    }
    
    // For iOS, we'll need to try getting location to check permission
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        () => resolve(LocationPermissionStatus.GRANTED),
        (error) => {
          if (error.code === 1) {
            resolve(LocationPermissionStatus.DENIED);
          } else {
            resolve(LocationPermissionStatus.RESTRICTED);
          }
        },
        { timeout: 1000 }
      );
    });
  }

  /**
   * Get current location with accuracy validation
   */
  async getCurrentLocation(): Promise<LocationCoordinates> {
    const permissionStatus = await this.checkLocationPermission();
    
    if (permissionStatus !== LocationPermissionStatus.GRANTED) {
      throw new Error(`Location permission not granted: ${permissionStatus}`);
    }

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const location: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp,
          };

          // Validate accuracy
          if (this.validateLocationAccuracy(location)) {
            resolve(location);
          } else {
            reject(new Error(`Location accuracy too low: ${location.accuracy}m`));
          }
        },
        (error) => {
          reject(this.handleLocationError(error));
        },
        {
          enableHighAccuracy: this.config.enableHighAccuracy,
          timeout: this.config.timeout,
          maximumAge: this.config.maximumAge,
        }
      );
    });
  }

  /**
   * Start background location tracking
   */
  async startLocationTracking(
    onLocationUpdate: (location: LocationCoordinates) => void,
    onError?: (error: LocationError) => void
  ): Promise<void> {
    const permissionStatus = await this.checkLocationPermission();
    
    if (permissionStatus !== LocationPermissionStatus.GRANTED) {
      throw new Error(`Location permission not granted: ${permissionStatus}`);
    }

    if (this.isTracking) {
      console.warn('Location tracking is already active');
      return;
    }

    this.watchId = Geolocation.watchPosition(
      (position) => {
        const location: LocationCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: position.timestamp,
        };

        if (this.validateLocationAccuracy(location)) {
          onLocationUpdate(location);
        } else {
          console.warn(`Location accuracy too low: ${location.accuracy}m`);
        }
      },
      (error) => {
        const locationError = this.handleLocationError(error);
        console.error('Location tracking error:', locationError);
        if (onError) {
          onError(locationError);
        }
      },
      {
        enableHighAccuracy: this.config.enableHighAccuracy,
        timeout: this.config.timeout,
        maximumAge: this.config.maximumAge,
        distanceFilter: this.config.distanceFilter,
      }
    );

    this.isTracking = true;
  }

  /**
   * Stop location tracking
   */
  stopLocationTracking(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
  }

  /**
   * Check if location tracking is active
   */
  isLocationTracking(): boolean {
    return this.isTracking;
  }

  /**
   * Validate location accuracy
   */
  private validateLocationAccuracy(location: LocationCoordinates): boolean {
    // Accept locations with accuracy better than 100 meters
    return location.accuracy <= 100;
  }

  /**
   * Handle location errors with user-friendly messages
   */
  private handleLocationError(error: any): LocationError {
    let message = 'Unknown location error';
    
    switch (error.code) {
      case 1:
        message = 'Location access denied. Please enable location permissions in settings.';
        break;
      case 2:
        message = 'Location unavailable. Please check your GPS settings.';
        break;
      case 3:
        message = 'Location request timed out. Please try again.';
        break;
      default:
        message = error.message || 'Failed to get location';
    }

    return {
      code: error.code,
      message,
    };
  }

  /**
   * Show permission explanation dialog
   */
  showPermissionExplanation(): void {
    Alert.alert(
      'Location Permission Required',
      'This app uses your location to:\n\n' +
      '• Navigate to customer locations\n' +
      '• Automatically check you in when you arrive at work sites\n' +
      '• Calculate travel times and distances\n' +
      '• Track your position for safety and efficiency\n\n' +
      'Your location data is only used for work-related purposes and is not shared with third parties.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Enable Location',
          onPress: () => this.requestLocationPermission(),
        },
      ]
    );
  }

  /**
   * Calculate distance between two coordinates (in meters)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Update location service configuration
   */
  updateConfig(config: Partial<LocationServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): LocationServiceConfig {
    return { ...this.config };
  }
}

export const locationService = new LocationService();