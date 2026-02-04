import React from 'react';
import { Clock, AlertCircle, CheckCircle2, Timer, Calendar } from 'lucide-react';
import { WorkOrder } from '@/types/supabase';
import { getSLAStatus } from '@/utils/slaCalculations';
import { useSystemSettings } from '@/context/SystemSettingsContext';
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
    const { settings } = useSystemSettings();
    const slaConfig = typeof settings?.sla_config === 'string'
        ? JSON.parse(settings.sla_config)
        : settings?.sla_config || null;

    const slaInfo = getSLAStatus(workOrder, slaConfig);

    if (slaInfo.status === 'no-sla') return null;

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
        'overdue': {
            color: 'text-red-700 dark:text-red-400',
            bgColor: 'bg-red-50 dark:bg-red-950/30',
            borderColor: 'border-red-200 dark:border-red-800',
            progressColor: 'bg-red-500',
            icon: AlertCircle,
            label: 'Overdue',
            badgeColor: 'bg-red-100/50 text-red-800 border-red-200 hover:bg-red-100'
        },
        'completed': {
            color: 'text-blue-700 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-950/30',
            borderColor: 'border-blue-200 dark:border-blue-800',
            progressColor: 'bg-blue-500',
            icon: CheckCircle2,
            label: 'Completed',
            badgeColor: 'bg-blue-100/50 text-blue-800 border-blue-200 hover:bg-blue-100'
        }
    };

    const config = statusConfig[slaInfo.status as keyof typeof statusConfig] || statusConfig['on-track'];
    const Icon = config.icon;

    // Calculate elapsed time display
    const formatDuration = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

        if (hours === 0 && minutes === 0) return '< 1m';
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const FullStatusView = () => (
        <div className={cn("min-w-[300px] p-3", variant === 'full' ? cn("rounded-lg border", config.bgColor, config.borderColor) : "bg-popover", className)}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Icon className={cn("w-4 h-4", config.color)} />
                    <span className={cn("text-sm font-semibold", config.color)}>
                        SLA Status: {config.label}
                    </span>
                </div>
                {slaInfo.status !== 'completed' && (
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", variant === 'full' ? "bg-white/50" : "bg-muted", config.color)}>
                        {slaInfo.formattedTimeRemaining}
                    </span>
                )}
            </div>

            <div className="space-y-1 mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{Math.min(Math.round(slaInfo.progressPercent), 100)}%</span>
                </div>
                <Progress
                    value={Math.min(slaInfo.progressPercent, 100)}
                    className={cn("h-2", variant === 'full' ? "bg-white/50" : "bg-muted")}
                    indicatorClassName={config.progressColor}
                />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={cn("rounded p-2", variant === 'full' ? "bg-white/50" : "bg-muted")}>
                    <div className="text-muted-foreground mb-0.5 flex items-center gap-1">
                        <Timer className="w-3 h-3" /> Elapsed
                    </div>
                    <div className="font-medium text-foreground">
                        {formatDuration(slaInfo.timeElapsed)}
                    </div>
                </div>

                <div className={cn("rounded p-2", variant === 'full' ? "bg-white/50" : "bg-muted")}>
                    <div className="text-muted-foreground mb-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> SLA Due
                    </div>
                    <div className={cn("font-medium", slaInfo.status === 'overdue' ? "text-red-600" : "text-foreground")}>
                        {slaInfo.deadline ? dayjs(slaInfo.deadline).format('MMM D, h:mm A') : 'N/A'}
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
                    ? "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border text-[10px] font-medium transition-colors cursor-help select-none"
                    : "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors cursor-help select-none",
                config.badgeColor,
                className
            )}>
                <Icon className={isTable ? "w-3 h-3" : "w-3.5 h-3.5"} />
                <span>
                    {isTable && slaInfo.status !== 'completed'
                        ? slaInfo.formattedTimeRemaining.replace(/Overdue by\s*/i, '').replace(/\s*left$/i, '')
                        : (slaInfo.status === 'completed' ? config.label : slaInfo.formattedTimeRemaining)}
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
