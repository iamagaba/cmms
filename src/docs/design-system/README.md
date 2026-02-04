# Professional CMMS Design System V2 Documentation

## Overview

The Professional CMMS Design System V2 is built on **shadcn/ui** with a **Nova-inspired compact style**, providing a modern, content-dense interface optimized for maintenance management operations. This design system uses semantic color tokens, consistent typography, and efficient spacing to create a professional, accessible user experience.

## Design Philosophy

### shadcn/ui Foundation
This design system is built on shadcn/ui components, which provide:
- **Radix UI primitives** for accessibility
- **Tailwind CSS** for styling
- **CSS variables** for theming
- **Hugeicons** for iconography

### Nova-Inspired Compact Style
We use a **Nova-inspired approach** with reduced padding and margins for content-dense layouts:
- **Compact spacing**: Efficient use of screen space
- **Consistent sizing**: Predictable component dimensions
- **Modern aesthetics**: Clean, professional appearance
- **Content-first**: Maximizes information density

## Quick Start

### Using shadcn/ui Components

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Use shadcn/ui defaults - they're designed to look great
const MyComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle>Work Orders</CardTitle>
    </CardHeader>
    <CardContent>
      <Button variant="default">Create Order</Button>
    </CardContent>
  </Card>
);
```

### Key Principle: Trust the Defaults
shadcn/ui components are designed with excellent defaults. Only customize when you have specific design requirements.

## Architecture

### Design Token System

The design system uses **CSS variables** for theming, following shadcn/ui's semantic token approach:

```css
:root {
  /* Semantic color tokens */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 262.1 83.3% 57.8%;
  --primary-foreground: 210 40% 98%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
  --accent: 210 40% 96.1%;
  
  /* Spacing and sizing */
  --radius: 0.5rem; /* 8px - medium radius */
}
```

### Component Architecture

```
shadcn/ui Components → Semantic Tokens → CSS Variables → Theme
```

1. **shadcn/ui Components**: Pre-built, accessible components from `@/components/ui/*`
2. **Semantic Tokens**: Contextual color names (primary, muted, border, etc.)
3. **CSS Variables**: Theme-specific values in HSL format
4. **Theme System**: Light/dark mode support through CSS variable switching

## shadcn/ui Default Spacing

### Spacing Philosophy

We **trust shadcn/ui defaults** for optimal spacing and visual hierarchy:

| Component | shadcn/ui Default | Usage |
|-----------|-------------------|-------|
| **Buttons** | `h-9 px-4 py-2` (default), `h-8` (sm), `h-10` (lg) | Use default sizes |
| **Cards** | `p-6` (CardContent), `p-4` (CardHeader) | Comfortable spacing |
| **Gaps** | `gap-4` (16px standard), `gap-6` (24px spacious) | Context-dependent |
| **Icon Sizes** | `w-4 h-4` (16px), `w-5 h-5` (20px), `w-6 h-6` (24px) | Standard sizes |

### When to Customize Spacing

✅ **Use shadcn/ui defaults for:**
- All standard interfaces (recommended)
- Forms and dialogs
- Cards and content areas
- Navigation elements

⚠️ **Only customize when:**
- You have specific design requirements
- Building specialized data-dense interfaces
- Creating custom component variants
- Matching existing brand guidelines

## Design Tokens

### Semantic Color System

The design system uses **semantic color tokens** that adapt to light/dark themes:

#### Primary Colors
- `bg-primary` / `text-primary` - Brand color for primary actions
- `bg-primary-foreground` / `text-primary-foreground` - Text on primary backgrounds

#### Neutral Colors
- `bg-background` / `text-foreground` - Page background and primary text
- `bg-card` / `text-card-foreground` - Card backgrounds
- `bg-muted` / `text-muted-foreground` - Subtle backgrounds and secondary text
- `bg-accent` / `text-accent-foreground` - Hover states and highlights

#### Semantic States
- `bg-destructive` / `text-destructive` - Error states and dangerous actions
- `border` - All border colors
- `ring` - Focus ring colors

#### Status Colors (Custom)
- **Success**: `text-emerald-600`, `bg-emerald-50` - Positive states
- **Warning**: `text-amber-600`, `bg-amber-50` - Caution states
- **Error**: `text-red-600`, `bg-red-50` - Error states
- **Info**: `text-blue-600`, `bg-blue-50` - Informational states

### Typography Scale

Consistent typography optimized for readability (shadcn/ui defaults):

| Size Class | Font Size | Usage |
|------------|-----------|-------|
| `text-xs` | 12px | Captions, metadata, timestamps |
| `text-sm` | 14px | **Body text** (primary readable size) |
| `text-base` | 16px | Emphasized body text |
| `text-lg` | 18px | Section headers |
| `text-xl` | 20px | Page subtitles |
| `text-2xl` | 24px | **Page titles, CardTitle** (default) |

**Font Weights:**
- `font-normal` (400) - Body text
- `font-medium` (500) - Emphasis, labels
- `font-semibold` (600) - Section headers
- `font-bold` (700) - Page titles

**Important Guidelines:**
- ✅ Use `text-sm` (14px) for body text - readable and comfortable
- ✅ Use `text-xs` (12px) for captions and metadata only
- ✅ Use `text-2xl` for page titles (or CardTitle component)
- ❌ Never use arbitrary sizes like `text-[10px]` or `text-[13px]`

### Spacing System

Based on Tailwind's 4px grid system (shadcn/ui defaults):

| Class | Size | Usage |
|-------|------|-------|
| `p-2` | 8px | Tight padding (badges, small elements) |
| `p-4` | 16px | Standard padding (CardHeader, dialogs) |
| `p-6` | 24px | **Comfortable padding (CardContent default)** |
| `gap-2` | 8px | Tight gaps (inline elements) |
| `gap-4` | 16px | **Standard gaps (default)** |
| `gap-6` | 24px | Spacious gaps (sections) |
| `space-y-4` | 16px | **Form field spacing** |
| `space-y-6` | 24px | **Section spacing** |

**Important Guidelines:**
- ✅ Use `p-6` for CardContent (shadcn/ui default)
- ✅ Use `gap-4` for standard spacing between elements
- ✅ Use `space-y-6` for spacing between major sections
- ❌ Never use custom utilities like `p-compact` or `gap-compact`

### Icon Sizing

Consistent icon sizes for visual hierarchy (shadcn/ui standards):

| Size | Pixels | Usage |
|------|--------|-------|
| `w-4 h-4` | 16px | **Small icons** (inline with text, buttons) |
| `w-5 h-5` | 20px | **Standard icons** (card headers, default) |
| `w-6 h-6` | 24px | **Large icons** (page headers, emphasis) |
| `w-8 h-8` | 32px | Extra large icons (empty states, hero sections) |

**Important Guidelines:**
- ✅ Use `w-4 h-4` (16px) for icons in buttons and inline with text
- ✅ Use `w-5 h-5` (20px) for standard icons in card headers
- ✅ Use `w-6 h-6` (24px) for icons in page titles
- ❌ Never use arbitrary sizes like `size={10}`, `size={13}`, or `w-[14px]`

## shadcn/ui Components

All components are from shadcn/ui (`@/components/ui/*`) with Nova-inspired compact styling.

### Core Components

#### Badges
```tsx
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";

// Use semantic badge variants
<Badge variant="success">Completed</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="info">Info</Badge>

// Work order status badges
<Badge variant="open">New</Badge>
<Badge variant="in-progress">In Progress</Badge>
<Badge variant="completed">Completed</Badge>
<Badge variant="cancelled">Cancelled</Badge>

// Priority badges
<Badge variant="critical">Critical</Badge>
<Badge variant="high">High</Badge>
<Badge variant="medium">Medium</Badge>
<Badge variant="low">Low</Badge>

// Helper components for common use cases
<StatusBadge status="in-progress" />
<PriorityBadge priority="critical" />
```

**Important Guidelines:**
- ✅ Use Badge component with semantic variants
- ✅ Use StatusBadge and PriorityBadge helpers for common cases
- ❌ Never use inline color classes like `bg-emerald-50 text-emerald-700`

#### Buttons
```tsx
import { Button } from "@/components/ui/button";

// Use default sizes - they're optimized
<Button variant="default">Primary</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Tertiary</Button>
<Button variant="destructive">Delete</Button>

// Size variants
<Button size="default">Default (h-9)</Button>
<Button size="sm">Small (h-8)</Button>
<Button size="lg">Large (h-10)</Button>
<Button size="icon"><Icon className="w-4 h-4" /></Button>
```

**Variants:**
- `default` - Primary actions (filled)
- `outline` - Secondary actions (bordered)
- `ghost` - Tertiary actions (transparent)
- `destructive` - Dangerous actions (red)
- `link` - Text links

**Important Guidelines:**
- ✅ Use default button sizes (h-9, h-8, h-10)
- ✅ Icons in buttons should be `w-4 h-4` (16px)
- ❌ Never override button heights with custom values

#### Cards
```tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Use defaults - p-6 for CardContent, p-4 for CardHeader
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle> {/* text-2xl default */}
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm">Body text</p>
  </CardContent>
</Card>
```

**Important Guidelines:**
- ✅ Use CardHeader + CardTitle + CardDescription structure
- ✅ CardContent has default `p-6` padding (comfortable)
- ✅ CardTitle uses `text-2xl` by default (appropriate size)
- ❌ Don't override card padding unless absolutely necessary

#### Forms
```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

<Form>
  <FormField
    control={form.control}
    name="field"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Label</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

#### Tables
```tsx
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Header</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Cell</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Navigation Components

#### Tabs
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### Feedback Components

#### Alerts
```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components to your app using the cli.
  </AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Your session has expired. Please log in again.
  </AlertDescription>
</Alert>
```

#### Dialogs
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Complete Component List

See [shadcn/ui documentation](https://ui.shadcn.com/docs/components) for all available components:
- Accordion, Alert Dialog, Aspect Ratio, Avatar, Badge
- Breadcrumb, Button, Calendar, Card, Carousel
- Checkbox, Collapsible, Combobox, Command, Context Menu
- Data Table, Date Picker, Dialog, Drawer, Dropdown Menu
- Form, Hover Card, Input, Label, Menubar
- Navigation Menu, Pagination, Popover, Progress, Radio Group
- Scroll Area, Select, Separator, Sheet, Skeleton
- Slider, Switch, Table, Tabs, Textarea
- Toast, Toggle, Tooltip

## Accessibility

The design system meets WCAG 2.1 AA accessibility standards:

- **Color Contrast**: All color combinations meet minimum contrast ratios
- **Focus Indicators**: Clear, visible focus states for all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility support
- **Screen Readers**: Proper ARIA labels and semantic markup
- **Touch Targets**: Minimum 44px touch targets for mobile interfaces

## Responsive Design

The system includes responsive patterns for all device sizes:

- **Breakpoints**: xs (320px), sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- **Touch Targets**: Optimized sizing for mobile interactions
- **Density Options**: Compact, comfortable, and spacious layouts
- **Mobile Patterns**: Touch-friendly navigation and interactions

## Theming

### CSS Variables

The design system uses CSS variables for dynamic theming. Update these in `src/App.css`:

```css
:root {
  /* Background colors */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  
  /* Card colors */
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  
  /* Primary brand color */
  --primary: 262.1 83.3% 57.8%;
  --primary-foreground: 210 40% 98%;
  
  /* Muted backgrounds and text */
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  
  /* Accent for hover states */
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  
  /* Destructive (error) states */
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  
  /* Borders and inputs */
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 262.1 83.3% 57.8%;
  
  /* Border radius */
  --radius: 0.5rem; /* 8px */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode values */
}
```

### Customizing Colors

To change the primary color, update the `--primary` variable:

```css
:root {
  /* Purple (default) */
  --primary: 262.1 83.3% 57.8%;
  
  /* Or use blue */
  --primary: 221.2 83.2% 53.3%;
  
  /* Or use green */
  --primary: 142.1 76.2% 36.3%;
}
```

### Border Radius Options

```css
/* Sharp (0px) */
--radius: 0rem;

/* Small (6px) */
--radius: 0.375rem;

/* Medium (8px) - Default */
--radius: 0.5rem;

/* Large (12px) - Nova-inspired */
--radius: 0.75rem;
```

### Dark Mode

Dark mode is supported through CSS variable overrides:

```tsx
// Toggle dark mode
<html className="dark">
```

All semantic tokens automatically adapt to dark mode.

## Best Practices

### 1. Trust shadcn/ui Defaults
shadcn/ui components are designed with excellent defaults. Only customize when necessary:

```tsx
// ✅ Good - Use defaults
<Card>
  <CardContent>
    <CardTitle>Title</CardTitle>
  </CardContent>
</Card>

// ❌ Avoid - Unnecessary customization
<Card className="shadow-none rounded-none p-0">
  <CardContent className="p-2">
    <CardTitle className="text-base">Title</CardTitle>
  </CardContent>
</Card>
```

### 2. Use Semantic Color Tokens
Always use semantic tokens instead of hardcoded colors:

```tsx
// ✅ Good - Semantic tokens
<div className="bg-card text-foreground border-border">
<p className="text-muted-foreground">Secondary text</p>

// ❌ Avoid - Hardcoded colors
<div className="bg-white text-gray-900 border-gray-200">
<p className="text-gray-600">Secondary text</p>
```

### 3. Consistent Typography
Use the standard typography scale:

```tsx
// ✅ Good - Standard sizes
<h1 className="text-2xl font-bold">Page Title</h1>
<p className="text-sm">Body text</p>
<span className="text-xs text-muted-foreground">Metadata</span>

// ❌ Avoid - Arbitrary sizes
<h1 className="text-[28px] font-black">Page Title</h1>
<p className="text-[13px]">Body text</p>
```

### 4. Use Standard Spacing
Follow shadcn/ui spacing defaults:

```tsx
// ✅ Good - shadcn/ui defaults
<Card>
  <CardContent> {/* p-6 default */}
    <div className="space-y-4"> {/* 16px between items */}
      {/* Content */}
    </div>
  </CardContent>
</Card>

// ❌ Avoid - Custom spacing without reason
<Card className="p-3">
  <CardContent className="p-2">
    <div className="space-y-[10px]">
      {/* Content */}
    </div>
  </CardContent>
</Card>
```

### 5. Consistent Icon Sizing
Match icon sizes to context and use standard sizes:

```tsx
// ✅ Good - Standard sizes
<Button>
  <Icon className="w-4 h-4 mr-2" /> {/* 16px in buttons */}
  Action
</Button>

<CardHeader>
  <Icon className="w-5 h-5" /> {/* 20px in headers */}
  <CardTitle>Title</CardTitle>
</CardHeader>

<h1 className="text-2xl font-bold flex items-center gap-2">
  <Icon className="w-6 h-6" /> {/* 24px in page titles */}
  Page Title
</h1>

// ❌ Avoid - Arbitrary sizing
<Button>
  <Icon size={13} /> {/* Non-standard size */}
  Action
</Button>

<Icon className="w-[14px] h-[14px]" /> {/* Arbitrary size */}
```

### 6. Use Badge Variants
Always use Badge component with semantic variants:

```tsx
// ✅ Good - Badge variants
<Badge variant="success">Completed</Badge>
<Badge variant="in-progress">In Progress</Badge>
<PriorityBadge priority="critical" />

// ❌ Avoid - Inline color classes
<span className="px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
  Completed
</span>
```

### 7. Accessibility First
Always include proper accessibility attributes:

```tsx
// ✅ Good - Accessible
<Button aria-label="Close dialog" onClick={onClose}>
  <X className="w-4 h-4" />
</Button>

<Dialog>
  <DialogContent aria-describedby="dialog-description">
    <DialogTitle>Title</DialogTitle>
    <DialogDescription id="dialog-description">
      Description
    </DialogDescription>
  </DialogContent>
</Dialog>
```

## Migration from Legacy Components

### Replacing Old Components

| Old Component | New Component | Notes |
|---------------|---------------|-------|
| `<Title>` from tailwind-components | `<h1 className="text-2xl font-bold">` | Use semantic HTML |
| `<Text>` from tailwind-components | `<p className="text-sm">` | Use semantic HTML |
| Custom buttons | `<Button>` from shadcn/ui | Use variant prop |
| Custom cards | `<Card>` from shadcn/ui | Use composition |
| Mantine components | shadcn/ui equivalents | Check component list |

### Color Migration

```tsx
// Old - Hardcoded colors
className="bg-white text-gray-900 border-gray-200"
className="text-gray-600"
className="bg-purple-600 text-white"

// New - Semantic tokens
className="bg-card text-foreground border-border"
className="text-muted-foreground"
className="bg-primary text-primary-foreground"
```

### Spacing Migration

```tsx
// Old - Generous spacing
<Card className="p-6">
<Button className="px-4 py-2">

// New - Nova-inspired compact
<Card className="p-4">
<Button size="sm" className="h-8">
```

## Resources

- **shadcn/ui Documentation**: https://ui.shadcn.com
- **Radix UI Primitives**: https://www.radix-ui.com
- **Tailwind CSS**: https://tailwindcss.com
- **Hugeicons**: https://hugeicons.com
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

## Contributing

When contributing to the design system:

1. **Use shadcn/ui components** from `@/components/ui/*`
2. **Follow semantic token patterns** for colors
3. **Maintain compact spacing** for data interfaces
4. **Include accessibility** attributes (ARIA labels, keyboard nav)
5. **Test thoroughly** with different themes and modes
6. **Document changes** in this file

## Quick Reference

### Typography
- Page titles: `text-2xl font-bold`
- Section headers: `text-lg font-semibold`
- Body text: `text-sm` (14px - primary readable size)
- Secondary text: `text-sm text-muted-foreground`
- Captions/metadata: `text-xs text-muted-foreground`
- ❌ Never use arbitrary sizes like `text-[10px]`

### Colors
- Primary text: `text-foreground`
- Secondary text: `text-muted-foreground`
- Backgrounds: `bg-card`, `bg-muted`, `bg-accent`
- Borders: `border-border`
- Interactive: `text-primary`, `bg-primary`
- ❌ Never use hardcoded colors like `bg-purple-600`

### Spacing
- Card content padding: `p-6` (CardContent default)
- Card header padding: `p-4` (CardHeader default)
- Button heights: `h-9` (default), `h-8` (sm), `h-10` (lg)
- Standard gaps: `gap-4` (16px)
- Section spacing: `space-y-6` (24px)
- Form field spacing: `space-y-4` (16px)
- ❌ Never use custom utilities like `p-compact`

### Icons
- Small (buttons, inline): `w-4 h-4` (16px)
- Standard (headers): `w-5 h-5` (20px)
- Large (page titles): `w-6 h-6` (24px)
- ❌ Never use arbitrary sizes like `size={13}`

### Badges
- Use Badge component: `<Badge variant="success">Completed</Badge>`
- Status badges: `<StatusBadge status="in-progress" />`
- Priority badges: `<PriorityBadge priority="critical" />`
- ❌ Never use inline color classes

### Components
- Buttons: `<Button variant="default|outline|ghost|destructive">`
- Cards: `<Card><CardHeader><CardTitle>...</CardTitle></CardHeader><CardContent>...</CardContent></Card>`
- Forms: Use `<Form>` with `<FormField>` composition
- Tables: Use `<Table>` with semantic structure
- Badges: Use `<Badge variant="...">` or helper components