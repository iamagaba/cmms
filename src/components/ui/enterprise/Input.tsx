/**
 * Enterprise Input Component
 * 
 * Standardized input field that enforces the enterprise design system:
 * - Height: h-9 (36px) - consistent density
 * - Corners: rounded-md - sharp, professional
 * - Border: border-gray-200 - subtle separation
 * - Focus: ring-1 ring-purple-600 - clear interaction state
 * 
 * Usage:
 * <Input placeholder="Search..." />
 * <Input type="email" value={email} onChange={setEmail} />
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Additional CSS classes */
  className?: string;
  /** Icon to display on the left side */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right side */
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            // Base styles - Enterprise standard with density support
            'w-full rounded-md border border-gray-200 bg-white text-sm shadow-sm transition-colors',
            // Height - density-aware using CSS variable
            '[height:var(--density-input-height)]',
            // Padding - adjust for icons
            leftIcon ? 'pl-8 pr-3' : rightIcon ? 'pl-3 pr-8' : 'px-3',
            'py-1.5',
            // Placeholder
            'placeholder:text-gray-400',
            // Focus state
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600 focus-visible:border-purple-600',
            // Disabled state
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
            // Hover state
            'hover:border-gray-300',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
