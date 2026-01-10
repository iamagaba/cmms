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
                    container: 'bg-green-50 dark:bg-green-900/30 border-l-4 border-l-green-500 hover:bg-green-100 dark:hover:bg-green-900/50',
                    time: 'text-green-800 dark:text-green-300',
                    text: 'text-green-700 dark:text-green-400',
                    iconColor: 'text-green-600 dark:text-green-400'
                };
            case 'unavailable':
                return {
                    container: 'bg-red-50 dark:bg-red-900/30 border-l-4 border-l-red-200 hover:bg-red-100 dark:hover:bg-red-900/50',
                    time: 'text-red-800 dark:text-red-300',
                    text: 'text-red-700 dark:text-red-400',
                    iconColor: 'text-red-400 dark:text-red-400'
                };
            case 'conflict':
                return {
                    container: 'bg-orange-50 dark:bg-orange-900/30 border-l-4 border-l-orange-200 hover:bg-orange-100 dark:hover:bg-orange-900/50',
                    time: 'text-orange-800 dark:text-orange-300',
                    text: 'text-orange-700 dark:text-orange-400',
                    iconColor: 'text-orange-400 dark:text-orange-400'
                };
            case 'assigned':
            default:
                return {
                    container: 'bg-white dark:bg-gray-800 border-l-4 hover:shadow-md border-gray-200 dark:border-gray-700',
                    time: 'text-gray-900 dark:text-gray-100',
                    text: 'text-gray-600 dark:text-gray-400',
                    iconColor: ''
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
                    <div className="text-[8px] text-gray-400 dark:text-gray-500 truncate">
                        {location}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShiftCard;
