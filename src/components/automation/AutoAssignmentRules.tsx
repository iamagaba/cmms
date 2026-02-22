import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useAutoAssignmentRules } from '@/hooks/useAutoAssignment';
import { AutoAssignmentRule } from '@/types/auto-assignment';
import { RuleDialog } from './RuleDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function AutoAssignmentRules() {
  const { rules, isLoading, toggleRule, deleteRule } = useAutoAssignmentRules();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoAssignmentRule | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  const handleEdit = (rule: AutoAssignmentRule) => {
    setEditingRule(rule);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingRule(null);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setRuleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (ruleToDelete) {
      deleteRule(ruleToDelete);
      setDeleteDialogOpen(false);
      setRuleToDelete(null);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading rules...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {rules?.length || 0} rule{rules?.length !== 1 ? 's' : ''} configured
        </p>
        <Button onClick={handleCreate} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {!rules || rules.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">No assignment rules configured</p>
          <Button onClick={handleCreate} variant="outline" size="sm" className="mt-4">
            Create Your First Rule
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{rule.name}</h3>
                    <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">Priority: {rule.priority}</Badge>
                  </div>
                  {rule.description && (
                    <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Availability:</span>
                      <span className="ml-1 font-medium">{rule.weight_availability}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Specialization:</span>
                      <span className="ml-1 font-medium">{rule.weight_specialization}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Proximity:</span>
                      <span className="ml-1 font-medium">{rule.weight_proximity}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Workload:</span>
                      <span className="ml-1 font-medium">{rule.weight_workload}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Performance:</span>
                      <span className="ml-1 font-medium">{rule.weight_performance}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Switch
                    checked={rule.is_active}
                    onCheckedChange={(checked) => toggleRule({ id: rule.id, is_active: checked })}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(rule)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(rule.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <RuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rule={editingRule}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this rule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
