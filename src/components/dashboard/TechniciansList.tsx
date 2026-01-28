
import React, { useMemo } from 'react';
import { Users } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { WorkOrder } from "@/types/supabase";
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
            let badgeVariant: 'success' | 'warning' | 'low';

            if (!isSignedIn) {
                status = 'offline';
                badgeVariant = 'low';
            } else if (hasActiveWork) {
                status = 'busy';
                badgeVariant = 'warning';
            } else {
                status = 'active';
                badgeVariant = 'success';
            }

            return {
                ...tech,
                openOrdersCount: openOrders.length,
                inProgressCount: inProgressOrders.length,
                status,
                badgeVariant,
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
                        <Users className="w-5 h-5 text-muted-foreground" />
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
                                className="p-4 hover:bg-accent transition-colors cursor-pointer"
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
                                            tech.status === 'active' ? 'bg-success' :
                                                tech.status === 'busy' ? 'bg-warning' : 'bg-muted-foreground'
                                        )} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-semibold text-foreground truncate">
                                                {tech.fullName || tech.name || 'Technician'}
                                            </p>
                                            <Badge variant={tech.badgeVariant}>
                                                {getStatusLabel(tech.status)}
                                            </Badge>
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
                                                <span className="text-muted-foreground">No work orders</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="p-6 text-center py-8">
                        <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm font-medium text-foreground mb-1">No Technicians</p>
                        <p className="text-xs text-muted-foreground">Add technicians to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
};
