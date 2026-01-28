
import React from "react";
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatRibbonProps {
    stats: Array<{
        title: string;
        value: string | number;
        subtitle?: string;
        icon: LucideIcon;
        color: 'primary' | 'emerald' | 'amber' | 'red';
        onClick?: () => void;
    }>;
}

export const StatRibbon: React.FC<StatRibbonProps> = ({ stats }) => {
    const getIconColorClass = (color: string) => {
        switch (color) {
            case 'primary': return 'text-primary';
            case 'emerald': return 'text-success';
            case 'amber': return 'text-warning';
            case 'red': return 'text-destructive';
            default: return 'text-muted-foreground';
        }
    };

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 divide-x divide-border">
                {stats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                        <div
                            key={index}
                            className={cn(
                                'p-4 hover:bg-accent transition-colors group',
                                stat.onClick && 'cursor-pointer'
                            )}
                            onClick={stat.onClick}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <IconComponent
                                            className={cn('w-4 h-4', getIconColorClass(stat.color))}
                                        />
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
                                    <ArrowRight
                                        className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

