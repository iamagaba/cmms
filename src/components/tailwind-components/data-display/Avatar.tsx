import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Avatar source URL */
    src?: string;
    /** Alt text */
    alt?: string;
    /** Avatar size */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    /** Border radius */
    radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /** Avatar color for placeholder */
    color?: 'primary' | 'gray' | 'red' | 'green' | 'blue';
    /** Initials to show if no image */
    children?: React.ReactNode;
    className?: string;
}

const sizeMap = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
};

const radiusMap = {
    xs: 'rounded-sm',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
};

const colorMap = {
    primary: 'bg-primary-500 text-white',
    gray: 'bg-gray-500 text-white',
    red: 'bg-red-500 text-white',
    green: 'bg-green-500 text-white',
    blue: 'bg-blue-500 text-white',
};

/**
 * Avatar component - user profile image or initials
 * Replaces Mantine Avatar
 */
export function Avatar({
    src,
    alt,
    size = 'md',
    radius = 'full',
    color = 'primary',
    children,
    className,
    style,
    ...props
}: AvatarProps) {
    const sizeClass = typeof size === 'number' ? '' : sizeMap[size];
    const sizeStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : {};

    if (src) {
        return (
            <div
                className={cn(
                    'inline-flex items-center justify-center overflow-hidden',
                    sizeClass,
                    radiusMap[radius],
                    className
                )}
                style={{ ...sizeStyle, ...style }}
                {...props}
            >
                <img src={src} alt={alt || ''} className="w-full h-full object-cover" />
            </div>
        );
    }

    return (
        <div
            className={cn(
                'inline-flex items-center justify-center font-medium',
                sizeClass,
                radiusMap[radius],
                colorMap[color],
                className
            )}
            style={{ ...sizeStyle, ...style }}
            {...props}
        >
            {children}
        </div>
    );
}
