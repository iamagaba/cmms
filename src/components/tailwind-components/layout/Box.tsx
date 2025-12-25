import React from 'react';
import { cn } from '@/lib/utils';

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Padding */
    p?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    /** Margin */
    m?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    children?: React.ReactNode;
    className?: string;
}

const spacingMap = {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
};

/**
 * Box component - generic container with spacing utilities
 * Replaces Mantine Box
 */
export function Box({
    p,
    m,
    children,
    className,
    style,
    ...props
}: BoxProps) {
    const paddingStyle = p ? { padding: typeof p === 'number' ? `${p}px` : spacingMap[p] } : {};
    const marginStyle = m ? { margin: typeof m === 'number' ? `${m}px` : spacingMap[m] } : {};

    return (
        <div
            className={cn(className)}
            style={{ ...paddingStyle, ...marginStyle, ...style }}
            {...props}
        >
            {children}
        </div>
    );
}
