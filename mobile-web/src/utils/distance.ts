import type { Coordinates } from '@/hooks/useGeolocation'
import type { WorkOrder } from '@/types/database'

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in kilometers
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(coord2.lat - coord1.lat)
  const dLng = toRadians(coord2.lng - coord1.lng)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Format distance for display
 * @param distance Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  }
  return `${distance.toFixed(1)}km`
}

/**
 * Sort work orders by proximity and priority
 * @param workOrders Array of work orders
 * @param userLocation User's current location
 * @returns Sorted work orders with distance property
 */
export function sortByProximityAndPriority(
  workOrders: any[], 
  userLocation: Coordinates | null
): any[] {
  if (!userLocation) {
    return workOrders.map(order => ({
      ...order,
      distanceFromUser: null
    })).sort((a, b) => {
      // Sort by priority if no location
      const priorityOrder = { 
        'High': 3, 'high': 3,
        'Medium': 2, 'medium': 2,
        'Low': 1, 'low': 1
      }
      return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
             (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
    })
  }

  return workOrders
    .map(order => ({
      ...order,
      distanceFromUser: order.customerLat && order.customerLng 
        ? calculateDistance(userLocation, { lat: order.customerLat, lng: order.customerLng })
        : null
    }))
    .sort((a, b) => {
      // First sort by priority
      const priorityOrder = { 
        'High': 3, 'high': 3,
        'Medium': 2, 'medium': 2,
        'Low': 1, 'low': 1
      }
      const priorityDiff = (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                          (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
      
      if (priorityDiff !== 0) return priorityDiff
      
      // Then by distance
      const distanceA = a.distanceFromUser ?? Infinity
      const distanceB = b.distanceFromUser ?? Infinity
      return distanceA - distanceB
    })
}