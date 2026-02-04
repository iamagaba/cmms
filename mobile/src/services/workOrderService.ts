import {supabase} from './supabase';
import {MobileWorkOrder} from '@/types';
import {apiClient} from './apiClient';

export interface WorkOrderFilters {
  status?: string[];
  priority?: string[];
  assignedTechnicianId?: string;
  searchQuery?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface WorkOrderSortOptions {
  field: 'priority' | 'appointmentDate' | 'createdAt' | 'distance';
  direction: 'asc' | 'desc';
}

export interface WorkOrderUpdateData {
  status?: string;
  mobileStatus?: string;
  serviceNotes?: string;
  activityLog?: Array<{
    timestamp: string;
    activity: string;
    userId: string;
  }>;
  completedAt?: string;
  partsUsed?: Array<{
    name: string;
    quantity: number;
  }>;
}

class WorkOrderService {
  /**
   * Get work orders assigned to a technician with filtering and sorting
   */
  async getWorkOrders(
    technicianId: string,
    filters?: WorkOrderFilters,
    sort?: WorkOrderSortOptions
  ): Promise<MobileWorkOrder[]> {
    let query = supabase
      .from('work_orders')
      .select(`
        *,
        customers!inner(name, phone),
        vehicles!inner(model, make, year),
        locations(address, latitude, longitude)
      `)
      .eq('assignedTechnicianId', technicianId);

    // Apply filters
    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }

    if (filters?.priority?.length) {
      query = query.in('priority', filters.priority);
    }

    if (filters?.searchQuery) {
      query = query.or(`
        workOrderNumber.ilike.%${filters.searchQuery}%,
        customers.name.ilike.%${filters.searchQuery}%,
        vehicles.model.ilike.%${filters.searchQuery}%,
        service.ilike.%${filters.searchQuery}%
      `);
    }

    if (filters?.dateRange) {
      query = query
        .gte('appointmentDate', filters.dateRange.start)
        .lte('appointmentDate', filters.dateRange.end);
    }

    // Apply sorting
    if (sort) {
      const direction = sort.direction === 'desc';
      switch (sort.field) {
        case 'priority':
          // Custom priority sorting: Emergency > High > Medium > Low
          query = query.order('priority', {
            ascending: false,
            nullsFirst: false,
          });
          break;
        case 'appointmentDate':
          query = query.order('appointmentDate', {ascending: !direction});
          break;
        case 'createdAt':
          query = query.order('created_at', {ascending: !direction});
          break;
        default:
          query = query.order('created_at', {ascending: false});
      }
    } else {
      // Default sorting: priority first, then appointment date
      query = query
        .order('priority', {ascending: false})
        .order('appointmentDate', {ascending: true});
    }

    const {data, error} = await query;

    if (error) {
      throw new Error(`Failed to fetch work orders: ${error.message}`);
    }

    // Transform to MobileWorkOrder format
    return (data || []).map(this.transformToMobileWorkOrder);
  }

  /**
   * Get nearby work orders for pickup
   */
  async getNearbyWorkOrders(
    latitude: number,
    longitude: number,
    radiusKm: number = 50
  ): Promise<MobileWorkOrder[]> {
    // Use PostGIS functions for geographic queries
    const {data, error} = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!inner(name, phone),
        vehicles!inner(model, make, year),
        locations(address, latitude, longitude)
      `)
      .is('assignedTechnicianId', null)
      .eq('status', 'New')
      .not('customerLat', 'is', null)
      .not('customerLng', 'is', null);

    if (error) {
      throw new Error(`Failed to fetch nearby work orders: ${error.message}`);
    }

    // Filter by distance and calculate travel time
    const workOrdersWithDistance = (data || [])
      .map(wo => {
        const workOrder = this.transformToMobileWorkOrder(wo);
        if (workOrder.customerLat && workOrder.customerLng) {
          workOrder.distanceFromTechnician = this.calculateDistance(
            latitude,
            longitude,
            workOrder.customerLat,
            workOrder.customerLng
          );
          workOrder.estimatedTravelTime = this.estimateTravelTime(
            workOrder.distanceFromTechnician
          );
        }
        return workOrder;
      })
      .filter(wo => (wo.distanceFromTechnician || 0) <= radiusKm)
      .sort((a, b) => (a.distanceFromTechnician || 0) - (b.distanceFromTechnician || 0));

    return workOrdersWithDistance;
  }

  /**
   * Get a single work order by ID
   */
  async getWorkOrderById(id: string): Promise<MobileWorkOrder> {
    const {data, error} = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!inner(name, phone, email),
        vehicles!inner(model, make, year, vin, license_plate),
        locations(address, latitude, longitude, city, state, zip_code)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch work order: ${error.message}`);
    }

    return this.transformToMobileWorkOrder(data);
  }

  /**
   * Update work order status and related fields
   */
  async updateWorkOrder(
    id: string,
    updates: WorkOrderUpdateData
  ): Promise<MobileWorkOrder> {
    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.status) {
      updateData.status = updates.status;
    }

    if (updates.serviceNotes) {
      updateData.serviceNotes = updates.serviceNotes;
    }

    if (updates.completedAt) {
      updateData.completedAt = updates.completedAt;
    }

    if (updates.partsUsed) {
      updateData.partsUsed = updates.partsUsed;
    }

    // Handle activity log updates
    if (updates.activityLog) {
      // Get current activity log and append new entries
      const {data: currentData} = await supabase
        .from('work_orders')
        .select('activityLog')
        .eq('id', id)
        .single();

      const currentLog = currentData?.activityLog || [];
      updateData.activityLog = [...currentLog, ...updates.activityLog];
    }

    const {data, error} = await supabase
      .from('work_orders')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        customers!inner(name, phone),
        vehicles!inner(model, make, year),
        locations(address, latitude, longitude)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update work order: ${error.message}`);
    }

    return this.transformToMobileWorkOrder(data);
  }

  /**
   * Subscribe to real-time work order updates
   */
  subscribeToWorkOrderUpdates(
    technicianId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel('work_order_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_orders',
          filter: `assignedTechnicianId=eq.${technicianId}`,
        },
        callback
      )
      .subscribe();
  }

  /**
   * Batch update multiple work orders
   */
  async batchUpdateWorkOrders(
    updates: Array<{id: string; data: WorkOrderUpdateData}>
  ): Promise<MobileWorkOrder[]> {
    const results: MobileWorkOrder[] = [];
    
    // Process updates in batches to avoid overwhelming the database
    const batchSize = 5;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      const batchPromises = batch.map(({id, data}) => 
        this.updateWorkOrder(id, data)
      );
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        console.error(`Batch update failed for batch starting at index ${i}:`, error);
        throw error;
      }
    }
    
    return results;
  }

  /**
   * Get work order statistics for dashboard
   */
  async getWorkOrderStats(technicianId: string): Promise<{
    total: number;
    inProgress: number;
    completed: number;
    overdue: number;
    todayCompleted: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    const {data, error} = await supabase
      .from('work_orders')
      .select('status, appointmentDate, completedAt')
      .eq('assignedTechnicianId', technicianId);

    if (error) {
      throw new Error(`Failed to fetch work order stats: ${error.message}`);
    }

    const stats = {
      total: data?.length || 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
      todayCompleted: 0,
    };

    data?.forEach(wo => {
      if (wo.status === 'In Progress') {
        stats.inProgress++;
      } else if (wo.status === 'Completed') {
        stats.completed++;
        if (wo.completedAt?.startsWith(today)) {
          stats.todayCompleted++;
        }
      }
      
      // Check if overdue (appointment date passed and not completed)
      if (wo.appointmentDate && wo.status !== 'Completed') {
        const appointmentDate = new Date(wo.appointmentDate);
        const now = new Date();
        if (appointmentDate < now) {
          stats.overdue++;
        }
      }
    });

    return stats;
  }

  /**
   * Search work orders with advanced text search
   */
  async searchWorkOrders(
    technicianId: string,
    searchQuery: string,
    options?: {
      includeCompleted?: boolean;
      limit?: number;
    }
  ): Promise<MobileWorkOrder[]> {
    let query = supabase
      .from('work_orders')
      .select(`
        *,
        customers!inner(name, phone),
        vehicles!inner(model, make, year),
        locations(address, latitude, longitude)
      `)
      .eq('assignedTechnicianId', technicianId);

    // Add text search across multiple fields
    if (searchQuery.trim()) {
      query = query.or(`
        workOrderNumber.ilike.%${searchQuery}%,
        customers.name.ilike.%${searchQuery}%,
        customers.phone.ilike.%${searchQuery}%,
        vehicles.model.ilike.%${searchQuery}%,
        vehicles.make.ilike.%${searchQuery}%,
        service.ilike.%${searchQuery}%,
        serviceNotes.ilike.%${searchQuery}%,
        customerAddress.ilike.%${searchQuery}%
      `);
    }

    // Filter out completed unless specifically requested
    if (!options?.includeCompleted) {
      query = query.neq('status', 'Completed');
    }

    // Apply limit
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    // Order by relevance (priority first, then date)
    query = query
      .order('priority', {ascending: false})
      .order('appointmentDate', {ascending: true});

    const {data, error} = await query;

    if (error) {
      throw new Error(`Failed to search work orders: ${error.message}`);
    }

    return (data || []).map(this.transformToMobileWorkOrder);
  }

  /**
   * Transform database work order to mobile format
   */
  public transformToMobileWorkOrder(data: any): MobileWorkOrder {
    return {
      id: data.id,
      workOrderNumber: data.workOrderNumber,
      status: data.status,
      priority: data.priority || 'Medium',
      mobileStatus: this.determineMobileStatus(data.status),
      customerId: data.customerId,
      customerName: data.customers?.name || '',
      customerPhone: data.customers?.phone || '',
      vehicleId: data.vehicleId,
      vehicleModel: data.vehicles ? `${data.vehicles.year} ${data.vehicles.make} ${data.vehicles.model}` : '',
      service: data.service || data.initialDiagnosis || '',
      serviceNotes: data.serviceNotes || data.maintenanceNotes || '',
      assignedTechnicianId: data.assignedTechnicianId,
      locationId: data.locationId,
      customerLat: data.customerLat,
      customerLng: data.customerLng,
      customerAddress: data.customerAddress || data.locations?.address || '',
      appointmentDate: data.appointmentDate,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      lastSyncTimestamp: new Date().toISOString(),
      localChanges: false,
    };
  }

  /**
   * Determine mobile status based on work order status
   */
  private determineMobileStatus(status: string): MobileWorkOrder['mobileStatus'] {
    switch (status) {
      case 'New':
      case 'Confirmation':
        return 'assigned';
      case 'Ready':
        return 'traveling';
      case 'In Progress':
        return 'in_progress';
      case 'Completed':
        return 'completed';
      default:
        return 'assigned';
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Estimate travel time based on distance (rough calculation)
   */
  private estimateTravelTime(distanceKm: number): number {
    // Assume average speed of 40 km/h in urban areas
    return Math.round((distanceKm / 40) * 60); // Return minutes
  }
}

export const workOrderService = new WorkOrderService();