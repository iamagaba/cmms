/**
 * Customer Care Ticketing Dashboard
 * Displays KPIs and overview metrics for the ticketing system.
 */

import React from 'react';
import { Ticket, Clock, CheckCircle2, TrendingUp, BarChart3, PieChart, Users, Check, ArrowRight, Pause, Flag } from 'lucide-react';
import { useTicketStats, useTicketCategories, useTickets } from '@/hooks/useTicketing';
import { TICKET_STATUS_CONFIG, TICKET_PRIORITY_CONFIG, TICKET_CHANNEL_CONFIG } from '@/types/ticketing';
import { cn } from '@/lib/utils';

// ─── KPI Card ─────────────────────────────────
const KPICard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    trend?: string;
    color?: string;
}> = ({ title, value, subtitle, icon: Icon, trend, color = 'text-primary' }) => (
    <div className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
                {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
                {trend && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{trend}</p>}
            </div>
            <div className={cn('flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10', color)}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
    </div>
);

// ─── Status Badge ─────────────────────────────
const StatusBadge: React.FC<{ status: string; count: number }> = ({ status, count }) => {
    const config = TICKET_STATUS_CONFIG[status as keyof typeof TICKET_STATUS_CONFIG];
    if (!config) return null;
    return (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
                {(() => {
                    const iconType = config.icon;
                    if (iconType === 'dashed') {
                        return (
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0 border-2 border-dashed"
                                style={{ borderColor: config.color }}
                            />
                        );
                    }
                    if (iconType === 'check') {
                        return (
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center"
                                style={{ backgroundColor: config.color }}
                            >
                                <Check className="w-2 h-2 text-white" strokeWidth={3} />
                            </div>
                        );
                    }
                    if (iconType === 'arrow') {
                        return (
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center"
                                style={{ backgroundColor: config.color }}
                            >
                                <ArrowRight className="w-2 h-2 text-white" strokeWidth={3} />
                            </div>
                        );
                    }
                    if (iconType === 'pause') {
                        return (
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center"
                                style={{ backgroundColor: config.color }}
                            >
                                <Pause className="w-2 h-2 text-white" strokeWidth={3} fill="white" />
                            </div>
                        );
                    }
                    return null;
                })()}
                <span className="text-sm text-foreground">{config.label}</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{count}</span>
        </div>
    );
};

// ─── Recent Tickets Table ─────────────────────
const RecentTicketsTable: React.FC = () => {
    const { data: tickets = [], isLoading } = useTickets({ status: 'all' });
    const recent = tickets.slice(0, 8);

    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 bg-muted/50 rounded animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border">
                        <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">ID</th>
                        <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Subject</th>
                        <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Priority</th>
                        <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Channel</th>
                    </tr>
                </thead>
                <tbody>
                    {recent.map(ticket => {
                        const statusCfg = TICKET_STATUS_CONFIG[ticket.status];
                        const priorityCfg = TICKET_PRIORITY_CONFIG[ticket.priority];
                        const channelCfg = TICKET_CHANNEL_CONFIG[ticket.channel];
                        return (
                            <tr key={ticket.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                                <td className="py-2.5 px-2 font-mono text-xs text-muted-foreground">{ticket.ticket_number}</td>
                                <td className="py-2.5 px-2 text-foreground truncate max-w-[200px]">{ticket.subject}</td>
                                <td className="py-2.5 px-2">
                                    <div className="flex items-center gap-2">
                                        {(() => {
                                            const iconType = statusCfg.icon;
                                            if (iconType === 'dashed') {
                                                return (
                                                    <div
                                                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 border-2 border-dashed"
                                                        style={{ borderColor: statusCfg.color }}
                                                    />
                                                );
                                            }
                                            if (iconType === 'check') {
                                                return (
                                                    <div
                                                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center"
                                                        style={{ backgroundColor: statusCfg.color }}
                                                    >
                                                        <Check className="w-2 h-2 text-white" strokeWidth={3} />
                                                    </div>
                                                );
                                            }
                                            if (iconType === 'arrow') {
                                                return (
                                                    <div
                                                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center"
                                                        style={{ backgroundColor: statusCfg.color }}
                                                    >
                                                        <ArrowRight className="w-2 h-2 text-white" strokeWidth={3} />
                                                    </div>
                                                );
                                            }
                                            if (iconType === 'pause') {
                                                return (
                                                    <div
                                                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center"
                                                        style={{ backgroundColor: statusCfg.color }}
                                                    >
                                                        <Pause className="w-2 h-2 text-white" strokeWidth={3} fill="white" />
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                        <span className="text-xs">{statusCfg.label}</span>
                                    </div>
                                </td>
                                <td className="py-2.5 px-2">
                                    <div className="flex items-center gap-1.5">
                                        <Flag className="w-3.5 h-3.5 flex-shrink-0" style={{ color: priorityCfg.color }} fill={priorityCfg.color} />
                                        <span className="text-xs">{priorityCfg.label}</span>
                                    </div>
                                </td>
                                <td className="py-2.5 px-2 text-xs text-muted-foreground">{channelCfg.label}</td>
                            </tr>
                        );
                    })}
                    {recent.length === 0 && (
                        <tr>
                            <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                No tickets found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

// ─── Main Dashboard ───────────────────────────
const TicketingDashboard: React.FC = () => {
    const { data: stats, isLoading } = useTicketStats();
    const { data: categories = [] } = useTicketCategories();

    if (isLoading || !stats) {
        return (
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-24 bg-muted/30 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    // Map category IDs to names for the chart
    const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">Overview and key performance indicators</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Open"
                    value={stats.open}
                    icon={Ticket}
                    subtitle={`${stats.total} total`}
                />
                <KPICard
                    title="In Progress"
                    value={stats.inProgress}
                    icon={Clock}
                    subtitle={`${stats.onHold} on hold`}
                    color="text-amber-600 dark:text-amber-400"
                />
                <KPICard
                    title="Resolved"
                    value={stats.resolvedToday}
                    icon={CheckCircle2}
                    subtitle={`Avg ${stats.avgResolutionHours}h`}
                    color="text-emerald-600 dark:text-emerald-400"
                />
                <KPICard
                    title="SLA Met"
                    value={`${stats.slaCompliance}%`}
                    icon={TrendingUp}
                    subtitle="Within target"
                    color={stats.slaCompliance >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
                />
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* By Status */}
                <div className="bg-card rounded-lg border border-border p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                        By Status
                    </h3>
                    <div className="divide-y divide-border/50">
                        {Object.entries(TICKET_STATUS_CONFIG).map(([status]) => {
                            const count = status === 'open' ? stats.open
                                : status === 'in_progress' ? stats.inProgress
                                    : status === 'on_hold' ? stats.onHold
                                        : status === 'resolved' ? stats.resolvedToday
                                            : 0;
                            return <StatusBadge key={status} status={status} count={count} />;
                        })}
                    </div>
                </div>

                {/* By Category */}
                <div className="bg-card rounded-lg border border-border p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <PieChart className="w-4 h-4 text-muted-foreground" />
                        By Category
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(stats.byCategory).map(([catId, count]) => {
                            const name = categoryMap[catId] || 'Uncategorized';
                            const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                            return (
                                <div key={catId}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-foreground truncate">{name}</span>
                                        <span className="text-xs font-medium text-muted-foreground">{count} ({pct}%)</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-1.5">
                                        <div
                                            className="bg-primary rounded-full h-1.5 transition-all"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {Object.keys(stats.byCategory).length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>
                        )}
                    </div>
                </div>

                {/* By Channel */}
                <div className="bg-card rounded-lg border border-border p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        By Channel
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(stats.byChannel).map(([channel, count]) => {
                            const cfg = TICKET_CHANNEL_CONFIG[channel as keyof typeof TICKET_CHANNEL_CONFIG];
                            const label = cfg?.label || channel;
                            return (
                                <div key={channel} className="flex items-center justify-between">
                                    <span className="text-sm text-foreground">{label}</span>
                                    <span className="text-sm font-semibold text-foreground">{count}</span>
                                </div>
                            );
                        })}
                        {Object.keys(stats.byChannel).length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Tickets */}
            <div className="bg-card rounded-lg border border-border p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Recent</h3>
                <RecentTicketsTable />
            </div>
        </div>
    );
};

export default TicketingDashboard;
