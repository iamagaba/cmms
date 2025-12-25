import React from 'react';
import { cn } from '@/lib/utils';

export interface SegmentedControlItem {
    value: string;
    label: React.ReactNode;
    disabled?: boolean;
}

export interface SegmentedControlProps {
    /** Current value */
    value: string;
    /** Change handler */
    onChange: (value: string) => void;
    /** Control items */
    data: SegmentedControlItem[] | string[];
    /** Control size */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Whether control is disabled */
    disabled?: boolean;
    /** Additional className */
    className?: string;
}

const sizeMap = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
    xl: 'px-6 py-4 text-xl',
};

/**
 * SegmentedControl component - segmented button group
 * Replaces Mantine SegmentedControl
 */
export function SegmentedControl({
    value,
    onChange,
    data,
    size = 'md',
    disabled,
    className,
}: SegmentedControlProps) {
    const items: SegmentedControlItem[] = data.map(item =>
        typeof item === 'string' ? { value: item, label: item } : item
    );

    return (
        <div className={cn('inline-flex bg-gray-100 p-1 rounded-lg', className)}>
            {items.map((item) => (
                <button
                    key={item.value}
                    type="button"
                    onClick={() => !item.disabled && !disabled && onChange(item.value)}
                    disabled={item.disabled || disabled}
                    className={cn(
                        'transition-all duration-200',
                        sizeMap[size],
                        'rounded-md font-medium',
                        value === item.value
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900',
                        (item.disabled || disabled) && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}
