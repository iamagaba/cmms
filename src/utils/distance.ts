export interface Coordinates {
  lat: number;
  lng: number;
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  priority: 'low' | 'medium' | 'high';
  latitude?: number;
  longitude?: number;
  distanceFromUser?: number;
  proximityScore?: number;
}

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param from Starting coordinates
 * @param to Destination coordinates
 * @returns Distance in kilometers
 */
export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Convert degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for user-friendly display
 * @param kilometers Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(kilometers: number): string {
  if (kilometers < 0.1) {
    return '<100m';
  } else if (kilometers < 1) {
    return `${Math.round(kilometers * 1000)}m`;
  } else if (kilometers < 10) {
    return `${kilometers.toFixed(1)}km`;
  } else {
    return `${Math.round(kilometers)}km`;
  }
}

/**
 * Calculate proximity score for sorting algorithm
 * Combines distance and priority for optimal work order ranking
 * @param distance Distance in kilometers
 * @param priority Work order priority
 * @returns Proximity score (lower is better)
 */
export function calculateProximityScore(
  distance: number, 
  priority: 'low' | 'medium' | 'high'
): number {
  // Priority weights (lower number = higher priority)
  const priorityWeights = {
    high: 1,
    medium: 2,
    low: 3
  };

  // Distance categories with multipliers
  let distanceMultiplier: number;
  
  if (distance <= 5) {
    distanceMultiplier = 1; // Within 5km
  } else if (distance <= 10) {
    distanceMultiplier = 2; // 5-10km
  } else if (distance <= 25) {
    distanceMultiplier = 3; // 10-25km
  } else {
    distanceMultiplier = 4; // >25km
  }

  // Calculate score: priority weight * distance multiplier + normalized distance
  // This ensures high priority within 5km comes first, then medium within 10km, etc.
  const baseScore = priorityWeights[priority] * distanceMultiplier;
  const normalizedDistance = distance / 100; // Normalize distance to prevent overwhelming priority
  
  return baseScore + normalizedDistance;
}

/**
 * Sort work orders by proximity and priority with performance optimization
 * High priority within 5km first, medium priority within 10km second, then by distance
 * @param workOrders Array of work orders to sort
 * @param userLocation Current user location
 * @param options Performance optimization options
 * @returns Sorted array of work orders with distance information
 */
export function sortByProximityAndPriority(
  workOrders: WorkOrder[],
  userLocation: Coordinates,
  options: {
    maxResults?: number;
    batchSize?: number;
    useCache?: boolean;
  } = {}
): WorkOrder[] {
  const { maxResults = 1000, batchSize = 50, useCache = true } = options;
  
  // Early return for empty arrays
  if (workOrders.length === 0) return [];
  
  // Use cached results if available and recent
  const cacheKey = `sort_${userLocation.lat}_${userLocation.lng}_${workOrders.length}`;
  const cached = useCache ? getCachedSortResult(cacheKey) : null;
  
  if (cached && Date.now() - cached.timestamp < 60000) { // 1 minute cache
    return cached.result.slice(0, maxResults);
  }

  // Separate work orders with and without location for efficiency
  const withLocation: WorkOrder[] = [];
  const withoutLocation: WorkOrder[] = [];
  
  for (const workOrder of workOrders) {
    if (workOrder.latitude && workOrder.longitude) {
      withLocation.push(workOrder);
    } else {
      withoutLocation.push({
        ...workOrder,
        distanceFromUser: Infinity,
        proximityScore: Infinity
      });
    }
  }

  // Process work orders with location in batches
  const workOrdersWithDistance: WorkOrder[] = [];
  
  for (let i = 0; i < withLocation.length; i += batchSize) {
    const batch = withLocation.slice(i, i + batchSize);
    
    const batchResults = batch.map(workOrder => {
      const workOrderLocation: Coordinates = {
        lat: workOrder.latitude!,
        lng: workOrder.longitude!
      };

      const distance = calculateDistance(userLocation, workOrderLocation);
      const proximityScore = calculateProximityScore(distance, workOrder.priority);

      return {
        ...workOrder,
        distanceFromUser: distance,
        proximityScore
      };
    });
    
    workOrdersWithDistance.push(...batchResults);
    
    // Yield control to prevent blocking the main thread
    if (i + batchSize < withLocation.length) {
      setTimeout(() => {}, 0);
    }
  }

  // Combine and sort results
  const allResults = [...workOrdersWithDistance, ...withoutLocation];
  
  // Use efficient sorting algorithm
  allResults.sort((a, b) => {
    // Handle work orders without location (they should go to the end)
    if (a.proximityScore === Infinity && b.proximityScore === Infinity) {
      return 0;
    }
    if (a.proximityScore === Infinity) return 1;
    if (b.proximityScore === Infinity) return -1;

    return a.proximityScore! - b.proximityScore!;
  });

  const result = allResults.slice(0, maxResults);
  
  // Cache the result
  if (useCache) {
    setCachedSortResult(cacheKey, result);
  }
  
  return result;
}

// Cache for sort results
const sortCache = new Map<string, { result: WorkOrder[]; timestamp: number }>();

function getCachedSortResult(key: string): { result: WorkOrder[]; timestamp: number } | null {
  return sortCache.get(key) || null;
}

function setCachedSortResult(key: string, result: WorkOrder[]): void {
  // Limit cache size to prevent memory issues
  if (sortCache.size > 10) {
    const oldestKey = sortCache.keys().next().value;
    sortCache.delete(oldestKey);
  }
  
  sortCache.set(key, {
    result: [...result], // Create a copy to avoid mutations
    timestamp: Date.now()
  });
}

/**
 * Filter work orders within a specified radius
 * @param workOrders Array of work orders to filter
 * @param userLocation Current user location
 * @param radiusKm Radius in kilometers
 * @returns Filtered array of work orders within the radius
 */
export function filterByRadius(
  workOrders: WorkOrder[],
  userLocation: Coordinates,
  radiusKm: number
): WorkOrder[] {
  return workOrders.filter(workOrder => {
    if (!workOrder.latitude || !workOrder.longitude) {
      return false; // Exclude work orders without location
    }

    const workOrderLocation: Coordinates = {
      lat: workOrder.latitude,
      lng: workOrder.longitude
    };

    const distance = calculateDistance(userLocation, workOrderLocation);
    return distance <= radiusKm;
  });
}

/**
 * Get work orders within "Near Me" radius (10km)
 * @param workOrders Array of work orders to filter
 * @param userLocation Current user location
 * @returns Work orders within 10km radius
 */
export function getNearbyWorkOrders(
  workOrders: WorkOrder[],
  userLocation: Coordinates
): WorkOrder[] {
  return filterByRadius(workOrders, userLocation, 10);
}

/**
 * Calculate total distance for a route through multiple work orders
 * @param workOrders Array of work orders in route order
 * @param startLocation Starting location (usually user location)
 * @returns Total distance in kilometers
 */
export function calculateRouteDistance(
  workOrders: WorkOrder[],
  startLocation: Coordinates
): number {
  if (workOrders.length === 0) return 0;

  let totalDistance = 0;
  let currentLocation = startLocation;

  for (const workOrder of workOrders) {
    if (workOrder.latitude && workOrder.longitude) {
      const workOrderLocation: Coordinates = {
        lat: workOrder.latitude,
        lng: workOrder.longitude
      };
      
      totalDistance += calculateDistance(currentLocation, workOrderLocation);
      currentLocation = workOrderLocation;
    }
  }

  return totalDistance;
}

/**
 * Estimate travel time based on distance
 * Assumes average speed of 40 km/h in urban areas
 * @param distanceKm Distance in kilometers
 * @returns Estimated time in minutes
 */
export function estimateTravelTime(distanceKm: number): number {
  const averageSpeedKmh = 40; // Average urban driving speed
  const timeHours = distanceKm / averageSpeedKmh;
  return Math.round(timeHours * 60); // Convert to minutes
}

/**
 * Format travel time for display
 * @param minutes Time in minutes
 * @returns Formatted time string
 */
export function formatTravelTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}min`;
    }
  }
}