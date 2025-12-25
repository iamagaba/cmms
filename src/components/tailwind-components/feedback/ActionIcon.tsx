import React from 'react';
import { cn } from '@/lib/utils';

export interface ActionIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Icon button variant */
    variant?: 'filled' | 'light' | 'outline' | 'subtle' | 'transparent';
    /** Icon button color */
    color?: 'primary' | 'gray' | 'red' | 'green' | 'blue';
    /** Icon button size */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Border radius */
    radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    children: React.ReactNode;
    className?: string;
}

const sizeMap = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-14 h-14 text-xl',
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
        primary: 'bg-primary-500 text-white hover:bg-primary-600',
        gray: 'bg-gray-500 text-white hover:bg-gray-600',
        red: 'bg-red-500 text-white hover:bg-red-600',
        green: 'bg-green-500 text-white hover:bg-green-600',
        blue: 'bg-blue-500 text-white hover:bg-blue-600',
    },
    light: {
        primary: 'bg-primary-50 text-primary-700 hover:bg-primary-100',
        gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        red: 'bg-red-50 text-red-700 hover:bg-red-100',
        green: 'bg-green-50 text-green-700 hover:bg-green-100',
        blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    },
    outline: {
        primary: 'border border-primary-500 text-primary-500 hover:bg-primary-50',
        gray: 'border border-gray-500 text-gray-500 hover:bg-gray-50',
        red: 'border border-red-500 text-red-500 hover:bg-red-50',
        green: 'border border-green-500 text-green-500 hover:bg-green-50',
        blue: 'border border-blue-500 text-blue-500 hover:bg-blue-50',
    },
    subtle: {
        primary: 'text-primary-600 hover:bg-primary-50',
        gray: 'text-gray-600 hover:bg-gray-50',
        red: 'text-red-600 hover:bg-red-50',
        green: 'text-green-600 hover:bg-green-50',
        blue: 'text-blue-600 hover:bg-blue-50',
    },
    transparent: {
        primary: 'text-primary-600 hover:bg-primary-50/50',
        gray: 'text-gray-600 hover:bg-gray-50/50',
        red: 'text-red-600 hover:bg-red-50/50',
        green: 'text-green-600 hover:bg-green-50/50',
        blue: 'text-blue-600 hover:bg-blue-50/50',
    },
};

/**
 * ActionIcon component - icon button
 * Replaces Mantine ActionIcon
 */
export function ActionIcon({
    variant = 'subtle',
    color = 'gray',
    size = 'md',
    radius = 'sm',
    children,
    className,
    ...props
}: ActionIconProps) {
    return (
        <button
            className={cn(
                'inline-flex items-center justify-center transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                sizeMap[size],
                radiusMap[radius],
                variantMap[variant][color],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
