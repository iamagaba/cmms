import {locationService} from '../locationService';

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((options) => options.ios),
  },
  PermissionsAndroid: {
    request: jest.fn(),
    check: jest.fn(),
    PERMISSIONS: {
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
      NEVER_ASK_AGAIN: 'never_ask_again',
    },
  },
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('@react-native-community/geolocation', () => ({
  requestAuthorization: jest.fn(),
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
}));

describe('LocationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two coordinates correctly', () => {
      // Test coordinates: New York to Los Angeles (approximately 3944 km)
      const lat1 = 40.7128; // New York
      const lon1 = -74.0060;
      const lat2 = 34.0522; // Los Angeles
      const lon2 = -118.2437;

      const distance = locationService.calculateDistance(lat1, lon1, lat2, lon2);
      
      // Should be approximately 3944 km (3,944,000 meters)
      expect(distance).toBeGreaterThan(3900000);
      expect(distance).toBeLessThan(4000000);
    });

    it('should return 0 for identical coordinates', () => {
      const distance = locationService.calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
      expect(distance).toBe(0);
    });

    it('should calculate short distances accurately', () => {
      // Test coordinates: 1 km apart approximately
      const lat1 = 40.7128;
      const lon1 = -74.0060;
      const lat2 = 40.7218; // About 1 km north
      const lon2 = -74.0060;

      const distance = locationService.calculateDistance(lat1, lon1, lat2, lon2);
      
      // Should be approximately 1000 meters
      expect(distance).toBeGreaterThan(900);
      expect(distance).toBeLessThan(1100);
    });
  });

  describe('configuration', () => {
    it('should allow updating configuration', () => {
      const newConfig = {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 5000,
        distanceFilter: 20,
      };

      locationService.updateConfig(newConfig);
      const config = locationService.getConfig();

      expect(config).toEqual(newConfig);
    });

    it('should partially update configuration', () => {
      const originalConfig = locationService.getConfig();
      const partialUpdate = {
        timeout: 25000,
      };

      locationService.updateConfig(partialUpdate);
      const updatedConfig = locationService.getConfig();

      expect(updatedConfig.timeout).toBe(25000);
      expect(updatedConfig.enableHighAccuracy).toBe(originalConfig.enableHighAccuracy);
      expect(updatedConfig.maximumAge).toBe(originalConfig.maximumAge);
      expect(updatedConfig.distanceFilter).toBe(originalConfig.distanceFilter);
    });
  });

  describe('tracking state', () => {
    it('should initially not be tracking', () => {
      expect(locationService.isLocationTracking()).toBe(false);
    });

    it('should update tracking state when stopped', () => {
      locationService.stopLocationTracking();
      expect(locationService.isLocationTracking()).toBe(false);
    });
  });
});