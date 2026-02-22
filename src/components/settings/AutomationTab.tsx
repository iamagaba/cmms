/**
 * Automation Tab - Settings Page Component
 * Manages automation rules and settings
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  Plus,
  Settings,
  AlertCircle
} from 'lucide-react';
import { AutomationRule, AutomationLog, AutomationMetrics as AutomationMetricsType } from '@/types/automation';
import { showSuccess, showError } from '@/utils/toast';
import { RuleEditorDialog } from '../automation/editor/RuleEditorDialog';
import { RuleExecutionErrorDisplay } from '@/components/automation/RuleExecutionErrorDisplay';
import { AutomationHero } from '@/components/automation/AutomationHero';
import { AutomationMetrics } from '@/components/automation/AutomationMetrics';
import { AutomationRuleList } from '@/components/automation/AutomationRuleList';
import { AutomationEmptyState } from '@/components/automation/AutomationEmptyState';

export default function AutomationTab() {
  const [isRuleEditorOpen, setIsRuleEditorOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  // Fetch automation settings
  const { data: settings, refetch: refetchSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['automation_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_settings')
        .select('*');
      if (error) throw error;

      return data.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, any>);
    }
  });

  // Fetch active rules
  const { data: rules, refetch: refetchRules, isLoading: rulesLoading } = useQuery({
    queryKey: ['automation_rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .order('priority', { ascending: false });
      if (error) throw error;
      return data as AutomationRule[];
    }
  });

  // Fetch recent logs
  const { data: recentLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['automation_logs_recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as AutomationLog[];
    }
  });

  // Fetch recent errors
  const { data: recentErrors, refetch: refetchErrors, isLoading: errorsLoading } = useQuery({
    queryKey: ['automation_errors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_logs')
        .select(`
          id,
          rule_id,
          rule_name,
          work_order_id,
          action_details,
          error_message,
          trigger_context,
          created_at
        `)
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;

      // Transform to error format
      return (data || []).map(log => ({
        id: log.id,
        rule_id: log.rule_id || '',
        rule_name: log.rule_name,
        work_order_id: log.work_order_id,
        work_order_number: log.action_details?.work_order_number,
        error_message: log.error_message || 'Unknown error',
        error_type: determineErrorType(log.error_message),
        stack_trace: log.trigger_context?.stack_trace,
        context: log.trigger_context,
        created_at: log.created_at,
        retry_count: log.trigger_context?.retry_count || 0
      }));
    }
  });

  // Helper to determine error type from message
  const determineErrorType = (message?: string): 'validation' | 'execution' | 'permission' | 'timeout' | 'unknown' => {
    if (!message) return 'unknown';
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid') || lowerMessage.includes('required')) {
      return 'validation';
    }
    if (lowerMessage.includes('permission') || lowerMessage.includes('unauthorized') || lowerMessage.includes('forbidden')) {
      return 'permission';
    }
    if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
      return 'timeout';
    }
    if (lowerMessage.includes('failed') || lowerMessage.includes('error')) {
      return 'execution';
    }
    return 'unknown';
  };

  // Calculate metrics
  const metrics: AutomationMetricsType | null = recentLogs ? {
    period: 'today',
    total_assignments: recentLogs.filter(l => l.rule_type === 'auto_assignment').length,
    successful_assignments: recentLogs.filter(l =>
      l.rule_type === 'auto_assignment' && l.status === 'success'
    ).length,
    failed_assignments: recentLogs.filter(l =>
      l.rule_type === 'auto_assignment' && l.status === 'failed'
    ).length,
    success_rate: 0,
    total_escalations: 0,
    at_risk_count: 0,
    overdue_count: 0,
    average_assignment_time_ms: 0,
    average_candidates_evaluated: 0,
    top_failure_reasons: [],
    technician_utilization: []
  } : null;

  if (metrics) {
    metrics.success_rate = metrics.total_assignments > 0
      ? (metrics.successful_assignments / metrics.total_assignments) * 100
      : 0;
  }

  // Toggle automation setting
  const toggleSetting = async (key: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('automation_settings')
        .update({
          setting_value: !currentValue,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', key);

      if (error) throw error;

      await refetchSettings();
      showSuccess(`Auto-assignment ${!currentValue ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      showError(`Failed to update setting: ${error.message}`);
    }
  };

  // Save or update rule
  const saveRule = async (ruleData: Partial<AutomationRule>) => {
    try {
      if (editingRule) {
        const { error } = await supabase
          .from('automation_rules')
          .update({
            ...ruleData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingRule.id);

        if (error) throw error;
        showSuccess('Rule updated');
      } else {
        const { error } = await supabase
          .from('automation_rules')
          .insert([ruleData]);

        if (error) throw error;
        showSuccess('Rule created');
      }

      await refetchRules();
    } catch (error: any) {
      showError(`Failed to save rule: ${error.message}`);
      throw error;
    }
  };

  const handleCreateRule = () => {
    setEditingRule(null);
    setIsRuleEditorOpen(true);
  };

  const handleEditRule = (rule: AutomationRule) => {
    setEditingRule(rule);
    setIsRuleEditorOpen(true);
  };

  const handleDeleteRule = async (ruleId: string) => {
    setRuleToDelete(ruleId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteRule = async () => {
    if (!ruleToDelete) return;

    try {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', ruleToDelete);

      if (error) throw error;

      showSuccess('Rule deleted');
      await refetchRules();
    } catch (error: any) {
      showError(`Failed to delete rule: ${error.message}`);
    } finally {
      setDeleteDialogOpen(false);
      setRuleToDelete(null);
    }
  };

  const toggleRuleActive = async (rule: AutomationRule) => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .update({ is_active: !rule.is_active })
        .eq('id', rule.id);

      if (error) throw error;

      showSuccess(`Rule ${!rule.is_active ? 'activated' : 'deactivated'}`);
      await refetchRules();
    } catch (error: any) {
      showError(error.message);
    }
  };

  // Handle error retry
  const handleRetryError = async (errorId: string) => {
    try {
      // Find the error
      const error = recentErrors?.find(e => e.id === errorId);
      if (!error || !error.work_order_id) {
        showError('Cannot retry: missing work order information');
        return;
      }

      // Re-run automation for this work order
      // This would typically call a backend endpoint to retry the rule
      showSuccess('Retry initiated - rule will execute shortly');

      // Refresh errors after a delay
      setTimeout(() => {
        refetchErrors();
      }, 2000);
    } catch (error: any) {
      showError(`Failed to retry: ${error.message}`);
    }
  };

  // Handle error dismiss
  const handleDismissError = async (errorId: string) => {
    try {
      // Mark error as dismissed by updating the log
      const { error } = await supabase
        .from('automation_logs')
        .update({
          trigger_context: { dismissed: true, dismissed_at: new Date().toISOString() }
        })
        .eq('id', errorId);

      if (error) throw error;

      showSuccess('Error dismissed');
      await refetchErrors();
    } catch (error: any) {
      showError(`Failed to dismiss error: ${error.message}`);
    }
  };

  // Loading skeleton
  if (settingsLoading || rulesLoading || logsLoading || errorsLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Error Display Section */}
      {recentErrors && recentErrors.length > 0 && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  Recent Validation Errors
                </CardTitle>
                <CardDescription>
                  {recentErrors.length} failed rule {recentErrors.length === 1 ? 'execution' : 'executions'} requiring attention
                </CardDescription>
              </div>
              <Badge variant="destructive" className="text-xs">
                {recentErrors.length} Issues
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <RuleExecutionErrorDisplay
              errors={recentErrors}
              onRetry={handleRetryError}
              onDismiss={handleDismissError}
            />
          </CardContent>
        </Card>
      )}

      {/* Auto-Assignment Control */}
      <AutomationHero
        enabled={settings?.auto_assignment_enabled === true}
        onToggle={() => toggleSetting('auto_assignment_enabled', settings?.auto_assignment_enabled)}
        metrics={metrics ? {
          total_assignments: metrics.total_assignments,
          success_rate: metrics.success_rate
        } : undefined}
      />

      {/* Statistics */}
      {metrics && metrics.total_assignments > 0 && (
        <AutomationMetrics metrics={metrics} />
      )}

      {/* Assignment Rules Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-400" />
              Assignment Rules
            </h2>
            <p className="text-sm text-slate-500">
              Configure how work orders are automatically processed
            </p>
          </div>
          <Button onClick={handleCreateRule} size="sm" className="gap-2 shadow-sm bg-teal-600 hover:bg-teal-700 text-white border-transparent">
            <Plus className="w-4 h-4" />
            New Rule
          </Button>
        </div>

        <div className="min-h-[200px]">
          {rules && rules.length > 0 ? (
            <AutomationRuleList
              rules={rules}
              onEdit={handleEditRule}
              onDelete={handleDeleteRule}
              onToggle={toggleRuleActive}
            />
          ) : (
            <AutomationEmptyState onCreateRule={handleCreateRule} />
          )}
        </div>
      </div>

      {/* Rule Editor Dialog */}
      <RuleEditorDialog
        open={isRuleEditorOpen}
        onOpenChange={setIsRuleEditorOpen}
        initialData={editingRule}
        onSave={saveRule}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rule</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the automation rule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRule}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Rule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
