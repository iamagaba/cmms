# 🎨 Design System Guide

## Overview and Philosophy

This design system is built on **shadcn/ui** components with **semantic tokens** and **consistent patterns**. The philosophy is simple: **trust the defaults** and create a cohesive, professional experience.

### Core Principles

1. **Consistency First**: Every interface should feel like it comes from the same system
2. **Semantic Tokens**: Use meaningful color and spacing tokens, not hardcoded values
3. **Accessibility by Default**: WCAG 2.1 AA compliance throughout
4. **Developer Experience**: Clear patterns that reduce decision-making overhead
5. **Performance Optimized**: Efficient CSS and optimal bundle size

---

## 🎨 Color System

### Semantic Tokens (Primary System)

```tsx
// ✅ ALWAYS USE THESE
bg-background          // Main page background
bg-card               // Card and panel backgrounds
bg-muted              // Subtle backgrounds, disabled states
bg-accent             // Hover states, selected items
bg-primary            // Brand color, primary actions
bg-secondary          // Secondary actions
bg-destructive        // Error states, delete actions

// Text Colors
text-foreground       // Primary text
text-muted-foreground // Secondary text, labels
text-primary          // Brand-colored text
text-destructive      // Error text

// Borders
border-border         // Standard borders
border-input          // Form input borders
border-primary        // Brand-colored borders
```

### Status Colors

```tsx
// Success (Green family)
bg-emerald-50 text-emerald-700    // Light success background
text-emerald-600                  // Success text

// Warning (Amber family)  
bg-amber-50 text-amber-700        // Light warning background
text-amber-600                    // Warning text

// Error (Red family)
bg-destructive/10 text-destructive // Light error background
text-destructive                   // Error text

// Info (Blue family)
bg-primary/10 text-primary        // Light info background
text-primary                      // Info text
```

### Forbidden Patterns

```tsx
// ❌ NEVER USE THESE
bg-white              // Use bg-card or bg-background
text-gray-600         // Use text-muted-foreground
bg-gray-100           // Use bg-muted
border-gray-200       // Use border-border
bg-blue-500           // Use bg-primary
```

---

## 📝 Typography Scale

### Hierarchy (shadcn/ui Defaults)

```tsx
// Page Titles
text-2xl font-bold              // 24px - Main page titles (CardTitle default)

// Section Headers
text-lg font-semibold           // 18px - Major section headers

// Subsection Headers  
text-base font-medium           // 16px - Subsection titles

// Body Text / Primary Labels
text-sm                         // 14px - Standard readable text

// Secondary Labels / Metadata
text-sm text-muted-foreground   // 14px - Secondary information

// Captions / Small Text
text-xs                         // 12px - Fine print, timestamps
text-xs text-muted-foreground   // 12px - Subtle metadata
```

### Usage Examples

```tsx
// ✅ Page Header
<CardTitle>Work Orders</CardTitle>                    // text-2xl default

// ✅ Section Header
<h2 className="text-lg font-semibold">Recent Activity</h2>

// ✅ Body Text
<p className="text-sm">This is the main content text.</p>

// ✅ Secondary Information
<p className="text-sm text-muted-foreground">Last updated 2 hours ago</p>

// ✅ Metadata
<span className="text-xs text-muted-foreground">Created by John Doe</span>
```

---

## 📏 Spacing System

### Canonical Patterns

```tsx
// Major Section Separation (24px)
className="space-y-6"           // Between major page sections
className="p-6"                 // Major container padding (CardContent default)
className="gap-6"               // Large grid gaps

// Standard Section Spacing (16px)
className="space-y-4"           // Between related sections
className="p-4"                 // Standard container padding  
className="gap-4"               // Standard grid gaps

// Form Field Spacing (16px)
className="space-y-4"           // Between form fields

// Tight Grouping (8px)
className="gap-2"               // Button groups, related items
className="space-y-2"           // Tight vertical spacing

// Very Tight Grouping (6px)
className="gap-1.5"             // Icon + text, inline elements
```

### Usage Examples

```tsx
// ✅ Page Layout
<div className="space-y-6">                    // Major sections
  <PageHeader title="Assets" />
  <Card>
    <CardContent className="space-y-4">        // Standard sections
      <div className="grid grid-cols-2 gap-4"> // Standard grid
        {/* Content */}
      </div>
    </CardContent>
  </Card>
</div>

// ✅ Form Layout
<form className="space-y-4">                   // Form fields
  <div className="grid grid-cols-2 gap-4">     // Form grid
    <FormField />
    <FormField />
  </div>
</form>

// ✅ Button Group
<div className="flex items-center gap-2">      // Button spacing
  <Button>Save</Button>
  <Button variant="outline">Cancel</Button>
</div>
```

---

## 🔧 Component Library

### Core shadcn/ui Components

#### Cards (Primary Container)

```tsx
// ✅ Standard Card Pattern
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>                // text-2xl default
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>                                 // p-6 default
    <p className="text-sm">Content goes here</p>
  </CardContent>
</Card>

// ✅ Compact Card
<Card>
  <CardContent className="p-4">                // Tighter padding
    <h3 className="text-base font-medium mb-2">Title</h3>
    <p className="text-sm text-muted-foreground">Content</p>
  </CardContent>
</Card>
```

#### Buttons (Actions)

```tsx
// ✅ Button Variants
<Button variant="default">Primary Action</Button>      // Solid primary
<Button variant="outline">Secondary Action</Button>    // Outlined
<Button variant="ghost">Tertiary Action</Button>       // Minimal
<Button variant="destructive">Delete</Button>          // Danger action

// ✅ Button Sizes
<Button size="sm">Small</Button>                       // Compact
<Button size="default">Default</Button>                // Standard
<Button size="lg">Large</Button>                       // Prominent

// ✅ Icon Buttons
<Button variant="outline" size="sm">
  <Plus className="w-4 h-4 mr-2" />
  Add Item
</Button>
```

#### Badges (Status Indicators)

```tsx
// ✅ Status Badges
<Badge variant="default">Active</Badge>                // Default state
<Badge variant="secondary">Pending</Badge>             // Secondary state
<Badge variant="outline">Draft</Badge>                 // Outlined
<Badge variant="destructive">Error</Badge>             // Error state

// ✅ Custom Status Badges (when needed)
<Badge variant="success">Completed</Badge>             // Success (custom)
<Badge variant="warning">In Progress</Badge>           // Warning (custom)
```

#### Forms (Data Input)

```tsx
// ✅ Form Pattern with shadcn/ui
<Form>
  <FormField
    control={form.control}
    name="fieldName"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Field Label</FormLabel>
        <FormControl>
          <Input placeholder="Enter value..." {...field} />
        </FormControl>
        <FormDescription>
          Optional help text goes here.
        </FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>

// ✅ Select Fields
<Select onValueChange={handleChange}>
  <SelectTrigger>
    <SelectValue placeholder="Choose option..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Custom Layout Components

#### PageHeader (Consistent Page Titles)

```tsx
// ✅ Standard Page Header
<PageHeader 
  title="Work Orders"
  subtitle="Manage and track maintenance requests"
  actions={
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Create Work Order
    </Button>
  }
/>

// ✅ With Icon
<PageHeader 
  title="Assets"
  icon={<Package className="w-5 h-5" />}
  actions={<Button variant="outline">Export</Button>}
/>
```

#### MasterListShell (List Views)

```tsx
// ✅ Master-Detail Pattern
<MasterListShell
  title="Work Orders"
  searchValue={searchQuery}
  onSearchChange={setSearchQuery}
  searchPlaceholder="Search work orders..."
  onCreateNew={() => setShowCreateDialog(true)}
  createButtonText="Create Work Order"
>
  {workOrders.map(order => (
    <MasterListRow
      key={order.id}
      title={order.title}
      subtitle={order.asset_name}
      badge={{ text: order.status, variant: getStatusVariant(order.status) }}
      icon={<Wrench className="w-4 h-4" />}
      isSelected={selectedOrder?.id === order.id}
      onClick={() => setSelectedOrder(order)}
    />
  ))}
</MasterListShell>
```

#### EmptyState (No Data)

```tsx
// ✅ Empty State Pattern
<EmptyState
  icon={<Package className="w-6 h-6 text-muted-foreground" />}
  title="No assets found"
  description="Get started by adding your first asset to the system."
  action={
    <Button onClick={() => setShowCreateDialog(true)}>
      <Plus className="w-4 h-4 mr-2" />
      Add Asset
    </Button>
  }
/>
```

---

## 🎯 Icon System

### Sizing Standards

```tsx
// ✅ Standard Icon Sizes (Tailwind Classes)
className="w-4 h-4"             // 16px - Small icons, inline with text
className="w-5 h-5"             // 20px - Standard icons, most common
className="w-6 h-6"             // 24px - Large icons, headers, empty states

// ✅ Usage Examples
<Button variant="outline">
  <Plus className="w-4 h-4 mr-2" />    // Small icon in button
  Add Item
</Button>

<CardTitle className="flex items-center gap-2">
  <Package className="w-5 h-5" />      // Standard icon in title
  Assets
</CardTitle>

<EmptyState
  icon={<Package className="w-6 h-6" />} // Large icon in empty state
  title="No data"
/>
```

### Icon Library (Lucide React)

```tsx
// ✅ Import from lucide-react
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Package,
  Wrench,
  User,
  Settings
} from 'lucide-react';

// ✅ Consistent Usage
<Plus className="w-4 h-4" />           // Always use Tailwind classes
<Edit className="w-5 h-5 text-muted-foreground" /> // With semantic colors
```

### Forbidden Patterns

```tsx
// ❌ NEVER USE THESE
<Icon size={16} />                      // Use className="w-4 h-4"
<Icon className="w-3 h-3" />           // Use w-4 h-4 minimum
<Icon style={{ width: 20 }} />         // Use Tailwind classes
```

---

## 🎭 Interactive States

### Hover States

```tsx
// ✅ Standard Hover Patterns
className="hover:bg-accent"             // Subtle background change
className="hover:bg-primary/90"         // Primary button hover
className="hover:text-foreground"       // Text color change
className="hover:shadow-md"             // Elevation change

// ✅ Button Hover (built into shadcn/ui)
<Button variant="outline">              // Automatic hover states
  Action
</Button>
```

### Focus States

```tsx
// ✅ Focus Indicators (automatic with shadcn/ui)
className="focus:ring-2 focus:ring-primary focus:ring-offset-2"

// ✅ Focus-visible for keyboard navigation
className="focus-visible:ring-2 focus-visible:ring-primary"
```

### Active/Selected States

```tsx
// ✅ Selected Item Pattern
<div className={cn(
  "p-3 border-b border-border hover:bg-accent transition-colors",
  isSelected && "bg-accent border-primary/20"
)}>
  {/* Content */}
</div>

// ✅ Active Navigation Item
<Button 
  variant={isActive ? "secondary" : "ghost"}
  className={cn(isActive && "bg-accent")}
>
  Navigation Item
</Button>
```

---

## 📱 Responsive Patterns

### Breakpoint Usage

```tsx
// ✅ Mobile-First Responsive
className="flex flex-col sm:flex-row"           // Stack on mobile, row on desktop
className="grid grid-cols-1 md:grid-cols-2"    // Single column mobile, two on tablet+
className="text-sm sm:text-base"               // Smaller text on mobile
className="p-4 sm:p-6"                         // Less padding on mobile
```

### Container Patterns

```tsx
// ✅ Responsive Container
<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>

// ✅ Responsive Grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Grid items */}
</div>
```

---

## ✅ Best Practices

### Do's ✅

1. **Use shadcn/ui components** with their default styling
2. **Trust the defaults** - components are designed to look great
3. **Use semantic tokens** for colors (`bg-card`, `text-muted-foreground`)
4. **Follow spacing patterns** (`space-y-4`, `gap-4`, `p-6`)
5. **Use Tailwind icon classes** (`w-4 h-4`, `w-5 h-5`)
6. **Maintain consistent hierarchy** with typography scale
7. **Test accessibility** with keyboard navigation and screen readers

### Don'ts ❌

1. **Don't use hardcoded colors** (`bg-white`, `text-gray-600`)
2. **Don't override shadcn/ui defaults** unless necessary
3. **Don't use random spacing** (`gap-3`, `space-y-5`)
4. **Don't use legacy icon sizing** (`size={16}`)
5. **Don't create custom card shells** (use `Card` component)
6. **Don't duplicate badge patterns** (use `Badge` variants)
7. **Don't ignore responsive design** (always mobile-first)

---

## 🔧 Implementation Checklist

### New Component Checklist

- [ ] Uses shadcn/ui components where possible
- [ ] Uses semantic color tokens (no hardcoded colors)
- [ ] Uses canonical spacing patterns
- [ ] Uses Tailwind icon sizing classes
- [ ] Follows typography hierarchy
- [ ] Includes proper hover/focus states
- [ ] Is responsive (mobile-first)
- [ ] Meets accessibility standards
- [ ] Has consistent error handling
- [ ] Includes proper TypeScript types

### Code Review Checklist

- [ ] No hardcoded colors (`bg-white`, `text-gray-600`)
- [ ] No legacy icon sizing (`size={16}`)
- [ ] No custom card shells (uses `Card` component)
- [ ] No random spacing values (`gap-3`, `space-y-5`)
- [ ] Proper semantic token usage
- [ ] Consistent with existing patterns
- [ ] Accessible keyboard navigation
- [ ] Responsive design implemented
- [ ] TypeScript compliance
- [ ] No console errors or warnings

---

## 🚀 Getting Started

### Quick Start

1. **Import shadcn/ui components**:
   ```tsx
   import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
   import { Button } from '@/components/ui/button';
   import { Badge } from '@/components/ui/badge';
   ```

2. **Use semantic tokens**:
   ```tsx
   <div className="bg-card text-foreground border-border">
   ```

3. **Follow spacing patterns**:
   ```tsx
   <div className="space-y-4 p-6">
   ```

4. **Use standard icon sizing**:
   ```tsx
   <Plus className="w-4 h-4" />
   ```

### Common Patterns

```tsx
// ✅ Standard Page Layout
<div className="space-y-6">
  <PageHeader title="Page Title" />
  <Card>
    <CardContent className="space-y-4">
      {/* Content */}
    </CardContent>
  </Card>
</div>

// ✅ Form Layout
<Card>
  <CardHeader>
    <CardTitle>Form Title</CardTitle>
  </CardHeader>
  <CardContent>
    <form className="space-y-4">
      {/* Form fields */}
    </form>
  </CardContent>
</Card>

// ✅ Data Display
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Package className="w-5 h-5" />
      Data Title
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Data items */}
    </div>
  </CardContent>
</Card>
```

---

## 📚 Resources

### Documentation Links
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)

### Internal References
- `COMPONENT_REFERENCE.md` - Detailed component usage
- `DEVELOPER_GUIDELINES.md` - Development standards
- `src/components/ui/` - shadcn/ui component implementations
- `src/components/layout/` - Custom layout components

---

**Last Updated**: January 28, 2026  
**Version**: 1.0.0  
**Status**: Complete and Ready for Production