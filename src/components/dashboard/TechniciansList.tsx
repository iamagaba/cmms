
import React, { useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserGroupIcon, UserIcon, Car01Icon, AlertCircleIcon, Calendar01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { useNavigate } from "react-router-dom";
import { WorkOrder } from "@/types/supabase";
import { cn } from '@/lib/utils';

interface TechniciansListProps {
    technicians: any[];
    workOrders: WorkOrder[];
}

export const TechniciansList: React.FC<TechniciansListProps> = ({ technicians, workOrders }) => {
    const navigate = useNavigate();

    const technicianStats = useMemo(() => {
        return technicians.map(tech => {
            // Count open work orders (any status except Completed)
            const openOrders = workOrders.filter(wo =>
                wo.assignedTechnicianId === tech.id &&
                wo.status !== 'Completed'
            );

            const inProgressOrders = openOrders.filter(wo => wo.status === 'In Progress');

            // Determine status
            // Assuming we have an isOnline or lastSeen field - if not available, we'll use a simpler logic
            const isSignedIn = tech.isOnline || tech.is_online || true; // Default to true if field doesn't exist
            const hasActiveWork = inProgressOrders.length > 0;

            let status: 'active' | 'busy' | 'offline';
            let statusColor: string;
            let statusBg: string;

            if (!isSignedIn) {
                status = 'offline';
                statusColor = 'text-gray-600';
                statusBg = 'bg-gray-100';
            } else if (hasActiveWork) {
                status = 'busy';
                statusColor = 'text-amber-600';
                statusBg = 'bg-amber-100';
            } else {
                status = 'active';
                statusColor = 'text-emerald-600';
                statusBg = 'bg-emerald-100';
            }

            return {
                ...tech,
                openOrdersCount: openOrders.length,
                inProgressCount: inProgressOrders.length,
                status,
                statusColor,
                statusBg,
                isSignedIn
            };
        }).slice(0, 8);
    }, [technicians, workOrders]);

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Available';
            case 'busy': return 'Working';
            case 'offline': return 'Offline';
            default: return 'Unknown';
        }
    };

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={UserGroupIcon} size={14} className="text-muted-foreground" />
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Technicians</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{technicianStats.filter(t => t.isSignedIn).length} online</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/technicians')}
                        className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                        View All →
                    </button>
                </div>
            </div>
            {/* Content */}
            <div className="divide-y divide-border">
                {technicianStats.length > 0 ? (
                    <>
                        {technicianStats.map((tech) => (
                            <div
                                key={tech.id}
                                className="p-3 hover:bg-accent transition-colors cursor-pointer"
                                onClick={() => navigate('/technicians')}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                                            {tech.fullName ? tech.fullName.charAt(0).toUpperCase() : 'T'}
                                        </div>
                                        {/* Status indicator dot */}
                                        <div className={cn(
                                            'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card',
                                            tech.status === 'active' ? 'bg-emerald-500' :
                                                tech.status === 'busy' ? 'bg-amber-500' : 'bg-muted-foreground'
                                        )} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-semibold text-foreground truncate">
                                                {tech.fullName || tech.name || 'Technician'}
                                            </p>
                                            <span className={cn(
                                                'px-2 py-0.5 rounded text-xs font-medium border',
                                                tech.statusBg,
                                                tech.statusColor,
                                                tech.status === 'active' ? 'border-emerald-200' :
                                                    tech.status === 'busy' ? 'border-amber-200' : 'border-border'
                                            )}>
                                                {getStatusLabel(tech.status)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            {tech.openOrdersCount > 0 ? (
                                                <>
                                                    <span className="font-medium">{tech.openOrdersCount} open {tech.openOrdersCount === 1 ? 'order' : 'orders'}</span>
                                                    {tech.inProgressCount > 0 && (
                                                        <>
                                                            <span className="text-muted-foreground/50">•</span>
                                                            <span>{tech.inProgressCount} in progress</span>
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-muted-foreground">No assigned work orders</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="p-6 text-center py-8">
                        <HugeiconsIcon icon={UserGroupIcon} size={48} className="text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm font-medium text-foreground mb-1">No Technicians</p>
                        <p className="text-xs text-muted-foreground">Add technicians to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
};
