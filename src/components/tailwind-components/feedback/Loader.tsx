import React from 'react';
import { cn } from '@/lib/utils';

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Loader size */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    /** Loader color */
    color?: 'primary' | 'gray' | 'white';
    /** Loader variant */
    variant?: 'oval' | 'dots' | 'bars';
    className?: string;
}

const sizeMap = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
};

const colorMap = {
    primary: 'text-primary-500',
    gray: 'text-gray-500',
    white: 'text-white',
};

/**
 * Loader component - loading spinner
 * Replaces Mantine Loader
 */
export function Loader({
    size = 'md',
    color = 'primary',
    variant = 'oval',
    className,
    ...props
}: LoaderProps) {
    const sizeClass = typeof size === 'number' ? '' : sizeMap[size];
    const sizeStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : {};

    if (variant === 'oval') {
        return (
            <div
                className={cn('inline-block', className)}
                style={sizeStyle}
                {...props}
            >
                <svg
                    className={cn('animate-spin', sizeClass, colorMap[color])}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            </div>
        );
    }

    if (variant === 'dots') {
        return (
            <div className={cn('flex gap-1', className)} {...props}>
                <div className={cn('rounded-full bg-current animate-bounce', sizeClass, colorMap[color])} style={{ animationDelay: '0ms' }} />
                <div className={cn('rounded-full bg-current animate-bounce', sizeClass, colorMap[color])} style={{ animationDelay: '150ms' }} />
                <div className={cn('rounded-full bg-current animate-bounce', sizeClass, colorMap[color])} style={{ animationDelay: '300ms' }} />
            </div>
        );
    }

    return (
        <div className={cn('flex gap-1', className)} {...props}>
            <div className={cn('w-1 bg-current animate-pulse', sizeClass, colorMap[color])} style={{ animationDelay: '0ms' }} />
            <div className={cn('w-1 bg-current animate-pulse', sizeClass, colorMap[color])} style={{ animationDelay: '150ms' }} />
            <div className={cn('w-1 bg-current animate-pulse', sizeClass, colorMap[color])} style={{ animationDelay: '300ms' }} />
        </div>
    );
}
