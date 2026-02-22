# Implementation Plan: Pure Black Dark Theme

## Overview

This implementation plan outlines the tasks for replacing the current deep navy dark mode (#0F172A) with a pure black dark theme (#000000) for the desktop CMMS application. The implementation focuses exclusively on updating CSS variables in `src/App.css` while maintaining accessibility, visual hierarchy, and brand identity.

The approach is minimal and surgical: update CSS variable values in the `.dark` class to use pure black as the foundation, adjust related colors for visibility and contrast, and validate the changes through automated testing.

## Tasks

- [x] 1. Update base background and foreground colors
  - Update `--background` to `0 0% 0%` (pure black)
  - Update `--foreground` to `0 0% 98%` (high contrast white)
  - Verify contrast ratio meets WCAG AAA (18.5:1)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.4_

- [x] 1.1 Write property test for pure black background
  - **Property 1: Pure Black Background CSS Variable**
  - **Validates: Requirements 1.2**

- [x] 2. Update elevated surface colors (cards and popovers)
  - Update `--card` to `0 0% 6%` (very dark gray for subtle elevation)
  - Update `--card-foreground` to `0 0% 98%`
  - Update `--popover` to `0 0% 6%` (match card for consistency)
  - Update `--popover-foreground` to `0 0% 98%`
  - Verify subtle but visible elevation against pure black
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.1 Write property test for elevated surface color range
  - **Property 2: Elevated Surface Color Range**
  - **Validates: Requirements 2.2, 2.3**

- [x] 3. Update brand colors (primary and secondary)
  - Update `--primary` to `173 80% 50%` (brighter Electric Teal for visibility)
  - Update `--primary-foreground` to `0 0% 0%` (pure black text on teal)
  - Update `--secondary` to `0 0% 15%` (visible dark gray)
  - Update `--secondary-foreground` to `0 0% 98%`
  - Verify primary color maintains Electric Teal hue (173°)
  - Verify primary color contrast against pure black meets WCAG AA
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2_

- [x] 3.1 Write property test for primary color contrast
  - **Property 5: Primary Color Contrast**
  - **Validates: Requirements 5.2, 5.4, 5.5**

- [x] 3.2 Write property test for brand hue preservation
  - **Property 6: Brand Hue Preservation**
  - **Validates: Requirements 5.3**

- [x] 4. Update muted and accent colors
  - Update `--muted` to `0 0% 12%` (between background and card)
  - Update `--muted-foreground` to `0 0% 65%` (readable secondary text)
  - Update `--accent` to `0 0% 12%` (match muted for consistency)
  - Update `--accent-foreground` to `0 0% 98%`
  - Verify muted foreground contrast meets WCAG AAA (7.4:1)
  - _Requirements: 3.2, 3.5, 6.1, 6.3, 6.4_

- [x] 5. Update border and input colors
  - Update `--border` to `0 0% 20%` (clear separation)
  - Update `--input` to `0 0% 20%` (match border)
  - Update `--ring` to `173 80% 50%` (match primary for focus rings)
  - Verify borders are visible but subtle against pure black
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5.1 Write property test for border visibility range
  - **Property 4: Border Visibility Range**
  - **Validates: Requirements 4.2, 4.3**

- [x] 6. Update semantic status colors
  - Update `--success` to `142 70% 60%` (bright green for visibility)
  - Update `--success-foreground` to `0 0% 10%` (dark text on bright success)
  - Update `--warning` to `38 92% 55%` (bright amber)
  - Update `--warning-foreground` to `0 0% 10%` (dark text on bright warning)
  - Update `--info` to `217 91% 65%` (bright blue for visibility)
  - Update `--info-foreground` to `0 0% 10%` (dark text on bright info)
  - Update `--destructive` to `0 85% 60%` (bright red for visibility)
  - Update `--destructive-foreground` to `0 0% 10%` (dark text on bright destructive)
  - Verify all semantic colors are clearly visible on pure black
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 6.1 Write property test for semantic color visibility
  - **Property 7: Semantic Color Visibility**
  - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

- [x] 7. Update chart colors
  - Update `--chart-1` to `173 80% 55%` (brighter teal)
  - Update `--chart-2` to `27 96% 65%` (bright orange)
  - Update `--chart-3` to `217 70% 55%` (distinct blue)
  - Update `--chart-4` to `43 90% 50%` (yellow - darker for distinguishability)
  - Update `--chart-5` to `142 70% 50%` (green)
  - Verify all chart colors are distinguishable from each other
  - Verify sufficient contrast against pure black for data visualization
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 7.1 Write property test for chart color contrast
  - **Property 8: Chart Color Contrast**
  - **Validates: Requirements 8.1, 8.2, 8.4**

- [x] 7.2 Write property test for chart color distinguishability
  - **Property 9: Chart Color Distinguishability**
  - **Validates: Requirements 8.3**

- [x] 8. Checkpoint - Verify CSS changes and visual inspection
  - Ensure all CSS variable updates are syntactically correct
  - Manually test theme toggle (light/dark/system)
  - Verify pure black background appears on all pages
  - Check card elevation is subtle but visible
  - Verify all text is readable without eye strain
  - Test scrollbar visibility and hover states
  - Test table row hover and selection states
  - Ensure all tests pass, ask the user if questions arise

- [x] 9. Write comprehensive property test for text contrast ratios
  - **Property 3: Text Contrast Ratios**
  - Test all text color variables against their intended backgrounds
  - Verify WCAG AA compliance (minimum 4.5:1 for normal text)
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

- [x] 10. Write unit tests for CSS variable values
  - Test that `--background` is `0 0% 0%` in dark mode
  - Test that `--card` is `0 0% 6%` in dark mode
  - Test that `--border` is `0 0% 20%` in dark mode
  - Test that `--muted` is `0 0% 12%` in dark mode
  - Test that light mode variables remain unchanged
  - _Requirements: 1.2, 2.2, 4.2, 6.2_

- [x] 11. Write unit tests for theme toggle functionality
  - Test toggling from light to dark applies pure black theme
  - Test toggling from dark to light preserves light theme
  - Test system theme respects OS preferences
  - Test theme persistence in localStorage
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 12. Write unit tests for legacy compatibility overrides
  - Test that `.dark .bg-white` uses `var(--card)`
  - Test that `.dark .text-gray-900` uses `var(--foreground)`
  - Test that `.dark .border-gray-200` uses `var(--border)`
  - Verify existing components render correctly with pure black theme
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 13. Final checkpoint - Manual testing and accessibility validation
  - Complete manual testing checklist from design document
  - Test with browser accessibility tools (axe DevTools, Lighthouse)
  - Verify on OLED display if available (power savings and contrast)
  - Test with different zoom levels (100%, 125%, 150%)
  - Verify no visual regressions in existing components
  - Check status indicators are visible and distinguishable
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All implementation changes are confined to `src/App.css` (single file)
- No changes required to React components or theme provider logic
- Legacy Tailwind overrides automatically adapt to new CSS variables
- Theme toggle functionality preserved without code changes
- Each property test should run minimum 100 iterations
- Property tests use fast-check library for TypeScript/JavaScript
- All contrast ratios must meet WCAG AA minimum (4.5:1 for text, 3:1 for UI components)
- Pure black (#000000) optimized for OLED displays
- Elevated surfaces use very dark gray (6% lightness) for subtle hierarchy
