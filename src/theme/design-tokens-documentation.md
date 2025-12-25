# Design Tokens Documentation

## Overview

This document provides comprehensive documentation for all design tokens used in the CMMS application. Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes. They are used in place of hard-coded values to maintain a scalable and consistent visual system.

## Table of Contents

1. [Color Tokens](#color-tokens)
2. [Spacing Tokens](#spacing-tokens)
3. [Typography Tokens](#typography-tokens)
4. [Animation Tokens](#animation-tokens)
5. [Border Radius Tokens](#border-radius-tokens)
6. [Shadow Tokens](#shadow-tokens)
7. [Layout Tokens](#layout-tokens)
8. [Component Size Tokens](#component-size-tokens)
9. [Usage Examples](#usage-examples)

---

## Color Tokens

### Semantic Colors

Semantic colors provide meaning and context to UI elements. They should be used consistently across the application to maintain visual coherence.

| Token | Value | Usage | Example |
|-------|-------|-------|---------|
| `success` | `green` | Success states, completed actions | ✅ Work order completed |
| `warning` | `yellow` | Warning states, attention needed | ⚠️ Maintenance due |
| `error` | `red` | Error states, failed actions | ❌ Failed to save |
| `info` | `blue` | Informational messages | ℹ️ System notification |
| `primary` | `purple` | Primary brand color, main actions | 🟣 Primary buttons |
| `secondary` | `gray` | Secondary actions, neutral elements | ⚫ Secondary buttons |
| `accent` | `pink` | Accent color, highlights | 🩷 Special features |

### Context Colors

Context colors are used to differentiate between different types of entities in the system.

| Token | Value | Usage | Example |
|-------|-------|-------|---------|
| `workOrder` | `blue` | Work order related elements | 🔵 Work order cards |
| `technician` | `teal` | Technician related elements | 🟢 Technician profiles |
| `asset` | `orange` | Asset related elements | 🟠 Asset status |
| `location` | `grape` | Location related elements | 🟣 Location markers |
| `customer` | `indigo` | Customer related elements | 🔵 Customer info |
| `inventory` | `cyan` | Inventory related elements | 🔷 Inventory items |

### Status Color Mappings

Status colors provide immediate visual feedback about the state of various entities.

#### Work Order Status
| Status | Color | Visual |
|--------|-------|--------|
| `open` | `blue.6` | 🔵 |
| `in-progress` | `warning.6` | 🟡 |
| `completed` | `success.6` | 🟢 |
| `on-hold` | `gray.6` | ⚫ |
| `cancelled` | `error.6` | 🔴 |
| `pending` | `info.6` | 🔵 |
| `confirmed` | `indigo.6` | 🟦 |

#### Priority Levels
| Priority | Color | Visual |
|----------|-------|--------|
| `critical` | `error.8` | 🔴 |
| `high` | `error.6` | 🟠 |
| `medium` | `warning.6` | 🟡 |
| `low` | `info.6` | 🔵 |

#### Asset Status
| Status | Color | Visual |
|--------|-------|--------|
| `active` | `success.6` | 🟢 |
| `inactive` | `gray.6` | ⚫ |
| `maintenance` | `warning.6` | 🟡 |
| `retired` | `error.6` | 🔴 |

#### Technician Status
| Status | Color | Visual |
|--------|-------|--------|
| `available` | `success.6` | 🟢 |
| `busy` | `warning.6` | 🟡 |
| `offline` | `gray.6` | ⚫ |
| `on-break` | `info.6` | 🔵 |

### Data Visualization Colors

A curated palette for charts and data visualizations that ensures accessibility and visual distinction.

```typescript
const dataVizColors = [
  '#7838c7',  // Brand purple
  '#ec4899',  // Pink
  '#06b6d4',  // Cyan
  '#3b82f6',  // Blue
  '#f59e0b',  // Amber
  '#10b981',  // Emerald
  '#8b5cf6',  // Violet
  '#f97316',  // Orange
  '#14b8a6',  // Teal
  '#6366f1',  // Indigo
];
```

---

## Spacing Tokens

### Base Spacing Scale

The spacing scale provides consistent spacing throughout the application. All values are in rem units for scalability.

| Token | Value | Pixels (16px base) | Usage |
|-------|-------|-------------------|-------|
| `xs` | `0.25rem` | 4px | Tight spacing between related elements |
| `sm` | `0.5rem` | 8px | Small spacing for compact layouts |
| `md` | `1rem` | 16px | Default spacing for most components |
| `lg` | `1.5rem` | 24px | Larger spacing for section separation |
| `xl` | `2rem` | 32px | Extra large spacing for major sections |
| `xxl` | `3rem` | 48px | Maximum spacing for page-level separation |

### Semantic Spacing

#### Visual Hierarchy Spacing
| Token | Value | Usage |
|-------|-------|-------|
| `hierarchy.page` | `3rem` (48px) | Between major page sections |
| `hierarchy.section` | `2rem` (32px) | Between sections within a page |
| `hierarchy.subsection` | `1.5rem` (24px) | Between subsections |
| `hierarchy.component` | `1rem` (16px) | Between components |
| `hierarchy.element` | `0.5rem` (8px) | Between related elements |
| `hierarchy.tight` | `0.25rem` (4px) | For very tight spacing |

#### Component-Specific Spacing

##### Form Spacing
| Token | Value | Usage |
|-------|-------|-------|
| `fieldGap` | `0.75rem` (12px) | Between form fields |
| `fieldsetGap` | `1.25rem` (20px) | Between form fieldsets |
| `formSection` | `1.75rem` (28px) | Between form sections |
| `buttonGap` | `0.5rem` (8px) | Between buttons in a group |

##### Card Spacing
| Token | Value | Usage |
|-------|-------|-------|
| `cardPadding` | `1rem` (16px) | Default card internal padding |
| `cardGap` | `0.75rem` (12px) | Between cards in a grid |

##### Table Spacing
| Token | Value | Usage |
|-------|-------|-------|
| `cellPadding` | `0.5rem` (8px) | Table cell padding |
| `rowGap` | `0.25rem` (4px) | Between table rows |

### Responsive Spacing Configurations

#### Density Levels
| Density | Base | Small | Medium | Usage |
|---------|------|-------|--------|-------|
| `compact` | `xs` | `sm` | `md` | Dense layouts, mobile |
| `default` | `sm` | `md` | `lg` | Standard layouts |
| `comfortable` | `md` | `lg` | `xl` | Spacious layouts |
| `generous` | `lg` | `xl` | `xxl` | Premium layouts |

---

## Typography Tokens

### Font Sizes

| Token | Value | Pixels (16px base) | Usage |
|-------|-------|-------------------|-------|
| `xs` | `0.75rem` | 12px | Small text, captions |
| `sm` | `0.875rem` | 14px | Body text, labels |
| `md` | `1rem` | 16px | Default body text |
| `lg` | `1.125rem` | 18px | Large body text |
| `xl` | `1.25rem` | 20px | Small headings |
| `xxl` | `1.5rem` | 24px | Large headings |

### Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| `tight` | `1.2` | Headings, compact text |
| `normal` | `1.5` | Body text, default |
| `relaxed` | `1.75` | Long-form content |

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `normal` | `400` | Regular body text |
| `medium` | `500` | Emphasized text |
| `semibold` | `600` | Subheadings |
| `bold` | `700` | Headings |
| `extrabold` | `800` | Display text |

### Letter Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `tight` | `-0.025em` | Large headings |
| `normal` | `0em` | Body text |
| `wide` | `0.025em` | Small caps, labels |

### Typography Hierarchy

#### Semantic Typography Components

```typescript
// Heading variants
const headingVariants = {
  page: { order: 1, size: 'h1', fw: 700 },      // Page titles
  section: { order: 2, size: 'h2', fw: 600 },   // Section titles
  subsection: { order: 3, size: 'h3', fw: 500 }, // Subsection titles
  card: { order: 4, size: 'h4', fw: 500 },      // Card titles
};

// Text variants
const textVariants = {
  body: { size: 'md', lh: 1.5 },           // Standard body text
  caption: { size: 'sm', c: 'dimmed', lh: 1.4 }, // Captions, metadata
  label: { size: 'sm', fw: 500, lh: 1.3 },      // Form labels
  helper: { size: 'xs', c: 'dimmed', lh: 1.3 }, // Helper text
};
```

---

## Animation Tokens

### Duration Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `instant` | `100ms` | Immediate feedback |
| `fast` | `150ms` | Quick transitions |
| `normal` | `250ms` | Standard transitions |
| `slow` | `350ms` | Deliberate transitions |
| `slower` | `500ms` | Dramatic transitions |

### Easing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `linear` | `linear` | Consistent motion |
| `easeOut` | `cubic-bezier(0.16, 1, 0.3, 1)` | Natural deceleration |
| `easeIn` | `cubic-bezier(0.7, 0, 0.84, 0)` | Natural acceleration |
| `easeInOut` | `cubic-bezier(0.87, 0, 0.13, 1)` | Smooth acceleration/deceleration |
| `bounce` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Playful bounce effect |

---

## Border Radius Tokens

| Token | Value | Pixels (16px base) | Usage |
|-------|-------|-------------------|-------|
| `none` | `0` | 0px | Sharp corners |
| `xs` | `0.125rem` | 2px | Subtle rounding |
| `sm` | `0.25rem` | 4px | Small components |
| `md` | `0.5rem` | 8px | Standard components |
| `lg` | `0.75rem` | 12px | Cards, panels |
| `xl` | `1rem` | 16px | Large components |
| `xxl` | `1.5rem` | 24px | Hero elements |
| `full` | `9999px` | Full | Circular elements |

---

## Shadow Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` | Subtle elevation |
| `sm` | `0 1px 3px 0 rgba(0, 0, 0, 0.1)...` | Small components |
| `md` | `0 4px 6px -1px rgba(0, 0, 0, 0.1)...` | Cards, buttons |
| `lg` | `0 10px 15px -3px rgba(0, 0, 0, 0.1)...` | Modals, dropdowns |
| `xl` | `0 20px 25px -5px rgba(0, 0, 0, 0.1)...` | Large overlays |
| `xxl` | `0 25px 50px -12px rgba(0, 0, 0, 0.25)` | Hero elements |
| `inner` | `inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)` | Inset elements |

---

## Layout Tokens

### Container Sizes

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `xs` | `33.75rem` | 540px | Small containers |
| `sm` | `45rem` | 720px | Medium containers |
| `md` | `60rem` | 960px | Standard containers |
| `lg` | `71.25rem` | 1140px | Large containers |
| `xl` | `82.5rem` | 1320px | Extra large containers |
| `fluid` | `100%` | Full width | Full width containers |

### Sidebar Widths

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `collapsed` | `4rem` | 64px | Icon-only sidebar |
| `expanded` | `17.5rem` | 280px | Full navigation |
| `mobile` | `20rem` | 320px | Mobile overlay |

### Header Heights

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `mobile` | `3.5rem` | 56px | Mobile header |
| `desktop` | `4rem` | 64px | Desktop header |
| `compact` | `3rem` | 48px | Compact header |

---

## Component Size Tokens

### Button Sizes

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `xs` | `1.5rem` | 24px | Tiny buttons |
| `sm` | `2rem` | 32px | Small buttons |
| `md` | `2.5rem` | 40px | Standard buttons |
| `lg` | `3rem` | 48px | Large buttons |
| `xl` | `3.5rem` | 56px | Extra large buttons |

### Input Sizes

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `xs` | `1.75rem` | 28px | Compact inputs |
| `sm` | `2.25rem` | 36px | Small inputs |
| `md` | `2.75rem` | 44px | Standard inputs |
| `lg` | `3.25rem` | 52px | Large inputs |
| `xl` | `3.75rem` | 60px | Extra large inputs |

### Icon Sizes

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `xs` | `0.75rem` | 12px | Small icons |
| `sm` | `1rem` | 16px | Standard icons |
| `md` | `1.25rem` | 20px | Medium icons |
| `lg` | `1.5rem` | 24px | Large icons |
| `xl` | `2rem` | 32px | Extra large icons |

---

## Usage Examples

### Using Color Tokens

```typescript
import { getStatusColor, getContextColor } from '@/theme';

// Status-based coloring
const workOrderStatus = 'completed';
const statusColor = getStatusColor(workOrderStatus); // Returns 'success.6'

// Context-based coloring
const entityType = 'technician';
const contextColor = getContextColor(entityType); // Returns 'teal'

// In components
<Badge color={getStatusColor(workOrder.status)}>
  {workOrder.status}
</Badge>
```

### Using Spacing Tokens

```typescript
import { designTokens, getSemanticSpacing } from '@/theme';

// Direct token usage
<Stack gap={designTokens.spacing.md}>
  <Card p={designTokens.spacing.cardPadding}>
    Content
  </Card>
</Stack>

// Semantic spacing
<Group gap={getSemanticSpacing('components', 'button', 'gap')}>
  <Button>Action</Button>
  <Button>Cancel</Button>
</Group>

// Responsive spacing
<Container p={{ base: 'sm', md: 'lg' }}>
  Content
</Container>
```

### Using Typography Tokens

```typescript
import { designTokens } from '@/theme';

// Typography components
<Title order={2} fw={designTokens.typography.fontWeights.semibold}>
  Section Title
</Title>

<Text size={designTokens.typography.fontSizes.md} lh={designTokens.typography.lineHeights.normal}>
  Body text content
</Text>

// Semantic typography
<Heading semantic="page">Page Title</Heading>
<BodyText variant="caption">Caption text</BodyText>
```

### Using Animation Tokens

```typescript
import { designTokens } from '@/theme';

// CSS transitions
const buttonStyles = {
  transition: `all ${designTokens.animations.durations.fast} ${designTokens.animations.easings.easeOut}`,
  '&:hover': {
    transform: 'translateY(-1px)',
  },
};

// Mantine transitions
<Transition
  mounted={opened}
  transition="fade"
  duration={parseInt(designTokens.animations.durations.normal)}
  timingFunction={designTokens.animations.easings.easeOut}
>
  {(styles) => <div style={styles}>Content</div>}
</Transition>
```

### Using Layout Tokens

```typescript
import { designTokens } from '@/theme';

// Container with max width
<Container size={designTokens.layout.container.lg}>
  Content
</Container>

// Grid with consistent gutters
<SimpleGrid
  cols={{ base: 1, sm: 2, md: 3 }}
  spacing={designTokens.layout.grid.gutter}
>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</SimpleGrid>

// Sidebar layout
<div style={{
  display: 'grid',
  gridTemplateColumns: `${designTokens.layout.sidebar.expanded} 1fr`,
  gap: designTokens.spacing.lg,
}}>
  <aside>Sidebar</aside>
  <main>Content</main>
</div>
```

---

## Best Practices

### 1. Consistency
- Always use design tokens instead of hard-coded values
- Use semantic tokens when available (e.g., `success` instead of `green.6`)
- Maintain consistent spacing relationships throughout the application

### 2. Accessibility
- Ensure sufficient color contrast using the provided color palettes
- Use semantic colors to convey meaning consistently
- Test with screen readers and keyboard navigation

### 3. Responsiveness
- Use responsive spacing configurations for different screen sizes
- Leverage breakpoint tokens for consistent responsive behavior
- Consider mobile-first design principles

### 4. Performance
- Use CSS custom properties for dynamic theming
- Leverage Mantine's built-in optimization features
- Minimize custom CSS by using design tokens

### 5. Maintainability
- Document any custom token additions
- Follow the established naming conventions
- Keep token definitions centralized in the theme system

---

## Token Reference Quick Links

- **Colors**: `src/theme/colors.ts`
- **Spacing**: `src/theme/spacing.ts`
- **Typography**: `src/theme/tokens.ts` (typography section)
- **Animations**: `src/theme/tokens.ts` (animations section)
- **Layout**: `src/theme/tokens.ts` (layout section)
- **Component Variants**: `src/theme/variants.ts`
- **Theme Utilities**: `src/theme/utils.ts`

This documentation serves as the single source of truth for all design tokens in the CMMS application. Regular updates should be made as the design system evolves.