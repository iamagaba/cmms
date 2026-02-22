/**
 * Ticket Details Drawer
 * Shows full ticket detail with customer context, notes, and status management.
 */

import React, { useState } from 'react';
import { X, User, Tag, MessageSquare, Send, AlertTriangle, Check, ArrowRight, Pause, Flag, Phone, FileText, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTicketById, useTicketNotes, useCreateTicketNote, useTicketMutations, useAgents } from '@/hooks/useTicketing';
import { useSession } from '@/context/SessionContext';
import { TICKET_STATUS_CONFIG, TICKET_PRIORITY_CONFIG, TICKET_CHANNEL_CONFIG, TicketStatus } from '@/types/ticketing';
import TicketStepper from './TicketStepper';
import { CreateWorkOrderForm } from '@/components/work-orders/CreateWorkOrderForm';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TicketDetailsDrawerProps {
    ticketId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

// ─── Status Transition Buttons ────────────────
const STATUS_TRANSITIONS: Record<TicketStatus, { label: string; next: TicketStatus }[]> = {
    open: [
        { label: 'Start Work', next: 'in_progress' },
        { label: 'Close', next: 'closed' },
    ],
    in_progress: [
        { label: 'Hold', next: 'on_hold' },
        { label: 'Resolve', next: 'resolved' },
    ],
    on_hold: [
        { label: 'Resume', next: 'in_progress' },
    ],
    resolved: [
        { label: 'Close', next: 'closed' },
        { label: 'Reopen', next: 'in_progress' },
    ],
    closed: [],
};

// ─── Helper ───────────────────────────────────
const InfoField: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
        <div className="text-sm text-foreground">{value || '—'}</div>
    </div>
);

export const TicketDetailsDrawer: React.FC<TicketDetailsDrawerProps> = ({ ticketId, isOpen, onClose }) => {
    const { data: ticket, isLoading } = useTicketById(ticketId || undefined);
    const { data: notes = [] } = useTicketNotes(ticketId || undefined);
    const createNote = useCreateTicketNote();
    const { updateTicket } = useTicketMutations();
    const { data: agents = [] } = useAgents();
    const { profile } = useSession();
    const navigate = useNavigate();
    const [newNote, setNewNote] = useState('');
    const [activeTab, setActiveTab] = useState<'details' | 'notes'>('details');
    const [isCreateWorkOrderOpen, setIsCreateWorkOrderOpen] = useState(false);

    // Check if customer has chat messages
    const { data: customerHasChat } = useQuery({
        queryKey: ['customer_has_chat', ticket?.customer?.phone],
        queryFn: async () => {
            if (!ticket?.customer?.phone) return false;
            const { data, error } = await supabase
                .from('chat_messages')
                .select('id')
                .eq('contact_phone', ticket.customer.phone)
                .limit(1);
            if (error) return false;
            return (data && data.length > 0);
        },
        enabled: !!ticket?.customer?.phone && isOpen,
    });

    // Fetch related tickets from same customer
    const { data: relatedTickets = [] } = useQuery({
        queryKey: ['related_tickets', ticket?.customer_id, ticketId],
        queryFn: async () => {
            if (!ticket?.customer_id) return [];
            const { data, error } = await supabase
                .from('tickets')
                .select('id, ticket_number, subject, status, priority, created_at, category:ticket_categories(name)')
                .eq('customer_id', ticket.customer_id)
                .neq('id', ticketId)
                .order('created_at', { ascending: false })
                .limit(5);
            if (error) throw error;
            return data || [];
        },
        enabled: !!ticket?.customer_id && isOpen,
    });

    const handleAddNote = async () => {
        if (!newNote.trim() || !ticketId || !profile?.id) return;
        await createNote.mutateAsync({
            ticket_id: ticketId,
            content: newNote.trim(),
            created_by: profile.id,
        });
        setNewNote('');
    };

    const handleStatusChange = async (newStatus: TicketStatus) => {
        if (!ticketId) return;
        const updates: any = { status: newStatus };
        if (newStatus === 'resolved') updates.resolved_at = new Date().toISOString();
        if (newStatus === 'closed') updates.closed_at = new Date().toISOString();
        await updateTicket.mutateAsync({ id: ticketId, updates });
    };

    const handleAssign = async (agentId: string) => {
        if (!ticketId) return;
        await updateTicket.mutateAsync({ id: ticketId, updates: { assigned_agent_id: agentId || null } as any });
    };

    // Quick action handlers
    const handleCallCustomer = () => {
        if (ticket?.customer?.phone) {
            window.location.href = `tel:${ticket.customer.phone}`;
        }
    };

    const handleSendMessage = () => {
        // Navigate to chat page with customer context
        if (ticket?.customer?.phone) {
            // Navigate to customer care chat page
            navigate('/customer-care/chat', { 
                state: { 
                    customerPhone: ticket.customer.phone,
                    customerName: ticket.customer.name,
                    customerId: ticket.customer_id,
                    vehicleId: ticket.vehicle_id
                } 
            });
        }
    };

    const handlePrintTicket = () => {
        window.print();
    };

    const handleCreateWorkOrder = () => {
        // Open work order creation modal with ticket context
        setIsCreateWorkOrderOpen(true);
    };

    if (!isOpen) return null;

    const statusCfg = ticket ? TICKET_STATUS_CONFIG[ticket.status] : null;
    const priorityCfg = ticket ? TICKET_PRIORITY_CONFIG[ticket.priority] : null;
    const channelCfg = ticket ? TICKET_CHANNEL_CONFIG[ticket.channel] : null;
    const transitions = ticket ? STATUS_TRANSITIONS[ticket.status] || [] : [];
    const isOverdue = ticket?.sla_due && new Date(ticket.sla_due) < new Date() && !['resolved', 'closed'].includes(ticket.status);

    return (
        <>
            <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 w-full max-w-3xl bg-background border-l border-border shadow-xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
                {/* Header */}
                <div className="bg-card border-b border-border shadow-sm px-4 py-2 z-10 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-muted">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </Button>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">{ticket?.ticket_number || '...'}</span>
                                {/* Priority Badge */}
                                {ticket && priorityCfg && (
                                    <div 
                                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                                        style={{ 
                                            backgroundColor: `${priorityCfg.color}15`,
                                            color: priorityCfg.color 
                                        }}
                                    >
                                        <Flag className="w-3 h-3" fill={priorityCfg.color} />
                                        <span>{priorityCfg.label}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {ticket && statusCfg && (
                                <div className="flex items-center gap-1.5">
                                    {(() => {
                                        const iconType = statusCfg.icon;
                                        if (iconType === 'dashed') {
                                            return (
                                                <div
                                                    className="w-4 h-4 rounded-full flex-shrink-0 border-2 border-dashed"
                                                    style={{ borderColor: statusCfg.color }}
                                                />
                                            );
                                        }
                                        if (iconType === 'check') {
                                            return (
                                                <div
                                                    className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                                                    style={{ backgroundColor: statusCfg.color }}
                                                >
                                                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                                </div>
                                            );
                                        }
                                        if (iconType === 'arrow') {
                                            return (
                                                <div
                                                    className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                                                    style={{ backgroundColor: statusCfg.color }}
                                                >
                                                    <ArrowRight className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                                </div>
                                            );
                                        }
                                        if (iconType === 'pause') {
                                            return (
                                                <div
                                                    className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                                                    style={{ backgroundColor: statusCfg.color }}
                                                >
                                                    <Pause className="w-2.5 h-2.5 text-white" strokeWidth={3} fill="white" />
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                    <span className="text-sm font-medium">{statusCfg.label}</span>
                                </div>
                            )}
                            {isOverdue && (
                                <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                                    <AlertTriangle className="w-3 h-3" /> Overdue
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Customer Information Strip */}
                {ticket && (
                    <div className="px-4 py-2 border-b border-border bg-card flex-shrink-0">
                        <div className="flex items-center w-full gap-6">
                            {/* Customer Group */}
                            <div className="flex items-center gap-4 pr-6 border-r border-border">
                                {/* CUSTOMER NAME */}
                                <div>
                                    <div className="text-xs font-medium text-muted-foreground mb-0.5">Customer</div>
                                    <div className="text-xs font-medium text-foreground truncate max-w-[200px]">
                                        {ticket.customer?.name || '—'}
                                    </div>
                                </div>

                                {/* PHONE */}
                                <div>
                                    <div className="text-xs font-medium text-muted-foreground mb-0.5">Phone</div>
                                    <div className="text-xs font-medium text-foreground">
                                        {ticket.customer?.phone || '—'}
                                    </div>
                                </div>

                                {/* CUSTOMER TYPE */}
                                {ticket.customer?.customer_type && (
                                    <div>
                                        <div className="text-xs font-medium text-muted-foreground mb-0.5">Type</div>
                                        <div className="text-xs font-medium text-foreground">
                                            {ticket.customer.customer_type}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Vehicle Group (if available) */}
                            {ticket.vehicle && (
                                <div className="flex items-center gap-4 pr-6 border-r border-border">
                                    {/* LICENSE PLATE */}
                                    <div>
                                        <div className="text-xs font-medium text-muted-foreground mb-0.5">Plate</div>
                                        <div className="text-xs font-medium text-foreground">
                                            {ticket.vehicle.license_plate || '—'}
                                        </div>
                                    </div>

                                    {/* MODEL */}
                                    <div>
                                        <div className="text-xs font-medium text-muted-foreground mb-0.5">Model</div>
                                        <div className="text-xs font-medium text-foreground">
                                            {`${ticket.vehicle.make || ''} ${ticket.vehicle.model || ''}`.trim() || '—'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Ticket Info Group */}
                            <div className="flex items-center gap-4">
                                {/* CHANNEL */}
                                <div>
                                    <div className="text-xs font-medium text-muted-foreground mb-0.5">Channel</div>
                                    <div className="text-xs font-medium text-foreground">
                                        {channelCfg?.label || '—'}
                                    </div>
                                </div>

                                {/* ASSIGNED AGENT */}
                                <div>
                                    <div className="text-xs font-medium text-muted-foreground mb-0.5">Agent</div>
                                    <div className="text-xs font-medium text-foreground truncate max-w-[150px]">
                                        {ticket.assigned_agent ? (
                                            `${ticket.assigned_agent.first_name || ''} ${ticket.assigned_agent.last_name || ''}`.trim()
                                        ) : (
                                            <span className="text-muted-foreground italic">Unassigned</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stepper */}
                {ticket && (
                    <div className="border-b border-border bg-card flex-shrink-0">
                        <TicketStepper
                            ticket={ticket}
                            onStatusChange={(status) => {
                                handleStatusChange(status);
                            }}
                        />
                    </div>
                )}

                {/* Quick Actions Bar */}
                {ticket && (
                    <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            {/* Call Customer */}
                            {ticket.customer?.phone && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCallCustomer}
                                    className="h-8 text-xs gap-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                    <Phone className="w-3.5 h-3.5" />
                                    Call Customer
                                </Button>
                            )}

                            {/* Send Message */}
                            {ticket.customer?.phone && customerHasChat && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSendMessage}
                                    className="h-8 text-xs gap-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Message
                                </Button>
                            )}

                            {/* Create Work Order */}
                            {ticket.vehicle && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCreateWorkOrder}
                                    className="h-8 text-xs gap-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    Create Work Order
                                </Button>
                            )}

                            {/* Print/Export */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrintTicket}
                                className="h-8 text-xs gap-1.5 hover:bg-primary hover:text-primary-foreground transition-colors ml-auto"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                Print
                            </Button>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    {isLoading || !ticket ? (
                        <div className="flex-1 p-5 space-y-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-8 bg-muted/30 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <>
                            {/* Subject */}
                            <div className="px-5 pt-4 pb-2">
                                <h2 className="text-lg font-semibold text-foreground">{ticket.subject}</h2>
                                {ticket.description && (
                                    <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                                )}
                            </div>

                            {/* Status Actions */}
                            {transitions.length > 0 && (
                                <div className="px-5 pb-3 flex items-center gap-2">
                                    {transitions.map(t => (
                                        <button
                                            key={t.next}
                                            onClick={() => handleStatusChange(t.next)}
                                            className={cn(
                                                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                                                t.next === 'resolved' || t.next === 'closed'
                                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    : 'bg-accent text-foreground hover:bg-accent/80'
                                            )}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Tabs */}
                            <div className="flex border-b border-border px-5">
                                {(['details', 'notes'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={cn(
                                            'px-3 py-2 text-xs font-medium capitalize border-b-2 transition-colors',
                                            activeTab === tab
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        {tab} {tab === 'notes' && notes.length > 0 && `(${notes.length})`}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-y-auto px-5 py-4">
                                {activeTab === 'details' ? (
                                    <div className="space-y-4">
                                        {/* Info Grid */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <InfoField label="Priority" value={
                                                priorityCfg && (
                                                    <div className="flex items-center gap-2">
                                                        <Flag className="w-4 h-4 flex-shrink-0" style={{ color: priorityCfg.color }} fill={priorityCfg.color} />
                                                        <span className="text-sm">{priorityCfg.label}</span>
                                                    </div>
                                                )
                                            } />
                                            <InfoField label="Channel" value={channelCfg?.label} />
                                            <InfoField label="Category" value={ticket.category?.name || '—'} />
                                            <InfoField label="Subcategory" value={ticket.subcategory?.name || '—'} />
                                            <InfoField label="Created" value={new Date(ticket.created_at).toLocaleString()} />
                                            <InfoField label="SLA Due" value={
                                                ticket.sla_due ? (
                                                    <span className={isOverdue ? 'text-red-600 dark:text-red-400' : ''}>
                                                        {new Date(ticket.sla_due).toLocaleString()}
                                                    </span>
                                                ) : '—'
                                            } />
                                        </div>

                                        {/* Assignment */}
                                        <div className="border-t border-border pt-3">
                                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Assignee</label>
                                            <select
                                                value={ticket.assigned_agent_id || ''}
                                                onChange={e => handleAssign(e.target.value)}
                                                className="w-full h-8 px-2 text-sm rounded-md border border-border bg-background text-foreground focus:ring-1 focus:ring-primary/40 outline-none"
                                            >
                                                <option value="">Unassigned</option>
                                                {agents.map(a => (
                                                    <option key={a.id} value={a.id}>
                                                        {a.first_name} {a.last_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Customer Context */}
                                        {ticket.customer && (
                                            <div className="border-t border-border pt-3">
                                                <h4 className="text-xs font-medium text-muted-foreground mb-2">Customer</h4>
                                                <div className="bg-muted/30 rounded-md p-3 space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                                                        <span className="text-sm text-foreground">{ticket.customer.name}</span>
                                                    </div>
                                                    {ticket.customer.phone && (
                                                        <div className="flex items-center gap-2">
                                                            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                                                            <span className="text-sm text-foreground">{ticket.customer.phone}</span>
                                                        </div>
                                                    )}
                                                    {ticket.customer.customer_type && (
                                                        <div className="flex items-center gap-2">
                                                            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                                                            <span className="text-sm text-foreground">{ticket.customer.customer_type}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Vehicle Info */}
                                        {ticket.vehicle && (
                                            <div className="border-t border-border pt-3">
                                                <h4 className="text-xs font-medium text-muted-foreground mb-2">Vehicle</h4>
                                                <div className="bg-muted/30 rounded-md p-3">
                                                    <p className="text-sm text-foreground">
                                                        {ticket.vehicle.make} {ticket.vehicle.model} ({ticket.vehicle.year})
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{ticket.vehicle.license_plate}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Related Tickets */}
                                        {relatedTickets.length > 0 && (
                                            <div className="border-t border-border pt-3">
                                                <h4 className="text-xs font-medium text-muted-foreground mb-2">
                                                    Related Tickets ({relatedTickets.length})
                                                </h4>
                                                <div className="space-y-2">
                                                    {relatedTickets.map((relatedTicket: any) => {
                                                        const relatedStatusCfg = TICKET_STATUS_CONFIG[relatedTicket.status as TicketStatus];
                                                        const relatedPriorityCfg = TICKET_PRIORITY_CONFIG[relatedTicket.priority];
                                                        return (
                                                            <div
                                                                key={relatedTicket.id}
                                                                className="bg-muted/30 rounded-md p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                                                                onClick={() => {
                                                                    // Navigate to related ticket
                                                                    if (onClose) onClose();
                                                                    // This would need to trigger opening the related ticket
                                                                    // You might want to add a callback prop for this
                                                                }}
                                                            >
                                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                        <span className="font-mono text-xs text-muted-foreground">
                                                                            {relatedTicket.ticket_number}
                                                                        </span>
                                                                        <Flag 
                                                                            className="w-3 h-3 flex-shrink-0" 
                                                                            style={{ color: relatedPriorityCfg.color }}
                                                                            fill={relatedPriorityCfg.color}
                                                                        />
                                                                    </div>
                                                                    <div 
                                                                        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0"
                                                                        style={{ 
                                                                            backgroundColor: `${relatedStatusCfg.color}15`,
                                                                            color: relatedStatusCfg.color 
                                                                        }}
                                                                    >
                                                                        {relatedStatusCfg.label}
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm text-foreground mb-1 line-clamp-1">
                                                                    {relatedTicket.subject}
                                                                </p>
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                    {relatedTicket.category?.name && (
                                                                        <span>{relatedTicket.category.name}</span>
                                                                    )}
                                                                    <span>•</span>
                                                                    <span>{new Date(relatedTicket.created_at).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Notes Tab */
                                    <div className="space-y-3">
                                        {notes.map(note => (
                                            <div key={note.id} className="bg-muted/20 rounded-md p-3">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-xs font-medium text-foreground">
                                                        {note.profile?.first_name} {note.profile?.last_name}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {new Date(note.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                                            </div>
                                        ))}
                                        {notes.length === 0 && (
                                            <p className="text-sm text-muted-foreground text-center py-8">No notes yet</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Add Note */}
                            {activeTab === 'notes' && (
                                <div className="px-5 py-3 border-t border-border">
                                    <div className="flex items-end gap-2">
                                        <textarea
                                            value={newNote}
                                            onChange={e => setNewNote(e.target.value)}
                                            placeholder="Add note..."
                                            rows={2}
                                            className="flex-1 px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/40 outline-none resize-none"
                                        />
                                        <button
                                            onClick={handleAddNote}
                                            disabled={!newNote.trim() || createNote.isPending}
                                            className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Create Work Order Form Modal */}
            {ticket && (
                <CreateWorkOrderForm
                    isOpen={isCreateWorkOrderOpen}
                    onClose={() => setIsCreateWorkOrderOpen(false)}
                    initialData={{
                        customerId: ticket.customer_id || undefined,
                        vehicleId: ticket.vehicle_id || undefined,
                        customerName: ticket.customer?.name,
                        customerPhone: ticket.customer?.phone || undefined,
                        licensePlate: ticket.vehicle?.license_plate,
                    }}
                />
            )}
        </>
    );
};
