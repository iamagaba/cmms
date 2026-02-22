/**
 * Rule Dependency Manager Component
 * Allows chaining rules together with dependencies
 */

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ArrowRight, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RuleDependency {
  rule_id: string;
  execution_order: 'before' | 'after';
  wait_for_completion: boolean;
}

interface RuleDependencyManagerProps {
  dependencies: RuleDependency[];
  onDependenciesChange: (dependencies: RuleDependency[]) => void;
  availableRules: Array<{
    id: string;
    name: string;
    is_active: boolean;
  }>;
  currentRuleId?: string;
}

export function RuleDependencyManager({
  dependencies,
  onDependenciesChange,
  availableRules,
  currentRuleId
}: RuleDependencyManagerProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const addDependency = () => {
    onDependenciesChange([
      ...dependencies,
      {
        rule_id: '',
        execution_order: 'after',
        wait_for_completion: true
      }
    ]);
  };

  const removeDependency = (index: number) => {
    onDependenciesChange(dependencies.filter((_, i) => i !== index));
  };

  const updateDependency = (index: number, field: keyof RuleDependency, value: any) => {
    const updated = [...dependencies];
    updated[index] = { ...updated[index], [field]: value };
    onDependenciesChange(updated);
  };

  // Filter out current rule and already selected rules
  const getAvailableRulesForSelect = (currentIndex: number) => {
    const selectedIds = dependencies
      .map((d, i) => i !== currentIndex ? d.rule_id : null)
      .filter(Boolean);
    
    return availableRules.filter(
      rule => rule.id !== currentRuleId && !selectedIds.includes(rule.id)
    );
  };

  // Detect circular dependencies
  const detectCircularDependency = () => {
    // Simple check: if any dependency points to a rule that depends on this rule
    // In a real implementation, this would need a more sophisticated graph traversal
    const hasCircular = dependencies.some(dep => {
      const dependentRule = availableRules.find(r => r.id === dep.rule_id);
      // This is a simplified check - would need actual dependency data from backend
      return false; // Placeholder
    });
    return hasCircular;
  };

  const hasCircularDependency = detectCircularDependency();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label>Rule Dependencies (optional)</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Chain rules together to execute in sequence
          </p>
        </div>
        {dependencies.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {dependencies.length} {dependencies.length === 1 ? 'dependency' : 'dependencies'}
          </Badge>
        )}
      </div>

      {hasCircularDependency && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription className="text-sm">
            Circular dependency detected! This will cause infinite loops.
          </AlertDescription>
        </Alert>
      )}

      {dependencies.length > 0 && (
        <div className="space-y-3">
          {dependencies.map((dependency, index) => {
            const selectedRule = availableRules.find(r => r.id === dependency.rule_id);
            const availableForSelect = getAvailableRulesForSelect(index);

            return (
              <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/20">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-3">
                    {/* Execution Order */}
                    <div className="space-y-2">
                      <Label className="text-xs">Execution order</Label>
                      <Select
                        value={dependency.execution_order}
                        onValueChange={(value: 'before' | 'after') =>
                          updateDependency(index, 'execution_order', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="before">
                            <div className="flex items-center gap-2">
                              <ArrowRight className="w-3 h-3" />
                              <span>Execute before this rule</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="after">
                            <div className="flex items-center gap-2">
                              <ArrowRight className="w-3 h-3" />
                              <span>Execute after this rule</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Rule Selection */}
                    <div className="space-y-2">
                      <Label className="text-xs">Dependent rule</Label>
                      <Select
                        value={dependency.rule_id}
                        onValueChange={(value) => updateDependency(index, 'rule_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select rule" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableForSelect.map((rule) => (
                            <SelectItem key={rule.id} value={rule.id}>
                              <div className="flex items-center gap-2">
                                <span>{rule.name}</span>
                                {!rule.is_active && (
                                  <Badge variant="secondary" className="text-xs">
                                    Inactive
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                          {availableForSelect.length === 0 && (
                            <SelectItem value="none" disabled>
                              No rules available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Wait for Completion */}
                    {showAdvanced && (
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id={`wait-${index}`}
                          checked={dependency.wait_for_completion}
                          onChange={(e) =>
                            updateDependency(index, 'wait_for_completion', e.target.checked)
                          }
                          className="w-4 h-4 rounded border-input"
                        />
                        <Label htmlFor={`wait-${index}`} className="text-xs cursor-pointer">
                          Wait for completion before continuing
                        </Label>
                      </div>
                    )}

                    {/* Visual Flow Indicator */}
                    {selectedRule && (
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-xs">
                        {dependency.execution_order === 'before' ? (
                          <>
                            <Badge variant="outline" className="text-xs">
                              {selectedRule.name}
                            </Badge>
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            <Badge variant="default" className="text-xs">
                              This Rule
                            </Badge>
                          </>
                        ) : (
                          <>
                            <Badge variant="default" className="text-xs">
                              This Rule
                            </Badge>
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            <Badge variant="outline" className="text-xs">
                              {selectedRule.name}
                            </Badge>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeDependency(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Dependency Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={addDependency}
          className="w-full"
          disabled={availableRules.filter(r => r.id !== currentRuleId).length === dependencies.length}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add dependency
        </Button>
        
        {dependencies.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide' : 'Show'} advanced
          </Button>
        )}
      </div>

      {/* Help Text */}
      {dependencies.length === 0 && (
        <div className="p-4 bg-muted/30 rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">
            <strong>Rule dependencies</strong> allow you to chain rules together. For example:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
            <li>First assign a technician, then send notification to that technician</li>
            <li>Update priority before changing status</li>
            <li>Create a task after completing the work order</li>
          </ul>
        </div>
      )}
    </div>
  );
}
