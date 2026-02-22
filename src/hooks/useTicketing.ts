import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Ticket, TicketCategory, TicketSubcategory, TicketNote, TicketSlaConfig } from '@/types/ticketing';

const TICKET_SELECT = `
  *,
  customer:customers(*),
  vehicle:vehicles(*),
  category:ticket_categories(*),
  subcategory:ticket_subcategories(*),
  assigned_agent:profiles!tickets_assigned_agent_id_fkey(id, first_name, last_name, avatar_url)
`;

// ─── Tickets ───────────────────────────────
export function useTickets(filters?: {
    status?: string;
    priority?: string;
    category_id?: string;
    assigned_agent_id?: string;
    channel?: string;
    search?: string;
}) {
    return useQuery({
        queryKey: ['tickets', filters],
        queryFn: async () => {
            let query = supabase
                .from('tickets')
                .select(TICKET_SELECT)
                .order('created_at', { ascending: false });

            if (filters?.status && filters.status !== 'all') {
                query = query.eq('status', filters.status);
            }
            if (filters?.priority && filters.priority !== 'all') {
                query = query.eq('priority', filters.priority);
            }
            if (filters?.category_id) {
                query = query.eq('category_id', filters.category_id);
            }
            if (filters?.assigned_agent_id) {
                query = query.eq('assigned_agent_id', filters.assigned_agent_id);
            }
            if (filters?.channel && filters.channel !== 'all') {
                query = query.eq('channel', filters.channel);
            }
            if (filters?.search) {
                query = query.or(`subject.ilike.%${filters.search}%,ticket_number.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
            }

            const { data, error } = await query;
            if (error) throw error;
            return (data || []) as Ticket[];
        },
    });
}

export function useTicketById(id: string | undefined) {
    return useQuery({
        queryKey: ['ticket', id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await supabase
                .from('tickets')
                .select(TICKET_SELECT)
                .eq('id', id)
                .maybeSingle();
            if (error) throw error;
            return data as Ticket | null;
        },
        enabled: !!id,
    });
}

// ─── Ticket Mutations ─────────────────────────
export function useTicketMutations() {
    const queryClient = useQueryClient();

    const createTicket = useMutation({
        mutationFn: async (ticket: Partial<Ticket>) => {
            const { data, error } = await supabase
                .from('tickets')
                .insert(ticket as any)
                .select(TICKET_SELECT)
                .single();
            if (error) throw error;
            return data as Ticket;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
    });

    const updateTicket = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Ticket> }) => {
            const { data, error } = await supabase
                .from('tickets')
                .update(updates as any)
                .eq('id', id)
                .select(TICKET_SELECT)
                .single();
            if (error) throw error;
            return data as Ticket;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
        },
    });

    return { createTicket, updateTicket };
}

// ─── Categories ───────────────────────────────
export function useTicketCategories() {
    return useQuery({
        queryKey: ['ticket-categories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('ticket_categories')
                .select('*')
                .eq('is_active', true)
                .order('sort_order');
            if (error) throw error;
            return (data || []) as TicketCategory[];
        },
    });
}

export function useTicketSubcategories(categoryId?: string | null) {
    return useQuery({
        queryKey: ['ticket-subcategories', categoryId],
        queryFn: async () => {
            let query = supabase
                .from('ticket_subcategories')
                .select('*')
                .eq('is_active', true)
                .order('sort_order');

            if (categoryId) {
                query = query.eq('category_id', categoryId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return (data || []) as TicketSubcategory[];
        },
        enabled: !categoryId || !!categoryId, // always enabled
    });
}

// ─── Ticket Notes ─────────────────────────────
export function useTicketNotes(ticketId: string | undefined) {
    return useQuery({
        queryKey: ['ticket-notes', ticketId],
        queryFn: async () => {
            if (!ticketId) return [];
            const { data, error } = await supabase
                .from('ticket_notes')
                .select('*, profile:profiles!ticket_notes_created_by_fkey(id, first_name, last_name, avatar_url)')
                .eq('ticket_id', ticketId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []) as TicketNote[];
        },
        enabled: !!ticketId,
    });
}

export function useCreateTicketNote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ ticket_id, content, created_by }: { ticket_id: string; content: string; created_by: string }) => {
            const { data, error } = await supabase
                .from('ticket_notes')
                .insert({ ticket_id, content, created_by })
                .select()
                .single();
            if (error) throw error;
            return data as TicketNote;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['ticket-notes', variables.ticket_id] });
        },
    });
}

// ─── Work Order Notes ─────────────────────────
export function useWorkOrderNotes(workOrderId: string | undefined) {
    return useQuery({
        queryKey: ['work-order-notes', workOrderId],
        queryFn: async () => {
            if (!workOrderId) return [];
            const { data, error } = await supabase
                .from('work_order_notes')
                .select('*, profile:profiles!work_order_notes_created_by_fkey(id, first_name, last_name, avatar_url)')
                .eq('work_order_id', workOrderId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        enabled: !!workOrderId,
    });
}

export function useCreateWorkOrderNote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ work_order_id, content, created_by, source_system = 'cmms' }: {
            work_order_id: string;
            content: string;
            created_by: string;
            source_system?: 'cmms' | 'ticketing';
        }) => {
            const { data, error } = await supabase
                .from('work_order_notes')
                .insert({ work_order_id, content, created_by, source_system })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['work-order-notes', variables.work_order_id] });
        },
    });
}

// ─── SLA Config ───────────────────────────────
export function useTicketSlaConfig() {
    return useQuery({
        queryKey: ['ticket-sla-config'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('ticket_sla_config')
                .select('*')
                .order('priority');
            if (error) throw error;
            return (data || []) as TicketSlaConfig[];
        },
    });
}

// ─── Dashboard Stats ──────────────────────────
export function useTicketStats() {
    return useQuery({
        queryKey: ['ticket-stats'],
        queryFn: async () => {
            const { data: tickets, error } = await supabase
                .from('tickets')
                .select('id, status, priority, channel, category_id, created_at, resolved_at, sla_due');
            if (error) throw error;

            const all = tickets || [];
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const open = all.filter(t => t.status === 'open').length;
            const inProgress = all.filter(t => t.status === 'in_progress').length;
            const onHold = all.filter(t => t.status === 'on_hold').length;
            const resolvedToday = all.filter(t =>
                t.status === 'resolved' && t.resolved_at && new Date(t.resolved_at) >= todayStart
            ).length;

            // Average resolution time (hours) for resolved tickets
            const resolvedTickets = all.filter(t => t.resolved_at);
            let avgResolutionHours = 0;
            if (resolvedTickets.length > 0) {
                const totalHours = resolvedTickets.reduce((sum, t) => {
                    const created = new Date(t.created_at).getTime();
                    const resolved = new Date(t.resolved_at!).getTime();
                    return sum + (resolved - created) / (1000 * 60 * 60);
                }, 0);
                avgResolutionHours = Math.round((totalHours / resolvedTickets.length) * 10) / 10;
            }

            // SLA compliance
            const resolvedWithSla = resolvedTickets.filter(t => t.sla_due);
            const withinSla = resolvedWithSla.filter(t =>
                new Date(t.resolved_at!) <= new Date(t.sla_due!)
            ).length;
            const slaCompliance = resolvedWithSla.length > 0
                ? Math.round((withinSla / resolvedWithSla.length) * 100)
                : 100;

            // By category
            const byCategory: Record<string, number> = {};
            all.forEach(t => {
                const key = t.category_id || 'uncategorized';
                byCategory[key] = (byCategory[key] || 0) + 1;
            });

            // By channel
            const byChannel: Record<string, number> = {};
            all.forEach(t => {
                byChannel[t.channel] = (byChannel[t.channel] || 0) + 1;
            });

            // By priority
            const byPriority: Record<string, number> = {};
            all.forEach(t => {
                byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
            });

            return {
                total: all.length,
                open,
                inProgress,
                onHold,
                resolvedToday,
                avgResolutionHours,
                slaCompliance,
                byCategory,
                byChannel,
                byPriority,
            };
        },
        refetchInterval: 30000, // Refresh every 30s
    });
}


// ─── Agents (profiles with ticketing access) ──
export function useAgents() {
    return useQuery({
        queryKey: ['ticketing-agents'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, avatar_url, role')
                .eq('has_ticketing_access', true);
            if (error) throw error;
            return data || [];
        },
    });
}

// ─── Settings Mutations ───────────────────────
export function useTicketSettingsMutations() {
    const queryClient = useQueryClient();

    // Categories
    const createCategory = useMutation({
        mutationFn: async (category: Partial<TicketCategory>) => {
            const { data, error } = await supabase
                .from('ticket_categories')
                .insert(category)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ticket-categories'] }),
    });

    const updateCategory = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<TicketCategory> }) => {
            const { data, error } = await supabase
                .from('ticket_categories')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ticket-categories'] }),
    });

    const deleteCategory = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('ticket_categories')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ticket-categories'] }),
    });

    // Subcategories
    const createSubcategory = useMutation({
        mutationFn: async (subcategory: Partial<TicketSubcategory>) => {
            const { data, error } = await supabase
                .from('ticket_subcategories')
                .insert(subcategory)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['ticket-subcategories'] });
            if (variables.category_id) {
                queryClient.invalidateQueries({ queryKey: ['ticket-subcategories', variables.category_id] });
            }
        },
    });

    const updateSubcategory = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<TicketSubcategory> }) => {
            const { data, error } = await supabase
                .from('ticket_subcategories')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['ticket-subcategories'] });
        },
    });

    const deleteSubcategory = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('ticket_subcategories')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ticket-subcategories'] }),
    });

    // SLA Config
    const updateSlaConfig = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<TicketSlaConfig> }) => {
            const { data, error } = await supabase
                .from('ticket_sla_config')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ticket-sla-config'] }),
    });

    return {
        createCategory,
        updateCategory,
        deleteCategory,
        createSubcategory,
        updateSubcategory,
        deleteSubcategory,
        updateSlaConfig,
    };
}
