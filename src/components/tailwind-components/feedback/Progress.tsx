import React from 'react';

export interface ProgressProps {
    value: number;
    max?: number;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    color?: 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'gray' | 'orange';
    radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    striped?: boolean;
    animated?: boolean;
    className?: string;
    label?: string;
}

const sizes = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
};

const colors = {
    blue: 'bg-blue-600',
    red: 'bg-destructive',
    green: 'bg-emerald-600',
    yellow: 'bg-amber-400',
    purple: 'bg-primary',
    gray: 'bg-gray-600',
    orange: 'bg-orange-500'
};

const radiusSizes = {
    xs: 'rounded-sm',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
};

export const Progress = ({
    value,
    max = 100,
    size = 'md',
    color = 'blue',
    radius = 'full',
    striped = false,
    animated = false,
    className = '',
    label,
}: ProgressProps) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className={`w-full bg-gray-200 ${radiusSizes[radius]} ${sizes[size]} dark:bg-gray-700 ${className}`}>
            <div
                className={`${colors[color] || 'bg-blue-600'} ${sizes[size]} ${radiusSizes[radius]} text-center p-0.5 leading-none font-medium text-blue-100 transition-all duration-500 ease-out`}
                style={{ width: `${percentage}%` }}
            >
                {label && <span className="text-xs absolute left-1/2 -translate-x-1/2">{label}</span>}
            </div>
        </div>
    );
};


