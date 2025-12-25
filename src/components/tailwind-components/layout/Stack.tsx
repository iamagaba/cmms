import React from 'react';
import { cn } from '@/lib/utils';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Spacing between children */
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    /** Alignment of children */
    align?: 'start' | 'center' | 'end' | 'stretch';
    /** Justify content */
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
    children: React.ReactNode;
    className?: string;
}

const gapMap = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
};

const alignMap = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
};

const justifyMap = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
};

/**
 * Stack component - vertical flex container
 * Replaces Mantine Stack
 */
export function Stack({
    gap = 'md',
    align = 'stretch',
    justify = 'start',
    children,
    className,
    ...props
}: StackProps) {
    const gapClass = typeof gap === 'number' ? `gap-[${gap}px]` : gapMap[gap];

    return (
        <div
            className={cn(
                'flex flex-col',
                gapClass,
                alignMap[align],
                justifyMap[justify],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
