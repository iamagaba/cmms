import { CheckCircle, Info, X } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';



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
        red: 'bg-destructive text-white border-destructive',
        green: 'bg-emerald-500 text-white border-emerald-600',
        blue: 'bg-blue-500 text-white border-blue-600',
        yellow: 'bg-amber-500 text-white border-amber-600',
        orange: 'bg-orange-500 text-white border-orange-600',
    },
    light: {
        primary: 'bg-primary-50 text-primary-900 border-primary-200',
        red: 'bg-destructive/10 text-destructive border-destructive/20',
        green: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        blue: 'bg-muted text-blue-900 border-blue-200',
        yellow: 'bg-amber-50 text-amber-900 border-amber-200',
        orange: 'bg-muted text-orange-900 border-orange-200',
    },
    outline: {
        primary: 'bg-white text-primary-900 border-primary-500',
        red: 'bg-white text-destructive border-destructive',
        green: 'bg-white text-emerald-900 border-emerald-500',
        blue: 'bg-white text-blue-900 border-blue-500',
        yellow: 'bg-white text-amber-900 border-amber-500',
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
                {/* TODO: Convert icon prop to use HugeiconsIcon component - needs refactoring */}
                {icon && (
                    <div className="flex-shrink-0">
                        {/* Icon prop temporarily disabled */}
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
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}


