import { useParams, useNavigate } from "react-router-dom";
import { Stack, Grid, Button, Tabs, Alert, Skeleton, Box } from '@/components/tailwind-components';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Motorbike01Icon,
  Tick01Icon,
  ArrowLeft01Icon,
  NoteIcon,
  UserIcon,
  Calendar01Icon,
  LockIcon,
  Location01Icon,
  CheckmarkCircle01Icon,
  InformationCircleIcon,
  Message01Icon as MessageIcon,
  Clock01Icon,
  PackageIcon,
  TimelineIcon,
  Settings01Icon,
  TagIcon,
  MapsIcon,
  BarChartIcon as Chart01Icon,
  UserMultiple02Icon as UserMultipleIcon,
  Home01Icon,
  ClipboardIcon
} from '@hugeicons/core-free-icons';
import NotFound from "./NotFound";
import './WorkOrderDetailsEnhanced.css';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, Technician, Location, Customer, Vehicle, WorkOrderPart, Profile, SlaPolicy, EmergencyBikeAssignment } from "@/types/supabase";
import { DiagnosticCategoryRow } from '@/types/diagnostic';
import { useState, useMemo, useEffect, Component, ErrorInfo, ReactNode } from "react";
import { showSuccess, showError } from "@/utils/toast";
import { camelToSnakeCase, snakeToCamelCase } from "@/utils/data-helpers";
import { OnHoldReasonDialog } from "@/components/OnHoldReasonDialog";
import dayjs from 'dayjs';
import { useSearchParams } from "react-router-dom";
import WorkOrderStepper from "@/components/WorkOrderStepper/WorkOrderStepper";
import { useSession } from "@/context/SessionContext";
import { useRealtimeData } from "../context/RealtimeDataContext";
import AppBreadcrumb from "@/components/Breadcrumbs";

// Import new modular components
import { WorkOrderCustomerVehicleCard } from "@/components/work-order-details/WorkOrderCustomerVehicleCard.tsx";
import { WorkOrderServiceLifecycleCard } from "@/components/work-order-details/WorkOrderServiceLifecycleCard.tsx";
import { WorkOrderDetailsInfoCard } from "@/components/work-order-details/WorkOrderDetailsInfoCard.tsx";
import { WorkOrderActivityLogCard } from "@/components/work-order-details/WorkOrderActivityLogCard.tsx";
import { WorkOrderLocationMapCard } from "@/components/work-order-details/WorkOrderLocationMapCard.tsx";
import { WorkOrderOverviewCards } from "@/components/work-order-details/WorkOrderOverviewCards";

import { WorkOrderNotesCard } from "@/components/work-order-details/WorkOrderNotesCard.tsx";
import { WorkOrderRelatedHistoryCard } from "@/components/work-order-details/WorkOrderRelatedHistoryCard.tsx";
import { WorkOrderCostSummaryCard } from "@/components/work-order-details/WorkOrderCostSummaryCard.tsx";
import { IssueConfirmationDialog } from "@/components/IssueConfirmationDialog.tsx";
import { MaintenanceCompletionDrawer } from "@/components/MaintenanceCompletionDrawer.tsx";
import { WorkOrderAppointmentCard } from "@/components/work-order-details/WorkOrderAppointmentCard.tsx";
import { AssignTechnicianModal } from "@/components/work-order-details/AssignTechnicianModal";
import AssignEmergencyBikeModal from "@/components/work-order-details/AssignEmergencyBikeModal";
import WorkflowStatus from "@/components/Workflow/WorkflowStatus";
import TimeTracker from "@/components/Workflow/TimeTracker";
import CostTracker from "@/components/Cost/CostTracker";
import { WorkOrderSidebar } from "@/components/work-order-details/WorkOrderSidebar";
import { WorkOrderPartsUsedCard } from "@/components/work-order-details/WorkOrderPartsUsedCard";
import { ConfirmationCallDialog } from "@/components/work-order-details/ConfirmationCallDialog";
import { WorkOrderPartsDialog } from "@/components/WorkOrderPartsDialog";

// Simple inline error boundary for debugging
class DebugErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WorkOrderDetailsEnhanced Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 border border-red-200 rounded-lg m-4">
          <h2 className="text-xl font-bold text-red-800 mb-2">Something went wrong</h2>
          <p className="text-red-700 mb-4">{this.state.error?.message}</p>
          <pre className="text-xs bg-red-100 p-4 rounded overflow-auto max-h-64">
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Import work order helper functions
import {
  generateActivityLogEntry,
  calculateSlaDue,
  calculatePausedDuration,
  isValidStatusTransition,
  generateUpdateActivityMessage
} from '@/utils/work-order-helpers';

interface WorkOrderDetailsProps {
  isDrawerMode?: boolean;
  workOrderId?: string | null;
}

const WorkOrderDetailsEnhanced = ({ isDrawerMode = false, workOrderId }: WorkOrderDetailsProps) => {
  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // State for dialogs and UI
  const [onHoldWorkOrder, setOnHoldWorkOrder] = useState<WorkOrder | null>(null);
  const [isIssueConfirmationDialogOpen, setIsIssueConfirmationDialogOpen] = useState(false);
  const [isMaintenanceCompletionDrawerOpen, setIsMaintenanceCompletionDrawerOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAssignEmergencyOpen, setIsAssignEmergencyOpen] = useState(false);
  const [isConfirmationCallDialogOpen, setIsConfirmationCallDialogOpen] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<Partial<WorkOrder> | null>(null);
  const [showInteractiveMap, setShowInteractiveMap] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState('details');
  // Optimistic local overlay for immediate UI feedback while waiting for realtime
  const [optimisticWorkOrder, setOptimisticWorkOrder] = useState<Partial<WorkOrder> | null>(null);

  const { session } = useSession();
  const { realtimeWorkOrders, realtimeTechnicians } = useRealtimeData();

  // In drawer mode, always use the workOrderId prop and ignore URL params to prevent conflicts
  const id = isDrawerMode ? workOrderId : (paramId || searchParams.get('view'));

  // Try to use realtime data first, fallback to query if not available
  const realtimeWorkOrder = useMemo(() => {
    if (!id || !realtimeWorkOrders) return null;
    return realtimeWorkOrders.find((wo: WorkOrder) => wo.id === id);
  }, [id, realtimeWorkOrders]);

  const { data: queriedWorkOrder, isLoading: isLoadingWorkOrder, error: workOrderError } = useQuery<WorkOrder | null>({
    queryKey: ['work_order', id],
    queryFn: async () => {
      console.log('WorkOrderDetailsEnhanced: Fetching work order with id:', id);
      if (!id) return null;

      try {
        const { data, error } = await supabase
          .from('work_orders')
          .select(`
  *,
  service_categories(*)
  `)
          .eq('id', id)
          .single();

        if (error) throw new Error(error.message);

        if (data) {
          const mappedData: WorkOrder = {
            ...data,
            createdAt: data.created_at,
            workOrderNumber: data.work_order_number,
            assignedTechnicianId: data.assigned_technician_id,
            locationId: data.location_id,
            initialDiagnosis: data.initial_diagnosis || data.client_report || data.service,
            maintenanceNotes: data.maintenance_notes || data.service_notes || null,
            issueType: data.issue_type || null,
            faultCode: data.fault_code || null,
            serviceNotes: data.service_notes || null,
            partsUsed: data.parts_used || null,
            activityLog: data.activity_log || null,
            slaDue: data.sla_due || null,
            completedAt: data.completed_at || null,
            customerLat: data.customer_lat ?? null,
            customerLng: data.customer_lng ?? null,
            customerAddress: data.customer_address || null,
            onHoldReason: data.on_hold_reason || null,
            appointmentDate: data.appointment_date || null,
            customerId: data.customer_id || null,
            vehicleId: data.vehicle_id || null,
            created_by: data.created_by,
            confirmed_at: data.confirmed_at,
            work_started_at: data.work_started_at,
            sla_timers_paused_at: data.sla_timers_paused_at,
            total_paused_duration_seconds: data.total_paused_duration_seconds
          };

          console.log('WorkOrderDetailsEnhanced: Successfully loaded work order:', mappedData.workOrderNumber);
          return mappedData;
        }
        return null;
      } catch (err) {
        console.error('WorkOrderDetailsEnhanced: Error fetching work order:', err);
        setError(err instanceof Error ? err.message : 'Failed to load work order');
        throw err;
      }
    },
    enabled: !!id && !realtimeWorkOrder // Only query if we don't have realtime data
  });

  // Use realtime data if available, otherwise fallback to queried data
  const baseWorkOrder = realtimeWorkOrder || queriedWorkOrder;
  // Merge optimistic overlay for display if present
  const workOrder = useMemo(() => {
    if (!baseWorkOrder) return null;
    return optimisticWorkOrder ? { ...baseWorkOrder, ...optimisticWorkOrder } : baseWorkOrder;
  }, [baseWorkOrder, optimisticWorkOrder]);

  // Try to use realtime technician data first
  const realtimeTechnician = useMemo(() => {
    if (!workOrder?.assignedTechnicianId || !realtimeTechnicians) return null;
    return realtimeTechnicians.find((tech: Technician) => tech.id === workOrder.assignedTechnicianId);
  }, [workOrder?.assignedTechnicianId, realtimeTechnicians]);

  // Additional data queries
  const { data: queriedTechnician, isLoading: isLoadingTechnician } = useQuery<Technician | null>({
    queryKey: ['technician', workOrder?.assignedTechnicianId],
    queryFn: async () => {
      if (!workOrder?.assignedTechnicianId) return null;
      const { data, error } = await supabase.from('technicians').select('*').eq('id', workOrder.assignedTechnicianId).single();
      if (error) throw new Error(error.message);
      return data ? snakeToCamelCase(data) as Technician : null;
    },
    enabled: !!workOrder?.assignedTechnicianId && !realtimeTechnician
  });

  const technician = realtimeTechnician || queriedTechnician;

  const { data: location, isLoading: isLoadingLocation } = useQuery<Location | null>({
    queryKey: ['location', workOrder?.locationId],
    queryFn: async () => {
      if (!workOrder?.locationId) return null;
      const { data, error } = await supabase.from('locations').select('*').eq('id', workOrder.locationId).single();
      if (error) throw new Error(error.message);
      return data ? snakeToCamelCase(data) as Location : null;
    },
    enabled: !!workOrder?.locationId
  });

  const { data: queriedAllTechnicians, isLoading: isLoadingAllTechnicians } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(tech => snakeToCamelCase(tech) as Technician);
    },
    enabled: !realtimeTechnicians || realtimeTechnicians.length === 0
  });

  const allTechnicians = realtimeTechnicians && realtimeTechnicians.length > 0 ? realtimeTechnicians : queriedAllTechnicians;

  const { data: allLocations, isLoading: isLoadingAllLocations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(loc => snakeToCamelCase(loc) as Location);
    }
  });

  const { data: customer, isLoading: isLoadingCustomer } = useQuery<Customer | null>({
    queryKey: ['customer', workOrder?.customerId],
    queryFn: async () => {
      if (!workOrder?.customerId) return null;
      const { data, error } = await supabase.from('customers').select('*').eq('id', workOrder.customerId).single();
      if (error) throw new Error(error.message);
      return data ? snakeToCamelCase(data) as Customer : null;
    },
    enabled: !!workOrder?.customerId
  });

  const { data: vehicle, isLoading: isLoadingVehicle } = useQuery<Vehicle | null>({
    queryKey: ['vehicle', workOrder?.vehicleId],
    queryFn: async () => {
      if (!workOrder?.vehicleId) return null;
      const { data, error } = await supabase.from('vehicles').select('*').eq('id', workOrder.vehicleId).single();
      if (error) throw new Error(error.message);
      return data ? snakeToCamelCase(data) as Vehicle : null;
    },
    enabled: !!workOrder?.vehicleId
  });

  // Emergency bike: fetch active assignment for this work order (if any)
  const { data: activeEmergencyAssignment } = useQuery<EmergencyBikeAssignment | null>({
    queryKey: ['active_emergency_assignment', workOrder?.id],
    enabled: !!workOrder?.id,
    queryFn: async () => {
      if (!workOrder?.id) return null;
      const { data, error } = await supabase
        .from('emergency_bike_assignments')
        .select('*')
        .eq('work_order_id', workOrder.id)
        .is('returned_at', null)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data ? (snakeToCamelCase(data) as EmergencyBikeAssignment) : null;
    }
  });

  // If there is an active assignment, fetch the assigned bike details for display
  const { data: assignedEmergencyBike } = useQuery<Vehicle | null>({
    queryKey: ['vehicle', activeEmergencyAssignment?.emergency_bike_id],
    enabled: !!activeEmergencyAssignment?.emergency_bike_id,
    queryFn: async () => {
      const id = activeEmergencyAssignment?.emergency_bike_id;
      if (!id) return null;
      const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).single();
      if (error) throw new Error(error.message);
      return data ? (snakeToCamelCase(data) as Vehicle) : null;
    }
  });

  const { data: usedParts, isLoading: isLoadingUsedParts } = useQuery<WorkOrderPart[]>({
    queryKey: ['work_order_parts', id],
    queryFn: async () => {
      if (!id) return [];
      try {
        const { data, error } = await supabase
          .from('work_order_parts')
          .select('*, inventory_items(*)')
          .eq('work_order_id', id);
        if (error) throw error;
        return (data || []).map(part => snakeToCamelCase(part) as WorkOrderPart);
      } catch (e: any) {
        // Gracefully handle missing table or permissions
        const msg = e?.message || String(e);
        if (msg?.toLowerCase().includes("could not find the table") || msg?.includes('404')) {
          console.info('work_order_parts table not found or inaccessible. Returning empty list.');
          return [];
        }
        throw new Error(msg);
      }
    },
    enabled: !!id,
    retry: false
  });

  const { data: profiles, isLoading: isLoadingProfiles } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(profile => snakeToCamelCase(profile) as Profile);
    }
  });

  const { data: slaPolicies, isLoading: isLoadingSlaPolicies } = useQuery<SlaPolicy[]>({
    queryKey: ['sla_policies'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('sla_policies').select('*');
        if (error) throw error;
        return (data || []).map(sla => snakeToCamelCase(sla) as SlaPolicy);
      } catch (e: any) {
        const msg = e?.message || String(e);
        if (msg?.toLowerCase().includes("could not find the table") || msg?.includes('404')) {
          console.info('sla_policies table not found or inaccessible. Using empty SLA set.');
          return [];
        }
        throw new Error(msg);
      }
    },
    retry: false
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

  // Effect for interactive map
  useEffect(() => {
    if (isDrawerMode && activeTabKey === '3') {
      setShowInteractiveMap(true);
    } else {
      setShowInteractiveMap(false);
    }
  }, [isDrawerMode, activeTabKey]);

  // Mutations
  const workOrderMutation = useMutation({
    // Accept camelCase variables; convert to snake_case here
    mutationFn: async (workOrderData: Partial<WorkOrder>) => {
      console.log('🔄 Mutation START: Updating work order with data:', workOrderData);
      console.log('🔄 Mutation: workOrder.id from context:', workOrder?.id);
      console.log('🔄 Mutation: workOrderData.id:', workOrderData.id);
      const snakeCaseData = camelToSnakeCase(workOrderData);
      console.log('🔄 Mutation: Snake case data:', snakeCaseData);

      const { data, error } = await supabase
        .from('work_orders')
        .upsert([snakeCaseData])
        .select();

      if (error) {
        console.error('❌ Mutation FAILED with error:', error);
        console.error('❌ Error details:', { message: error.message, code: error.code, details: error.details, hint: error.hint });
        throw new Error(error.message);
      }

      console.log('✅ Mutation SUCCESS, returned data:', data);
      if (data && data.length > 0) {
        console.log('✅ Updated work order status:', data[0].status);
        console.log('✅ Updated work order assigned_technician_id:', data[0].assigned_technician_id);
      }
      return data;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['work_order', id] });
      const previous = queryClient.getQueryData(['work_order', id]);

      // Optimistically update local query cache for the specific work order
      if (previous) {
        queryClient.setQueryData(['work_order', id], {
          ...(previous as any),
          ...variables
        });
      }

      // Also overlay optimistic changes locally so UI updates even when using realtime data
      setOptimisticWorkOrder((current) => ({ ...(current || {}), ...variables }));

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['work_order', id], context.previous);
      }
      // Revert optimistic overlay on error
      setOptimisticWorkOrder(null);
      showError(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['work_order', id] });
      queryClient.invalidateQueries({ queryKey: ['work_orders'] });
      // Delay clearing optimistic overlay to allow realtime subscription to catch up
      // This prevents the UI from briefly reverting to old data
      setTimeout(() => {
        setOptimisticWorkOrder(null);
      }, 1500); // 1.5 second delay to allow realtime to update
    },
    onSuccess: () => {
      showSuccess('Work order has been updated.');
    }
  });

  const addPartMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string, quantity: number }) => {
      const { error } = await supabase.rpc('add_part_to_work_order', {
        p_work_order_id: id,
        p_item_id: itemId,
        p_quantity_used: quantity
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_order_parts', id] });
      queryClient.invalidateQueries({ queryKey: ['work_order', id] });
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
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
      queryClient.invalidateQueries({ queryKey: ['work_order_parts', id] });
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      showSuccess('Part removed from work order.');
    },
    onError: (error) => showError(error.message)
  });

  // Event handlers
  const handleUpdateWorkOrder = (updates: Partial<WorkOrder>) => {
    if (!workOrder) return;

    const oldWorkOrder = { ...workOrder };
    const newStatus = updates.status;
    const oldStatus = oldWorkOrder.status;
    const isServiceCenter = oldWorkOrder.channel === 'Service Center';
    // Intercept: Ready -> In Progress requires an assigned technician
    // Case-insensitive check for 'Ready' to handle potential DB inconsistencies
    if (oldStatus?.toLowerCase() === 'ready' && newStatus === 'In Progress') {
      const effectiveAssigned = updates.assignedTechnicianId ?? oldWorkOrder.assignedTechnicianId;

      // If strictly no technician assigned (null or undefined or empty string)
      if (!effectiveAssigned) {
        setPendingUpdates(updates);
        setIsAssignModalOpen(true);
        return;
      }
    }

    // Allow assignment or reassignment at any time. Still enforce that moving Ready -> In Progress must have a technician.

    // Status transition validation
    if (newStatus && newStatus !== oldStatus) {
      if (!isValidStatusTransition(oldStatus, newStatus, isServiceCenter)) {
        showError(`Invalid status transition from '${oldStatus}' to '${newStatus}'.`);
        // Clear optimistic state to revert UI to actual status
        setOptimisticWorkOrder(null);
        return;
      }

      // Special handling dialogs (only when required info not provided in this update)
      // On Hold: open reason dialog only if reason not provided in updates
      if (newStatus === 'On Hold' && !('onHoldReason' in updates)) {
        // Hold UI at the new status until user cancels or saves
        setOptimisticWorkOrder((o) => ({ ...(o || {}), status: 'On Hold' }));
        setOnHoldWorkOrder(oldWorkOrder);
        return;
      }
      // Ready: open Issue Confirmation only if no issueType provided in updates and none exists
      if (newStatus === 'Ready' && !isServiceCenter && !(oldWorkOrder.issueType || updates.issueType)) {
        setOptimisticWorkOrder((o) => ({ ...(o || {}), status: 'Ready' }));
        setIsIssueConfirmationDialogOpen(true);
        return;
      }
      // Completed: open Maintenance Completion only if faultCode or maintenanceNotes missing (considering updates)
      const hasFaultCode = Boolean(oldWorkOrder.faultCode || updates.faultCode);
      const hasMaintNotes = Boolean(oldWorkOrder.maintenanceNotes || updates.maintenanceNotes);
      if (newStatus === 'Completed' && (!hasFaultCode || !hasMaintNotes)) {
        setOptimisticWorkOrder((o) => ({ ...(o || {}), status: 'Completed' }));
        setIsMaintenanceCompletionDrawerOpen(true);
        return;
      }
    }

    // Prepare activity log and timestamp automation
    const newActivityLog = [...(workOrder.activityLog || [])];
    let activityMessage = generateUpdateActivityMessage(oldWorkOrder, updates, allTechnicians, allLocations);

    // Timestamp & SLA Automation
    if (newStatus && newStatus !== oldStatus) {
      if (newStatus === 'Confirmation' && !oldWorkOrder.confirmed_at) updates.confirmed_at = new Date().toISOString();
      if (newStatus === 'In Progress' && !oldWorkOrder.work_started_at) updates.work_started_at = new Date().toISOString();
      if (newStatus === 'On Hold' && oldStatus !== 'On Hold') updates.sla_timers_paused_at = new Date().toISOString();

      const additionalPausedDuration = calculatePausedDuration(oldWorkOrder, newStatus, oldStatus);
      if (additionalPausedDuration > 0) {
        updates.total_paused_duration_seconds = (oldWorkOrder.total_paused_duration_seconds || 0) + additionalPausedDuration;
        updates.sla_timers_paused_at = null;
        activityMessage += ` (SLA timers resumed after ${additionalPausedDuration}s pause).`;
      }
    }

    if (updates.service_category_id && updates.service_category_id !== oldWorkOrder.service_category_id) {
      updates.slaDue = calculateSlaDue(
        oldWorkOrder.created_at!,
        updates.service_category_id,
        slaPolicies,
        updates.total_paused_duration_seconds || oldWorkOrder.total_paused_duration_seconds
      );
      const category = (oldWorkOrder as any).service_categories?.name || 'N/A';
      activityMessage += ` Service category set to '${category}'. Resolution SLA updated.`;
    }

    if (activityMessage) {
      newActivityLog.push(generateActivityLogEntry(activityMessage, session?.user.id ?? null));
      updates.activityLog = newActivityLog;
    }

    // No auto-advance on appointment. Status changes must be explicit via user action (e.g., Start Work).

    // Execute mutation
    const finalUpdates = { ...updates };
    if (workOrder.id) {
      finalUpdates.id = workOrder.id;
    }
    console.log('📤 Calling mutation with finalUpdates:', finalUpdates);
    console.log('📤 finalUpdates contains: id=%s, status=%s, assignedTechnicianId=%s',
      finalUpdates.id, finalUpdates.status, finalUpdates.assignedTechnicianId);
    // Pass camelCase to mutation; it handles snake_case conversion internally
    workOrderMutation.mutate(finalUpdates);
  };

  const handleSaveOnHoldReason = (reason: string) => {
    if (!onHoldWorkOrder) return;
    const updates = { status: 'On Hold' as const, onHoldReason: reason };
    handleUpdateWorkOrder(updates);
    setOnHoldWorkOrder(null);
  };

  const handleConfirmationCall = async (notes: string, outcome: 'confirmed' | 'cancelled' | 'unreachable', appointmentDate?: string) => {
    if (!workOrder) return;

    try {
      const now = new Date().toISOString();
      const updates: Partial<WorkOrder> = {
        confirmation_call_completed: outcome === 'confirmed' || outcome === 'cancelled',
        confirmation_call_notes: notes,
        confirmation_call_by: session?.user.id || null,
        confirmation_call_at: now
      };

      // Update status based on outcome
      if (outcome === 'confirmed') {
        updates.status = 'Confirmation';
        updates.confirmed_at = now;
        if (appointmentDate) {
          updates.scheduled_date = appointmentDate;
        }
      } else if (outcome === 'cancelled') {
        updates.status = 'Cancelled';
      } else if (outcome === 'unreachable') {
        // Keep status as 'Open' and mark for retry
        updates.confirmation_call_completed = false;
        updates.last_call_attempt_at = now;
      }

      handleUpdateWorkOrder(updates);
      setIsConfirmationCallDialogOpen(false);

      showSuccess(
        outcome === 'confirmed'
          ? 'Appointment scheduled successfully.'
          : outcome === 'cancelled'
            ? 'Work order cancelled.'
            : 'Call attempt logged. Will retry later.'
      );
    } catch (error: any) {
      showError(error.message || 'Failed to save confirmation call');
    }
  };

  const handleSaveIssueConfirmation = (issueType: string, notes: string | null) => {
    if (!workOrder) return;
    const updates: Partial<WorkOrder> = { status: 'Ready', issueType: issueType, serviceNotes: notes };
    handleUpdateWorkOrder(updates);
    setIsIssueConfirmationDialogOpen(false);
  };

  const handleSaveMaintenanceCompletion = (faultCode: string, maintenanceNotes: string | null) => {
    if (!workOrder) return;
    // If there's an active emergency bike assignment for this work order, mark it returned first
    (async () => {
      try {
        const { data: assignment, error: aErr } = await supabase
          .from('emergency_bike_assignments')
          .select('*')
          .eq('work_order_id', workOrder.id)
          .is('returned_at', null)
          .maybeSingle();
        if (aErr) {
          console.warn('Failed to check emergency bike assignment:', aErr.message);
        } else if (assignment) {
          // Mark the assignment returned and free the company bike
          const nowIso = new Date().toISOString();
          const { error: updErr } = await supabase
            .from('emergency_bike_assignments')
            .update({ returned_at: nowIso })
            .eq('id', assignment.id);
          if (updErr) console.warn('Failed to update emergency bike return timestamp:', updErr.message);
          // Optionally update the company asset status to available (keep minimal to avoid side effects)
          if (assignment.emergency_bike_id) {
            await supabase.from('vehicles').update({}).eq('id', assignment.emergency_bike_id);
          }
        }
      } catch (e) {
        console.warn('Error handling emergency bike return on completion:', e);
      } finally {
        const updates: Partial<WorkOrder> = { status: 'Completed', faultCode: faultCode, maintenanceNotes: maintenanceNotes, completedAt: new Date().toISOString() };
        handleUpdateWorkOrder(updates);
        setIsMaintenanceCompletionDrawerOpen(false);
      }
    })();
  };

  const handleLocationSelect = (selectedLoc: { lat: number; lng: number; label: string }) => {
    handleUpdateWorkOrder({ customerAddress: selectedLoc.label, customerLat: selectedLoc.lat, customerLng: selectedLoc.lng });
  };

  const handleAddPart = (itemId: string, quantity: number) => {
    addPartMutation.mutate({ itemId, quantity });
  };

  const handleRemovePart = (partId: string) => {
    removePartMutation.mutate(partId);
  };

  // Helper functions
  const profileMap = useMemo(() => {
    if (!profiles) return new Map();
    return new Map(profiles.map(p => [p.id, `${p.first_name || ''} ${p.last_name || ''}`.trim()]));
  }, [profiles]);

  // Loading and error states
  const isLoading = isLoadingWorkOrder || isLoadingTechnician || isLoadingLocation || isLoadingAllTechnicians || isLoadingAllLocations || isLoadingCustomer || isLoadingVehicle || isLoadingUsedParts || isLoadingProfiles || isLoadingSlaPolicies;

  if (error || workOrderError) {
    console.error('WorkOrderDetailsEnhanced: Error state:', { error, workOrderError });
    return isDrawerMode ? (
      <div style={{ padding: 24 }}>
        <NotFound />
      </div>
    ) : (
      <NotFound />
    );
  }

  if (isLoading) {
    return (
      <div style={{ padding: '24px' }}>
        <Skeleton height={8} radius="xl" />
        <Skeleton height={8} mt={6} radius="xl" />
        <Skeleton height={8} mt={6} width="70%" radius="xl" />
        <Skeleton height={8} mt={6} radius="xl" />
        <Skeleton height={8} mt={6} radius="xl" />
      </div>
    );
  }

  if (!workOrder) {
    return isDrawerMode ? (
      <div style={{ padding: 24 }}>
        <NotFound />
      </div>
    ) : (
      <NotFound />
    );
  }

  console.log('WorkOrderDetailsEnhanced: Rendering work order:', workOrder.workOrderNumber);

  const usedPartsCount = usedParts?.length || 0;

  // Emergency bike eligibility (assumption): elapsed active time >= 6h and not completed and no active assignment
  const computeElapsedActiveSeconds = () => {
    const startIso = workOrder.work_started_at || workOrder.created_at;
    if (!startIso) return 0;
    const paused = workOrder.total_paused_duration_seconds || 0;
    const elapsedMs = Date.now() - new Date(startIso as string).getTime();
    return Math.max(0, Math.floor(elapsedMs / 1000) - paused);
  };
  const elapsedSec = computeElapsedActiveSeconds();
  const sixHoursSec = 6 * 60 * 60;
  const hasActiveEmergencyAssignment = Boolean(activeEmergencyAssignment);
  const emergencyEligible = workOrder.status !== 'Completed' && !hasActiveEmergencyAssignment && elapsedSec >= sixHoursSec;

  const renderEmergencyBanner = () => {
    if (emergencyEligible) {
      const hours = Math.floor(elapsedSec / 3600);
      const minutes = Math.floor((elapsedSec % 3600) / 60);
      return (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-orange-50 border-y border-orange-200">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <HugeiconsIcon icon={Clock01Icon} size={20} className="text-orange-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-orange-900">
                Repair in progress for {hours}h {minutes}m
              </p>
              <p className="text-xs text-orange-700 mt-0.5">
                Customer is eligible for an emergency bike
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAssignEmergencyOpen(true)}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded transition-colors"
          >
            <HugeiconsIcon icon={Motorbike01Icon} size={16} className="text-white" />
            Assign Bike
          </button>
        </div>
      );
    }
    if (hasActiveEmergencyAssignment) {
      const assignedAt = activeEmergencyAssignment?.assigned_at ? new Date(activeEmergencyAssignment.assigned_at).toLocaleString() : 'N/A';
      const bikeLabel = assignedEmergencyBike ? `${assignedEmergencyBike.license_plate} • ${assignedEmergencyBike.make} ${assignedEmergencyBike.model}` : 'Emergency Bike';
      return (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-blue-50 border-y border-blue-200">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <HugeiconsIcon icon={Motorbike01Icon} size={20} className="text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900">
                Emergency bike assigned
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                {bikeLabel} • Assigned {new Date(activeEmergencyAssignment?.assigned_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded">
              <HugeiconsIcon icon={Tick01Icon} size={16} className="text-blue-700" />
              Active
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const backButton = (
    <button
      onClick={() => !isDrawerMode && navigate('/work-orders')}
      className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
      aria-label="Go back to Work Orders"
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
    </button>
  );

  // Main Render
  return (
    <DebugErrorBoundary>
      {!isDrawerMode && (
        <AppBreadcrumb
          backButton={backButton}
          customBreadcrumbs={[
            { label: 'Home', path: '/', icon: Home01Icon },
            { label: 'Work Orders', path: '/work-orders', icon: ClipboardIcon },
            { label: workOrder?.workOrderNumber || workOrder?.id || 'Loading...', path: `/work-orders/${id}`, isClickable: false }
          ]}
        />
      )}

      {/* Layout with Sidebar for Desktop */}
      {!isDrawerMode ? (
        <div className="flex h-[calc(100vh-120px)]">
          {/* Sidebar */}
          <WorkOrderSidebar
            currentWorkOrderId={id || ''}
            onSelectWorkOrder={(workOrderId) => navigate(`/work-orders/${workOrderId}`)}
            className="w-80 flex-shrink-0"
          />

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="w-full">
              {/* Info Strip - Above Stepper */}
              <div className="bg-white border-b border-gray-200 px-6 py-3">
                <div className="flex items-center gap-4 text-sm">
                  {/* License Plate */}
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={NoteIcon} size={16} className="text-purple-600" />
                    <span className="font-semibold text-purple-900">
                      {vehicle?.license_plate || vehicle?.licensePlate || 'N/A'}
                    </span>
                  </div>

                  <div className="h-4 w-px bg-gray-300" />

                  {/* Customer */}
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={UserIcon} size={16} className="text-gray-400" />
                    <span className="text-gray-900 font-medium">
                      {customer?.name || workOrder.customerName || 'N/A'}
                    </span>
                  </div>

                  <div className="h-4 w-px bg-gray-300" />

                  {/* Vehicle Model */}
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Motorbike01Icon} size={16} className="text-gray-400" />
                    <span className="text-gray-700">
                      {vehicle ? `${vehicle.make} ${vehicle.model}` : 'N/A'}
                    </span>
                  </div>

                  <div className="h-4 w-px bg-gray-300" />

                  {/* Asset Age */}
                  {vehicle?.year && (
                    <>
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={Calendar01Icon} size={16} className="text-gray-400" />
                        <span className="text-gray-700">
                          {(() => {
                            const purchaseDate = dayjs(`${vehicle.year}-01-01`);
                            const today = dayjs();
                            const years = today.diff(purchaseDate, 'year');
                            const months = today.diff(purchaseDate, 'month') % 12;
                            const days = today.diff(purchaseDate, 'day');
                            if (years >= 1) return `${years} yr${years > 1 ? 's' : ''}`;
                            else if (months >= 1) return `${months} mo`;
                            else return `${days} d`;
                          })()}
                        </span>
                      </div>
                      <div className="h-4 w-px bg-gray-300" />
                    </>
                  )}

                  {/* Warranty Status */}
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={LockIcon} size={16} className={(() => {
                      if (!vehicle?.warranty_end_date) return 'text-gray-400';
                      const warrantyEnd = dayjs(vehicle.warranty_end_date);
                      const today = dayjs();
                      if (warrantyEnd.isBefore(today)) return 'text-red-600';
                      const daysRemaining = warrantyEnd.diff(today, 'day');
                      if (daysRemaining <= 30) return 'text-amber-600';
                      return 'text-emerald-600';
                    })()} />
                    <span className={`text-xs font-medium px-2 py-1 rounded border ${(() => {
                      if (!vehicle?.warranty_end_date) return 'bg-gray-50 text-gray-600 border-gray-200';
                      const warrantyEnd = dayjs(vehicle.warranty_end_date);
                      const today = dayjs();
                      if (warrantyEnd.isBefore(today)) return 'bg-red-50 text-red-700 border-red-200';
                      const daysRemaining = warrantyEnd.diff(today, 'day');
                      if (daysRemaining <= 30) return 'bg-amber-50 text-amber-700 border-amber-200';
                      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    })()}`}>
                      {(() => {
                        if (!vehicle?.warranty_end_date) return 'No warranty';
                        const warrantyEnd = dayjs(vehicle.warranty_end_date);
                        const today = dayjs();
                        if (warrantyEnd.isBefore(today)) return 'Expired';
                        const daysRemaining = warrantyEnd.diff(today, 'day');
                        if (daysRemaining <= 30) return `${daysRemaining}d left`;
                        const monthsRemaining = warrantyEnd.diff(today, 'month');
                        return `${monthsRemaining}mo left`;
                      })()}
                    </span>
                  </div>

                  {/* Double divider for section break */}
                  <div className="h-4 w-px bg-gray-400" />
                  <div className="h-4 w-px bg-gray-400 -ml-3" />

                  {/* Location */}
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Location01Icon} size={16} className="text-gray-400" />
                    <span className="text-gray-700">
                      {location?.name || workOrder.serviceCenter || 'N/A'}
                    </span>
                  </div>

                  <div className="h-4 w-px bg-gray-300" />

                  {/* Assigned Technician */}
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className={technician ? 'text-emerald-600' : 'text-amber-600'} />
                    <span className={`font-medium ${technician ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {technician?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              <WorkOrderStepper
                workOrder={workOrder}
                profileMap={profileMap}
                onConfirmationClick={() => setIsConfirmationCallDialogOpen(true)}
              />
              <div>
                {/* Emergency Bike Banner */}
                {renderEmergencyBanner()}

                {/* Tabs - No card wrapper */}
                <div className="bg-white">
                  <Tabs value={activeTabKey} onValueChange={setActiveTabKey}>
                    <Tabs.List className="border-b border-gray-200 px-3">
                      <Tabs.Tab value="details" leftSection={<HugeiconsIcon icon={InformationCircleIcon} size={14} />}>
                        <span className="text-xs">Details</span>
                      </Tabs.Tab>
                      <Tabs.Tab value="notes" leftSection={<HugeiconsIcon icon={MessageIcon} size={14} />}>
                        <span className="text-xs">Notes</span>
                      </Tabs.Tab>
                      <Tabs.Tab value="history" leftSection={<HugeiconsIcon icon={TimelineIcon} size={14} />}>
                        <span className="text-xs">History</span>
                      </Tabs.Tab>
                      <Tabs.Tab value="parts" leftSection={<HugeiconsIcon icon={PackageIcon} size={14} />}>
                        <span className="text-xs">Parts</span>
                      </Tabs.Tab>
                      <Tabs.Tab value="location" leftSection={<HugeiconsIcon icon={MapsIcon} size={14} />}>
                        <span className="text-xs">Location</span>
                      </Tabs.Tab>
                      <Tabs.Tab value="timeline" leftSection={<HugeiconsIcon icon={Clock01Icon} size={14} />}>
                        <span className="text-xs">Timeline</span>
                      </Tabs.Tab>
                    </Tabs.List>

                    <div className="p-3">
                      <Tabs.Panel value="details">
                        <div className="space-y-3">
                          <WorkOrderDetailsInfoCard
                            workOrder={workOrder}
                            customer={customer || null}
                            vehicle={vehicle || null}
                            technician={technician || null}
                            allTechnicians={allTechnicians || []}
                            allLocations={allLocations || []}
                            serviceCategories={serviceCategories || []}
                            handleUpdateWorkOrder={handleUpdateWorkOrder}
                          />
                          {workOrder.appointmentDate && (
                            <WorkOrderAppointmentCard
                              workOrder={workOrder}
                              technician={technician || null}
                              location={location || null}
                            />
                          )}
                        </div>
                      </Tabs.Panel>

                      <Tabs.Panel value="notes">
                        <WorkOrderNotesCard
                          workOrder={workOrder}
                          profileMap={profileMap}
                        />
                      </Tabs.Panel>

                      <Tabs.Panel value="history">
                        <WorkOrderRelatedHistoryCard
                          workOrder={workOrder}
                          vehicle={vehicle || null}
                          onViewWorkOrder={(id) => navigate(`/work-orders/${id}`)}
                        />
                      </Tabs.Panel>

                      <Tabs.Panel value="parts">
                        <WorkOrderCostSummaryCard
                          workOrder={workOrder}
                          usedParts={usedParts || []}
                          isAddPartDialogOpen={isAddPartDialogOpen}
                          setIsAddPartDialogOpen={setIsAddPartDialogOpen}
                          handleAddPart={handleAddPart}
                          handleRemovePart={handleRemovePart}
                        />
                      </Tabs.Panel>

                      <Tabs.Panel value="location">
                        <div className="space-y-3">
                          <WorkOrderLocationMapCard
                            workOrder={workOrder}
                            location={location || null}
                            allLocations={allLocations || []}
                            handleUpdateWorkOrder={handleUpdateWorkOrder}
                            handleLocationSelect={handleLocationSelect}
                            showInteractiveMap={showInteractiveMap}
                            setShowInteractiveMap={setShowInteractiveMap}
                          />
                          <WorkOrderCustomerVehicleCard
                            workOrder={workOrder}
                            customer={customer || null}
                            vehicle={vehicle || null}
                          />
                        </div>
                      </Tabs.Panel>

                      <Tabs.Panel value="timeline">
                        <WorkOrderActivityLogCard
                          workOrder={workOrder}
                          profileMap={profileMap}
                        />
                      </Tabs.Panel>
                    </div>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Drawer Mode (unchanged)
        <Stack gap="sm">
          <Box
            className="progress-tracker-sticky"
            style={(theme) => ({
              backgroundColor: 'rgba(248, 250, 252, 0.85)',
              backdropFilter: 'blur(12px) saturate(180%)',
              borderBottom: `1px solid ${theme.colors.gray[2]}`,
              padding: theme.spacing.xs,
              position: 'sticky',
              top: 0,
              zIndex: 100,
            })}
          >
            <WorkOrderStepper
              workOrder={workOrder}
              compact
              profileMap={profileMap}
              onConfirmationClick={() => setIsConfirmationCallDialogOpen(true)}
            />
          </Box>
          <Box
            className="sticky-header-secondary"
            style={(theme) => ({
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(12px) saturate(180%)',
              borderBottom: `1px solid ${theme.colors.gray[2]}`,
              position: 'sticky',
              top: 'var(--progress-tracker-height, 80px)',
              zIndex: 99,
            })}
          >
            <Tabs
              defaultValue="1"
              keepMounted={false}
              onChange={setActiveTabKey}
              variant="default"
              styles={(theme) => ({
                root: {
                  padding: `0 ${theme.spacing.xs}`,
                },
                list: {
                  backgroundColor: 'transparent',
                  borderBottom: `1px solid ${theme.colors.gray[3]}`,
                  padding: 0,
                  flexWrap: 'wrap',
                },
                tab: {
                  borderRadius: 0,
                  fontWeight: 500,
                  fontSize: '12px',
                  padding: `8px 12px`,
                  transition: 'all 0.2s ease',
                  minHeight: '36px',
                  color: theme.colors.gray[6],
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '2px solid transparent',
                  marginBottom: '-1px',

                  '&:hover': {
                    backgroundColor: theme.colors.gray[0],
                    color: theme.colors.gray[8],
                  },

                  '&[data-active]': {
                    backgroundColor: 'transparent',
                    color: theme.colors.blue[6],
                    borderBottom: `2px solid ${theme.colors.blue[6]}`,

                    '&:hover': {
                      backgroundColor: theme.colors.blue[0],
                      color: theme.colors.blue[7],
                    },

                    '& .mantine-Tabs-tabIcon': {
                      color: theme.colors.blue[6],
                    },

                    '& .mantine-Tabs-tabLabel': {
                      color: theme.colors.blue[6],
                    },
                  },
                },
              })}
            >
              <Tabs.List>
                <Tabs.Tab value="1" leftSection={<HugeiconsIcon icon={InformationCircleIcon} size={14} />}>
                  Overview
                </Tabs.Tab>
                <Tabs.Tab value="2" leftSection={<HugeiconsIcon icon={PackageIcon} size={14} />}>
                  Parts & Activity
                </Tabs.Tab>
                <Tabs.Tab value="3" leftSection={<HugeiconsIcon icon={MapsIcon} size={14} />}>
                  Location
                </Tabs.Tab>
                <Tabs.Tab value="4" leftSection={<HugeiconsIcon icon={Clock01Icon} size={14} />}>
                  Time Tracking
                </Tabs.Tab>
                <Tabs.Tab value="5" leftSection={<HugeiconsIcon icon={ArrowLeft01Icon} size={14} />}>
                  Workflow
                </Tabs.Tab>
                <Tabs.Tab value="6" leftSection={<HugeiconsIcon icon={TagIcon} size={14} />}>
                  Cost Management
                </Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="1" pt="xs">
                <Box px="xs" pb="xs">
                  <Stack gap="xs">
                    <WorkOrderServiceLifecycleCard
                      workOrder={workOrder}
                      handleUpdateWorkOrder={handleUpdateWorkOrder}
                      usedPartsCount={usedPartsCount}
                      emergencyBike={assignedEmergencyBike || null}
                      emergencyAssignment={activeEmergencyAssignment || null}
                    />
                    <WorkflowStatus workOrderId={workOrder.id} compact />
                    <WorkOrderDetailsInfoCard
                      workOrder={workOrder}
                      customer={customer || null}
                      vehicle={vehicle || null}
                      technician={technician || null}
                      allTechnicians={allTechnicians || []}
                      allLocations={allLocations || []}
                      serviceCategories={serviceCategories || []}
                      handleUpdateWorkOrder={handleUpdateWorkOrder}
                    />
                    {workOrder.appointmentDate && (
                      <WorkOrderAppointmentCard
                        workOrder={workOrder}
                        technician={technician || null}
                        location={location || null}
                      />
                    )}
                    <WorkOrderCustomerVehicleCard workOrder={workOrder} customer={customer || null} vehicle={vehicle || null} />
                  </Stack>
                </Box>
              </Tabs.Panel>
              <Tabs.Panel value="2" pt="xs">
                <Box px="xs" pb="xs">
                  <Stack gap="xs">
                    <WorkOrderPartsUsedCard
                      usedParts={usedParts || []}
                      isAddPartDialogOpen={isAddPartDialogOpen}
                      setIsAddPartDialogOpen={setIsAddPartDialogOpen}
                      handleAddPart={handleAddPart}
                      handleRemovePart={handleRemovePart}
                    />
                    <WorkOrderActivityLogCard workOrder={workOrder} profileMap={profileMap} />
                  </Stack>
                </Box>
              </Tabs.Panel>
              <Tabs.Panel value="3" pt="xs">
                <Box px="xs" pb="xs">
                  <Stack gap="xs">
                    <WorkOrderLocationMapCard
                      workOrder={workOrder}
                      location={location || null}
                      allLocations={allLocations || []}
                      handleUpdateWorkOrder={handleUpdateWorkOrder}
                      handleLocationSelect={handleLocationSelect}
                      showInteractiveMap={showInteractiveMap}
                      setShowInteractiveMap={setShowInteractiveMap}
                    />
                  </Stack>
                </Box>
              </Tabs.Panel>
              <Tabs.Panel value="4" pt="xs">
                <Box px="xs" pb="xs">
                  <Stack gap="xs">
                    <TimeTracker workOrderId={workOrder.id} />
                  </Stack>
                </Box>
              </Tabs.Panel>
              <Tabs.Panel value="5" pt="xs">
                <Box px="xs" pb="xs">
                  <Stack gap="xs">
                    <WorkflowStatus workOrderId={workOrder.id} />
                  </Stack>
                </Box>
              </Tabs.Panel>
              <Tabs.Panel value="6" pt="xs">
                <Box px="xs" pb="xs">
                  <Stack gap="xs">
                    <CostTracker workOrderId={workOrder.id} />
                  </Stack>
                </Box>
              </Tabs.Panel>
            </Tabs>
          </Box>
        </Stack>
      )}

      {/* Dialogs and Drawers */}
      {onHoldWorkOrder && (
        <OnHoldReasonDialog
          isOpen={!!onHoldWorkOrder}
          onClose={() => { setOnHoldWorkOrder(null); setOptimisticWorkOrder(null); }}
          onSave={handleSaveOnHoldReason}
          isSaving={workOrderMutation.isPending}
        />
      )}
      <ConfirmationCallDialog
        isOpen={isConfirmationCallDialogOpen}
        onClose={() => setIsConfirmationCallDialogOpen(false)}
        onConfirm={handleConfirmationCall}
        workOrderNumber={workOrder?.workOrderNumber || workOrder?.id || ''}
        customerName={customer?.name || workOrder?.customerName}
        isSubmitting={workOrderMutation.isPending}
      />
      {isIssueConfirmationDialogOpen && (
        <IssueConfirmationDialog
          isOpen={isIssueConfirmationDialogOpen}
          onClose={() => { setIsIssueConfirmationDialogOpen(false); setOptimisticWorkOrder(null); }}
          onSave={handleSaveIssueConfirmation}
          initialIssueType={workOrder.issueType}
          initialNotes={workOrder.serviceNotes}
          isSaving={workOrderMutation.isPending}
        />
      )}
      {isMaintenanceCompletionDrawerOpen && (
        <MaintenanceCompletionDrawer
          isOpen={isMaintenanceCompletionDrawerOpen}
          onClose={() => { setIsMaintenanceCompletionDrawerOpen(false); setOptimisticWorkOrder(null); }}
          onSave={handleSaveMaintenanceCompletion}
          usedParts={usedParts || []}
          onAddPart={handleAddPart}
          onRemovePart={handleRemovePart}
          initialFaultCode={workOrder.faultCode}
          initialMaintenanceNotes={workOrder.maintenanceNotes}
          isSaving={workOrderMutation.isPending}
        />
      )}

      {/* Enforced assignment modal for Ready -> In Progress */}
      <AssignTechnicianModal
        open={isAssignModalOpen}
        technicians={allTechnicians || []}
        onClose={() => { setIsAssignModalOpen(false); setPendingUpdates(null); setOptimisticWorkOrder(null); }}
        onAssign={(technicianId) => {
          const merged: Partial<WorkOrder> = { ...(pendingUpdates || {}), status: 'In Progress', assignedTechnicianId: technicianId };
          console.log('🔧 AssignTechnicianModal onAssign - pendingUpdates:', pendingUpdates);
          console.log('🔧 AssignTechnicianModal onAssign - merged updates:', merged);
          console.log('🔧 AssignTechnicianModal onAssign - current workOrder status:', workOrder?.status);
          setIsAssignModalOpen(false);
          setPendingUpdates(null);
          // Set optimistic state to ensure UI reflects the change immediately
          setOptimisticWorkOrder(merged);
          handleUpdateWorkOrder(merged);
        }}
        isAssigning={workOrderMutation.isPending}
      />

      {/* Emergency bike assignment modal */}
      <AssignEmergencyBikeModal
        open={isAssignEmergencyOpen}
        onClose={() => setIsAssignEmergencyOpen(false)}
        onAssign={async (bikeId, notes) => {
          if (!workOrder?.id) return;
          try {
            const payload = camelToSnakeCase({
              work_order_id: workOrder.id,
              emergency_bike_id: bikeId,
              customer_asset_id: workOrder.vehicleId || null,
              assigned_at: new Date().toISOString(),
              notes: notes || null
            });
            const { error } = await supabase.from('emergency_bike_assignments').insert([payload]);
            if (error) throw new Error(error.message);
            // Append to activity log with notes
            const activityMessage = `Emergency bike assigned (asset ${bikeId})${notes ? ` — Notes: ${notes}` : ''}`;
            const newLog = [...(workOrder.activityLog || []), generateActivityLogEntry(activityMessage, session?.user.id ?? null)];
            await supabase.from('work_orders').update({ activity_log: camelToSnakeCase(newLog) }).eq('id', workOrder.id);
            setIsAssignEmergencyOpen(false);
            showSuccess('Emergency bike assigned.');
            queryClient.invalidateQueries({ queryKey: ['active_emergency_assignment', workOrder.id] });
            queryClient.invalidateQueries({ queryKey: ['active_emergency_bike_assignments'] });
            queryClient.invalidateQueries({ queryKey: ['company_emergency_bikes'] });
            queryClient.invalidateQueries({ queryKey: ['work_order', workOrder.id] });
          } catch (e: any) {
            showError(e.message || 'Failed to assign emergency bike');
          }
        }}
      />

      {/* Work Order Parts Dialog */}
      {workOrder?.id && (
        <WorkOrderPartsDialog
          isOpen={isAddPartDialogOpen}
          onClose={() => setIsAddPartDialogOpen(false)}
          workOrderId={workOrder.id}
          workOrderNumber={workOrder.workOrderNumber}
        />
      )}
    </DebugErrorBoundary>
  );
};

// Cost Tracking Tab Component
/*
// Cost Tracking Tab Component
interface CostTrackingTabProps {
            workOrderId: string;
}

          const CostTrackingTab: React.FC<CostTrackingTabProps> = ({workOrderId}) => {
  const {
              costSummary,
              materialUsage,
              laborCosts,
              otherCosts,
              costEstimate,
              costCategories,
              loading,
              addMaterialUsage,
              addLaborCost,
              addOtherCost,
              generateCostEstimate
            } = useCostTracking(workOrderId);

            const [activeSubTab, setActiveSubTab] = useState('summary');

            const subTabItems = [
            {
              key: 'summary',
            label: (
            <span>
              <HugeiconsIcon icon={Chart01Icon} size={16} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />
              Summary
            </span>
            ),
            children: (
            <Stack gap="md">
              {costSummary && <CostSummaryCard costSummary={costSummary} loading={loading} />}
              <CostEstimator
                workOrderId={workOrderId}
                currentEstimate={costEstimate}
                onEstimateGenerated={(estimate) => {
                  // Handle estimate generation
                  console.log('New estimate generated:', estimate);
                }}
              />
            </Stack>
            )
    },
            {
              key: 'materials',
            label: (
            <span>
              <HugeiconsIcon icon={PackageIcon} size={16} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />
              Materials
            </span>
            ),
            children: (
            <MaterialUsageTracker
              workOrderId={workOrderId}
              materialUsage={materialUsage}
              onAddUsage={addMaterialUsage}
              loading={loading}
            />
            )
    },
            {
              key: 'labor',
            label: (
            <span>
              <HugeiconsIcon icon={UserMultipleIcon} size={16} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />
              Labor
            </span>
            ),
            children: (
            <LaborCostTracker
              workOrderId={workOrderId}
              laborCosts={laborCosts}
              costCategories={costCategories}
              onAddLaborCost={addLaborCost}
              loading={loading}
            />
            )
    },
            {
              key: 'other',
            label: (
            <span>
              <HugeiconsIcon icon={Settings01Icon} size={16} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />
              Other Costs
            </span>
            ),
            children: (
            <OtherCostTracker
              workOrderId={workOrderId}
              otherCosts={otherCosts}
              costCategories={costCategories}
              onAddOtherCost={addOtherCost}
              loading={loading}
            />
            )
    }
            ];

            return (
            <div style={{ width: '100%' }}>
              <Tabs
                activeKey={activeSubTab}
                onChange={setActiveSubTab}
                items={subTabItems}
                size="small"
              />
            </div>
            );
};
            */

export default WorkOrderDetailsEnhanced;