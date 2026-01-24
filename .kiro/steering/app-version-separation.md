---
inclusion: always
---

# Application Isolation Rules

## CRITICAL: Three Separate Applications

This workspace contains **three isolated applications** that must never share code or dependencies:

- **`src/`** - Desktop web CMMS (React + Vite + shadcn/ui)
- **`mobile-web/`** - Mobile web PWA (Next.js 14 + Tailwind)  
- **`mobile/`** - Native mobile app (React Native 0.73 + React Native Paper)

### Key Clarification: shadcn/ui Default Styling

**Use shadcn/ui components with their default styling** - they're designed to look great out of the box:

- **shadcn/ui** = Complete component library with built-in styling
- **Approach** = Use components as-is without overrides
- **Philosophy** = Trust the defaults for a modern, polished UI

**Best Practice Pattern**:
```tsx
// ✅ Use shadcn/ui defaults - no overrides needed
<Card>
  <CardHeader>
    <CardTitle>Work Orders</CardTitle> {/* text-2xl default is good */}
  </CardHeader>
  <CardContent> {/* p-6 default provides good spacing */}
    <p className="text-sm">Body text</p>
  </CardContent>
</Card>

// ✅ Use default icon sizes
<CardTitle className="flex items-center gap-2">
  <Icon className="w-5 h-5" /> {/* Standard 20px */}
  Title
</CardTitle>

// ✅ Use default button sizes
<Button variant="outline">
  <Icon className="w-4 h-4" />
  Action
</Button>
```

**What shadcn/ui provides (use as-is)**:
- `shadow-sm` on Card (subtle, professional)
- `rounded-lg` (8px, modern look)
- `border` for separation
- `p-6` padding (comfortable spacing)
- `text-2xl` titles (readable hierarchy)
- Accessible component structure

**When to customize**:
- Only override when you have a specific design requirement
- Use Tailwind classes to adjust spacing/colors for specific use cases
- Customize through CSS variables for theme-wide changes

## Mandatory Import Boundaries

**NEVER import across application directories:**

```typescript
// ❌ FORBIDDEN - Will cause build failures
import { Component } from '../mobile-web/components/Component';
import { useHook } from '../../mobile/src/hooks/useHook';
import utils from '@/mobile-web/utils';

// ❌ FORBIDDEN - Sharing UI components
import { Button } from '../../../src/components/ui/button';
import { Card } from '../../mobile-web/src/components/Card';

// ✅ REQUIRED - Stay within application boundary
import { Component } from '@/components/Component';
import { useHook } from '@/hooks/useHook';
import utils from '@/utils';
import { Button } from '@/components/ui/button'; // Desktop only
```

## Application Characteristics

### Desktop Web (`src/`)
- **Purpose**: Full-featured CMMS for desktop/laptop users
- **UI Framework**: shadcn/ui (Radix UI primitives + Tailwind)
- **Key Libraries**: 
  - React 18.3 + Vite
  - @tanstack/react-table for data tables
  - @tanstack/react-query for data fetching
  - Recharts for analytics
  - Mapbox GL for mapping
  - Radix UI primitives (Dialog, Dropdown, Select, etc.)
  - Lucide React icons
- **UI Patterns**: 
  - Complex data tables with sorting/filtering
  - Hover states and focus rings
  - Keyboard navigation
  - Multi-column layouts
  - Desktop-optimized forms
  - Sidebar navigation
- **Styling**: Tailwind with CSS variables for theming, shadcn/ui component variants
- **Build**: Vite (port 5173 default)

### Mobile Web (`mobile-web/`)
- **Purpose**: Progressive Web App for mobile technicians
- **UI Framework**: Custom Tailwind components (no shadcn/ui)
- **Key Libraries**:
  - Next.js 14 + React 18.2
  - @tanstack/react-query for data fetching
  - Mapbox GL for mapping
  - Framer Motion for animations
  - Lucide React icons
  - next-pwa for PWA capabilities
- **UI Patterns**: 
  - Touch-friendly interfaces (min 44px tap targets)
  - Swipe gestures
  - Bottom navigation
  - Single-column layouts
  - Pull-to-refresh
  - Haptic feedback
  - Offline-first architecture
- **Styling**: Mobile-first Tailwind with industrial color system
- **Build**: Next.js (port 3002)

### Native Mobile (`mobile/`)
- **Purpose**: Native iOS/Android app for field technicians
- **UI Framework**: React Native Paper (Material Design)
- **Key Libraries**:
  - React Native 0.73 + React 18.2
  - React Navigation (native stack + bottom tabs)
  - @tanstack/react-query for data fetching
  - React Native Maps
  - React Native Camera
  - React Native Vector Icons
  - Zustand for state management
  - AsyncStorage for local persistence
- **UI Patterns**:
  - Native navigation patterns
  - Platform-specific components
  - Native gestures
  - Device API access (camera, GPS, etc.)
  - Offline sync
- **Styling**: React Native StyleSheet + React Native Paper theming
- **Build**: React Native CLI / Expo

## Design System Guidelines

### Desktop (`src/`) - shadcn/ui Design System

**Component Library**: shadcn/ui (Radix UI + Tailwind)
- Use shadcn/ui components from `@/components/ui/*`
- Components use CSS variables for theming (HSL color system)
- Radix UI primitives for accessibility
- Use default styling - components are designed to look great out of the box

**Design Principles**:
- **Trust the defaults** - shadcn/ui components have well-designed spacing and typography
- **Modern and polished** - subtle shadows and rounded corners create depth
- **Accessible by default** - Radix UI primitives ensure WCAG compliance
- **Consistent theming** - CSS variables allow easy customization

**Typography Scale** (shadcn/ui defaults):
```tsx
// Page Titles
text-2xl font-bold (24px) // CardTitle default

// Section Headers  
text-lg font-semibold (18px)

// Body Text / Primary Labels
text-sm (14px) // Standard readable size

// Secondary Labels / Metadata
text-sm text-muted-foreground (14px, muted)

// Captions / Small Text
text-xs (12px)

// ✅ Use shadcn/ui defaults - they provide good hierarchy
// ✅ Override only when you have specific design needs
```

**Icon Sizes**:
```tsx
// Standard icons
w-5 h-5 (20px) // Default comfortable size

// Small icons (inline with text)
w-4 h-4 (16px)

// Large icons (headers, empty states)
w-6 h-6 (24px)

// ✅ Use consistent sizing across similar contexts
```

**Spacing Scale** (shadcn/ui defaults):
```tsx
// Component padding
p-6 // Card default - comfortable spacing
p-4 // Dialog/Modal default

// Gaps
gap-4 (16px) // Standard gap
gap-2 (8px) // Tight gap
gap-6 (24px) // Spacious gap

// Section spacing
space-y-4 (16px) // Between form fields
space-y-6 (24px) // Between sections

// ✅ Use shadcn/ui defaults - they provide good breathing room
// ✅ Adjust only for specific layout needs
```

**Color System**:
```tsx
// CSS variable-based theming (shadcn/ui)
primary: 'hsl(var(--primary))' // Brand color
background: 'hsl(var(--background))'
foreground: 'hsl(var(--foreground))'
muted: 'hsl(var(--muted))'
muted-foreground: 'hsl(var(--muted-foreground))'

// Semantic colors (built into shadcn/ui)
destructive: 'hsl(var(--destructive))' // Error/danger
border: 'hsl(var(--border))'
input: 'hsl(var(--input))'
ring: 'hsl(var(--ring))' // Focus rings

// Text hierarchy (use semantic classes)
text-foreground // Primary text
text-muted-foreground // Secondary text

// Borders
border // Uses --border CSS variable

// ✅ Use CSS variables for consistent theming
// ✅ Customize through tailwind.config.js if needed
```

**Component Patterns** (shadcn/ui defaults):
```tsx
// Cards - Use defaults
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle> {/* text-2xl default */}
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent> {/* p-6 default */}
    <p className="text-sm">Body text</p>
  </CardContent>
</Card>

// Buttons - Use default sizes
<Button variant="outline">
  <Icon className="w-4 h-4 mr-2" />
  Action
</Button>

// Dialogs - Use defaults
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>

// Forms - Use shadcn/ui form components
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

// Tables - Use shadcn/ui table components
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

**Customization Guidelines**:
```tsx
// ✅ Use defaults first
<Card>
  <CardContent>
    <CardTitle>Title</CardTitle>
  </CardContent>
</Card>

// ✅ Customize when needed for specific use cases
<Card className="border-destructive">
  <CardContent className="p-4"> {/* Tighter spacing for specific layout */}
    <CardTitle className="text-lg">Smaller Title</CardTitle>
  </CardContent>
</Card>

// ✅ Use variants for different styles
<Button variant="default">Primary</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Tertiary</Button>
<Button variant="destructive">Delete</Button>

// ✅ Combine with Tailwind utilities as needed
<Card className="hover:shadow-md transition-shadow">
  <CardContent className="space-y-4">
    {/* Content */}
  </CardContent>
</Card>
```

**Icons**: Lucide React (`lucide-react`)
```tsx
import { Icon } from 'lucide-react'

// Standard size
<Icon className="w-5 h-5" />

// Small size (inline with text)
<Icon className="w-4 h-4" />

// With semantic colors
<Icon className="w-5 h-5 text-muted-foreground" />
```

### Mobile Web (`mobile-web/`) - Custom Tailwind

**Component Library**: Custom components (NO shadcn/ui)
- Build custom components with Tailwind
- Industrial color system (steel blue, safety orange)

**Color System**:
```typescript
// Industrial CMMS palette
primary: { 600: '#0077ce' } // Steel blue
secondary: { 500: '#f97316' } // Safety orange
gray: Slate-based machinery gray
status: { open: '#0077ce', progress: '#f97316', completed: '#22c55e' }
priority: { critical: '#dc2626', high: '#ea580c' }
```

**Styling Patterns**:
```tsx
// Touch-optimized components
<button className="min-h-[44px] touch-manipulation px-4 py-3">
<div className="grid-cols-1 sm:grid-cols-2 p-4 gap-4">

// Safe area insets
<div className="pt-safe-top pb-safe-bottom">

// Mobile-first responsive
text-sm sm:text-base
flex-col sm:flex-row
```

**Icons**: Lucide React (`lucide-react`)

### Native Mobile (`mobile/`) - React Native Paper

**Component Library**: React Native Paper (Material Design)
- Use Paper components: `Button`, `Card`, `TextInput`, etc.
- Material Design theming system

**Styling**:
```typescript
// React Native StyleSheet
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' }
});

// React Native Paper components
<Button mode="contained" onPress={...}>
<Card elevation={2}>
<TextInput mode="outlined" label="..." />

// Platform-specific
Platform.OS === 'ios' ? styles.ios : styles.android
```

**Icons**: React Native Vector Icons

## Shared Design Principles

While code cannot be shared, maintain **visual consistency** through:

### Spacing Scale (All Apps)
- **Base**: 4px increments (4, 8, 12, 16, 20, 24, 32, 40, 48...)
- **Desktop**: Comfortable spacing (p-6, gap-4) - shadcn/ui defaults
- **Mobile**: Touch-optimized (px-4 py-3, gap-4, min-h-[44px])

### Typography Scale
- **Desktop**: Modern readable (text-sm/14px body, text-2xl/24px titles) - shadcn/ui defaults
- **Mobile Web**: Mobile-optimized (text-sm/14px body, text-base/16px titles)
- **Native**: Platform defaults with Paper theming

### Color Semantics (Consistent Across All Apps)
- **Primary**: Brand/action colors (use CSS variables for desktop)
- **Success**: Green (#22c55e family)
- **Warning**: Yellow/amber (#eab308 family)
- **Error**: Red (#ef4444 family)
- **Neutral**: Gray scales for text and borders

### Border Radius
- **Desktop**: Modern (8px rounded-lg) - shadcn/ui default
- **Mobile Web**: Moderate (8-12px) - touch-friendly
- **Native**: Paper defaults (4px)

### shadcn/ui Resources (Desktop)
- **Documentation**: https://ui.shadcn.com
- **Components**: Use from `@/components/ui/*`
- **Theming**: Customize via CSS variables in `globals.css`
- **Examples**: Check shadcn/ui docs for usage patterns
- **Philosophy**: Trust the defaults, customize only when needed

## AI Assistant Rules

**BEFORE any file operation:**

1. **Determine target app** from file path:
   - `src/**` → Desktop (shadcn/ui + Tailwind)
   - `mobile-web/**` → Mobile web (Custom Tailwind)
   - `mobile/**` → Native (React Native Paper)

2. **Validate imports** - All must stay within same application directory
   - Desktop can import from `@/components/ui/*` (shadcn/ui)
   - Mobile web builds custom components
   - Native uses React Native Paper components

3. **Check UI library compatibility**:
   - shadcn/ui components → Desktop only
   - Radix UI primitives → Desktop only
   - React Native Paper → Native only
   - Custom Tailwind → Mobile web only

4. **Apply appropriate patterns**:
   - Desktop: Data tables, hover states, keyboard nav, shadcn/ui
   - Mobile Web: Touch targets (44px), swipe gestures, PWA features
   - Native: Platform navigation, device APIs, Material Design

5. **Duplicate rather than share** - Copy and adapt code for each platform

## Pre-Task Validation Checklist

- [ ] Target application identified from file path
- [ ] All imports within application boundary
- [ ] Correct UI library used (shadcn/ui vs custom vs Paper)
- [ ] Platform-appropriate patterns applied
- [ ] No cross-application dependencies
- [ ] Application can build independently

## Forbidden Patterns

### Code Sharing
- ❌ Cross-directory imports (`../mobile-web/`, `../../mobile/`)
- ❌ Shared state between applications
- ❌ Importing shadcn/ui components in mobile apps
- ❌ Using React Native Paper in web apps
- ❌ Mixed UI paradigms within single app

### UI Library Misuse
- ❌ Using shadcn/ui in mobile-web or mobile
- ❌ Using React Native Paper in web apps
- ❌ Mixing Radix UI with React Native components
- ❌ Importing desktop `@/components/ui/*` in mobile apps

### Styling Anti-Patterns
- ❌ Using desktop hover states in mobile apps
- ❌ Applying mobile touch targets to desktop interfaces
- ❌ Using React Native StyleSheet in web apps
- ❌ Using Tailwind classes in React Native (without NativeWind)
- ❌ Inconsistent color semantics across applications

## Recommended Patterns

### Component Duplication Strategy

When similar functionality is needed across apps, duplicate with platform-appropriate implementation:

```typescript
// ✅ Desktop (src/components/ui/button.tsx) - shadcn/ui
import { Button as ShadcnButton } from '@/components/ui/button';
<ShadcnButton variant="default" size="lg" className="hover:bg-primary/90">

// ✅ Mobile Web (mobile-web/components/Button.tsx) - Custom Tailwind
<button className="min-h-[44px] px-4 py-3 bg-primary-600 text-white rounded-lg touch-manipulation">

// ✅ Native (mobile/components/Button.tsx) - React Native Paper
import { Button } from 'react-native-paper';
<Button mode="contained" onPress={...}>
```

### Data Fetching (Shared Pattern)

All apps use `@tanstack/react-query` - this pattern CAN be similar:

```typescript
// ✅ Similar pattern across all apps
const { data, isLoading } = useQuery({
  queryKey: ['workOrders'],
  queryFn: () => supabase.from('work_orders').select('*')
});
```

### Supabase Integration (Shared Pattern)

All apps use `@supabase/supabase-js` - connection logic CAN be similar:

```typescript
// ✅ Similar pattern across all apps
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key);
```

### Design System Consistency

- Maintain visual consistency through shared design tokens
- Document color palette, spacing scale, and typography in each app
- Use consistent naming conventions for similar components
- Align user experience patterns while respecting platform conventions
- Keep semantic colors aligned (success=green, error=red, etc.)

## Common Mistakes to Avoid

1. **Importing shadcn/ui in mobile apps**
   ```typescript
   // ❌ WRONG - mobile-web/components/WorkOrder.tsx
   import { Button } from '@/components/ui/button'; // This is desktop only!
   
   // ✅ CORRECT
   <button className="min-h-[44px] ..."> // Custom Tailwind
   ```

2. **Using desktop data table components in mobile**
   ```typescript
   // ❌ WRONG
   import { DataTable } from '../../../src/components/ui/EnhancedDataTable';
   
   // ✅ CORRECT - Build mobile-optimized list/card view
   <div className="space-y-2">
     {items.map(item => <MobileCard key={item.id} {...item} />)}
   </div>
   ```

3. **Mixing React Native and web imports**
   ```typescript
   // ❌ WRONG - mobile/src/screens/WorkOrders.tsx
   import { Card } from '../../../src/components/ui/card';
   
   // ✅ CORRECT
   import { Card } from 'react-native-paper';
   ```

4. **Using wrong typography scale**
   ```tsx
   // ❌ WRONG - Inconsistent sizing
   <h1 className="text-5xl">Overly Large Title</h1>
   <p className="text-[9px]">Too small to read</p>
   
   // ✅ CORRECT - Use shadcn/ui defaults
   <CardTitle>Title</CardTitle> {/* text-2xl default */}
   <p className="text-sm">Body text</p> {/* 14px readable */}
   ```

5. **Over-customizing shadcn/ui components**
   ```tsx
   // ❌ WRONG - Fighting the defaults
   <Card className="shadow-none rounded-none p-0">
   <Button className="h-6 text-[9px] p-1">
   
   // ✅ CORRECT - Trust the defaults
   <Card>
   <Button>
   ```

6. **Ignoring touch target sizes in mobile**
   ```tsx
   // ❌ WRONG - Mobile web
   <button className="h-8 w-8"> // Too small for touch!
   
   // ✅ CORRECT - WCAG compliant
   <button className="min-h-[44px] min-w-[44px]"> // 44px minimum
   ```

7. **Inconsistent icon sizes**
   ```tsx
   // ❌ WRONG - Random sizing
   <Icon size={32} /> // Too large
   <Icon className="w-2 h-2" /> // Too small
   
   // ✅ CORRECT - Consistent sizing
   <Icon className="w-5 h-5" /> // Standard (20px)
   <Icon className="w-4 h-4" /> // Small (16px)
   ```

**STRICT ENFORCEMENT REQUIRED** - Cross-application dependencies break builds and create maintenance issues.

---

## Quick Reference Card

### Desktop (`src/`)
```tsx
// shadcn/ui components with defaults
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'

// Typography (use defaults)
<CardTitle>Title</CardTitle> {/* text-2xl default */}
<p className="text-sm">Body text</p> {/* 14px */}
<p className="text-xs text-muted-foreground">Caption</p> {/* 12px */}

// Icons
<Icon className="w-5 h-5" /> {/* Standard (20px) */}
<Icon className="w-4 h-4" /> {/* Small (16px) */}

// Spacing (use defaults)
<Card>
  <CardContent> {/* p-6 default */}
    <div className="space-y-4"> {/* 16px between items */}
      {/* Content */}
    </div>
  </CardContent>
</Card>

// Colors (use CSS variables)
<div className="bg-primary text-primary-foreground">
<p className="text-muted-foreground">Secondary text</p>

// Buttons (use defaults)
<Button variant="default">Primary</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Tertiary</Button>

// Forms
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
      </FormItem>
    )}
  />
</Form>
```

### Mobile Web (`mobile-web/`)
```tsx
// Typography
text-base font-semibold // Titles (16px)
text-sm // Body (14px)
min-h-[44px] // Touch targets

// Colors
bg-primary-600 // Steel blue (#0077ce)
bg-secondary-500 // Safety orange (#f97316)

// Spacing
px-4 py-3 // Standard padding
gap-4 // Normal gap (16px)
pt-safe-top pb-safe-bottom // Safe areas

// Components (Custom Tailwind)
<button className="min-h-[44px] px-4 py-3 bg-primary-600 rounded-lg">
```

### Native Mobile (`mobile/`)
```tsx
// Components
import { Button, Card } from 'react-native-paper'
<Button mode="contained" onPress={...}>

// Styling
const styles = StyleSheet.create({
  container: { padding: 16 }
})

// Platform-specific
Platform.OS === 'ios' ? styles.ios : styles.android
```

### shadcn/ui Resources (Desktop)
- **Documentation**: https://ui.shadcn.com
- **Components**: Use from `@/components/ui/*`
- **Theming**: Customize via CSS variables in `globals.css`
- **Examples**: Check shadcn/ui docs for usage patterns
- **Philosophy**: Trust the defaults, customize only when needed