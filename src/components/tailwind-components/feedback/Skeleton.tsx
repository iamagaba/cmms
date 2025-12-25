import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Height of skeleton */
    height?: number | string;
    /** Width of skeleton */
    width?: number | string;
    /** Border radius */
    radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /** Whether skeleton is visible */
    visible?: boolean;
    /** Whether skeleton is a circle */
    circle?: boolean;
    /** Whether to animate */
    animate?: boolean;
    className?: string;
}

const radiusMap = {
    xs: 'rounded-sm',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
};

/**
 * Skeleton component - loading placeholder
 * Replaces Mantine Skeleton
 */
export function Skeleton({
    height,
    width,
    radius = 'sm',
    visible = true,
    circle = false,
    animate = true,
    className,
    style,
    ...props
}: SkeletonProps) {
    if (!visible) return null;

    const dimensions: React.CSSProperties = {
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
    };

    if (circle && height) {
        dimensions.width = dimensions.height;
    }

    return (
        <div
            className={cn(
                'bg-gray-200',
                animate && 'animate-pulse',
                circle ? 'rounded-full' : radiusMap[radius],
                className
            )}
            style={{ ...dimensions, ...style }}
            {...props}
        />
    );
}
