import React, { useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick01Icon, Edit01Icon, ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
// Button import removed as it is no longer used for 'Continue'

interface SectionCardProps {
    /** Section index (0-3) */
    index: number;
    /** Section title */
    title: string;
    /** Whether this section is completed */
    isCompleted: boolean;
    /** Whether this section is currently active */
    isActive: boolean;
    /** Whether this section is locked (disabled visually) */
    isLocked: boolean;
    /** Summary component to show when collapsed */
    summary?: React.ReactNode;
    /** Form content */
    children: React.ReactNode;
    /** Handler when user clicks to toggle/edit/activate this section */
    onToggle?: () => void;
    /** Validation errors for this section */
    hasErrors?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({
    index,
    title,
    isCompleted,
    isActive,
    isLocked,
    summary,
    children,
    onToggle,
    hasErrors = false
}) => {
    const cardRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to this section when it becomes active
    useEffect(() => {
        if (isActive && cardRef.current) {
            setTimeout(() => {
                cardRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center' // Center aligns better for keyboard/focus
                });
            }, 300);
        }
    }, [isActive]);

    // Case 1: Active Section (Expanded Form)
    if (isActive) {
        return (
            <div
                ref={cardRef}
                className={cn(
                    "mb-4 rounded-lg border bg-white shadow-sm ring-1 ring-black/5 transition-all overflow-hidden",
                    hasErrors ? "border-red-300 ring-red-100" : "border-purple-200 ring-purple-500/10"
                )}
            >
                <div className="p-4">
                    {/* Section Header - Static when active */}
                    <div
                        className="flex items-center gap-4 mb-3 pb-2.5 border-b border-gray-100 cursor-pointer"
                        onClick={onToggle} // Allow clicking header to collapse/validate? Or just for consistency
                    >
                        <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-sm transition-colors",
                            hasErrors ? "bg-red-50 text-red-600" : "bg-purple-600 text-white"
                        )}>
                            {index + 1}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 tracking-tight">{title}</h3>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="space-y-4 animate-fade-in">
                        {children}
                    </div>

                    {/* No Continue Button - User clicks the next section manually */}
                </div>
            </div>
        );
    }

    // Case 2: Completed Section (Summary)
    if (isCompleted) {
        return (
            <div
                ref={cardRef}
                onClick={onToggle}
                className={cn(
                    "mb-4 group rounded-lg border border-gray-200 bg-white transition-all cursor-pointer",
                    "hover:border-purple-200 hover:shadow-sm"
                )}
            >
                <div className="p-5">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 flex-shrink-0 mt-0.5">
                                <HugeiconsIcon icon={Tick01Icon} size={18} className="stroke-2" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors mb-1">{title}</h3>
                                <div className="text-sm text-gray-600">
                                    {summary}
                                </div>
                            </div>
                        </div>

                        <button className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-purple-600 transition-all p-2 -mr-2">
                            <HugeiconsIcon icon={Edit01Icon} size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Case 3: Pending/Locked Section (Collapsed Header)
    // We combine the visual style but keep isLocked logic for interactivity if needed,
    // though we allow clicking to trigger validation of previous steps.
    return (
        <div
            ref={cardRef}
            onClick={!isLocked ? onToggle : undefined}
            className={cn(
                "mb-4 rounded-lg border transition-all duration-200",
                isLocked
                    ? "border-gray-100 bg-gray-50/50 opacity-60 cursor-not-allowed"
                    : "border-gray-200 bg-white hover:border-purple-200 hover:shadow-sm cursor-pointer group"
            )}
        >
            <div className="flex items-center gap-4 p-5">
                <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    isLocked
                        ? "bg-gray-200 text-gray-500"
                        : "bg-gray-100 text-gray-600 group-hover:bg-purple-50 group-hover:text-purple-600"
                )}>
                    {index + 1}
                </div>
                <div className="flex-1">
                    <h3 className={cn(
                        "text-sm font-medium transition-colors",
                        isLocked ? "text-gray-400" : "text-gray-900 group-hover:text-purple-700"
                    )}>
                        {title}
                    </h3>
                </div>
                {!isLocked && (
                    <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        size={20}
                        className="text-gray-400 group-hover:text-purple-500"
                    />
                )}
            </div>
        </div>
    );
};
