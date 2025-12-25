import React from 'react';
import { cn } from '@/lib/utils';

export interface PaperProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Paper padding */
    p?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Border radius */
    radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Whether to show shadow */
    shadow?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none';
    /** Whether paper has border */
    withBorder?: boolean;
    children: React.ReactNode;
    className?: string;
}

const paddingMap = {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
};

const radiusMap = {
    xs: 'rounded-sm',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
};

const shadowMap = {
    xs: 'shadow-sm',
    sm: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    none: '',
};

/**
 * Paper component - simple container with background
 * Replaces Mantine Paper
 */
export function Paper({
    p = 'md',
    radius = 'sm',
    shadow = 'none',
    withBorder = false,
    children,
    className,
    ...props
}: PaperProps) {
    return (
        <div
            className={cn(
                'bg-white',
                paddingMap[p],
                radiusMap[radius],
                shadowMap[shadow],
                withBorder && 'border border-gray-200',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
