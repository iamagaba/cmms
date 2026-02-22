
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Plus, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Action } from './types';

interface ActionsSectionProps {
    actions: Action[];
    setActions: (actions: Action[]) => void;
}

export function ActionsSection({ actions, setActions }: ActionsSectionProps) {

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
            const { data } = await supabase.from('technicians').select('id, name, avatar').eq('is_active', true).order('name');
            return data || [];
        }
    });

    const { data: categories } = useQuery({
        queryKey: ['service_categories'],
        queryFn: async () => {
            const { data } = await supabase.from('diagnostic_categories').select('id, label').order('label');
            return data || [];
        }
    });

    const addAction = () => {
        setActions([...actions, { type: 'assign_user', value: '' }]);
    };

    const removeAction = (index: number) => {
        if (actions.length > 1) {
            setActions(actions.filter((_, i) => i !== index));
        }
    };

    const updateAction = (index: number, field: 'type' | 'value' | 'label', value: string) => {
        const updated = [...actions];
        updated[index] = { ...updated[index], [field]: value };
        if (field === 'type') {
            updated[index].value = '';
            updated[index].label = undefined;
        }
        setActions(updated);
    };

    return (
        <div className="space-y-3">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 ml-0.5" />
                    </div>
                    <Label className="text-sm font-semibold text-slate-700">Then</Label>
                    <span className="text-red-400 text-xs">*</span>
                </div>
                {actions.length > 0 && (
                    <span className="text-[11px] text-slate-400 tabular-nums">
                        {actions.length} action{actions.length > 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Card */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                {actions.map((action, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-2 p-3 bg-slate-50 rounded-md border border-slate-100 group"
                    >
                        <div className="flex-1 space-y-2">
                            {/* Action Type */}
                            <Select
                                value={action.type}
                                onValueChange={(value) => updateAction(index, 'type', value)}
                            >
                                <SelectTrigger className="h-8 border-slate-200 bg-white text-xs font-medium focus:ring-teal-500/20 focus:border-teal-400">
                                    <SelectValue placeholder="Select action..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="assign_user">Assign user</SelectItem>
                                    <SelectItem value="assign_priority">Set priority</SelectItem>
                                    <SelectItem value="assign_location">Set location</SelectItem>
                                    <SelectItem value="assign_category">Set category</SelectItem>
                                    <SelectItem value="change_status">Change status</SelectItem>
                                    <SelectItem value="send_notification">Send notification</SelectItem>
                                    <SelectItem value="set_due_date">Set due date</SelectItem>
                                    <SelectItem value="add_comment">Add comment</SelectItem>
                                    <SelectItem value="create_task">Create task</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Value Fields */}
                            {action.type === 'assign_user' && (
                                <Select value={action.value} onValueChange={(v) => updateAction(index, 'value', v)}>
                                    <SelectTrigger className="h-8 border-slate-200 bg-white text-xs focus:ring-teal-500/20 focus:border-teal-400">
                                        <SelectValue placeholder="Select user..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {technicians?.map((tech) => (
                                            <SelectItem key={tech.id} value={tech.id}>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-5 w-5">
                                                        <AvatarImage src={tech.avatar || undefined} alt={tech.name} />
                                                        <AvatarFallback className="text-[9px]">{tech.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <span>{tech.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {action.type === 'change_status' && (
                                <Select value={action.value} onValueChange={(v) => updateAction(index, 'value', v)}>
                                    <SelectTrigger className="h-8 border-slate-200 bg-white text-xs focus:ring-teal-500/20 focus:border-teal-400">
                                        <SelectValue placeholder="Select status..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['New', 'Ready', 'In Progress', 'Completed', 'On Hold', 'Awaiting Confirmation'].map(s => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {action.type === 'assign_priority' && (
                                <Select value={action.value} onValueChange={(v) => updateAction(index, 'value', v)}>
                                    <SelectTrigger className="h-8 border-slate-200 bg-white text-xs focus:ring-teal-500/20 focus:border-teal-400">
                                        <SelectValue placeholder="Select priority..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['Critical', 'High', 'Medium', 'Low'].map(p => (
                                            <SelectItem key={p} value={p}>{p}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {action.type === 'assign_location' && (
                                <Select value={action.value} onValueChange={(v) => updateAction(index, 'value', v)}>
                                    <SelectTrigger className="h-8 border-slate-200 bg-white text-xs focus:ring-teal-500/20 focus:border-teal-400">
                                        <SelectValue placeholder="Select location..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations?.map(loc => (
                                            <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {action.type === 'assign_category' && (
                                <Select value={action.value} onValueChange={(v) => updateAction(index, 'value', v)}>
                                    <SelectTrigger className="h-8 border-slate-200 bg-white text-xs focus:ring-teal-500/20 focus:border-teal-400">
                                        <SelectValue placeholder="Select category..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories?.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {action.type === 'send_notification' && (
                                <Select value={action.value} onValueChange={(v) => updateAction(index, 'value', v)}>
                                    <SelectTrigger className="h-8 border-slate-200 bg-white text-xs focus:ring-teal-500/20 focus:border-teal-400">
                                        <SelectValue placeholder="Notification type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="email_assigned_user">Email assigned user</SelectItem>
                                        <SelectItem value="email_customer">Email customer</SelectItem>
                                        <SelectItem value="email_manager">Email manager</SelectItem>
                                        <SelectItem value="reminder_due_date">Reminder — Due date</SelectItem>
                                        <SelectItem value="reminder_sla">Reminder — SLA</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}

                            {action.type === 'set_due_date' && (
                                <Select value={action.value} onValueChange={(v) => updateAction(index, 'value', v)}>
                                    <SelectTrigger className="h-8 border-slate-200 bg-white text-xs focus:ring-teal-500/20 focus:border-teal-400">
                                        <SelectValue placeholder="Due date..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1_hour">1 hour from now</SelectItem>
                                        <SelectItem value="2_hours">2 hours from now</SelectItem>
                                        <SelectItem value="4_hours">4 hours from now</SelectItem>
                                        <SelectItem value="8_hours">8 hours from now</SelectItem>
                                        <SelectItem value="1_day">1 day from now</SelectItem>
                                        <SelectItem value="2_days">2 days from now</SelectItem>
                                        <SelectItem value="1_week">1 week from now</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}

                            {action.type === 'add_comment' && (
                                <Input
                                    value={action.value}
                                    onChange={(e) => updateAction(index, 'value', e.target.value)}
                                    placeholder="Comment to add..."
                                    className="h-8 text-xs border-slate-200 bg-white focus-visible:ring-teal-500/20 focus-visible:border-teal-400"
                                />
                            )}

                            {action.type === 'create_task' && (
                                <Input
                                    value={action.value}
                                    onChange={(e) => updateAction(index, 'value', e.target.value)}
                                    placeholder="Task description..."
                                    className="h-8 text-xs border-slate-200 bg-white focus-visible:ring-teal-500/20 focus-visible:border-teal-400"
                                />
                            )}
                        </div>

                        {/* Remove */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 mt-0.5 text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeAction(index)}
                            disabled={actions.length === 1}
                        >
                            <X className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                ))}

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={addAction}
                    className="w-full h-8 text-xs text-slate-400 hover:text-teal-600 hover:bg-teal-50/50 border border-dashed border-slate-200 hover:border-teal-300"
                >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add action
                </Button>
            </div>
        </div>
    );
}
