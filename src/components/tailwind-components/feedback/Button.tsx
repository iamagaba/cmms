import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Button variant */
    variant?: 'filled' | 'outline' | 'light' | 'subtle' | 'default';
    /** Button color */
    color?: 'primary' | 'gray' | 'red' | 'green' | 'blue' | 'yellow';
    /** Button size */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Whether button should take full width */
    fullWidth?: boolean;
    /** Loading state */
    loading?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Left section (icon) */
    leftSection?: React.ReactNode;
    /** Right section (icon) */
    rightSection?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

const sizeMap = {
    xs: 'px-2 py-0.5 text-xs h-6',
    sm: 'px-2.5 py-1 text-xs h-7',
    md: 'px-4 py-2 text-sm h-9',
    lg: 'px-5 py-2.5 text-base h-10',
    xl: 'px-6 py-3 text-base h-11',
};

const variantMap = {
    filled: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
        gray: 'bg-gray-500 text-white hover:bg-gray-600 active:bg-gray-700',
        red: 'bg-destructive text-white hover:bg-destructive active:bg-destructive',
        green: 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700',
        blue: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
        yellow: 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700',
    },
    outline: {
        primary: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
        gray: 'border-2 border-gray-500 text-gray-500 hover:bg-gray-50',
        red: 'border-2 border-destructive text-destructive hover:bg-destructive/5',
        green: 'border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-50',
        blue: 'border-2 border-blue-500 text-blue-500 hover:bg-muted',
        yellow: 'border-2 border-amber-500 text-amber-500 hover:bg-amber-50',
    },
    light: {
        primary: 'bg-primary-50 text-primary-700 hover:bg-primary-100',
        gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        red: 'bg-destructive/10 text-destructive hover:bg-destructive/10',
        green: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
        blue: 'bg-muted text-muted-foreground hover:bg-muted',
        yellow: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
    },
    subtle: {
        primary: 'text-primary-600 hover:bg-primary-50',
        gray: 'text-gray-600 hover:bg-gray-50',
        red: 'text-destructive hover:bg-destructive/5',
        green: 'text-emerald-600 hover:bg-emerald-50',
        blue: 'text-muted-foreground hover:bg-muted',
        yellow: 'text-amber-600 hover:bg-amber-50',
    },
    default: {
        primary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        gray: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        red: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        green: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        blue: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        yellow: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    },
};

/**
 * Button component - interactive button element
 * Replaces Mantine Button
 */
export function Button({
    variant = 'filled',
    color = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    leftSection,
    rightSection,
    children,
    className,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                'inline-flex items-center justify-center font-medium rounded transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                sizeMap[size],
                variantMap[variant][color],
                fullWidth && 'w-full',
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
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
            )}
            {!loading && leftSection && <span className="mr-1.5">{leftSection}</span>}
            {children}
            {rightSection && <span className="ml-1.5">{rightSection}</span>}
        </button>
    );
}


