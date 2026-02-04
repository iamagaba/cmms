import React, { useEffect, useState } from 'react';
import { Maximize2, X, Info, Tag, Clock, MapPin, Bike, Car, Wrench, Calendar, Shield, Gauge, User, Phone, Printer } from 'lucide-react';
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

dayjs.extend(relativeTime);

interface WorkOrderDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  workOrderId?: string | null;
  onWorkOrderChange?: (id: string) => void;
}

export const WorkOrderDetailsDrawer: React.FC<WorkOrderDetailsDrawerProps> = ({
  open,
  onClose,
  workOrderId,
  onWorkOrderChange,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'parts' | 'activity' | 'location'>('overview');
  const [isConfirmationCallDialogOpen, setIsConfirmationCallDialogOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAssignEmergencyOpen, setIsAssignEmergencyOpen] = useState(false);
  const [isMaintenanceCompletionDrawerOpen, setIsMaintenanceCompletionDrawerOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

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
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) return [];
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

  // Emergency Bike Logic
  const { data: activeEmergencyAssignment, refetch: refetchEmergencyAssignment } = useQuery({
    queryKey: ['active_emergency_assignment', workOrderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emergency_bike_assignments')
        .select('*')
        .eq('work_order_id', workOrderId)
        .is('returned_at', null)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!workOrderId && open,
  });

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
    (profiles || []).map(p => [p.id, `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown'])
  );

  const { session } = useSession();
  const queryClient = useQueryClient();

  // Mutation for updating work order
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_order_drawer', workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['work_orders'] });
      // Also invalidate single work order query in case user navigates to full page
      queryClient.invalidateQueries({ queryKey: ['work_order', workOrderId] });
    },
    onError: (error) => {
      showError(error.message);
    }
  });

  const addPartMutation = useAddPartToWorkOrder();
  const removePartMutation = useRemovePartFromWorkOrder();

  const handleAssignTechnician = (technicianId: string) => {
    if (!workOrder) return;
    updateWorkOrder(workOrder, {
      status: 'In Progress',
      assignedTechnicianId: technicianId,
      work_started_at: new Date().toISOString()
    });
    setIsAssignModalOpen(false);
  };



  const handleConfirmationCall = async (notes: string, outcome: 'confirmed' | 'cancelled' | 'unreachable', appointmentDate?: string) => {
    if (!workOrder) return;

    try {
      const now = new Date().toISOString();
      const updates: Partial<WorkOrder> = {
        id: workOrder.id,
        confirmation_call_completed: outcome === 'confirmed' || outcome === 'cancelled',
        confirmation_call_notes: `${outcome.charAt(0).toUpperCase() + outcome.slice(1)}: ${notes}`,
        confirmation_call_by: session?.user.id || null,
        confirmation_call_at: now
      };

      // Update status based on outcome
      if (outcome === 'confirmed') {
        updates.status = 'Ready';
        updates.confirmed_at = now;
        updates.ready_at = now;
        // If coming directly from New, mark entry into confirmation flow as well
        if (workOrder.status === 'New') {
          updates.confirmation_status_entered_at = now;
        }
        if (appointmentDate) {
          updates.appointmentDate = appointmentDate;
        }
      } else if (outcome === 'unreachable') {
        // Move to 'Confirmation' status if we made contact attempt but failed
        if (workOrder.status === 'New') {
          updates.status = 'Confirmation';
          updates.confirmation_status_entered_at = now;
        }
        updates.confirmation_call_completed = false;
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
        }
      });

    } catch (error: any) {
      showError(error.message || 'Failed to save confirmation call');
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

  const handleCompleteWorkOrder = (data: { faultCode: string; maintenanceNotes: string }) => {
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

    updateWorkOrder(workOrder, updates);
    setIsMaintenanceCompletionDrawerOpen(false);
  };



  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

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
          className="relative bg-background shadow-lg h-full w-[750px] flex flex-col animate-in slide-in-from-right duration-300"
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
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${workOrder.status === 'Completed' ? 'bg-muted text-foreground' :
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
            workOrder && (
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
          {(emergencyEligible || hasActiveEmergencyAssignment) && (
            <div className={`px-3 py-1.5 flex items-center justify-between border-b ${hasActiveEmergencyAssignment ? 'bg-muted border-blue-200' : 'bg-muted border-orange-200'
              }`}>
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${hasActiveEmergencyAssignment ? 'bg-muted' : 'bg-muted'
                  }`}>
                  <Bike className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className={`text-xs font-bold ${hasActiveEmergencyAssignment ? 'text-blue-900' : 'text-orange-900'
                    }`}>
                    {hasActiveEmergencyAssignment
                      ? `Emergency Bike: ${emergencyBike ? ((emergencyBike as any).licensePlate || emergencyBike.license_plate) : 'Loading...'}`
                      : 'Customer Eligible for Emergency Bike'
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
                      Repair time &gt; 6 hours.
                    </p>
                  )}
                </div>
              </div>

              {!hasActiveEmergencyAssignment ? (
                <Button
                  size="sm"
                  onClick={() => setIsAssignEmergencyOpen(true)}
                  className="h-7 text-xs bg-orange-600 hover:bg-orange-700"
                >
                  Assign Bike
                </Button>
              ) : (
                <span className="px-1.5 py-0.5 bg-blue-200 text-blue-800 text-xs font-bold rounded-lg uppercase tracking-wider">
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
          />

          {workOrder && (
            <AssignEmergencyBikeModal
              open={isAssignEmergencyOpen}
              onClose={() => setIsAssignEmergencyOpen(false)}
              onAssign={handleAssignEmergencyBike}
            />
          )}

          {workOrder && (
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
              onAddPart={(itemId, quantity) => addPartMutation.mutate({ itemId, quantity })}
            />
          )}

          {/* Tabs - Full width border */}
          <div className="flex border-b border-border px-3 flex-shrink-0 bg-card">
            {[
              { key: 'overview', label: 'Overview', icon: Info },
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
            customerName={customer?.name || workOrder.customerName}
            customerPhone={customer?.phone || workOrder.customerPhone}
            customerEmail={customer?.email || workOrder.customerEmail}
            customerType={customer?.customerType}
            vehicleMake={vehicle?.make}
            vehicleModel={vehicle?.model}
            vehicleYear={vehicle?.year}
            vehiclePlate={vehicle?.licensePlate || vehicle?.license_plate}
            vehicleVin={vehicle?.vin}
            technicianName={technician?.name}
            locationName={location?.name}
            showPricing={true}
          />
        )
      }
    </>
  );
};

export default WorkOrderDetailsDrawer;


