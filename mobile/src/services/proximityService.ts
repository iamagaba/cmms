import {locationService, LocationCoordinates} from './locationService';

export interface ProximityTarget {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
  type: 'work_order' | 'asset' | 'location';
}

export interface ProximityEvent {
  targetId: string;
  targetName: string;
  targetType: string;
  eventType: 'enter' | 'exit';
  distance: number;
  timestamp: number;
  location: LocationCoordinates;
}

export type ProximityEventHandler = (event: ProximityEvent) => void;

class ProximityService {
  private targets: Map<string, ProximityTarget> = new Map();
  private insideTargets: Set<string> = new Set();
  private eventHandlers: ProximityEventHandler[] = [];
  private isMonitoring = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private lastLocation: LocationCoordinates | null = null;

  // Configuration
  private readonly CHECK_INTERVAL_MS = 10000; // 10 seconds
  private readonly DEFAULT_RADIUS = 100; // 100 meters
  private readonly MIN_ACCURACY = 50; // Only use locations with accuracy better than 50m

  /**
   * Add a proximity target to monitor
   */
  addTarget(target: ProximityTarget): void {
    this.targets.set(target.id, target);
    console.log(`Added proximity target: ${target.name} (${target.radius}m radius)`);
  }

  /**
   * Remove a proximity target
   */
  removeTarget(targetId: string): void {
    const target = this.targets.get(targetId);
    if (target) {
      this.targets.delete(targetId);
      this.insideTargets.delete(targetId);
      console.log(`Removed proximity target: ${target.name}`);
    }
  }

  /**
   * Clear all proximity targets
   */
  clearTargets(): void {
    this.targets.clear();
    this.insideTargets.clear();
    console.log('Cleared all proximity targets');
  }

  /**
   * Add event handler for proximity events
   */
  addEventHandler(handler: ProximityEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove event handler
   */
  removeEventHandler(handler: ProximityEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Start proximity monitoring
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.warn('Proximity monitoring is already active');
      return;
    }

    try {
      // Start location tracking
      await locationService.startLocationTracking(
        (location: LocationCoordinates) => {
          this.handleLocationUpdate(location);
        },
        (error) => {
          console.error('Location tracking error in proximity service:', error);
        }
      );

      // Set up periodic checks
      this.checkInterval = setInterval(() => {
        this.checkProximity();
      }, this.CHECK_INTERVAL_MS);

      this.isMonitoring = true;
      console.log('Proximity monitoring started');
    } catch (error) {
      console.error('Failed to start proximity monitoring:', error);
      throw error;
    }
  }

  /**
   * Stop proximity monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    locationService.stopLocationTracking();

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    this.isMonitoring = false;
    this.lastLocation = null;
    this.insideTargets.clear();
    console.log('Proximity monitoring stopped');
  }

  /**
   * Check if currently monitoring
   */
  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Get current targets
   */
  getTargets(): ProximityTarget[] {
    return Array.from(this.targets.values());
  }

  /**
   * Get targets currently within range
   */
  getTargetsInRange(): string[] {
    return Array.from(this.insideTargets);
  }

  /**
   * Check proximity to a specific target
   */
  checkTargetProximity(targetId: string, location?: LocationCoordinates): {
    isInRange: boolean;
    distance: number | null;
  } {
    const target = this.targets.get(targetId);
    const currentLocation = location || this.lastLocation;

    if (!target || !currentLocation) {
      return {isInRange: false, distance: null};
    }

    const distance = locationService.calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      target.latitude,
      target.longitude
    );

    return {
      isInRange: distance <= target.radius,
      distance,
    };
  }

  /**
   * Handle location updates
   */
  private handleLocationUpdate(location: LocationCoordinates): void {
    // Only process locations with good accuracy
    if (location.accuracy > this.MIN_ACCURACY) {
      console.warn(`Location accuracy too low: ${location.accuracy}m`);
      return;
    }

    this.lastLocation = location;
    this.checkProximity();
  }

  /**
   * Check proximity to all targets
   */
  private checkProximity(): void {
    if (!this.lastLocation) {
      return;
    }

    for (const [targetId, target] of this.targets) {
      const distance = locationService.calculateDistance(
        this.lastLocation.latitude,
        this.lastLocation.longitude,
        target.latitude,
        target.longitude
      );

      const isCurrentlyInside = this.insideTargets.has(targetId);
      const shouldBeInside = distance <= target.radius;

      if (!isCurrentlyInside && shouldBeInside) {
        // Entered proximity
        this.insideTargets.add(targetId);
        this.fireProximityEvent({
          targetId,
          targetName: target.name,
          targetType: target.type,
          eventType: 'enter',
          distance,
          timestamp: Date.now(),
          location: this.lastLocation,
        });
      } else if (isCurrentlyInside && !shouldBeInside) {
        // Exited proximity
        this.insideTargets.delete(targetId);
        this.fireProximityEvent({
          targetId,
          targetName: target.name,
          targetType: target.type,
          eventType: 'exit',
          distance,
          timestamp: Date.now(),
          location: this.lastLocation,
        });
      }
    }
  }

  /**
   * Fire proximity event to all handlers
   */
  private fireProximityEvent(event: ProximityEvent): void {
    console.log(
      `Proximity ${event.eventType}: ${event.targetName} (${Math.round(event.distance)}m)`
    );

    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in proximity event handler:', error);
      }
    }
  }

  /**
   * Create a work order proximity target
   */
  createWorkOrderTarget(
    workOrderId: string,
    name: string,
    latitude: number,
    longitude: number,
    radius: number = this.DEFAULT_RADIUS
  ): ProximityTarget {
    return {
      id: workOrderId,
      name,
      latitude,
      longitude,
      radius,
      type: 'work_order',
    };
  }

  /**
   * Create an asset proximity target
   */
  createAssetTarget(
    assetId: string,
    name: string,
    latitude: number,
    longitude: number,
    radius: number = this.DEFAULT_RADIUS
  ): ProximityTarget {
    return {
      id: assetId,
      name,
      latitude,
      longitude,
      radius,
      type: 'asset',
    };
  }

  /**
   * Get distance to target
   */
  getDistanceToTarget(targetId: string): number | null {
    const target = this.targets.get(targetId);
    if (!target || !this.lastLocation) {
      return null;
    }

    return locationService.calculateDistance(
      this.lastLocation.latitude,
      this.lastLocation.longitude,
      target.latitude,
      target.longitude
    );
  }

  /**
   * Format distance for display
   */
  formatDistance(distance: number): string {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  }
}

export const proximityService = new ProximityService();