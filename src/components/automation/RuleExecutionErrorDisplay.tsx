/**
 * Rule Execution Error Display Component
 * Shows detailed error information when rules fail to execute
 */

import { AlertCircle, ChevronDown, ChevronUp, Copy, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { showSuccess } from '@/utils/toast';

interface RuleExecutionError {
  id: string;
  rule_id: string;
  rule_name: string;
  work_order_id?: string;
  work_order_number?: string;
  error_message: string;
  error_type: 'validation' | 'execution' | 'permission' | 'timeout' | 'unknown';
  stack_trace?: string;
  context?: Record<string, any>;
  created_at: string;
  retry_count?: number;
}

interface RuleExecutionErrorDisplayProps {
  errors: RuleExecutionError[];
  onRetry?: (errorId: string) => void;
  onDismiss?: (errorId: string) => void;
}

export function RuleExecutionErrorDisplay({ errors, onRetry, onDismiss }: RuleExecutionErrorDisplayProps) {
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());

  const toggleExpanded = (errorId: string) => {
    const newExpanded = new Set(expandedErrors);
    if (newExpanded.has(errorId)) {
      newExpanded.delete(errorId);
    } else {
      newExpanded.add(errorId);
    }
    setExpandedErrors(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copied to clipboard');
  };

  const getErrorTypeColor = (type: string) => {
    switch (type) {
      case 'validation':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
      case 'execution':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'permission':
        return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
      case 'timeout':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getErrorTypeLabel = (type: string) => {
    switch (type) {
      case 'validation':
        return 'Validation Error';
      case 'execution':
        return 'Execution Error';
      case 'permission':
        return 'Permission Error';
      case 'timeout':
        return 'Timeout Error';
      default:
        return 'Unknown Error';
    }
  };

  const getActionableMessage = (error: RuleExecutionError) => {
    switch (error.error_type) {
      case 'validation':
        return 'Check rule configuration and ensure all required fields are valid.';
      case 'execution':
        return 'Review the error details below and check if the action can be performed.';
      case 'permission':
        return 'Ensure the automation system has necessary permissions to perform this action.';
      case 'timeout':
        return 'The operation took too long. Consider simplifying the rule or increasing timeout.';
      default:
        return 'Review the error details and contact support if the issue persists.';
    }
  };

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {errors.map((error) => {
        const isExpanded = expandedErrors.has(error.id);
        
        return (
          <Alert key={error.id} variant="destructive" className="relative">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle className="flex items-center justify-between pr-8">
              <div className="flex items-center gap-2">
                <span>Rule Execution Failed</span>
                <Badge className={getErrorTypeColor(error.error_type)}>
                  {getErrorTypeLabel(error.error_type)}
                </Badge>
              </div>
            </AlertTitle>
            
            <AlertDescription className="space-y-3 mt-2">
              {/* Rule and Work Order Info */}
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Rule: <span className="font-normal">{error.rule_name}</span>
                </p>
                {error.work_order_number && (
                  <p className="text-sm font-medium">
                    Work Order: <span className="font-normal">#{error.work_order_number}</span>
                  </p>
                )}
                {error.retry_count && error.retry_count > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Retry attempts: {error.retry_count}
                  </p>
                )}
              </div>

              {/* Error Message */}
              <div className="p-3 bg-destructive/10 rounded-md border border-destructive/20">
                <p className="text-sm font-mono">{error.error_message}</p>
              </div>

              {/* Actionable Message */}
              <p className="text-sm text-muted-foreground">
                💡 {getActionableMessage(error)}
              </p>

              {/* Expandable Details */}
              {(error.stack_trace || error.context) && (
                <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(error.id)}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-between">
                      <span className="text-xs">
                        {isExpanded ? 'Hide' : 'Show'} technical details
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-3 mt-3">
                    {/* Context */}
                    {error.context && Object.keys(error.context).length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">
                            Context
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.stringify(error.context, null, 2))}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            <span className="text-xs">Copy</span>
                          </Button>
                        </div>
                        <div className="p-3 bg-muted rounded-md border">
                          <pre className="text-xs font-mono overflow-x-auto">
                            {JSON.stringify(error.context, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Stack Trace */}
                    {error.stack_trace && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">
                            Stack Trace
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(error.stack_trace || '')}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            <span className="text-xs">Copy</span>
                          </Button>
                        </div>
                        <div className="p-3 bg-muted rounded-md border max-h-48 overflow-y-auto">
                          <pre className="text-xs font-mono whitespace-pre-wrap">
                            {error.stack_trace}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <p className="text-xs text-muted-foreground">
                      Error occurred: {new Date(error.created_at).toLocaleString()}
                    </p>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                {onRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRetry(error.id)}
                  >
                    Retry
                  </Button>
                )}
                {error.work_order_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/work-orders/${error.work_order_id}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View Work Order
                  </Button>
                )}
                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDismiss(error.id)}
                    className="ml-auto"
                  >
                    Dismiss
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}
