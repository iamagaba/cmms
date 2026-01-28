# 👨‍💻 Developer Guidelines

## Overview

This guide establishes development standards and patterns for maintaining consistency and quality in our design system implementation. Follow these guidelines to ensure all new code aligns with our established patterns.

---

## 🎯 Core Principles

### 1. Consistency First
- Use established patterns before creating new ones
- Follow existing component structures and naming conventions
- Maintain visual and functional consistency across all interfaces

### 2. shadcn/ui by Default
- Use shadcn/ui components with their default styling
- Only customize when you have specific design requirements
- Trust the defaults - they're designed to look professional

### 3. Semantic Tokens Always
- Use semantic color tokens (`bg-card`, `text-muted-foreground`)
- Never use hardcoded colors (`bg-white`, `text-gray-600`)
- Follow the established color system

### 4. Performance Conscious
- Optimize for bundle size and runtime performance
- Use consistent classes to improve Tailwind CSS optimization
- Avoid unnecessary re-renders and complex calculations

---

## 🎨 Design System Standards

### Color Usage

```tsx
// ✅ ALWAYS USE - Semantic Tokens
bg-background          // Main page background
bg-card               // Card and panel backgrounds
bg-muted              // Subtle backgrounds, disabled states
bg-accent             // Hover states, selected items
bg-primary            // Brand color, primary actions
text-foreground       // Primary text
text-muted-foreground // Secondary text, labels
border-border         // Standard borders

// ❌ NEVER USE - Hardcoded Colors
bg-white              // Use bg-card or bg-background
text-gray-600         // Use text-muted-foreground
bg-gray-100           // Use bg-muted
border-gray-200       // Use border-border
bg-blue-500           // Use bg-primary
```

### Icon Standards

```tsx
// ✅ ALWAYS USE - Tailwind Classes
<Icon className="w-4 h-4" />    // 16px - Small icons, inline with text
<Icon className="w-5 h-5" />    // 20px - Standard icons, most common
<Icon className="w-6 h-6" />    // 24px - Large icons, headers, empty states

// ❌ NEVER USE - Legacy Sizing
<Icon size={16} />              // Use className="w-4 h-4"
<Icon style={{ width: 20 }} />  // Use Tailwind classes
```

### Spacing Patterns

```tsx
// ✅ CANONICAL SPACING - Use These Values
space-y-6              // 24px - Major section separation
space-y-4              // 16px - Standard section spacing
gap-4                  // 16px - Standard grid gaps
gap-2                  // 8px - Button groups, tight grouping
gap-1.5                // 6px - Icon + text, very tight grouping
p-6                    // 24px - Major container padding (CardContent default)
p-4                    // 16px - Standard container padding
p-3                    // 12px - Compact list items

// ❌ AVOID - Non-Standard Values
space-y-3              // Use space-y-4 instead
space-y-5              // Use space-y-6 instead
gap-3                  // Use gap-4 or gap-2 instead
p-2                    // Use p-3 or p-4 instead
p-5                    // Use p-4 or p-6 instead
```

---

## 🧩 Component Usage Standards

### shadcn/ui Components

#### Cards (Primary Containers)

```tsx
// ✅ STANDARD PATTERN
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>                    // text-2xl default
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>                                     // p-6 default
    <p className="text-sm">Content</p>
  </CardContent>
</Card>

// ✅ COMPACT PATTERN
<Card>
  <CardContent className="p-4">                    // Tighter padding
    <h3 className="text-base font-medium mb-2">Title</h3>
    <p className="text-sm text-muted-foreground">Content</p>
  </CardContent>
</Card>

// ❌ NEVER CREATE CUSTOM CARD SHELLS
<div className="bg-muted/50 border border-border rounded-lg p-4">
  {/* Use Card component instead */}
</div>
```

#### Buttons (Actions)

```tsx
// ✅ STANDARD BUTTON PATTERNS
<Button variant="default">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="ghost">Tertiary Action</Button>
<Button variant="destructive">Delete Action</Button>

// ✅ BUTTONS WITH ICONS
<Button variant="outline" size="sm">
  <Plus className="w-4 h-4 mr-2" />
  Add Item
</Button>

// ✅ ICON-ONLY BUTTONS
<Button variant="ghost" size="sm">
  <Edit className="w-4 h-4" />
</Button>
```

#### Badges (Status Indicators)

```tsx
// ✅ USE BADGE COMPONENT
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="outline">Draft</Badge>
<Badge variant="destructive">Error</Badge>

// ❌ NEVER CREATE CUSTOM BADGES
<span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs">
  {/* Use Badge component instead */}
</span>
```

### Custom Layout Components

#### PageHeader Usage

```tsx
// ✅ STANDARD PAGE HEADER
<PageHeader 
  title="Page Title"
  subtitle="Optional description"
  actions={
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Primary Action
    </Button>
  }
/>

// ✅ WITH ICON
<PageHeader 
  title="Assets"
  icon={<Package className="w-5 h-5" />}
  actions={<Button variant="outline">Export</Button>}
/>
```

#### MasterListShell Usage

```tsx
// ✅ MASTER-DETAIL PATTERN
<MasterListShell
  title="Items"
  searchValue={searchQuery}
  onSearchChange={setSearchQuery}
  searchPlaceholder="Search items..."
  onCreateNew={() => setShowCreateDialog(true)}
  createButtonText="Add Item"
>
  {items.map(item => (
    <MasterListRow
      key={item.id}
      title={item.name}
      subtitle={item.description}
      badge={{ text: item.status, variant: getStatusVariant(item.status) }}
      onClick={() => setSelectedItem(item)}
      isSelected={selectedItem?.id === item.id}
    />
  ))}
</MasterListShell>
```

#### EmptyState Usage

```tsx
// ✅ STANDARD EMPTY STATE
<EmptyState
  icon={<Package className="w-6 h-6" />}
  title="No items found"
  description="Get started by adding your first item."
  action={
    <Button onClick={() => setShowCreateDialog(true)}>
      <Plus className="w-4 h-4 mr-2" />
      Add Item
    </Button>
  }
/>
```

---

## 📝 Code Standards

### TypeScript Requirements

```tsx
// ✅ PROPER INTERFACE DEFINITIONS
interface ComponentProps {
  title: string;
  subtitle?: string;
  isSelected?: boolean;
  onClick: () => void;
  className?: string;
}

// ✅ PROPER COMPONENT TYPING
export const Component: React.FC<ComponentProps> = ({
  title,
  subtitle,
  isSelected = false,
  onClick,
  className
}) => {
  // Component implementation
};

// ✅ PROPER EVENT HANDLERS
const handleClick = useCallback(() => {
  onClick();
}, [onClick]);

// ✅ PROPER STATE TYPING
const [selectedItem, setSelectedItem] = useState<Item | null>(null);
const [isLoading, setIsLoading] = useState<boolean>(false);
```

### React Best Practices

```tsx
// ✅ PROPER COMPONENT STRUCTURE
export const Component: React.FC<Props> = ({ prop1, prop2 }) => {
  // 1. Hooks at the top
  const [state, setState] = useState();
  const { data, isLoading } = useQuery();
  
  // 2. Computed values
  const computedValue = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);
  
  // 3. Event handlers
  const handleClick = useCallback(() => {
    // Handle click
  }, []);
  
  // 4. Early returns
  if (isLoading) return <LoadingSkeleton />;
  if (!data) return <EmptyState />;
  
  // 5. Main render
  return (
    <Card>
      <CardContent>
        {/* Component content */}
      </CardContent>
    </Card>
  );
};

// ✅ PROPER PROP DESTRUCTURING
const { title, subtitle, isSelected = false, ...rest } = props;

// ✅ PROPER CONDITIONAL RENDERING
{isSelected && <Badge variant="secondary">Selected</Badge>}
{items.length > 0 ? (
  <ItemList items={items} />
) : (
  <EmptyState />
)}
```

### Performance Optimization

```tsx
// ✅ MEMOIZE EXPENSIVE CALCULATIONS
const expensiveValue = useMemo(() => {
  return items.filter(item => item.status === 'active').length;
}, [items]);

// ✅ MEMOIZE CALLBACK FUNCTIONS
const handleItemClick = useCallback((itemId: string) => {
  setSelectedItem(items.find(item => item.id === itemId));
}, [items]);

// ✅ MEMOIZE COMPONENTS WHEN NEEDED
const MemoizedListItem = React.memo(ListItem);

// ✅ OPTIMIZE RE-RENDERS
const Component = React.memo(({ items, onSelect }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.items.length === nextProps.items.length;
});
```

---

## 🎨 Styling Guidelines

### Tailwind CSS Best Practices

```tsx
// ✅ RESPONSIVE DESIGN (Mobile-First)
className="flex flex-col sm:flex-row"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
className="text-sm sm:text-base"
className="p-4 sm:p-6"

// ✅ CONDITIONAL STYLING
className={cn(
  "base-classes",
  isSelected && "selected-classes",
  isDisabled && "disabled-classes"
)}

// ✅ COMPONENT VARIANTS
const variants = {
  default: "bg-primary text-primary-foreground",
  outline: "border border-input bg-background",
  ghost: "hover:bg-accent hover:text-accent-foreground"
};

// ✅ PROPER CLASS ORGANIZATION
className="
  flex items-center justify-between
  p-4 rounded-lg border
  bg-card text-foreground
  hover:bg-accent transition-colors
"
```

### CSS Custom Properties

```css
/* ✅ USE CSS VARIABLES FOR THEMING */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
}
```

---

## 🔧 Development Workflow

### File Organization

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── layout/             # Custom layout components
│   │   ├── PageHeader.tsx
│   │   ├── MasterListShell.tsx
│   │   └── ...
│   └── [feature]/          # Feature-specific components
│       ├── WorkOrderCard.tsx
│       └── ...
├── pages/                  # Page components
├── hooks/                  # Custom hooks
├── lib/                    # Utilities
└── types/                  # Type definitions
```

### Component Creation Checklist

When creating a new component:

- [ ] Uses shadcn/ui components where possible
- [ ] Uses semantic color tokens (no hardcoded colors)
- [ ] Uses canonical spacing patterns
- [ ] Uses Tailwind icon sizing classes
- [ ] Follows typography hierarchy
- [ ] Includes proper TypeScript types
- [ ] Has responsive design (mobile-first)
- [ ] Includes proper accessibility attributes
- [ ] Has consistent error handling
- [ ] Follows established naming conventions

### Code Review Checklist

Before submitting a PR:

- [ ] No hardcoded colors (`bg-white`, `text-gray-600`)
- [ ] No legacy icon sizing (`size={16}`)
- [ ] No custom card shells (uses `Card` component)
- [ ] No random spacing values (`gap-3`, `space-y-5`)
- [ ] Proper semantic token usage
- [ ] Consistent with existing patterns
- [ ] Accessible keyboard navigation
- [ ] Responsive design implemented
- [ ] TypeScript compliance (no errors)
- [ ] No console errors or warnings
- [ ] Performance optimized (memoization where needed)
- [ ] Proper error boundaries and fallbacks

---

## 🚨 Common Mistakes to Avoid

### Anti-Patterns

```tsx
// ❌ HARDCODED COLORS
<div className="bg-white text-gray-600 border-gray-200">

// ✅ SEMANTIC TOKENS
<div className="bg-card text-muted-foreground border-border">

// ❌ LEGACY ICON SIZING
<Icon size={16} />

// ✅ TAILWIND CLASSES
<Icon className="w-4 h-4" />

// ❌ CUSTOM CARD SHELLS
<div className="bg-muted/50 border border-border rounded-lg p-4">

// ✅ SHADCN/UI CARD
<Card>
  <CardContent>

// ❌ RANDOM SPACING
<div className="space-y-3 gap-5 p-2">

// ✅ CANONICAL SPACING
<div className="space-y-4 gap-4 p-4">

// ❌ INCONSISTENT TYPOGRAPHY
<h1 className="text-3xl">Title</h1>

// ✅ CONSISTENT HIERARCHY
<CardTitle>Title</CardTitle>  {/* text-2xl default */}
```

### Performance Mistakes

```tsx
// ❌ UNNECESSARY RE-RENDERS
const Component = ({ items }) => {
  const filteredItems = items.filter(item => item.active); // Runs every render
  
// ✅ MEMOIZED CALCULATIONS
const Component = ({ items }) => {
  const filteredItems = useMemo(
    () => items.filter(item => item.active),
    [items]
  );

// ❌ INLINE OBJECT CREATION
<Component style={{ marginTop: 16 }} />

// ✅ STABLE REFERENCES
const styles = { marginTop: 16 };
<Component style={styles} />

// ❌ ANONYMOUS FUNCTIONS IN RENDER
{items.map(item => <Item key={item.id} onClick={() => handleClick(item.id)} />)}

// ✅ MEMOIZED CALLBACKS
const handleItemClick = useCallback((id) => handleClick(id), [handleClick]);
{items.map(item => <Item key={item.id} onClick={() => handleItemClick(item.id)} />)}
```

---

## 🧪 Testing Guidelines

### Component Testing

```tsx
// ✅ PROPER TEST STRUCTURE
describe('Component', () => {
  it('renders with required props', () => {
    render(<Component title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Component title="Test" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Test'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('applies conditional styling', () => {
    render(<Component title="Test" isSelected={true} />);
    expect(screen.getByText('Test')).toHaveClass('bg-accent');
  });
});
```

### Accessibility Testing

```tsx
// ✅ ACCESSIBILITY TESTS
it('has proper keyboard navigation', () => {
  render(<Component />);
  const button = screen.getByRole('button');
  
  button.focus();
  expect(button).toHaveFocus();
  
  fireEvent.keyDown(button, { key: 'Enter' });
  // Assert expected behavior
});

it('has proper ARIA labels', () => {
  render(<Component />);
  expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
});
```

---

## 📚 Resources and References

### Documentation
- [Design System Guide](./DESIGN_SYSTEM_GUIDE.md) - Complete design system reference
- [Component Reference](./COMPONENT_REFERENCE.md) - Detailed component usage
- [shadcn/ui Documentation](https://ui.shadcn.com) - Official component docs
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Utility classes

### Tools and Utilities
- [cn() utility](./src/lib/utils.ts) - Class name merging
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [ESLint](https://eslint.org/) - Code linting
- [Prettier](https://prettier.io/) - Code formatting

### Component Libraries
- `src/components/ui/` - shadcn/ui components
- `src/components/layout/` - Custom layout components
- `src/components/` - Application components

---

## 🎯 Quick Reference

### Essential Patterns

```tsx
// Page Layout
<div className="space-y-6">
  <PageHeader title="Title" />
  <Card>
    <CardContent>
      {/* Content */}
    </CardContent>
  </Card>
</div>

// Master-Detail
<div className="flex h-screen">
  <MasterListShell>
    {/* List items */}
  </MasterListShell>
  <div className="flex-1">
    {/* Detail view */}
  </div>
</div>

// Form
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

// Empty State
<EmptyState
  icon={<Icon className="w-6 h-6" />}
  title="No data"
  description="Description"
  action={<Button>Action</Button>}
/>
```

### Color Tokens

```tsx
// Backgrounds
bg-background, bg-card, bg-muted, bg-accent, bg-primary

// Text
text-foreground, text-muted-foreground, text-primary

// Borders
border-border, border-input, border-primary
```

### Spacing Scale

```tsx
// Major sections: space-y-6, gap-6, p-6
// Standard sections: space-y-4, gap-4, p-4
// Tight grouping: gap-2, p-3
// Very tight: gap-1.5
```

### Icon Sizes

```tsx
w-4 h-4  // 16px - Small
w-5 h-5  // 20px - Standard
w-6 h-6  // 24px - Large
```

---

**Last Updated**: January 28, 2026  
**Version**: 1.0.0  
**Status**: Complete Development Guidelines