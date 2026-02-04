import { WorkOrder } from '@/types/supabase';

export type SLAStatus = 'on-track' | 'at-risk' | 'overdue' | 'completed' | 'no-sla';

export interface SLAInfo {
    status: SLAStatus;
    deadline: Date | null;
    timeRemaining: number; // in milliseconds
    timeElapsed: number; // in milliseconds
    totalSLATime: number; // in milliseconds
    progressPercent: number; // 0-100+
    formattedTimeRemaining: string;
    slaTargetHours: number | null;
}

/**
 * Get SLA hours for a given service category and priority from the config
 */
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

/**
 * Calculate SLA deadline based on work order creation time and SLA hours
 */
export function calculateSLADeadline(
    createdAt: string | Date,
    slaHours: number | null
): Date | null {
    if (!slaHours || slaHours <= 0) return null;

    const created = new Date(createdAt);
    const deadline = new Date(created.getTime() + slaHours * 60 * 60 * 1000);

    return deadline;
}

/**
 * Format time remaining in a human-readable format
 */
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

/**
 * Determine SLA status based on time remaining and work order status
 */
export function getSLAStatus(
    workOrder: WorkOrder,
    slaConfig: Record<string, { high: number; medium: number; low: number }> | null
): SLAInfo {
    // Default response for no SLA
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

    // If work order is completed, mark as completed
    if (workOrder.status === 'completed') {
        const priority = workOrder.priority as 'high' | 'medium' | 'low';
        // Try to get SLA hours if possible even for completed items
        const serviceCategoryId =
            workOrder.service ||
            workOrder.service_category_id ||
            (workOrder as any).serviceCategoryId;

        let slaTargetHours = null;
        if (serviceCategoryId) {
            slaTargetHours = getSLAHours(slaConfig, serviceCategoryId, priority);
        }

        return { ...noSLAInfo, status: 'completed', slaTargetHours };
    }

    // Get SLA hours
    const priority = (workOrder.priority || 'medium').toLowerCase() as 'high' | 'medium' | 'low';

    // Check multiple possible fields for service category ID
    // Priority: service (most commonly used) > service_category_id > camelCase variants
    const serviceCategoryId =
        workOrder.service ||
        workOrder.service_category_id ||
        (workOrder as any).serviceCategoryId;

    if (!serviceCategoryId) {
        return noSLAInfo;
    }

    const slaHours = getSLAHours(slaConfig, serviceCategoryId, priority);

    if (!slaHours) {
        return noSLAInfo;
    }

    // Calculate deadline
    const createdAt = workOrder.created_at || (workOrder as any).createdAt;
    const deadline = calculateSLADeadline(createdAt, slaHours);
    if (!deadline) {
        return noSLAInfo;
    }

    // Calculate time metrics
    const now = new Date();
    const created = new Date(createdAt);
    const totalSLATime = deadline.getTime() - created.getTime();
    const timeElapsed = now.getTime() - created.getTime();
    const timeRemaining = deadline.getTime() - now.getTime();
    const progressPercent = (timeElapsed / totalSLATime) * 100;

    // Determine status based on thresholds
    let status: SLAStatus;
    if (timeRemaining < 0) {
        status = 'overdue';
    } else if (progressPercent >= 75) {
        // Less than 25% time remaining
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

/**
 * Calculate SLA compliance percentage for a set of work orders
 * Only considers completed work orders
 */
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

        // Check multiple possible fields for service category ID
        const serviceCategoryId =
            wo.service ||
            wo.service_category_id ||
            (wo as any).serviceCategoryId;

        if (!serviceCategoryId) {
            return;
        }

        const slaHours = getSLAHours(slaConfig, serviceCategoryId, priority);

        const completedAtField = wo.completed_at || (wo as any).completedAt;

        if (!slaHours || !completedAtField) {
            // If no SLA or no completion time, don't count it
            return;
        }

        const createdAt = wo.created_at || (wo as any).createdAt;
        const deadline = calculateSLADeadline(createdAt, slaHours);
        if (!deadline) return;

        const completedAt = new Date(completedAtField);

        // Check if completed before deadline
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
