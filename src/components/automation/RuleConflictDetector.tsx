/**
 * Rule Conflict Detector Component
 * Detects and warns about potential conflicts between automation rules
 */

import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface Action {
  type: string;
  value: string;
  label?: string;
}

interface RuleConflict {
  type: 'priority' | 'action' | 'timing';
  severity: 'warning' | 'error';
  message: string;
  conflictingRules?: string[];
}

interface RuleConflictDetectorProps {
  currentRule: {
    name: string;
    triggerType: string;
    conditions: Array<{ type: string; value: string }>;
    actions: Action[];
    priority?: number;
  };
  existingRules: Array<{
    id: string;
    name: string;
    is_active: boolean;
    priority: number;
    trigger_conditions: any;
    actions: any[];
  }>;
}

export function RuleConflictDetector({ currentRule, existingRules }: RuleConflictDetectorProps) {
  const conflicts: RuleConflict[] = [];

  // Only check active rules
  const activeRules = existingRules.filter(r => r.is_active);

  // Check for conflicting actions on same trigger
  activeRules.forEach(rule => {
    const ruleConditions = rule.trigger_conditions as any;
    
    // Check if triggers match
    if (ruleConditions?.trigger === currentRule.triggerType) {
      // Check if actions conflict
      const currentActionTypes = currentRule.actions.map(a => a.type);
      const existingActionTypes = rule.actions.map((a: any) => a.type);
      
      // Conflicting action types (can't assign to two different users)
      if (currentActionTypes.includes('assign_user') && existingActionTypes.includes('assign_user')) {
        const currentUser = currentRule.actions.find(a => a.type === 'assign_user')?.value;
        const existingUser = rule.actions.find((a: any) => a.type === 'assign_user')?.value;
        
        if (currentUser && existingUser && currentUser !== existingUser) {
          conflicts.push({
            type: 'action',
            severity: 'error',
            message: `Conflicting user assignment with rule "${rule.name}". Both rules assign to different users on the same trigger.`,
            conflictingRules: [rule.name]
          });
        }
      }

      // Conflicting status changes
      if (currentActionTypes.includes('change_status') && existingActionTypes.includes('change_status')) {
        const currentStatus = currentRule.actions.find(a => a.type === 'change_status')?.value;
        const existingStatus = rule.actions.find((a: any) => a.type === 'change_status')?.value;
        
        if (currentStatus && existingStatus && currentStatus !== existingStatus) {
          conflicts.push({
            type: 'action',
            severity: 'error',
            message: `Conflicting status change with rule "${rule.name}". Both rules change status to different values.`,
            conflictingRules: [rule.name]
          });
        }
      }

      // Conflicting priorities
      if (currentActionTypes.includes('assign_priority') && existingActionTypes.includes('assign_priority')) {
        const currentPriority = currentRule.actions.find(a => a.type === 'assign_priority')?.value;
        const existingPriority = rule.actions.find((a: any) => a.type === 'assign_priority')?.value;
        
        if (currentPriority && existingPriority && currentPriority !== existingPriority) {
          conflicts.push({
            type: 'action',
            severity: 'warning',
            message: `Conflicting priority assignment with rule "${rule.name}". Both rules set different priorities.`,
            conflictingRules: [rule.name]
          });
        }
      }
    }
  });

  // Check for priority conflicts (higher priority rules execute first)
  const sameTriggerRules = activeRules.filter(rule => {
    const ruleConditions = rule.trigger_conditions as any;
    return ruleConditions?.trigger === currentRule.triggerType;
  });

  if (sameTriggerRules.length > 0 && currentRule.priority) {
    const higherPriorityRules = sameTriggerRules.filter(r => r.priority > currentRule.priority!);
    
    if (higherPriorityRules.length > 0) {
      conflicts.push({
        type: 'priority',
        severity: 'warning',
        message: `${higherPriorityRules.length} rule(s) with higher priority will execute first: ${higherPriorityRules.map(r => r.name).join(', ')}`,
        conflictingRules: higherPriorityRules.map(r => r.name)
      });
    }
  }

  // Check for timing conflicts (multiple time-based triggers)
  const timeBasedTriggers = ['scheduled_daily', 'scheduled_weekly', 'scheduled_monthly', 'time_before_due_date', 'time_after_creation', 'time_in_status'];
  
  if (timeBasedTriggers.includes(currentRule.triggerType)) {
    const otherTimeRules = activeRules.filter(rule => {
      const ruleConditions = rule.trigger_conditions as any;
      return timeBasedTriggers.includes(ruleConditions?.trigger);
    });

    if (otherTimeRules.length > 0) {
      conflicts.push({
        type: 'timing',
        severity: 'warning',
        message: `${otherTimeRules.length} other time-based rule(s) exist. Ensure execution times don't overlap.`,
        conflictingRules: otherTimeRules.map(r => r.name)
      });
    }
  }

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {conflicts.map((conflict, index) => (
        <Alert key={index} variant={conflict.severity === 'error' ? 'destructive' : 'default'}>
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle className="flex items-center gap-2">
            <span>Potential Conflict</span>
            <Badge variant={conflict.severity === 'error' ? 'destructive' : 'secondary'} className="text-xs">
              {conflict.severity}
            </Badge>
          </AlertTitle>
          <AlertDescription className="text-sm">
            {conflict.message}
            {conflict.conflictingRules && conflict.conflictingRules.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {conflict.conflictingRules.map((ruleName, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {ruleName}
                  </Badge>
                ))}
              </div>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
