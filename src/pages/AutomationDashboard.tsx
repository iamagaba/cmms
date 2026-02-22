/**
 * Automation Dashboard - Desktop (src/)
 * Main dashboard for managing automation rules and monitoring automated actions
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Bot, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Settings,
  Play,
  Pause
} from 'lucide-react';
import { AutomationRule, AutomationLog, AutomationMetrics } from '@/types/automation';
import { showSuccess, showError, showInfo } from '@/utils/toast';
import { RuleEditorDialog } from '@/components/automation/RuleEditorDialog';
import { Plus } from 'lucide-react';

export default function AutomationDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExecuting, setIsExecuting] = useState<'assignment' | 'sla' | null>(null);
  const [isRuleEditorOpen, setIsRuleEditorOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  // Fetch automation settings
  const { data: settings, refetch: refetchSettings } = useQuery({
    queryKey: ['automation_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_settings')
        .select('*');
      if (error) throw error;
      
      // Convert to key-value map
      return data.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, any>);
    }
  });

  // Fetch active rules
  const { data: rules, refetch: refetchRules } = useQuery({
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
  const { data: recentLogs } = useQuery({
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

  // Calculate metrics from logs
  const metrics: AutomationMetrics | null = recentLogs ? {
    period: 'today',
    total_assignments: recentLogs.filter(l => l.rule_type === 'auto_assignment').length,
    successful_assignments: recentLogs.filter(l => 
      l.rule_type === 'auto_assignment' && l.status === 'success'
    ).length,
    failed_assignments: recentLogs.filter(l => 
      l.rule_type === 'auto_assignment' && l.status === 'failed'
    ).length,
    success_rate: 0,
    total_escalations: recentLogs.filter(l => l.rule_type === 'sla_escalation').length,
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
      showSuccess(`${key.replace(/_/g, ' ')} ${!currentValue ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      showError(error.message);
    }
  };

  // Trigger manual execution
  const triggerExecution = async (type: 'assignment' | 'sla') => {
    setIsExecuting(type);
    try {
      const endpoint = type === 'assignment' 
        ? 'auto-assign-work-orders' 
        : 'sla-monitor';
      
      showInfo(`Starting ${type === 'assignment' ? 'auto-assignment' : 'SLA monitoring'}...`);
      
      const { data, error } = await supabase.functions.invoke(endpoint);
      
      if (error) {
        // Check if it's a deployment issue
        if (error.message?.includes('not found') || error.message?.includes('404')) {
          throw new Error(`Edge Function not deployed yet. Please run: supabase functions deploy ${endpoint}`);
        }
        throw error;
      }
      
      showSuccess(`${type === 'assignment' ? 'Auto-assignment' : 'SLA monitoring'} completed successfully`);
      console.log('Execution result:', data);
      
      // Refresh data
      await Promise.all([
        refetchSettings(),
        refetchRules()
      ]);
    } catch (error: any) {
      console.error('Execution error:', error);
      showError(error.message || 'Failed to execute automation');
    } finally {
      setIsExecuting(null);
    }
  };

  // Save or update rule
  const saveRule = async (ruleData: Partial<AutomationRule>) => {
    try {
      if (editingRule) {
        // Update existing rule
        const { error } = await supabase
          .from('automation_rules')
          .update({
            ...ruleData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingRule.id);

        if (error) throw error;
        showSuccess('Rule updated successfully');
      } else {
        // Create new rule
        const { error } = await supabase
          .from('automation_rules')
          .insert([ruleData]);

        if (error) throw error;
        showSuccess('Rule created successfully');
      }

      // Refresh rules list
      await refetchRules();
    } catch (error: any) {
      showError(error.message);
      throw error;
    }
  };

  // Open editor for new rule
  const handleCreateRule = () => {
    setEditingRule(null);
    setIsRuleEditorOpen(true);
  };

  // Open editor for existing rule
  const handleEditRule = (rule: AutomationRule) => {
    setEditingRule(rule);
    setIsRuleEditorOpen(true);
  };

  // Delete rule
  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
      
      showSuccess('Rule deleted successfully');
      await refetchRules();
    } catch (error: any) {
      showError(error.message);
    }
  };

  // Toggle rule active status
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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Automation Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage automated work order assignment
          </p>
        </div>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Configure
        </Button>
      </div>

      {/* Master Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Automation Controls
          </CardTitle>
          <CardDescription>
            Enable or disable automation features globally
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-Assignment</p>
              <p className="text-sm text-muted-foreground">
                Automatically assign work orders to best-match technicians
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings?.auto_assignment_enabled === true}
                onCheckedChange={() => toggleSetting('auto_assignment_enabled', settings?.auto_assignment_enabled)}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => triggerExecution('assignment')}
                disabled={settings?.auto_assignment_enabled !== true || isExecuting === 'assignment'}
              >
                {isExecuting === 'assignment' ? (
                  <>
                    <Pause className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{metrics.success_rate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Assignments</p>
                  <p className="text-2xl font-bold">{metrics.total_assignments}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed Assignments</p>
                  <p className="text-2xl font-bold">{metrics.failed_assignments}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentLogs && recentLogs.length > 0 ? (
                <div className="space-y-2">
                  {recentLogs.slice(0, 10).map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {log.status === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{log.rule_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.action_type} • {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Automation Rules</CardTitle>
                <CardDescription>
                  Configure rules for auto-assignment and escalation
                </CardDescription>
              </div>
              <Button onClick={handleCreateRule}>
                <Plus className="w-4 h-4 mr-2" />
                Create Rule
              </Button>
            </CardHeader>
            <CardContent>
              {rules && rules.length > 0 ? (
                <div className="space-y-2">
                  {rules.map(rule => (
                    <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{rule.rule_type}</Badge>
                          <Badge variant="outline">Priority: {rule.priority}</Badge>
                          {rule.schedule_cron && (
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              Scheduled
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={() => toggleRuleActive(rule)}
                        />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditRule(rule)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">No rules configured</p>
                  <Button onClick={handleCreateRule} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Rule
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rule Editor Dialog */}
      <RuleEditorDialog
        open={isRuleEditorOpen}
        onOpenChange={setIsRuleEditorOpen}
        rule={editingRule}
        onSave={saveRule}
      />
    </div>
  );
}
