/**
 * Ticket Form Drawer
 * Create or edit a ticket with category selection, customer lookup, and priority.
 */

import React, { useState, useEffect } from 'react';
import { X, Ticket } from 'lucide-react';

import { useTicketCategories, useTicketSubcategories, useTicketMutations } from '@/hooks/useTicketing';
import { useSession } from '@/context/SessionContext';
import { TicketPriority, TicketChannel, TICKET_PRIORITY_CONFIG, TICKET_CHANNEL_CONFIG } from '@/types/ticketing';
import { supabase } from '@/integrations/supabase/client';


interface TicketFormDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    prefill?: {
        customer_id?: string;
        customer_name?: string;
        vehicle_id?: string;
        channel?: TicketChannel;
    };
}

export const TicketFormDrawer: React.FC<TicketFormDrawerProps> = ({ isOpen, onClose, prefill }) => {
    const { session } = useSession();
    const { createTicket } = useTicketMutations();
    const { data: categories = [] } = useTicketCategories();


    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [subcategoryId, setSubcategoryId] = useState('');
    const [priority, setPriority] = useState<TicketPriority>('medium');
    const [channel, setChannel] = useState<TicketChannel>(prefill?.channel || 'phone');
    const [customerSearch, setCustomerSearch] = useState(prefill?.customer_name || '');
    const [customerId, setCustomerId] = useState(prefill?.customer_id || '');
    const [vehicleId, setVehicleId] = useState(prefill?.vehicle_id || '');
    const [customers, setCustomers] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: subcategories = [] } = useTicketSubcategories(categoryId || null);

    // Search customers
    useEffect(() => {
        if (customerSearch.length < 2) { setCustomers([]); return; }
        const timeout = setTimeout(async () => {
            const { data } = await supabase
                .from('customers')
                .select('id, name, phone')
                .ilike('name', `%${customerSearch}%`)
                .limit(8);
            setCustomers(data || []);
            setShowCustomerDropdown(true);
        }, 300);
        return () => clearTimeout(timeout);
    }, [customerSearch]);

    // Fetch vehicles for selected customer
    useEffect(() => {
        if (!customerId) { setVehicles([]); return; }
        (async () => {
            const { data } = await supabase
                .from('vehicles')
                .select('id, license_plate, make, model, year')
                .eq('customer_id', customerId);
            setVehicles(data || []);
        })();
    }, [customerId]);

    // Reset form on open/close
    useEffect(() => {
        if (isOpen) {
            setSubject('');
            setDescription('');
            setCategoryId('');
            setSubcategoryId('');
            setPriority('medium');
            setChannel(prefill?.channel || 'phone');
            setCustomerSearch(prefill?.customer_name || '');
            setCustomerId(prefill?.customer_id || '');
            setVehicleId(prefill?.vehicle_id || '');
        }
    }, [isOpen, prefill]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim()) return;

        setIsSubmitting(true);
        try {
            await createTicket.mutateAsync({
                subject: subject.trim(),
                description: description.trim() || null,
                category_id: categoryId || null,
                subcategory_id: subcategoryId || null,
                priority,
                channel,
                customer_id: customerId || null,
                vehicle_id: vehicleId || null,
                created_by: session?.user?.id,
                status: 'open',
            } as any);
            onClose();
        } catch (err) {
            console.error('Failed to create ticket:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-background border-l border-border shadow-xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground">Create Ticket</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-md hover:bg-accent transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    {/* Subject */}
                    <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Subject *</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            placeholder="Brief summary of the issue"
                            className="w-full h-9 px-3 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/40 outline-none"
                            required
                        />
                    </div>

                    {/* Customer */}
                    <div className="relative">
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Customer</label>
                        <input
                            type="text"
                            value={customerSearch}
                            onChange={e => { setCustomerSearch(e.target.value); setCustomerId(''); }}
                            placeholder="Search by name"
                            className="w-full h-9 px-3 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/40 outline-none"
                        />
                        {showCustomerDropdown && customers.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {customers.map(c => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => {
                                            setCustomerId(c.id);
                                            setCustomerSearch(c.name);
                                            setShowCustomerDropdown(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                                    >
                                        <span className="text-foreground">{c.name}</span>
                                        {c.phone && <span className="text-xs text-muted-foreground ml-2">{c.phone}</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Vehicle (if customer selected) */}
                    {customerId && vehicles.length > 0 && (
                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Vehicle</label>
                            <select
                                value={vehicleId}
                                onChange={e => setVehicleId(e.target.value)}
                                className="w-full h-9 px-3 text-sm rounded-md border border-border bg-background text-foreground focus:ring-1 focus:ring-primary/40 outline-none"
                            >
                                <option value="">Select vehicle</option>
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.license_plate} — {v.make} {v.model} ({v.year})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Category + Subcategory */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Category</label>
                            <select
                                value={categoryId}
                                onChange={e => { setCategoryId(e.target.value); setSubcategoryId(''); }}
                                className="w-full h-9 px-3 text-sm rounded-md border border-border bg-background text-foreground focus:ring-1 focus:ring-primary/40 outline-none"
                            >
                                <option value="">Select category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Subcategory</label>
                            <select
                                value={subcategoryId}
                                onChange={e => setSubcategoryId(e.target.value)}
                                disabled={!categoryId}
                                className="w-full h-9 px-3 text-sm rounded-md border border-border bg-background text-foreground focus:ring-1 focus:ring-primary/40 outline-none disabled:opacity-50"
                            >
                                <option value="">Select subcategory</option>
                                {subcategories.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Priority + Channel */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Priority</label>
                            <select
                                value={priority}
                                onChange={e => setPriority(e.target.value as TicketPriority)}
                                className="w-full h-9 px-3 text-sm rounded-md border border-border bg-background text-foreground focus:ring-1 focus:ring-primary/40 outline-none"
                            >
                                {Object.entries(TICKET_PRIORITY_CONFIG).map(([val, cfg]) => (
                                    <option key={val} value={val}>{cfg.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Channel</label>
                            <select
                                value={channel}
                                onChange={e => setChannel(e.target.value as TicketChannel)}
                                className="w-full h-9 px-3 text-sm rounded-md border border-border bg-background text-foreground focus:ring-1 focus:ring-primary/40 outline-none"
                            >
                                {Object.entries(TICKET_CHANNEL_CONFIG).map(([val, cfg]) => (
                                    <option key={val} value={val}>{cfg.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={4}
                            placeholder="Detailed description of the issue"
                            className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/40 outline-none resize-none"
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!subject.trim() || isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Ticket'}
                    </button>
                </div>
            </div>
        </>
    );
};
