import React from 'react';
import { cn } from '@/lib/utils';

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Input label */
    label?: string;
    /** Error message */
    error?: string;
    /** Description text */
    description?: string;
    /** Whether input is required */
    required?: boolean;
    /** Left section content (icon, etc.) */
    leftSection?: React.ReactNode;
    /** Right section content */
    rightSection?: React.ReactNode;
    /** Input size */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Border radius */
    radius?: number;
    /** Whether input is disabled */
    disabled?: boolean;
    /** Input wrapper className */
    wrapperClassName?: string;
}

const sizeMap = {
    xs: 'px-2 py-1 text-xs h-7',
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-3 py-2 text-sm h-9',
    lg: 'px-4 py-2.5 text-base h-10',
    xl: 'px-5 py-3 text-base h-11',
};

/**
 * TextInput component - text input field
 * Replaces Mantine TextInput
 */
export function TextInput({
    label,
    error,
    description,
    required,
    leftSection,
    rightSection,
    size = 'md',
    radius = 0,
    disabled,
    className,
    wrapperClassName,
    ...props
}: TextInputProps) {
    return (
        <div className={cn('w-full', wrapperClassName)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </label>
            )}
            {description && (
                <p className="text-xs text-gray-500 mb-1">{description}</p>
            )}
            <div className="relative">
                {leftSection && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        {leftSection}
                    </div>
                )}
                <input
                    className={cn(
                        'w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                        'transition-colors rounded',
                        sizeMap[size],
                        leftSection && 'pl-10',
                        rightSection && 'pr-10',
                        error && 'border-destructive focus:ring-red-500',
                        disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
                        className
                    )}
                    disabled={disabled}
                    {...props}
                />
                {rightSection && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                        {rightSection}
                    </div>
                )}
            </div>
            {error && (
                <p className="text-xs text-destructive mt-1">{error}</p>
            )}
        </div>
    );
}

