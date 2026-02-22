// =============================================
// CUSTOMER CARE TICKETING SYSTEM TYPES
// =============================================

export type TicketStatus = 'open' | 'in_progress' | 'on_hold' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketChannel = 'whatsapp' | 'email' | 'phone' | 'walk_in';

export type UserRole =
    | 'system_admin'
    | 'maintenance_manager'
    | 'maintenance_technician'
    | 'customer_care_manager'
    | 'customer_care_agent'
    | 'dual_access_manager';

export type ActiveSystem = 'cmms' | 'ticketing';

export type TicketCategory = {
    id: string;
    name: string;
    description?: string | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
};

export type TicketSubcategory = {
    id: string;
    category_id: string;
    name: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
};

export type Ticket = {
    id: string;
    ticket_number?: string | null;
    customer_id?: string | null;
    vehicle_id?: string | null;
    category_id?: string | null;
    subcategory_id?: string | null;
    subject: string;
    description?: string | null;
    status: TicketStatus;
    priority: TicketPriority;
    assigned_agent_id?: string | null;
    channel: TicketChannel;
    sla_due?: string | null;
    on_hold_reason?: string | null;
    resolved_at?: string | null;
    closed_at?: string | null;
    related_work_order_id?: string | null;
    staff_type?: string | null;
    created_by?: string | null;
    created_at: string;
    updated_at: string;
    // Joined relations (populated by queries)
    customer?: { id: string; name: string; phone?: string | null; customer_type?: string | null } | null;
    vehicle?: { id: string; license_plate: string; make: string; model: string; year: number } | null;
    category?: TicketCategory | null;
    subcategory?: TicketSubcategory | null;
    assigned_agent?: { id: string; first_name?: string | null; last_name?: string | null; avatar_url?: string | null } | null;
};

export type TicketNote = {
    id: string;
    ticket_id: string;
    content: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    // Joined
    profile?: { id: string; first_name?: string | null; last_name?: string | null; avatar_url?: string | null } | null;
};

export type WorkOrderNote = {
    id: string;
    work_order_id: string;
    content: string;
    created_by: string;
    source_system: 'cmms' | 'ticketing';
    created_at: string;
    updated_at: string;
    // Joined
    profile?: { id: string; first_name?: string | null; last_name?: string | null; avatar_url?: string | null } | null;
};

export type TicketSlaConfig = {
    id: string;
    category_id: string | null; // Allow null for default/global config if needed, or specific category
    priority: TicketPriority;
    response_time_hours: number;
    resolution_time_hours: number;
    created_at: string;
    updated_at: string;
};

// Status labels and colors
export const TICKET_STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; bgColor: string; icon: 'dashed' | 'check' | 'arrow' | 'pause' }> = {
    open: { label: 'Open', color: '#64748b', bgColor: 'bg-slate-100 dark:bg-slate-900/30', icon: 'dashed' },
    in_progress: { label: 'In Progress', color: '#f59e0b', bgColor: 'bg-amber-100 dark:bg-amber-900/30', icon: 'arrow' },
    on_hold: { label: 'On Hold', color: '#f97316', bgColor: 'bg-orange-100 dark:bg-orange-900/30', icon: 'pause' },
    resolved: { label: 'Resolved', color: '#10b981', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'check' },
    closed: { label: 'Closed', color: '#10b981', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'check' },
};

export const TICKET_PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string; bgColor: string }> = {
    low: { label: 'Low', color: '#22c55e', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    medium: { label: 'Medium', color: '#f59e0b', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
    high: { label: 'High', color: '#ef4444', bgColor: 'bg-red-100 dark:bg-red-900/30' },
    urgent: { label: 'Urgent', color: '#ef4444', bgColor: 'bg-red-100 dark:bg-red-900/30' },
};

export const TICKET_CHANNEL_CONFIG: Record<TicketChannel, { label: string; icon: string }> = {
    whatsapp: { label: 'WhatsApp', icon: 'MessageSquare' },
    email: { label: 'Email', icon: 'Mail' },
    phone: { label: 'Phone', icon: 'Phone' },
    walk_in: { label: 'Walk-in', icon: 'UserCheck' },
};

// Role helpers
export const ROLE_LABELS: Record<UserRole, string> = {
    system_admin: 'System Administrator',
    maintenance_manager: 'Maintenance Manager',
    maintenance_technician: 'Maintenance Technician',
    customer_care_manager: 'Customer Care Manager',
    customer_care_agent: 'Customer Care Agent',
    dual_access_manager: 'Dual Access Manager',
};

export const CMMS_ROLES: UserRole[] = ['system_admin', 'maintenance_manager', 'maintenance_technician', 'dual_access_manager'];
export const TICKETING_ROLES: UserRole[] = ['system_admin', 'customer_care_manager', 'customer_care_agent', 'dual_access_manager'];

export function hasCmmsAccess(role?: string | null): boolean {
    if (!role) return true; // backwards compat: default to CMMS
    return CMMS_ROLES.includes(role as UserRole);
}

export function hasTicketingAccess(role?: string | null): boolean {
    if (!role) return false;
    return TICKETING_ROLES.includes(role as UserRole);
}

export function hasDualAccess(role?: string | null): boolean {
    return hasCmmsAccess(role) && hasTicketingAccess(role);
}
