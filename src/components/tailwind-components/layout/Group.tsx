import React from 'react';
import { cn } from '@/lib/utils';

export interface GroupProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Spacing between children */
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    /** Alignment of children */
    align?: 'start' | 'center' | 'end' | 'stretch';
    /** Justify content */
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
    /** Whether to wrap children */
    wrap?: 'wrap' | 'nowrap';
    /** Whether to grow children to fill space */
    grow?: boolean;
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
 * Group component - horizontal flex container
 * Replaces Mantine Group
 */
export function Group({
    gap = 'md',
    align = 'center',
    justify = 'start',
    wrap = 'wrap',
    grow = false,
    children,
    className,
    ...props
}: GroupProps) {
    const gapClass = typeof gap === 'number' ? `gap-[${gap}px]` : gapMap[gap];

    return (
        <div
            className={cn(
                'flex',
                gapClass,
                alignMap[align],
                justifyMap[justify],
                wrap === 'wrap' ? 'flex-wrap' : 'flex-nowrap',
                grow && '[&>*]:flex-1',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
