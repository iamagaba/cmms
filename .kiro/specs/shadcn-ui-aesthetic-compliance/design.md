# shadcn/ui Aesthetic Compliance - Design Document

## Overview

This design document outlines the comprehensive refactoring strategy to bring the desktop CMMS application (`src/`) into full compliance with shadcn/ui design principles and Nova-style aesthetic refinements. The goal is to create a modern, polished, and accessible interface that leverages shadcn/ui defaults while maintaining the application's existing functionality.

### Design Philosophy

**Trust the Defaults**: shadcn/ui components are meticulously designed with optimal spacing, typography, and visual hierarchy. Rather than fighting these defaults with custom overrides, we embrace them to create a cohesive, professional interface.

**Nova-Style Refinements**: While respecting shadcn/ui foundations, we add subtle Nova-inspired touches:
- Purple primary color (`--primary: 262.1 83.3% 57.8%`)
- Refined spacing that balances density with breathing room
- Smooth transitions and subtle shadows for depth
- Modern, polished aesthetic without over-customization

### Current State Analysis

The codebase currently exhibits several anti-patterns:
- **Over-customization**: Frequent use of `p-3`, `h-7`, `h-8` instead of shadcn/ui defaults
- **Custom utilities**: `p-compact`, `gap-compact`, `space-y-compact` that deviate from standard Tailwind
- **Inconsistent typography**: Mix of `text-xs`, `text-sm`, arbitrary sizes like `text-[10px]`
- **Inline badge styling**: Direct color classes instead of semantic variants
- **Icon size variations**: 10px, 12px, 13px, 14px, 16px instead of standard 16px/20px/24px
- **Missing semantic structure**: Not fully leveraging CardHeader, CardTitle, CardDescription

### Target State

A fully compliant shadcn/ui implementation with:
- Components using default padding, sizing, and styling
- Consistent typography hierarchy (text-2xl titles, text-sm body, text-xs captions)
- Standard icon sizing (w-4 h-4, w-5 h-5, w-6 h-6)
- Proper spacing scale (p-4, p-6, gap-4, gap-6)
- Semantic component usage (CardHeader, CardTitle, CardContent)
- Clean badge variants instead of inline colors
- CSS variable-based theming throughout
- Modern polish with shadow-sm, rounded-lg, smooth transitions

## Architecture

### Component Hierarchy

```
Application
├── Pages (src/pages/)
│   ├── Dashboard (ProfessionalCMMSDashboard.tsx)
│   ├── Assets (Assets.tsx, AssetDetails.tsx)
│   ├── Work Orders (WorkOrders.tsx, WorkOrderDetailsEnhanced.tsx)
│   ├── Customers (Customers.tsx, CustomerDetails.tsx)
│   ├── Inventory (Inventory.tsx)
│   ├── Locations (Locations.tsx)
│   ├── Technicians (Technicians.tsx)
│   ├── Scheduling (Scheduling.tsx)
│   ├── Reports (Reports.tsx)
│   └── Settings (Settings.tsx)
│
├── Dashboard Components (src/components/dashboard/)
│   ├── ModernKPICard.tsx
│   ├── ActivityFeed.tsx
│   ├── AssetStatusOverview.tsx
│   ├── PriorityWorkOrders.tsx
│   ├── QuickActionsPanel.tsx
│   ├── StatRibbon.tsx
│   ├── TechniciansList.tsx
│   └── WorkOrderTrendsChart.tsx
│
├── UI Components (src/components/ui/)
│   ├── shadcn/ui primitives (button, card, dialog, etc.)
│   ├── EnhancedDataTable.tsx
│   ├── DataTableFilterBar.tsx
│   ├── DataTableBulkActions.tsx
│   └── Custom components using shadcn/ui
│
└── Styling (src/App.css)
    ├── CSS variables (HSL color system)
    ├── Base styles
    └── Utility classes
```

### Refactoring Strategy

**Incremental Approach**: Refactor component-by-component to minimize risk and allow for testing at each step.

**Priority Order**:
1. **Foundation**: Update App.css (remove compact utilities, ensure CSS variables are correct)
2. **Core Components**: Badge variants, shared UI components
3. **Dashboard**: High-visibility components (KPI cards, charts, activity feed)
4. **Data Tables**: EnhancedDataTable and related components
5. **Pages**: Individual pages in order of usage frequency
6. **Forms**: Form components and dialogs
7. **Details Pages**: Asset details, work order details, customer details

**Testing Strategy**: After each component refactoring:
- Visual regression testing (manual review)
- Accessibility testing (keyboard navigation, screen reader)
- Dark mode verification
- Responsive behavior check

### Design System Layers

```
Layer 1: CSS Variables (App.css)
├── Color tokens (--primary, --foreground, --muted, etc.)
├── Spacing tokens (--radius)
└── Theme variants (light/dark)

Layer 2: shadcn/ui Primitives (components/ui/)
├── Base components (Button, Card, Dialog, etc.)
├── Default styling and variants
└── Radix UI accessibility features

Layer 3: Custom Components
├── Composed from shadcn/ui primitives
├── Minimal custom styling
└── Application-specific logic

Layer 4: Pages
├── Compose custom components
├── Layout and structure
└── Business logic integration
```

## Components and Interfaces

### Typography System

**Hierarchy Definition**:

```typescript
// Typography scale aligned with shadcn/ui defaults
const typography = {
  // Page-level titles
  pageTitle: 'text-2xl font-bold',
  
  // Section headers
  sectionHeader: 'text-lg font-semibold',
  
  // Card titles (use CardTitle component)
  cardTitle: 'text-2xl', // CardTitle default
  
  // Subsection headers
  subsectionHeader: 'text-base font-semibold',
  
  // Body text (primary)
  body: 'text-sm', // 14px - readable default
  
  // Secondary text
  secondary: 'text-sm text-muted-foreground',
  
  // Captions and metadata
  caption: 'text-xs', // 12px
  
  // Small labels
  label: 'text-xs font-medium uppercase tracking-wider',
};
```

**Usage Guidelines**:
- **Page titles**: Use `text-2xl font-bold` for main page headings
- **Card titles**: Use `<CardTitle>` component (text-2xl default)
- **Body text**: Use `text-sm` (14px) for readable content
- **Secondary text**: Use `text-sm text-muted-foreground` for less prominent info
- **Captions**: Use `text-xs` (12px) for timestamps, metadata
- **Never use**: Arbitrary sizes like `text-[10px]`, `text-[9px]`

### Icon Sizing System

**Standard Sizes**:

```typescript
const iconSizes = {
  // Small icons (inline with text, buttons)
  small: 'w-4 h-4', // 16px
  
  // Standard icons (default for most use cases)
  standard: 'w-5 h-5', // 20px
  
  // Large icons (headers, empty states, feature icons)
  large: 'w-6 h-6', // 24px
  
  // Extra large (hero sections, empty states)
  xlarge: 'w-8 h-8', // 32px
};
```

**Usage Guidelines**:
- **Buttons**: Use `w-4 h-4` for icons inside buttons
- **Card headers**: Use `w-5 h-5` for icons in card headers
- **Page headers**: Use `w-6 h-6` for icons in page titles
- **Empty states**: Use `w-8 h-8` or larger for empty state illustrations
- **Inline with text**: Use `w-4 h-4` to match text height
- **Never use**: Arbitrary sizes like `size={10}`, `size={13}`, `size={14}`

### Spacing System

**shadcn/ui Spacing Scale**:

```typescript
const spacing = {
  // Component padding
  cardPadding: 'p-6', // CardContent default - comfortable
  cardHeaderPadding: 'p-4', // CardHeader default
  dialogPadding: 'p-4', // Dialog default
  
  // Gaps between elements
  tightGap: 'gap-2', // 8px - for closely related items
  standardGap: 'gap-4', // 16px - default gap
  spaciousGap: 'gap-6', // 24px - between sections
  
  // Vertical spacing
  tightSpacing: 'space-y-2', // 8px
  standardSpacing: 'space-y-4', // 16px - form fields
  sectionSpacing: 'space-y-6', // 24px - between sections
  
  // Horizontal spacing
  inlineSpacing: 'space-x-2', // 8px
  standardHorizontal: 'space-x-4', // 16px
};
```

**Migration from Compact Utilities**:
- `p-compact` (16px) → `p-4` (16px) - same value, standard naming
- `gap-compact` (12px) → `gap-4` (16px) - slightly more breathing room
- `space-y-compact` (12px) → `space-y-4` (16px) - better readability

### Color System

**CSS Variable-Based Theming**:

```typescript
// Semantic color tokens (use these instead of hardcoded colors)
const colors = {
  // Primary brand color (Nova purple)
  primary: 'bg-primary text-primary-foreground',
  
  // Secondary/muted
  secondary: 'bg-secondary text-secondary-foreground',
  muted: 'bg-muted text-muted-foreground',
  
  // Accent (hover states, highlights)
  accent: 'bg-accent text-accent-foreground',
  
  // Destructive (errors, delete actions)
  destructive: 'bg-destructive text-destructive-foreground',
  
  // Borders and inputs
  border: 'border-border',
  input: 'border-input',
  
  // Focus rings
  ring: 'ring-ring',
};
```

**Status Colors** (for badges and indicators):

```typescript
const statusColors = {
  success: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  warning: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  error: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
};
```

### Badge Component Variants

**Current Problem**: Inline color classes scattered throughout codebase:
```tsx
// ❌ Current anti-pattern
<span className="px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
  Completed
</span>
```

**Solution**: Badge variants using class-variance-authority:

```typescript
// components/ui/badge.tsx enhancement
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
        
        // Status variants
        success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        warning: 'border-amber-200 bg-amber-50 text-amber-700',
        error: 'border-rose-200 bg-rose-50 text-rose-700',
        info: 'border-blue-200 bg-blue-50 text-blue-700',
        
        // Work order status variants
        open: 'border-blue-200 bg-blue-50 text-blue-700',
        'in-progress': 'border-amber-200 bg-amber-50 text-amber-700',
        completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        cancelled: 'border-gray-200 bg-gray-50 text-gray-700',
        
        // Priority variants
        critical: 'border-rose-200 bg-rose-50 text-rose-700 font-bold',
        high: 'border-orange-200 bg-orange-50 text-orange-700',
        medium: 'border-amber-200 bg-amber-50 text-amber-700',
        low: 'border-gray-200 bg-gray-50 text-gray-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
```

**Usage**:
```tsx
// ✅ Clean, semantic usage
<Badge variant="success">Completed</Badge>
<Badge variant="critical">Critical Priority</Badge>
<Badge variant="in-progress">In Progress</Badge>
```

### Helper Components

**StatusBadge Component**:

```typescript
// components/StatusBadge.tsx
interface StatusBadgeProps {
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const labels = {
    open: 'Open',
    'in-progress': 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  
  return (
    <Badge variant={status} className={className}>
      {labels[status]}
    </Badge>
  );
}
```

**PriorityBadge Component**:

```typescript
// components/PriorityBadge.tsx
interface PriorityBadgeProps {
  priority: 'critical' | 'high' | 'medium' | 'low';
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const labels = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };
  
  return (
    <Badge variant={priority} className={className}>
      {labels[priority]}
    </Badge>
  );
}
```

### Card Component Patterns

**Semantic Structure**:

```tsx
// ✅ Proper shadcn/ui card structure
<Card>
  <CardHeader>
    <CardTitle>Work Orders</CardTitle>
    <CardDescription>Manage and track maintenance tasks</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content with default p-6 padding */}
  </CardContent>
  <CardFooter>
    {/* Optional footer actions */}
  </CardFooter>
</Card>
```

**Before/After Examples**:

```tsx
// ❌ Before: Over-customized, missing semantic structure
<Card className="p-3">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-sm font-semibold">Work Orders</h3>
    <Icon icon="work" size={16} />
  </div>
  <div className="space-y-2">
    {/* Content */}
  </div>
</Card>

// ✅ After: shadcn/ui compliant with semantic structure
<Card>
  <CardHeader className="flex flex-row items-center justify-between">
    <div>
      <CardTitle>Work Orders</CardTitle>
      <CardDescription>Active maintenance tasks</CardDescription>
    </div>
    <Icon icon="work" className="w-5 h-5 text-muted-foreground" />
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Content with proper spacing */}
  </CardContent>
</Card>
```

### Button Component Patterns

**Default Sizes** (trust shadcn/ui):

```tsx
// shadcn/ui button sizes
const buttonSizes = {
  default: 'h-9 px-4 py-2', // Default size
  sm: 'h-8 rounded-md px-3 text-xs',
  lg: 'h-10 rounded-md px-8',
  icon: 'h-9 w-9', // Square icon button
};
```

**Usage**:

```tsx
// ✅ Use default sizes
<Button>Default Button</Button>
<Button size="sm">Small Button</Button>
<Button size="lg">Large Button</Button>
<Button size="icon"><Icon className="w-4 h-4" /></Button>

// ✅ Icons in buttons automatically sized
<Button>
  <Icon className="w-4 h-4 mr-2" />
  With Icon
</Button>
```

### Form Component Patterns

**shadcn/ui Form Structure**:

```tsx
// ✅ Proper form structure with shadcn/ui
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Title</FormLabel>
          <FormControl>
            <Input placeholder="Enter title" {...field} />
          </FormControl>
          <FormDescription>
            A descriptive title for the work order
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    
    <FormField
      control={form.control}
      name="priority"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Priority</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
    
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

### Data Table Patterns

**EnhancedDataTable Compliance**:

Current EnhancedDataTable likely has custom styling. Ensure it uses:
- `text-sm` for table cells (readable body text)
- `text-xs font-medium` for table headers
- `p-4` for cell padding
- `border-border` for borders
- `hover:bg-accent` for row hover states

```tsx
// Table component structure
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="text-xs font-medium uppercase">Column</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-accent">
      <TableCell className="text-sm">Cell content</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Data Models

### Component Refactoring Model

```typescript
interface ComponentRefactoring {
  // Component identification
  componentPath: string;
  componentName: string;
  priority: 'high' | 'medium' | 'low';
  
  // Current state analysis
  currentIssues: {
    overCustomization: string[];
    typographyIssues: string[];
    iconSizeIssues: string[];
    spacingIssues: string[];
    semanticStructureIssues: string[];
    badgeStylingIssues: string[];
    colorTokenIssues: string[];
  };
  
  // Refactoring plan
  changes: {
    type: 'typography' | 'spacing' | 'icons' | 'structure' | 'colors' | 'badges';
    description: string;
    before: string; // Code snippet
    after: string; // Code snippet
  }[];
  
  // Testing requirements
  testing: {
    visualRegression: boolean;
    accessibility: boolean;
    darkMode: boolean;
    responsive: boolean;
  };
  
  // Dependencies
  dependencies: string[]; // Other components that depend on this
  blockedBy: string[]; // Components that must be refactored first
}
```

### Typography Audit Model

```typescript
interface TypographyAudit {
  file: string;
  line: number;
  current: string; // e.g., "text-xs"
  recommended: string; // e.g., "text-sm"
  context: string; // Usage context
  reason: string; // Why the change is recommended
}
```

### Icon Audit Model

```typescript
interface IconAudit {
  file: string;
  line: number;
  currentSize: string; // e.g., "size={14}"
  recommendedSize: string; // e.g., "className='w-4 h-4'"
  context: string; // Where the icon is used
  reason: string; // Why the change is recommended
}
```

### Spacing Audit Model

```typescript
interface SpacingAudit {
  file: string;
  line: number;
  currentSpacing: string; // e.g., "p-3" or "p-compact"
  recommendedSpacing: string; // e.g., "p-4" or "p-6"
  context: string; // Component context
  reason: string; // Why the change is recommended
}
```

### Badge Migration Model

```typescript
interface BadgeMigration {
  file: string;
  line: number;
  currentImplementation: string; // Inline classes
  newImplementation: string; // Badge variant
  variant: string; // Which badge variant to use
}
```

### CSS Variable Usage Model

```typescript
interface CSSVariableUsage {
  file: string;
  line: number;
  hardcodedColor: string; // e.g., "bg-purple-600"
  cssVariable: string; // e.g., "bg-primary"
  semanticMeaning: string; // What the color represents
}
```

### Refactoring Checklist Model

```typescript
interface RefactoringChecklist {
  component: string;
  checks: {
    typography: {
      pageTitles: boolean;
      cardTitles: boolean;
      bodyText: boolean;
      captions: boolean;
      noArbitrarySizes: boolean;
    };
    icons: {
      standardSizes: boolean;
      consistentUsage: boolean;
      noArbitrarySizes: boolean;
    };
    spacing: {
      cardPadding: boolean;
      gaps: boolean;
      noCompactUtilities: boolean;
    };
    structure: {
      cardHeader: boolean;
      cardTitle: boolean;
      cardContent: boolean;
      semanticComponents: boolean;
    };
    colors: {
      cssVariables: boolean;
      noHardcodedColors: boolean;
      semanticUsage: boolean;
    };
    badges: {
      variants: boolean;
      noInlineColors: boolean;
      consistentUsage: boolean;
    };
    accessibility: {
      focusStates: boolean;
      colorContrast: boolean;
      keyboardNav: boolean;
      ariaLabels: boolean;
    };
    polish: {
      shadows: boolean;
      transitions: boolean;
      hoverStates: boolean;
      borderRadius: boolean;
    };
  };
  completionPercentage: number;
  notes: string[];
}
```


## Component-by-Component Refactoring Guide

### Priority 1: Foundation (App.css)

**Changes Required**:

1. **Remove Compact Utilities**:
```css
/* ❌ Remove these custom utilities */
.space-y-compact > * + * { margin-top: 0.75rem; }
.space-x-compact > * + * { margin-left: 0.75rem; }
.gap-compact { gap: 0.75rem; }
.p-compact { padding: 1rem; }
.px-compact { padding-left: 0.75rem; padding-right: 0.75rem; }
.py-compact { padding-top: 0.75rem; padding-bottom: 0.75rem; }
```

2. **Verify CSS Variables** (already correct):
```css
/* ✅ Keep these - Nova purple primary */
--primary: 262.1 83.3% 57.8%;
--primary-foreground: 210 20% 98%;
--radius: 0.75rem; /* 12px - good balance */
```

3. **Keep Utility Classes**:
```css
/* ✅ Keep scrollbar styling and no-scrollbar utility */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
```

**Migration Strategy**:
- Find all usages of compact utilities: `grep -r "compact" src/`
- Replace with standard Tailwind: `p-compact` → `p-4`, `gap-compact` → `gap-4`
- Test each page after migration

### Priority 2: Badge Component

**File**: `src/components/ui/badge.tsx`

**Current State**: Basic badge with limited variants

**Enhanced Implementation**:

```typescript
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
        
        // Status variants
        success: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400',
        warning: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400',
        error: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400',
        info: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400',
        
        // Work order status
        open: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400',
        'in-progress': 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400',
        completed: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400',
        cancelled: 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400',
        
        // Priority variants
        critical: 'border-rose-200 bg-rose-50 text-rose-700 font-bold dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400',
        high: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-400',
        medium: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400',
        low: 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
```

**Helper Components** (create new files):

```typescript
// src/components/StatusBadge.tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  className?: string;
}

const statusLabels = {
  open: 'Open',
  'in-progress': 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={status} className={className}>
      {statusLabels[status]}
    </Badge>
  );
}

// src/components/PriorityBadge.tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: 'critical' | 'high' | 'medium' | 'low';
  className?: string;
}

const priorityLabels = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <Badge variant={priority} className={className}>
      {priorityLabels[priority]}
    </Badge>
  );
}
```

**Migration**: Find all inline badge styling and replace with Badge component variants.

### Priority 3: Dashboard Components

#### ModernKPICard.tsx

**Current Issues**:
- Custom color classes instead of CSS variables
- `p-5` instead of `p-6`
- `text-xs` for title (should be more prominent)
- `text-3xl` for value (good, keep)
- Icon size 20px (good, keep as `w-5 h-5`)
- Custom border-l-4 pattern (acceptable for KPI cards)

**Refactored Implementation**:

```typescript
import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnalyticsUpIcon, AnalyticsDownIcon, MinusSignIcon } from '@hugeicons/core-free-icons';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export interface ModernKPICardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  loading?: boolean;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

// Use CSS variables for theming
const colorClasses = {
  primary: {
    border: 'border-l-4 border-l-primary',
    icon: 'text-primary',
    iconBg: 'bg-primary/10',
  },
  success: {
    border: 'border-l-4 border-l-emerald-500',
    icon: 'text-emerald-600',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950',
  },
  warning: {
    border: 'border-l-4 border-l-amber-500',
    icon: 'text-amber-600',
    iconBg: 'bg-amber-50 dark:bg-amber-950',
  },
  danger: {
    border: 'border-l-4 border-l-rose-500',
    icon: 'text-rose-600',
    iconBg: 'bg-rose-50 dark:bg-rose-950',
  },
  info: {
    border: 'border-l-4 border-l-slate-500',
    icon: 'text-slate-600',
    iconBg: 'bg-slate-50 dark:bg-slate-950',
  },
};

const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
  switch (direction) {
    case 'up': return AnalyticsUpIcon;
    case 'down': return AnalyticsDownIcon;
    default: return MinusSignIcon;
  }
};

const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
  switch (direction) {
    case 'up': return 'text-emerald-600';
    case 'down': return 'text-rose-600';
    default: return 'text-muted-foreground';
  }
};

const ModernKPICard: React.FC<ModernKPICardProps> = ({
  title,
  value,
  icon,
  trend,
  color,
  loading = false,
  subtitle,
  actionLabel,
  onAction,
  className
}) => {
  const classes = colorClasses[color];
  const isClickable = !!onAction;

  if (loading) {
    return (
      <Card className={cn('h-full', className)}>
        <CardContent className="p-6 space-y-4 animate-pulse">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
            <div className="h-10 w-10 bg-muted rounded-lg" />
          </div>
          <div className="h-8 w-16 bg-muted rounded" />
          <div className="h-4 w-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      whileHover={isClickable ? { y: -1 } : undefined}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={cn('h-full', className)}
    >
      <Card
        className={cn(
          'h-full transition-all duration-200 hover:shadow-md',
          classes.border,
          isClickable && 'cursor-pointer'
        )}
        onClick={isClickable ? onAction : undefined}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {title}
              </p>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <div className={cn('p-2 rounded-lg flex-shrink-0 ml-3', classes.iconBg)}>
              <HugeiconsIcon icon={icon} className={cn('w-5 h-5', classes.icon)} />
            </div>
          </div>

          {/* Value */}
          <div className="mb-4">
            <div className="text-3xl font-bold tracking-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {trend && (
              <div className={cn(
                'flex items-center gap-1.5 text-xs font-medium',
                getTrendColor(trend.direction)
              )}>
                <HugeiconsIcon icon={getTrendIcon(trend.direction)} className="w-4 h-4" />
                <span>{Math.abs(trend.value)}%</span>
                <span className="text-muted-foreground">{trend.label}</span>
              </div>
            )}

            {actionLabel && isClickable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction?.();
                }}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
              >
                {actionLabel}
                <HugeiconsIcon
                  icon="arrow-right"
                  className="w-3 h-3 transition-transform group-hover:translate-x-0.5"
                />
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ModernKPICard;
```

**Key Changes**:
- ✅ Use `CardContent` with `p-6` (shadcn/ui default)
- ✅ Use `text-sm` for title (more readable than `text-xs`)
- ✅ Use `text-muted-foreground` instead of `text-gray-600`
- ✅ Use `bg-muted` for skeleton loading
- ✅ Use `w-5 h-5` for icons (20px standard)
- ✅ Use `w-4 h-4` for trend icons (16px small)
- ✅ Use CSS variable-based colors where possible
- ✅ Keep `text-3xl` for value (appropriate for KPI)
- ✅ Use `hover:shadow-md` for elevation on hover

#### ActivityFeed.tsx

**Refactoring Focus**:
- Use `text-sm` for activity descriptions
- Use `text-xs text-muted-foreground` for timestamps
- Use `space-y-4` for activity item spacing
- Use `w-5 h-5` for activity icons
- Use StatusBadge/PriorityBadge components

#### AssetStatusOverview.tsx

**Refactoring Focus**:
- Use CardHeader + CardTitle structure
- Use `text-sm` for body text
- Use `w-5 h-5` for status icons
- Use badge variants for status indicators
- Use `space-y-4` for section spacing

#### PriorityWorkOrders.tsx

**Refactoring Focus**:
- Use CardHeader + CardTitle + CardDescription
- Use `text-sm` for work order titles
- Use `text-xs text-muted-foreground` for metadata
- Use PriorityBadge component
- Use `space-y-4` for work order list spacing

#### QuickActionsPanel.tsx

**Refactoring Focus**:
- Use Button component with default sizes
- Use `w-5 h-5` for action icons
- Use `gap-4` for action button spacing
- Use `text-sm` for action labels

#### TechniciansList.tsx

**Refactoring Focus**:
- Use `text-sm` for technician names
- Use `text-xs text-muted-foreground` for status/location
- Use badge variants for availability status
- Use `w-5 h-5` for avatar/icon sizes
- Use `space-y-4` for list spacing

#### WorkOrderTrendsChart.tsx

**Refactoring Focus**:
- Use CardHeader + CardTitle structure
- Use `text-sm` for chart labels
- Use `text-xs` for axis labels
- Ensure chart colors use CSS variables where possible

### Priority 4: Data Table Components

#### EnhancedDataTable.tsx

**Refactoring Focus**:
- Use `text-sm` for table cells (readable body text)
- Use `text-xs font-medium uppercase tracking-wider` for headers
- Use `p-4` for cell padding (comfortable spacing)
- Use `border-border` for all borders
- Use `hover:bg-accent` for row hover states
- Use `text-muted-foreground` for secondary cell content
- Ensure pagination uses Button component with default sizes

**Before/After Example**:

```tsx
// ❌ Before
<TableHead className="text-[10px] font-semibold uppercase px-3 py-2">
  Column Name
</TableHead>
<TableCell className="text-xs px-3 py-2">
  Cell content
</TableCell>

// ✅ After
<TableHead className="text-xs font-medium uppercase tracking-wider">
  Column Name
</TableHead>
<TableCell className="text-sm">
  Cell content
</TableCell>
```

#### DataTableFilterBar.tsx

**Refactoring Focus**:
- Use Input component with default height (h-9)
- Use Button component with default sizes
- Use `gap-4` for filter spacing
- Use `text-sm` for filter labels
- Use badge variants for active filter indicators

#### DataTableBulkActions.tsx

**Refactoring Focus**:
- Use Button component with default sizes
- Use `w-4 h-4` for action icons
- Use `gap-4` for action button spacing
- Use `text-sm` for action labels

### Priority 5: Page Components

#### Dashboard (ProfessionalCMMSDashboard.tsx)

**Refactoring Focus**:
- Use `text-2xl font-bold` for page title
- Use `gap-6` for dashboard grid spacing
- Use `space-y-6` for vertical section spacing
- Ensure all KPI cards use refactored ModernKPICard
- Ensure all dashboard components follow new patterns

#### Assets.tsx

**Refactoring Focus**:
- Use `text-2xl font-bold` for page title
- Use CardHeader + CardTitle for main card
- Use EnhancedDataTable with refactored styling
- Use badge variants for asset status
- Use `gap-4` for filter/action spacing

#### WorkOrders.tsx

**Refactoring Focus**:
- Use `text-2xl font-bold` for page title
- Use CardHeader + CardTitle for main card
- Use StatusBadge and PriorityBadge components
- Use EnhancedDataTable with refactored styling
- Use `gap-4` for filter/action spacing

#### WorkOrderDetailsEnhanced.tsx

**Refactoring Focus**:
- Use `text-2xl font-bold` for work order title
- Use Card + CardHeader + CardTitle for sections
- Use `text-sm` for body text
- Use `text-xs text-muted-foreground` for metadata
- Use StatusBadge and PriorityBadge
- Use `space-y-6` for section spacing
- Use `space-y-4` for form field spacing

#### Customers.tsx, CustomerDetails.tsx

**Refactoring Focus**:
- Use `text-2xl font-bold` for page titles
- Use CardHeader + CardTitle structure
- Use `text-sm` for body text
- Use `text-xs text-muted-foreground` for metadata
- Use badge variants for customer status
- Use `space-y-6` for section spacing

#### Inventory.tsx, Locations.tsx, Technicians.tsx

**Refactoring Focus**:
- Use `text-2xl font-bold` for page titles
- Use CardHeader + CardTitle structure
- Use EnhancedDataTable with refactored styling
- Use badge variants for status indicators
- Use `gap-4` for filter/action spacing

#### Scheduling.tsx

**Refactoring Focus**:
- Use `text-2xl font-bold` for page title
- Use CardHeader + CardTitle for calendar card
- Use `text-sm` for event titles
- Use `text-xs` for event times
- Use badge variants for event types
- Ensure calendar styling uses CSS variables

#### Reports.tsx

**Refactoring Focus**:
- Use `text-2xl font-bold` for page title
- Use CardHeader + CardTitle for report cards
- Use `text-sm` for report descriptions
- Use Button component with default sizes
- Use `gap-6` for report card grid

#### Settings.tsx

**Refactoring Focus**:
- Use `text-2xl font-bold` for page title
- Use Card + CardHeader + CardTitle for setting sections
- Use Form components with proper structure
- Use `space-y-4` for form field spacing
- Use `space-y-6` for section spacing
- Use Button component with default sizes

### Priority 6: Form Components and Dialogs

**General Refactoring Pattern**:

```tsx
// ✅ Proper dialog structure
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        A brief description of what this dialog does
      </DialogDescription>
    </DialogHeader>
    
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="field"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field Label</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Optional helper text
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Submit
          </Button>
        </DialogFooter>
      </form>
    </Form>
  </DialogContent>
</Dialog>
```

## Error Handling

### Visual Error States

**Form Validation Errors**:
- Use FormMessage component (automatically styled by shadcn/ui)
- Error text uses `text-sm text-destructive`
- Error borders use `border-destructive`

```tsx
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage /> {/* Automatically shows validation errors */}
    </FormItem>
  )}
/>
```

**Empty States**:
- Use `text-sm text-muted-foreground` for empty state messages
- Use `w-8 h-8` or larger for empty state icons
- Center content with proper spacing

```tsx
<div className="flex flex-col items-center justify-center py-12 space-y-4">
  <Icon className="w-8 h-8 text-muted-foreground" />
  <p className="text-sm text-muted-foreground">No items found</p>
  <Button variant="outline" size="sm">
    Add New Item
  </Button>
</div>
```

**Loading States**:
- Use Skeleton component from shadcn/ui
- Use `bg-muted` for skeleton backgrounds
- Match skeleton dimensions to actual content

```tsx
<Card>
  <CardContent className="p-6 space-y-4 animate-pulse">
    <div className="h-4 w-24 bg-muted rounded" />
    <div className="h-8 w-16 bg-muted rounded" />
    <div className="h-4 w-20 bg-muted rounded" />
  </CardContent>
</Card>
```

**Error Alerts**:
- Use Alert component with destructive variant
- Use `text-sm` for alert text

```tsx
<Alert variant="destructive">
  <AlertCircle className="w-4 h-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription className="text-sm">
    Something went wrong. Please try again.
  </AlertDescription>
</Alert>
```

### Accessibility Error Handling

**Focus Management**:
- Ensure error fields receive focus automatically
- Use `aria-invalid` on invalid inputs
- Use `aria-describedby` to link errors to inputs

**Screen Reader Announcements**:
- Use `role="alert"` for error messages
- Ensure FormMessage has proper ARIA attributes

**Keyboard Navigation**:
- Ensure all error states are keyboard accessible
- Provide keyboard shortcuts for common error recovery actions

## Testing Strategy

### Visual Regression Testing

**Manual Testing Checklist**:
1. **Typography Verification**:
   - [ ] Page titles use text-2xl font-bold
   - [ ] Card titles use CardTitle component
   - [ ] Body text uses text-sm
   - [ ] Captions use text-xs
   - [ ] No arbitrary font sizes

2. **Icon Sizing Verification**:
   - [ ] Standard icons use w-5 h-5 (20px)
   - [ ] Small icons use w-4 h-4 (16px)
   - [ ] Large icons use w-6 h-6 (24px)
   - [ ] No arbitrary icon sizes

3. **Spacing Verification**:
   - [ ] Cards use p-6 for content padding
   - [ ] Standard gaps use gap-4
   - [ ] Section spacing uses space-y-6
   - [ ] No compact utilities

4. **Component Structure Verification**:
   - [ ] Cards use CardHeader + CardTitle + CardContent
   - [ ] Dialogs use DialogHeader + DialogTitle
   - [ ] Forms use FormField + FormItem structure
   - [ ] Tables use proper Table components

5. **Color Verification**:
   - [ ] Primary actions use bg-primary
   - [ ] Secondary text uses text-muted-foreground
   - [ ] Borders use border-border
   - [ ] No hardcoded color values

6. **Badge Verification**:
   - [ ] Status badges use StatusBadge component
   - [ ] Priority badges use PriorityBadge component
   - [ ] No inline color classes
   - [ ] Consistent badge styling

### Accessibility Testing

**WCAG AA Compliance Checklist**:
1. **Color Contrast**:
   - [ ] Text on background meets 4.5:1 ratio
   - [ ] Large text meets 3:1 ratio
   - [ ] Interactive elements meet contrast requirements
   - [ ] Focus indicators are visible

2. **Keyboard Navigation**:
   - [ ] All interactive elements are keyboard accessible
   - [ ] Tab order is logical
   - [ ] Focus indicators are visible
   - [ ] Keyboard shortcuts work correctly

3. **Screen Reader Compatibility**:
   - [ ] All images have alt text
   - [ ] Form fields have associated labels
   - [ ] Buttons have descriptive text or aria-labels
   - [ ] Error messages are announced

4. **Focus Management**:
   - [ ] Focus is managed in dialogs
   - [ ] Focus returns to trigger after dialog close
   - [ ] Focus is set on error fields
   - [ ] Focus indicators use ring-ring

### Dark Mode Testing

**Dark Mode Verification**:
1. **Color Variables**:
   - [ ] All colors use CSS variables
   - [ ] Dark mode overrides are correct
   - [ ] Contrast is maintained in dark mode
   - [ ] Badge variants work in dark mode

2. **Visual Consistency**:
   - [ ] Shadows are visible in dark mode
   - [ ] Borders are visible in dark mode
   - [ ] Hover states work in dark mode
   - [ ] Focus states work in dark mode

### Responsive Testing

**Desktop-First Verification** (this app is desktop-focused):
1. **Layout**:
   - [ ] Components scale appropriately
   - [ ] No horizontal scrolling
   - [ ] Spacing is consistent
   - [ ] Typography is readable

2. **Interactive Elements**:
   - [ ] Buttons are appropriately sized
   - [ ] Hover states work correctly
   - [ ] Click targets are adequate
   - [ ] Tooltips display correctly

### Component Testing

**Unit Testing Focus**:
- Badge component renders correct variants
- StatusBadge displays correct labels
- PriorityBadge displays correct labels
- Form validation displays errors correctly
- Loading states render correctly

**Integration Testing Focus**:
- Page components render without errors
- Data tables display data correctly
- Forms submit correctly
- Dialogs open and close correctly
- Navigation works correctly

### Property-Based Testing

Property-based testing is not applicable for this refactoring as we are primarily concerned with visual consistency and adherence to design patterns rather than algorithmic correctness. The testing strategy focuses on:
- Visual regression testing (manual review)
- Accessibility compliance (automated + manual)
- Component rendering (unit tests)
- User interaction flows (integration tests)


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several patterns emerged that allow us to consolidate testing:

**Redundancy Analysis**:
1. **Typography checks** (2.1-2.6) can be verified through examples of each type, but the "no arbitrary sizes" (2.7) is a universal property
2. **Icon sizing checks** (3.1-3.3) can be verified through examples, but "no arbitrary sizes" (3.4) is a universal property
3. **Spacing checks** (4.2-4.5) can be verified through examples, but "remove compact utilities" (4.1) is a universal property
4. **Badge checks** (6.1-6.2, 6.4-6.5) can be verified through examples, but "no inline colors" (6.3) is a universal property
5. **Color checks** (7.1, 7.3-7.5) can be verified through examples, but "no hardcoded colors" (7.2) is a universal property
6. **Component structure checks** (5.1-5.5) are all examples of proper usage
7. **Polish checks** (8.1-8.5) are all examples of proper styling
8. **Accessibility checks** (9.1-9.4) are examples, but "color contrast" (9.2) is a universal property
9. **Maintainability checks** (10.1, 10.3-10.4) are examples of code quality

**Properties vs Examples**:
- **Properties**: Universal rules that apply to all instances (no arbitrary sizes, no hardcoded colors, color contrast ratios)
- **Examples**: Specific instances that demonstrate correct usage (Card uses p-6, Button uses h-9, etc.)

### Universal Properties

These properties must hold across the entire codebase:

**Property 1: No Arbitrary Typography Sizes**

*For any* text element in the codebase, it should not use arbitrary Tailwind font size classes (e.g., `text-[10px]`, `text-[9px]`, `text-[13px]`). All text should use standard Tailwind size classes (`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, etc.).

**Validates: Requirements 2.7**

**Property 2: No Arbitrary Icon Sizes**

*For any* icon component in the codebase, it should not use arbitrary size props or classes (e.g., `size={10}`, `size={13}`, `size={14}`, `className="w-[13px] h-[13px]"`). All icons should use standard size classes (`w-4 h-4`, `w-5 h-5`, `w-6 h-6`, `w-8 h-8`).

**Validates: Requirements 3.4**

**Property 3: No Custom Compact Utilities**

*For any* component in the codebase, it should not use custom compact utility classes (`p-compact`, `gap-compact`, `space-y-compact`, `space-x-compact`, `px-compact`, `py-compact`). All spacing should use standard Tailwind classes.

**Validates: Requirements 4.1**

**Property 4: No Inline Badge Color Classes**

*For any* badge or status indicator in the codebase, it should not use inline color class combinations (e.g., `bg-emerald-50 text-emerald-700 border-emerald-200`). All badges should use the Badge component with semantic variants.

**Validates: Requirements 6.3**

**Property 5: No Hardcoded Color Values**

*For any* component in the codebase, it should not use hardcoded Tailwind color classes (e.g., `bg-purple-600`, `text-blue-700`, `border-gray-300`). All colors should use CSS variable-based semantic tokens (`bg-primary`, `text-muted-foreground`, `border-border`) or status-specific classes for badges.

**Validates: Requirements 7.2**

**Property 6: Color Contrast Compliance**

*For any* text element on a background, the color contrast ratio should meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text). This ensures readability and accessibility across all color combinations.

**Validates: Requirements 9.2**

### Example-Based Verification

These criteria are verified through specific examples of correct usage:

**Component Styling Examples**:
- Card components use `p-6` for CardContent (Requirement 1.1)
- Button components use default sizes: `h-9` (default), `h-8` (sm), `h-10` (lg) (Requirement 1.2)
- Input components use `h-9` (Requirement 1.3)
- Components use `rounded-lg` for border radius (Requirement 1.4)
- Cards use `shadow-sm` for elevation (Requirement 1.5)

**Typography Examples**:
- Page titles use `text-2xl font-bold` (Requirement 2.1)
- Section headers use `text-lg font-semibold` (Requirement 2.2)
- Card titles use CardTitle component with `text-2xl` default (Requirement 2.3)
- Body text uses `text-sm` (Requirement 2.4)
- Secondary text uses `text-sm text-muted-foreground` (Requirement 2.5)
- Captions use `text-xs` (Requirement 2.6)

**Icon Sizing Examples**:
- Standard icons use `w-5 h-5` (Requirement 3.1)
- Small inline icons use `w-4 h-4` (Requirement 3.2)
- Large header icons use `w-6 h-6` (Requirement 3.3)
- Button icons use automatic sizing via `[&_svg]:size-4` (Requirement 3.5)

**Spacing Examples**:
- Standard Tailwind spacing used throughout (Requirement 4.2)
- Card padding uses `p-6` (Requirement 4.3)
- Section spacing uses `space-y-6` or `gap-6` (Requirement 4.4)
- Form field spacing uses `space-y-4` (Requirement 4.5)

**Semantic Component Structure Examples**:
- Cards use CardHeader + CardTitle + CardDescription (Requirement 5.1)
- CardContent wraps content with `p-6` (Requirement 5.2)
- Dialogs use DialogHeader + DialogTitle + DialogDescription (Requirement 5.3)
- Forms use FormField + FormItem + FormLabel + FormControl (Requirement 5.4)
- Tables use Table + TableHeader + TableBody + TableRow + TableCell (Requirement 5.5)

**Badge Usage Examples**:
- Status badges use StatusBadge component (Requirement 6.1)
- Priority badges use PriorityBadge component (Requirement 6.2)
- Badge variants defined in badge.tsx (Requirement 6.4)
- Consistent badge styling across pages (Requirement 6.5)

**Color Token Examples**:
- Colors use CSS variables (Requirement 7.1)
- Semantic color usage (Requirement 7.3)
- Theme customization via CSS variables in App.css (Requirement 7.4)
- Dark mode via CSS variable overrides (Requirement 7.5)

**Polish Examples**:
- Subtle shadows with `shadow-sm` (Requirement 8.1)
- Smooth transitions on interactive elements (Requirement 8.2)
- Focus states with `ring-1 ring-ring/30` (Requirement 8.3)
- Hover states with `bg-accent` (Requirement 8.4)
- Consistent border radius (Requirement 8.5)

**Accessibility Examples**:
- Interactive elements have focus states (Requirement 9.1)
- Form fields have associated labels (Requirement 9.3)
- Buttons have descriptive text or aria-labels (Requirement 9.4)

**Maintainability Examples**:
- Minimal className overrides (Requirement 10.1)
- Consistent code style (Requirement 10.3)
- Clear separation of custom and shadcn/ui components (Requirement 10.4)

### Testing Approach

**Dual Testing Strategy**:

1. **Property-Based Tests** (for universal properties):
   - Scan codebase for arbitrary font sizes
   - Scan codebase for arbitrary icon sizes
   - Scan codebase for custom compact utilities
   - Scan codebase for inline badge color classes
   - Scan codebase for hardcoded color values
   - Calculate color contrast ratios for all text/background combinations

2. **Example-Based Tests** (for specific patterns):
   - Visual regression testing for component styling
   - Component structure verification
   - Accessibility testing (manual + automated)
   - Dark mode verification

**Property Test Implementation**:

Each universal property can be implemented as a codebase scan:

```typescript
// Example: Property 1 - No Arbitrary Typography Sizes
describe('Typography Compliance', () => {
  it('should not use arbitrary font sizes', () => {
    const files = getAllSourceFiles();
    const arbitrarySizePattern = /text-\[\d+px\]/g;
    
    files.forEach(file => {
      const content = readFileSync(file, 'utf-8');
      const matches = content.match(arbitrarySizePattern);
      
      expect(matches).toBeNull();
    });
  });
});

// Example: Property 5 - No Hardcoded Color Values
describe('Color Token Compliance', () => {
  it('should not use hardcoded Tailwind color classes', () => {
    const files = getAllSourceFiles();
    // Pattern matches bg-{color}-{number}, text-{color}-{number}, etc.
    // Excludes status colors for badges (emerald, amber, rose, blue, orange, gray)
    const hardcodedColorPattern = /(bg|text|border)-(purple|indigo|pink|cyan|teal|lime|green|yellow|red|slate|zinc|neutral|stone)-\d+/g;
    
    files.forEach(file => {
      const content = readFileSync(file, 'utf-8');
      const matches = content.match(hardcodedColorPattern);
      
      if (matches) {
        console.log(`Found hardcoded colors in ${file}:`, matches);
      }
      
      expect(matches).toBeNull();
    });
  });
});

// Example: Property 6 - Color Contrast Compliance
describe('Accessibility Compliance', () => {
  it('should meet WCAG AA color contrast standards', () => {
    const colorCombinations = extractColorCombinations();
    
    colorCombinations.forEach(({ foreground, background, context }) => {
      const contrastRatio = calculateContrastRatio(foreground, background);
      const isLargeText = context.includes('text-lg') || context.includes('text-xl');
      const minimumRatio = isLargeText ? 3 : 4.5;
      
      expect(contrastRatio).toBeGreaterThanOrEqual(minimumRatio);
    });
  });
});
```

**Example-Based Test Implementation**:

Example-based tests verify specific component instances:

```typescript
// Example: Card Component Structure
describe('Card Component Compliance', () => {
  it('should use CardHeader + CardTitle structure', () => {
    render(<WorkOrderCard {...mockProps} />);
    
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByRole('heading').closest('[class*="CardHeader"]')).toBeInTheDocument();
  });
  
  it('should use p-6 padding for CardContent', () => {
    const { container } = render(<WorkOrderCard {...mockProps} />);
    const cardContent = container.querySelector('[class*="CardContent"]');
    
    expect(cardContent).toHaveClass('p-6');
  });
});

// Example: Badge Component Usage
describe('Badge Component Compliance', () => {
  it('should use StatusBadge for work order status', () => {
    render(<WorkOrderRow status="in-progress" />);
    
    const badge = screen.getByText('In Progress');
    expect(badge).toHaveClass('border-amber-200', 'bg-amber-50', 'text-amber-700');
  });
  
  it('should use PriorityBadge for priority indicators', () => {
    render(<WorkOrderRow priority="critical" />);
    
    const badge = screen.getByText('Critical');
    expect(badge).toHaveClass('border-rose-200', 'bg-rose-50', 'text-rose-700', 'font-bold');
  });
});
```

### Manual Testing Checklist

For each refactored component:

1. **Visual Verification**:
   - [ ] Typography matches design system
   - [ ] Icons are consistently sized
   - [ ] Spacing feels comfortable
   - [ ] Colors use semantic tokens
   - [ ] Badges use proper variants

2. **Accessibility Verification**:
   - [ ] Keyboard navigation works
   - [ ] Focus states are visible
   - [ ] Screen reader announces correctly
   - [ ] Color contrast is sufficient

3. **Dark Mode Verification**:
   - [ ] All colors work in dark mode
   - [ ] Contrast is maintained
   - [ ] Shadows are visible
   - [ ] Borders are visible

4. **Responsive Verification**:
   - [ ] Layout scales appropriately
   - [ ] No horizontal scrolling
   - [ ] Touch targets are adequate (desktop-first, but verify)

### Continuous Compliance

**Linting Rules**:

Add ESLint rules to prevent regressions:

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // Prevent arbitrary Tailwind values
    'tailwindcss/no-arbitrary-value': 'error',
    
    // Enforce consistent spacing
    'tailwindcss/enforces-shorthand': 'error',
    
    // Prevent deprecated classes
    'tailwindcss/no-custom-classname': ['warn', {
      'whitelist': ['no-scrollbar'] // Allow specific custom classes
    }],
  },
};
```

**Pre-commit Hooks**:

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run property-based compliance checks
npm run test:compliance

# Run linting
npm run lint

# Run type checking
npm run type-check
```

**CI/CD Integration**:

```yaml
# .github/workflows/compliance.yml
name: Design System Compliance

on: [push, pull_request]

jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Run compliance tests
        run: npm run test:compliance
      - name: Run accessibility tests
        run: npm run test:a11y
      - name: Check color contrast
        run: npm run test:contrast
```

