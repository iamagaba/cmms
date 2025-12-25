import React from 'react';
import { cn } from '@/lib/utils';

export interface CenterProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Whether to center inline (horizontally only) */
    inline?: boolean;
    children: React.ReactNode;
    className?: string;
}

/**
 * Center component - centers children both horizontally and vertically
 * Replaces Mantine Center
 */
export function Center({
    inline = false,
    children,
    className,
    ...props
}: CenterProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-center',
                inline ? 'inline-flex' : '',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
