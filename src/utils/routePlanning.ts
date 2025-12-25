import { Coordinates, calculateDistance, calculateRouteDistance, estimateTravelTime, formatTravelTime, formatDistance } from './distance';
import { WorkOrder } from '../types/supabase';

export interface RouteOptimizationResult {
  optimizedOrder: WorkOrder[];
  optimizedRoute: WorkOrder[]; // Keep for backward compatibility
  totalDistance: number;
  estimatedTime: number;
  routeSegments: RouteSegment[];
  distances?: number[]; // Distance between consecutive stops
}

export interface RouteSegment {
  from: Coordinates;
  to: Coordinates;
  distance: number;
  estimatedTime: number;
  workOrder: WorkOrder;
}

export interface RouteStats {
  totalDistance: number;
  estimatedTravelTime: number;
  totalStops: number;
  averageDistanceBetweenStops: number;
  // Formatted versions for display
  formattedDistance?: string;
  formattedTime?: string;
}

/**
 * Optimize route using nearest neighbor algorithm with priority weighting
 * This is a simple but effective algorithm for small to medium route sizes
 * @param workOrders Array of work orders to optimize
 * @param startLocation Starting location (user's current position)
 * @returns Optimized route with statistics
 */
export function optimizeRoute(
  workOrders: WorkOrder[],
  startLocation: Coordinates
): RouteOptimizationResult {
  if (workOrders.length === 0) {
    return {
      optimizedOrder: [],
      optimizedRoute: [],
      totalDistance: 0,
      estimatedTime: 0,
      routeSegments: [],
      distances: []
    };
  }

  // Filter out work orders without location data
  const validWorkOrders = workOrders.filter(wo => 
    wo.customerLat !== null && wo.customerLng !== null
  );

  if (validWorkOrders.length === 0) {
    return {
      optimizedOrder: workOrders,
      optimizedRoute: workOrders,
      totalDistance: 0,
      estimatedTime: 0,
      routeSegments: [],
      distances: []
    };
  }

  // If only one work order, return it directly
  if (validWorkOrders.length === 1) {
    const workOrder = validWorkOrders[0];
    const distance = calculateDistance(startLocation, {
      lat: workOrder.customerLat!,
      lng: workOrder.customerLng!
    });
    
    return {
      optimizedOrder: validWorkOrders,
      optimizedRoute: validWorkOrders,
      totalDistance: distance,
      estimatedTime: estimateTravelTime(distance),
      routeSegments: [{
        from: startLocation,
        to: { lat: workOrder.customerLat!, lng: workOrder.customerLng! },
        distance,
        estimatedTime: estimateTravelTime(distance),
        workOrder
      }],
      distances: [distance]
    };
  }

  // Nearest neighbor algorithm with priority weighting
  const optimizedRoute: WorkOrder[] = [];
  const routeSegments: RouteSegment[] = [];
  const unvisited = [...validWorkOrders];
  let currentLocation = startLocation;
  let totalDistance = 0;

  while (unvisited.length > 0) {
    let bestIndex = 0;
    let bestScore = Infinity;

    // Find the best next work order based on distance and priority
    for (let i = 0; i < unvisited.length; i++) {
      const workOrder = unvisited[i];
      const workOrderLocation: Coordinates = {
        lat: workOrder.customerLat!,
        lng: workOrder.customerLng!
      };

      const distance = calculateDistance(currentLocation, workOrderLocation);
      
      // Priority weighting: high priority gets distance reduction
      const priorityMultiplier = getPriorityMultiplier(workOrder.priority);
      const score = distance * priorityMultiplier;

      if (score < bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    // Add the best work order to the route
    const selectedWorkOrder = unvisited[bestIndex];
    const workOrderLocation: Coordinates = {
      lat: selectedWorkOrder.customerLat!,
      lng: selectedWorkOrder.customerLng!
    };

    const segmentDistance = calculateDistance(currentLocation, workOrderLocation);
    const segmentTime = estimateTravelTime(segmentDistance);

    routeSegments.push({
      from: currentLocation,
      to: workOrderLocation,
      distance: segmentDistance,
      estimatedTime: segmentTime,
      workOrder: selectedWorkOrder
    });

    optimizedRoute.push(selectedWorkOrder);
    totalDistance += segmentDistance;
    currentLocation = workOrderLocation;
    unvisited.splice(bestIndex, 1);
  }

  const totalTime = estimateTravelTime(totalDistance);

  // Calculate distances between consecutive stops
  const distances = routeSegments.map(segment => segment.distance);

  return {
    optimizedOrder: optimizedRoute,
    optimizedRoute, // Keep for backward compatibility
    totalDistance,
    estimatedTime: totalTime,
    routeSegments,
    distances
  };
}

/**
 * Get priority multiplier for route optimization
 * Lower multiplier means higher priority (shorter effective distance)
 */
function getPriorityMultiplier(priority: WorkOrder['priority']): number {
  switch (priority) {
    case 'High':
      return 0.7; // High priority gets 30% distance reduction
    case 'Medium':
      return 1.0; // Medium priority uses actual distance
    case 'Low':
      return 1.3; // Low priority gets 30% distance penalty
    default:
      return 1.0;
  }
}

/**
 * Calculate route statistics for display
 */
export function calculateRouteStats(result: RouteOptimizationResult): RouteStats {
  const { totalDistance, estimatedTime, optimizedOrder } = result;
  
  const averageDistance = optimizedOrder.length > 0 
    ? totalDistance / optimizedOrder.length 
    : 0;

  return {
    totalDistance,
    estimatedTravelTime: estimatedTime,
    totalStops: optimizedOrder.length,
    averageDistanceBetweenStops: averageDistance,
    formattedDistance: formatDistance(totalDistance),
    formattedTime: formatTravelTime(estimatedTime)
  };
}

/**
 * Generate URL for external map application with optimized route
 */
export function generateMapUrl(
  result: RouteOptimizationResult,
  startLocation: Coordinates,
  mapProvider: 'google' | 'apple' = 'google'
): string {
  const { optimizedOrder } = result;
  
  if (optimizedOrder.length === 0) {
    return '';
  }

  // Filter work orders with valid coordinates
  const validWorkOrders = optimizedOrder.filter(wo => 
    wo.customerLat !== null && wo.customerLng !== null
  );

  if (validWorkOrders.length === 0) {
    return '';
  }

  if (mapProvider === 'google') {
    return generateGoogleMapsUrl(validWorkOrders, startLocation);
  } else {
    return generateAppleMapsUrl(validWorkOrders, startLocation);
  }
}

/**
 * Generate Google Maps URL with waypoints
 */
function generateGoogleMapsUrl(workOrders: WorkOrder[], startLocation: Coordinates): string {
  const origin = `${startLocation.lat},${startLocation.lng}`;
  
  if (workOrders.length === 1) {
    const destination = `${workOrders[0].customerLat},${workOrders[0].customerLng}`;
    return `https://www.google.com/maps/dir/${origin}/${destination}`;
  }

  // For multiple destinations, use waypoints
  const destination = `${workOrders[workOrders.length - 1].customerLat},${workOrders[workOrders.length - 1].customerLng}`;
  
  const waypoints = workOrders
    .slice(0, -1) // Exclude the last one (it's the destination)
    .map(wo => `${wo.customerLat},${wo.customerLng}`)
    .join('|');

  return `https://www.google.com/maps/dir/${origin}/${destination}${waypoints ? `?waypoints=${waypoints}` : ''}`;
}

/**
 * Generate Apple Maps URL with waypoints
 */
function generateAppleMapsUrl(workOrders: WorkOrder[], startLocation: Coordinates): string {
  // Apple Maps has limited waypoint support, so we'll use the first destination
  // and include others in the query for manual addition
  const firstDestination = workOrders[0];
  const lat = firstDestination.customerLat;
  const lng = firstDestination.customerLng;
  
  // Include customer address if available for better search results
  const query = firstDestination.customerAddress || `${lat},${lng}`;
  
  return `https://maps.apple.com/?daddr=${encodeURIComponent(query)}&saddr=${startLocation.lat},${startLocation.lng}`;
}

/**
 * Detect the best map provider based on user agent
 */
export function detectMapProvider(): 'google' | 'apple' {
  if (typeof window === 'undefined') {
    return 'google'; // Default for SSR
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isMac = /macintosh|mac os x/.test(userAgent);
  
  // Prefer Apple Maps on iOS devices
  return isIOS ? 'apple' : 'google';
}

/**
 * Check if external map applications are available
 */
export function checkMapAvailability(): {
  googleMaps: boolean;
  appleMaps: boolean;
  defaultProvider: 'google' | 'apple';
} {
  if (typeof window === 'undefined') {
    return {
      googleMaps: true,
      appleMaps: false,
      defaultProvider: 'google'
    };
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  
  return {
    googleMaps: true, // Google Maps web is universally available
    appleMaps: isIOS, // Apple Maps only works on iOS
    defaultProvider: isIOS ? 'apple' : 'google'
  };
}

/**
 * Open external map application with the optimized route
 */
export function openMapApplication(
  result: RouteOptimizationResult,
  startLocation: Coordinates,
  preferredProvider?: 'google' | 'apple'
): boolean {
  try {
    const availability = checkMapAvailability();
    const provider = preferredProvider || availability.defaultProvider;
    
    // Fallback to available provider if preferred is not available
    const finalProvider = (provider === 'apple' && !availability.appleMaps) 
      ? 'google' 
      : provider;

    const mapUrl = generateMapUrl(result, startLocation, finalProvider);
    
    if (!mapUrl) {
      console.error('No valid work orders with coordinates for route planning');
      return false;
    }

    // Open in new tab/window or native app
    window.open(mapUrl, '_blank');
    return true;
  } catch (error) {
    console.error('Failed to open map application:', error);
    return false;
  }
}

/**
 * Validate work orders for route planning
 */
export function validateWorkOrdersForRouting(workOrders: WorkOrder[]): {
  valid: WorkOrder[];
  invalid: WorkOrder[];
  hasValidOrders: boolean;
} {
  const valid: WorkOrder[] = [];
  const invalid: WorkOrder[] = [];

  workOrders.forEach(workOrder => {
    if (workOrder.customerLat !== null && workOrder.customerLng !== null) {
      valid.push(workOrder);
    } else {
      invalid.push(workOrder);
    }
  });

  return {
    valid,
    invalid,
    hasValidOrders: valid.length > 0
  };
}

/**
 * Generate route summary text for user display
 */
export function generateRouteSummary(
  result: RouteOptimizationResult,
  stats: RouteStats
): string {
  const { totalStops, formattedDistance, formattedTime } = stats;
  
  if (totalStops === 0) {
    return 'No work orders selected for routing';
  }
  
  if (totalStops === 1) {
    return `1 work order • ${formattedDistance} • ${formattedTime}`;
  }
  
  return `${totalStops} work orders • ${formattedDistance} • ${formattedTime}`;
}