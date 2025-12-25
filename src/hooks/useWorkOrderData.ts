import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Location, Customer, Vehicle, Profile, ServiceCategory, SlaPolicy } from "@/types/supabase";
import { useRealtimeData } from "@/context/RealtimeDataContext";

export const useWorkOrderData = () => {
  // Use RealtimeDataContext for work orders and technicians (eliminates duplicate queries)
  const { realtimeWorkOrders, realtimeTechnicians, isLoadingRealtimeData } = useRealtimeData();

  // Use real-time data for work orders and technicians
  const allWorkOrders = realtimeWorkOrders;
  const technicians = realtimeTechnicians;

  // Auxiliary data with optimized staleTime to reduce redundant fetches
  const { data: locations, isLoading: isLoadingLocations, error: locationsError } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: customers, isLoading: isLoadingCustomers, error: customersError } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: vehicles, isLoading: isLoadingVehicles, error: vehiclesError } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicles').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: profiles, isLoading: isLoadingProfiles, error: profilesError } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - profiles change less frequently
  });

  const { data: serviceCategories, isLoading: isLoadingServiceCategories, error: serviceCategoriesError } = useQuery<ServiceCategory[]>({
    queryKey: ['service_categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('service_categories').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - categories change less frequently
  });

  // TODO: The 'sla_policies' table is missing from the database schema.
  // A migration exists but appears to have failed or not run.
  // This query is temporarily disabled to prevent a runtime crash.
  // To re-enable, ensure the '0014_create_tables_for_service_categories_and_sla_policies...' migration has been successfully applied.
  const slaPolicies: SlaPolicy[] = [];
  const isLoadingSlaPolicies = false;
  const slaPoliciesError = null;
  // const { data: slaPolicies, isLoading: isLoadingSlaPolicies, error: slaPoliciesError } = useQuery<SlaPolicy[]>({
  //   queryKey: ['sla_policies'],
  //   queryFn: async () => {
  //     const { data, error } = await supabase.from('sla_policies').select('*');
  //     if (error) throw new Error(error.message);
  //     return data || [];
  //   },
  //   staleTime: 10 * 60 * 1000, // 10 minutes - policies change less frequently
  // });

  // Include isLoadingRealtimeData in the overall loading state so the UI waits for work orders
  const isLoading = isLoadingLocations || isLoadingCustomers || isLoadingVehicles ||
    isLoadingProfiles || isLoadingServiceCategories || isLoadingSlaPolicies || isLoadingRealtimeData;

  const error = locationsError || customersError || vehiclesError || profilesError || serviceCategoriesError || slaPoliciesError;

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
    error,
    refetch: () => { } // No need to refetch real-time data
  };
};