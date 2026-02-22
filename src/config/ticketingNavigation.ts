/**
 * Customer Care Ticketing System Navigation Configuration
 */

import { LayoutDashboard, Ticket, MessageSquare, Users, FileText, Settings } from "lucide-react";

interface NavigationItem {
    id: string;
    label: string;
    href: string;
    icon: any;
    description?: string;
    badge?: string | number;
    keywords?: string[];
}

interface NavigationSection {
    id: string;
    label: string;
    items: NavigationItem[];
    collapsible?: boolean;
    defaultCollapsed?: boolean;
}

export const ticketingNavigationConfig: NavigationSection[] = [
    {
        id: 'core',
        label: 'Core',
        collapsible: true,
        defaultCollapsed: false,
        items: [
            {
                id: 'ticketing-dashboard',
                label: 'Dashboard',
                href: '/customer-care',
                icon: LayoutDashboard,
                description: 'Ticketing overview and KPIs',
                keywords: ['dashboard', 'home', 'overview', 'kpis'],
            },
            {
                id: 'tickets',
                label: 'Tickets',
                href: '/customer-care/tickets',
                icon: Ticket,
                description: 'Customer complaints and issues',
                keywords: ['tickets', 'complaints', 'issues', 'support'],
            },
            {
                id: 'ticketing-work-orders',
                label: 'Work Orders',
                href: '/customer-care/work-orders',
                icon: FileText,
                description: 'Technical issues from customers',
                keywords: ['work', 'orders', 'technical', 'maintenance'],
            },
        ],
    },
    {
        id: 'communication',
        label: 'Communication',
        collapsible: true,
        defaultCollapsed: false,
        items: [
            {
                id: 'ticketing-chat',
                label: 'Chat',
                href: '/customer-care/chat',
                icon: MessageSquare,
                description: 'WhatsApp customer support',
                keywords: ['chat', 'messages', 'whatsapp', 'support'],
            },
        ],
    },
    {
        id: 'people',
        label: 'People',
        collapsible: true,
        defaultCollapsed: false,
        items: [
            {
                id: 'ticketing-customers',
                label: 'Customers',
                href: '/customer-care/customers',
                icon: Users,
                description: 'Customer management',
                keywords: ['customers', 'clients', 'contacts'],
            },
        ],
    },
    {
        id: 'ticketing-system',
        label: 'System',
        collapsible: true,
        defaultCollapsed: false,
        items: [
            {
                id: 'ticketing-settings',
                label: 'Settings',
                href: '/customer-care/settings',
                icon: Settings,
                description: 'Ticketing configuration',
                keywords: ['settings', 'config', 'sla', 'categories'],
            },
        ],
    },
];
