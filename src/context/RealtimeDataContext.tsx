/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { WorkOrder, Technician } from '@/types/supabase';
import { snakeToCamelCase } from '@/utils/data-helpers';
import dayjs from 'dayjs';

interface RealtimeDataContextType {
  realtimeWorkOrders: WorkOrder[];
  realtimeTechnicians: Technician[];
  isLoadingRealtimeData: boolean;
}

const RealtimeDataContext = createContext<RealtimeDataContextType | undefined>(undefined);

const EMERGENCY_BIKE_THRESHOLD_HOURS = 6;

export const RealtimeDataProvider = ({ children }: { children: ReactNode }) => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoadingRealtimeData, setIsLoadingRealtimeData] = useState(true);

  // Helper to transform raw work order data from Supabase (snake_case) to frontend WorkOrder type (camelCase)
  // and calculate is_emergency_bike_eligible
  const transformWorkOrder = (item: any): WorkOrder => {
    const mappedData: WorkOrder = {
      ...item,
      createdAt: item.created_at,
      workOrderNumber: item.work_order_number,
      assignedTechnicianId: item.assigned_technician_id,
      locationId: item.location_id,
      initialDiagnosis: item.client_report,
      maintenanceNotes: item.maintenance_notes || item.service_notes,
      issueType: item.issue_type,
      faultCode: item.fault_code,
      service: item.service,
      serviceNotes: item.service_notes,
      partsUsed: item.parts_used,
      activityLog: item.activity_log,
      slaDue: item.sla_due,
      completedAt: item.completed_at,
      customerLat: item.customer_lat,
      customerLng: item.customer_lng,
      customerAddress: item.customer_address,
      onHoldReason: item.on_hold_reason,
      appointmentDate: item.appointment_date,
      customerId: item.customer_id,
      vehicleId: item.vehicle_id,
      created_by: item.created_by,
      service_category_id: item.service_category_id,
      confirmed_at: item.confirmed_at,
      work_started_at: item.work_started_at,
      sla_timers_paused_at: item.sla_timers_paused_at,
      total_paused_duration_seconds: item.total_paused_duration_seconds,
      emergency_bike_notified_at: item.emergency_bike_notified_at,
      active_emergency_bike_assignment: item.active_emergency_bike_assignment?.length > 0 ? item.active_emergency_bike_assignment[0] : null,
    };

    // Calculate is_emergency_bike_eligible on the frontend
    if (mappedData.status === 'In Progress' && mappedData.work_started_at) {
      const workStartedAt = dayjs(mappedData.work_started_at);
      const now = dayjs();
      const totalPausedSeconds = mappedData.total_paused_duration_seconds || 0;
      const elapsedActiveTimeSeconds = now.diff(workStartedAt, 'second') - totalPausedSeconds;
      const thresholdSeconds = EMERGENCY_BIKE_THRESHOLD_HOURS * 3600;
      // Add the properties dynamically to avoid type errors
      (mappedData as any).is_emergency_bike_eligible = elapsedActiveTimeSeconds >= thresholdSeconds && !(mappedData as any).active_emergency_bike_assignment;
    } else {
      (mappedData as any).is_emergency_bike_eligible = false;
    }

    return mappedData;
  };

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingRealtimeData(true);
      try {
        // Fetch work orders with necessary joins for initial state
        const { data: woData, error: woError } = await supabase
          .from('work_orders')
          .select(`
            *,
            active_emergency_bike_assignment:emergency_bike_assignments!left(
              *,
              vehicles(*)
            ),
            service_categories(
              sla_policies(*)
            )
          `);
        if (woError) {
          console.warn('Could not load work orders:', woError.message);
          setWorkOrders([]);
        } else {
          setWorkOrders((woData || []).map(transformWorkOrder));
        }

        // Fetch technicians
        const { data: techData, error: techError } = await supabase.from('technicians').select('*');
        if (techError) {
          console.warn('Could not load technicians:', techError.message);
          setTechnicians([]);
        } else {
          setTechnicians((techData || []).map(snakeToCamelCase) as Technician[]);
        }
      } catch (error) {
        console.error('Error fetching initial real-time data:', error);
        // Set empty arrays so the app doesn't hang
        setWorkOrders([]);
        setTechnicians([]);
      } finally {
        setIsLoadingRealtimeData(false);
      }
    };

    fetchInitialData();
  }, []);

  // Realtime subscriptions
  useEffect(() => {
    // Work Orders Channel
    const woChannel = supabase
      .channel('public:work_orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'work_orders' },
        (payload: RealtimePostgresChangesPayload<any>) => {
          setWorkOrders(prev => {
            if (payload.eventType === 'INSERT') {
              // For INSERT, we need to refetch the new record with its joins
              // to ensure active_emergency_bike_assignment and service_categories are present.
              // This is a limitation of Realtime, it only sends the row data, not joined data.
              // A full refetch of the specific work order is needed.
              supabase.from('work_orders')
                .select(`
                  *,
                  active_emergency_bike_assignment:emergency_bike_assignments!left(
                    *,
                    vehicles(*)
                  ),
                  service_categories(
                    sla_policies(*)
                  )
                `)
                .eq('id', payload.new.id)
                .single()
                .then(({ data, error }) => {
                  if (error) console.error('Error refetching new work order for realtime:', error);
                  if (data) {
                    setWorkOrders(current => [transformWorkOrder(data), ...current.filter(wo => wo.id !== data.id)]);
                  }
                });
              return prev; // Return previous state for now, will be updated by refetch
            } else if (payload.eventType === 'UPDATE') {
              // For UPDATE, also refetch to get updated joined data if any related fields changed
              supabase.from('work_orders')
                .select(`
                  *,
                  active_emergency_bike_assignment:emergency_bike_assignments!left(
                    *,
                    vehicles(*)
                  ),
                  service_categories(
                    sla_policies(*)
                  )
                `)
                .eq('id', payload.new.id)
                .single()
                .then(({ data, error }) => {
                  if (error) console.error('Error refetching updated work order for realtime:', error);
                  if (data) {
                    setWorkOrders(current => current.map(wo => wo.id === data.id ? transformWorkOrder(data) : wo));
                  }
                });
              return prev; // Return previous state for now, will be updated by refetch
            } else if (payload.eventType === 'DELETE') {
              return prev.filter(wo => wo.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    // Technicians Channel
    const techChannel = supabase
      .channel('public:technicians')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'technicians' },
        (payload: RealtimePostgresChangesPayload<Technician>) => {
          setTechnicians(prev => {
            if (payload.eventType === 'INSERT') {
              return [snakeToCamelCase(payload.new) as Technician, ...prev];
            } else if (payload.eventType === 'UPDATE') {
              return prev.map(tech => tech.id === payload.new.id ? snakeToCamelCase(payload.new) as Technician : tech);
            } else if (payload.eventType === 'DELETE') {
              return prev.filter(tech => tech.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(woChannel);
      supabase.removeChannel(techChannel);
    };
  }, []);

  const contextValue = useMemo(() => ({
    realtimeWorkOrders: workOrders,
    realtimeTechnicians: technicians,
    isLoadingRealtimeData,
  }), [workOrders, technicians, isLoadingRealtimeData]);

  return (
    <RealtimeDataContext.Provider value={contextValue}>
      {children}
    </RealtimeDataContext.Provider>
  );
};

export const useRealtimeData = () => {
  const context = useContext(RealtimeDataContext);
  if (context === undefined) {
    // Return default empty state instead of throwing error to prevent blank pages
    console.warn('useRealtimeData used outside of RealtimeDataProvider, returning empty state');
    return {
      realtimeWorkOrders: [],
      realtimeTechnicians: [],
      isLoadingRealtimeData: false,
    };
  }
  return context;
};