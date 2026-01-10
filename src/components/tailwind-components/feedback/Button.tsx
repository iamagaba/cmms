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
    xs: 'px-2 py-0.5 text-[10px] h-6',
    sm: 'px-2.5 py-1 text-xs h-7',
    md: 'px-4 py-2 text-sm h-9',
    lg: 'px-5 py-2.5 text-base h-10',
    xl: 'px-6 py-3 text-base h-11',
};

const variantMap = {
    filled: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
        gray: 'bg-gray-500 text-white hover:bg-gray-600 active:bg-gray-700',
        red: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
        green: 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700',
        blue: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
        yellow: 'bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700',
    },
    outline: {
        primary: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
        gray: 'border-2 border-gray-500 text-gray-500 hover:bg-gray-50',
        red: 'border-2 border-red-500 text-red-500 hover:bg-red-50',
        green: 'border-2 border-green-500 text-green-500 hover:bg-green-50',
        blue: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50',
        yellow: 'border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-50',
    },
    light: {
        primary: 'bg-primary-50 text-primary-700 hover:bg-primary-100',
        gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        red: 'bg-red-50 text-red-700 hover:bg-red-100',
        green: 'bg-green-50 text-green-700 hover:bg-green-100',
        blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
        yellow: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
    },
    subtle: {
        primary: 'text-primary-600 hover:bg-primary-50',
        gray: 'text-gray-600 hover:bg-gray-50',
        red: 'text-red-600 hover:bg-red-50',
        green: 'text-green-600 hover:bg-green-50',
        blue: 'text-blue-600 hover:bg-blue-50',
        yellow: 'text-yellow-600 hover:bg-yellow-50',
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
