import { Calendar, AlertCircle, ArrowRight, Car, ShieldCheck } from 'lucide-react';

import React from 'react';

import { WorkOrder, Vehicle } from "@/types/supabase";
import { getWorkOrderNumber } from '@/utils/work-order-display';
import dayjs from "dayjs";
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PriorityBadge, StatusBadge, Badge } from '@/components/ui/badge';

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
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-muted-foreground" />
                        <div>
                            <CardTitle className="text-lg">Priority Work Orders</CardTitle>
                            <CardDescription>High priority items</CardDescription>
                        </div>
                    </div>
                    {priorityOrders.length > 0 && (
                        <Badge variant="error">
                            {priorityOrders.length} Urgent
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {priorityOrders.length > 0 ? (
                    <div className="space-y-4">
                        {priorityOrders.map((order) => {
                            const vehicle = vehicles.find(v => v.id === order.vehicleId);
                            const isOverdue = order.dueDate && dayjs(order.dueDate).isBefore(dayjs());
                            const DateIcon = isOverdue ? AlertCircle : Calendar;

                            return (
                                <div
                                    key={order.id}
                                    className="group hover:bg-slate-50 dark:hover:bg-slate-800 -mx-4 px-4 py-3 rounded-lg transition-colors cursor-pointer"
                                    onClick={() => onViewDetails(order.id)}
                                >
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                                    {getWorkOrderNumber(order)}
                                                </span>
                                                <PriorityBadge priority={order.priority} />
                                                <StatusBadge status={order.status} />
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{order.description || order.service || 'General Service'}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            {vehicle && (
                                                <span className="flex items-center gap-1">
                                                    <Car className="w-4 h-4" />
                                                    {vehicle.license_plate}
                                                </span>
                                            )}
                                            {order.dueDate && (
                                                <span className={cn(
                                                    'flex items-center gap-1 font-medium',
                                                    isOverdue ? 'text-destructive' : 'text-muted-foreground'
                                                )}>
                                                    <Calendar className="w-4 h-4" />
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
                    <div className="h-32 flex flex-col items-center justify-center text-muted-foreground">
                        <ShieldCheck className="w-8 h-8 text-success mb-2" />
                        <p className="text-sm font-medium text-foreground mb-1">All Clear!</p>
                        <p className="text-xs text-muted-foreground">No high priority work orders</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

