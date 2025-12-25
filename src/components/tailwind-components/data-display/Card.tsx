import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Card padding */
    p?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Border radius */
    radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Whether to show shadow */
    shadow?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none';
    /** Whether card has border */
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
 * Card component - container with shadow and border
 * Replaces Mantine Card
 */
export function Card({
    p = 'md',
    radius = 'md',
    shadow = 'sm',
    withBorder = true,
    children,
    className,
    ...props
}: CardProps) {
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
