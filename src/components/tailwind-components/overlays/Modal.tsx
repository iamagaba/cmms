import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

export interface ModalProps {
    /** Whether modal is open */
    opened: boolean;
    /** Close handler */
    onClose: () => void;
    /** Modal title */
    title?: string;
    /** Modal size */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /** Whether to show close button */
    withCloseButton?: boolean;
    /** Whether clicking overlay closes modal */
    closeOnClickOutside?: boolean;
    /** Whether pressing Escape closes modal */
    closeOnEscape?: boolean;
    /** Modal content */
    children: React.ReactNode;
    /** Additional className for modal content */
    className?: string;
}

const sizeMap = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
};

/**
 * Modal component - overlay dialog
 * Replaces Mantine Modal
 */
export function Modal({
    opened,
    onClose,
    title,
    size = 'md',
    withCloseButton = true,
    closeOnClickOutside = true,
    closeOnEscape = true,
    children,
    className,
}: ModalProps) {
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={closeOnClickOutside ? onClose : undefined}
            />

            {/* Modal */}
            <div
                className={cn(
                    'relative bg-white rounded-lg shadow-xl w-full mx-4',
                    sizeMap[size],
                    className
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {(title || withCloseButton) && (
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        {title && <h2 className="text-lg font-semibold">{title}</h2>}
                        {withCloseButton && (
                            <button
                                onClick={onClose}
                                className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <HugeiconsIcon icon={Cancel01Icon} size={24} />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
}
