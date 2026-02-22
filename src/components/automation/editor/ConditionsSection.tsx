
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Condition } from './types';
import { cn } from '@/lib/utils';

interface ConditionsSectionProps {
    conditions: Condition[];
    setConditions: (conditions: Condition[]) => void;
    conditionLogic: 'all' | 'any';
    setConditionLogic: (logic: 'all' | 'any') => void;
}

export function ConditionsSection({
    conditions,
    setConditions,
    conditionLogic,
    setConditionLogic
}: ConditionsSectionProps) {

    const { data: categories } = useQuery({
        queryKey: ['service_categories'],
        queryFn: async () => {
            const { data } = await supabase.from('diagnostic_categories').select('id, label').order('label');
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

    const addCondition = () => {
        setConditions([...conditions, { type: 'category', value: '' }]);
    };

    const removeCondition = (index: number) => {
        setConditions(conditions.filter((_, i) => i !== index));
    };

    const updateCondition = (index: number, field: keyof Condition, value: string) => {
        const updated = [...conditions];
        updated[index] = { ...updated[index], [field]: value };
        if (field === 'type') {
            updated[index].value = '';
            updated[index].propertyType = undefined;
        }
        setConditions(updated);
    };

    return (
        <div className="space-y-3">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Filter className="w-3.5 h-3.5" />
                    </div>
                    <Label className="text-sm font-semibold text-slate-700">If</Label>
                    <span className="text-xs text-slate-400">(optional)</span>
                </div>

                {conditions.length > 1 && (
                    <div className="flex items-center bg-slate-100 rounded-full p-0.5 border border-slate-200">
                        <button
                            className={cn(
                                "px-2.5 py-0.5 text-[10px] font-semibold uppercase rounded-full transition-all",
                                conditionLogic === 'all'
                                    ? 'bg-white shadow-sm text-slate-700'
                                    : 'text-slate-400 hover:text-slate-600'
                            )}
                            onClick={() => setConditionLogic('all')}
                        >
                            All
                        </button>
                        <button
                            className={cn(
                                "px-2.5 py-0.5 text-[10px] font-semibold uppercase rounded-full transition-all",
                                conditionLogic === 'any'
                                    ? 'bg-white shadow-sm text-slate-700'
                                    : 'text-slate-400 hover:text-slate-600'
                            )}
                            onClick={() => setConditionLogic('any')}
                        >
                            Any
                        </button>
                    </div>
                )}
            </div>

            {/* Card */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                {conditions.length === 0 ? (
                    <button
                        onClick={addCondition}
                        className="w-full py-6 text-center border-2 border-dashed border-slate-200 rounded-lg hover:border-teal-300 hover:bg-teal-50/30 transition-colors group cursor-pointer"
                    >
                        <p className="text-sm text-slate-400 group-hover:text-teal-600">
                            No conditions set
                        </p>
                        <p className="text-xs text-slate-300 group-hover:text-teal-500 mt-1">
                            Click to add filtering criteria
                        </p>
                    </button>
                ) : (
                    <>
                        {conditions.map((condition, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 p-2 bg-slate-50 rounded-md border border-slate-100 group"
                            >
                                {/* Field Type */}
                                <Select
                                    value={condition.type}
                                    onValueChange={(val) => updateCondition(index, 'type', val)}
                                >
                                    <SelectTrigger className="h-8 w-[140px] shrink-0 border-slate-200 bg-white text-xs font-medium focus:ring-teal-500/20 focus:border-teal-400">
                                        <SelectValue placeholder="Field..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="category">Category</SelectItem>
                                        <SelectItem value="priority">Priority</SelectItem>
                                        <SelectItem value="asset_mileage">Asset Mileage</SelectItem>
                                        <SelectItem value="user">Technician</SelectItem>
                                        <SelectItem value="title_contains">Title Contains</SelectItem>
                                        <SelectItem value="day_of_week">Day of Week</SelectItem>
                                        <SelectItem value="time_of_day">Time of Day</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Operator hint */}
                                <span className="text-xs text-slate-400 shrink-0">is</span>

                                {/* Value */}
                                <div className="flex-1 min-w-0">
                                    {condition.type === 'category' && (
                                        <Select value={condition.value} onValueChange={(val) => updateCondition(index, 'value', val)}>
                                            <SelectTrigger className="h-8 border-slate-200 bg-white text-xs focus:ring-teal-500/20 focus:border-teal-400">
                                                <SelectValue placeholder="Select..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories?.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {condition.type === 'priority' && (
                                        <Select value={condition.value} onValueChange={(val) => updateCondition(index, 'value', val)}>
                                            <SelectTrigger className="h-8 border-slate-200 bg-white text-xs focus:ring-teal-500/20 focus:border-teal-400">
                                                <SelectValue placeholder="Select..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['Critical', 'High', 'Medium', 'Low'].map(p => (
                                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {condition.type === 'user' && (
                                        <Select value={condition.value} onValueChange={(val) => updateCondition(index, 'value', val)}>
                                            <SelectTrigger className="h-8 border-slate-200 bg-white text-xs focus:ring-teal-500/20 focus:border-teal-400">
                                                <SelectValue placeholder="Select..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {technicians?.map(t => (
                                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {condition.type === 'title_contains' && (
                                        <Input
                                            value={condition.value}
                                            onChange={(e) => updateCondition(index, 'value', e.target.value)}
                                            placeholder="Text to match..."
                                            className="h-8 text-xs border-slate-200 bg-white focus-visible:ring-teal-500/20 focus-visible:border-teal-400"
                                        />
                                    )}

                                    {condition.type === 'day_of_week' && (
                                        <Select value={condition.value} onValueChange={(val) => updateCondition(index, 'value', val)}>
                                            <SelectTrigger className="h-8 border-slate-200 bg-white text-xs focus:ring-teal-500/20 focus:border-teal-400">
                                                <SelectValue placeholder="Select day..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                                    <SelectItem key={d} value={d.toLowerCase()}>{d}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {condition.type === 'time_of_day' && (
                                        <div className="flex items-center gap-1.5">
                                            <Select
                                                value={condition.propertyType}
                                                onValueChange={(val) => updateCondition(index, 'propertyType', val)}
                                            >
                                                <SelectTrigger className="h-8 w-[90px] border-slate-200 bg-white text-xs focus:ring-teal-500/20 focus:border-teal-400">
                                                    <SelectValue placeholder="Op..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="before">Before</SelectItem>
                                                    <SelectItem value="after">After</SelectItem>
                                                    <SelectItem value="between">Between</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="time"
                                                value={condition.value}
                                                onChange={(e) => updateCondition(index, 'value', e.target.value)}
                                                className="h-8 text-xs border-slate-200 bg-white focus-visible:ring-teal-500/20 focus-visible:border-teal-400"
                                            />
                                        </div>
                                    )}

                                    {condition.type === 'asset_mileage' && (
                                        <div className="flex items-center gap-1.5">
                                            <Select
                                                value={condition.propertyType}
                                                onValueChange={(val) => updateCondition(index, 'propertyType', val)}
                                            >
                                                <SelectTrigger className="h-8 w-[90px] border-slate-200 bg-white text-xs focus:ring-teal-500/20 focus:border-teal-400">
                                                    <SelectValue placeholder="Op..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="greater_than">&gt;</SelectItem>
                                                    <SelectItem value="less_than">&lt;</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="number"
                                                value={condition.value}
                                                onChange={(e) => updateCondition(index, 'value', e.target.value)}
                                                placeholder="km"
                                                className="h-8 text-xs border-slate-200 bg-white focus-visible:ring-teal-500/20 focus-visible:border-teal-400"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Remove */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 shrink-0 text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeCondition(index)}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        ))}
                    </>
                )}

                {conditions.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={addCondition}
                        className="w-full h-8 text-xs text-slate-400 hover:text-teal-600 hover:bg-teal-50/50 border border-dashed border-slate-200 hover:border-teal-300"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Add condition
                    </Button>
                )}
            </div>
        </div>
    );
}
