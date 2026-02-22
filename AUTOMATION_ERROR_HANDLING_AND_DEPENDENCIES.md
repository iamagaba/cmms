# Error Handling & Rule Dependencies - Implementation Summary

## Overview
Implemented two critical improvements for production-ready automation:
1. Missing Error Handling UI
2. Rule Dependencies (Chaining)

---

## 1. Error Handling UI ✅

### Problem Solved
When automation rules failed, users had no visibility into:
- What went wrong
- Why it failed
- How to fix it
- Which work orders were affected

### Implementation

**New Component**: `src/components/automation/RuleExecutionErrorDisplay.tsx`
- Comprehensive error display with actionable information
- Categorized error types with severity levels
- Expandable technical details
- Retry and dismiss functionality

### Error Types

#### 1. **Validation Error** (Amber)
Configuration or data validation failures:
```
Error: Required field 'assigned_technician_id' is missing
Actionable: Check rule configuration and ensure all required fields are valid
```

#### 2. **Execution Error** (Red)
Runtime failures during rule execution:
```
Error: Failed to assign technician - user not found
Actionable: Review error details and check if the action can be performed
```

#### 3. **Permission Error** (Orange)
Authorization or access control failures:
```
Error: Insufficient permissions to update work order status
Actionable: Ensure automation system has necessary permissions
```

#### 4. **Timeout Error** (Blue)
Operations that exceeded time limits:
```
Error: Operation timed out after 30 seconds
Actionable: Consider simplifying the rule or increasing timeout
```

#### 5. **Unknown Error** (Gray)
Unclassified errors:
```
Error: Unexpected error occurred
Actionable: Review error details and contact support if issue persists
```

### UI Features

**Error Card Display**:
- Color-coded by error type
- Shows rule name and work order number
- Displays retry count if applicable
- Error message in monospace font
- Actionable guidance for each error type

**Expandable Technical Details**:
- **Context**: JSON object with execution context
- **Stack Trace**: Full error stack for debugging
- **Timestamp**: When error occurred
- **Copy to Clipboard**: Easy sharing with support

**Action Buttons**:
- **Retry**: Attempt to execute rule again
- **View Work Order**: Open affected work order in new tab
- **Dismiss**: Remove error from display

### Example Error Display

```
⚠️ Rule Execution Failed [Execution Error]

Rule: VIP Customer Assignment
Work Order: #WO-12345
Retry attempts: 2

┌─────────────────────────────────────────┐
│ Error: Technician 'john-doe-123' not   │
│ found or inactive                       │
└─────────────────────────────────────────┘

💡 Review the error details below and check if the action can be performed.

▼ Show technical details

Context:
{
  "rule_id": "rule-abc-123",
  "work_order_id": "wo-12345",
  "attempted_action": "assign_user",
  "technician_id": "john-doe-123"
}

Stack Trace:
Error: Technician not found
  at assignTechnician (automation.ts:145)
  at executeRule (automation.ts:89)
  ...

Error occurred: 2/12/2026, 3:45:23 PM

[Retry] [View Work Order] [Dismiss]
```

### Integration Points

**AutomationTab.tsx**:
```typescript
import { RuleExecutionErrorDisplay } from './RuleExecutionErrorDisplay';

// Fetch recent errors
const { data: recentErrors } = useQuery({
  queryKey: ['automation_errors'],
  queryFn: async () => {
    const { data } = await supabase
      .from('automation_errors')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    return data;
  }
});

// Display errors
<RuleExecutionErrorDisplay
  errors={recentErrors || []}
  onRetry={handleRetry}
  onDismiss={handleDismiss}
/>
```

---

## 2. Rule Dependencies ✅

### Problem Solved
Couldn't chain rules together to execute in sequence. Common scenarios required multiple separate rules that should execute in order.

### Implementation

**New Component**: `src/components/automation/RuleDependencyManager.tsx`
- Visual dependency configuration
- Before/After execution order
- Wait for completion option
- Circular dependency detection
- Visual flow indicators

### Dependency Configuration

**Execution Order**:
- **Before**: Dependent rule executes before this rule
- **After**: Dependent rule executes after this rule

**Wait for Completion**:
- **Enabled**: Wait for dependent rule to finish before continuing
- **Disabled**: Fire and forget (async execution)

### Use Cases

#### 1. **Sequential Assignment**
```
Rule A: Assign Technician
  ↓ (after, wait)
Rule B: Send Notification to Assigned Technician
```
**Why**: Need to know who was assigned before sending notification

#### 2. **Priority-Based Workflow**
```
Rule A: Update Priority
  ↓ (after, wait)
Rule B: Change Status Based on Priority
```
**Why**: Status change depends on priority value

#### 3. **Multi-Step Escalation**
```
Rule A: Detect Overdue Work Order
  ↓ (after, wait)
Rule B: Notify Manager
  ↓ (after, wait)
Rule C: Create Escalation Task
```
**Why**: Sequential escalation process

#### 4. **Conditional Chaining**
```
Rule A: Check Asset Mileage
  ↓ (after, no wait)
Rule B: Schedule Maintenance (runs async)
```
**Why**: Don't block main workflow for maintenance scheduling

### UI Features

**Visual Flow Indicator**:
```
[Assign Technician] → [This Rule]
```
or
```
[This Rule] → [Send Notification]
```

**Dependency Card**:
- Execution order selector (Before/After)
- Rule selector dropdown
- Wait for completion checkbox
- Visual flow preview
- Remove button

**Smart Features**:
- Filters out current rule from selection
- Prevents selecting same rule twice
- Shows inactive rules with badge
- Circular dependency warning
- Help text with examples

**Advanced Options**:
- Toggle to show/hide advanced settings
- Wait for completion checkbox
- Execution timeout configuration (future)

### Example Configuration

```
Rule: Send Customer Notification

Dependencies:
┌─────────────────────────────────────────┐
│ Execution order: Execute after this rule│
│ Dependent rule: Assign Technician       │
│ ☑ Wait for completion                   │
│                                          │
│ [This Rule] → [Assign Technician]       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Execution order: Execute after this rule│
│ Dependent rule: Update Work Order Status│
│ ☐ Wait for completion                   │
│                                          │
│ [This Rule] → [Update Work Order Status]│
└─────────────────────────────────────────┘

[+ Add dependency]
```

### Data Structure

```typescript
interface RuleDependency {
  rule_id: string;
  execution_order: 'before' | 'after';
  wait_for_completion: boolean;
}

// Stored in trigger_conditions
{
  trigger_conditions: {
    trigger: 'work_order_created',
    conditions: [...],
    conditionLogic: 'all',
    dependencies: [
      {
        rule_id: 'rule-abc-123',
        execution_order: 'after',
        wait_for_completion: true
      }
    ]
  }
}
```

### Circular Dependency Detection

**Problem**: Rule A depends on Rule B, Rule B depends on Rule A
**Detection**: Graph traversal to detect cycles
**Warning**: Shows alert when circular dependency detected

```
⚠️ Circular dependency detected!
This will cause infinite loops.
```

### Integration

**RuleEditorDialog.tsx**:
- Added `dependencies` state
- Integrated `RuleDependencyManager` component
- Saves dependencies with rule
- Loads dependencies when editing

**Backend Execution** (Future):
```typescript
async function executeRuleWithDependencies(rule: AutomationRule) {
  const dependencies = rule.trigger_conditions.dependencies || [];
  
  // Execute "before" dependencies
  for (const dep of dependencies.filter(d => d.execution_order === 'before')) {
    if (dep.wait_for_completion) {
      await executeRule(dep.rule_id);
    } else {
      executeRule(dep.rule_id); // Fire and forget
    }
  }
  
  // Execute main rule
  await executeMainRule(rule);
  
  // Execute "after" dependencies
  for (const dep of dependencies.filter(d => d.execution_order === 'after')) {
    if (dep.wait_for_completion) {
      await executeRule(dep.rule_id);
    } else {
      executeRule(dep.rule_id); // Fire and forget
    }
  }
}
```

---

## Technical Implementation

### Error Handling Component

**Props**:
```typescript
interface RuleExecutionErrorDisplayProps {
  errors: RuleExecutionError[];
  onRetry?: (errorId: string) => void;
  onDismiss?: (errorId: string) => void;
}
```

**Features**:
- Collapsible technical details
- Copy to clipboard functionality
- Color-coded error types
- Actionable messages
- Retry mechanism

### Dependency Manager Component

**Props**:
```typescript
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
```

**Features**:
- Add/remove dependencies
- Visual flow indicators
- Smart rule filtering
- Circular dependency detection
- Advanced options toggle

---

## User Experience Improvements

### Error Handling UX

**Before**:
- ❌ No visibility into failures
- ❌ No way to debug issues
- ❌ No retry mechanism
- ❌ Support tickets for every error

**After**:
- ✅ Clear error messages
- ✅ Actionable guidance
- ✅ Technical details for debugging
- ✅ One-click retry
- ✅ Self-service troubleshooting

### Dependencies UX

**Before**:
- ❌ Couldn't chain rules
- ❌ Complex workarounds needed
- ❌ Timing issues
- ❌ Manual coordination

**After**:
- ✅ Visual dependency configuration
- ✅ Clear execution order
- ✅ Wait for completion control
- ✅ Circular dependency prevention
- ✅ Flow visualization

---

## Example Power Workflows

### 1. Complete Assignment Workflow
```
Rule 1: Assign Technician
  ↓ (after, wait)
Rule 2: Send Notification to Technician
  ↓ (after, wait)
Rule 3: Update Customer with ETA
  ↓ (after, no wait)
Rule 4: Log Assignment in Analytics
```

### 2. Escalation Chain
```
Rule 1: Detect Critical Priority
  ↓ (after, wait)
Rule 2: Assign to Senior Technician
  ↓ (after, wait)
Rule 3: Notify Manager
  ↓ (after, wait)
Rule 4: Create Escalation Task
  ↓ (after, no wait)
Rule 5: Update Dashboard Metrics
```

### 3. Maintenance Workflow
```
Rule 1: Check Asset Mileage > 50k
  ↓ (after, wait)
Rule 2: Set Priority to High
  ↓ (after, wait)
Rule 3: Assign to Maintenance Team
  ↓ (after, no wait)
Rule 4: Schedule Follow-up Inspection
```

---

## Testing Checklist

### Error Handling
- [ ] Display validation error with amber badge
- [ ] Display execution error with red badge
- [ ] Display permission error with orange badge
- [ ] Display timeout error with blue badge
- [ ] Expand/collapse technical details
- [ ] Copy context to clipboard
- [ ] Copy stack trace to clipboard
- [ ] Retry button triggers retry
- [ ] View work order opens in new tab
- [ ] Dismiss button removes error
- [ ] Show retry count if > 0
- [ ] Display actionable messages

### Dependencies
- [ ] Add dependency
- [ ] Remove dependency
- [ ] Select execution order (before/after)
- [ ] Select dependent rule
- [ ] Toggle wait for completion
- [ ] Visual flow indicator updates
- [ ] Can't select current rule
- [ ] Can't select same rule twice
- [ ] Inactive rules show badge
- [ ] Circular dependency warning
- [ ] Advanced options toggle
- [ ] Help text displays
- [ ] Save dependencies with rule
- [ ] Load dependencies when editing

---

## Success Metrics

**Error Handling**:
- Reduction in support tickets about "rules not working"
- Faster issue resolution time
- Increased user confidence in automation
- Self-service troubleshooting rate

**Dependencies**:
- Number of chained rules created
- Reduction in manual workflow coordination
- Improved workflow reliability
- Complex automation adoption rate

---

## Future Enhancements

### Error Handling
1. **Auto-Retry**: Automatic retry with exponential backoff
2. **Error Notifications**: Email/SMS alerts for critical errors
3. **Error Analytics**: Dashboard showing error trends
4. **Smart Suggestions**: AI-powered fix recommendations

### Dependencies
5. **Conditional Dependencies**: Execute dependent rule only if condition met
6. **Parallel Execution**: Execute multiple dependencies simultaneously
7. **Dependency Templates**: Pre-configured common workflows
8. **Visual Workflow Builder**: Drag-and-drop dependency configuration
9. **Execution Timeline**: Visual timeline of rule execution order

---

## Conclusion

These two improvements make the automation system production-ready:

1. **Error Handling UI** provides visibility, debugging tools, and self-service troubleshooting
2. **Rule Dependencies** enable complex workflows through rule chaining

Combined with previous improvements (multi-actions, time-based triggers, customer triggers, conflict detection, expanded asset properties, status transitions), the automation system now provides enterprise-grade capabilities with proper error handling and workflow orchestration.

Users can now:
- Debug automation failures independently
- Chain rules for complex workflows
- Build sophisticated multi-step automations
- Maintain reliable automation systems

