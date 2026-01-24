import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    Sun01Icon,
    ThumbsDownIcon
} from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';

export type ShiftStatus = 'assigned' | 'open' | 'unavailable' | 'conflict';

export interface ShiftCardProps {
    id: string;
    startTime?: string;
    endTime?: string;
    employeeName?: string;
    role?: string;
    location?: string;
    status: ShiftStatus;
    notes?: string;
    color?: string;
    onClick?: () => void;
}

const ShiftCard: React.FC<ShiftCardProps> = ({
    startTime,
    endTime,
    employeeName,
    role,
    location,
    status,
    notes,
    color = '#22c55e',
    onClick,
}) => {
    const getStatusStyles = () => {
        switch (status) {
            case 'open':
                return {
                    container: 'bg-green-50/50 dark:bg-green-900/10 border-l-4 border-l-green-500 hover:bg-green-50 dark:hover:bg-green-900/20',
                    time: 'text-green-700 dark:text-green-400',
                    text: 'text-green-600 dark:text-green-300',
                    iconColor: 'text-green-600 dark:text-green-400'
                };
            case 'unavailable':
                return {
                    container: 'bg-destructive/5 dark:bg-destructive/10 border-l-4 border-l-destructive/50 hover:bg-destructive/10 dark:hover:bg-destructive/20',
                    time: 'text-destructive',
                    text: 'text-destructive/80',
                    iconColor: 'text-destructive'
                };
            case 'conflict':
                return {
                    container: 'bg-orange-50/50 dark:bg-orange-900/10 border-l-4 border-l-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20',
                    time: 'text-orange-700 dark:text-orange-400',
                    text: 'text-orange-600 dark:text-orange-300',
                    iconColor: 'text-orange-600 dark:text-orange-400'
                };
            case 'assigned':
            default:
                return {
                    container: 'bg-card hover:bg-accent/50 border-l-4 hover:shadow-sm border-border text-card-foreground',
                    time: 'text-foreground font-medium',
                    text: 'text-muted-foreground',
                    iconColor: 'text-muted-foreground'
                };
        }
    };

    const styles = getStatusStyles();

    return (
        <div
            onClick={onClick}
            className={cn(
                'group relative p-1.5 mb-1 rounded cursor-pointer transition-all duration-200 shadow-sm border border-transparent',
                styles.container
            )}
            style={status === 'assigned' ? { borderLeftColor: color } : undefined}
        >
            <div className="flex flex-col gap-0.5">
                {/* Time Row */}
                {(startTime && endTime) ? (
                    <div className={cn("text-[10px] font-bold", styles.time)}>
                        {startTime} - {endTime}
                    </div>
                ) : (
                    <div className={cn("text-[10px] font-bold flex items-center gap-1", styles.time)}>
                        {status === 'unavailable' && <HugeiconsIcon icon={Sun01Icon} size={10} />}
                        {status === 'conflict' && <HugeiconsIcon icon={ThumbsDownIcon} size={10} />}
                        {notes || "All Day"}
                    </div>
                )}

                {/* Location */}
                {location && (
                    <div className="text-[10px] text-muted-foreground truncate">
                        {location}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShiftCard;
