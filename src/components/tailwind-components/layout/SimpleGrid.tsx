import React from 'react';
import { cn } from '@/lib/utils';

export interface SimpleGridProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Number of columns */
    cols?: number | { base?: number; sm?: number; md?: number; lg?: number; xl?: number };
    /** Spacing between items */
    spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    /** Vertical spacing */
    verticalSpacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    children: React.ReactNode;
    className?: string;
}

const spacingMap = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
};

/**
 * SimpleGrid component - responsive grid layout
 * Replaces Mantine SimpleGrid
 */
export function SimpleGrid({
    cols = 1,
    spacing = 'md',
    verticalSpacing,
    children,
    className,
    ...props
}: SimpleGridProps) {
    const spacingClass = typeof spacing === 'number' ? `gap-[${spacing}px]` : spacingMap[spacing];
    const verticalSpacingClass = verticalSpacing
        ? (typeof verticalSpacing === 'number' ? `gap-y-[${verticalSpacing}px]` : spacingMap[verticalSpacing])
        : '';

    // Handle responsive columns
    let colsClass = '';
    if (typeof cols === 'number') {
        colsClass = `grid-cols-${cols}`;
    } else {
        const { base = 1, sm, md, lg, xl } = cols;
        colsClass = cn(
            `grid-cols-${base}`,
            sm && `sm:grid-cols-${sm}`,
            md && `md:grid-cols-${md}`,
            lg && `lg:grid-cols-${lg}`,
            xl && `xl:grid-cols-${xl}`
        );
    }

    return (
        <div
            className={cn(
                'grid',
                colsClass,
                spacingClass,
                verticalSpacingClass,
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
