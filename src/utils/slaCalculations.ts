import { WorkOrder } from '@/types/supabase';
import { SLA_CONFIG, StatusSLA, SLAStatus } from '@/config/slaConfig';
import dayjs from 'dayjs';

// Legacy type for backward compatibility
export type SLAInfo = {
    status: 'on-track' | 'at-risk' | 'overdue' | 'completed' | 'no-sla';
    deadline: Date | null;
    timeRemaining: number;
    timeElapsed: number;
    totalSLATime: number;
    progressPercent: number;
    formattedTimeRemaining: string;
    slaTargetHours: number | null;
};

// Helper to parse activity log for status entry time
export function getStatusEntryTime(workOrder: WorkOrder, targetStatus: string): string | null {
    // Check explicit timestamps first
    if (targetStatus === 'New') return workOrder.created_at;
    if (targetStatus === 'Ready' && workOrder.confirmed_at) return workOrder.confirmed_at;
    if (targetStatus === 'In Progress' && workOrder.work_started_at) return workOrder.work_started_at;
    if (targetStatus === 'Completed' && workOrder.completed_at) return workOrder.completed_at;

    // Fallback to activity log parsing
    if (workOrder.activity_log && Array.isArray(workOrder.activity_log)) {
        // Sort activity log by timestamp descending to find latest transition
        const sortedLog = [...workOrder.activity_log].sort((a: any, b: any) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        // Look for transition TO the target status
        const entry = sortedLog.find((log: any) =>
            log.activity && log.activity.includes(`to '${targetStatus}'`)
        );

        if (entry) return entry.timestamp;
    }

    return null;
}

export function calculateStatusSLA(workOrder: WorkOrder): StatusSLA | null {
    const status = workOrder.status || 'New';
    const threshold = SLA_CONFIG.statusThresholds[status as keyof typeof SLA_CONFIG.statusThresholds];

    if (threshold === undefined || threshold <= 0) return null;

    const startTimeStr = getStatusEntryTime(workOrder, status);
    if (!startTimeStr) return null;

    const startTime = dayjs(startTimeStr);
    const now = dayjs();

    const diffMinutes = now.diff(startTime, 'minute');
    const remainingMinutes = threshold - diffMinutes;
    const percentage = Math.min(100, (diffMinutes / threshold) * 100);

    let slaStatus: SLAStatus = 'on-track';
    if (remainingMinutes < 0) {
        slaStatus = 'breached';
    } else if (percentage >= (SLA_CONFIG.warningThreshold * 100)) {
        slaStatus = 'at-risk';
    }

    return {
        targetDuration: threshold,
        timeElapsed: diffMinutes,
        timeRemaining: remainingMinutes,
        status: slaStatus,
        percentage
    };
}

export function formatDuration(minutes: number): string {
    const isNegative = minutes < 0;
    const absMins = Math.abs(minutes);
    const h = Math.floor(absMins / 60);
    const m = Math.floor(absMins % 60);

    const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
    return isNegative ? `-${timeStr}` : timeStr;
}

// Legacy exports for backward compatibility
export function getSLAHours(
    slaConfig: Record<string, { high: number; medium: number; low: number }> | null,
    serviceCategoryId: string,
    priority: 'high' | 'medium' | 'low'
): number | null {
    if (!slaConfig || !serviceCategoryId) return null;
    const categoryConfig = slaConfig[serviceCategoryId];
    if (!categoryConfig) return null;
    return categoryConfig[priority] || null;
}

export function calculateSLADeadline(
    createdAt: string | Date,
    slaHours: number | null
): Date | null {
    if (!slaHours || slaHours <= 0) return null;
    const created = new Date(createdAt);
    const deadline = new Date(created.getTime() + slaHours * 60 * 60 * 1000);
    return deadline;
}

export function formatTimeRemaining(milliseconds: number): string {
    const isNegative = milliseconds < 0;
    const absMs = Math.abs(milliseconds);
    const days = Math.floor(absMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));

    let result = '';
    if (days > 0) {
        result = `${days}d ${hours}h`;
    } else if (hours > 0) {
        result = `${hours}h ${minutes}m`;
    } else {
        result = `${minutes}m`;
    }

    return isNegative ? `Overdue by ${result}` : `${result} left`;
}

export function getSLAStatus(
    workOrder: WorkOrder,
    slaConfig: Record<string, { high: number; medium: number; low: number }> | null
): SLAInfo {
    const noSLAInfo: SLAInfo = {
        status: 'no-sla',
        deadline: null,
        timeRemaining: 0,
        timeElapsed: 0,
        totalSLATime: 0,
        progressPercent: 0,
        formattedTimeRemaining: 'No SLA',
        slaTargetHours: null,
    };

    if (workOrder.status === 'completed') {
        return { ...noSLAInfo, status: 'completed' };
    }

    const priority = (workOrder.priority || 'medium').toLowerCase() as 'high' | 'medium' | 'low';
    const serviceCategoryId =
        workOrder.service ||
        workOrder.service_category_id ||
        (workOrder as any).serviceCategoryId;

    if (!serviceCategoryId) return noSLAInfo;

    const slaHours = getSLAHours(slaConfig, serviceCategoryId, priority);
    if (!slaHours) return noSLAInfo;

    const createdAt = workOrder.created_at || (workOrder as any).createdAt;
    const deadline = calculateSLADeadline(createdAt, slaHours);
    if (!deadline) return noSLAInfo;

    const now = new Date();
    const created = new Date(createdAt);
    const totalSLATime = deadline.getTime() - created.getTime();
    const timeElapsed = now.getTime() - created.getTime();
    const timeRemaining = deadline.getTime() - now.getTime();
    const progressPercent = (timeElapsed / totalSLATime) * 100;

    let status: SLAInfo['status'];
    if (timeRemaining < 0) {
        status = 'overdue';
    } else if (progressPercent >= 75) {
        status = 'at-risk';
    } else {
        status = 'on-track';
    }

    return {
        status,
        deadline,
        timeRemaining,
        timeElapsed,
        totalSLATime,
        progressPercent,
        formattedTimeRemaining: formatTimeRemaining(timeRemaining),
        slaTargetHours: slaHours,
    };
}

export function calculateSLACompliance(
    workOrders: WorkOrder[],
    slaConfig: Record<string, { high: number; medium: number; low: number }> | null
): {
    compliancePercent: number;
    totalCompleted: number;
    completedWithinSLA: number;
    completedOutsideSLA: number;
} {
    const completedOrders = workOrders.filter(wo => wo.status === 'completed');

    if (completedOrders.length === 0) {
        return {
            compliancePercent: 100,
            totalCompleted: 0,
            completedWithinSLA: 0,
            completedOutsideSLA: 0,
        };
    }

    let completedWithinSLA = 0;

    completedOrders.forEach(wo => {
        const priority = (wo.priority || 'medium').toLowerCase() as 'high' | 'medium' | 'low';
        const serviceCategoryId =
            wo.service ||
            wo.service_category_id ||
            (wo as any).serviceCategoryId;

        if (!serviceCategoryId) return;

        const slaHours = getSLAHours(slaConfig, serviceCategoryId, priority);
        const completedAtField = wo.completed_at || (wo as any).completedAt;

        if (!slaHours || !completedAtField) return;

        const createdAt = wo.created_at || (wo as any).createdAt;
        const deadline = calculateSLADeadline(createdAt, slaHours);
        if (!deadline) return;

        const completedAt = new Date(completedAtField);

        if (completedAt <= deadline) {
            completedWithinSLA++;
        }
    });

    const completedOutsideSLA = completedOrders.length - completedWithinSLA;
    const compliancePercent = (completedWithinSLA / completedOrders.length) * 100;

    return {
        compliancePercent,
        totalCompleted: completedOrders.length,
        completedWithinSLA,
        completedOutsideSLA,
    };
}
