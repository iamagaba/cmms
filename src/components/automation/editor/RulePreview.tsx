import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Condition, Action } from "./types";

interface RulePreviewProps {
    triggerType: string;
    triggerValue: string;
    conditions: Condition[];
    conditionLogic: 'all' | 'any';
    actions: Action[];
}

export function RulePreview({
    triggerType,
    triggerValue,
    conditions,
    conditionLogic,
    actions
}: RulePreviewProps) {

    // Fetch helper data for display
    const { data: locations } = useQuery({
        queryKey: ['locations'],
        queryFn: async () => {
            const { data } = await supabase.from('locations').select('id, name');
            return data || [];
        }
    });

    const { data: technicians } = useQuery({
        queryKey: ['technicians'],
        queryFn: async () => {
            const { data } = await supabase.from('technicians').select('id, name');
            return data || [];
        }
    });

    const { data: categories } = useQuery({
        queryKey: ['diagnostic_categories'],
        queryFn: async () => {
            const { data } = await supabase.from('diagnostic_categories').select('id, label');
            return data || [];
        }
    });

    const getLabel = (id: string, type: 'location' | 'technician' | 'category') => {
        if (!id) return '...';
        if (type === 'location') return locations?.find(l => l.id === id)?.name || id;
        if (type === 'technician') return technicians?.find(t => t.id === id)?.name || id;
        if (type === 'category') return categories?.find(c => c.id === id)?.label || id;
        return id;
    };

    const formatTrigger = (type: string, value: string) => {
        switch (type) {
            case 'work_order_created': return "Work Order Created";
            case 'work_order_status_changed_to': return `Status Changes to "${value || '...'}"`;
            case 'work_order_priority_changed_to': return `Priority Changes to "${value || '...'}"`;
            case 'work_order_assigned_to_user': return `Assigned to ${value ? getLabel(value, 'technician') : 'Technician'}`;
            case 'work_order_assigned_to_location': return `Assigned to ${value ? getLabel(value, 'location') : 'Location'}`;
            case 'work_order_assigned_to_asset': return "Assigned to Asset";
            default: return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    };

    const formatAction = (action: Action) => {
        switch (action.type) {
            case 'assign_user': return `Assign to ${action.value ? getLabel(action.value, 'technician') : '...'}`;
            case 'assign_location': return `Assign to ${action.value ? getLabel(action.value, 'location') : '...'}`;
            case 'assign_category': return `Set Category to ${action.value ? getLabel(action.value, 'category') : '...'}`;
            case 'change_status': return `Change Status to "${action.value || '...'}"`;
            case 'assign_priority': return `Set Priority to "${action.value || '...'}"`;
            case 'send_notification': return `Send ${action.value ? action.value.replace(/_/g, ' ') : 'Notification'}`;
            default: return action.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    };

    return (
        <Card className="bg-muted/40 border-0 shadow-none">
            <CardContent className="p-4">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-4">Logic Flow</h4>

                <div className="relative space-y-4">
                    {/* Vertical connector line */}
                    <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-border -z-10" />

                    {/* Trigger */}
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-800 flex items-center justify-center shrink-0 z-10">
                            <span className="text-[10px] font-bold text-yellow-700 dark:text-yellow-400">1</span>
                        </div>
                        <div className="text-sm pt-0.5">
                            <span className="font-medium block text-muted-foreground text-xs mb-0.5">When</span>
                            <span className="font-medium text-foreground">{formatTrigger(triggerType, triggerValue)}</span>
                        </div>
                    </div>

                    {/* Conditions */}
                    {conditions.length > 0 && (
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 z-10">
                                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400">2</span>
                            </div>
                            <div className="text-sm pt-0.5 w-full">
                                <span className="font-medium block text-muted-foreground text-xs mb-1.5">
                                    If {conditionLogic === 'all' ? 'ALL' : 'ANY'} match
                                </span>
                                <div className="space-y-1.5">
                                    {conditions.map((c, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs bg-background p-1.5 rounded border shadow-sm">
                                            <CheckCircle2 className="w-3 h-3 text-blue-500" />
                                            <span className="truncate">
                                                {c.type === 'category' && `Category is "${getLabel(c.value, 'category')}"`}
                                                {c.type === 'priority' && `Priority is "${c.value}"`}
                                                {c.type === 'user' && `Technician is "${getLabel(c.value, 'technician')}"`}
                                                {!['category', 'priority', 'user'].includes(c.type) && `${c.type} check`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-800 flex items-center justify-center shrink-0 z-10">
                            <span className="text-[10px] font-bold text-green-700 dark:text-green-400">{conditions.length > 0 ? 3 : 2}</span>
                        </div>
                        <div className="text-sm pt-0.5 w-full">
                            <span className="font-medium block text-muted-foreground text-xs mb-1.5">Then</span>
                            <div className="space-y-1.5">
                                {actions.map((a, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs bg-background p-1.5 rounded border shadow-sm">
                                        <ArrowRight className="w-3 h-3 text-green-500" />
                                        <span className="truncate">{formatAction(a)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
