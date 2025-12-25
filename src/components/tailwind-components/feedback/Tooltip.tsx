import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
    /** Tooltip label */
    label: string;
    /** Tooltip children */
    children: React.ReactElement;
    /** Tooltip position */
    position?: 'top' | 'bottom' | 'left' | 'right';
    /** Additional className */
    className?: string;
}

/**
 * Tooltip component - hover tooltip
 * Replaces Mantine Tooltip
 */
export function Tooltip({
    label,
    children,
    position = 'top',
    className,
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div className="relative inline-block">
            {React.cloneElement(children, {
                onMouseEnter: () => setIsVisible(true),
                onMouseLeave: () => setIsVisible(false),
            })}
            {isVisible && (
                <div
                    className={cn(
                        'absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap',
                        positionClasses[position],
                        className
                    )}
                >
                    {label}
                </div>
            )}
        </div>
    );
}
