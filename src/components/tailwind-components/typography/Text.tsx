import React from 'react';
import { cn } from '@/lib/utils';

export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** Text size */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Font weight */
    fw?: number | 'normal' | 'bold';
    /** Text color - use 'dimmed' for muted text */
    c?: 'dimmed' | string;
    /** Text alignment */
    ta?: 'left' | 'center' | 'right';
    /** Text transform */
    tt?: 'uppercase' | 'lowercase' | 'capitalize';
    /** Line clamp */
    lineClamp?: number;
    /** Whether to truncate text */
    truncate?: boolean;
    /** Whether to render as span or div */
    component?: 'span' | 'div' | 'p';
    children: React.ReactNode;
    className?: string;
}

const sizeMap = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
};

const alignMap = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
};

const transformMap = {
    uppercase: 'uppercase',
    lowercase: 'lowercase',
    capitalize: 'capitalize',
};

/**
 * Text component - typography component for body text
 * Replaces Mantine Text
 */
export function Text({
    size = 'md',
    fw,
    c,
    ta,
    tt,
    lineClamp,
    truncate,
    component = 'span',
    children,
    className,
    style,
    ...props
}: TextProps) {
    const Component = component;

    const fontWeight = fw
        ? (typeof fw === 'number' ? { fontWeight: fw } : (fw === 'bold' ? { fontWeight: 700 } : {}))
        : {};

    const color = c === 'dimmed' ? 'text-gray-600' : (c ? `text-${c}` : '');

    const lineClampStyle = lineClamp ? {
        display: '-webkit-box',
        WebkitLineClamp: lineClamp,
        WebkitBoxOrient: 'vertical' as const,
        overflow: 'hidden',
    } : {};

    return (
        <Component
            className={cn(
                sizeMap[size],
                color,
                ta && alignMap[ta],
                tt && transformMap[tt],
                truncate && 'truncate',
                className
            )}
            style={{ ...fontWeight, ...lineClampStyle, ...style }}
            {...props}
        >
            {children}
        </Component>
    );
}
