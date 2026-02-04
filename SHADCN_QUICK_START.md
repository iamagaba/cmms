# shadcn/ui Migration - Quick Start Guide

## Immediate Actions (Today)

### 1. Install Core Components (15 minutes)

Run these commands to install the essential shadcn components:

```bash
# Core form components
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add textarea
npx shadcn@latest add select

# Layout components
npx shadcn@latest add card
npx shadcn@latest add separator

# Feedback components
npx shadcn@latest add badge
npx shadcn@latest add alert
npx shadcn@latest add toast
npx shadcn@latest add skeleton

# Interactive components
npx shadcn@latest add dropdown-menu
npx shadcn@latest add popover
npx shadcn@latest add tooltip
npx shadcn@latest add tabs

# Data display
npx shadcn@latest add table

# Form components
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add switch
```

### 2. Extend Button Component (30 minutes)

Update the existing `src/components/ui/button.tsx` to match your design system:

```tsx
// src/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useDensity } from "@/context/DensityContext"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-purple-600 text-white hover:bg-purple-700 shadow-sm hover:shadow-md",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        outline: "border border-purple-500 bg-transparent text-purple-600 hover:bg-purple-50",
        secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
        link: "text-purple-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      density: {
        compact: "h-8 px-2 text-xs gap-1",
        comfortable: "h-10 px-4 text-sm gap-2",
        spacious: "h-12 px-6 text-base gap-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, density, asChild = false, loading, children, disabled, ...props }, ref) => {
    const { density: contextDensity } = useDensity()
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ 
          variant, 
          size: density || contextDensity ? undefined : size,
          density: density || contextDensity,
          className 
        }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### 3. Create Custom Badge Variants (20 minutes)

Extend the badge component with your status variants:

```tsx
// src/components/ui/badge.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Work Order Status variants
        new: "border-transparent bg-blue-100 text-blue-800",
        "in-progress": "border-transparent bg-amber-100 text-amber-800",
        "on-hold": "border-transparent bg-orange-100 text-orange-800",
        completed: "border-transparent bg-green-100 text-green-800",
        cancelled: "border-transparent bg-gray-100 text-gray-800",
        scheduled: "border-transparent bg-purple-100 text-purple-800",
        // Priority variants
        critical: "border-transparent bg-red-100 text-red-800",
        high: "border-transparent bg-orange-100 text-orange-800",
        medium: "border-transparent bg-yellow-100 text-yellow-800",
        low: "border-transparent bg-blue-100 text-blue-800",
        routine: "border-transparent bg-gray-100 text-gray-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```

### 4. Create Status Badge Helpers (15 minutes)

Create helper components for common badge patterns:

```tsx
// src/components/ui/status-badges.tsx
import { Badge } from './badge';

export function WorkOrderStatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { variant: any; label: string }> = {
    'New': { variant: 'new', label: 'New' },
    'In Progress': { variant: 'in-progress', label: 'In Progress' },
    'On Hold': { variant: 'on-hold', label: 'On Hold' },
    'Completed': { variant: 'completed', label: 'Completed' },
    'Cancelled': { variant: 'cancelled', label: 'Cancelled' },
    'Scheduled': { variant: 'scheduled', label: 'Scheduled' },
  };

  const config = statusMap[status] || { variant: 'default', label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const priorityMap: Record<string, { variant: any; label: string }> = {
    'Critical': { variant: 'critical', label: 'Critical' },
    'High': { variant: 'high', label: 'High' },
    'Medium': { variant: 'medium', label: 'Medium' },
    'Low': { variant: 'low', label: 'Low' },
    'Routine': { variant: 'routine', label: 'Routine' },
  };

  const config = priorityMap[priority] || { variant: 'default', label: priority };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
```

### 5. Test Migration with One Component (30 minutes)

Pick a simple page to test the migration. Let's start with a button-heavy page:

```tsx
// Example: Update src/pages/Reports.tsx (partial)

// OLD
import ProfessionalButton from '@/components/ui/ProfessionalButton';

<ProfessionalButton variant="primary" size="sm">
  Export PDF
</ProfessionalButton>

// NEW
import { Button } from '@/components/ui/button';

<Button variant="default" size="sm">
  Export PDF
</Button>
```

## Pilot Migration: Reports Page

Let's migrate the Reports page as a pilot to test the approach:

### Step 1: Update Imports
```tsx
// Replace
import { Button as ShadcnButton } from '@/components/ui/button';

// With
import { Button } from '@/components/ui/button';
```

### Step 2: Update Button Usage
```tsx
// OLD
<ShadcnButton variant="outline" size="sm">
  <HugeiconsIcon icon={FileIcon} size={14} />
  Export PDF (Pilot)
</ShadcnButton>

// NEW (shadcn uses children for icons)
<Button variant="outline" size="sm">
  <HugeiconsIcon icon={FileIcon} size={14} />
  Export PDF
</Button>
```

## Verification Checklist

After installing components, verify:

- [ ] All shadcn components installed successfully
- [ ] Button component extended with custom variants
- [ ] Badge component has status variants
- [ ] Status badge helpers created
- [ ] Test page updated and working
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Styles match design system

## Common Issues & Solutions

### Issue: Import errors after installation
**Solution:** Restart the dev server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Issue: Styles not applying
**Solution:** Check that `components.json` is configured correctly and Tailwind is processing the new files

### Issue: Type errors with variants
**Solution:** Make sure you're using the correct variant names from the extended component

## Next Steps After Quick Start

1. **Review the full migration plan** in `SHADCN_MIGRATION_PLAN.md`
2. **Create a feature branch** for migration work
3. **Migrate one page completely** as a proof of concept
4. **Get team feedback** on the approach
5. **Plan the full rollout** based on learnings

## Useful Commands

```bash
# List all available shadcn components
npx shadcn@latest add

# Update a component
npx shadcn@latest add button --overwrite

# Check TypeScript errors
npm run type-check

# Run tests
npm run test

# Build to verify no issues
npm run build
```

## Resources

- Full migration plan: `SHADCN_MIGRATION_PLAN.md`
- shadcn/ui docs: https://ui.shadcn.com
- Component examples: https://ui.shadcn.com/examples

---

**Estimated Time:** 2 hours for quick start  
**Status:** Ready to begin
