import React from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Maximum width */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    /** Whether to add padding */
    p?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    children: React.ReactNode;
    className?: string;
}

const sizeMap = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
};

const paddingMap = {
    xs: 'px-2',
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8',
    xl: 'px-12',
};

/**
 * Container component - centered container with max width
 * Replaces Mantine Container
 */
export function Container({
    size = 'lg',
    p = 'md',
    children,
    className,
    style,
    ...props
}: ContainerProps) {
    const sizeClass = typeof size === 'number' ? '' : sizeMap[size];
    const maxWidth = typeof size === 'number' ? { maxWidth: `${size}px` } : {};

    return (
        <div
            className={cn(
                'mx-auto w-full',
                sizeClass,
                paddingMap[p],
                className
            )}
            style={{ ...maxWidth, ...style }}
            {...props}
        >
            {children}
        </div>
    );
}
