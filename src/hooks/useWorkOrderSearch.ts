import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/supabase";

interface UseWorkOrderSearchParams {
  searchQuery?: string;
  statusFilter?: string[];
  priorityFilter?: string[];
  technicianFilter?: string[];
  locationFilter?: string[];
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

interface WorkOrderSearchResult {
  workOrders: WorkOrder[];
  totalCount: number;
  hasMore: boolean;
}

/**
 * Scalable server-side work order search with pagination
 * 
 * Benefits:
 * - Server-side filtering reduces client memory usage
 * - Pagination prevents loading thousands of records
 * - Database indexes make search fast even with 100k+ records
 * - Proper joins eliminate O(n²) complexity
 */
export const useWorkOrderSearch = ({
  searchQuery = '',
  statusFilter = [],
  priorityFilter = [],
  technicianFilter = [],
  locationFilter = [],
  page = 0,
  pageSize = 50,
  enabled = true,
}: UseWorkOrderSearchParams = {}) => {
  
  return useQuery<WorkOrderSearchResult>({
    queryKey: [
      'work_orders_search',
      searchQuery,
      statusFilter,
      priorityFilter,
      technicianFilter,
      locationFilter,
      page,
      pageSize,
    ],
    queryFn: async () => {
      let workOrders: any[] = [];
      let totalCount = 0;

      // If searching, we need to handle license plate search specially
      if (searchQuery.trim()) {
        const searchTerm = searchQuery.trim().toLowerCase();
        
        // First, search for vehicles with matching license plates
        const { data: matchingVehicles } = await supabase
          .from('vehicles')
          .select('id, license_plate')
          .ilike('license_plate', `%${searchTerm}%`);
        
        const matchingVehicleIds = matchingVehicles?.map(v => v.id) || [];
        
        // Build the work orders query
        let query = supabase
          .from('work_orders')
          .select('*', { count: 'exact' });
        
        // Search in work order fields OR in matching vehicle IDs
        if (matchingVehicleIds.length > 0) {
          // Search in work order fields OR vehicle_id matches
          query = query.or(`
            work_order_number.ilike.%${searchTerm}%,
            service.ilike.%${searchTerm}%,
            service_notes.ilike.%${searchTerm}%,
            customer_name.ilike.%${searchTerm}%,
            customer_phone.ilike.%${searchTerm}%,
            vehicle_model.ilike.%${searchTerm}%,
            customer_address.ilike.%${searchTerm}%,
            vehicle_id.in.(${matchingVehicleIds.join(',')})
          `.replace(/\s+/g, ''));
        } else {
          // Just search in work order fields
          query = query.or(`
            work_order_number.ilike.%${searchTerm}%,
            service.ilike.%${searchTerm}%,
            service_notes.ilike.%${searchTerm}%,
            customer_name.ilike.%${searchTerm}%,
            customer_phone.ilike.%${searchTerm}%,
            vehicle_model.ilike.%${searchTerm}%,
            customer_address.ilike.%${searchTerm}%
          `.replace(/\s+/g, ''));
        }
        
        // Apply other filters
        if (statusFilter.length > 0) {
          query = query.in('status', statusFilter);
        }
        if (priorityFilter.length > 0) {
          query = query.in('priority', priorityFilter);
        }
        if (technicianFilter.length > 0) {
          query = query.in('assigned_technician_id', technicianFilter);
        }
        if (locationFilter.length > 0) {
          query = query.in('location_id', locationFilter);
        }
        
        // Pagination
        const from = page * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
        
        // Order by created date
        query = query.order('created_at', { ascending: false });
        
        const { data, error, count } = await query;
        
        if (error) {
          throw new Error(`Search failed: ${error.message}`);
        }
        
        workOrders = data || [];
        totalCount = count || 0;
        
      } else {
        // No search query - just apply filters
        let query = supabase
          .from('work_orders')
          .select('*', { count: 'exact' });
        
        // Apply filters
        if (statusFilter.length > 0) {
          query = query.in('status', statusFilter);
        }
        if (priorityFilter.length > 0) {
          query = query.in('priority', priorityFilter);
        }
        if (technicianFilter.length > 0) {
          query = query.in('assigned_technician_id', technicianFilter);
        }
        if (locationFilter.length > 0) {
          query = query.in('location_id', locationFilter);
        }
        
        // Pagination
        const from = page * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
        
        // Order by created date
        query = query.order('created_at', { ascending: false });
        
        const { data, error, count } = await query;
        
        if (error) {
          throw new Error(`Search failed: ${error.message}`);
        }
        
        workOrders = data || [];
        totalCount = count || 0;
      }

      return {
        workOrders,
        totalCount,
        hasMore: totalCount > (page + 1) * pageSize,
      };
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds - balance between freshness and performance
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

/**
 * Hook for quick license plate search (optimized for autocomplete)
 */
export const useLicensePlateSearch = (searchQuery: string, limit = 10) => {
  return useQuery({
    queryKey: ['license_plate_search', searchQuery, limit],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];

      const { data, error } = await supabase
        .from('vehicles')
        .select('id, license_plate, make, model')
        .ilike('license_plate', `%${searchQuery.trim()}%`)
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    enabled: searchQuery.trim().length > 0,
    staleTime: 60 * 1000, // 1 minute
  });
};
