import {navigationService} from '../navigationService';

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((options) => options.ios),
  },
  Linking: {
    canOpenURL: jest.fn(),
    openURL: jest.fn(),
  },
  Alert: {
    alert: jest.fn(),
  },
}));

describe('NavigationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('estimateTravelTime', () => {
    it('should estimate travel time correctly', () => {
      // Test coordinates: approximately 40 km apart
      const fromLat = 40.7128; // New York
      const fromLon = -74.0060;
      const toLat = 40.7589; // About 40 km north
      const toLon = -73.9851;

      const travelTime = navigationService.estimateTravelTime(fromLat, fromLon, toLat, toLon);
      
      // Should be reasonable travel time (assuming 40 km/h average speed)
      expect(travelTime).toBeGreaterThan(0);
      expect(travelTime).toBeLessThan(180); // Less than 3 hours
    });

    it('should return 0 for identical coordinates', () => {
      const travelTime = navigationService.estimateTravelTime(40.7128, -74.0060, 40.7128, -74.0060);
      expect(travelTime).toBe(0);
    });
  });

  describe('formatTravelTime', () => {
    it('should format minutes correctly', () => {
      expect(navigationService.formatTravelTime(30)).toBe('30 min');
      expect(navigationService.formatTravelTime(59)).toBe('59 min');
    });

    it('should format hours correctly', () => {
      expect(navigationService.formatTravelTime(60)).toBe('1h');
      expect(navigationService.formatTravelTime(120)).toBe('2h');
    });

    it('should format hours and minutes correctly', () => {
      expect(navigationService.formatTravelTime(90)).toBe('1h 30m');
      expect(navigationService.formatTravelTime(125)).toBe('2h 5m');
    });
  });

  describe('toRadians', () => {
    it('should convert degrees to radians correctly', () => {
      // Access private method through any cast for testing
      const service = navigationService as any;
      
      expect(service.toRadians(0)).toBe(0);
      expect(service.toRadians(90)).toBeCloseTo(Math.PI / 2);
      expect(service.toRadians(180)).toBeCloseTo(Math.PI);
      expect(service.toRadians(360)).toBeCloseTo(2 * Math.PI);
    });
  });
});