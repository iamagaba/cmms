import React from 'react';
import { cn } from '@/lib/utils';

export interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    /** Title order (h1-h6) */
    order?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Font weight */
    fw?: number;
    /** Text color */
    c?: string;
    /** Text alignment */
    ta?: 'left' | 'center' | 'right';
    children: React.ReactNode;
    className?: string;
}

const orderMap = {
    1: 'text-4xl font-bold',
    2: 'text-3xl font-bold',
    3: 'text-2xl font-semibold',
    4: 'text-xl font-semibold',
    5: 'text-lg font-medium',
    6: 'text-base font-medium',
};

const alignMap = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
};

/**
 * Title component - typography component for headings
 * Replaces Mantine Title
 */
export function Title({
    order = 1,
    fw,
    c,
    ta,
    children,
    className,
    style,
    ...props
}: TitleProps) {
    const Component = `h${order}` as keyof JSX.IntrinsicElements;

    const fontWeight = fw ? { fontWeight: fw } : {};
    const color = c ? `text-${c}` : '';

    return (
        <Component
            className={cn(
                orderMap[order],
                color,
                ta && alignMap[ta],
                className
            )}
            style={{ ...fontWeight, ...style }}
            {...props}
        >
            {children}
        </Component>
    );
}
