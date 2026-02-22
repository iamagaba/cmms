import React from 'react';
import { Clock, AlertCircle, CheckCircle2, Timer, Calendar } from 'lucide-react';
import { WorkOrder } from '@/types/supabase';
import { calculateStatusSLA, formatDuration } from '@/utils/slaCalculations';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkOrderSLAStatusProps {
    workOrder: WorkOrder;
    className?: string;
    variant?: 'full' | 'compact' | 'table';
}

export const WorkOrderSLAStatus: React.FC<WorkOrderSLAStatusProps> = ({
    workOrder,
    className,
    variant = 'full'
}) => {
    // Use new status-based calculation
    const slaStats = calculateStatusSLA(workOrder);

    // If no SLA config for this status or calculation failed, return null
    if (!slaStats) {
        if (workOrder.status === 'Completed') {
            // Optional: Show simple completed badge
            return (
                <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium bg-blue-50 text-blue-700 border-blue-200", className)}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed</span>
                </div>
            );
        }
        return null;
    }

    const statusConfig = {
        'on-track': {
            color: 'text-emerald-700 dark:text-emerald-400',
            bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
            borderColor: 'border-emerald-200 dark:border-emerald-800',
            progressColor: 'bg-emerald-500',
            icon: CheckCircle2,
            label: 'On Track',
            badgeColor: 'bg-emerald-100/50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
        },
        'at-risk': {
            color: 'text-amber-700 dark:text-amber-400',
            bgColor: 'bg-amber-50 dark:bg-amber-950/30',
            borderColor: 'border-amber-200 dark:border-amber-800',
            progressColor: 'bg-amber-500',
            icon: Clock,
            label: 'At Risk',
            badgeColor: 'bg-amber-100/50 text-amber-800 border-amber-200 hover:bg-amber-100'
        },
        'breached': {
            color: 'text-red-700 dark:text-red-400',
            bgColor: 'bg-red-50 dark:bg-red-950/30',
            borderColor: 'border-red-200 dark:border-red-800',
            progressColor: 'bg-red-500',
            icon: AlertCircle,
            label: 'Overdue',
            badgeColor: 'bg-red-100/50 text-red-800 border-red-200 hover:bg-red-100'
        }
    };

    const config = statusConfig[slaStats.status] || statusConfig['on-track'];
    const Icon = config.icon;
    const formattedTime = formatDuration(slaStats.timeRemaining);
    // Approximate deadline based on now + remaining
    const deadline = dayjs().add(slaStats.timeRemaining, 'minute');

    const FullStatusView = () => (
        <div className={cn("min-w-[300px] p-3", variant === 'full' ? cn("rounded-lg border", config.bgColor, config.borderColor) : "bg-popover", className)}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Icon className={cn("w-4 h-4", config.color)} />
                    <span className={cn("text-sm font-semibold", config.color)}>
                        {workOrder.status} SLA: {config.label}
                    </span>
                </div>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-lg", variant === 'full' ? "bg-white/50" : "bg-muted", config.color)}>
                    {slaStats.status === 'breached' ? `Overdue by ${formattedTime.replace('-', '')}` : `${formattedTime} left`}
                </span>
            </div>

            <div className="space-y-1 mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{Math.min(Math.round(slaStats.percentage), 100)}%</span>
                </div>
                <Progress
                    value={Math.min(slaStats.percentage, 100)}
                    className={cn("h-2", variant === 'full' ? "bg-white/50" : "bg-muted")}
                    indicatorClassName={config.progressColor}
                />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={cn("rounded p-2", variant === 'full' ? "bg-white/50" : "bg-muted")}>
                    <div className="text-muted-foreground mb-0.5 flex items-center gap-1">
                        <Timer className="w-3 h-3" /> Time Elapsed
                    </div>
                    <div className="font-medium text-foreground">
                        {formatDuration(slaStats.timeElapsed)}
                    </div>
                </div>

                <div className={cn("rounded p-2", variant === 'full' ? "bg-white/50" : "bg-muted")}>
                    <div className="text-muted-foreground mb-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Target Time
                    </div>
                    <div className={cn("font-medium", slaStats.status === 'breached' ? "text-red-600" : "text-foreground")}>
                        {formatDuration(slaStats.targetDuration)}
                    </div>
                </div>
            </div>
        </div>
    );

    if (variant === 'compact' || variant === 'table') {
        const isTable = variant === 'table';

        const CompactBadge = (
            <div className={cn(
                isTable
                    ? "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg border text-[10px] font-medium transition-colors cursor-help select-none"
                    : "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-help select-none",
                config.badgeColor,
                className
            )}>
                <Icon className={isTable ? "w-3 h-3" : "w-3.5 h-3.5"} />
                <span>
                    {isTable
                        ? (slaStats.status === 'breached' ? formattedTime.replace('-', '') : formattedTime)
                        : (slaStats.status === 'breached' ? `Overdue ${formattedTime.replace('-', '')}` : `${formattedTime} left`)}
                </span>
            </div>
        );

        return (
            <TooltipProvider>
                <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                        {CompactBadge}
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="end" className="p-0 border shadow-md">
                        <FullStatusView />
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return <FullStatusView />;
};
