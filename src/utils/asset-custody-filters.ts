import { WorkOrder, Vehicle } from '@/types/supabase';

/**
 * Filter work orders to show only those with assets in custody (In Repair status)
 */
export const filterWorkOrdersInCustody = (
  workOrders: WorkOrder[],
  vehicles: Vehicle[]
): WorkOrder[] => {
  const vehicleMap = new Map(vehicles.map(v => [v.id, v]));
  
  return workOrders.filter(wo => {
    if (!wo.vehicleId) return false;
    const vehicle = vehicleMap.get(wo.vehicleId);
    return vehicle?.status === 'In Repair';
  });
};

/**
 * Filter work orders to show only those with assets still with customer
 */
export const filterWorkOrdersWithCustomer = (
  workOrders: WorkOrder[],
  vehicles: Vehicle[]
): WorkOrder[] => {
  const vehicleMap = new Map(vehicles.map(v => [v.id, v]));
  
  return workOrders.filter(wo => {
    if (!wo.vehicleId) return true; // No vehicle = assume with customer
    const vehicle = vehicleMap.get(wo.vehicleId);
    return vehicle?.status === 'Normal' || vehicle?.status === 'Available';
  });
};

/**
 * Get custody statistics for dashboard
 */
export const getCustodyStats = (vehicles: Vehicle[]) => {
  const stats = {
    inCustody: 0,
    withCustomer: 0,
    decommissioned: 0,
    total: vehicles.length
  };

  vehicles.forEach(vehicle => {
    if (vehicle.status === 'In Repair') {
      stats.inCustody++;
    } else if (vehicle.status === 'Decommissioned') {
      stats.decommissioned++;
    } else {
      stats.withCustomer++;
    }
  });

  return stats;
};
