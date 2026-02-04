/**
 * Utility functions for displaying work order information
 * Ensures UUIDs are never displayed to users
 */

import { WorkOrder } from '@/types/supabase';

/**
 * Get a human-readable work order number
 * Never displays raw UUIDs
 */
export function getWorkOrderNumber(workOrder: WorkOrder | any): string {
  // First priority: use the actual work order number if available
  if (workOrder.workOrderNumber || workOrder.work_order_number) {
    return workOrder.workOrderNumber || workOrder.work_order_number;
  }

  // Second priority: generate from created date if available
  if (workOrder.created_at) {
    const date = new Date(workOrder.created_at);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Generate a sequential number based on timestamp
    const timeComponent = date.getTime().toString().slice(-4);
    
    return `WO-${year}${month}${day}-${timeComponent}`;
  }

  // Fallback: use a generic placeholder
  return 'WO-PENDING';
}

/**
 * Get a display name for a customer
 * Never displays raw UUIDs
 */
export function getCustomerDisplayName(customer: any, fallback: string = 'Unknown Customer'): string {
  if (!customer) return fallback;
  
  if (customer.name) return customer.name;
  if (customer.first_name || customer.last_name) {
    return `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || fallback;
  }
  if (customer.company_name) return customer.company_name;
  
  return fallback;
}

/**
 * Get a display name for a technician
 * Never displays raw UUIDs
 */
export function getTechnicianDisplayName(technician: any, fallback: string = 'Unassigned'): string {
  if (!technician) return fallback;
  
  if (technician.name) return technician.name;
  if (technician.first_name || technician.last_name) {
    return `${technician.first_name || ''} ${technician.last_name || ''}`.trim() || fallback;
  }
  
  return fallback;
}

/**
 * Get a display name for a vehicle
 * Never displays raw UUIDs
 */
export function getVehicleDisplayName(vehicle: any, fallback: string = 'Unknown Vehicle'): string {
  if (!vehicle) return fallback;
  
  if (vehicle.license_plate || vehicle.registration_number) {
    return vehicle.license_plate || vehicle.registration_number;
  }
  
  if (vehicle.make || vehicle.model) {
    return `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || fallback;
  }
  
  return fallback;
}

/**
 * Get a display name for a location
 * Never displays raw UUIDs
 */
export function getLocationDisplayName(location: any, fallback: string = 'Unknown Location'): string {
  if (!location) return fallback;
  
  if (location.name) return location.name;
  if (location.address) return location.address;
  
  return fallback;
}

/**
 * Get a display name for a user/profile
 * Never displays raw UUIDs
 */
export function getUserDisplayName(user: any, fallback: string = 'System'): string {
  if (!user) return fallback;
  
  if (user.name) return user.name;
  if (user.first_name || user.last_name) {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || fallback;
  }
  if (user.email) {
    // Extract name from email if available
    const emailName = user.email.split('@')[0];
    return emailName.replace(/[._-]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  }
  
  return fallback;
}
