import { ReactNode, HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
    direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
    w?: string | number;
    h?: string | number;
}

export const Flex = forwardRef<HTMLDivElement, FlexProps>(({
    children,
    className,
    gap,
    align,
    justify,
    direction,
    wrap,
    style,
    w,
    h,
    ...props
}, ref) => {
    const gapSize = typeof gap === 'number' ? gap :
        gap === 'xs' ? '0.5rem' :
            gap === 'sm' ? '0.75rem' :
                gap === 'md' ? '1rem' :
                    gap === 'lg' ? '1.5rem' :
                        gap === 'xl' ? '2rem' : undefined;

    const alignClasses = {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        baseline: 'items-baseline',
        stretch: 'items-stretch',
    };

    const justifyClasses = {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
    };

    const directionClasses = {
        row: 'flex-row',
        column: 'flex-col',
        'row-reverse': 'flex-row-reverse',
        'column-reverse': 'flex-col-reverse',
    };

    const wrapClasses = {
        nowrap: 'flex-nowrap',
        wrap: 'flex-wrap',
        'wrap-reverse': 'flex-wrap-reverse',
    };

    const customStyle = {
        ...style,
        gap: gapSize,
        width: w,
        height: h
    };

    return (
        <div
            ref={ref}
            className={twMerge(
                'flex',
                align && alignClasses[align],
                justify && justifyClasses[justify],
                direction && directionClasses[direction],
                wrap && wrapClasses[wrap],
                className
            )}
            style={customStyle}
            {...props}
        >
            {children}
        </div>
    );
});

Flex.displayName = 'Flex';
