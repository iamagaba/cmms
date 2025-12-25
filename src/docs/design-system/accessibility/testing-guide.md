# Accessibility Testing Guide

This guide provides comprehensive testing procedures to ensure all components meet WCAG 2.1 AA accessibility standards.

## Automated Testing Setup

### Jest + axe-core Integration

```typescript
// setupTests.ts
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Global test configuration
beforeEach(() => {
  // Reset any global state
  document.body.innerHTML = '';
});
```

### Component Test Template

```typescript
// ComponentName.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ComponentName } from './ComponentName';

describe('ComponentName Accessibility', () => {
  test('should not have accessibility violations', async () => {
    const { container } = render(
      <ComponentName>Test content</ComponentName>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('should be keyboard navigable', async () => {
    const user = userEvent.setup();
    const mockFn = jest.fn();
    
    render(
      <ComponentName onClick={mockFn}>
        Interactive element
      </ComponentName>
    );
    
    const element = screen.getByRole('button');
    
    // Test focus
    await user.tab();
    expect(element).toHaveFocus();
    
    // Test activation
    await user.keyboard('{Enter}');
    expect(mockFn).toHaveBeenCalled();
  });
  
  test('should have proper ARIA attributes', () => {
    render(
      <ComponentName 
        aria-label="Custom label"
        disabled
      >
        Content
      </ComponentName>
    );
    
    const element = screen.getByRole('button');
    expect(element).toHaveAttribute('aria-label', 'Custom label');
    expect(element).toHaveAttribute('aria-disabled', 'true');
  });
  
  test('should announce status changes', async () => {
    const { rerender } = render(
      <ComponentName status="loading">
        Loading content
      </ComponentName>
    );
    
    // Check initial state
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Test status change
    rerender(
      <ComponentName status="success">
        Content loaded
      </ComponentName>
    );
    
    expect(screen.getByRole('status')).toHaveTextContent('Content loaded');
  });
});
```

## Manual Testing Procedures

### Keyboard Navigation Testing

#### Test Checklist
- [ ] **Tab Navigation**: All interactive elements are reachable via Tab key
- [ ] **Shift+Tab**: Reverse navigation works correctly
- [ ] **Enter/Space**: Buttons and links activate properly
- [ ] **Arrow Keys**: Navigation within components (menus, tabs, tables)
- [ ] **Escape**: Closes modals, dropdowns, and overlays
- [ ] **Home/End**: Navigates to first/last items in lists
- [ ] **Page Up/Down**: Scrolls content appropriately

#### Testing Script
```typescript
// Keyboard testing utility
export const testKeyboardNavigation = async (component: HTMLElement) => {
  const user = userEvent.setup();
  
  // Get all focusable elements
  const focusableElements = component.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  // Test tab order
  for (let i = 0; i < focusableElements.length; i++) {
    await user.tab();
    expect(focusableElements[i]).toHaveFocus();
  }
  
  // Test reverse tab order
  for (let i = focusableElements.length - 1; i >= 0; i--) {
    await user.tab({ shift: true });
    expect(focusableElements[i]).toHaveFocus();
  }
};
```

### Screen Reader Testing

#### NVDA Testing (Windows)
1. **Start NVDA**: Press Ctrl+Alt+N
2. **Navigate by headings**: H key
3. **Navigate by landmarks**: D key
4. **Navigate by buttons**: B key
5. **Navigate by form fields**: F key
6. **Read all content**: Ctrl+A, then Down arrow

#### VoiceOver Testing (macOS)
1. **Start VoiceOver**: Cmd+F5
2. **Navigate by headings**: VO+Cmd+H
3. **Navigate by landmarks**: VO+U, then Left/Right arrows
4. **Navigate by buttons**: VO+Cmd+B
5. **Navigate by form fields**: VO+Cmd+J
6. **Read all content**: VO+A

#### Testing Checklist
- [ ] **Content Order**: Information is announced in logical sequence
- [ ] **Headings**: Proper heading hierarchy (h1, h2, h3, etc.)
- [ ] **Landmarks**: Main, navigation, complementary regions are identified
- [ ] **Form Labels**: All inputs have associated labels
- [ ] **Button Labels**: All buttons have descriptive names
- [ ] **Status Updates**: Dynamic content changes are announced
- [ ] **Error Messages**: Form errors are clearly communicated
- [ ] **Table Structure**: Headers and data relationships are clear

### Color and Contrast Testing

#### Automated Contrast Checking
```typescript
// contrast-checker.test.ts
import { getContrast, hex } from 'polished';

describe('Color Contrast Compliance', () => {
  const colors = {
    steelBlue: '#1e3a8a',
    white: '#ffffff',
    gray900: '#111827',
    // ... other colors
  };
  
  test('text colors meet WCAG AA standards', () => {
    // Normal text: 4.5:1 minimum
    expect(getContrast(colors.steelBlue, colors.white)).toBeGreaterThan(4.5);
    
    // Large text: 3:1 minimum
    expect(getContrast(colors.gray900, colors.white)).toBeGreaterThan(3);
  });
  
  test('interactive elements have sufficient contrast', () => {
    // Focus indicators
    expect(getContrast('#2563eb', colors.white)).toBeGreaterThan(3);
    
    // Button states
    expect(getContrast('#1d4ed8', colors.white)).toBeGreaterThan(4.5);
  });
});
```

#### Manual Contrast Testing
1. **Use browser dev tools**: Inspect element → Accessibility panel
2. **Color Contrast Analyzer**: Desktop application for precise measurements
3. **WebAIM Contrast Checker**: Online tool for quick verification
4. **Lighthouse audit**: Automated contrast checking in Chrome

### Mobile and Touch Testing

#### Touch Target Testing
```typescript
// touch-target.test.ts
describe('Touch Target Accessibility', () => {
  test('interactive elements meet minimum size requirements', () => {
    render(<Button>Touch me</Button>);
    
    const button = screen.getByRole('button');
    const styles = getComputedStyle(button);
    
    // Minimum 44px x 44px
    expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
    expect(parseInt(styles.minWidth)).toBeGreaterThanOrEqual(44);
  });
  
  test('touch targets have adequate spacing', () => {
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
      </div>
    );
    
    const buttons = screen.getAllByRole('button');
    const firstRect = buttons[0].getBoundingClientRect();
    const secondRect = buttons[1].getBoundingClientRect();
    
    // Minimum 8px spacing between targets
    const spacing = secondRect.top - (firstRect.top + firstRect.height);
    expect(spacing).toBeGreaterThanOrEqual(8);
  });
});
```

#### Responsive Testing Checklist
- [ ] **320px width**: Content reflows without horizontal scrolling
- [ ] **Zoom to 200%**: All functionality remains available
- [ ] **Touch targets**: Minimum 44px x 44px size
- [ ] **Spacing**: Adequate space between interactive elements
- [ ] **Font size**: Minimum 16px to prevent zoom on iOS

## Continuous Integration Setup

### GitHub Actions Workflow
```yaml
# .github/workflows/accessibility.yml
name: Accessibility Testing

on: [push, pull_request]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run accessibility tests
        run: npm run test:a11y
      
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
      
      - name: Upload accessibility report
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: accessibility-report
          path: accessibility-report.html
```

### Package.json Scripts
```json
{
  "scripts": {
    "test:a11y": "jest --testPathPattern=a11y",
    "test:contrast": "node scripts/contrast-checker.js",
    "lighthouse": "lighthouse http://localhost:3000 --only-categories=accessibility --output=html --output-path=./accessibility-report.html"
  }
}
```

## Component-Specific Testing

### Form Components
```typescript
describe('Form Accessibility', () => {
  test('form fields have proper labels', () => {
    render(
      <FormField label="Email Address" required>
        <input type="email" />
      </FormField>
    );
    
    const input = screen.getByLabelText(/email address/i);
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('type', 'email');
  });
  
  test('error messages are associated with fields', () => {
    render(
      <FormField 
        label="Password" 
        error="Password must be at least 8 characters"
      >
        <input type="password" />
      </FormField>
    );
    
    const input = screen.getByLabelText(/password/i);
    const errorMessage = screen.getByText(/password must be at least 8 characters/i);
    
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
    expect(errorMessage).toHaveAttribute('role', 'alert');
  });
});
```

### Navigation Components
```typescript
describe('Navigation Accessibility', () => {
  test('navigation has proper landmarks', () => {
    render(<Sidebar />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });
  
  test('current page is indicated', () => {
    render(<NavigationItem href="/dashboard" current>Dashboard</NavigationItem>);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-current', 'page');
  });
});
```

### Data Display Components
```typescript
describe('Data Table Accessibility', () => {
  test('table has proper structure', () => {
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns}
        caption="Work Orders List"
      />
    );
    
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Work Orders List')).toBeInTheDocument();
    
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(mockColumns.length);
  });
  
  test('sortable columns are keyboard accessible', async () => {
    const user = userEvent.setup();
    
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns}
        sortable
      />
    );
    
    const header = screen.getByRole('columnheader', { name: /name/i });
    
    await user.click(header);
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    
    // Test keyboard activation
    header.focus();
    await user.keyboard('{Enter}');
    expect(header).toHaveAttribute('aria-sort', 'descending');
  });
});
```

## Performance Testing

### Bundle Size Impact
```typescript
// bundle-analyzer.test.ts
describe('Accessibility Bundle Impact', () => {
  test('accessibility features do not significantly increase bundle size', () => {
    const bundleStats = require('../dist/bundle-stats.json');
    const a11yModules = bundleStats.modules.filter(
      module => module.name.includes('a11y') || module.name.includes('accessibility')
    );
    
    const totalA11ySize = a11yModules.reduce((sum, module) => sum + module.size, 0);
    const totalBundleSize = bundleStats.assets.reduce((sum, asset) => sum + asset.size, 0);
    
    // Accessibility features should be less than 5% of total bundle
    expect(totalA11ySize / totalBundleSize).toBeLessThan(0.05);
  });
});
```

### Runtime Performance
```typescript
// performance.test.ts
describe('Accessibility Performance', () => {
  test('focus management does not cause performance issues', async () => {
    const startTime = performance.now();
    
    render(<ComplexForm />);
    
    // Simulate rapid focus changes
    const inputs = screen.getAllByRole('textbox');
    for (const input of inputs) {
      input.focus();
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Focus operations should complete within reasonable time
    expect(duration).toBeLessThan(1000); // 1 second
  });
});
```

## Reporting and Documentation

### Test Report Generation
```typescript
// generate-a11y-report.js
const fs = require('fs');
const path = require('path');

const generateAccessibilityReport = (testResults) => {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: testResults.length,
      passed: testResults.filter(t => t.status === 'passed').length,
      failed: testResults.filter(t => t.status === 'failed').length,
    },
    details: testResults,
    recommendations: generateRecommendations(testResults)
  };
  
  const reportPath = path.join(__dirname, '../reports/accessibility-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`Accessibility report generated: ${reportPath}`);
};
```

### Component Documentation Template
```markdown
## Accessibility Features

### Keyboard Navigation
- **Tab**: Moves focus to the component
- **Enter/Space**: Activates the component
- **Escape**: Closes any open overlays

### Screen Reader Support
- **Role**: `button`
- **Label**: Provided via `aria-label` or text content
- **State**: `aria-pressed` for toggle buttons

### ARIA Attributes
- `aria-label`: Accessible name when text is not descriptive
- `aria-describedby`: References help text or error messages
- `aria-disabled`: Indicates disabled state

### Color and Contrast
- All color combinations meet WCAG AA standards (4.5:1 for normal text)
- Information is not conveyed through color alone
- Focus indicators are clearly visible

### Testing
```typescript
// Example accessibility test
test('Button is accessible', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```
```

This comprehensive testing guide ensures that all components meet accessibility standards and provides clear procedures for ongoing validation.