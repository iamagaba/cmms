import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, Technician, Location, Customer, Vehicle, Profile, ServiceCategory, SlaPolicy } from "@/types/supabase";
import { snakeToCamelCase } from "@/utils/data-helpers";




export const useWorkOrderData = () => {
  const { data: allWorkOrders, isLoading: isLoadingWorkOrders, error: workOrdersError, refetch } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw new Error(error.message);
      
      return (data || []).map((item: any) => snakeToCamelCase(item) as WorkOrder);
    }
  });

  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(snakeToCamelCase) as Technician[];
    }
  });

  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(location => snakeToCamelCase(location) as Location);
    }
  });

  const { data: customers, isLoading: isLoadingCustomers } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(customer => snakeToCamelCase(customer) as Customer);
    }
  });

  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicles').select('*');
      if (error) throw new Error(error.message);
      // Keep snake_case to align with tables expecting license_plate etc.
      return (data || []) as Vehicle[];
    }
  });

  const { data: profiles, isLoading: isLoadingProfiles } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(profile => snakeToCamelCase(profile) as Profile);
    }
  });

  const { data: serviceCategories, isLoading: isLoadingServiceCategories } = useQuery<ServiceCategory[]>({
    queryKey: ['service_categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('service_categories').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(category => snakeToCamelCase(category) as ServiceCategory);
    }
  });

  const { data: slaPolicies, isLoading: isLoadingSlaPolicies } = useQuery<SlaPolicy[]>({
    queryKey: ['sla_policies'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sla_policies').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(policy => snakeToCamelCase(policy) as SlaPolicy);
    }
  });

  const isLoading = isLoadingWorkOrders || isLoadingTechnicians || isLoadingLocations || 
                   isLoadingCustomers || isLoadingVehicles || isLoadingProfiles || 
                   isLoadingServiceCategories || isLoadingSlaPolicies;

  return {
    allWorkOrders: allWorkOrders || [],
    technicians: technicians || [],
    locations: locations || [],
    customers: customers || [],
    vehicles: vehicles || [],
    profiles: profiles || [],
    serviceCategories: serviceCategories || [],
    slaPolicies: slaPolicies || [],
    isLoading,
    error: workOrdersError,
    refetch
  };
};