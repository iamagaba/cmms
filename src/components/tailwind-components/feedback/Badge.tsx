import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** Badge variant */
    variant?: 'filled' | 'light' | 'outline' | 'dot';
    /** Badge color */
    color?: 'primary' | 'gray' | 'red' | 'green' | 'blue' | 'yellow' | 'orange';
    /** Badge size */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Badge radius */
    radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    children: React.ReactNode;
    className?: string;
}

const sizeMap = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm',
    xl: 'px-4 py-1 text-base',
};

const radiusMap = {
    xs: 'rounded-sm',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
};

const variantMap = {
    filled: {
        primary: 'bg-primary-500 text-white',
        gray: 'bg-gray-500 text-white',
        red: 'bg-red-500 text-white',
        green: 'bg-green-500 text-white',
        blue: 'bg-blue-500 text-white',
        yellow: 'bg-yellow-500 text-white',
        orange: 'bg-orange-500 text-white',
    },
    light: {
        primary: 'bg-primary-100 text-primary-700',
        gray: 'bg-gray-100 text-gray-700',
        red: 'bg-red-100 text-red-700',
        green: 'bg-green-100 text-green-700',
        blue: 'bg-blue-100 text-blue-700',
        yellow: 'bg-yellow-100 text-yellow-700',
        orange: 'bg-orange-100 text-orange-700',
    },
    outline: {
        primary: 'border border-primary-500 text-primary-500',
        gray: 'border border-gray-500 text-gray-500',
        red: 'border border-red-500 text-red-500',
        green: 'border border-green-500 text-green-500',
        blue: 'border border-blue-500 text-blue-500',
        yellow: 'border border-yellow-500 text-yellow-500',
        orange: 'border border-orange-500 text-orange-500',
    },
    dot: {
        primary: 'bg-primary-100 text-primary-700',
        gray: 'bg-gray-100 text-gray-700',
        red: 'bg-red-100 text-red-700',
        green: 'bg-green-100 text-green-700',
        blue: 'bg-blue-100 text-blue-700',
        yellow: 'bg-yellow-100 text-yellow-700',
        orange: 'bg-orange-100 text-orange-700',
    },
};

/**
 * Badge component - small label for status or category
 * Replaces Mantine Badge
 */
export function Badge({
    variant = 'light',
    color = 'primary',
    size = 'md',
    radius = 'sm',
    children,
    className,
    ...props
}: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center font-medium',
                sizeMap[size],
                radiusMap[radius],
                variantMap[variant][color],
                className
            )}
            {...props}
        >
            {variant === 'dot' && (
                <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', `bg-${color}-500`)} />
            )}
            {children}
        </span>
    );
}
