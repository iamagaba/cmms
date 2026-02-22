import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, ServiceCategory, SlaPolicy, Technician, Location } from "@/types/supabase";
import { camelToSnakeCase } from "@/utils/data-helpers";
import { showSuccess, showError, showInfo } from "@/utils/toast";
import { useSession } from "@/context/SessionContext";
import { useRealtimeData } from "@/context/RealtimeDataContext";
import dayjs from "dayjs";

interface UseWorkOrderMutationsProps {
  serviceCategories: ServiceCategory[];
  slaPolicies: SlaPolicy[];
  technicians: Technician[];
  locations: Location[];
}

export const useWorkOrderMutations = ({
  serviceCategories,
  slaPolicies,
  technicians: _technicians,
  locations: _locations
}: UseWorkOrderMutationsProps) => {
  const queryClient = useQueryClient();
  const { session } = useSession();
  const { refreshData } = useRealtimeData();

  const workOrderMutation = useMutation({
    mutationFn: async (workOrderData: Partial<WorkOrder>) => {
      const { error } = await supabase.from('work_orders').upsert([workOrderData]);
      if (error) throw new Error(error.message);
    },
    onMutate: async (newWorkOrder) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['work_orders'] });
      if (newWorkOrder.id) {
        await queryClient.cancelQueries({ queryKey: ['work_order', newWorkOrder.id] });
        await queryClient.cancelQueries({ queryKey: ['work_order_drawer', newWorkOrder.id] });
      }

      // Snapshot previous values
      const previousWorkOrders = queryClient.getQueryData(['work_orders']);
      const previousWorkOrder = newWorkOrder.id 
        ? queryClient.getQueryData(['work_order', newWorkOrder.id])
        : null;
      const previousDrawerWorkOrder = newWorkOrder.id
        ? queryClient.getQueryData(['work_order_drawer', newWorkOrder.id])
        : null;

      // Optimistically update work orders list
      if (previousWorkOrders && Array.isArray(previousWorkOrders)) {
        const updatedWorkOrders = previousWorkOrders.map((wo: any) =>
          wo.id === newWorkOrder.id ? { ...wo, ...newWorkOrder } : wo
        );
        queryClient.setQueryData(['work_orders'], updatedWorkOrders);
      }

      // Optimistically update single work order queries
      if (newWorkOrder.id && previousWorkOrder) {
        queryClient.setQueryData(['work_order', newWorkOrder.id], {
          ...previousWorkOrder,
          ...newWorkOrder,
        });
      }
      if (newWorkOrder.id && previousDrawerWorkOrder) {
        queryClient.setQueryData(['work_order_drawer', newWorkOrder.id], {
          ...previousDrawerWorkOrder,
          ...newWorkOrder,
        });
      }

      return { previousWorkOrders, previousWorkOrder, previousDrawerWorkOrder };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousWorkOrders) {
        queryClient.setQueryData(['work_orders'], context.previousWorkOrders);
      }
      if (variables.id && context?.previousWorkOrder) {
        queryClient.setQueryData(['work_order', variables.id], context.previousWorkOrder);
      }
      if (variables.id && context?.previousDrawerWorkOrder) {
        queryClient.setQueryData(['work_order_drawer', variables.id], context.previousDrawerWorkOrder);
      }
      showError(error.message);
    },
    onSettled: async (_, __, variables) => {
      // Refetch in background for consistency, but don't refetch drawer to prevent re-render
      queryClient.invalidateQueries({ 
        queryKey: ['work_orders'],
        refetchType: 'none' // Mark as stale but don't refetch immediately
      });
      
      // Refresh realtime data in background
      refreshData();
    },
    onSuccess: () => {
      showSuccess('Work order has been saved.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('work_orders').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['work_orders'] });
      // Force immediate refresh of realtime data
      await refreshData();
      showSuccess('Work order has been deleted.');
    },
    onError: (error) => showError(error.message),
  });

  const bulkAssignMutation = useMutation({
    mutationFn: async ({ workOrderIds, technicianId }: { workOrderIds: React.Key[], technicianId: string }) => {
      const updates = workOrderIds.map(id => ({
        id: id as string,
        assigned_technician_id: technicianId,
        status: 'In Progress' as const,
      }));
      const { error } = await supabase.from('work_orders').upsert(updates);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, { workOrderIds }) => {
      queryClient.invalidateQueries({ queryKey: ['work_orders'] });
      showSuccess(`${workOrderIds.length} work orders have been assigned.`);
    },
    onError: (error) => showError(error.message),
  });

  const validateStatusTransition = (oldStatus: WorkOrder['status'], newStatus: WorkOrder['status'], isServiceCenter: boolean): boolean => {
    if (!oldStatus || !newStatus) return false;
    if (oldStatus === newStatus) return true;

    // Normalize for comparison
    const normalizedOld = (oldStatus as string).toLowerCase();

    let isValidTransition = false;

    if (normalizedOld === 'new') {
      if (newStatus === 'Confirmation') {
        isValidTransition = true;
      } else if (newStatus === 'In Progress') {
        isValidTransition = true;
      }
    } else if (normalizedOld === 'confirmation') {
      if (newStatus === 'Ready') {
        isValidTransition = true;
      }
    } else if (normalizedOld === 'ready') {
      if (newStatus === 'In Progress') {
        isValidTransition = true;
      }
    } else if (normalizedOld === 'in progress') {
      if (newStatus === 'On Hold' || newStatus === 'Completed') {
        isValidTransition = true;
      }
    } else if (normalizedOld === 'on hold') {
      if (newStatus === 'In Progress') {
        isValidTransition = true;
      }
    }

    if (!isValidTransition) {
      showError(`Invalid status transition from '${oldStatus}' to '${newStatus}'.`);
      return false;
    }

    return true;
  };

  const updateWorkOrder = (
    workOrder: WorkOrder,
    updates: Partial<WorkOrder>,
    onHoldCallback?: (workOrder: WorkOrder) => void
  ) => {
    const oldStatus = workOrder.status;
    const newStatus = updates.status;

    // Enforce: Technician can only be assigned when moving to In Progress in the same update
    if (
      'assignedTechnicianId' in updates &&
      updates.assignedTechnicianId !== workOrder.assignedTechnicianId
    ) {
      const isNewToInProgress = oldStatus?.toLowerCase() === 'new' && newStatus === 'In Progress';
      const isReadyToInProgress = oldStatus?.toLowerCase() === 'ready' && newStatus === 'In Progress';
      if (!isNewToInProgress && !isReadyToInProgress) {
        showError('Technician can only be assigned when moving from New or Ready to In Progress.');
        return;
      }
    }

    // Status transition validation
    if (newStatus && newStatus !== oldStatus) {
      const isServiceCenter = workOrder.channel === 'Service Center';
      if (!validateStatusTransition(oldStatus, newStatus, isServiceCenter)) {
        return;
      }
    }

    const newActivityLog = [...(workOrder.activityLog || [])];
    let activityMessage = '';

    // Timestamp & SLA Automation
    if (newStatus && newStatus !== oldStatus) {
      activityMessage = `Status changed from '${oldStatus || 'N/A'}' to '${newStatus}'.`;

      if (newStatus === 'Confirmation' && !workOrder.confirmed_at) {
        updates.confirmed_at = new Date().toISOString();
      }
      if (newStatus === 'In Progress' && !workOrder.work_started_at) {
        updates.work_started_at = new Date().toISOString();
      }
      if (newStatus === 'On Hold' && oldStatus !== 'On Hold') {
        updates.sla_timers_paused_at = new Date().toISOString();
      }
      if (oldStatus === 'On Hold' && newStatus !== 'On Hold' && workOrder.sla_timers_paused_at) {
        const pausedAt = dayjs(workOrder.sla_timers_paused_at);
        const resumedAt = dayjs();
        const durationPaused = resumedAt.diff(pausedAt, 'second');
        updates.total_paused_duration_seconds = (workOrder.total_paused_duration_seconds || 0) + durationPaused;
        updates.sla_timers_paused_at = null;
        activityMessage += ` (SLA timers resumed after ${durationPaused}s pause).`;
      }
    }

    // Service category SLA update
    if (updates.service_category_id && updates.service_category_id !== workOrder.service_category_id) {
      const policy = slaPolicies?.find(p => p.service_category_id === updates.service_category_id);
      const category = serviceCategories?.find(c => c.id === updates.service_category_id);

      if (policy && policy.resolution_hours) {
        const createdAt = dayjs((workOrder as any).createdAt ?? workOrder.created_at);
        const totalPausedSeconds = updates.total_paused_duration_seconds || workOrder.total_paused_duration_seconds || 0;
        const newSlaDue = createdAt.add(policy.resolution_hours, 'hours').add(totalPausedSeconds, 'seconds').toISOString();
        updates.slaDue = newSlaDue;
        activityMessage += ` Service category set to '${category?.name}'. Resolution SLA updated.`;
      }
    }

    if (activityMessage) {
      newActivityLog.push({
        timestamp: new Date().toISOString(),
        activity: activityMessage,
        userId: session?.user.id ?? null
      });
      updates.activityLog = newActivityLog;
    }

    if (updates.status === 'On Hold' && onHoldCallback) {
      onHoldCallback(workOrder);
      return;
    }

    // Auto-transition Ready to In Progress when appointment is set (not on technician assignment)
    if (
      updates.appointmentDate &&
      workOrder.status === 'Ready' &&
      (!updates.status || !(['On Hold', 'Completed', 'In Progress'] as Array<WorkOrder['status']>).includes(updates.status))
    ) {
      updates.status = 'In Progress';
      showInfo(`Work Order ${workOrder.workOrderNumber} automatically moved to In Progress.`);
    }

    workOrderMutation.mutate(camelToSnakeCase({ id: workOrder.id, ...updates }));
  };

  return {
    updateWorkOrder,
    saveWorkOrder: (workOrderData: WorkOrder) => {
      const newActivityLog = workOrderData.activityLog || [{
        timestamp: new Date().toISOString(),
        activity: 'Work order created.',
        userId: session?.user.id ?? null
      }];
      const dataToMutate: Partial<WorkOrder> = { ...workOrderData, activityLog: newActivityLog };
      if (dataToMutate.id === undefined) {
        delete dataToMutate.id;
      }
      workOrderMutation.mutate(camelToSnakeCase(dataToMutate));
    },
    deleteWorkOrder: (workOrder: WorkOrder) => deleteMutation.mutate(workOrder.id),
    bulkAssign: (workOrderIds: React.Key[], technicianId: string) =>
      bulkAssignMutation.mutate({ workOrderIds, technicianId }),
    isLoading: workOrderMutation.isPending || deleteMutation.isPending || bulkAssignMutation.isPending
  };
};