import React from 'react';
import { cn } from '@/lib/utils';
import { HugeiconsIcon } from '@hugeicons/react';

export interface ThemeIconProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Icon name from Iconify */
    icon?: string;
    /** Icon size */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    /** Icon color */
    color?: 'primary' | 'gray' | 'red' | 'green' | 'blue' | 'yellow';
    /** Icon variant */
    variant?: 'filled' | 'light' | 'outline';
    /** Border radius */
    radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    children?: React.ReactNode;
    className?: string;
}

const sizeMap = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
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
    },
    light: {
        primary: 'bg-primary-100 text-primary-700',
        gray: 'bg-gray-100 text-gray-700',
        red: 'bg-red-100 text-red-700',
        green: 'bg-green-100 text-green-700',
        blue: 'bg-blue-100 text-blue-700',
        yellow: 'bg-yellow-100 text-yellow-700',
    },
    outline: {
        primary: 'border-2 border-primary-500 text-primary-500',
        gray: 'border-2 border-gray-500 text-gray-500',
        red: 'border-2 border-red-500 text-red-500',
        green: 'border-2 border-green-500 text-green-500',
        blue: 'border-2 border-blue-500 text-blue-500',
        yellow: 'border-2 border-yellow-500 text-yellow-500',
    },
};

/**
 * ThemeIcon component - icon with background
 * Replaces Mantine ThemeIcon
 */
export function ThemeIcon({
    icon,
    size = 'md',
    color = 'primary',
    variant = 'filled',
    radius = 'sm',
    children,
    className,
    style,
    ...props
}: ThemeIconProps) {
    const sizeClass = typeof size === 'number' ? '' : sizeMap[size];
    const sizeStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : {};

    return (
        <div
            className={cn(
                'inline-flex items-center justify-center',
                sizeClass,
                radiusMap[radius],
                variantMap[variant][color],
                className
            )}
            style={{ ...sizeStyle, ...style }}
            {...props}
        >
            {/* TODO: Convert icon prop to use HugeiconsIcon component - needs refactoring */}
            {children}
        </div>
    );
}
