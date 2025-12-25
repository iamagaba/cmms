
import React, { useMemo } from 'react';
import { Icon } from '@iconify/react';
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
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Icon icon="tabler:users" className="w-4 h-4 text-gray-500" />
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Technicians</h3>
                            <p className="text-xs text-gray-500 mt-0.5">{technicianStats.filter(t => t.isSignedIn).length} online</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/technicians')}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors"
                    >
                        View All →
                    </button>
                </div>
            </div>
            {/* Content */}
            <div className="divide-y divide-gray-100">
                {technicianStats.length > 0 ? (
                    <>
                        {technicianStats.map((tech) => (
                            <div
                                key={tech.id}
                                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => navigate('/technicians')}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-semibold text-sm">
                                            {tech.fullName ? tech.fullName.charAt(0).toUpperCase() : 'T'}
                                        </div>
                                        {/* Status indicator dot */}
                                        <div className={cn(
                                            'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white',
                                            tech.status === 'active' ? 'bg-emerald-500' :
                                                tech.status === 'busy' ? 'bg-amber-500' : 'bg-gray-400'
                                        )} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                {tech.fullName || tech.name || 'Technician'}
                                            </p>
                                            <span className={cn(
                                                'px-2 py-0.5 rounded text-xs font-medium border',
                                                tech.statusBg,
                                                tech.statusColor,
                                                tech.status === 'active' ? 'border-emerald-200' :
                                                    tech.status === 'busy' ? 'border-amber-200' : 'border-gray-200'
                                            )}>
                                                {getStatusLabel(tech.status)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-gray-600">
                                            {tech.openOrdersCount > 0 ? (
                                                <>
                                                    <span className="font-medium">{tech.openOrdersCount} open {tech.openOrdersCount === 1 ? 'order' : 'orders'}</span>
                                                    {tech.inProgressCount > 0 && (
                                                        <>
                                                            <span className="text-gray-400">•</span>
                                                            <span>{tech.inProgressCount} in progress</span>
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-gray-500">No assigned work orders</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="p-6 text-center py-8">
                        <Icon icon="tabler:users" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-900 mb-1">No Technicians</p>
                        <p className="text-xs text-gray-500">Add technicians to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
};
