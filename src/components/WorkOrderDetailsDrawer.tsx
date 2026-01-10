import React, { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FullScreenIcon,
  Cancel01Icon,
  InformationCircleIcon,
  TagIcon,
  Clock01Icon,
  MapsIcon,
  Motorbike01Icon,
} from '@hugeicons/core-free-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, Technician, Location, Customer, Vehicle, WorkOrderPart, Profile } from '@/types/supabase';
import { DiagnosticCategoryRow } from '@/types/diagnostic';
import { snakeToCamelCase, camelToSnakeCase } from '@/utils/data-helpers';
import { Skeleton } from '@/components/tailwind-components';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from "@/utils/toast";
import { useSession } from "@/context/SessionContext";
import WorkOrderStepper from '@/components/WorkOrderStepper/WorkOrderStepper';
import { WorkOrderDetailsInfoCard } from '@/components/work-order-details/WorkOrderDetailsInfoCard';

import { WorkOrderCostSummaryCard } from '@/components/work-order-details/WorkOrderCostSummaryCard';
import { WorkOrderActivityLogCard } from '@/components/work-order-details/WorkOrderActivityLogCard';
import { WorkOrderLocationMapCard } from '@/components/work-order-details/WorkOrderLocationMapCard';
import { WorkOrderRelatedHistoryCard } from '@/components/work-order-details/WorkOrderRelatedHistoryCard';
import { ConfirmationCallDialog } from './work-order-details/ConfirmationCallDialog';
import { AssignTechnicianModal } from '@/components/work-order-details/AssignTechnicianModal';
import AssignEmergencyBikeModal from '@/components/work-order-details/AssignEmergencyBikeModal';
import { useWorkOrderMutations } from '@/hooks/useWorkOrderMutations';
import { UgandaLicensePlate } from '@/components/ui/UgandaLicensePlate';
import { MaintenanceCompletionDrawer } from '@/components/MaintenanceCompletionDrawer';
import { WorkOrderPartsDialog } from '@/components/WorkOrderPartsDialog';

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
        confirmation_call_notes: notes,
        confirmation_call_by: session?.user.id || null,
        confirmation_call_at: now
      };

      // Update status based on outcome
      if (outcome === 'confirmed') {
        updates.status = 'Ready';
        updates.confirmed_at = now;
        updates.ready_at = now;
        // If coming directly from Open, mark entry into confirmation flow as well
        if (workOrder.status === 'Open') {
          updates.confirmation_status_entered_at = now;
        }
        if (appointmentDate) {
          updates.appointmentDate = appointmentDate;
        }
      } else if (outcome === 'unreachable') {
        // Move to 'Confirmation' status if we made contact attempt but failed
        if (workOrder.status === 'Open') {
          updates.status = 'Confirmation';
          updates.confirmation_status_entered_at = now;
        }
        updates.confirmation_call_completed = false;
        updates.last_call_attempt_at = now;
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

      await refetchEmergencyAssignment();
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

  const addPartMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string, quantity: number }) => {
      const { error } = await supabase.rpc('add_part_to_work_order', {
        p_work_order_id: workOrderId,
        p_item_id: itemId,
        p_quantity_used: quantity
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_order_parts', workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['work_order_drawer', workOrderId] });
      setIsAddPartDialogOpen(false);
      showSuccess('Part added to work order successfully!');
    },
    onError: (error) => showError(error.message)
  });

  const removePartMutation = useMutation({
    mutationFn: async (partId: string) => {
      const { error } = await supabase.from('work_order_parts').delete().eq('id', partId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_order_parts', workOrderId] });
      showSuccess('Part removed from work order.');
    },
    onError: (error) => showError(error.message)
  });

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
      // and prevent stale "Open" status while fetching freshness
      navigate(`/work-orders/${workOrderId}`, {
        state: { initialWorkOrder: workOrder }
      });
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-md backdrop-saturate-150" />

        {/* Drawer - Increased width to 800px */}
        <div
          className="relative w-full max-w-4xl bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </button>
              <div className="h-6 w-px bg-gray-200" />
              {isLoadingWorkOrder ? (
                <Skeleton height="20px" width="100px" radius="sm" />
              ) : (
                <div className="flex items-center gap-2">
                  {/* Work Order Number + Status Chip */}
                  <h2 className="text-sm font-bold text-gray-900 leading-none">
                    {workOrder?.workOrderNumber || 'Work Order'}
                  </h2>

                  {/* Status Chip - Same level as WO number */}
                  {workOrder && (
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${workOrder.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                      workOrder.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                        workOrder.status === 'Ready' ? 'bg-blue-100 text-blue-700' :
                          workOrder.status === 'Confirmation' ? 'bg-purple-100 text-purple-700' :
                            workOrder.status === 'On Hold' ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-700'
                      }`}>
                      <span className={`w-1 h-1 rounded-full animate-pulse ${workOrder.status === 'Completed' ? 'bg-emerald-500' :
                        workOrder.status === 'In Progress' ? 'bg-amber-500' :
                          workOrder.status === 'Ready' ? 'bg-blue-500' :
                            workOrder.status === 'Confirmation' ? 'bg-purple-500' :
                              workOrder.status === 'On Hold' ? 'bg-orange-500' :
                                'bg-gray-500'
                        }`} />
                      {workOrder.status}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleViewFullPage}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <HugeiconsIcon icon={FullScreenIcon} size={16} />
              </button>
            </div>
          </div>



          {/* Info Strip - Industrial Style */}
          {workOrder && (
            <div className="flex-shrink-0 industrial-info-strip">
              <div className="flex items-stretch w-full">
                {/* License Plate - Primary identifier with accent */}
                <div className="flex-1 min-w-0 px-4 py-2.5 border-l-[3px] border-purple-600 bg-white hover:bg-slate-50/50 transition-colors">
                  <span className="industrial-info-label block">Plate</span>
                  <span className="font-industrial-id text-sm text-purple-700">
                    {(vehicle as any)?.licensePlate || vehicle?.license_plate || '—'}
                  </span>
                </div>

                {/* Model */}
                <div className="flex-1 min-w-0 px-4 py-2.5 border-r border-slate-200 hover:bg-slate-50/50 transition-colors">
                  <span className="industrial-info-label block">Model</span>
                  <span className="text-sm font-semibold text-slate-700">
                    {vehicle ? `${vehicle.make} ${vehicle.model}` : '—'}
                  </span>
                </div>

                {/* Age */}
                <div className="flex-1 min-w-0 px-4 py-2.5 border-r border-slate-200 hover:bg-slate-50/50 transition-colors">
                  <span className="industrial-info-label block">Age</span>
                  <span className="font-industrial-data text-sm text-slate-700">
                    {vehicle?.year ? (() => {
                      const purchaseDate = dayjs(`${vehicle.year}-01-01`);
                      const today = dayjs();
                      const years = today.diff(purchaseDate, 'year');
                      const months = today.diff(purchaseDate, 'month') % 12;
                      if (years >= 1) return `${years} yr${years > 1 ? 's' : ''}`;
                      else if (months >= 1) return `${months} mo`;
                      else return `${today.diff(purchaseDate, 'day')} d`;
                    })() : '—'}
                  </span>
                </div>

                {/* Warranty */}
                <div className="flex-1 min-w-0 px-4 py-2.5 border-r border-slate-200 hover:bg-slate-50/50 transition-colors">
                  <span className="industrial-info-label block">Warranty</span>
                  <span className="font-industrial-data text-sm text-slate-700">
                    {vehicle?.warranty_end_date ? (() => {
                      const warrantyEnd = dayjs(vehicle.warranty_end_date);
                      const today = dayjs();
                      if (warrantyEnd.isBefore(today)) return <span className="text-red-600 font-semibold">Expired</span>;
                      const daysRemaining = warrantyEnd.diff(today, 'day');
                      if (daysRemaining <= 30) return <span className="text-amber-600 font-semibold">{daysRemaining}d left</span>;
                      const monthsRemaining = warrantyEnd.diff(today, 'month');
                      return `${monthsRemaining}mo left`;
                    })() : '—'}
                  </span>
                </div>

                {/* Mileage */}
                <div className="flex-1 min-w-0 px-4 py-2.5 border-r border-slate-200 hover:bg-slate-50/50 transition-colors">
                  <span className="industrial-info-label block">Mileage</span>
                  <span className="font-industrial-data text-sm text-slate-700">
                    {(vehicle?.mileage || (workOrder as any)?.mileage)
                      ? `${(vehicle?.mileage || (workOrder as any)?.mileage).toLocaleString()} km`
                      : '—'}
                  </span>
                </div>

                {/* Divider - Industrial style */}
                <div className="flex items-center justify-center px-1">
                  <div className="industrial-divider h-8" style={{ width: '2px', background: 'linear-gradient(to bottom, transparent, #cbd5e1, transparent)' }} />
                </div>

                {/* Customer - emphasized */}
                <div className="flex-[1.5] min-w-0 px-4 py-2.5 bg-white border-r border-slate-200 hover:bg-slate-50/50 transition-colors">
                  <span className="industrial-info-label block">Customer</span>
                  <span className="text-sm font-bold text-slate-900 truncate block">
                    {customer?.name || workOrder.customerName || '—'}
                  </span>
                </div>

                {/* Phone */}
                <div className="flex-1 min-w-0 px-4 py-2.5 bg-white hover:bg-slate-50/50 transition-colors">
                  <span className="industrial-info-label block">Phone</span>
                  <span className="font-industrial-data text-sm text-slate-700">
                    {customer?.phone || workOrder.customerPhone || '—'}
                  </span>
                </div>
              </div>
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
            <div className={`px-3 py-1.5 flex items-center justify-between border-b border-blue-200 ${hasActiveEmergencyAssignment ? 'bg-blue-50' : 'bg-orange-50 border-orange-200'
              }`}>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${hasActiveEmergencyAssignment ? 'bg-blue-100' : 'bg-orange-100'
                  }`}>
                  <HugeiconsIcon icon={Motorbike01Icon} size={14} className={
                    hasActiveEmergencyAssignment ? 'text-blue-600' : 'text-orange-600'
                  } />
                </div>
                <div>
                  <p className={`text-xs font-bold ${hasActiveEmergencyAssignment ? 'text-blue-900' : 'text-orange-900'
                    }`}>
                    {hasActiveEmergencyAssignment
                      ? 'Emergency Bike Assigned'
                      : 'Customer Eligible for Emergency Bike'
                    }
                  </p>
                  {hasActiveEmergencyAssignment && (
                    <>
                      {isLoadingEmergencyBike ? (
                        <div className="mt-0.5">
                          <Skeleton width="150px" height="12px" radius="sm" />
                        </div>
                      ) : emergencyBike ? (
                        <>
                          <p className="text-[10px] text-blue-700">
                            {(emergencyBike as any).licensePlate || emergencyBike.license_plate} • {emergencyBike.make} {emergencyBike.model}
                          </p>
                          {activeEmergencyAssignment?.assigned_at && (
                            <p className="text-[10px] text-blue-600">
                              Assigned {(() => {
                                const assignedDate = new Date(activeEmergencyAssignment.assigned_at);
                                const now = new Date();
                                const diffMs = now.getTime() - assignedDate.getTime();
                                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                                const diffDays = Math.floor(diffHours / 24);

                                if (diffDays > 0) {
                                  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                                } else if (diffHours > 0) {
                                  return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                                } else {
                                  const diffMins = Math.floor(diffMs / (1000 * 60));
                                  return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
                                }
                              })()}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-[10px] text-blue-700 italic">Bike details unavailable</p>
                      )}
                    </>
                  )}
                  {emergencyEligible && (
                    <p className="text-[10px] text-orange-700">
                      Repair time &gt; 6 hours.
                    </p>
                  )}
                </div>
              </div>

              {!hasActiveEmergencyAssignment ? (
                <button
                  onClick={() => setIsAssignEmergencyOpen(true)}
                  className="px-2 py-1 text-[10px] font-medium text-white bg-orange-600 hover:bg-orange-700 rounded shadow-sm transition-colors"
                >
                  Assign Bike
                </button>
              ) : (
                <span className="px-1.5 py-0.5 bg-blue-200 text-blue-800 text-[10px] font-bold rounded uppercase tracking-wider">
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
              onAddPart={(itemId, quantity) => addPartMutation.mutate({ itemId, quantity })}
              onRemovePart={(partId) => removePartMutation.mutate(partId)}
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
          <div className="flex border-b border-gray-200 px-3 flex-shrink-0 bg-white">
            {[
              { key: 'overview', label: 'Overview', icon: InformationCircleIcon },
              { key: 'location', label: 'Location', icon: MapsIcon },
              { key: 'parts', label: 'Parts & Cost', icon: TagIcon },
              { key: 'activity', label: 'Activity', icon: Clock01Icon },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <HugeiconsIcon icon={tab.icon} size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content - Scrollable with thin scrollbar */}
          <div className="flex-1 overflow-y-auto bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {isLoadingWorkOrder ? (
              <div className="p-3 space-y-3">
                <Skeleton height="80px" radius="md" />
                <Skeleton height="60px" radius="md" />
                <Skeleton height="100px" radius="md" />
              </div>
            ) : workOrder ? (
              <div className="p-3">
                {activeTab === 'overview' && (
                  <div className="space-y-3">
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
              <div className="p-3 text-center text-gray-500 text-xs">
                Work order not found
              </div>
            )}
          </div>

          {/* Footer - Simplified, no duplicate button */}
          <div className="px-3 py-2 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="text-[10px] text-gray-500">
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
            workOrderNumber={workOrder.workOrderNumber || workOrder.id || ''}
            customerName={customer?.name || workOrder.customerName || ''}
            customerPhone={customer?.phone || workOrder.customerPhone || ''}
          />
        )
      }
    </>
  );
};

export default WorkOrderDetailsDrawer;