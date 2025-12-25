import React from 'react';
import { cn } from '@/lib/utils';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Number of columns */
    cols?: number;
    /** Spacing between items */
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    /** Vertical spacing */
    gutter?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    /** Whether to grow items to fill space */
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

/**
 * Grid component - CSS grid layout
 * Replaces Mantine Grid
 */
export function Grid({
    cols = 12,
    gap = 'md',
    gutter,
    grow = false,
    children,
    className,
    ...props
}: GridProps) {
    const gapClass = typeof gap === 'number' ? `gap-[${gap}px]` : gapMap[gap];
    const gutterClass = gutter ? (typeof gutter === 'number' ? `gap-y-[${gutter}px]` : gapMap[gutter]) : '';

    return (
        <div
            className={cn(
                'grid',
                `grid-cols-${cols}`,
                gapClass,
                gutterClass,
                grow && '[&>*]:h-full',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export interface GridColProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Column span */
    span?: number;
    /** Column offset */
    offset?: number;
    children: React.ReactNode;
    className?: string;
}

/**
 * Grid.Col component - grid column
 * Replaces Mantine Grid.Col
 */
export function GridCol({
    span = 1,
    offset = 0,
    children,
    className,
    ...props
}: GridColProps) {
    return (
        <div
            className={cn(
                `col-span-${span}`,
                offset > 0 && `col-start-${offset + 1}`,
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

Grid.Col = GridCol;
