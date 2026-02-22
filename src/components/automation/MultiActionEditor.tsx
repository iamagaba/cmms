/**
 * Multi-Action Editor Component
 * Allows adding multiple actions to automation rules
 */

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Action {
  type: string;
  value: string;
  label?: string;
}

interface MultiActionEditorProps {
  actions: Action[];
  onActionsChange: (actions: Action[]) => void;
  technicians?: Array<{ id: string; name: string; avatar?: string | null }>;
  locations?: Array<{ id: string; name: string }>;
  categories?: Array<{ id: string; label: string }>;
}

export function MultiActionEditor({
  actions,
  onActionsChange,
  technicians,
  locations,
  categories
}: MultiActionEditorProps) {

  const addAction = () => {
    onActionsChange([...actions, { type: 'assign_user', value: '' }]);
  };

  const removeAction = (index: number) => {
    if (actions.length > 1) {
      onActionsChange(actions.filter((_, i) => i !== index));
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
    onActionsChange(updated);
  };

  const getActionLabel = (type: string) => {
    const labels: Record<string, string> = {
      'assign_user': 'Assign user',
      'assign_priority': 'Assign priority',
      'assign_location': 'Assign location',
      'assign_category': 'Assign category',
      'change_status': 'Change status',
      'send_notification': 'Send notification',
      'set_due_date': 'Set due date',
      'add_comment': 'Add comment',
      'create_task': 'Create task'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>
          Then <span className="text-destructive">*</span>
        </Label>
        {actions.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {actions.length} action{actions.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {actions.map((action, index) => (
        <div key={index} className="space-y-2 p-4 border rounded-lg bg-muted/20">
          <div className="flex items-start gap-2">
            <div className="flex-1 space-y-2">
              {/* Action Type */}
              <Select
                value={action.type}
                onValueChange={(value) => updateAction(index, 'type', value)}
              >
                <SelectTrigger className="bg-white border-slate-200 focus:ring-teal-500">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assign_user">Assign user</SelectItem>
                  <SelectItem value="assign_priority">Assign priority</SelectItem>
                  <SelectItem value="assign_location">Assign location</SelectItem>
                  <SelectItem value="assign_category">Assign category</SelectItem>
                  <SelectItem value="change_status">Change status</SelectItem>
                  <SelectItem value="send_notification">Send notification</SelectItem>
                  <SelectItem value="set_due_date">Set due date</SelectItem>
                  <SelectItem value="add_comment">Add comment</SelectItem>
                  <SelectItem value="create_task">Create task</SelectItem>
                </SelectContent>
              </Select>

              {/* Action Value Fields */}
              {action.type === 'assign_user' && (
                <>
                  <Label>User</Label>
                  <Select
                    value={action.value}
                    onValueChange={(value) => updateAction(index, 'value', value)}
                  >
                    <SelectTrigger className="bg-white border-slate-200 focus:ring-teal-500">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians?.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={tech.avatar || undefined} alt={tech.name} />
                              <AvatarFallback className="text-[10px]">{tech.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span>{tech.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}

              {action.type === 'change_status' && (
                <>
                  <Label>Status</Label>
                  <Select
                    value={action.value}
                    onValueChange={(value) => updateAction(index, 'value', value)}
                  >
                    <SelectTrigger className="bg-white border-slate-200 focus:ring-teal-500">
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

              {action.type === 'assign_priority' && (
                <>
                  <Label>Priority</Label>
                  <Select
                    value={action.value}
                    onValueChange={(value) => updateAction(index, 'value', value)}
                  >
                    <SelectTrigger className="bg-white border-slate-200 focus:ring-teal-500">
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

              {action.type === 'assign_location' && (
                <>
                  <Label>Location</Label>
                  <Select
                    value={action.value}
                    onValueChange={(value) => updateAction(index, 'value', value)}
                  >
                    <SelectTrigger className="bg-white border-slate-200 focus:ring-teal-500">
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

              {action.type === 'assign_category' && (
                <>
                  <Label>Category</Label>
                  <Select
                    value={action.value}
                    onValueChange={(value) => updateAction(index, 'value', value)}
                  >
                    <SelectTrigger className="bg-white border-slate-200 focus:ring-teal-500">
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

              {action.type === 'send_notification' && (
                <>
                  <Label>Notification type</Label>
                  <Select
                    value={action.value}
                    onValueChange={(value) => updateAction(index, 'value', value)}
                  >
                    <SelectTrigger className="bg-white border-slate-200 focus:ring-teal-500">
                      <SelectValue placeholder="Select notification type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email_assigned_user">Email assigned user</SelectItem>
                      <SelectItem value="email_customer">Email customer</SelectItem>
                      <SelectItem value="email_manager">Email manager</SelectItem>
                      <SelectItem value="reminder_due_date">Reminder - Due date</SelectItem>
                      <SelectItem value="reminder_sla">Reminder - SLA</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}

              {action.type === 'set_due_date' && (
                <>
                  <Label>Due date</Label>
                  <Select
                    value={action.value}
                    onValueChange={(value) => updateAction(index, 'value', value)}
                  >
                    <SelectTrigger className="bg-white border-slate-200 focus:ring-teal-500">
                      <SelectValue placeholder="Select due date" />
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
                </>
              )}

              {action.type === 'add_comment' && (
                <>
                  <Label>Comment text</Label>
                  <Input
                    value={action.value}
                    onChange={(e) => updateAction(index, 'value', e.target.value)}
                    placeholder="Comment to add to work order"
                    className="bg-white border-slate-200 focus:ring-teal-500"
                  />
                </>
              )}

              {action.type === 'create_task' && (
                <>
                  <Label>Task description</Label>
                  <Input
                    value={action.value}
                    onChange={(e) => updateAction(index, 'value', e.target.value)}
                    placeholder="Task description"
                    className="bg-white border-slate-200 focus:ring-teal-500"
                  />
                </>
              )}
            </div>

            {/* Remove button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeAction(index)}
              disabled={actions.length === 1}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}

      {/* Add Action Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={addAction}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add action
      </Button>
    </div>
  );
}
