
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Loader2, Sparkles } from 'lucide-react';

import { TriggerSection } from './TriggerSection';
import { ConditionsSection } from './ConditionsSection';
import { ActionsSection } from './ActionsSection';
import { Condition, Action } from './types';

interface RuleEditorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (rule: any) => Promise<void>;
    initialData?: any;
}

export function RuleEditorDialog({ open, onOpenChange, onSave, initialData }: RuleEditorDialogProps) {
    const [isSaving, setIsSaving] = useState(false);

    // Rule State
    const [name, setName] = useState('');
    const [triggerType, setTriggerType] = useState('work_order_created');
    const [triggerValue, setTriggerValue] = useState('');
    const [assetPropertyType, setAssetPropertyType] = useState('');

    const [conditions, setConditions] = useState<Condition[]>([]);
    const [conditionLogic, setConditionLogic] = useState<'all' | 'any'>('all');

    const [actions, setActions] = useState<Action[]>([{ type: 'assign_user', value: '' }]);

    // Load initial data
    useEffect(() => {
        if (open) {
            if (initialData) {
                setName(initialData.name || '');
                const tc = initialData.trigger_conditions || {};
                setTriggerType(tc.trigger || 'work_order_created');
                setTriggerValue(tc.triggerValue || '');
                setAssetPropertyType(tc.assetPropertyType || '');
                setConditions(tc.conditions || []);
                setConditionLogic(tc.conditionLogic || 'all');
                setActions(initialData.actions || [{ type: 'assign_user', value: '' }]);
            } else {
                setName('');
                setTriggerType('work_order_created');
                setTriggerValue('');
                setAssetPropertyType('');
                setConditions([]);
                setConditionLogic('all');
                setActions([{ type: 'assign_user', value: '' }]);
            }
        }
    }, [open, initialData]);

    const handleSave = async () => {
        if (!name) return;

        setIsSaving(true);
        try {
            // Transform actions to match database schema
            const transformedActions = actions.map(action => ({
                type: action.type === 'assign_user' ? 'assign_technician' :
                    action.type === 'change_status' ? 'update_status' :
                        action.type === 'assign_priority' ? 'update_priority' :
                            action.type === 'send_notification' ? 'send_notification' :
                                action.type === 'add_comment' ? 'add_activity_log' :
                                    action.type === 'create_task' ? 'create_task' :
                                        action.type,
                parameters: {
                    value: action.value,
                    ...(action.label && { label: action.label })
                },
                execute_on: 'immediate' as const
            }));

            const ruleData = {
                name,
                rule_type: 'auto_assignment' as const, // Default rule type
                is_active: true,
                priority: 1,
                trigger_conditions: {
                    trigger: triggerType,
                    triggerValue,
                    assetPropertyType,
                    conditions,
                    conditionLogic
                },
                actions: transformedActions,
                execution_count: 0
            };

            await onSave(ruleData);
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save rule", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-sm">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-semibold">
                                {initialData ? 'Edit Rule' : 'New Automation Rule'}
                            </DialogTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Define when this rule triggers and what it does.
                            </p>
                        </div>
                    </div>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Rule name..."
                        className="text-lg font-semibold h-11 bg-slate-50 border-slate-200 focus-visible:ring-teal-500/20 focus-visible:ring-offset-0 focus-visible:border-teal-400 placeholder:text-slate-300"
                    />
                </DialogHeader>

                <Separator />

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="px-6 py-5 space-y-5">

                        {/* Trigger Section */}
                        <TriggerSection
                            triggerType={triggerType}
                            setTriggerType={setTriggerType}
                            triggerValue={triggerValue}
                            setTriggerValue={setTriggerValue}
                            assetPropertyType={assetPropertyType}
                            setAssetPropertyType={setAssetPropertyType}
                        />

                        {/* Conditions Section */}
                        <ConditionsSection
                            conditions={conditions}
                            setConditions={setConditions}
                            conditionLogic={conditionLogic}
                            setConditionLogic={setConditionLogic}
                        />

                        {/* Actions Section */}
                        <ActionsSection
                            actions={actions}
                            setActions={setActions}
                        />

                    </div>
                </div>

                {/* Footer */}
                <Separator />
                <DialogFooter className="px-6 py-4 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={!name || isSaving}
                        className="bg-teal-600 hover:bg-teal-700 text-white min-w-[100px]"
                    >
                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {initialData ? 'Update Rule' : 'Save Rule'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
