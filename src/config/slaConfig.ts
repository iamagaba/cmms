export const SLA_CONFIG = {
    // Time in minutes for each status
    statusThresholds: {
        'New': 15,          // Time to acknowledge/move to confirmation
        'Confirmation': 0,  // No SLA - waiting on customer confirmation (outside our control)
        'Ready': 240,       // Time to assign/start work (4 hours)
        'In Progress': 120, // Time to complete work (2 hours)
        'On Hold': 0,       // No SLA for paused state
    },
    // Warning threshold (percentage of time elapsed)
    warningThreshold: 0.75, // 75% of time elapsed triggers 'at-risk'
};

export type SLAStatus = 'on-track' | 'at-risk' | 'breached';

export interface StatusSLA {
    targetDuration: number; // in minutes
    timeElapsed: number;    // in minutes
    timeRemaining: number;  // in minutes
    status: SLAStatus;
    percentage: number;
}
