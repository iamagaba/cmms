
import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon, ArrowRight01Icon, Car01Icon, Calendar01Icon, SecurityCheckIcon } from '@hugeicons/core-free-icons';
import { WorkOrder, Vehicle } from "@/types/supabase";
import dayjs from "dayjs";
import { cn } from '@/lib/utils';

interface PriorityWorkOrdersProps {
    workOrders: WorkOrder[];
    vehicles: Vehicle[];
    onViewDetails: (id: string) => void;
}

export const PriorityWorkOrders: React.FC<PriorityWorkOrdersProps> = ({ workOrders, vehicles, onViewDetails }) => {
    const priorityOrders = workOrders
        .filter(wo => wo.priority === 'High' || wo.priority === 'Critical')
        .slice(0, 5);

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-gray-500" />
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Priority Work Orders</h3>
                            <p className="text-xs text-gray-500 mt-0.5">High priority items requiring attention</p>
                        </div>
                    </div>
                    {priorityOrders.length > 0 && (
                        <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded border border-red-200">
                            {priorityOrders.length} Urgent
                        </span>
                    )}
                </div>
            </div>
            {/* Content */}
            <div className="p-6">
                {priorityOrders.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {priorityOrders.map((order) => {
                            const vehicle = vehicles.find(v => v.id === order.vehicleId);
                            const isOverdue = order.dueDate && dayjs(order.dueDate).isBefore(dayjs());

                            return (
                                <div
                                    key={order.id}
                                    className="group py-3 first:pt-0 last:pb-0 hover:bg-gray-50 -mx-6 px-6 transition-colors cursor-pointer"
                                    onClick={() => onViewDetails(order.id)}
                                >
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                                                    {order.workOrderNumber || `WO-${order.id.substring(0, 6).toUpperCase()}`}
                                                </span>
                                                <span className={cn(
                                                    'px-2 py-0.5 rounded text-xs font-medium border',
                                                    order.priority === 'Critical'
                                                        ? 'bg-red-50 text-red-700 border-red-200'
                                                        : 'bg-orange-50 text-orange-700 border-orange-200'
                                                )}>
                                                    {order.priority}
                                                </span>
                                                <span className={cn(
                                                    'px-2 py-0.5 rounded text-xs font-medium border',
                                                    order.status === 'Open' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        order.status === 'In Progress' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                            'bg-gray-50 text-gray-700 border-gray-200'
                                                )}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 line-clamp-1">{order.description || order.service || 'General Service'}</p>
                                        </div>
                                        <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-gray-400 group-hover:text-purple-600 transition-colors flex-shrink-0 mt-1" />
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-3 text-gray-500">
                                            {vehicle && (
                                                <span className="flex items-center gap-1">
                                                    <HugeiconsIcon icon={Car01Icon} size={14} />
                                                    {vehicle.license_plate}
                                                </span>
                                            )}
                                            {order.dueDate && (
                                                <span className={cn(
                                                    'flex items-center gap-1 font-medium',
                                                    isOverdue ? 'text-red-600' : 'text-gray-600'
                                                )}>
                                                    <HugeiconsIcon icon={isOverdue ? AlertCircleIcon : Calendar01Icon} size={14} />
                                                    {dayjs(order.dueDate).format('MMM D')}
                                                    {isOverdue && ' (Overdue)'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-32 flex flex-col items-center justify-center text-gray-500">
                        <HugeiconsIcon icon={SecurityCheckIcon} size={32} className="text-emerald-200 mb-2" />
                        <p className="text-sm font-medium text-gray-900 mb-1">All Clear!</p>
                        <p className="text-xs text-gray-500">No high priority work orders</p>
                    </div>
                )}
            </div>
        </div>
    );
};
