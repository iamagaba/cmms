import React, { useRef, useEffect } from 'react';
import { Check, Edit, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
                    "mb-2 rounded-lg border bg-white shadow-sm ring-1 ring-black/5 transition-colors overflow-hidden",
                    hasErrors ? "border-destructive/50 ring-destructive/10" : "border-primary/20 ring-primary/10"
                )}
            >
                <div className="p-3">
                    {/* Section Header - Static when active */}
                    <div
                        className="flex items-center gap-2 mb-2 pb-1.5 border-b border-border cursor-pointer"
                        onClick={onToggle} // Allow clicking header to collapse/validate? Or just for consistency
                    >
                        <div className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-sm transition-colors",
                            hasErrors ? "bg-destructive/10 text-destructive" : "bg-primary text-white"
                        )}>
                            {index + 1}
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="space-y-2 animate-fade-in">
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
                    "mb-2 group rounded-lg border border-border bg-white transition-colors hover:shadow-sm cursor-pointer",
                    "hover:border-primary/20"
                )}
            >
                <div className="p-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 flex-1">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 flex-shrink-0 mt-0.5">
                            <Check className="w-4 h-4 stroke-2" />
                        </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors mb-0.5">{title}</h3>
                                <div className="text-xs text-muted-foreground">
                                    {summary}
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 hover:text-primary h-8 w-8"
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
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
                "mb-2 rounded-lg border transition-colors duration-200 hover:shadow-sm",
                isLocked
                    ? "border-border bg-muted/50 opacity-60 cursor-not-allowed"
                    : "border-border bg-white hover:border-primary/20 cursor-pointer group"
            )}
        >
            <div className="flex items-center gap-2 p-3">
                <div className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isLocked
                        ? "bg-muted text-muted-foreground"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
                )}>
                    {index + 1}
                </div>
                <div className="flex-1">
                    <h3 className={cn(
                        "text-xs font-medium transition-colors",
                        isLocked ? "text-muted-foreground" : "text-foreground group-hover:text-primary"
                    )}>
                        {title}
                    </h3>
                </div>
                {!isLocked && (
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                )}
            </div>
        </div>
    );
};


