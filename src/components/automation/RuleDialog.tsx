
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AutoAssignmentRule, RuleFormData } from '@/types/auto-assignment';
import { useAutoAssignmentRules } from '@/hooks/useAutoAssignment';

interface RuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: AutoAssignmentRule | null;
}

export function RuleDialog({ open, onOpenChange, rule }: RuleDialogProps) {
  const { createRule, updateRule, isCreating, isUpdating } = useAutoAssignmentRules();
  const isEditing = !!rule;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RuleFormData>({
    defaultValues: {
      name: '',
      description: '',
      is_active: true,
      priority: 100,
      weight_availability: 30,
      weight_specialization: 25,
      weight_proximity: 20,
      weight_workload: 15,
      weight_performance: 10,
      max_distance_km: undefined,
      require_specialization_match: false,
      respect_max_concurrent_orders: true,
      fallback_action: 'escalate',
    },
  });

  useEffect(() => {
    if (rule) {
      reset({
        name: rule.name,
        description: rule.description || '',
        is_active: rule.is_active,
        priority: rule.priority,
        weight_availability: rule.weight_availability,
        weight_specialization: rule.weight_specialization,
        weight_proximity: rule.weight_proximity,
        weight_workload: rule.weight_workload,
        weight_performance: rule.weight_performance,
        max_distance_km: rule.max_distance_km || undefined,
        require_specialization_match: rule.require_specialization_match,
        respect_max_concurrent_orders: rule.respect_max_concurrent_orders,
        fallback_action: rule.fallback_action,
      });
    } else {
      reset({
        name: '',
        description: '',
        is_active: true,
        priority: 100,
        weight_availability: 30,
        weight_specialization: 25,
        weight_proximity: 20,
        weight_workload: 15,
        weight_performance: 10,
        max_distance_km: undefined,
        require_specialization_match: false,
        respect_max_concurrent_orders: true,
        fallback_action: 'escalate',
      });
    }
  }, [rule, reset]);

  const onSubmit = (data: RuleFormData) => {
    if (isEditing && rule) {
      updateRule({ id: rule.id, ...data });
    } else {
      createRule(data);
    }
    onOpenChange(false);
  };

  const weights = {
    availability: watch('weight_availability'),
    specialization: watch('weight_specialization'),
    proximity: watch('weight_proximity'),
    workload: watch('weight_workload'),
    performance: watch('weight_performance'),
  };

  const totalWeight =
    weights.availability +
    weights.specialization +
    weights.proximity +
    weights.workload +
    weights.performance;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Assignment Rule' : 'Create Assignment Rule'}</DialogTitle>
          <DialogDescription>
            Configure how work orders are automatically assigned to technicians
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Rule Name</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder="e.g., Balanced Assignment"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe when and how this rule should be applied"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
              <Label htmlFor="is_active">Rule Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isEditing ? 'Update Rule' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}