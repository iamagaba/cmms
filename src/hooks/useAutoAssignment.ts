import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  AutoAssignmentRule,
  AutoAssignmentLog,
  AutoAssignmentSettings,
  AutoAssignmentRequest,
  AutoAssignmentResponse,
  RuleFormData,
} from '@/types/auto-assignment';
import { showSuccess, showError } from '@/utils/toast';

/**
 * Hook for managing auto-assignment rules
 */
export function useAutoAssignmentRules() {
  const queryClient = useQueryClient();

  const { data: rules, isLoading } = useQuery({
    queryKey: ['auto-assignment-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auto_assignment_rules')
        .select('*')
        .order('priority', { ascending: false });

      if (error) throw error;
      return data as AutoAssignmentRule[];
    },
  });

  const createRule = useMutation({
    mutationFn: async (ruleData: RuleFormData) => {
      const { data, error } = await supabase
        .from('auto_assignment_rules')
        .insert([ruleData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-assignment-rules'] });
      showSuccess('Assignment rule created successfully');
    },
    onError: (error: Error) => {
      showError(`Failed to create rule: ${error.message}`);
    },
  });

  const updateRule = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AutoAssignmentRule> & { id: string }) => {
      const { data, error } = await supabase
        .from('auto_assignment_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-assignment-rules'] });
      showSuccess('Assignment rule updated successfully');
    },
    onError: (error: Error) => {
      showError(`Failed to update rule: ${error.message}`);
    },
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('auto_assignment_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-assignment-rules'] });
      showSuccess('Assignment rule deleted successfully');
    },
    onError: (error: Error) => {
      showError(`Failed to delete rule: ${error.message}`);
    },
  });

  const toggleRule = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('auto_assignment_rules')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['auto-assignment-rules'] });
      showSuccess(`Rule ${variables.is_active ? 'enabled' : 'disabled'}`);
    },
    onError: (error: Error) => {
      showError(`Failed to toggle rule: ${error.message}`);
    },
  });

  return {
    rules,
    isLoading,
    createRule: createRule.mutate,
    updateRule: updateRule.mutate,
    deleteRule: deleteRule.mutate,
    toggleRule: toggleRule.mutate,
    isCreating: createRule.isPending,
    isUpdating: updateRule.isPending,
    isDeleting: deleteRule.isPending,
  };
}

/**
 * Hook for managing auto-assignment settings
 */
export function useAutoAssignmentSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['auto-assignment-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auto_assignment_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      return data as AutoAssignmentSettings;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<AutoAssignmentSettings>) => {
      const { data, error } = await supabase
        .from('auto_assignment_settings')
        .update(updates)
        .eq('id', settings?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-assignment-settings'] });
      showSuccess('Settings updated successfully');
    },
    onError: (error: Error) => {
      showError(`Failed to update settings: ${error.message}`);
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  };
}

/**
 * Hook for viewing auto-assignment logs
 */
export function useAutoAssignmentLogs(workOrderId?: string) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['auto-assignment-logs', workOrderId],
    queryFn: async () => {
      let query = supabase
        .from('auto_assignment_logs')
        .select('*, technicians(name), auto_assignment_rules(name)')
        .order('assigned_at', { ascending: false })
        .limit(100);

      if (workOrderId) {
        query = query.eq('work_order_id', workOrderId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AutoAssignmentLog[];
    },
  });

  return {
    logs,
    isLoading,
  };
}

/**
 * Hook for triggering auto-assignment
 */
export function useAutoAssign() {
  const queryClient = useQueryClient();

  const autoAssign = useMutation({
    mutationFn: async (request: AutoAssignmentRequest): Promise<AutoAssignmentResponse> => {
      const { data, error } = await supabase.functions.invoke('auto-assign-work-order', {
        body: request,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['work_orders'] });
      queryClient.invalidateQueries({ queryKey: ['work_order', data.work_order_id] });
      queryClient.invalidateQueries({ queryKey: ['auto-assignment-logs'] });

      if (data.success) {
        showSuccess(
          `Work order assigned to ${data.technician_name} (Score: ${data.assignment_score?.toFixed(0)}/100)`
        );
      } else {
        showError(data.message || 'Auto-assignment failed');
      }
    },
    onError: (error: Error) => {
      showError(`Auto-assignment failed: ${error.message}`);
    },
  });

  return {
    autoAssign: autoAssign.mutate,
    isAssigning: autoAssign.isPending,
  };
}
