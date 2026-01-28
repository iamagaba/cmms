# shadcn/ui Aesthetic Compliance - Requirements

## Overview

Audit and refine the desktop CMMS application (`src/`) to fully embrace the shadcn/ui design aesthetic with Nova-style refinements. The goal is to ensure the UI matches the modern, polished, and accessible design language that shadcn/ui provides out of the box.

## Problem Statement

After reviewing the current implementation, several areas deviate from shadcn/ui best practices:

1. **Over-customization**: Many components override shadcn/ui defaults unnecessarily (e.g., `p-3` instead of `p-4`, `h-7`/`h-8` instead of default button sizes)
2. **Inconsistent spacing**: Mix of compact utilities (`p-compact`, `gap-compact`) alongside standard Tailwind spacing
3. **Typography inconsistencies**: Frequent use of `text-xs` and `text-sm` where shadcn/ui defaults would be more appropriate
4. **Custom badge styling**: Inline color classes instead of using shadcn/ui badge variants
5. **Icon sizing variations**: Inconsistent icon sizes (10px, 12px, 13px, 14px, 16px) instead of standard sizes
6. **Missing shadcn/ui patterns**: Not fully leveraging CardTitle, CardDescription, and other semantic components

## Goals

1. **Trust shadcn/ui defaults** - Use components as designed without unnecessary overrides
2. **Consistent spacing** - Follow shadcn/ui's spacing scale (p-4, p-6, gap-4, etc.)
3. **Proper typography hierarchy** - Use CardTitle (text-2xl), text-sm for body, text-xs for captions
4. **Standard icon sizes** - Consistently use w-4 h-4 (16px) and w-5 h-5 (20px)
5. **Semantic components** - Properly use CardHeader, CardTitle, CardDescription, CardContent
6. **Clean badge usage** - Use badge variants instead of inline color classes
7. **Modern polish** - Embrace shadow-sm, rounded-lg, and other shadcn/ui aesthetic choices

## User Stories

### 1. As a developer, I want components to use shadcn/ui defaults
**Acceptance Criteria:**
- 1.1 Card components use default padding (p-6 for CardContent, p-4 for CardHeader)
- 1.2 Button components use default sizes (h-9 for default, h-8 for sm, h-10 for lg)
- 1.3 Input components use default height (h-9)
- 1.4 Components use rounded-lg (8px) for border radius
- 1.5 Cards use shadow-sm for subtle elevation

### 2. As a developer, I want consistent typography hierarchy
**Acceptance Criteria:**
- 2.1 Page titles use text-2xl font-bold
- 2.2 Section headers use text-lg font-semibold
- 2.3 Card titles use CardTitle component (text-2xl default)
- 2.4 Body text uses text-sm (14px)
- 2.5 Secondary text uses text-sm text-muted-foreground
- 2.6 Captions and metadata use text-xs (12px)
- 2.7 No arbitrary font sizes (text-[10px], text-[9px], etc.)

### 3. As a developer, I want consistent icon sizing
**Acceptance Criteria:**
- 3.1 Standard icons use w-5 h-5 (20px)
- 3.2 Small inline icons use w-4 h-4 (16px)
- 3.3 Large header icons use w-6 h-6 (24px)
- 3.4 No arbitrary icon sizes (size={10}, size={13}, size={14}, etc.)
- 3.5 Icons in buttons automatically sized via [&_svg]:size-4

### 4. As a developer, I want proper spacing scale
**Acceptance Criteria:**
- 4.1 Remove custom compact utilities (p-compact, gap-compact, space-y-compact)
- 4.2 Use standard Tailwind spacing (p-4, p-6, gap-4, gap-6, space-y-4, space-y-6)
- 4.3 Card padding uses p-6 for comfortable spacing
- 4.4 Section spacing uses space-y-6 or gap-6
- 4.5 Form field spacing uses space-y-4

### 5. As a developer, I want semantic component usage
**Acceptance Criteria:**
- 5.1 Cards use CardHeader + CardTitle + CardDescription structure
- 5.2 CardContent wraps main content with default p-6
- 5.3 Dialogs use DialogHeader + DialogTitle + DialogDescription
- 5.4 Forms use FormField + FormItem + FormLabel + FormControl structure
- 5.5 Tables use Table + TableHeader + TableBody + TableRow + TableCell

### 6. As a developer, I want clean badge implementation
**Acceptance Criteria:**
- 6.1 Status badges use StatusBadge helper or badge variants
- 6.2 Priority badges use PriorityBadge helper or badge variants
- 6.3 No inline color classes (bg-emerald-50 text-emerald-700 border-emerald-200)
- 6.4 Badge variants defined in badge.tsx for reusability
- 6.5 Consistent badge styling across all pages

### 7. As a developer, I want CSS variable-based theming
**Acceptance Criteria:**
- 7.1 Colors use CSS variables (bg-primary, text-primary-foreground, etc.)
- 7.2 No hardcoded color values (bg-purple-600, text-blue-700, etc.)
- 7.3 Semantic color usage (bg-destructive, text-muted-foreground, border-border)
- 7.4 Theme customization through CSS variables in App.css
- 7.5 Dark mode support through CSS variable overrides

### 8. As a user, I want a modern, polished interface
**Acceptance Criteria:**
- 8.1 Subtle shadows (shadow-sm) on elevated elements
- 8.2 Smooth transitions on interactive elements
- 8.3 Proper focus states with ring-1 ring-ring/30
- 8.4 Hover states use bg-accent for subtle feedback
- 8.5 Consistent border radius (rounded-lg for cards, rounded-md for inputs)

### 9. As a developer, I want accessible components
**Acceptance Criteria:**
- 9.1 All interactive elements have proper focus states
- 9.2 Color contrast meets WCAG AA standards
- 9.3 Form fields have associated labels
- 9.4 Buttons have descriptive text or aria-labels
- 9.5 Keyboard navigation works throughout the app

### 10. As a developer, I want maintainable code
**Acceptance Criteria:**
- 10.1 Minimal className overrides on shadcn/ui components
- 10.2 Reusable component patterns documented
- 10.3 Consistent code style across all pages
- 10.4 Clear separation between custom and shadcn/ui components
- 10.5 Design system documentation updated

## Scope

### In Scope
- All pages in `src/pages/` (Dashboard, Assets, WorkOrders, Customers, etc.)
- All custom components in `src/components/` that use shadcn/ui
- Dashboard components (`src/components/dashboard/`)
- Data table components
- Form components
- Badge and status indicator components
- CSS utilities in `App.css`

### Out of Scope
- Mobile web app (`mobile-web/`)
- Native mobile app (`mobile/`)
- Backend API changes
- Database schema changes
- New feature development
- Performance optimization (unless related to styling)

## Technical Constraints

1. **Must use shadcn/ui components** from `@/components/ui/*`
2. **Must maintain existing functionality** - no breaking changes to behavior
3. **Must support dark mode** through CSS variables
4. **Must be accessible** - WCAG AA compliance
5. **Must use Tailwind CSS** for styling
6. **Must use CSS variables** for theming (HSL color system)
7. **Must use Radix UI primitives** (via shadcn/ui)
8. **Must use Lucide React icons** (already using Hugeicons, maintain consistency)

## Success Criteria

1. **Visual consistency**: All pages follow the same design patterns
2. **shadcn/ui compliance**: Components use defaults with minimal overrides
3. **Improved readability**: Proper typography hierarchy throughout
4. **Modern aesthetic**: Subtle shadows, smooth transitions, polished feel
5. **Maintainability**: Cleaner code with fewer custom overrides
6. **Accessibility**: All WCAG AA requirements met
7. **Documentation**: Updated design system guide

## Non-Functional Requirements

### Performance
- No performance degradation from styling changes
- Efficient CSS (no duplicate styles)
- Minimal runtime style calculations

### Maintainability
- Clear component patterns
- Documented design decisions
- Reusable component variants
- Consistent naming conventions

### Accessibility
- WCAG AA color contrast
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators on all interactive elements

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design (desktop-first for this app)
- Dark mode support

## Dependencies

- shadcn/ui components (already installed)
- Tailwind CSS (already configured)
- Radix UI primitives (via shadcn/ui)
- Hugeicons React (already in use)
- class-variance-authority (for component variants)

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing layouts | High | Incremental changes, test each page |
| User confusion from visual changes | Medium | Maintain familiar patterns, improve gradually |
| Increased bundle size | Low | shadcn/ui is already included |
| Regression in accessibility | High | Test with screen readers, keyboard navigation |
| Dark mode issues | Medium | Test both themes thoroughly |

## Open Questions

1. Should we create a Nova-specific theme variant in addition to the default?
2. Do we want to add animation/motion preferences?
3. Should we document component usage patterns in Storybook?
4. Do we need a migration guide for other developers?
5. Should we create a visual regression testing suite?

## References

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Radix UI Documentation](https://www.radix-ui.com)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- Current design system: `src/docs/design-system/README.md`
- App version separation rules: `.kiro/steering/app-version-separation.md`
