
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Zap, Calendar, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface TriggerSectionProps {
    triggerType: string;
    setTriggerType: (type: string) => void;
    triggerValue: string;
    setTriggerValue: (value: string) => void;
    assetPropertyType: string;
    setAssetPropertyType: (type: string) => void;
}

export function TriggerSection({
    triggerType,
    setTriggerType,
    triggerValue,
    setTriggerValue,
    assetPropertyType,
    setAssetPropertyType
}: TriggerSectionProps) {

    const { data: locations } = useQuery({
        queryKey: ['locations'],
        queryFn: async () => {
            const { data } = await supabase.from('locations').select('id, name').order('name');
            return data || [];
        }
    });

    const { data: technicians } = useQuery({
        queryKey: ['technicians'],
        queryFn: async () => {
            const { data } = await supabase.from('technicians').select('id, name').eq('is_active', true).order('name');
            return data || [];
        }
    });

    const getTriggerIcon = (type: string) => {
        if (type.includes('scheduled')) return <Calendar className="w-3.5 h-3.5" />;
        if (type.includes('due') || type.includes('overdue')) return <Clock className="w-3.5 h-3.5" />;
        return <Zap className="w-3.5 h-3.5" />;
    };

    return (
        <div className="space-y-3">
            {/* Section Header */}
            <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center">
                    {getTriggerIcon(triggerType)}
                </div>
                <Label className="text-sm font-semibold text-slate-700">When</Label>
            </div>

            {/* Card */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-500">Event trigger</Label>
                    <Select
                        value={triggerType}
                        onValueChange={(value) => {
                            setTriggerType(value);
                            setTriggerValue('');
                            setAssetPropertyType('');
                        }}
                    >
                        <SelectTrigger className="h-9 bg-slate-50 border-slate-200 focus:ring-teal-500/20 focus:border-teal-400">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Work Order Events</SelectLabel>
                                <SelectItem value="work_order_created">Work Order Created</SelectItem>
                                <SelectItem value="work_order_status_changed_to">Status Changes To</SelectItem>
                                <SelectItem value="work_order_status_transition">Status Transitions</SelectItem>
                                <SelectItem value="work_order_priority_changed_to">Priority Changes</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                                <SelectLabel>Assignments</SelectLabel>
                                <SelectItem value="work_order_assigned_to_user">Assigned to User</SelectItem>
                                <SelectItem value="work_order_assigned_to_location">Assigned to Location</SelectItem>
                                <SelectItem value="work_order_assigned_to_asset">Assigned to Asset</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                                <SelectLabel>Time Based</SelectLabel>
                                <SelectItem value="work_order_due_within">Due Within</SelectItem>
                                <SelectItem value="work_order_overdue_by">Overdue By</SelectItem>
                                <SelectItem value="scheduled_daily">Daily Schedule</SelectItem>
                                <SelectItem value="scheduled_weekly">Weekly Schedule</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                                <SelectLabel>Customer</SelectLabel>
                                <SelectItem value="customer_type_is">Customer Type Is</SelectItem>
                                <SelectItem value="customer_has_phone">Customer Has Phone</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                {/* Dynamic Config Fields */}
                {triggerType === 'work_order_status_changed_to' && (
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-500">New status</Label>
                        <Select value={triggerValue} onValueChange={setTriggerValue}>
                            <SelectTrigger className="h-9 bg-slate-50 border-slate-200 focus:ring-teal-500/20 focus:border-teal-400">
                                <SelectValue placeholder="Select status..." />
                            </SelectTrigger>
                            <SelectContent>
                                {['New', 'Ready', 'In Progress', 'Completed', 'On Hold', 'Awaiting Confirmation'].map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {triggerType === 'work_order_priority_changed_to' && (
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-500">New priority</Label>
                        <Select value={triggerValue} onValueChange={setTriggerValue}>
                            <SelectTrigger className="h-9 bg-slate-50 border-slate-200 focus:ring-teal-500/20 focus:border-teal-400">
                                <SelectValue placeholder="Select priority..." />
                            </SelectTrigger>
                            <SelectContent>
                                {['Critical', 'High', 'Medium', 'Low'].map(p => (
                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {triggerType === 'work_order_assigned_to_location' && (
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-500">Location</Label>
                        <Select value={triggerValue} onValueChange={setTriggerValue}>
                            <SelectTrigger className="h-9 bg-slate-50 border-slate-200 focus:ring-teal-500/20 focus:border-teal-400">
                                <SelectValue placeholder="Select location..." />
                            </SelectTrigger>
                            <SelectContent>
                                {locations?.map(l => (
                                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {triggerType === 'work_order_assigned_to_user' && (
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-500">Technician</Label>
                        <Select value={triggerValue} onValueChange={setTriggerValue}>
                            <SelectTrigger className="h-9 bg-slate-50 border-slate-200 focus:ring-teal-500/20 focus:border-teal-400">
                                <SelectValue placeholder="Select technician..." />
                            </SelectTrigger>
                            <SelectContent>
                                {technicians?.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {triggerType === 'work_order_assigned_to_asset' && (
                    <>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-500">Asset property</Label>
                            <Select value={assetPropertyType} onValueChange={setAssetPropertyType}>
                                <SelectTrigger className="h-9 bg-slate-50 border-slate-200 focus:ring-teal-500/20 focus:border-teal-400">
                                    <SelectValue placeholder="Select property..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ownership">Ownership</SelectItem>
                                    <SelectItem value="warranty">Warranty Status</SelectItem>
                                    <SelectItem value="emergency">Emergency Designated</SelectItem>
                                    <SelectItem value="type">Asset Type</SelectItem>
                                    <SelectItem value="location">Asset Location</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {assetPropertyType === 'ownership' && (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-500">Value</Label>
                                <Select value={triggerValue} onValueChange={setTriggerValue}>
                                    <SelectTrigger className="h-9 bg-slate-50 border-slate-200 focus:ring-teal-500/20 focus:border-teal-400">
                                        <SelectValue placeholder="Select ownership..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="company_asset">Company Asset</SelectItem>
                                        <SelectItem value="individual_asset">Individual Asset</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {assetPropertyType === 'type' && (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-500">Asset type</Label>
                                <Input
                                    value={triggerValue}
                                    onChange={e => setTriggerValue(e.target.value)}
                                    placeholder="e.g. Scooter, Bike"
                                    className="h-9 bg-slate-50 border-slate-200 focus-visible:ring-teal-500/20 focus-visible:border-teal-400"
                                />
                            </div>
                        )}
                    </>
                )}

                {(triggerType === 'work_order_due_within' || triggerType === 'work_order_overdue_by') && (
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-500">Days</Label>
                        <Input
                            type="number"
                            min="1"
                            value={triggerValue}
                            onChange={e => setTriggerValue(e.target.value)}
                            placeholder="Number of days"
                            className="h-9 bg-slate-50 border-slate-200 focus-visible:ring-teal-500/20 focus-visible:border-teal-400"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
