/**
 * Rule Editor Dialog - Desktop (src/)
 * Workflow-style dialog for automation rules with If/Then conditions
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AutomationRule } from '@/types/automation';
import { X, Plus, Trash2, Bot } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MultiActionEditor } from './MultiActionEditor';
import { RuleConflictDetector } from './RuleConflictDetector';
import { RuleDependencyManager } from './RuleDependencyManager';

interface RuleEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: AutomationRule | null;
  onSave: (rule: Partial<AutomationRule>) => Promise<void>;
}

interface Condition {
  type: string;
  value: string;
  propertyType?: string; // For asset properties: 'ownership', 'warranty', 'emergency'
}

interface Action {
  type: string;
  value: string;
  label?: string; // For display purposes
}

interface RuleDependency {
  rule_id: string;
  execution_order: 'before' | 'after';
  wait_for_completion: boolean;
}

export function RuleEditorDialog({ open, onOpenChange, rule, onSave }: RuleEditorDialogProps) {
  const [title, setTitle] = useState('');
  const [triggerType, setTriggerType] = useState('work_order_created');
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [conditionLogic, setConditionLogic] = useState<'all' | 'any'>('all'); // AND vs OR logic
  const [actions, setActions] = useState<Action[]>([{ type: 'assign_user', value: '' }]); // Multiple actions
  const [dependencies, setDependencies] = useState<RuleDependency[]>([]); // Rule dependencies
  const [assetPropertyType, setAssetPropertyType] = useState(''); // For trigger asset property type
  const [isSaving, setIsSaving] = useState(false);

  // Fetch technicians for user selection
  const { data: technicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('technicians')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Fetch service categories
  const { data: categories } = useQuery({
    queryKey: ['service_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diagnostic_categories')
        .select('id, label')
        .order('label');
      if (error) throw error;
      return data;
    }
  });

  // Fetch locations
  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Fetch customer types for customer-related triggers
  const { data: customerTypes } = useQuery({
    queryKey: ['customer_types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('customer_type')
        .not('customer_type', 'is', null);
      if (error) throw error;
      // Get unique customer types
      const uniqueTypes = [...new Set(data.map(c => c.customer_type).filter(Boolean))];
      return uniqueTypes;
    }
  });

  // Fetch all existing rules for conflict detection
  const { data: existingRules } = useQuery({
    queryKey: ['automation_rules_all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .order('priority', { ascending: false });
      if (error) throw error;
      return data as AutomationRule[];
    }
  });

  useEffect(() => {
    if (rule) {
      setTitle(rule.name || '');
      // Parse existing rule data if needed
      const triggerConditions = rule.trigger_conditions as any;
      if (triggerConditions?.trigger) {
        setTriggerType(triggerConditions.trigger);
      }
      // Parse conditions and logic
      if (triggerConditions?.conditions && Array.isArray(triggerConditions.conditions)) {
        setConditions(triggerConditions.conditions);
      }
      if (triggerConditions?.conditionLogic) {
        setConditionLogic(triggerConditions.conditionLogic);
      }
      // Parse dependencies
      if (triggerConditions?.dependencies && Array.isArray(triggerConditions.dependencies)) {
        setDependencies(triggerConditions.dependencies);
      }
      // Parse actions - support both old single action and new multiple actions
      if (rule.actions && rule.actions.length > 0) {
        const parsedActions = rule.actions.map((action: any) => ({
          type: action.type || 'assign_user',
          value: action.value || '',
          label: action.label
        }));
        setActions(parsedActions);
      }
    } else {
      // Reset form for new rule
      setTitle('');
      setTriggerType('work_order_created');
      setConditions([]);
      setConditionLogic('all');
      setActions([{ type: 'assign_user', value: '' }]);
      setDependencies([]);
      setAssetPropertyType('');
    }
  }, [rule, open]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const ruleData: Partial<AutomationRule> = {
        name: title,
        description: `When ${getTriggerLabel(triggerType)}${conditions.length > 0 ? ' and conditions match' : ''}, then ${actions.length} action(s)`,
        rule_type: 'auto_assignment',
        is_active: true,
        priority: 50,
        trigger_conditions: {
          trigger: triggerType,
          conditions: conditions,
          conditionLogic: conditionLogic,
          dependencies: dependencies
        },
        assignment_criteria: {
          match_location: true
        },
        actions: actions.map(action => ({
          type: action.type,
          value: action.value,
          label: action.label
        }))
      };

      await onSave(ruleData);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save rule:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getTriggerLabel = (type: string) => {
    const labels: Record<string, string> = {
      'work_order_created': 'Work Order is created',
      'work_order_status_changed_to': 'Work Order status changes to',
      'work_order_priority_changed_to': 'Work Order priority changes to',
      'work_order_assigned_to_location': 'Work Order is assigned to Location',
      'work_order_assigned_to_asset': 'Work Order is assigned to Asset',
      'work_order_assigned_to_user': 'Work Order is assigned to User',
      'work_order_due_date_after': 'Work Order Due Date is after',
      'work_order_due_date_between': 'Work Order Due Date is between'
    };
    return labels[type] || type;
  };

  const getActionLabel = (type: string) => {
    const labels: Record<string, string> = {
      'assign_user': 'Assign User to Work Order',
      'assign_priority': 'Assign Priority to Work Order',
      'assign_location': 'Assign Location to Work Order',
      'assign_asset': 'Assign Asset to Work Order',
      'assign_category': 'Assign Category to Work Order',
      'change_status': 'Change Work Order Status',
      'send_notification': 'Send notification/reminder email',
      'set_due_date': 'Set Due Date'
    };
    return labels[type] || type;
  };

  const addCondition = () => {
    setConditions([...conditions, { type: 'category', value: '' }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: 'type' | 'value' | 'propertyType', value: string) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    // Reset value when property type changes
    if (field === 'propertyType') {
      updated[index].value = '';
    }
    // Reset propertyType and value when condition type changes
    if (field === 'type') {
      updated[index].propertyType = '';
      updated[index].value = '';
    }
    setConditions(updated);
  };

  // Action management functions
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
    // Reset value when action type changes
    if (field === 'type') {
      updated[index].value = '';
      updated[index].label = undefined;
    }
    setActions(updated);
  };

  // Generate human-readable rule preview
  const generateRulePreview = () => {
    if (!title) return null;

    // Build trigger text
    let triggerText = '';
    const triggerValue = actions[0]?.value || '';
    
    switch (triggerType) {
      case 'work_order_created':
        triggerText = 'work order created';
        break;
      case 'work_order_status_changed_to':
        triggerText = `status changes to ${triggerValue || '...'}`;
        break;
      case 'work_order_status_transition':
        const fromStatus = assetPropertyType === 'any' ? 'any status' : assetPropertyType;
        triggerText = `status changes from ${fromStatus} to ${triggerValue || '...'}`;
        break;
      case 'work_order_priority_changed_to':
        triggerText = `priority changes to ${triggerValue || '...'}`;
        break;
      case 'work_order_assigned_to_location':
        const location = locations?.find(l => l.id === triggerValue);
        triggerText = `assigned to location ${location?.name || '...'}`;
        break;
      case 'work_order_assigned_to_asset':
        if (assetPropertyType === 'ownership') {
          triggerText = `asset is ${triggerValue === 'company_asset' ? 'company asset' : triggerValue === 'individual_asset' ? 'individual asset' : '...'}`;
        } else if (assetPropertyType === 'warranty') {
          if (triggerValue.startsWith('expiring_in:')) {
            const days = triggerValue.split(':')[1];
            triggerText = `warranty expiring in ${days} days`;
          } else {
            triggerText = `warranty is ${triggerValue || '...'}`;
          }
        } else if (assetPropertyType === 'emergency') {
          triggerText = triggerValue === 'is_emergency_bike' ? 'asset is emergency bike' : 'asset is not emergency bike';
        } else if (assetPropertyType === 'type') {
          triggerText = `asset type is ${triggerValue || '...'}`;
        } else if (assetPropertyType === 'status') {
          triggerText = `asset status is ${triggerValue || '...'}`;
        } else if (assetPropertyType === 'location') {
          const assetLoc = locations?.find(l => l.id === triggerValue);
          triggerText = `asset location is ${assetLoc?.name || '...'}`;
        } else if (assetPropertyType === 'mileage') {
          const comparison = actions[0]?.label;
          if (comparison === 'greater_than') {
            triggerText = `asset mileage > ${triggerValue} km`;
          } else if (comparison === 'less_than') {
            triggerText = `asset mileage < ${triggerValue} km`;
          } else if (comparison === 'between') {
            const [min, max] = triggerValue.split('-');
            triggerText = `asset mileage between ${min}-${max} km`;
          }
        }
        break;
      case 'work_order_assigned_to_user':
        const user = technicians?.find(t => t.id === triggerValue);
        triggerText = `assigned to ${user?.name || '...'}`;
        break;
      case 'work_order_due_within':
        triggerText = `due within ${triggerValue || '...'} days`;
        break;
      case 'work_order_overdue_by':
        triggerText = `overdue by ${triggerValue || '...'} days`;
        break;
      case 'work_order_age':
        if (triggerValue.includes(':')) {
          const [unit, value] = triggerValue.split(':');
          triggerText = `age greater than ${value} ${unit}`;
        }
        break;
      case 'scheduled_daily':
        triggerText = `daily at ${triggerValue || '...'}`;
        break;
      case 'scheduled_weekly':
        if (triggerValue.includes(':')) {
          const [day, time] = triggerValue.split(':');
          triggerText = `weekly on ${day} at ${time}`;
        }
        break;
      case 'scheduled_monthly':
        if (triggerValue.includes(':')) {
          const [day, time] = triggerValue.split(':');
          triggerText = `monthly on day ${day} at ${time}`;
        }
        break;
      case 'time_before_due_date':
        triggerText = `${triggerValue || '...'} hours before due date`;
        break;
      case 'time_after_creation':
        if (triggerValue.includes(':')) {
          const [unit, value] = triggerValue.split(':');
          triggerText = `${value} ${unit} after creation`;
        }
        break;
      case 'time_in_status':
        triggerText = `in ${assetPropertyType} for ${triggerValue} ${actions[0]?.label || '...'}`;
        break;
      case 'customer_type_is':
        triggerText = `customer type is ${triggerValue || '...'}`;
        break;
      case 'customer_has_phone':
        triggerText = triggerValue === 'has_phone' ? 'customer has phone' : 'customer has no phone';
        break;
    }

    // Build conditions text
    const conditionsText = conditions
      .filter(c => c.value)
      .map(condition => {
        switch (condition.type) {
          case 'category':
            const category = categories?.find(cat => cat.id === condition.value);
            return `category is ${category?.label || condition.value}`;
          case 'priority':
            return `priority is ${condition.value}`;
          case 'location':
            const loc = locations?.find(l => l.id === condition.value);
            return `assigned to ${loc?.name || condition.value}`;
          case 'asset':
            if (condition.propertyType === 'ownership') {
              return `asset is ${condition.value === 'company_asset' ? 'company asset' : 'individual asset'}`;
            } else if (condition.propertyType === 'warranty') {
              if (condition.value.startsWith('expiring_in:')) {
                const days = condition.value.split(':')[1];
                return `warranty expiring in ${days} days`;
              }
              return `warranty is ${condition.value}`;
            } else if (condition.propertyType === 'emergency') {
              return condition.value === 'is_emergency_bike' ? 'is emergency bike' : 'is not emergency bike';
            }
            break;
          case 'asset_mileage':
            if (condition.propertyType === 'greater_than') {
              return `mileage > ${condition.value} km`;
            } else if (condition.propertyType === 'less_than') {
              return `mileage < ${condition.value} km`;
            } else if (condition.propertyType === 'between') {
              const [min, max] = condition.value.split('-');
              return `mileage between ${min}-${max} km`;
            }
            break;
          case 'user':
            const tech = technicians?.find(t => t.id === condition.value);
            return `assigned to ${tech?.name || condition.value}`;
          case 'status':
            return `status is ${condition.value}`;
          case 'channel':
            return `channel is ${condition.value}`;
          case 'title_contains':
            return `title contains "${condition.value}"`;
          case 'work_order_age':
            return `age > ${condition.value} ${condition.propertyType}`;
        }
        return '';
      })
      .filter(Boolean);

    // Build action text - show all actions
    const actionTexts = actions.map(action => {
      switch (action.type) {
        case 'assign_user':
          const assignedUser = technicians?.find(t => t.id === action.value);
          return `assign to ${assignedUser?.name || '...'}`;
        case 'assign_priority':
          return `set priority to ${action.value || '...'}`;
        case 'assign_location':
          const assignedLoc = locations?.find(l => l.id === action.value);
          return `assign to location ${assignedLoc?.name || '...'}`;
        case 'assign_asset':
          return `assign asset ${action.value || '...'}`;
        case 'assign_category':
          const assignedCat = categories?.find(cat => cat.id === action.value);
          return `set category to ${assignedCat?.label || '...'}`;
        case 'change_status':
          return `change status to ${action.value || '...'}`;
        case 'send_notification':
          return `send notification (${action.value || '...'})`;
        case 'set_due_date':
          return `set due date to ${action.value || '...'}`;
        case 'add_comment':
          return `add comment "${action.value || '...'}"`;
        case 'create_task':
          return `create task "${action.value || '...'}"`;
        default:
          return action.type;
      }
    }).filter(Boolean);

    // Combine all parts
    let preview = `When ${triggerText}`;
    if (conditionsText.length > 0) {
      preview += ` and ${conditionsText.join(' and ')}`;
    }
    preview += `, then ${actionTexts.join(', then ')}`;

    return preview;
  };

  const rulePreview = generateRulePreview();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{rule ? 'Edit Workflow' : 'Create New Rule'}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter rule title"
            />
          </div>

          {/* If (Trigger) */}
          <div className="space-y-2">
            <Label htmlFor="trigger">
              If <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={triggerType} 
              onValueChange={(value) => {
                setTriggerType(value);
                setActions([{ type: 'assign_user', value: '' }]);
                setAssetPropertyType('');
              }}
            >
              <SelectTrigger id="trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="work_order_created">Work order created</SelectItem>
                <SelectItem value="work_order_status_changed_to">Status changes to</SelectItem>
                <SelectItem value="work_order_status_transition">Status transitions from/to</SelectItem>
                <SelectItem value="work_order_priority_changed_to">Priority changes to</SelectItem>
                <SelectItem value="work_order_assigned_to_location">Assigned to location</SelectItem>
                <SelectItem value="work_order_assigned_to_asset">Asset has property</SelectItem>
                <SelectItem value="work_order_assigned_to_user">Assigned to user</SelectItem>
                <SelectItem value="work_order_due_within">Due within</SelectItem>
                <SelectItem value="work_order_overdue_by">Overdue by</SelectItem>
                <SelectItem value="work_order_age">Age is</SelectItem>
                {/* Time-based triggers */}
                <SelectItem value="scheduled_daily">Scheduled - Daily</SelectItem>
                <SelectItem value="scheduled_weekly">Scheduled - Weekly</SelectItem>
                <SelectItem value="scheduled_monthly">Scheduled - Monthly</SelectItem>
                <SelectItem value="time_before_due_date">Time before due date</SelectItem>
                <SelectItem value="time_after_creation">Time after creation</SelectItem>
                <SelectItem value="time_in_status">Time in current status</SelectItem>
                {/* Customer-related triggers */}
                <SelectItem value="customer_type_is">Customer type is</SelectItem>
                <SelectItem value="customer_has_phone">Customer has phone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trigger Value Fields */}
          {triggerType === 'work_order_status_changed_to' && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={actions[0]?.value || ''}
                onValueChange={(value) => setActions([{ ...actions[0], value }])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Ready">Ready</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Awaiting Confirmation">Awaiting Confirmation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {triggerType === 'work_order_status_transition' && (
            <>
              <div className="space-y-2">
                <Label>From status</Label>
                <Select
                  value={assetPropertyType}
                  onValueChange={setAssetPropertyType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select from status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any status</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Ready">Ready</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Awaiting Confirmation">Awaiting Confirmation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To status</Label>
                <Select
                  value={actions[0]?.value || ''}
                  onValueChange={(value) => setActions([{ ...actions[0], value }])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select to status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Ready">Ready</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Awaiting Confirmation">Awaiting Confirmation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {triggerType === 'work_order_priority_changed_to' && (
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={actions[0]?.value || ''}
                onValueChange={(value) => setActions([{ ...actions[0], value }])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {triggerType === 'work_order_assigned_to_location' && (
            <div className="space-y-2">
              <Label>Location</Label>
              <Select
                value={actions[0]?.value || ''}
                onValueChange={(value) => setActions([{ ...actions[0], value }])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations?.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {triggerType === 'work_order_assigned_to_asset' && (
            <>
              <div className="space-y-2">
                <Label>Property type</Label>
                <Select
                  value={assetPropertyType}
                  onValueChange={setAssetPropertyType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ownership">Ownership</SelectItem>
                    <SelectItem value="warranty">Warranty</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="type">Asset type</SelectItem>
                    <SelectItem value="status">Asset status</SelectItem>
                    <SelectItem value="location">Asset location</SelectItem>
                    <SelectItem value="mileage">Mileage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {assetPropertyType === 'ownership' && (
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={actions[0]?.value || ''}
                    onValueChange={(value) => setActions([{ ...actions[0], value }])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company_asset">Company asset</SelectItem>
                      <SelectItem value="individual_asset">Individual asset</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {assetPropertyType === 'warranty' && (
                <>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={actions[0]?.value || ''}
                      onValueChange={(value) => setActions([{ ...actions[0], value }])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="expiring_in">Expiring in</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {actions[0]?.value === 'expiring_in' && (
                    <div className="space-y-2">
                      <Label>Days remaining</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Number of days"
                        onChange={(e) => {
                          const days = e.target.value;
                          if (days) {
                            setActions([{ ...actions[0], value: `expiring_in:${days}` }]);
                          }
                        }}
                        defaultValue={actions[0]?.value.startsWith('expiring_in:') ? actions[0].value.split(':')[1] : ''}
                      />
                    </div>
                  )}
                </>
              )}

              {assetPropertyType === 'emergency' && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={actions[0]?.value || ''}
                    onValueChange={(value) => setActions([{ ...actions[0], value }])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="is_emergency_bike">Emergency bike</SelectItem>
                      <SelectItem value="not_emergency_bike">Not emergency bike</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {assetPropertyType === 'type' && (
                <div className="space-y-2">
                  <Label>Asset type</Label>
                  <Input
                    value={actions[0]?.value || ''}
                    onChange={(e) => setActions([{ ...actions[0], value: e.target.value }])}
                    placeholder="e.g., Bike, Scooter, Car"
                  />
                  <p className="text-xs text-muted-foreground">Enter asset type or model</p>
                </div>
              )}

              {assetPropertyType === 'status' && (
                <div className="space-y-2">
                  <Label>Asset status</Label>
                  <Select
                    value={actions[0]?.value || ''}
                    onValueChange={(value) => setActions([{ ...actions[0], value }])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">In maintenance</SelectItem>
                      <SelectItem value="decommissioned">Decommissioned</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {assetPropertyType === 'location' && (
                <div className="space-y-2">
                  <Label>Asset location</Label>
                  <Select
                    value={actions[0]?.value || ''}
                    onValueChange={(value) => setActions([{ ...actions[0], value }])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations?.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {assetPropertyType === 'mileage' && (
                <>
                  <div className="space-y-2">
                    <Label>Comparison</Label>
                    <Select
                      value={actions[0]?.label || ''}
                      onValueChange={(value) => setActions([{ ...actions[0], label: value }])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select comparison" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greater_than">Greater than</SelectItem>
                        <SelectItem value="less_than">Less than</SelectItem>
                        <SelectItem value="between">Between</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {actions[0]?.label === 'greater_than' && (
                    <div className="space-y-2">
                      <Label>Mileage (km)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={actions[0]?.value || ''}
                        onChange={(e) => setActions([{ ...actions[0], value: e.target.value }])}
                        placeholder="Mileage in km"
                      />
                    </div>
                  )}
                  {actions[0]?.label === 'less_than' && (
                    <div className="space-y-2">
                      <Label>Mileage (km)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={actions[0]?.value || ''}
                        onChange={(e) => setActions([{ ...actions[0], value: e.target.value }])}
                        placeholder="Mileage in km"
                      />
                    </div>
                  )}
                  {actions[0]?.label === 'between' && (
                    <>
                      <div className="space-y-2">
                        <Label>Minimum (km)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={actions[0]?.value.split('-')[0] || ''}
                          onChange={(e) => {
                            const max = actions[0]?.value.split('-')[1] || '';
                            setActions([{ ...actions[0], value: `${e.target.value}-${max}` }]);
                          }}
                          placeholder="Min km"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Maximum (km)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={actions[0]?.value.split('-')[1] || ''}
                          onChange={(e) => {
                            const min = actions[0]?.value.split('-')[0] || '';
                            setActions([{ ...actions[0], value: `${min}-${e.target.value}` }]);
                          }}
                          placeholder="Max km"
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {triggerType === 'work_order_assigned_to_user' && (
            <div className="space-y-2">
              <Label>User</Label>
              <Select
                value={actions[0]?.value || ''}
                onValueChange={(value) => setActions([{ ...actions[0], value }])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {technicians?.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {triggerType === 'work_order_due_within' && (
            <div className="space-y-2">
              <Label>Days</Label>
              <Input
                type="number"
                min="1"
                placeholder="Number of days"
                onChange={(e) => setActions([{ ...actions[0], value: e.target.value }])}
                value={actions[0]?.value || ''}
              />
            </div>
          )}

          {triggerType === 'work_order_overdue_by' && (
            <div className="space-y-2">
              <Label>Days</Label>
              <Input
                type="number"
                min="1"
                placeholder="Number of days"
                onChange={(e) => setActions([{ ...actions[0], value: e.target.value }])}
                value={actions[0]?.value || ''}
              />
            </div>
          )}

          {triggerType === 'work_order_age' && (
            <>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select
                  value={assetPropertyType}
                  onValueChange={setAssetPropertyType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {assetPropertyType && (
                <div className="space-y-2">
                  <Label>Greater than</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder={`Number of ${assetPropertyType}`}
                    onChange={(e) => setActions([{ ...actions[0], value: `${assetPropertyType}:${e.target.value}` }])}
                    value={actions[0]?.value.includes(':') ? actions[0].value.split(':')[1] : ''}
                  />
                </div>
              )}
            </>
          )}

          {/* Time-based triggers */}
          {triggerType === 'scheduled_daily' && (
            <div className="space-y-2">
              <Label>Time of day</Label>
              <Input
                type="time"
                value={actions[0]?.value || ''}
                onChange={(e) => setActions([{ ...actions[0], value: e.target.value }])}
                placeholder="HH:MM"
              />
              <p className="text-xs text-muted-foreground">Rule will run daily at this time</p>
            </div>
          )}

          {triggerType === 'scheduled_weekly' && (
            <>
              <div className="space-y-2">
                <Label>Day of week</Label>
                <Select
                  value={assetPropertyType}
                  onValueChange={setAssetPropertyType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {assetPropertyType && (
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={actions[0]?.value || ''}
                    onChange={(e) => setActions([{ ...actions[0], value: `${assetPropertyType}:${e.target.value}` }])}
                    placeholder="HH:MM"
                  />
                </div>
              )}
            </>
          )}

          {triggerType === 'scheduled_monthly' && (
            <>
              <div className="space-y-2">
                <Label>Day of month</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={assetPropertyType}
                  onChange={(e) => setAssetPropertyType(e.target.value)}
                  placeholder="1-31"
                />
              </div>
              {assetPropertyType && (
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={actions[0]?.value || ''}
                    onChange={(e) => setActions([{ ...actions[0], value: `${assetPropertyType}:${e.target.value}` }])}
                    placeholder="HH:MM"
                  />
                </div>
              )}
            </>
          )}

          {triggerType === 'time_before_due_date' && (
            <div className="space-y-2">
              <Label>Hours before due date</Label>
              <Input
                type="number"
                min="1"
                value={actions[0]?.value || ''}
                onChange={(e) => setActions([{ ...actions[0], value: e.target.value }])}
                placeholder="Number of hours"
              />
              <p className="text-xs text-muted-foreground">Trigger this many hours before work order is due</p>
            </div>
          )}

          {triggerType === 'time_after_creation' && (
            <>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select
                  value={assetPropertyType}
                  onValueChange={setAssetPropertyType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {assetPropertyType && (
                <div className="space-y-2">
                  <Label>Time after creation</Label>
                  <Input
                    type="number"
                    min="1"
                    value={actions[0]?.value.includes(':') ? actions[0].value.split(':')[1] : ''}
                    onChange={(e) => setActions([{ ...actions[0], value: `${assetPropertyType}:${e.target.value}` }])}
                    placeholder={`Number of ${assetPropertyType}`}
                  />
                </div>
              )}
            </>
          )}

          {triggerType === 'time_in_status' && (
            <>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={assetPropertyType}
                  onValueChange={setAssetPropertyType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Ready">Ready</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Awaiting Confirmation">Awaiting Confirmation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {assetPropertyType && (
                <>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select
                      value={actions[0]?.label || ''}
                      onValueChange={(value) => setActions([{ ...actions[0], label: value }])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {actions[0]?.label && (
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input
                        type="number"
                        min="1"
                        value={actions[0]?.value || ''}
                        onChange={(e) => setActions([{ ...actions[0], value: e.target.value }])}
                        placeholder={`Number of ${actions[0].label}`}
                      />
                      <p className="text-xs text-muted-foreground">
                        Trigger when work order stays in {assetPropertyType} for this duration
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Customer-related triggers */}
          {triggerType === 'customer_type_is' && (
            <div className="space-y-2">
              <Label>Customer type</Label>
              <Select
                value={actions[0]?.value || ''}
                onValueChange={(value) => setActions([{ ...actions[0], value }])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer type" />
                </SelectTrigger>
                <SelectContent>
                  {customerTypes?.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                  {(!customerTypes || customerTypes.length === 0) && (
                    <SelectItem value="individual" disabled>No customer types found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {triggerType === 'customer_has_phone' && (
            <div className="space-y-2">
              <Label>Phone status</Label>
              <Select
                value={actions[0]?.value || ''}
                onValueChange={(value) => setActions([{ ...actions[0], value }])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="has_phone">Has phone number</SelectItem>
                  <SelectItem value="no_phone">No phone number</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Additional Conditions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Additional conditions (optional)</Label>
              {conditions.length > 0 && (
                <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/50 border border-border">
                  <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                    <input
                      type="radio"
                      name="conditionLogic"
                      value="all"
                      checked={conditionLogic === 'all'}
                      onChange={(e) => setConditionLogic(e.target.value as 'all' | 'any')}
                      className="w-3.5 h-3.5 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-foreground">and</span>
                  </label>
                  <div className="w-px h-4 bg-border" />
                  <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                    <input
                      type="radio"
                      name="conditionLogic"
                      value="any"
                      checked={conditionLogic === 'any'}
                      onChange={(e) => setConditionLogic(e.target.value as 'all' | 'any')}
                      className="w-3.5 h-3.5 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-foreground">or</span>
                  </label>
                </div>
              )}
            </div>
            {conditions.map((condition, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <Select
                      value={condition.type}
                      onValueChange={(value) => updateCondition(index, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="category">Category is</SelectItem>
                        <SelectItem value="priority">Priority is</SelectItem>
                        <SelectItem value="location">Assigned to location</SelectItem>
                        <SelectItem value="asset">Asset has property</SelectItem>
                        <SelectItem value="asset_mileage">Asset mileage is</SelectItem>
                        <SelectItem value="user">Assigned to user</SelectItem>
                        <SelectItem value="status">Status is</SelectItem>
                        <SelectItem value="channel">Channel is</SelectItem>
                        <SelectItem value="title_contains">Title contains</SelectItem>
                        <SelectItem value="work_order_age">Age is</SelectItem>
                        <SelectItem value="customer_type">Customer type is</SelectItem>
                        <SelectItem value="customer_phone">Customer phone status</SelectItem>
                      </SelectContent>
                    </Select>

                    {condition.type === 'category' && (
                      <>
                        <Label>Category</Label>
                        <Select
                          value={condition.value}
                          onValueChange={(value) => updateCondition(index, 'value', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}

                    {condition.type === 'priority' && (
                      <>
                        <Label>Priority</Label>
                        <Select
                          value={condition.value}
                          onValueChange={(value) => updateCondition(index, 'value', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Critical">Critical</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </>
                    )}

                    {condition.type === 'status' && (
                      <>
                        <Label>Status</Label>
                        <Select
                          value={condition.value}
                          onValueChange={(value) => updateCondition(index, 'value', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Ready">Ready</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="On Hold">On Hold</SelectItem>
                            <SelectItem value="Awaiting Confirmation">Awaiting Confirmation</SelectItem>
                          </SelectContent>
                        </Select>
                      </>
                    )}

                    {condition.type === 'location' && (
                      <>
                        <Label>Location</Label>
                        <Select
                          value={condition.value}
                          onValueChange={(value) => updateCondition(index, 'value', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations?.map((loc) => (
                              <SelectItem key={loc.id} value={loc.id}>
                                {loc.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}

                    {condition.type === 'asset' && (
                      <>
                        <Label>Asset Property Type</Label>
                        <Select
                          value={condition.propertyType || ''}
                          onValueChange={(value) => updateCondition(index, 'propertyType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ownership">Ownership Type</SelectItem>
                            <SelectItem value="warranty">Warranty Status</SelectItem>
                            <SelectItem value="emergency">Emergency Status</SelectItem>
                          </SelectContent>
                        </Select>

                        {condition.propertyType === 'ownership' && (
                          <>
                            <Label>Ownership Type</Label>
                            <Select
                              value={condition.value}
                              onValueChange={(value) => updateCondition(index, 'value', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select ownership type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="company_asset">Company Asset</SelectItem>
                                <SelectItem value="individual_asset">Individual Asset</SelectItem>
                              </SelectContent>
                            </Select>
                          </>
                        )}

                        {condition.propertyType === 'warranty' && (
                          <>
                            <Label>Warranty Status</Label>
                            <Select
                              value={condition.value.startsWith('expiring_in:') ? 'expiring_in' : condition.value}
                              onValueChange={(value) => updateCondition(index, 'value', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select warranty status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active (has time left)</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                                <SelectItem value="expiring_in">Expiring in...</SelectItem>
                              </SelectContent>
                            </Select>

                            {(condition.value === 'expiring_in' || condition.value.startsWith('expiring_in:')) && (
                              <>
                                <Label>Days Remaining</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="Enter number of days"
                                  onChange={(e) => {
                                    const days = e.target.value;
                                    if (days) {
                                      updateCondition(index, 'value', `expiring_in:${days}`);
                                    }
                                  }}
                                  defaultValue={condition.value.startsWith('expiring_in:') ? condition.value.split(':')[1] : ''}
                                />
                              </>
                            )}
                          </>
                        )}

                        {condition.propertyType === 'emergency' && (
                          <>
                            <Label>Emergency Bike Status</Label>
                            <Select
                              value={condition.value}
                              onValueChange={(value) => updateCondition(index, 'value', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select emergency status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="is_emergency_bike">Is Emergency Bike</SelectItem>
                                <SelectItem value="not_emergency_bike">Not Emergency Bike</SelectItem>
                              </SelectContent>
                            </Select>
                          </>
                        )}
                      </>
                    )}

                    {condition.type === 'user' && (
                      <>
                        <Label>User</Label>
                        <Select
                          value={condition.value}
                          onValueChange={(value) => updateCondition(index, 'value', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                          <SelectContent>
                            {technicians?.map((tech) => (
                              <SelectItem key={tech.id} value={tech.id}>
                                {tech.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}

                    {condition.type === 'channel' && (
                      <>
                        <Label>Channel</Label>
                        <Select
                          value={condition.value}
                          onValueChange={(value) => updateCondition(index, 'value', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select channel" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="web">Web</SelectItem>
                            <SelectItem value="mobile">Mobile</SelectItem>
                            <SelectItem value="walk-in">Walk-in</SelectItem>
                          </SelectContent>
                        </Select>
                      </>
                    )}

                    {condition.type === 'title_contains' && (
                      <>
                        <Label>Text</Label>
                        <Input
                          value={condition.value}
                          onChange={(e) => updateCondition(index, 'value', e.target.value)}
                          placeholder="Search text"
                        />
                      </>
                    )}

                    {condition.type === 'asset_mileage' && (
                      <>
                        <Label>Comparison</Label>
                        <Select
                          value={condition.propertyType || ''}
                          onValueChange={(value) => updateCondition(index, 'propertyType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select comparison" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="greater_than">Greater than</SelectItem>
                            <SelectItem value="less_than">Less than</SelectItem>
                            <SelectItem value="between">Between</SelectItem>
                          </SelectContent>
                        </Select>

                        {condition.propertyType === 'greater_than' && (
                          <>
                            <Label>Mileage (km)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={condition.value}
                              onChange={(e) => updateCondition(index, 'value', e.target.value)}
                              placeholder="Mileage in km"
                            />
                          </>
                        )}

                        {condition.propertyType === 'less_than' && (
                          <>
                            <Label>Mileage (km)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={condition.value}
                              onChange={(e) => updateCondition(index, 'value', e.target.value)}
                              placeholder="Mileage in km"
                            />
                          </>
                        )}

                        {condition.propertyType === 'between' && (
                          <>
                            <Label>Minimum (km)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={condition.value.split('-')[0] || ''}
                              onChange={(e) => {
                                const max = condition.value.split('-')[1] || '';
                                updateCondition(index, 'value', `${e.target.value}-${max}`);
                              }}
                              placeholder="Min km"
                            />
                            <Label>Maximum (km)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={condition.value.split('-')[1] || ''}
                              onChange={(e) => {
                                const min = condition.value.split('-')[0] || '';
                                updateCondition(index, 'value', `${min}-${e.target.value}`);
                              }}
                              placeholder="Max km"
                            />
                          </>
                        )}
                      </>
                    )}

                    {condition.type === 'work_order_age' && (
                      <>
                        <Label>Unit</Label>
                        <Select
                          value={condition.propertyType || ''}
                          onValueChange={(value) => updateCondition(index, 'propertyType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                          </SelectContent>
                        </Select>

                        {condition.propertyType && (
                          <>
                            <Label>Greater than</Label>
                            <Input
                              type="number"
                              min="1"
                              value={condition.value}
                              onChange={(e) => updateCondition(index, 'value', e.target.value)}
                              placeholder={`Number of ${condition.propertyType}`}
                            />
                          </>
                        )}
                      </>
                    )}

                    {condition.type === 'customer_type' && (
                      <>
                        <Label>Customer type</Label>
                        <Select
                          value={condition.value}
                          onValueChange={(value) => updateCondition(index, 'value', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer type" />
                          </SelectTrigger>
                          <SelectContent>
                            {customerTypes?.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                            {(!customerTypes || customerTypes.length === 0) && (
                              <SelectItem value="none" disabled>No customer types found</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </>
                    )}

                    {condition.type === 'customer_phone' && (
                      <>
                        <Label>Phone status</Label>
                        <Select
                          value={condition.value}
                          onValueChange={(value) => updateCondition(index, 'value', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="has_phone">Has phone number</SelectItem>
                            <SelectItem value="no_phone">No phone number</SelectItem>
                          </SelectContent>
                        </Select>
                      </>
                    )}
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeCondition(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={addCondition}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          </div>

          {/* Then (Multiple Actions) */}
          <MultiActionEditor
            actions={actions}
            onActionsChange={setActions}
            technicians={technicians}
            locations={locations}
            categories={categories}
          />

          {/* Rule Conflict Detection */}
          {title && actions.length > 0 && actions[0].value && existingRules && (
            <RuleConflictDetector
              currentRule={{
                name: title,
                triggerType,
                conditions,
                actions,
                priority: 50
              }}
              existingRules={existingRules.filter(r => r.id !== rule?.id)}
            />
          )}

          {/* Rule Dependencies */}
          {existingRules && (
            <RuleDependencyManager
              dependencies={dependencies}
              onDependenciesChange={setDependencies}
              availableRules={existingRules.map(r => ({
                id: r.id,
                name: r.name,
                is_active: r.is_active
              }))}
              currentRuleId={rule?.id}
            />
          )}
        </div>

        {/* Rule Preview - Enhanced Design */}
        {rulePreview && (
          <div className="border-t border-border bg-muted/30 px-6 py-5">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Rule Preview
                </h4>
              </div>

              {/* Visual Rule Flow */}
              <div className="space-y-2">
                {/* Trigger Section */}
                <div className="flex items-start gap-2">
                  <div className="flex items-center justify-center w-12 h-6 rounded bg-blue-500/10 border border-blue-500/20 flex-shrink-0">
                    <span className="text-xs font-semibold text-blue-700">IF</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">
                      {(() => {
                        const triggerValue = actions[0]?.value || '';
                        switch (triggerType) {
                          case 'work_order_created':
                            return 'Work order created';
                          case 'work_order_status_changed_to':
                            return `Status changes to ${triggerValue || '...'}`;
                          case 'work_order_status_transition':
                            const fromStatus = assetPropertyType === 'any' ? 'any status' : assetPropertyType;
                            return `Status changes from ${fromStatus} to ${triggerValue || '...'}`;
                          case 'work_order_priority_changed_to':
                            return `Priority changes to ${triggerValue || '...'}`;
                          case 'work_order_assigned_to_location':
                            const location = locations?.find(l => l.id === triggerValue);
                            return `Assigned to location ${location?.name || '...'}`;
                          case 'work_order_assigned_to_asset':
                            if (assetPropertyType === 'ownership') {
                              return `Asset is ${triggerValue === 'company_asset' ? 'company asset' : triggerValue === 'individual_asset' ? 'individual asset' : '...'}`;
                            } else if (assetPropertyType === 'warranty') {
                              if (triggerValue.startsWith('expiring_in:')) {
                                const days = triggerValue.split(':')[1];
                                return `Warranty expiring in ${days} days`;
                              }
                              return `Warranty is ${triggerValue || '...'}`;
                            } else if (assetPropertyType === 'emergency') {
                              return triggerValue === 'is_emergency_bike' ? 'Asset is emergency bike' : 'Asset is not emergency bike';
                            } else if (assetPropertyType === 'type') {
                              return `Asset type is ${triggerValue || '...'}`;
                            } else if (assetPropertyType === 'status') {
                              return `Asset status is ${triggerValue || '...'}`;
                            } else if (assetPropertyType === 'location') {
                              const assetLoc = locations?.find(l => l.id === triggerValue);
                              return `Asset location is ${assetLoc?.name || '...'}`;
                            } else if (assetPropertyType === 'mileage') {
                              const comparison = actions[0]?.label;
                              if (comparison === 'greater_than') {
                                return `Asset mileage > ${triggerValue} km`;
                              } else if (comparison === 'less_than') {
                                return `Asset mileage < ${triggerValue} km`;
                              } else if (comparison === 'between') {
                                const [min, max] = triggerValue.split('-');
                                return `Asset mileage between ${min}-${max} km`;
                              }
                            }
                            break;
                          case 'work_order_assigned_to_user':
                            const user = technicians?.find(t => t.id === triggerValue);
                            return `Assigned to ${user?.name || '...'}`;
                          case 'work_order_due_within':
                            return `Due within ${triggerValue || '...'} days`;
                          case 'work_order_overdue_by':
                            return `Overdue by ${triggerValue || '...'} days`;
                          case 'work_order_age':
                            if (triggerValue.includes(':')) {
                              const [unit, value] = triggerValue.split(':');
                              return `Age greater than ${value} ${unit}`;
                            }
                            break;
                          case 'scheduled_daily':
                            return `Daily at ${triggerValue || '...'}`;
                          case 'scheduled_weekly':
                            if (triggerValue.includes(':')) {
                              const [day, time] = triggerValue.split(':');
                              return `Weekly on ${day} at ${time}`;
                            }
                            return 'Weekly (not configured)';
                          case 'scheduled_monthly':
                            if (triggerValue.includes(':')) {
                              const [day, time] = triggerValue.split(':');
                              return `Monthly on day ${day} at ${time}`;
                            }
                            return 'Monthly (not configured)';
                          case 'time_before_due_date':
                            return `${triggerValue || '...'} hours before due date`;
                          case 'time_after_creation':
                            if (triggerValue.includes(':')) {
                              const [unit, value] = triggerValue.split(':');
                              return `${value} ${unit} after creation`;
                            }
                            return 'Time after creation (not configured)';
                          case 'time_in_status':
                            return `In ${assetPropertyType} for ${triggerValue} ${actions[0]?.label || '...'}`;
                          case 'customer_type_is':
                            return `Customer type is ${triggerValue || '...'}`;
                          case 'customer_has_phone':
                            return triggerValue === 'has_phone' ? 'Customer has phone' : 'Customer has no phone';
                        }
                        return 'Trigger not configured';
                      })()}
                    </p>
                  </div>
                </div>

                {/* Conditions Section */}
                {conditions.filter(c => c.value).length > 0 && (
                  <div className="flex items-start gap-2">
                    <div className="flex items-center justify-center w-12 h-6 rounded bg-amber-500/10 border border-amber-500/20 flex-shrink-0">
                      <span className="text-xs font-semibold text-amber-700">{conditionLogic === 'all' ? 'AND' : 'OR'}</span>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      {conditions.filter(c => c.value).length > 1 && conditionLogic === 'any' && (
                        <p className="text-xs text-muted-foreground italic mb-1">
                          (At least one must be true)
                        </p>
                      )}
                      {conditions
                        .filter(c => c.value)
                        .map((condition, idx) => {
                          let conditionText = '';
                          switch (condition.type) {
                            case 'category':
                              const category = categories?.find(cat => cat.id === condition.value);
                              conditionText = `Category is ${category?.label || condition.value}`;
                              break;
                            case 'priority':
                              conditionText = `Priority is ${condition.value}`;
                              break;
                            case 'location':
                              const loc = locations?.find(l => l.id === condition.value);
                              conditionText = `Assigned to ${loc?.name || condition.value}`;
                              break;
                            case 'asset':
                              if (condition.propertyType === 'ownership') {
                                conditionText = `Asset is ${condition.value === 'company_asset' ? 'company asset' : 'individual asset'}`;
                              } else if (condition.propertyType === 'warranty') {
                                if (condition.value.startsWith('expiring_in:')) {
                                  const days = condition.value.split(':')[1];
                                  conditionText = `Warranty expiring in ${days} days`;
                                } else {
                                  conditionText = `Warranty is ${condition.value}`;
                                }
                              } else if (condition.propertyType === 'emergency') {
                                conditionText = condition.value === 'is_emergency_bike' ? 'Is emergency bike' : 'Is not emergency bike';
                              }
                              break;
                            case 'asset_mileage':
                              if (condition.propertyType === 'greater_than') {
                                conditionText = `Mileage > ${condition.value} km`;
                              } else if (condition.propertyType === 'less_than') {
                                conditionText = `Mileage < ${condition.value} km`;
                              } else if (condition.propertyType === 'between') {
                                const [min, max] = condition.value.split('-');
                                conditionText = `Mileage between ${min}-${max} km`;
                              }
                              break;
                            case 'user':
                              const tech = technicians?.find(t => t.id === condition.value);
                              conditionText = `Assigned to ${tech?.name || condition.value}`;
                              break;
                            case 'status':
                              conditionText = `Status is ${condition.value}`;
                              break;
                            case 'channel':
                              conditionText = `Channel is ${condition.value}`;
                              break;
                            case 'title_contains':
                              conditionText = `Title contains "${condition.value}"`;
                              break;
                            case 'work_order_age':
                              conditionText = `Age > ${condition.value} ${condition.propertyType}`;
                              break;
                            case 'customer_type':
                              conditionText = `Customer type is ${condition.value}`;
                              break;
                            case 'customer_phone':
                              conditionText = condition.value === 'has_phone' ? 'Customer has phone' : 'Customer has no phone';
                              break;
                          }
                          return (
                            <p key={idx} className="text-sm text-foreground leading-relaxed">
                              {conditionText}
                            </p>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Action Section */}
                <div className="flex items-start gap-2">
                  <div className="flex items-center justify-center w-12 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
                    <span className="text-xs font-semibold text-emerald-700">THEN</span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    {actions.map((action, idx) => {
                      let actionText = '';
                      switch (action.type) {
                        case 'assign_user':
                          const assignedUser = technicians?.find(t => t.id === action.value);
                          actionText = `Assign to ${assignedUser?.name || '...'}`;
                          break;
                        case 'assign_priority':
                          actionText = `Set priority to ${action.value || '...'}`;
                          break;
                        case 'assign_location':
                          const assignedLoc = locations?.find(l => l.id === action.value);
                          actionText = `Assign to location ${assignedLoc?.name || '...'}`;
                          break;
                        case 'assign_category':
                          const assignedCat = categories?.find(cat => cat.id === action.value);
                          actionText = `Set category to ${assignedCat?.label || '...'}`;
                          break;
                        case 'change_status':
                          actionText = `Change status to ${action.value || '...'}`;
                          break;
                        case 'send_notification':
                          actionText = `Send notification (${action.value || '...'})`;
                          break;
                        case 'set_due_date':
                          actionText = `Set due date to ${action.value || '...'}`;
                          break;
                        case 'add_comment':
                          actionText = `Add comment "${action.value || '...'}"`;
                          break;
                        case 'create_task':
                          actionText = `Create task "${action.value || '...'}"`;
                          break;
                        default:
                          actionText = 'Action not configured';
                      }
                      return (
                        <p key={idx} className="text-sm font-medium text-foreground leading-relaxed">
                          {idx + 1}. {actionText}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !title || actions.some(a => !a.value)}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
