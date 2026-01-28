import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
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
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
    xl: 'px-6 py-4 text-xl',
};

/**
 * PasswordInput component - password input field with visibility toggle
 * Replaces Mantine PasswordInput
 */
export function PasswordInput({
    label,
    error,
    description,
    required,
    leftSection,
    size = 'md',
    radius = 0,
    disabled,
    className,
    wrapperClassName,
    ...props
}: PasswordInputProps) {
    const [visible, setVisible] = useState(false);

    return (
        <div className={cn('w-full', wrapperClassName)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
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
                    type={visible ? 'text' : 'password'}
                    className={cn(
                        'w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                        'transition-colors pr-10',
                        sizeMap[size],
                        leftSection && 'pl-10',
                        error && 'border-red-500 focus:ring-red-500',
                        disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
                        radius === 0 ? 'rounded-none' : `rounded-${radius}`,
                        className
                    )}
                    disabled={disabled}
                    {...props}
                />
                <button
                    type="button"
                    onClick={() => setVisible(!visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                >
                    {visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
            </div>
            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
}
