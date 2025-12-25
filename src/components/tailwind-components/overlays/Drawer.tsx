import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';

export interface DrawerProps {
    /** Whether drawer is open */
    opened: boolean;
    /** Close handler */
    onClose: () => void;
    /** Drawer title */
    title?: string;
    /** Drawer position */
    position?: 'left' | 'right' | 'top' | 'bottom';
    /** Drawer size */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | string | number;
    /** Whether to show close button */
    withCloseButton?: boolean;
    /** Whether clicking overlay closes drawer */
    closeOnClickOutside?: boolean;
    /** Whether pressing Escape closes drawer */
    closeOnEscape?: boolean;
    /** Drawer content */
    children: React.ReactNode;
    /** Additional className for drawer content */
    className?: string;
}

const sizeMap = {
    xs: '256px',
    sm: '320px',
    md: '384px',
    lg: '512px',
    xl: '640px',
    full: '100%',
};

/**
 * Drawer component - slide-out panel
 * Replaces Mantine Drawer
 */
export function Drawer({
    opened,
    onClose,
    title,
    position = 'right',
    size = 'md',
    withCloseButton = true,
    closeOnClickOutside = true,
    closeOnEscape = true,
    children,
    className,
}: DrawerProps) {
    useEffect(() => {
        if (!opened) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (closeOnEscape && e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [opened, closeOnEscape, onClose]);

    if (!opened) return null;

    const sizeValue = typeof size === 'number' ? `${size}px` : (sizeMap[size as keyof typeof sizeMap] || size);

    const positionStyles = {
        left: { left: 0, top: 0, bottom: 0, width: sizeValue },
        right: { right: 0, top: 0, bottom: 0, width: sizeValue },
        top: { top: 0, left: 0, right: 0, height: sizeValue },
        bottom: { bottom: 0, left: 0, right: 0, height: sizeValue },
    };

    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={closeOnClickOutside ? onClose : undefined}
            />

            {/* Drawer */}
            <div
                className={cn(
                    'absolute bg-white shadow-xl flex flex-col',
                    className
                )}
                style={positionStyles[position]}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {(title || withCloseButton) && (
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                        {title && <h2 className="text-lg font-semibold">{title}</h2>}
                        {withCloseButton && (
                            <button
                                onClick={onClose}
                                className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <Icon icon="mdi:close" width={24} height={24} />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">{children}</div>
            </div>
        </div>
    );
}
