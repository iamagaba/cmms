import React, { useEffect, useState } from 'react';
import { Maximize2, X, Info, Tag, Clock, MapPin, Bike, Car, Wrench, Calendar, Shield, Gauge, User, Phone, Printer, MessageSquare } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, Technician, Location, Customer, Vehicle, WorkOrderPart, Profile } from '@/types/supabase';
import { DiagnosticCategoryRow } from '@/types/diagnostic';
import { getWorkOrderNumber } from '@/utils/work-order-display';
import { snakeToCamelCase, camelToSnakeCase } from '@/utils/data-helpers';
import { Skeleton } from '@/components/tailwind-components';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from "@/utils/toast";
import { useSession } from "@/context/SessionContext";
import WorkOrderStepper from '@/components/WorkOrderStepper/WorkOrderStepper';
import { WorkOrderDetailsInfoCard } from '@/components/work-order-details/WorkOrderDetailsInfoCard';
import { Button } from '@/components/ui/button';
import { WorkOrderCostSummaryCard } from '@/components/work-order-details/WorkOrderCostSummaryCard';
import { WorkOrderActivityLogCard } from '@/components/work-order-details/WorkOrderActivityLogCard';
import { WorkOrderLocationMapCard } from '@/components/work-order-details/WorkOrderLocationMapCard';
import { WorkOrderRelatedHistoryCard } from '@/components/work-order-details/WorkOrderRelatedHistoryCard';
import { ConfirmationCallDialog } from './work-order-details/ConfirmationCallDialog';
import { AssignTechnicianModal } from '@/components/work-order-details/AssignTechnicianModal';
import { WorkOrderPrintDialog } from '@/components/work-orders/WorkOrderPrintDialog';
import AssignEmergencyBikeModal from '@/components/work-order-details/AssignEmergencyBikeModal';
import { useWorkOrderMutations } from '@/hooks/useWorkOrderMutations';
import { useAddPartToWorkOrder, useRemovePartFromWorkOrder } from '@/hooks/useWorkOrderParts';
import { UgandaLicensePlate } from '@/components/ui/UgandaLicensePlate';
import { MaintenanceCompletionDrawer } from '@/components/MaintenanceCompletionDrawer';
import { WorkOrderPartsDialog } from '@/components/WorkOrderPartsDialog';
import { WorkOrderOverviewCards } from '@/components/work-order-details/WorkOrderOverviewCards';
import { WorkOrderNotes } from '@/components/work-order-details/WorkOrderNotes';
import { useRealtimeData } from '@/context/RealtimeDataContext';

dayjs.extend(relativeTime);

interface WorkOrderDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  workOrderId?: string | null;
  onWorkOrderChange?: (id: string) => void;
  readOnly?: boolean;
}

export const WorkOrderDetailsDrawer: React.FC<WorkOrderDetailsDrawerProps> = ({
  open,
  onClose,
  workOrderId,
  onWorkOrderChange,
  readOnly = false,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'parts' | 'activity' | 'location' | 'notes'>('overview');
  const [isConfirmationCallDialogOpen, setIsConfirmationCallDialogOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAssignEmergencyOpen, setIsAssignEmergencyOpen] = useState(false);
  const [isMaintenanceCompletionDrawerOpen, setIsMaintenanceCompletionDrawerOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [confirmationError, setConfirmationError] = useState<string | null>(null);


  // Fetch work order
  const { data: workOrder, isLoading: isLoadingWorkOrder } = useQuery<WorkOrder | null>({
    queryKey: ['work_order_drawer', workOrderId],
    queryFn: async () => {
      if (!workOrderId) return null;
      const { data, error } = await supabase.from('work_orders').select('*').eq('id', workOrderId).single();
      if (error) throw new Error(error.message);
      return snakeToCamelCase(data) as WorkOrder;
    },
    enabled: !!workOrderId && open,
  });

  // Fetch technician
  const { data: technician } = useQuery<Technician | null>({
    queryKey: ['technician', workOrder?.assignedTechnicianId],
    queryFn: async () => {
      if (!workOrder?.assignedTechnicianId) return null;
      const { data, error } = await supabase.from('technicians').select('*').eq('id', workOrder.assignedTechnicianId).single();
      if (error) return null;
      return snakeToCamelCase(data) as Technician;
    },
    enabled: !!workOrder?.assignedTechnicianId,
  });

  // Fetch all technicians for the info card
  const { data: allTechnicians } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*');
      if (error) return [];
      return (data || []).map(t => snakeToCamelCase(t) as Technician);
    },
  });

  // Fetch location
  const { data: location } = useQuery<Location | null>({
    queryKey: ['location', workOrder?.locationId],
    queryFn: async () => {
      if (!workOrder?.locationId) return null;
      const { data, error } = await supabase.from('locations').select('*').eq('id', workOrder.locationId).single();
      if (error) return null;
      return snakeToCamelCase(data) as Location;
    },
    enabled: !!workOrder?.locationId,
  });

  // Fetch all locations
  const { data: allLocations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) return [];
      return (data || []).map(l => snakeToCamelCase(l) as Location);
    },
  });

  const { updateWorkOrder } = useWorkOrderMutations({
    serviceCategories: [],
    slaPolicies: [],
    technicians: allTechnicians || [],
    locations: allLocations || []
  });

  // Fetch customer
  const { data: customer } = useQuery<Customer | null>({
    queryKey: ['customer', workOrder?.customerId],
    queryFn: async () => {
      if (!workOrder?.customerId) return null;
      const { data, error } = await supabase.from('customers').select('*').eq('id', workOrder.customerId).single();
      if (error) return null;
      return snakeToCamelCase(data) as Customer;
    },
    enabled: !!workOrder?.customerId,
  });

  // Fetch vehicle
  const { data: vehicle } = useQuery<Vehicle | null>({
    queryKey: ['vehicle', workOrder?.vehicleId],
    queryFn: async () => {
      if (!workOrder?.vehicleId) return null;
      const { data, error } = await supabase.from('vehicles').select('*').eq('id', workOrder.vehicleId).single();
      if (error) return null;
      return snakeToCamelCase(data) as Vehicle;
    },
    enabled: !!workOrder?.vehicleId,
  });

  // Fetch parts used
  const { data: usedParts } = useQuery<WorkOrderPart[]>({
    queryKey: ['work_order_parts', workOrderId],
    queryFn: async () => {
      if (!workOrderId) return [];
      const { data, error } = await supabase
        .from('work_order_parts')
        .select('*, inventory_items(*)')
        .eq('work_order_id', workOrderId);
      if (error) return [];
      return (data || []).map(p => snakeToCamelCase(p) as WorkOrderPart);
    },
    enabled: !!workOrderId && open,
  });

  // Fetch profiles for activity log
  const { data: profiles } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, is_admin, updated_at');
      if (error) {
        console.error('Error fetching profiles:', error);
        return [];
      }
      return (data || []).map(p => snakeToCamelCase(p) as Profile);
    },
  });

  // Fetch diagnostic categories
  const { data: serviceCategories } = useQuery<DiagnosticCategoryRow[]>({
    queryKey: ['diagnostic_categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('diagnostic_categories').select('*');
      if (error) return [];
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  // Emergency Bike Logic - Fetch assignment (active or returned)
  const { data: emergencyAssignment, refetch: refetchEmergencyAssignment } = useQuery({
    queryKey: ['emergency_assignment', workOrderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emergency_bike_assignments')
        .select('*')
        .eq('work_order_id', workOrderId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!workOrderId && open,
  });

  // Check if assignment is active (not returned)
  const activeEmergencyAssignment = emergencyAssignment && !emergencyAssignment.returned_at ? emergencyAssignment : null;
  const { data: emergencyBike, isLoading: isLoadingEmergencyBike } = useQuery<Vehicle | null>({
    queryKey: ['emergency_bike', activeEmergencyAssignment?.emergency_bike_asset_id],
    queryFn: async () => {
      if (!activeEmergencyAssignment?.emergency_bike_asset_id) return null;
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', activeEmergencyAssignment.emergency_bike_asset_id)
        .single();
      if (error) return null;
      return snakeToCamelCase(data) as Vehicle;
    },
    enabled: !!activeEmergencyAssignment?.emergency_bike_asset_id,
  });



  const computeElapsedActiveSeconds = () => {
    const startIso = workOrder?.workStartedAt || workOrder?.createdAt;
    if (!startIso) return 0;
    const paused = workOrder?.totalPausedDurationSeconds || 0;
    const elapsedMs = Date.now() - new Date(startIso as string).getTime();
    return Math.max(0, Math.floor(elapsedMs / 1000) - paused);
  };

  const elapsedSec = computeElapsedActiveSeconds();
  const sixHoursSec = 6 * 60 * 60;
  // const sixHoursSec = 10; // DEBUG: 10 seconds for testing
  const hasActiveEmergencyAssignment = Boolean(activeEmergencyAssignment);
  const emergencyEligible = workOrder?.status !== 'Completed' && !hasActiveEmergencyAssignment && elapsedSec >= sixHoursSec;

  const profileMap = new Map(
    (profiles || []).map(p => {
      const displayName = p.fullName || p.email || 'Unknown User';
      return [p.id, displayName];
    })
  );

  // Debug: Log profiles to help identify missing users
  if (workOrder?.activityLog && profiles) {
    const userIds = new Set(workOrder.activityLog.map((entry: any) => entry.userId).filter(Boolean));
    const missingUserIds = Array.from(userIds).filter(id => !profileMap.has(id));
    if (missingUserIds.length > 0) {
      console.warn('Activity log contains user IDs not found in profiles:', missingUserIds);
    }
  }

  const { session } = useSession();
  const { refreshData } = useRealtimeData();

  // Mutation for updating work order with optimistic updates
  const workOrderMutation = useMutation({
    mutationFn: async (workOrderData: Partial<WorkOrder>) => {
      const snakeCaseData = camelToSnakeCase(workOrderData);
      const { data, error } = await supabase
        .from('work_orders')
        .upsert([snakeCaseData])
        .select();

      if (error) throw new Error(error.message);
      return data;
    },
    onMutate: async (newWorkOrder) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['work_order_drawer', workOrderId] });

      // Snapshot the previous value
      const previousWorkOrder = queryClient.getQueryData<WorkOrder>(['work_order_drawer', workOrderId]);

      // Optimistically update to the new value
      if (previousWorkOrder) {
        queryClient.setQueryData<WorkOrder>(['work_order_drawer', workOrderId], {
          ...previousWorkOrder,
          ...newWorkOrder,
        });
      }

      // Return context with the previous value
      return { previousWorkOrder };
    },
    onError: (error, _, context) => {
      // Rollback to the previous value on error
      if (context?.previousWorkOrder) {
        queryClient.setQueryData(['work_order_drawer', workOrderId], context.previousWorkOrder);
      }
      showError(error.message);
    },
    onSettled: async () => {
      // Only invalidate the work orders list and single work order query
      // Don't invalidate the drawer query to prevent re-render
      queryClient.invalidateQueries({ 
        queryKey: ['work_orders'],
        refetchType: 'none' // Don't trigger refetch immediately
      });
      
      // Refresh realtime data in background
      refreshData();
    },
  });

  const addPartMutation = useAddPartToWorkOrder();
  const removePartMutation = useRemovePartFromWorkOrder();

  const handleAssignTechnician = (technicianId: string) => {
    if (!workOrder) return;
    updateWorkOrder(workOrder, {
      status: 'In Progress',
      assigned_technician_id: technicianId,
      work_started_at: new Date().toISOString()
    });
    setIsAssignModalOpen(false);
  };



  const handleConfirmationCall = async (notes: string, outcome: 'confirmed' | 'cancelled' | 'unreachable', appointmentDate?: string) => {
    if (!workOrder) return;

    try {
      const now = new Date().toISOString();
      const updates: any = { // Use any to allow camelCase properties before conversion
        id: workOrder.id,
        confirmationCallCompleted: outcome === 'confirmed' || outcome === 'cancelled',
        confirmationCallNotes: `${outcome.charAt(0).toUpperCase() + outcome.slice(1)}: ${notes}`,
        confirmationCallAt: now
      };

      // Update status based on outcome
      if (outcome === 'confirmed') {
        updates.status = 'Ready';
        updates.confirmedAt = now;
        updates.readyAt = now;
        // If coming directly from New, mark entry into confirmation flow
        // Use the work order's created_at as the confirmation entry time to show duration
        if (workOrder.status === 'New') {
          updates.confirmationStatusEnteredAt = workOrder.created_at || workOrder.createdAt || now;
        }
        if (appointmentDate) {
          updates.appointmentDate = new Date(appointmentDate).toISOString();
        }
      } else if (outcome === 'unreachable') {
        // Move to 'Confirmation' status if we made contact attempt but failed
        if (workOrder.status === 'New') {
          updates.status = 'Confirmation';
          updates.confirmationStatusEnteredAt = now;
        }
        updates.confirmationCallCompleted = false;
        // updates.last_call_attempt_at = now; // Column does not exist
      }

      workOrderMutation.mutate(updates, {
        onSuccess: () => {
          setIsConfirmationCallDialogOpen(false);
          showSuccess(
            outcome === 'confirmed'
              ? 'Appointment scheduled successfully. Work Order is Ready.'
              : outcome === 'cancelled'
                ? 'Work order cancelled.'
                : 'Call attempt logged. Will retry later.'
          );
        },
        onError: (error) => {
          console.error("Confirmation Call Error:", error);
          const msg = `Failed to update work order: ${error.message}`;
          setConfirmationError(msg);
          showError(msg);
        }
      });

    } catch (error: any) {
      console.error("Handle Confirmation Call Error:", error);
      const msg = error.message || 'Failed to save confirmation call';
      setConfirmationError(msg);
      showError(msg);
    }
  };

  const handleAssignEmergencyBike = async (bikeId: string, notes: string) => {
    if (!workOrder) return;

    try {
      const { error } = await supabase.from('emergency_bike_assignments').insert({
        work_order_id: workOrder.id,
        emergency_bike_asset_id: bikeId,
        customer_asset_id: workOrder.vehicleId,
        notes: notes || '',
        assigned_at: new Date().toISOString()
      });

      if (error) throw error;

      // Invalidate all related queries to refresh the UI
      await queryClient.invalidateQueries({ queryKey: ['active_emergency_assignment', workOrder.id] });
      await queryClient.invalidateQueries({ queryKey: ['emergency_bike', bikeId] });
      await queryClient.invalidateQueries({ queryKey: ['company_emergency_bikes'] });
      await queryClient.invalidateQueries({ queryKey: ['active_emergency_bike_assignments'] });

      setIsAssignEmergencyOpen(false);
      showSuccess('Emergency bike assigned successfully');
    } catch (error: any) {
      showError(error.message || 'Failed to assign emergency bike');
    }
  };

  const handleCompleteWorkOrder = async (data: { faultCode: string; maintenanceNotes: string }) => {
    if (!workOrder) return;
    const nowIso = new Date().toISOString();

    // Explicitly casting to any to allow redundant snake_case properties
    // This ensures that even if camelToSnakeCase fails for some reason, the DB columns are targeted correctly
    const updates: any = {
      status: 'Completed',
      faultCode: data.faultCode,
      maintenanceNotes: data.maintenanceNotes,
      completedAt: nowIso,
      // Redundant snake_case to be absolutely sure
      fault_code: data.faultCode,
      maintenance_notes: data.maintenanceNotes,
      completed_at: nowIso
    };

    // Return emergency bike if one is assigned
    if (activeEmergencyAssignment) {
      try {
        const { error } = await supabase
          .from('emergency_bike_assignments')
          .update({ returned_at: nowIso })
          .eq('id', activeEmergencyAssignment.id);

        if (error) {
          console.error('Error returning emergency bike:', error);
          showError('Failed to return emergency bike');
        } else {
          // Invalidate queries to refresh the UI
          await queryClient.invalidateQueries({ queryKey: ['active_emergency_bike', workOrder.id] });
          await queryClient.invalidateQueries({ queryKey: ['active_emergency_bike_assignments'] });
          await queryClient.invalidateQueries({ queryKey: ['company_emergency_bikes'] });
        }
      } catch (error) {
        console.error('Error returning emergency bike:', error);
      }
    }

    updateWorkOrder(workOrder, updates);
    setIsMaintenanceCompletionDrawerOpen(false);
  };



  const [hasAnimated, setHasAnimated] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      window.addEventListener('keydown', handleEscape);
      // Mark as animated after first open
      if (!hasAnimated) {
        setHasAnimated(true);
      }
    } else {
      // Reset animation flag when closed
      setHasAnimated(false);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose, hasAnimated]);

  if (!open) return null;

  const handleViewFullPage = () => {
    if (workOrderId) {
      // Pass the current work order data in state to ensure smooth transition
      // and prevent stale "New" status while fetching freshness
      navigate(`/work-orders/${workOrderId}`, {
        state: { initialWorkOrder: workOrder }
      });
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex justify-end" onClick={onClose}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

        {/* Drawer - width optimized for content density */}
        <div
          className={`relative bg-background shadow-lg h-full w-[750px] flex flex-col ${!hasAnimated ? 'animate-in slide-in-from-right duration-300' : ''}`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card flex-shrink-0">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-7 w-7"
              >
                <X className="w-4 h-4" />
              </Button>
              <div className="h-5 w-px bg-border" />
              {isLoadingWorkOrder ? (
                <Skeleton height="18px" width="100px" radius="sm" />
              ) : (
                <div className="flex items-center gap-2">
                  {/* Work Order Number + Status Chip */}
                  <h2 className="text-sm font-bold leading-none">
                    {workOrder?.workOrderNumber || 'Work Order'}
                  </h2>

                  {/* Status Chip - Same level as WO number */}
                  {workOrder && (
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-lg whitespace-nowrap ${workOrder.status === 'Completed' ? 'bg-muted text-foreground' :
                      workOrder.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                        workOrder.status === 'Ready' ? 'bg-muted text-muted-foreground' :
                          workOrder.status === 'Confirmation' ? 'bg-primary/10 text-primary' :
                            workOrder.status === 'On Hold' ? 'bg-muted text-muted-foreground' :
                              'bg-muted text-muted-foreground'
                      }`}>
                      <span className={`w-1 h-1 rounded-full animate-pulse ${workOrder.status === 'Completed' ? 'bg-emerald-500' :
                        workOrder.status === 'In Progress' ? 'bg-amber-500' :
                          workOrder.status === 'Ready' ? 'bg-blue-500' :
                            workOrder.status === 'Confirmation' ? 'bg-primary' :
                              workOrder.status === 'On Hold' ? 'bg-orange-500' :
                                'bg-muted-foreground'
                        }`} />
                      {workOrder.status}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPrintDialogOpen(true)}
                className="h-7 w-7"
                title="Print/Export"
              >
                <Printer className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleViewFullPage}
                className="h-7 w-7"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>



          {/* Info Strip - Using shared component */}
          {workOrder && (
            <div className="flex-shrink-0">
              <WorkOrderOverviewCards
                workOrder={workOrder}
                customer={customer}
                vehicle={vehicle}
                technician={technician}
                location={location}
              />
            </div>
          )}

          {/* Stepper */}
          {
            workOrder && !readOnly && (
              <div className="flex-shrink-0">
                <WorkOrderStepper
                  workOrder={workOrder}
                  profileMap={profileMap}
                  onConfirmationClick={() => setIsConfirmationCallDialogOpen(true)}
                  onReadyClick={() => setIsAssignModalOpen(true)}
                  onInProgressClick={() => setIsMaintenanceCompletionDrawerOpen(true)}
                />
              </div>
            )
          }

          {/* Emergency Bike Banner */}
          {(emergencyEligible || emergencyAssignment) && (
            <div className={`px-4 py-2 flex items-center justify-between border-b ${hasActiveEmergencyAssignment
              ? 'bg-primary/5 border-primary/20'
              : 'bg-amber-50 border-amber-200'
              }`}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hasActiveEmergencyAssignment ? 'bg-primary/10' : 'bg-amber-100'
                  }`}>
                  <Bike className={`w-5 h-5 ${hasActiveEmergencyAssignment ? 'text-primary' : 'text-amber-600'
                    }`} />
                </div>
                <div>
                  <p className={`text-xs font-bold ${hasActiveEmergencyAssignment ? 'text-foreground' : 'text-amber-900'
                    }`}>
                    {hasActiveEmergencyAssignment
                      ? `Emergency Bike: ${emergencyBike ? ((emergencyBike as any).licensePlate || emergencyBike.license_plate) : 'Loading...'}`
                      : 'Eligible for Emergency Bike'
                    }
                  </p>
                  {hasActiveEmergencyAssignment && (
                    <>
                      {isLoadingEmergencyBike ? (
                        <div className="mt-0.5">
                          <Skeleton width="140px" height="11px" radius="sm" />
                        </div>
                      ) : emergencyBike ? (
                        <>
                          <p className="text-xs text-muted-foreground">
                            {emergencyBike.make} {emergencyBike.model}
                          </p>
                          {activeEmergencyAssignment?.assigned_at && (
                            <p className="text-xs text-muted-foreground">
                              Assigned {new Date(activeEmergencyAssignment.assigned_at).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Bike details unavailable</p>
                      )}
                    </>
                  )}
                  {emergencyEligible && (
                    <p className="text-xs text-muted-foreground">
                      Repair has exceeded 6 hours
                    </p>
                  )}
                </div>
              </div>

              {!hasActiveEmergencyAssignment ? (
                !readOnly && (
                  <Button
                    size="sm"
                    onClick={() => setIsAssignEmergencyOpen(true)}
                    className="h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white border-none"
                  >
                    <Bike className="w-4 h-4 mr-1.5" />
                    Assign Bike
                  </Button>
                )
              ) : (
                <span className="px-2 py-1 text-xs font-medium rounded-lg uppercase tracking-wider bg-secondary text-secondary-foreground">
                  Active
                </span>
              )}
            </div>
          )}

          {/* Assign Technician Modal */}
          <AssignTechnicianModal
            open={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            technicians={allTechnicians || []}
            onAssign={handleAssignTechnician}
            locations={allLocations || []}
          />

          {workOrder && (
            <AssignEmergencyBikeModal
              open={isAssignEmergencyOpen}
              onClose={() => setIsAssignEmergencyOpen(false)}
              onAssign={handleAssignEmergencyBike}
            />
          )}

          {!readOnly && workOrder && (
            <MaintenanceCompletionDrawer
              isOpen={isMaintenanceCompletionDrawerOpen}
              onClose={() => setIsMaintenanceCompletionDrawerOpen(false)}
              onSave={handleCompleteWorkOrder}
              usedParts={usedParts || []}
              onAddPart={(itemId, quantity) => addPartMutation.mutate({
                work_order_id: workOrder.id,
                inventory_item_id: itemId,
                quantity
              })}
              onRemovePart={(partId) => removePartMutation.mutate({ partId, workOrderId: workOrder.id })}
              onAddPartClick={() => setIsAddPartDialogOpen(true)}
            />
          )}

          {workOrder && (
            <WorkOrderPartsDialog
              isOpen={isAddPartDialogOpen}
              onClose={() => setIsAddPartDialogOpen(false)}
              workOrderId={workOrder.id}
              workOrderNumber={getWorkOrderNumber(workOrder)}
            />
          )}

          {/* Tabs - Full width border */}
          <div className="flex border-b border-border px-3 flex-shrink-0 bg-card">
            {[
              { key: 'overview', label: 'Overview', icon: Info },
              { key: 'notes', label: 'Notes', icon: MessageSquare },
              { key: 'location', label: 'Location', icon: MapPin },
              { key: 'parts', label: 'Parts & Cost', icon: Tag },
              { key: 'activity', label: 'Activity', icon: Clock },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content - Scrollable with thin scrollbar */}
          <div className="flex-1 overflow-y-auto bg-muted/30">
            {isLoadingWorkOrder ? (
              <div className="p-3 space-y-2.5">
                <Skeleton height="70px" radius="md" />
                <Skeleton height="50px" radius="md" />
                <Skeleton height="90px" radius="md" />
              </div>
            ) : workOrder ? (
              <div className="p-3">
                {activeTab === 'overview' && (
                  <div className="space-y-2.5">
                    {/* Work Order Details */}
                    <WorkOrderDetailsInfoCard
                      workOrder={workOrder}
                      allLocations={allLocations || []}
                      serviceCategories={serviceCategories || []}
                      usedParts={usedParts}
                    />

                    {/* Related History */}
                    <WorkOrderRelatedHistoryCard
                      workOrder={workOrder}
                      onViewWorkOrder={(id) => {
                        if (onWorkOrderChange) {
                          onWorkOrderChange(id);
                        } else {
                          navigate(`/work-orders/${id}`);
                        }
                      }}
                      serviceCategories={serviceCategories || []}
                    />
                  </div>
                )}

                {activeTab === 'parts' && (
                  <WorkOrderCostSummaryCard
                    workOrder={workOrder}
                    usedParts={usedParts || []}
                  />
                )}

                {activeTab === 'activity' && (
                  <WorkOrderActivityLogCard
                    workOrder={workOrder}
                    profileMap={profileMap}
                  />
                )}

                {activeTab === 'location' && (
                  <WorkOrderLocationMapCard
                    workOrder={workOrder}
                    location={location || null}
                    allLocations={allLocations || []}
                  />
                )}

                {activeTab === 'notes' && (
                  <div className="h-full min-h-[400px]">
                    <WorkOrderNotes workOrderId={workOrder.id} />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 text-center text-muted-foreground text-xs">
                Work order not found
              </div>
            )}
          </div>

          {/* Footer - Simplified, no duplicate button */}
          <div className="px-3 py-2 border-t border-border bg-card flex-shrink-0">
            <div className="text-xs text-muted-foreground">
              {workOrder?.created_at && (
                <span>Created {dayjs(workOrder.created_at).format('MMM D, YYYY • h:mm A')}</span>
              )}
            </div>
          </div>
        </div>
      </div >

      {/* Confirmation Call Dialog */}
      {
        workOrder && (
          <ConfirmationCallDialog
            isOpen={isConfirmationCallDialogOpen}
            onClose={() => setIsConfirmationCallDialogOpen(false)}
            onConfirm={handleConfirmationCall}
            workOrderNumber={getWorkOrderNumber(workOrder)}
            customerName={customer?.name || workOrder.customerName || ''}
            customerPhone={customer?.phone || workOrder.customerPhone || ''}
            isSubmitting={workOrderMutation.isPending}
            error={confirmationError}
          />
        )
      }

      {/* Print Dialog */}
      {
        workOrder && (
          <WorkOrderPrintDialog
            open={isPrintDialogOpen}
            onOpenChange={setIsPrintDialogOpen}
            workOrder={workOrder}
            vehicleMake={vehicle?.make}
            vehicleModel={vehicle?.model}
            vehicleYear={vehicle?.year}
            vehicleVin={vehicle?.vin}
            warrantyEndDate={vehicle?.warranty_end_date || (vehicle as any)?.warrantyEndDate}
            technicianName={technician?.name}
            locationName={location?.name}
            serviceName={(serviceCategories || []).find(c => c.id === workOrder.service)?.name || workOrder.service || 'General Service'}
            parts={(usedParts || []).map(p => ({
              name: (p as any).inventoryItems?.name || (p as any).inventory_item?.name || 'Unknown Part',
              quantity: (p as any).quantityUsed || (p as any).quantity_used || 0,
              unit: (p as any).inventoryItems?.unitOfMeasure || (p as any).inventory_item?.unit_of_measure || 'pcs',
              price: (p as any).unitCost || (p as any).unit_cost || 0
            }))}
          />
        )
      }
    </>
  );
};

export default WorkOrderDetailsDrawer;


