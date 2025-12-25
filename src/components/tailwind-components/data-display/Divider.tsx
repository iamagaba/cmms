import React from 'react';
import { cn } from '@/lib/utils';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
    /** Divider orientation */
    orientation?: 'horizontal' | 'vertical';
    /** Divider size (thickness) */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Divider color */
    color?: 'gray' | 'primary';
    /** Label to display */
    label?: string;
    /** Label position */
    labelPosition?: 'left' | 'center' | 'right';
    className?: string;
}

const sizeMap = {
    horizontal: {
        xs: 'border-t',
        sm: 'border-t-2',
        md: 'border-t-4',
        lg: 'border-t-8',
        xl: 'border-t-12',
    },
    vertical: {
        xs: 'border-l',
        sm: 'border-l-2',
        md: 'border-l-4',
        lg: 'border-l-8',
        xl: 'border-l-12',
    },
};

const colorMap = {
    gray: 'border-gray-200',
    primary: 'border-primary-200',
};

/**
 * Divider component - visual separator
 * Replaces Mantine Divider
 */
export function Divider({
    orientation = 'horizontal',
    size = 'xs',
    color = 'gray',
    label,
    labelPosition = 'center',
    className,
    ...props
}: DividerProps) {
    if (label && orientation === 'horizontal') {
        const labelPositionMap = {
            left: 'justify-start',
            center: 'justify-center',
            right: 'justify-end',
        };

        return (
            <div className={cn('flex items-center', labelPositionMap[labelPosition], className)}>
                {labelPosition !== 'left' && (
                    <div className={cn('flex-1', sizeMap.horizontal[size], colorMap[color])} />
                )}
                <span className="px-3 text-sm text-gray-500">{label}</span>
                {labelPosition !== 'right' && (
                    <div className={cn('flex-1', sizeMap.horizontal[size], colorMap[color])} />
                )}
            </div>
        );
    }

    if (orientation === 'vertical') {
        return (
            <div
                className={cn(
                    'inline-block h-full',
                    sizeMap.vertical[size],
                    colorMap[color],
                    className
                )}
                {...props}
            />
        );
    }

    return (
        <hr
            className={cn(
                sizeMap.horizontal[size],
                colorMap[color],
                className
            )}
            {...props}
        />
    );
}
