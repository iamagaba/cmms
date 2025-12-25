import React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Alert variant */
    variant?: 'filled' | 'light' | 'outline';
    /** Alert color */
    color?: 'primary' | 'red' | 'green' | 'blue' | 'yellow' | 'orange';
    /** Alert title */
    title?: string;
    /** Icon to display */
    icon?: string;
    /** Whether alert can be closed */
    withCloseButton?: boolean;
    /** Close handler */
    onClose?: () => void;
    children: React.ReactNode;
    className?: string;
}

const variantMap = {
    filled: {
        primary: 'bg-primary-500 text-white border-primary-600',
        red: 'bg-red-500 text-white border-red-600',
        green: 'bg-green-500 text-white border-green-600',
        blue: 'bg-blue-500 text-white border-blue-600',
        yellow: 'bg-yellow-500 text-white border-yellow-600',
        orange: 'bg-orange-500 text-white border-orange-600',
    },
    light: {
        primary: 'bg-primary-50 text-primary-900 border-primary-200',
        red: 'bg-red-50 text-red-900 border-red-200',
        green: 'bg-green-50 text-green-900 border-green-200',
        blue: 'bg-blue-50 text-blue-900 border-blue-200',
        yellow: 'bg-yellow-50 text-yellow-900 border-yellow-200',
        orange: 'bg-orange-50 text-orange-900 border-orange-200',
    },
    outline: {
        primary: 'bg-white text-primary-900 border-primary-500',
        red: 'bg-white text-red-900 border-red-500',
        green: 'bg-white text-green-900 border-green-500',
        blue: 'bg-white text-blue-900 border-blue-500',
        yellow: 'bg-white text-yellow-900 border-yellow-500',
        orange: 'bg-white text-orange-900 border-orange-500',
    },
};

/**
 * Alert component - notification or message box
 * Replaces Mantine Alert
 */
export function Alert({
    variant = 'light',
    color = 'primary',
    title,
    icon,
    withCloseButton = false,
    onClose,
    children,
    className,
    ...props
}: AlertProps) {
    return (
        <div
            className={cn(
                'p-4 rounded-md border',
                variantMap[variant][color],
                className
            )}
            {...props}
        >
            <div className="flex">
                {icon && (
                    <div className="flex-shrink-0">
                        <Icon icon={icon} className="h-5 w-5" />
                    </div>
                )}
                <div className={cn('flex-1', icon && 'ml-3')}>
                    {title && (
                        <h3 className="text-sm font-medium mb-1">{title}</h3>
                    )}
                    <div className="text-sm">{children}</div>
                </div>
                {withCloseButton && onClose && (
                    <div className="ml-auto pl-3">
                        <button
                            onClick={onClose}
                            className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        >
                            <Icon icon="mdi:close" className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
