import React from 'react';
import { Sun, ThumbsDown } from 'lucide-react';
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
                    container: 'bg-muted/50 border-l-4 border-l-primary hover:bg-muted',
                    time: 'text-foreground',
                    text: 'text-muted-foreground',
                    iconColor: 'text-muted-foreground'
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
                    container: 'bg-muted/50 border-l-4 border-l-border hover:bg-muted',
                    time: 'text-foreground',
                    text: 'text-muted-foreground',
                    iconColor: 'text-muted-foreground'
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
                    <div className={cn("text-xs font-bold", styles.time)}>
                        {startTime} - {endTime}
                    </div>
                ) : (
                    <div className={cn("text-xs font-bold flex items-center gap-1", styles.time)}>
                        {status === 'unavailable' && <Sun className="w-3 h-3" />}
                        {status === 'conflict' && <ThumbsDown className="w-3 h-3" />}
                        {notes || "All Day"}
                    </div>
                )}

                {/* Location */}
                {location && (
                    <div className="text-xs text-muted-foreground truncate">
                        {location}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShiftCard;
