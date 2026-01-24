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

## Nova-Inspired Compact Spacing

### Spacing Philosophy

Our Nova-inspired approach uses **reduced padding and margins** for content-dense layouts:

| Component | Standard | Nova-Inspired | Usage |
|-----------|----------|---------------|-------|
| **Buttons** | `px-4 py-2` | `px-3 py-1.5` (h-8) | Compact, efficient |
| **Cards** | `p-6` | `p-4` | Tighter content spacing |
| **Card Headers** | `p-6` | `p-4` | Consistent with content |
| **Gaps** | `gap-4` | `gap-3` or `gap-4` | Context-dependent |
| **Icon Sizes** | 16px | 13-14px | Proportional to text |

### When to Use Compact Spacing

✅ **Use compact spacing for:**
- Data-dense interfaces (tables, dashboards)
- Navigation elements (tabs, menus)
- Toolbars and action bars
- Mobile interfaces

⚠️ **Use standard spacing for:**
- Marketing pages
- Onboarding flows
- Forms with complex inputs
- Content-heavy pages

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

Consistent typography optimized for readability:

| Size Class | Font Size | Usage |
|------------|-----------|-------|
| `text-xs` | 12px | Badges, labels, metadata |
| `text-sm` | 14px | Body text, buttons, inputs |
| `text-base` | 16px | Standard body text |
| `text-lg` | 18px | Section headers |
| `text-xl` | 20px | Page subtitles |
| `text-2xl` | 24px | Page titles (CardTitle default) |

**Font Weights:**
- `font-normal` (400) - Body text
- `font-medium` (500) - Emphasis
- `font-semibold` (600) - Subheadings
- `font-bold` (700) - Headings

### Spacing System

Based on Tailwind's 4px grid system:

| Class | Size | Usage |
|-------|------|-------|
| `p-2` | 8px | Tight padding |
| `p-3` | 12px | Compact padding |
| `p-4` | 16px | Standard padding (Nova-inspired) |
| `p-6` | 24px | Spacious padding |
| `gap-2` | 8px | Tight gaps |
| `gap-3` | 12px | Compact gaps |
| `gap-4` | 16px | Standard gaps |

### Icon Sizing

Consistent icon sizes for visual hierarchy:

| Size | Pixels | Usage |
|------|--------|-------|
| `size={13}` | 13px | Small icons (inline with text-xs) |
| `size={14}` | 14px | Standard icons (inline with text-sm) |
| `size={16}` | 16px | Medium icons (headers) |
| `size={20}` | 20px | Large icons (emphasis) |

## shadcn/ui Components

All components are from shadcn/ui (`@/components/ui/*`) with Nova-inspired compact styling.

### Core Components

#### Buttons
```tsx
import { Button } from "@/components/ui/button";

// Use default sizes - they're optimized
<Button variant="default">Primary</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Tertiary</Button>
<Button variant="destructive">Delete</Button>

// Compact size for toolbars
<Button size="sm" className="h-8 text-xs">Compact</Button>
```

**Variants:**
- `default` - Primary actions (filled)
- `outline` - Secondary actions (bordered)
- `ghost` - Tertiary actions (transparent)
- `destructive` - Dangerous actions (red)
- `link` - Text links

#### Cards
```tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Use defaults - p-4 padding is Nova-inspired
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

### 4. Compact Spacing for Data Interfaces
Use Nova-inspired compact spacing for data-dense interfaces:

```tsx
// ✅ Good - Compact for data tables
<Button size="sm" className="h-8 text-xs">Action</Button>
<Card className="p-4">...</Card>

// ✅ Also good - Standard for content pages
<Button>Action</Button>
<Card>...</Card>
```

### 5. Consistent Icon Sizing
Match icon sizes to text sizes:

```tsx
// ✅ Good - Proportional sizing
<Button className="text-xs">
  <Icon className="w-4 h-4" /> {/* 16px with 12px text */}
  Action
</Button>

<p className="text-sm">
  <Icon className="w-4 h-4" /> {/* 16px with 14px text */}
  Text
</p>

// ❌ Avoid - Mismatched sizing
<Button className="text-xs">
  <Icon className="w-8 h-8" /> {/* Too large */}
  Action
</Button>
```

### 6. Accessibility First
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
- Body text: `text-sm`
- Metadata: `text-xs text-muted-foreground`

### Colors
- Primary text: `text-foreground`
- Secondary text: `text-muted-foreground`
- Backgrounds: `bg-card`, `bg-muted`, `bg-accent`
- Borders: `border-border`
- Interactive: `text-primary`, `bg-primary`

### Spacing
- Card padding: `p-4`
- Button height: `h-8` (compact) or `h-9` (default)
- Gaps: `gap-3` or `gap-4`
- Icon sizes: `w-4 h-4` (14-16px)

### Components
- Buttons: `<Button variant="default|outline|ghost|destructive">`
- Cards: `<Card><CardHeader><CardTitle>...</CardTitle></CardHeader><CardContent>...</CardContent></Card>`
- Forms: Use `<Form>` with `<FormField>` composition
- Tables: Use `<Table>` with semantic structure