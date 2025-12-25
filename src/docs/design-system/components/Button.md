# Button Component

The Button component is the primary interactive element in the Professional CMMS Design System, designed for maintenance management workflows with industrial-inspired styling.

## Overview

Buttons provide users with a way to trigger actions and navigate through the application. The design system includes multiple button variants optimized for different contexts and importance levels.

## API Reference

### Props

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}
```

### Variants

#### Primary
The primary button uses the steel blue color and is used for the most important actions.

```tsx
<Button variant="primary">Save Work Order</Button>
```

#### Secondary
Secondary buttons use a lighter styling for less prominent actions.

```tsx
<Button variant="secondary">Cancel</Button>
```

#### Outline
Outline buttons provide a subtle option for secondary actions.

```tsx
<Button variant="outline">View Details</Button>
```

#### Ghost
Ghost buttons are the most subtle option, often used in toolbars.

```tsx
<Button variant="ghost">Edit</Button>
```

#### Danger
Danger buttons use warning red for destructive actions.

```tsx
<Button variant="danger">Delete Work Order</Button>
```

### Sizes

#### Small (sm)
Compact buttons for dense interfaces and secondary actions.

```tsx
<Button size="sm">Quick Action</Button>
```

#### Medium (md) - Default
Standard button size for most use cases.

```tsx
<Button size="md">Standard Action</Button>
```

#### Large (lg)
Larger buttons for primary actions and mobile interfaces.

```tsx
<Button size="lg">Primary Action</Button>
```

### States

#### Loading
Shows a spinner and disables interaction during async operations.

```tsx
<Button loading={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>
```

#### Disabled
Prevents interaction and shows disabled styling.

```tsx
<Button disabled>Unavailable Action</Button>
```

#### Full Width
Stretches to fill the available width.

```tsx
<Button fullWidth>Full Width Button</Button>
```

## Usage Examples

### Basic Usage

```tsx
import { Button } from '@/components/ui/Button';

function WorkOrderForm() {
  const handleSave = () => {
    // Save work order logic
  };

  return (
    <div>
      <Button variant="primary" onClick={handleSave}>
        Save Work Order
      </Button>
      <Button variant="secondary">
        Cancel
      </Button>
    </div>
  );
}
```

### Form Submission

```tsx
function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button 
        type="submit" 
        variant="primary" 
        loading={isLoading}
        fullWidth
      >
        Sign In
      </Button>
    </form>
  );
}
```

### Button Groups

```tsx
function ActionGroup() {
  return (
    <div className="flex gap-2">
      <Button variant="primary">Save</Button>
      <Button variant="outline">Save & Continue</Button>
      <Button variant="ghost">Cancel</Button>
    </div>
  );
}
```

## Design Tokens

The Button component uses the following design tokens:

### Colors
- Primary: `professionalColors.steelBlue[600]`
- Secondary: `professionalColors.machineryGray[100]`
- Danger: `professionalColors.warningRed[600]`
- Text: `professionalColors.machineryGray[900]`

### Spacing
- Padding Small: `professionalSpacing.scale[2] professionalSpacing.scale[3]`
- Padding Medium: `professionalSpacing.scale[3] professionalSpacing.scale[4]`
- Padding Large: `professionalSpacing.scale[4] professionalSpacing.scale[6]`

### Typography
- Small: `professionalTypography.fontSizes.sm`
- Medium: `professionalTypography.fontSizes.base`
- Large: `professionalTypography.fontSizes.lg`

## Accessibility

The Button component includes comprehensive accessibility features:

### Keyboard Navigation
- **Tab**: Navigate to the button
- **Enter/Space**: Activate the button
- **Escape**: Remove focus (when appropriate)

### Screen Reader Support
- Proper button semantics with `<button>` element
- Loading state announced with `aria-busy`
- Disabled state properly communicated
- Descriptive text for icon-only buttons

### Focus Management
- Clear focus indicators meeting WCAG contrast requirements
- Focus visible on keyboard navigation
- Focus removed when button becomes disabled

### Touch Targets
- Minimum 44px × 44px touch target on mobile
- Adequate spacing between adjacent buttons
- Touch-friendly sizing for all variants

## Implementation

### CSS Classes

```css
/* Base button styles */
.btn {
  @apply inline-flex items-center justify-center;
  @apply font-medium rounded-md transition-colors;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Variant styles */
.btn-primary {
  @apply bg-steel-600 text-white hover:bg-steel-700;
  @apply focus:ring-steel-500;
}

.btn-secondary {
  @apply bg-machinery-100 text-machinery-900 hover:bg-machinery-200;
  @apply focus:ring-machinery-500;
}

/* Size styles */
.btn-sm {
  @apply px-3 py-2 text-sm;
}

.btn-md {
  @apply px-4 py-2 text-base;
}

.btn-lg {
  @apply px-6 py-3 text-lg;
}
```

### React Implementation

```tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    disabled = false,
    loading = false,
    fullWidth = false,
    children, 
    className,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          'btn',
          `btn-${variant}`,
          `btn-${size}`,
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && <LoadingSpinner size="sm" className="mr-2" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
```

## Testing

### Unit Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('shows loading state correctly', () => {
    render(<Button loading>Loading</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
  });
});
```

### Property-Based Tests

```tsx
import fc from 'fast-check';
import { render } from '@testing-library/react';
import { Button } from './Button';

describe('Button Property Tests', () => {
  it('should always render as a button element', () => {
    fc.assert(fc.property(
      fc.record({
        variant: fc.constantFrom('primary', 'secondary', 'outline', 'ghost', 'danger'),
        size: fc.constantFrom('sm', 'md', 'lg'),
        disabled: fc.boolean(),
        loading: fc.boolean(),
      }),
      (props) => {
        const { container } = render(<Button {...props}>Test</Button>);
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
      }
    ));
  });
});
```

## Common Patterns

### Confirmation Dialogs

```tsx
function DeleteConfirmation({ onConfirm, onCancel }) {
  return (
    <div className="flex gap-2 justify-end">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant="danger" onClick={onConfirm}>
        Delete
      </Button>
    </div>
  );
}
```

### Form Actions

```tsx
function FormActions({ onSave, onCancel, isSaving }) {
  return (
    <div className="flex gap-2">
      <Button 
        variant="primary" 
        onClick={onSave}
        loading={isSaving}
      >
        Save
      </Button>
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
```

### Toolbar Actions

```tsx
function Toolbar() {
  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="sm">Edit</Button>
      <Button variant="ghost" size="sm">Copy</Button>
      <Button variant="ghost" size="sm">Delete</Button>
    </div>
  );
}
```

## Related Components

- [LoadingSpinner](./LoadingSpinner.md) - Used in loading state
- [Icon](./Icon.md) - Often used with buttons
- [ButtonGroup](./ButtonGroup.md) - For grouping related buttons
- [DropdownButton](./DropdownButton.md) - Button with dropdown menu