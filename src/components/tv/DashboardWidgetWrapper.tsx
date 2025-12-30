
import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { MoreVerticalIcon, Cancel01Icon, Menu01Icon } from '@hugeicons/core-free-icons';

interface DashboardWidgetWrapperProps {
    children: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
    onMouseDown?: React.MouseEventHandler;
    onMouseUp?: React.MouseEventHandler;
    onTouchEnd?: React.TouchEventHandler;
    isEditMode: boolean;
    onRemove?: () => void;
    title?: string;
}

export const DashboardWidgetWrapper = React.forwardRef<HTMLDivElement, DashboardWidgetWrapperProps>(
    ({ children, style, className, onMouseDown, onMouseUp, onTouchEnd, isEditMode, onRemove, title, ...props }, ref) => {
        return (
            <div
                ref={ref}
                style={style}
                className={`${className} group relative h-full w-full bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden flex flex-col transition-all duration-300 ${isEditMode ? 'ring-2 ring-primary-500/50 hover:ring-primary-500 cursor-move' : ''}`}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onTouchEnd={onTouchEnd}
                {...props}
            >
                {/* Header (Only visible if title provided or in edit mode) */}
                {(title || isEditMode) && (
                    <div className={`p-2 flex items-center justify-between ${isEditMode ? 'bg-neutral-100 dark:bg-neutral-700/50' : ''}`}>
                        {title && (
                            <div className="flex items-center gap-2 px-2">
                                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest pointer-events-none select-none">{title}</span>
                            </div>
                        )}

                        {isEditMode && (
                            <div className="flex items-center gap-2 ml-auto">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent drag start
                                        onRemove?.();
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="p-1 rounded-full bg-error-100 text-error-600 hover:bg-error-200 dark:bg-error-900/30 dark:text-error-400 dark:hover:bg-error-900/50 cursor-pointer transition-colors"
                                >
                                    <HugeiconsIcon icon={Cancel01Icon} size={16} />
                                </button>
                                <div className="cursor-grab active:cursor-grabbing p-1 text-neutral-400">
                                    <HugeiconsIcon icon={Menu01Icon} size={16} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-hidden relative">
                    {children}
                </div>

                {/* Resize Handle (added by react-grid-layout, but we can customize if needed) */}
            </div>
        );
    }
);

DashboardWidgetWrapper.displayName = 'DashboardWidgetWrapper';
