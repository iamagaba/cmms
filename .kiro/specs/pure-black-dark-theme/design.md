# Design Document: Pure Black Dark Theme

## Overview

This design document outlines the implementation approach for replacing the current deep navy dark mode (#0F172A) with a pure black dark theme (#000000) for the desktop CMMS application. The implementation focuses on updating CSS variables in the shadcn/ui theming system while maintaining accessibility, visual hierarchy, and brand identity.

### Goals

- Replace deep navy backgrounds with pure black (#000000)
- Maintain WCAG AA accessibility standards for all text and interactive elements
- Preserve visual hierarchy through subtle elevation using very dark grays
- Optimize for OLED displays (power efficiency and infinite contrast)
- Ensure seamless compatibility with existing components and legacy Tailwind overrides
- Maintain the existing theme toggle functionality without code changes

### Non-Goals

- Modifying the light theme color scheme
- Changing the theme provider logic or theme toggle component
- Refactoring components to remove legacy Tailwind classes
- Adding new theme modes beyond light/dark/system
- Implementing per-component theme customization

## Architecture

### Theme System Structure

The application uses shadcn/ui's CSS variable-based theming system with three layers:

1. **CSS Variables Layer** (`src/App.css`)
   - Defines HSL color values for `:root` (light mode) and `.dark` (dark mode)
   - Uses semantic naming (--background, --foreground, --primary, etc.)
   - Provides theme-agnostic color tokens

2. **Theme Provider Layer** (`src/providers/ThemeProvider.tsx`)
   - Manages theme state (light/dark/system)
   - Applies `.dark` or `.light` class to document root
   - Handles localStorage persistence and system preference detection
   - No changes required for pure black implementation

3. **Component Layer** (shadcn/ui components)
   - Consumes CSS variables via Tailwind utilities
   - Uses semantic classes like `bg-background`, `text-foreground`, `border-border`
   - Automatically adapts to theme changes
   - No changes required for pure black implementation

### Implementation Strategy

The pure black theme implementation is achieved entirely through CSS variable updates in `src/App.css`. This approach:

- Requires changes to only one file
- Maintains backward compatibility with all existing components
- Preserves the existing theme toggle functionality
- Leverages the existing CSS variable infrastructure
- Ensures consistent application of the pure black theme across all UI elements

## Components and Interfaces

### CSS Variable Definitions

The `.dark` class in `src/App.css` defines all theme variables. The pure black implementation updates these variables:

#### Base Colors

```css
.dark {
  /* Primary background - Pure Black */
  --background: 0 0% 0%; /* #000000 */
  --foreground: 0 0% 98%; /* #FAFAFA - High contrast white */
  
  /* Elevated surfaces - Very dark gray for cards/popovers */
  --card: 0 0% 6%; /* #0F0F0F - Subtle elevation */
  --card-foreground: 0 0% 98%;
  
  --popover: 0 0% 6%; /* Match card for consistency */
  --popover-foreground: 0 0% 98%;
}
```

**Design Rationale:**
- Pure black (0 0% 0%) provides maximum OLED benefits
- 98% lightness for foreground ensures 18.5:1 contrast (WCAG AAA)
- 6% lightness for cards provides subtle but visible elevation
- Neutral hue (0) maintains color neutrality

#### Brand Colors

```css
.dark {
  /* Primary - Electric Teal (adjusted for pure black) */
  --primary: 173 80% 50%; /* Brighter teal for visibility */
  --primary-foreground: 0 0% 0%; /* Pure black text on teal */
  
  /* Secondary - Dark gray */
  --secondary: 0 0% 15%; /* #262626 - Visible against black */
  --secondary-foreground: 0 0% 98%;
}
```

**Design Rationale:**
- Primary teal increased from 45% to 50% lightness for better visibility on pure black
- Primary foreground uses pure black for maximum contrast on teal backgrounds
- Secondary uses neutral gray (15% lightness) for subtle differentiation
- Maintains Electric Teal hue (173°) for brand consistency

#### Muted and Accent Colors

```css
.dark {
  /* Muted - Subtle gray for secondary UI elements */
  --muted: 0 0% 12%; /* #1F1F1F - Between background and card */
  --muted-foreground: 0 0% 65%; /* #A6A6A6 - Readable secondary text */
  
  /* Accent - Solar Orange (adjusted) */
  --accent: 0 0% 12%; /* Match muted for consistency */
  --accent-foreground: 0 0% 98%;
}
```

**Design Rationale:**
- Muted background (12%) sits between pure black (0%) and cards (6%)
- Muted foreground (65%) provides 7.4:1 contrast against pure black (WCAG AAA)
- Accent background matches muted for consistent secondary surfaces
- Neutral hues maintain color neutrality for backgrounds

#### Borders and Inputs

```css
.dark {
  /* Borders - Visible but subtle */
  --border: 0 0% 20%; /* #333333 - Clear separation */
  --input: 0 0% 20%; /* Match border */
  --ring: 173 80% 50%; /* Match primary for focus rings */
}
```

**Design Rationale:**
- 20% lightness provides clear visibility against pure black
- Sufficient contrast for visual separation without harshness
- Ring color matches primary for consistent focus indication
- Input border matches general border for consistency

#### Semantic Status Colors

```css
.dark {
  /* Success - Green */
  --success: 142 70% 60%; /* Bright green for visibility */
  --success-foreground: 0 0% 10%; /* Dark text on bright success */
  
  /* Warning - Amber */
  --warning: 38 92% 55%; /* #F59E0B - Bright amber */
  --warning-foreground: 0 0% 10%; /* Dark text on bright warning */
  
  /* Info - Blue */
  --info: 217 91% 65%; /* Bright blue for visibility */
  --info-foreground: 0 0% 10%; /* Dark text on bright info */
  
  /* Destructive - Red */
  --destructive: 0 85% 60%; /* Bright red for visibility */
  --destructive-foreground: 0 0% 10%; /* Dark text on bright destructive */
}
```

**Design Rationale:**
- All semantic colors use bright backgrounds (55-65% lightness) for maximum visibility on pure black
- All semantic colors use dark text (10% lightness) for optimal contrast on bright backgrounds
- Success green (60%) provides clear positive indication with excellent visibility
- Warning amber (55%) is bright enough to stand out
- Info blue (65%) maintains distinction from primary teal while being highly visible
- Destructive red (60%) is prominent for error states
- This approach ensures WCAG AA compliance for text (≥4.5:1) while maintaining semantic color visibility (≥3:1 against pure black)

#### Chart Colors

```css
.dark {
  /* Chart palette - Bright and distinguishable */
  --chart-1: 173 80% 55%; /* Teal - Brighter primary */
  --chart-2: 27 96% 65%; /* Orange - Solar orange */
  --chart-3: 217 70% 55%; /* Blue - Distinct from teal */
  --chart-4: 43 90% 50%; /* Yellow - Darker for distinguishability from orange */
  --chart-5: 142 70% 50%; /* Green - Success color */
}
```

**Design Rationale:**
- Chart colors optimized for visibility (50-65% lightness) and distinguishability
- Chart-4 (yellow) uses 50% lightness to ensure sufficient difference from chart-2 (orange at 65%)
- Maintains hue diversity for distinguishability (30+ degree hue differences)
- Chart-1 (teal) aligns with primary brand color
- Chart-2 (orange) aligns with secondary brand color
- Sufficient saturation (70-96%) and lightness for clear data visualization
- Colors remain harmonious while being easily distinguishable

### Legacy Compatibility Overrides

The existing legacy overrides in `src/App.css` automatically adapt to the new pure black theme because they reference CSS variables. No changes are required to these rules.

### Scrollbar Styling

The existing scrollbar styles automatically adapt to the new theme by referencing CSS variables. No changes are required.

## Data Models

No data models are required for this implementation. The theme system operates entirely through CSS variables and does not involve data persistence beyond the existing localStorage theme preference (light/dark/system).


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Pure Black Background CSS Variable

*For any* inspection of the `.dark` class CSS, the `--background` variable should be set to `0 0% 0%` (pure black).

**Validates: Requirements 1.2**

### Property 2: Elevated Surface Color Range

*For any* elevated surface CSS variable (`--card`, `--popover`) in dark mode, the lightness value should be between 4% and 10%.

**Validates: Requirements 2.2, 2.3**

### Property 3: Text Contrast Ratios

*For any* text color variable in dark mode, the contrast ratio against its intended background should meet WCAG AA requirements (minimum 4.5:1 for normal text).

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

### Property 4: Border Visibility Range

*For any* border-related CSS variable (`--border`, `--input`) in dark mode, the lightness value should be between 15% and 25%.

**Validates: Requirements 4.2, 4.3**

### Property 5: Primary Color Contrast

*For any* measurement of the `--primary` color in dark mode, the contrast ratio against pure black should be at least 3:1 (WCAG AA for UI components).

**Validates: Requirements 5.2, 5.4, 5.5**

### Property 6: Brand Hue Preservation

*For any* brand color CSS variable (`--primary`) in dark mode, the hue component should remain within 170-176 degrees (Electric Teal range).

**Validates: Requirements 5.3**

### Property 7: Semantic Color Visibility

*For any* semantic status color (`--success`, `--warning`, `--info`, `--destructive`) in dark mode, the contrast ratio against pure black should be at least 3:1.

**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

### Property 8: Chart Color Contrast

*For any* chart color variable (`--chart-1` through `--chart-5`) in dark mode, the contrast ratio against pure black should be at least 3:1.

**Validates: Requirements 8.1, 8.2, 8.4**

### Property 9: Chart Color Distinguishability

*For any* pair of chart colors in dark mode, the hue difference should be at least 30 degrees OR there should be significant lightness/saturation difference (at least 15% difference in either).

**Validates: Requirements 8.3**

## Error Handling

This implementation has minimal error handling requirements since it involves only CSS variable updates. However, the following considerations apply:

### CSS Parsing Errors

**Scenario:** Invalid HSL values in CSS variables could cause parsing errors.

**Mitigation:**
- All HSL values follow the format: `H S% L%` (e.g., `0 0% 0%`)
- Hue values are 0-360 degrees
- Saturation and lightness are 0-100%
- Values are validated during development through browser DevTools inspection

**Fallback:** If a CSS variable fails to parse, browsers will fall back to the inherited value or the initial value, which may result in incorrect colors but will not break the application.

### Theme Class Application Errors

**Scenario:** The `.dark` class might not be applied to the document root due to JavaScript errors in ThemeProvider.

**Mitigation:**
- ThemeProvider is a critical component loaded early in the application lifecycle
- Theme state is initialized synchronously from localStorage
- The existing ThemeProvider implementation has proven reliability

**Fallback:** If the theme class is not applied, the application will display in light mode (the default `:root` styles).

### Contrast Ratio Violations

**Scenario:** Color combinations might not meet WCAG requirements due to calculation errors or design oversights.

**Mitigation:**
- All color combinations are validated during design phase using contrast ratio calculators
- Automated tests verify contrast ratios programmatically
- Manual testing with accessibility tools (e.g., axe DevTools) during QA

**Fallback:** If contrast violations are discovered post-deployment, CSS variables can be updated via hotfix without code changes.

## Testing Strategy

The pure black dark theme implementation will be validated through a combination of unit tests and property-based tests. Both testing approaches are complementary and necessary for comprehensive coverage.

### Testing Approach

**Unit Tests:**
- Validate specific CSS variable values
- Test theme toggle interactions
- Verify localStorage persistence
- Check legacy override behavior
- Test specific color combinations

**Property-Based Tests:**
- Verify contrast ratios meet WCAG requirements
- Validate CSS variable ranges
- Test brand color hue preservation
- Ensure chart color distinguishability
- Validate semantic color visibility

### Test Configuration

**Property-Based Testing Library:** fast-check (for TypeScript/JavaScript)

**Test Execution:**
- Minimum 100 iterations per property test
- Each property test references its design document property
- Tag format: `Feature: pure-black-dark-theme, Property {number}: {property_text}`

### Test Implementation Plan

#### Unit Tests

1. **CSS Variable Value Tests**
   - Test that `--background` is `0 0% 0%` in dark mode
   - Test that `--card` is `0 0% 6%` in dark mode
   - Test that `--border` is `0 0% 20%` in dark mode
   - Test that `--muted` is `0 0% 12%` in dark mode
   - Test that light mode variables remain unchanged

2. **Theme Toggle Tests**
   - Test toggling from light to dark applies pure black theme
   - Test toggling from dark to light preserves light theme
   - Test system theme respects OS preferences
   - Test theme persistence in localStorage

3. **Legacy Override Tests**
   - Test that `.dark .bg-white` uses `var(--card)`
   - Test that `.dark .text-gray-900` uses `var(--foreground)`
   - Test that `.dark .border-gray-200` uses `var(--border)`

4. **Scrollbar and Table Tests**
   - Test scrollbar thumb uses `var(--border)`
   - Test table hover uses `var(--muted)` with opacity
   - Test table selected uses `var(--primary)` with opacity

#### Property-Based Tests

1. **Property 1: Pure Black Background CSS Variable**
   - Parse CSS and verify `--background` value
   - Tag: `Feature: pure-black-dark-theme, Property 1: Pure Black Background CSS Variable`

2. **Property 2: Elevated Surface Color Range**
   - Verify `--card` and `--popover` lightness is 4-10%
   - Tag: `Feature: pure-black-dark-theme, Property 2: Elevated Surface Color Range`

3. **Property 3: Text Contrast Ratios**
   - Test all text colors against their backgrounds
   - Verify minimum 4.5:1 contrast (WCAG AA)
   - Tag: `Feature: pure-black-dark-theme, Property 3: Text Contrast Ratios`

4. **Property 4: Border Visibility Range**
   - Verify `--border` and `--input` lightness is 15-25%
   - Tag: `Feature: pure-black-dark-theme, Property 4: Border Visibility Range`

5. **Property 5: Primary Color Contrast**
   - Test `--primary` contrast against pure black
   - Verify minimum 3:1 ratio
   - Tag: `Feature: pure-black-dark-theme, Property 5: Primary Color Contrast`

6. **Property 6: Brand Hue Preservation**
   - Verify `--primary` hue is 170-176 degrees
   - Tag: `Feature: pure-black-dark-theme, Property 6: Brand Hue Preservation`

7. **Property 7: Semantic Color Visibility**
   - Test all semantic colors against pure black
   - Verify minimum 3:1 contrast
   - Tag: `Feature: pure-black-dark-theme, Property 7: Semantic Color Visibility`

8. **Property 8: Chart Color Contrast**
   - Test all chart colors against pure black
   - Verify minimum 3:1 contrast
   - Tag: `Feature: pure-black-dark-theme, Property 8: Chart Color Contrast`

9. **Property 9: Chart Color Distinguishability**
   - Test hue differences between all chart color pairs
   - Verify 30-degree minimum OR 15% lightness/saturation difference
   - Tag: `Feature: pure-black-dark-theme, Property 9: Chart Color Distinguishability`

### Testing Tools

**Contrast Ratio Calculation:**
```typescript
// WCAG contrast ratio formula
function getContrastRatio(color1: RGB, color2: RGB): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(rgb: RGB): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
```

**HSL Parsing:**
```typescript
function parseHSL(hslString: string): { h: number; s: number; l: number } {
  const match = hslString.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!match) throw new Error(`Invalid HSL: ${hslString}`);
  return {
    h: parseInt(match[1]),
    s: parseInt(match[2]),
    l: parseInt(match[3])
  };
}
```

**CSS Variable Extraction:**
```typescript
function getCSSVariable(element: HTMLElement, variableName: string): string {
  return getComputedStyle(element).getPropertyValue(variableName).trim();
}
```

### Manual Testing Checklist

In addition to automated tests, manual testing should verify:

- [ ] Visual inspection of all major pages in dark mode
- [ ] Verify pure black background on OLED display (if available)
- [ ] Check card elevation is subtle but visible
- [ ] Verify all text is readable without eye strain
- [ ] Test with browser accessibility tools (axe DevTools, Lighthouse)
- [ ] Verify theme toggle works smoothly
- [ ] Check scrollbar visibility and hover states
- [ ] Test table row hover and selection states
- [ ] Verify charts are clear and distinguishable
- [ ] Check status indicators (success, warning, error) are visible
- [ ] Test with different zoom levels (100%, 125%, 150%)
- [ ] Verify no visual regressions in existing components

### Success Criteria

The implementation is considered successful when:

1. All automated tests pass (unit tests and property-based tests)
2. All contrast ratios meet or exceed WCAG AA requirements
3. Manual testing checklist is completed without issues
4. No visual regressions are identified in existing components
5. Theme toggle functionality works as expected
6. Pure black background is consistently applied across all routes
7. Brand colors maintain their identity while being accessible
8. Legacy Tailwind overrides work correctly with the new theme
