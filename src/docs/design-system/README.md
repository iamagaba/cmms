# Professional CMMS Design System Documentation

## Overview

The Professional CMMS Design System is a comprehensive visual and interaction framework that establishes a distinctive, professional identity for the maintenance management application. This design system moves beyond generic business application aesthetics by incorporating industrial-inspired visual elements, maintenance-specific iconography, and sophisticated interaction patterns.

## Quick Start

```typescript
import { 
  professionalDesignTokens,
  professionalColors,
  professionalTypography,
  professionalSpacing 
} from '@/theme';

// Use design tokens in your components
const MyComponent = () => (
  <div 
    style={{
      color: professionalColors.steelBlue[600],
      fontSize: professionalTypography.fontSizes.lg.fontSize,
      padding: professionalSpacing.scale[4]
    }}
  >
    Professional CMMS Component
  </div>
);
```

## Architecture

### Design Token Architecture

The design system follows a three-tier token architecture:

1. **Primitive Tokens**: Base values (colors, spacing units, font sizes)
2. **Semantic Tokens**: Contextual meanings (primary, success, warning, error)
3. **Component Tokens**: Component-specific values (button-padding, card-shadow)

```
Primitive Tokens → Semantic Tokens → Component Tokens → Components
```

### Theme System

The architecture supports multiple theme layers:
- **Base Theme**: Core visual foundation
- **Brand Theme**: Customizable brand colors and typography
- **Density Theme**: Spacing and sizing variations
- **Mode Theme**: Light/dark mode variations

## Design Tokens

### Colors

The color system is built around industrial and maintenance themes:

- **Steel Blue**: Primary brand color inspired by industrial machinery
- **Safety Orange**: Accent color for important actions and alerts
- **Machinery Gray**: Neutral colors for backgrounds and text
- **Success Green**: For positive states and confirmations
- **Warning Red**: For errors and critical alerts
- **Maintenance Yellow**: For warnings and caution states

### Typography

Professional typography system optimized for maintenance applications:

- **Font Family**: Inter (primary), system fonts (fallback)
- **Scale**: Consistent type scale from xs (12px) to 4xl (36px)
- **Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)
- **Line Heights**: Optimized for readability and scanning

### Spacing

Consistent spacing system based on 4px grid:

- **Base Unit**: 4px
- **Scale**: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
- **Semantic Spacing**: Component-specific spacing tokens

## Components

### Layout Components

- [AppLayout](./components/AppLayout.md) - Main application shell
- [PageHeader](./components/PageHeader.md) - Consistent page headers
- [Sidebar](./components/Sidebar.md) - Navigation sidebar
- [Grid](./components/Grid.md) - Responsive grid system

### Navigation Components

- [NavigationItem](./components/NavigationItem.md) - Navigation links
- [Breadcrumbs](./components/Breadcrumbs.md) - Hierarchical navigation
- [Tabs](./components/Tabs.md) - Content organization
- [Pagination](./components/Pagination.md) - Data navigation

### Data Display Components

- [DataTable](./components/DataTable.md) - Advanced data tables
- [Card](./components/Card.md) - Content containers
- [Badge](./components/Badge.md) - Status indicators
- [MetricCard](./components/MetricCard.md) - KPI displays

### Input Components

- [Button](./components/Button.md) - Primary interaction elements
- [Input](./components/Input.md) - Text input fields
- [Select](./components/Select.md) - Dropdown selections
- [Checkbox](./components/Checkbox.md) - Boolean selections
- [RadioGroup](./components/RadioGroup.md) - Single selections

### Feedback Components

- [Alert](./components/Alert.md) - System messages
- [Toast](./components/Toast.md) - Temporary notifications
- [Modal](./components/Modal.md) - Overlay dialogs
- [LoadingSpinner](./components/LoadingSpinner.md) - Activity indicators

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

### Theme Configuration

```typescript
interface ThemeConfig {
  mode: 'light' | 'dark';
  density: 'compact' | 'comfortable' | 'spacious';
  primaryColor: keyof typeof professionalColors;
  borderRadius: 'sharp' | 'rounded' | 'soft';
}
```

### CSS Custom Properties

The system uses CSS custom properties for dynamic theming:

```css
:root {
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;
  --spacing-base: 16px;
  --font-size-base: 16px;
}
```

## Implementation Guidelines

### Component Development

1. **Use Design Tokens**: Always use design tokens instead of hardcoded values
2. **Follow Patterns**: Implement consistent API patterns across components
3. **Include States**: Define all interactive states (hover, focus, active, disabled)
4. **Add Accessibility**: Include proper ARIA labels and keyboard navigation
5. **Test Thoroughly**: Validate with both unit tests and property-based tests

### Best Practices

- Use semantic color tokens for status and meaning
- Implement responsive behavior with mobile-first approach
- Follow the component composition patterns
- Maintain consistent spacing and typography
- Test accessibility with automated tools

## Testing

The design system includes comprehensive testing:

- **Unit Tests**: Component rendering and behavior
- **Property-Based Tests**: Universal properties across all inputs
- **Accessibility Tests**: WCAG compliance validation
- **Visual Regression Tests**: Component appearance consistency

## Migration Guide

For migrating existing components to the design system:

1. Replace hardcoded colors with design tokens
2. Update spacing to use the consistent scale
3. Apply typography tokens for text styling
4. Implement proper interactive states
5. Add accessibility attributes
6. Test with the automated test suite

## Contributing

When contributing to the design system:

1. Follow the established token architecture
2. Maintain consistency with existing patterns
3. Include comprehensive documentation
4. Add appropriate tests
5. Validate accessibility compliance
6. Update this documentation as needed

## Resources

- [Design Tokens Reference](./tokens/README.md)
- [Component API Reference](./components/README.md)
- [Accessibility Guidelines](./accessibility/README.md)
- [Testing Guide](./testing/README.md)
- [Migration Guide](./migration/README.md)