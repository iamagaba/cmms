import { Bike, Plus, Phone, MapPin, Ticket } from 'lucide-react';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { WhatsAppChat } from './types';
import { getWorkOrderNumber } from '@/utils/work-order-display';
import { format } from 'date-fns';
import { WorkOrderDetailsDrawer } from '@/components/WorkOrderDetailsDrawer';

interface ChatDetailsProps {
    chat: WhatsAppChat;
    onCreateWorkOrder?: () => void;
    onCreateTicket?: () => void;
}

export const ChatDetails: React.FC<ChatDetailsProps> = ({ chat, onCreateWorkOrder, onCreateTicket }) => {
    const [activeTab, setActiveTab] = useState<'details' | 'files' | 'work-orders'>('details');
    const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);
    const [isWorkOrderDrawerOpen, setIsWorkOrderDrawerOpen] = useState(false);

    // Fetch diagnostic categories for mapping (same as main work orders table)
    const { data: serviceCategories = [] } = useQuery({
        queryKey: ['diagnostic-categories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('diagnostic_categories')
                .select('id, name, label');
            if (error) {
                console.error('Error fetching categories:', error);
                return [];
            }
            return data || [];
        },
        staleTime: 10 * 60 * 1000 // Cache for 10 minutes
    });

    // Debug: Log customer ID
    console.log('ChatDetails - Customer ID:', chat.customerId);
    console.log('ChatDetails - Customer Name:', chat.customerName);
    console.log('ChatDetails - Customer Phone:', chat.customerPhone);

    // Fetch all work orders for this customer
    const { data: workOrders = [], isLoading: isLoadingWorkOrders, refetch } = useQuery({
        queryKey: ['customer-work-orders', chat.customerId],
        queryFn: async () => {
            if (!chat.customerId) {
                console.log('⚠️ No customer ID, skipping work order fetch');
                return [];
            }
            console.log('🔍 Fetching work orders for customer:', chat.customerId);
            const { data, error } = await supabase
                .from('work_orders')
                .select('*')
                .eq('customer_id', chat.customerId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Error fetching work orders:', error);
                throw error;
            }
            console.log('✅ Fetched work orders:', data?.length || 0);
            // Log each work order's service-related fields
            data?.forEach((wo, idx) => {
                const categoryLabel = serviceCategories?.find(cat => cat.id === wo.service)?.label;
                console.log(`Work Order ${idx + 1}:`, {
                    id: wo.id,
                    service_id: wo.service,
                    category_label: categoryLabel,
                    subcategory: wo.subcategory
                });
            });
            return data || [];
        },
        enabled: !!chat.customerId,
        refetchInterval: 5000,
        refetchOnWindowFocus: true
    });

    // Also try fetching by vehicle ID as fallback
    const { data: workOrdersByVehicle = [] } = useQuery({
        queryKey: ['vehicle-work-orders', chat.vehicleId],
        queryFn: async () => {
            if (!chat.vehicleId) {
                console.log('⚠️ No vehicle ID, skipping vehicle work order fetch');
                return [];
            }
            console.log('🔍 Fetching work orders for vehicle:', chat.vehicleId);
            const { data, error } = await supabase
                .from('work_orders')
                .select('*')
                .eq('vehicle_id', chat.vehicleId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Error fetching work orders by vehicle:', error);
                throw error;
            }
            console.log('✅ Fetched work orders by vehicle:', data?.length || 0);
            return data || [];
        },
        enabled: !!chat.vehicleId && !chat.customerId,
        refetchInterval: 5000,
        refetchOnWindowFocus: true
    });

    // Use customer work orders if available, otherwise use vehicle work orders
    const displayWorkOrders = workOrders.length > 0 ? workOrders : workOrdersByVehicle;

    // Handle work order click
    const handleWorkOrderClick = (workOrderId: string) => {
        setSelectedWorkOrderId(workOrderId);
        setIsWorkOrderDrawerOpen(true);
    };

    // Get status badge styling
    const getStatusBadge = (status: string) => {
        const statusLower = status?.toLowerCase() || '';
        if (statusLower === 'completed') {
            return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
        } else if (statusLower === 'in progress' || statusLower === 'ready') {
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
        } else if (statusLower === 'new' || statusLower === 'pending') {
            return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
        } else if (statusLower === 'on hold') {
            return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
        }
        return 'bg-muted text-muted-foreground';
    };

    // Show recent work orders in details tab (limit to 3)
    const recentWorkOrders = displayWorkOrders.slice(0, 3);

    return (
        <div className="w-80 2xl:w-96 border-l border-border bg-background flex flex-col h-full">
            <div className="h-16 flex border-b border-border shrink-0">
                {['Details', 'Files', 'Work Orders'].map((tab) => {
                    const tabKey = tab.toLowerCase().replace(' ', '-') as typeof activeTab;
                    const isActive = activeTab === tabKey;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tabKey)}
                            className={cn(
                                "flex-1 text-xs font-bold tracking-wider transition-colors relative",
                                isActive
                                    ? "text-[#25d366] bg-[#25d366]/5"
                                    : "text-gray-600 hover:text-gray-900"
                            )}
                        >
                            {tab}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#25d366]" />
                            )}
                        </button>
                    );
                })}
            </div>

            {activeTab === 'details' && (
                <>
                    <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-muted mb-3 overflow-hidden border-4 border-background shadow-sm">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chat.customerName || 'User')}&background=random&size=128`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h2 className="text-base font-bold text-foreground font-brand text-center">
                                {chat.customerName}
                            </h2>

                            <div className="mt-3 w-full space-y-2.5">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <Phone className="w-4 h-4 text-[#25d366]" />
                                    <span>{chat.customerPhone}</span>
                                </div>
                                {chat.location && (
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <MapPin className="w-4 h-4 text-muted-foreground" />
                                        <span>{chat.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-muted-foreground mb-2 flex justify-between items-center tracking-wider uppercase">
                                <span>Recent Work Orders ({displayWorkOrders.length})</span>
                            </h3>

                            {isLoadingWorkOrders ? (
                                <div className="text-sm text-muted-foreground text-center py-4">Loading...</div>
                            ) : recentWorkOrders.length === 0 ? (
                                <div className="text-sm text-muted-foreground text-center py-4">
                                    No work orders yet
                                    {!chat.customerId && !chat.vehicleId && (
                                        <div className="text-xs text-destructive mt-2">
                                            Customer/Vehicle not linked to database
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {recentWorkOrders.map((wo) => (
                                        <div
                                            key={wo.id}
                                            onClick={() => handleWorkOrderClick(wo.id)}
                                            className="group hover:bg-muted/50 p-2.5 -mx-2.5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-border"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-sm font-bold text-primary font-mono">
                                                    {wo.work_order_number || getWorkOrderNumber(wo.id, wo.created_at)}
                                                </span>
                                                <span className={cn("px-1.5 py-0.5 text-xs font-bold rounded", getStatusBadge(wo.status || ''))}>
                                                    {wo.status || 'New'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-1">
                                                {wo.description || serviceCategories?.find(cat => cat.id === wo.service)?.label || wo.service || 'General Service'}
                                            </p>
                                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                                <span>{format(new Date(wo.created_at), 'MMM d, yyyy')}</span>
                                                <span>
                                                    {wo.assigned_technician_id ? 'Assigned' : 'Unassigned'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-5 border-t border-border shrink-0 space-y-2">
                        <button
                            onClick={onCreateWorkOrder}
                            className="w-full text-sm font-bold gap-2 px-4 py-3 bg-[#25d366] text-white rounded-lg hover:bg-[#20bd5a] transition-colors flex items-center justify-center"
                        >
                            <Plus className="w-5 h-5" />
                            Create Work Order
                        </button>
                        <button
                            onClick={onCreateTicket}
                            className="w-full text-sm font-bold gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
                        >
                            <Ticket className="w-4 h-4" />
                            Create Ticket
                        </button>
                    </div>
                </>
            )}

            {activeTab === 'work-orders' && (
                <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
                    <h3 className="text-xs font-bold text-muted-foreground mb-3 tracking-wider uppercase">
                        All Work Orders ({displayWorkOrders.length})
                    </h3>

                    {isLoadingWorkOrders ? (
                        <div className="text-sm text-muted-foreground text-center py-8">Loading work orders...</div>
                    ) : displayWorkOrders.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-8">
                            No work orders found
                            {!chat.customerId && !chat.vehicleId && (
                                <div className="text-xs text-destructive mt-2">
                                    Customer/Vehicle not linked to database
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {displayWorkOrders.map((wo) => (
                                <div
                                    key={wo.id}
                                    onClick={() => handleWorkOrderClick(wo.id)}
                                    className="group hover:bg-muted/50 p-2.5 -mx-2.5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-border"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-sm font-bold text-primary font-mono">
                                            {wo.work_order_number || getWorkOrderNumber(wo.id, wo.created_at)}
                                        </span>
                                        <span className={cn("px-1.5 py-0.5 text-xs font-bold rounded", getStatusBadge(wo.status || ''))}>
                                            {wo.status || 'New'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                        {wo.description || serviceCategories?.find(cat => cat.id === wo.service)?.label || wo.service || 'General Service'}
                                    </p>
                                    {wo.service_notes && wo.service !== wo.service_notes && (
                                        <p className="text-xs text-muted-foreground/70 mb-1 line-clamp-2">{wo.service_notes}</p>
                                    )}
                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                        <span>{format(new Date(wo.created_at), 'MMM d, yyyy')}</span>
                                        <span>
                                            {wo.assigned_technician_id ? 'Assigned' : 'Unassigned'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'files' && (
                <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
                    <div className="text-sm text-muted-foreground text-center py-8">No files shared yet</div>
                </div>
            )}

            {/* Work Order Details Drawer */}
            <WorkOrderDetailsDrawer
                open={isWorkOrderDrawerOpen}
                onClose={() => setIsWorkOrderDrawerOpen(false)}
                workOrderId={selectedWorkOrderId}
            />
        </div>
    );
};



