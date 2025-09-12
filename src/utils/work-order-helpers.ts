import dayjs from 'dayjs';
import { WorkOrder, Technician, Location, Profile, ServiceCategory, SlaPolicy } from '@/types/supabase';

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
  if (oldStatus === 'Completed') {
    return false; // Cannot change status of a completed work order
  }

  if (oldStatus === 'Open') {
    return newStatus === 'Confirmation' || (newStatus === 'In Progress' && isServiceCenterChannel);
  }
  if (oldStatus === 'Confirmation') {
    return newStatus === 'Ready';
  }
  if (oldStatus === 'Ready') {
    return newStatus === 'In Progress';
  }
  if (oldStatus === 'In Progress') {
    return newStatus === 'On Hold' || newStatus === 'Completed';
  }
  if (oldStatus === 'On Hold') {
    return newStatus === 'In Progress';
  }
  return false;
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
  } else if (updates.assignedTechnicianId && updates.assignedTechnicianId !== oldWorkOrder.assignedTechnicianId) {
    const oldTech = allTechnicians?.find(t => t.id === oldWorkOrder.assignedTechnicianId)?.name || 'Unassigned';
    const newTech = allTechnicians?.find(t => t.id === updates.assignedTechnicianId)?.name || 'Unassigned';
    activityMessage = `Assigned technician changed from '${oldTech}' to '${newTech}'.`;
  } else if (updates.slaDue && updates.slaDue !== oldWorkOrder.slaDue) {
    activityMessage = `SLA due date updated to '${dayjs(updates.slaDue).format('MMM D, YYYY h:mm A')}'.`;
  } else if (updates.appointmentDate && updates.appointmentDate !== oldWorkOrder.appointmentDate) {
    activityMessage = `Appointment date updated to '${dayjs(updates.appointmentDate).format('MMM D, YYYY h:mm A')}'.`;
  } else if (updates.initialDiagnosis && updates.initialDiagnosis !== oldWorkOrder.initialDiagnosis) {
    activityMessage = `Initial diagnosis updated.`;
  } else if (updates.issueType && updates.issueType !== oldWorkOrder.issueType) {
    activityMessage = `Confirmed issue type updated to '${updates.issueType}'.`;
  } else if (updates.faultCode && updates.faultCode !== oldWorkOrder.faultCode) {
    activityMessage = `Fault code updated to '${updates.faultCode}'.`;
  } else if (updates.maintenanceNotes && updates.maintenanceNotes !== oldWorkOrder.maintenanceNotes) {
    activityMessage = `Maintenance notes updated.`;
  } else if (updates.priority && updates.priority !== oldWorkOrder.priority) {
    activityMessage = `Priority changed from '${oldWorkOrder.priority || 'N/A'}' to '${updates.priority}'.`;
  } else if (updates.channel && updates.channel !== oldWorkOrder.channel) {
    activityMessage = `Channel changed from '${oldWorkOrder.channel || 'N/A'}' to '${updates.channel}'.`;
  } else if (updates.locationId && updates.locationId !== oldWorkOrder.locationId) {
    const oldLoc = allLocations?.find(l => l.id === oldWorkOrder.locationId)?.name || 'N/A';
    const newLoc = allLocations?.find(l => l.id === updates.locationId)?.name || 'N/A';
    activityMessage = `Service location changed from '${oldLoc}' to '${newLoc}'.`;
  } else if (updates.customerAddress && updates.customerAddress !== oldWorkOrder.customerAddress) {
    activityMessage = `Client address updated to '${updates.customerAddress}'.`;
  } else if (updates.customerLat !== oldWorkOrder.customerLat || updates.customerLng !== oldWorkOrder.customerLng) {
    activityMessage = `Client coordinates updated.`;
  } else if (updates.service_category_id && updates.service_category_id !== oldWorkOrder.service_category_id) {
    const category = (oldWorkOrder as any).service_categories?.name || 'N/A'; // Access from joined data if available
    activityMessage = `Service category changed to '${category}'.`;
  } else {
    activityMessage = 'Work order details updated.'; // Generic message for other changes
  }

  return activityMessage;
};