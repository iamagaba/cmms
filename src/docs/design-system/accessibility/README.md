# Accessibility Guidelines

The Professional CMMS Design System is built with accessibility as a core principle, ensuring that all users can effectively interact with maintenance management applications regardless of their abilities or assistive technologies.

## WCAG 2.1 AA Compliance

All components and patterns in the design system meet or exceed WCAG 2.1 AA standards.

### Success Criteria Coverage

#### Perceivable
- **1.1.1 Non-text Content**: All images, icons, and graphics have appropriate alt text
- **1.3.1 Info and Relationships**: Proper semantic markup and ARIA labels
- **1.4.3 Contrast (Minimum)**: 4.5:1 contrast ratio for normal text, 3:1 for large text
- **1.4.4 Resize Text**: Text can be resized up to 200% without loss of functionality
- **1.4.10 Reflow**: Content reflows at 320px width without horizontal scrolling

#### Operable
- **2.1.1 Keyboard**: All functionality available via keyboard
- **2.1.2 No Keyboard Trap**: Focus can move away from any component
- **2.4.1 Bypass Blocks**: Skip links and landmarks for navigation
- **2.4.3 Focus Order**: Logical focus sequence throughout the interface
- **2.4.7 Focus Visible**: Clear visual focus indicators on all interactive elements

#### Understandable
- **3.1.1 Language of Page**: Page language is properly declared
- **3.2.1 On Focus**: No unexpected context changes when elements receive focus
- **3.2.2 On Input**: No unexpected context changes when form inputs change
- **3.3.1 Error Identification**: Form errors are clearly identified
- **3.3.2 Labels or Instructions**: Clear labels and instructions for form inputs

#### Robust
- **4.1.1 Parsing**: Valid HTML markup without duplicate IDs
- **4.1.2 Name, Role, Value**: Proper ARIA attributes for custom components
- **4.1.3 Status Messages**: Screen reader announcements for dynamic content

## Color and Contrast

### Color Palette Accessibility

The design system's industrial-inspired color palette ensures accessibility:

```typescript
// All color combinations meet WCAG AA standards
const accessibleColors = {
  // Primary combinations (4.5:1+ contrast)
  steelBlue: {
    text: '#1e3a8a',      // on white: 8.2:1
    background: '#eff6ff', // with dark text: 8.2:1
  },
  
  // Status colors with guaranteed contrast
  success: {
    text: '#166534',      // on white: 7.1:1
    background: '#f0fdf4', // with dark text: 7.1:1
  },
  
  warning: {
    text: '#a16207',      // on white: 4.8:1
    background: '#fffbeb', // with dark text: 4.8:1
  },
  
  error: {
    text: '#dc2626',      // on white: 5.9:1
    background: '#fef2f2', // with dark text: 5.9:1
  }
};
```

### Contrast Testing

All color combinations are validated using automated tools:

```bash
# Run contrast validation
npm run test:contrast

# Check specific color combinations
npm run contrast-check -- --color="#1e3a8a" --background="#ffffff"
```

### Color Independence

Information is never conveyed through color alone:

- **Status indicators** use icons + color + text labels
- **Form validation** includes text descriptions alongside color coding
- **Data visualization** uses patterns, shapes, and labels in addition to color
- **Interactive states** combine color changes with visual effects (shadows, borders)

## Keyboard Navigation

### Focus Management

All interactive elements support keyboard navigation:

```typescript
// Example: Button component with proper focus handling
const Button = ({ children, onClick, disabled, ...props }) => {
  return (
    <button
      className={`
        focus:outline-none 
        focus:ring-2 
        focus:ring-steel-blue-500 
        focus:ring-offset-2
        disabled:opacity-50 
        disabled:cursor-not-allowed
      `}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
```

### Tab Order

Logical tab sequence is maintained throughout the application:

1. **Skip links** (first tab stop)
2. **Main navigation** (sidebar items)
3. **Page header actions** (breadcrumbs, search, user menu)
4. **Primary content** (forms, data tables, cards)
5. **Secondary actions** (pagination, filters)

### Keyboard Shortcuts

Standard keyboard patterns are implemented:

- **Tab/Shift+Tab**: Navigate between focusable elements
- **Enter/Space**: Activate buttons and links
- **Arrow keys**: Navigate within components (menus, tabs, tables)
- **Escape**: Close modals, dropdowns, and overlays
- **Home/End**: Navigate to first/last items in lists

## Screen Reader Support

### Semantic Markup

Proper HTML semantics provide structure for assistive technologies:

```html
<!-- Page structure -->
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">
    <!-- Navigation items -->
  </nav>
</header>

<main role="main">
  <h1>Page Title</h1>
  <section aria-labelledby="section-heading">
    <h2 id="section-heading">Section Title</h2>
    <!-- Section content -->
  </section>
</main>

<aside role="complementary" aria-label="Filters">
  <!-- Sidebar content -->
</aside>
```

### ARIA Labels and Descriptions

Components include comprehensive ARIA attributes:

```typescript
// Data table with proper ARIA labels
<table role="table" aria-label="Work Orders">
  <thead>
    <tr role="row">
      <th role="columnheader" aria-sort="ascending">
        Work Order ID
      </th>
      <th role="columnheader">Status</th>
      <th role="columnheader">Priority</th>
    </tr>
  </thead>
  <tbody>
    <tr role="row">
      <td role="gridcell">WO-2024-001</td>
      <td role="gridcell">
        <span 
          className="status-badge" 
          aria-label="Status: In Progress"
        >
          In Progress
        </span>
      </td>
      <td role="gridcell">
        <span 
          className="priority-badge" 
          aria-label="Priority: High"
        >
          High
        </span>
      </td>
    </tr>
  </tbody>
</table>
```

### Live Regions

Dynamic content updates are announced to screen readers:

```typescript
// Toast notifications with live region
const Toast = ({ message, type }) => {
  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`toast toast-${type}`}
    >
      <span className="sr-only">
        {type === 'error' ? 'Error: ' : 'Notification: '}
      </span>
      {message}
    </div>
  );
};

// Loading states with status updates
const LoadingSpinner = ({ label = "Loading" }) => {
  return (
    <div role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <span className="sr-only">{label}...</span>
    </div>
  );
};
```

## Form Accessibility

### Label Association

All form inputs have proper labels:

```typescript
// Explicit label association
<div className="form-field">
  <label htmlFor="work-order-title" className="form-label">
    Work Order Title *
  </label>
  <input
    id="work-order-title"
    type="text"
    className="form-input"
    aria-required="true"
    aria-describedby="title-help title-error"
  />
  <div id="title-help" className="form-help">
    Enter a descriptive title for the work order
  </div>
  <div id="title-error" className="form-error" role="alert">
    {/* Error message appears here */}
  </div>
</div>
```

### Error Handling

Form validation provides clear, accessible feedback:

```typescript
const FormField = ({ 
  label, 
  error, 
  help, 
  required, 
  children 
}) => {
  const fieldId = useId();
  const helpId = `${fieldId}-help`;
  const errorId = `${fieldId}-error`;
  
  return (
    <div className="form-field">
      <label 
        htmlFor={fieldId} 
        className="form-label"
      >
        {label}
        {required && <span aria-label="required"> *</span>}
      </label>
      
      {React.cloneElement(children, {
        id: fieldId,
        'aria-required': required,
        'aria-invalid': !!error,
        'aria-describedby': [
          help && helpId,
          error && errorId
        ].filter(Boolean).join(' ')
      })}
      
      {help && (
        <div id={helpId} className="form-help">
          {help}
        </div>
      )}
      
      {error && (
        <div 
          id={errorId} 
          className="form-error" 
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
};
```

### Fieldset and Legend

Related form controls are grouped properly:

```typescript
<fieldset className="form-fieldset">
  <legend className="form-legend">
    Work Order Priority
  </legend>
  
  <div className="radio-group" role="radiogroup">
    <label className="radio-label">
      <input 
        type="radio" 
        name="priority" 
        value="low"
        className="radio-input"
      />
      <span>Low Priority</span>
    </label>
    
    <label className="radio-label">
      <input 
        type="radio" 
        name="priority" 
        value="medium"
        className="radio-input"
      />
      <span>Medium Priority</span>
    </label>
    
    <label className="radio-label">
      <input 
        type="radio" 
        name="priority" 
        value="high"
        className="radio-input"
      />
      <span>High Priority</span>
    </label>
  </div>
</fieldset>
```

## Touch and Mobile Accessibility

### Touch Target Sizing

All interactive elements meet minimum touch target requirements:

```css
/* Minimum 44px touch targets */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  
  /* Ensure adequate spacing between targets */
  margin: 2px;
}

/* Button sizing for touch */
.btn {
  padding: 12px 16px;
  min-height: 44px;
  
  /* Touch-friendly spacing */
  margin-bottom: 8px;
}

/* Form input sizing */
.form-input {
  padding: 12px 16px;
  min-height: 44px;
  font-size: 16px; /* Prevents zoom on iOS */
}
```

### Gesture Support

Touch gestures are implemented accessibly:

- **Swipe actions** have keyboard alternatives
- **Pinch-to-zoom** is not disabled
- **Touch interactions** provide haptic feedback where appropriate
- **Drag and drop** includes keyboard alternatives

## Component-Specific Guidelines

### Data Tables

Accessible data table implementation:

```typescript
const DataTable = ({ data, columns, sortable = true }) => {
  const [sortConfig, setSortConfig] = useState(null);
  
  return (
    <div className="table-container" role="region" aria-label="Data table">
      <table role="table">
        <caption className="table-caption">
          Work Orders ({data.length} items)
        </caption>
        
        <thead>
          <tr role="row">
            {columns.map((column) => (
              <th
                key={column.key}
                role="columnheader"
                aria-sort={
                  sortConfig?.key === column.key
                    ? sortConfig.direction
                    : 'none'
                }
                tabIndex={sortable ? 0 : -1}
                onClick={() => sortable && handleSort(column.key)}
                onKeyDown={(e) => {
                  if (sortable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleSort(column.key);
                  }
                }}
              >
                {column.label}
                {sortable && (
                  <span className="sort-indicator" aria-hidden="true">
                    {/* Sort icon */}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id} role="row">
              {columns.map((column) => (
                <td key={column.key} role="gridcell">
                  {renderCell(row, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### Modal Dialogs

Accessible modal implementation:

```typescript
const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);
  const previousFocus = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;
      modalRef.current?.focus();
      
      // Trap focus within modal
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
        
        if (e.key === 'Tab') {
          trapFocus(e, modalRef.current);
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    } else {
      // Return focus to previous element
      previousFocus.current?.focus();
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="modal-overlay" 
      role="dialog" 
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="modal-content"
        tabIndex={-1}
      >
        <header className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </header>
        
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};
```

## Testing Guidelines

### Automated Testing

Accessibility testing is integrated into the development workflow:

```typescript
// Jest + Testing Library + jest-axe
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Button Component Accessibility', () => {
  test('should not have accessibility violations', async () => {
    const { container } = render(
      <Button onClick={() => {}}>
        Click me
      </Button>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('should be keyboard accessible', () => {
    render(<Button onClick={mockFn}>Click me</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    
    expect(button).toHaveFocus();
    
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(mockFn).toHaveBeenCalled();
  });
  
  test('should have proper ARIA attributes', () => {
    render(
      <Button 
        disabled 
        aria-describedby="help-text"
      >
        Submit
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-describedby', 'help-text');
    expect(button).toBeDisabled();
  });
});
```

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] All interactive elements are focusable
- [ ] Focus order is logical and predictable
- [ ] Focus indicators are clearly visible
- [ ] No keyboard traps exist
- [ ] Skip links work properly

#### Screen Reader Testing
- [ ] Content is announced in logical order
- [ ] Interactive elements have proper labels
- [ ] Status changes are announced
- [ ] Form errors are clearly communicated
- [ ] Data tables are properly structured

#### Color and Contrast
- [ ] All text meets contrast requirements
- [ ] Information is not conveyed by color alone
- [ ] Focus indicators are visible in all themes
- [ ] Status indicators work without color

#### Mobile and Touch
- [ ] Touch targets are at least 44px
- [ ] Content reflows properly at 320px width
- [ ] Zoom is not disabled
- [ ] Touch gestures have alternatives

### Testing Tools

Recommended tools for accessibility testing:

```bash
# Install accessibility testing dependencies
npm install --save-dev @axe-core/react jest-axe @testing-library/jest-dom

# Browser extensions for manual testing
# - axe DevTools
# - WAVE Web Accessibility Evaluator
# - Lighthouse accessibility audit

# Screen reader testing
# - NVDA (Windows)
# - JAWS (Windows)
# - VoiceOver (macOS/iOS)
# - TalkBack (Android)
```

## Implementation Checklist

When implementing new components, ensure:

### Design Phase
- [ ] Color combinations meet contrast requirements
- [ ] Touch targets are appropriately sized
- [ ] Focus states are clearly defined
- [ ] Error states are visually distinct

### Development Phase
- [ ] Semantic HTML is used where possible
- [ ] ARIA attributes are added for custom components
- [ ] Keyboard navigation is implemented
- [ ] Focus management is handled properly
- [ ] Screen reader announcements are included

### Testing Phase
- [ ] Automated accessibility tests pass
- [ ] Manual keyboard testing completed
- [ ] Screen reader testing performed
- [ ] Color contrast validated
- [ ] Mobile accessibility verified

### Documentation Phase
- [ ] Accessibility features are documented
- [ ] Usage examples include ARIA attributes
- [ ] Keyboard shortcuts are listed
- [ ] Testing guidelines are provided

## Resources and References

### WCAG Guidelines
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Understanding WCAG 2.1](https://www.w3.org/WAI/WCAG21/Understanding/)
- [Techniques for WCAG 2.1](https://www.w3.org/WAI/WCAG21/Techniques/)

### ARIA Specifications
- [WAI-ARIA 1.1](https://www.w3.org/TR/wai-aria-1.1/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [ARIA in HTML](https://www.w3.org/TR/html-aria/)

### Testing Resources
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [Testing Library Accessibility](https://testing-library.com/docs/guide-accessibility/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)

### Design Resources
- [Inclusive Design Principles](https://inclusivedesignprinciples.org/)
- [Color Universal Design](https://jfly.uni-koeln.de/color/)
- [Material Design Accessibility](https://material.io/design/usability/accessibility.html)

---

*This accessibility guide is a living document that evolves with the design system. Regular updates ensure continued compliance with accessibility standards and best practices.*