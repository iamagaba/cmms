import dayjs from 'dayjs';
import { WorkOrder, Technician, Location, SlaPolicy } from '@/types/supabase';

interface ActivityLogEntry {
  timestamp: string;
  activity: string;
  userId: string | null;
}

/**
 * Generates a standardized activity log entry.
 * @param activity The description of the activity.
 * @param userId The ID of the user performing the activity, or null if system-generated.
 * @returns An ActivityLogEntry object.
 */
export const generateActivityLogEntry = (activity: string, userId: string | null): ActivityLogEntry => {
  return {
    timestamp: new Date().toISOString(),
    activity,
    userId,
  };
};

/**
 * Calculates the new SLA due date based on the service category and total paused duration.
 * @param createdAt The creation timestamp of the work order.
 * @param serviceCategoryId The ID of the service category.
 * @param slaPolicies All available SLA policies.
 * @param totalPausedDurationSeconds The total duration the work order was paused, in seconds.
 * @returns The new SLA due date as an ISO string, or null if no policy applies.
 */
export const calculateSlaDue = (
  createdAt: string,
  serviceCategoryId: string | null,
  slaPolicies: SlaPolicy[] | undefined,
  totalPausedDurationSeconds: number | null,
): string | null => {
  if (!serviceCategoryId || !slaPolicies) return null;

  const policy = slaPolicies.find(p => p.service_category_id === serviceCategoryId);
  if (policy && policy.resolution_hours) {
    const baseTime = dayjs(createdAt);
    const pausedDuration = totalPausedDurationSeconds || 0;
    return baseTime.add(policy.resolution_hours, 'hours').add(pausedDuration, 'seconds').toISOString();
  }
  return null;
};

/**
 * Calculates the duration a work order was paused.
 * @param oldWorkOrder The previous state of the work order.
 * @param newStatus The new status being applied.
 * @param oldStatus The old status of the work order.
 * @returns The additional paused duration in seconds.
 */
export const calculatePausedDuration = (
  oldWorkOrder: WorkOrder,
  newStatus: WorkOrder['status'],
  oldStatus: WorkOrder['status'],
): number => {
  if (oldStatus === 'On Hold' && newStatus !== 'On Hold' && oldWorkOrder.sla_timers_paused_at) {
    const pausedAt = dayjs(oldWorkOrder.sla_timers_paused_at);
    const resumedAt = dayjs();
    return resumedAt.diff(pausedAt, 'second');
  }
  return 0;
};

/**
 * Determines if a status transition is valid.
 * @param oldStatus The current status of the work order.
 * @param newStatus The proposed new status.
 * @param isServiceCenterChannel True if the work order originated from a service center.
 * @returns True if the transition is valid, false otherwise.
 */
export const isValidStatusTransition = (
  oldStatus: WorkOrder['status'],
  newStatus: WorkOrder['status'],
  isServiceCenterChannel: boolean,
): boolean => {
  if (!oldStatus || !newStatus) return false;

  // Normalize for comparison
  const normalizedOld = (oldStatus as string).toLowerCase();

  if (normalizedOld === 'completed') {
    return false; // Cannot change status of a completed work order
  }

  if (normalizedOld === 'new') {
    if (newStatus === 'Confirmation') return true;
    if (newStatus === 'In Progress' && isServiceCenterChannel) return true;
    if (['Ready', 'Cancelled', 'On Hold'].includes(newStatus)) return true; // Allow broader transitions for robustness
    return false;
  }
  if (normalizedOld === 'confirmation') {
    return ['Ready', 'Cancelled', 'On Hold'].includes(newStatus);
  }
  if (normalizedOld === 'ready') {
    return newStatus === 'In Progress';
  }
  if (normalizedOld === 'in progress') {
    return newStatus === 'On Hold' || newStatus === 'Completed';
  }
  if (normalizedOld === 'on hold') {
    return newStatus === 'In Progress' || newStatus === 'Cancelled';
  }
  return false;
};

/**
 * Determines if an asset is currently in custody at a service center.
 * @param vehicle The vehicle/asset to check.
 * @returns True if the asset is in custody (status = 'In Repair').
 */
export const isAssetInCustody = (vehicle: { status?: string | null }): boolean => {
  return vehicle.status === 'In Repair';
};

/**
 * Gets badge information for displaying asset custody status.
 * @param vehicle The vehicle/asset to get badge info for.
 * @returns Object with label, color, and icon for the custody badge.
 */
export const getAssetCustodyBadge = (vehicle: { status?: string | null }) => {
  if (vehicle.status === 'In Repair') {
    return {
      label: 'In Custody',
      color: 'blue',
      icon: '🔧',
      description: 'Asset is at service center undergoing repair'
    };
  }
  if (vehicle.status === 'Decommissioned') {
    return {
      label: 'Decommissioned',
      color: 'red',
      icon: '🚫',
      description: 'Asset is no longer in service'
    };
  }
  return {
    label: 'With Customer',
    color: 'green',
    icon: '📍',
    description: 'Asset is in customer possession'
  };
};

/**
 * Generates an activity message based on the changes made to a work order.
 * @param oldWorkOrder The original work order object.
 * @param updates The partial updates being applied.
 * @param allTechnicians List of all technicians for name lookup.
 * @param allLocations List of all locations for name lookup.
 * @returns A descriptive activity message.
 */
export const generateUpdateActivityMessage = (
  oldWorkOrder: WorkOrder,
  updates: Partial<WorkOrder>,
  allTechnicians: Technician[] | undefined,
  allLocations: Location[] | undefined,
): string => {
  let activityMessage = '';

  if (updates.status && updates.status !== oldWorkOrder.status) {
    activityMessage = `Status changed from '${oldWorkOrder.status || 'N/A'}' to '${updates.status}'.`;
  } else if (updates.assigned_technician_id && updates.assigned_technician_id !== oldWorkOrder.assigned_technician_id) {
    const oldTech = allTechnicians?.find(t => t.id === oldWorkOrder.assigned_technician_id)?.name || 'Unassigned';
    const newTech = allTechnicians?.find(t => t.id === updates.assigned_technician_id)?.name || 'Unassigned';
    activityMessage = `Assigned technician changed from '${oldTech}' to '${newTech}'.`;
  } else if (updates.sla_due && updates.sla_due !== oldWorkOrder.sla_due) {
    activityMessage = `SLA due date updated to '${dayjs(updates.sla_due).format('MMM D, YYYY h:mm A')}'.`;
  } else if (updates.appointment_date && updates.appointment_date !== oldWorkOrder.appointment_date) {
    activityMessage = `Appointment date updated to '${dayjs(updates.appointment_date).format('MMM D, YYYY h:mm A')}'.`;
  } else if ((updates as any).initialDiagnosis && (updates as any).initialDiagnosis !== (oldWorkOrder as any).initialDiagnosis) {
    activityMessage = `Initial diagnosis updated.`;
  } else if ((updates as any).issueType && (updates as any).issueType !== (oldWorkOrder as any).issueType) {
    activityMessage = `Confirmed issue type updated to '${(updates as any).issueType}'.`;
  } else if ((updates as any).faultCode && (updates as any).faultCode !== (oldWorkOrder as any).faultCode) {
    activityMessage = `Fault code updated to '${(updates as any).faultCode}'.`;
  } else if ((updates as any).maintenanceNotes && (updates as any).maintenanceNotes !== (oldWorkOrder as any).maintenanceNotes) {
    activityMessage = `Maintenance notes updated.`;
  } else if (updates.priority && updates.priority !== oldWorkOrder.priority) {
    activityMessage = `Priority changed from '${oldWorkOrder.priority || 'N/A'}' to '${updates.priority}'.`;
  } else if (updates.channel && updates.channel !== oldWorkOrder.channel) {
    activityMessage = `Channel changed from '${oldWorkOrder.channel || 'N/A'}' to '${updates.channel}'.`;
  } else if (updates.location_id && updates.location_id !== oldWorkOrder.location_id) {
    const oldLoc = allLocations?.find(l => l.id === oldWorkOrder.location_id)?.name || 'N/A';
    const newLoc = allLocations?.find(l => l.id === updates.location_id)?.name || 'N/A';
    activityMessage = `Service location changed from '${oldLoc}' to '${newLoc}'.`;
  } else if (updates.customer_address && updates.customer_address !== oldWorkOrder.customer_address) {
    activityMessage = `Client address updated to '${updates.customer_address}'.`;
  } else if (updates.customer_lat !== oldWorkOrder.customer_lat || updates.customer_lng !== oldWorkOrder.customer_lng) {
    activityMessage = `Client coordinates updated.`;
  } else if (updates.service_category_id && updates.service_category_id !== oldWorkOrder.service_category_id) {
    const category = (oldWorkOrder as any).service_categories?.name || 'N/A'; // Access from joined data if available
    activityMessage = `Service category changed to '${category}'.`;
  } else {
    activityMessage = 'Work order details updated.'; // Generic message for other changes
  }

  return activityMessage;
};