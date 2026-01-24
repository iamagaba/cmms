
import React from "react";
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';

interface StatRibbonProps {
    stats: Array<{
        title: string;
        value: string | number;
        subtitle?: string;
        icon: IconSvgElement;
        color: 'primary' | 'emerald' | 'amber' | 'red';
        onClick?: () => void;
    }>;
}

export const StatRibbon: React.FC<StatRibbonProps> = ({ stats }) => {
    const getIconColorClass = (color: string) => {
        switch (color) {
            case 'primary': return 'text-primary';
            case 'emerald': return 'text-emerald-600';
            case 'amber': return 'text-amber-600';
            case 'red': return 'text-red-600';
            default: return 'text-muted-foreground';
        }
    };

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={cn(
                            'p-4 hover:bg-accent transition-colors',
                            stat.onClick && 'cursor-pointer'
                        )}
                        onClick={stat.onClick}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <HugeiconsIcon
                                        icon={stat.icon}
                                        size={14}
                                        className={cn(getIconColorClass(stat.color))}
                                    />
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        {stat.title}
                                    </p>
                                </div>
                                <p className="text-2xl font-bold text-foreground">
                                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                                </p>
                                {stat.subtitle && (
                                    <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                                )}
                            </div>
                            {stat.onClick && (
                                <HugeiconsIcon
                                    icon={ArrowRight01Icon}
                                    size={14}
                                    className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
