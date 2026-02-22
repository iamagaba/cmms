/**
 * Tickets List Page
 * Main ticket management view with filters, search, and ticket list.
 */

import React, { useState, useMemo } from 'react';
import { Plus, Search, SlidersHorizontal, Ticket as TicketIcon, Check, ArrowRight, Pause, Flag } from 'lucide-react';
import { useTickets, useTicketCategories } from '@/hooks/useTicketing';
import {
    Ticket,
    TICKET_STATUS_CONFIG,
    TICKET_PRIORITY_CONFIG,
    TICKET_CHANNEL_CONFIG,
} from '@/types/ticketing';
import { TicketFormDrawer } from '@/components/ticketing/TicketFormDrawer';
import { TicketDetailsDrawer } from '@/components/ticketing/TicketDetailsDrawer';

// ─── Filter Bar ───────────────────────────────
const FilterSelect: React.FC<{
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
}> = ({ value, onChange, options, placeholder }) => (
    <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-8 px-2 text-xs rounded-md border border-border bg-background text-foreground focus:ring-1 focus:ring-primary/40 outline-none"
    >
        <option value="all">{placeholder}</option>
        {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
    </select>
);

// ─── Ticket Row ───────────────────────────────
const TicketRow: React.FC<{
    ticket: Ticket;
    onClick: () => void;
}> = ({ ticket, onClick }) => {
    const statusCfg = TICKET_STATUS_CONFIG[ticket.status];
    const priorityCfg = TICKET_PRIORITY_CONFIG[ticket.priority];
    const channelCfg = TICKET_CHANNEL_CONFIG[ticket.channel];

    const timeAgo = useMemo(() => {
        const diff = Date.now() - new Date(ticket.created_at).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }, [ticket.created_at]);

    const isOverdue = ticket.sla_due && new Date(ticket.sla_due) < new Date() && !['resolved', 'closed'].includes(ticket.status);

    return (
        <tr
            onClick={onClick}
            className="border-b border-border/50 hover:bg-accent/30 cursor-pointer transition-colors group"
        >
            <td className="py-3 px-3">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{ticket.ticket_number}</span>
                    {isOverdue && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" title="SLA Overdue" />
                    )}
                </div>
            </td>
            <td className="py-3 px-3">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate max-w-[280px] group-hover:text-primary transition-colors">
                        {ticket.subject}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[280px]">
                        {ticket.customer?.name || 'Unknown Customer'}
                        {ticket.category?.name ? ` · ${ticket.category.name}` : ''}
                    </p>
                </div>
            </td>
            <td className="py-3 px-3">
                <div className="flex items-center gap-2">
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
                    <span className="text-sm">{statusCfg.label}</span>
                </div>
            </td>
            <td className="py-3 px-3">
                <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 flex-shrink-0" style={{ color: priorityCfg.color }} fill={priorityCfg.color} />
                    <span className="text-sm">{priorityCfg.label}</span>
                </div>
            </td>
            <td className="py-3 px-3 text-xs text-muted-foreground">{channelCfg.label}</td>
            <td className="py-3 px-3">
                {ticket.assigned_agent ? (
                    <span className="text-xs text-foreground">
                        {ticket.assigned_agent.first_name} {ticket.assigned_agent.last_name?.charAt(0)}.
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground italic">Unassigned</span>
                )}
            </td>
            <td className="py-3 px-3 text-xs text-muted-foreground">{timeAgo}</td>
        </tr>
    );
};

// ─── Main Page ────────────────────────────────
const TicketsPage: React.FC = () => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [channelFilter, setChannelFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

    const { data: tickets = [], isLoading } = useTickets({
        status: statusFilter,
        priority: priorityFilter,
        channel: channelFilter,
        category_id: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: search || undefined,
    });

    const { data: categories = [] } = useTicketCategories();

    const statusOptions = Object.entries(TICKET_STATUS_CONFIG).map(([v, c]) => ({ value: v, label: c.label }));
    const priorityOptions = Object.entries(TICKET_PRIORITY_CONFIG).map(([v, c]) => ({ value: v, label: c.label }));
    const channelOptions = Object.entries(TICKET_CHANNEL_CONFIG).map(([v, c]) => ({ value: v, label: c.label }));
    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));

    const activeFilters = [statusFilter, priorityFilter, channelFilter, categoryFilter].filter(f => f !== 'all').length;

    return (
        <div className="p-6 pt-0 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Tickets</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create Ticket
                </button>
            </div>

            {/* Search & Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full h-8 pl-8 pr-3 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/40 outline-none"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                    <FilterSelect value={statusFilter} onChange={setStatusFilter} options={statusOptions} placeholder="All Statuses" />
                    <FilterSelect value={priorityFilter} onChange={setPriorityFilter} options={priorityOptions} placeholder="All Priorities" />
                    <FilterSelect value={channelFilter} onChange={setChannelFilter} options={channelOptions} placeholder="All Channels" />
                    <FilterSelect value={categoryFilter} onChange={setCategoryFilter} options={categoryOptions} placeholder="All Categories" />
                    {activeFilters > 0 && (
                        <button
                            onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setChannelFilter('all'); setCategoryFilter('all'); }}
                            className="text-xs text-primary hover:underline"
                        >
                            Clear ({activeFilters})
                        </button>
                    )}
                </div>
            </div>

            {/* Tickets Table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
                {isLoading ? (
                    <div className="p-8 space-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-12 bg-muted/30 rounded animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">ID</th>
                                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Subject</th>
                                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Status</th>
                                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Priority</th>
                                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Channel</th>
                                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Assignee</th>
                                    <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map(ticket => (
                                    <TicketRow
                                        key={ticket.id}
                                        ticket={ticket}
                                        onClick={() => setSelectedTicketId(ticket.id)}
                                    />
                                ))}
                                {tickets.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center">
                                            <TicketIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                                            <p className="text-sm font-medium text-muted-foreground">No tickets found</p>
                                            <p className="text-xs text-muted-foreground/80 mt-1">
                                                {search || activeFilters > 0
                                                    ? 'Try adjusting your filters or search term'
                                                    : 'Create your first ticket to get started'}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Drawers */}
            <TicketFormDrawer
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
            <TicketDetailsDrawer
                ticketId={selectedTicketId}
                isOpen={!!selectedTicketId}
                onClose={() => setSelectedTicketId(null)}
            />
        </div>
    );
};

export default TicketsPage;
