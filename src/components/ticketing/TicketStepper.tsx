import React from 'react';
import { Ticket, Play, CheckCircle2, Archive, PauseCircle } from 'lucide-react';
import { Ticket as TicketType } from '@/types/ticketing';
import dayjs from 'dayjs';

interface TicketStepperProps {
    ticket: TicketType;
    compact?: boolean;
    onStatusChange?: (status: TicketType['status']) => void;
}

const STEPS = [
    { key: 'open', label: 'Open', icon: Ticket },
    { key: 'in_progress', label: 'In Progress', icon: Play },
    { key: 'resolved', label: 'Resolved', icon: CheckCircle2 },
    { key: 'closed', label: 'Closed', icon: Archive },
];

const STATUS_ORDER = ['open', 'in_progress', 'resolved', 'closed'];

// Mapping for specific status states to steps
const STATUS_TO_STEP_INDEX: Record<string, number> = {
    'open': 0,
    'in_progress': 1,
    'on_hold': 1, // On Hold maps to In Progress step visually, maybe with a pause icon
    'resolved': 2,
    'closed': 3
};

const formatDuration = (ms: number): string => {
    if (ms < 0) return '-';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return '< 1m';
};

const TicketStepper: React.FC<TicketStepperProps> = ({ ticket, onStatusChange }) => {
    const currentStatus = ticket.status;
    const currentIndex = STATUS_TO_STEP_INDEX[currentStatus] ?? 0;

    // Subtle animation styles (copied from WorkOrderStepper)
    const rippleStyles = `
    @keyframes subtlePulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.2); }
      50% { box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.05); }
    }
    .ripple-animation { animation: subtlePulse 3s infinite; }
    .step-icon { transition: all 0.2s ease; }
    .step-container { transition: opacity 0.15s ease; }
    .step-connector { transition: background-color 0.2s ease; }
  `;

    const getStepTimestamp = (stepKey: string): dayjs.Dayjs | null => {
        switch (stepKey) {
            case 'open':
                return dayjs(ticket.created_at);
            case 'resolved':
                return ticket.resolved_at ? dayjs(ticket.resolved_at) : null;
            case 'closed':
                return ticket.closed_at ? dayjs(ticket.closed_at) : null;
            case 'in_progress':
                // We don't have a started_at field yet, so we'll rely on current state if active
                return null;
            default:
                return null;
        }
    };

    const getStepDuration = (stepKey: string, stepIndex: number): string | null => {
        const timestamp = getStepTimestamp(stepKey);
        if (!timestamp) return null;

        let nextTimestamp: dayjs.Dayjs | null = null;
        if (stepKey === 'open') {
            // Try to find next available timestamp
            // Ideally we'd use 'in_progress' start time, but we lack it.
            // If resolved, use resolved_at.
            nextTimestamp = getStepTimestamp('resolved') || getStepTimestamp('closed');
        } else if (stepKey === 'in_progress') {
            nextTimestamp = getStepTimestamp('resolved') || getStepTimestamp('closed');
        } else if (stepKey === 'resolved') {
            nextTimestamp = getStepTimestamp('closed');
        }

        if (nextTimestamp) {
            return formatDuration(nextTimestamp.diff(timestamp));
        }

        // If current step, show duration since start
        if (stepIndex === currentIndex) {
            return formatDuration(dayjs().diff(timestamp));
        }

        return null;
    };


    return (
        <>
            <style>{rippleStyles}</style>
            <div className="bg-card px-3 py-3 rounded-lg border border-border">
                <div className="flex items-start justify-between gap-1">
                    {STEPS.map((step, index) => {
                        const isCompleted = currentIndex > index;
                        const isCurrent = STATUS_ORDER[index] === currentStatus || (currentStatus === 'on_hold' && step.key === 'in_progress');

                        // Icon override for On Hold
                        const StepIcon = currentStatus === 'on_hold' && step.key === 'in_progress' ? PauseCircle : step.icon;

                        const showAsCompleted = isCompleted || (isCurrent && step.key === 'closed'); // Closed is final
                        const showAsCurrent = isCurrent && step.key !== 'closed';

                        const isLast = index === STEPS.length - 1;
                        const timestamp = getStepTimestamp(step.key);
                        const duration = getStepDuration(step.key, index);

                        // Click handlers for state transitions
                        const canClick = onStatusChange && (
                            (step.key === 'in_progress' && (currentStatus === 'open' || currentStatus === 'on_hold' || currentStatus === 'resolved')) ||
                            (step.key === 'resolved' && (currentStatus === 'in_progress' || currentStatus === 'on_hold')) ||
                            (step.key === 'closed' && (currentStatus === 'resolved'))
                        );

                        return (
                            <React.Fragment key={step.key}>
                                <div
                                    className={`flex flex-col items-center flex-1 relative group step-container ${canClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                                    onClick={() => canClick && onStatusChange?.(step.key as any)}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center relative transition-colors duration-200 ${showAsCurrent ? 'bg-primary ripple-animation' :
                                        showAsCompleted ? 'bg-primary' : 'bg-muted'
                                        }`}>
                                        <StepIcon className={`w-4 h-4 step-icon ${showAsCurrent || showAsCompleted ? 'text-primary-foreground' : 'text-muted-foreground'
                                            }`} />
                                    </div>

                                    <span className={`text-xs mt-1 font-medium text-center leading-tight ${showAsCurrent || showAsCompleted ? 'text-primary' : 'text-muted-foreground'
                                        }`}>
                                        {step.key === 'in_progress' && currentStatus === 'on_hold' ? 'On Hold' : step.label}
                                    </span>

                                    {duration && (
                                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded whitespace-nowrap">
                                            {duration}
                                        </span>
                                    )}

                                    <span className={`text-[10px] mt-1 text-center leading-tight ${timestamp ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
                                        {timestamp ? timestamp.format('MMM D, h:mm A') : '—'}
                                    </span>
                                </div>

                                {!isLast && (
                                    <div className={`flex-1 h-0.5 mt-4 mx-1 step-connector ${isCompleted ? 'bg-primary' : 'bg-muted'
                                        }`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default TicketStepper;
