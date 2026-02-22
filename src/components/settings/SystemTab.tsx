
import React, { useState, useMemo } from 'react';
import { useSystemSettings } from '@/context/SystemSettingsContext';
import { useWorkOrderData } from "@/hooks/useWorkOrderData";
import { useForm } from 'react-hook-form';
import { showSuccess, showError } from '@/utils/toast';
import {
    Clock,
    Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// Helper to convert stored hours to UI value/unit
const toUiValue = (hours: number) => {
    if (!hours) return { value: '', unit: 'hours' };
    if (hours % 24 === 0) return { value: (hours / 24).toString(), unit: 'days' };
    return { value: hours.toString(), unit: 'hours' };
};

// Helper to convert UI value/unit to stored hours
const toStoredHours = (value: string, unit: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    return unit === 'days' ? num * 24 : num;
};

const SystemTab = () => {
    const { settings, updateSettings } = useSystemSettings() as any;
    const { serviceCategories } = useWorkOrderData();

    // Parse initial SLA config
    const initialSlaConfig = useMemo(() => {
        try {
            const parsed = settings?.sla_config ? JSON.parse(settings.sla_config) : {};

            // Convert stored hours to UI state
            const uiState: Record<string, any> = {};

            Object.keys(parsed).forEach(key => {
                const entry = parsed[key];
                uiState[key] = {
                    high: toUiValue(entry.high),
                    medium: toUiValue(entry.medium),
                    low: toUiValue(entry.low),
                };
            });
            return uiState;
        } catch (e) {
            console.error('Failed to parse SLA config', e);
            return {};
        }
    }, [settings?.sla_config]);

    // Local state structure: { categoryId: { high: { value: '1', unit: 'days' }, ... } }
    const [slaConfigs, setSlaConfigs] = useState<Record<string, { high: { value: string, unit: string }; medium: { value: string, unit: string }; low: { value: string, unit: string } }>>(initialSlaConfig);

    // Initialize defaults for new categories
    React.useEffect(() => {
        if (serviceCategories.length > 0) {
            setSlaConfigs(prev => {
                const next = { ...prev };
                let changed = false;
                serviceCategories.forEach(cat => {
                    if (!next[cat.id]) {
                        next[cat.id] = {
                            high: { value: '24', unit: 'hours' },
                            medium: { value: '3', unit: 'days' },
                            low: { value: '7', unit: 'days' }
                        };
                        changed = true;
                    }
                });
                return changed ? next : prev;
            });
        }
    }, [serviceCategories]);

    const { handleSubmit } = useForm({
        defaultValues: {
            notifications: settings?.notifications_enabled ?? true,
            darkMode: settings?.dark_mode ?? false,
            slaThreshold: settings?.sla_threshold ?? 3,
        },
    });

    // Update local state when inputs change
    const handleSlaChange = (categoryId: string, priority: 'high' | 'medium' | 'low', field: 'value' | 'unit', val: string) => {
        setSlaConfigs(prev => ({
            ...prev,
            [categoryId]: {
                ...(prev[categoryId] || {
                    high: { value: '24', unit: 'hours' },
                    medium: { value: '3', unit: 'days' },
                    low: { value: '7', unit: 'days' }
                }),
                [priority]: {
                    ...prev[categoryId][priority],
                    [field]: val
                }
            }
        }));
    };

    const onSubmit = async (data: any) => {
        try {
            // Convert UI state back to stored format (total hours)
            const storedConfig: Record<string, { high: number; medium: number; low: number }> = {};

            Object.entries(slaConfigs).forEach(([catId, priorities]) => {
                storedConfig[catId] = {
                    high: toStoredHours(priorities.high.value, priorities.high.unit),
                    medium: toStoredHours(priorities.medium.value, priorities.medium.unit),
                    low: toStoredHours(priorities.low.value, priorities.low.unit),
                };
            });

            if (updateSettings) {
                const updates = {
                    notifications_enabled: data.notifications,
                    dark_mode: data.darkMode,
                    sla_threshold: data.slaThreshold,
                    sla_config: JSON.stringify(storedConfig),
                };

                await updateSettings(updates);
                showSuccess('Settings updated.');
            } else {
                showError('Settings update function not available');
            }
        } catch (error: any) {
            console.error('Error saving settings:', error);
            showError(error.message || 'Failed to update settings');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* SLA Configuration */}
            <Card className="border-none shadow-sm bg-card/50">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="p-2 bg-primary/10 rounded-md">
                                    <Clock className="w-5 h-5 text-primary" />
                                </div>
                                SLA Policies
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Set target resolution times. Use <span className="font-medium text-foreground">Hours</span> for quick fixes and <span className="font-medium text-foreground">Days</span> for larger jobs.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border bg-card overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/60">
                                    <TableHead className="w-[200px] text-xs font-bold text-muted-foreground pl-6 h-12">Service Category</TableHead>
                                    <TableHead className="text-center h-12">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                                            <span className="text-xs font-bold text-destructive">High Priority</span>
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-center h-12">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            <span className="text-xs font-bold text-amber-600">Medium Priority</span>
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-center h-12">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-xs font-bold text-emerald-600">Low Priority</span>
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {serviceCategories.map((category) => {
                                    const config = slaConfigs[category.id] || {
                                        high: { value: '24', unit: 'hours' },
                                        medium: { value: '3', unit: 'days' },
                                        low: { value: '7', unit: 'days' }
                                    };

                                    return (
                                        <TableRow key={category.id} className="hover:bg-muted/40 transition-colors border-b border-border/40 last:border-0">
                                            <TableCell className="font-medium text-sm pl-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-foreground">{category.label}</span>
                                                    <span className="text-[11px] text-muted-foreground font-normal">{category.name || category.description || 'General maintenance'}</span>
                                                </div>
                                            </TableCell>
                                            {['high', 'medium', 'low'].map((priority) => (
                                                <TableCell key={priority} className="p-3">
                                                    <div className="flex justify-center">
                                                        <div className="flex items-center w-[96px] border border-slate-200 rounded-lg bg-muted/50 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary focus-within:bg-background transition-all hover:border-slate-300">
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                className="h-7 border-0 focus-visible:ring-0 text-center px-1 font-semibold text-xs bg-transparent shadow-none tabular-nums"
                                                                placeholder="0"
                                                                value={(config as any)[priority].value}
                                                                onChange={(e) => handleSlaChange(category.id, priority as any, 'value', e.target.value)}
                                                            />
                                                            <div className="h-4 w-px bg-slate-300/50" />
                                                            <select
                                                                className="h-7 w-[52px] bg-transparent border-0 text-[10px] font-semibold text-slate-500 focus:ring-0 cursor-pointer outline-none px-1"
                                                                value={(config as any)[priority].unit}
                                                                onChange={(e) => handleSlaChange(category.id, priority as any, 'unit', e.target.value)}
                                                            >
                                                                <option value="hours">Hrs</option>
                                                                <option value="days">Days</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    );
                                })}
                                {serviceCategories.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="p-3 bg-muted rounded-full">
                                                    <Info className="w-5 h-5 text-muted-foreground" />
                                                </div>
                                                <p>No service categories found.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit">
                    Save Settings
                </Button>
            </div>
        </form>
    );
};

export default SystemTab;
