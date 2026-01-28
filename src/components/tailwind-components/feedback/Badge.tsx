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

// Industrial sizing - more compact with uppercase
const sizeMap = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-xs',
    xl: 'px-4 py-1 text-sm',
};

// Industrial radius - sharper corners
const radiusMap = {
    xs: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded',
    lg: 'rounded',
    xl: 'rounded-md',
    full: 'rounded-full',
};

// Industrial color variants - with borders for definition
const variantMap = {
    filled: {
        primary: 'bg-purple-600 text-white border border-purple-700',
        gray: 'bg-slate-500 text-white border border-slate-600',
        red: 'bg-red-600 text-white border border-red-700',
        green: 'bg-green-600 text-white border border-green-700',
        blue: 'bg-blue-600 text-white border border-blue-700',
        yellow: 'bg-amber-500 text-white border border-amber-600',
        orange: 'bg-orange-500 text-white border border-orange-600',
    },
    light: {
        primary: 'bg-purple-50 text-purple-700 border border-purple-300',
        gray: 'bg-slate-50 text-slate-700 border border-slate-300',
        red: 'bg-red-50 text-red-700 border border-red-300',
        green: 'bg-green-50 text-green-700 border border-green-300',
        blue: 'bg-blue-50 text-blue-700 border border-blue-300',
        yellow: 'bg-amber-50 text-amber-700 border border-amber-300',
        orange: 'bg-orange-50 text-orange-700 border border-orange-300',
    },
    outline: {
        primary: 'border-2 border-purple-500 text-purple-600 bg-transparent',
        gray: 'border-2 border-slate-400 text-slate-600 bg-transparent',
        red: 'border-2 border-red-500 text-red-600 bg-transparent',
        green: 'border-2 border-green-500 text-green-600 bg-transparent',
        blue: 'border-2 border-blue-500 text-blue-600 bg-transparent',
        yellow: 'border-2 border-amber-500 text-amber-600 bg-transparent',
        orange: 'border-2 border-orange-500 text-orange-600 bg-transparent',
    },
    dot: {
        primary: 'bg-purple-50 text-purple-700 border border-purple-200',
        gray: 'bg-slate-50 text-slate-700 border border-slate-200',
        red: 'bg-red-50 text-red-700 border border-red-200',
        green: 'bg-green-50 text-green-700 border border-green-200',
        blue: 'bg-blue-50 text-blue-700 border border-blue-200',
        yellow: 'bg-amber-50 text-amber-700 border border-amber-200',
        orange: 'bg-orange-50 text-orange-700 border border-orange-200',
    },
};

/**
 * Badge component - Industrial style small label for status or category
 * Features: uppercase text, sharper corners, defined borders
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
                'inline-flex items-center font-bold uppercase tracking-wide',
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

