# Requirements Document: Pure Black Dark Theme

## Introduction

This document specifies the requirements for implementing a pure black dark theme for the desktop CMMS application. The feature will replace the current deep navy dark mode (#0F172A) with a true black (#000000) theme optimized for OLED displays and users who prefer maximum contrast dark modes.

The implementation will maintain the existing theme toggle functionality (light/dark/system) while updating the CSS variable system to use pure black as the foundation for the dark mode color scheme.

## Glossary

- **Theme_System**: The application's theming infrastructure using shadcn/ui CSS variables and React context
- **Pure_Black**: True black color (#000000 or HSL 0 0% 0%)
- **Deep_Navy**: The current dark mode background color (#0F172A or HSL 222 47% 11%)
- **CSS_Variables**: HSL-based color tokens defined in App.css that control the application's appearance
- **WCAG_AA**: Web Content Accessibility Guidelines Level AA requiring minimum contrast ratios of 4.5:1 for normal text
- **OLED**: Organic Light-Emitting Diode displays that benefit from true black pixels (power savings and infinite contrast)
- **Elevated_Surface**: UI elements like cards and popovers that appear above the base background
- **Theme_Provider**: React context provider that manages theme state and applies theme classes
- **Legacy_Overrides**: CSS rules that map standard Tailwind classes to theme-aware CSS variables

## Requirements

### Requirement 1: Pure Black Background

**User Story:** As a user, I want the dark mode to use pure black backgrounds, so that I can benefit from OLED display advantages and have maximum contrast.

#### Acceptance Criteria

1. WHEN dark mode is active, THE Theme_System SHALL set the primary background to pure black (#000000 / HSL 0 0% 0%)
2. THE Theme_System SHALL update the --background CSS variable to 0 0% 0% in the .dark class
3. WHEN viewing any page in dark mode, THE application SHALL display pure black as the base background color
4. THE Pure_Black background SHALL apply consistently across all routes and components

### Requirement 2: Elevated Surface Colors

**User Story:** As a user, I want cards and elevated UI elements to be distinguishable from the background, so that I can perceive visual hierarchy and component boundaries.

#### Acceptance Criteria

1. WHEN dark mode is active, THE Theme_System SHALL use very dark gray for Elevated_Surfaces
2. THE Theme_System SHALL set --card to a value between 0 0% 4% and 0 0% 10% (approximately #0A0A0A to #1A1A1A)
3. THE Theme_System SHALL set --popover to match the --card value for consistency
4. WHEN viewing cards or popovers, THE user SHALL perceive subtle elevation against the Pure_Black background
5. THE Elevated_Surface colors SHALL provide sufficient contrast to distinguish component boundaries

### Requirement 3: Accessible Text Contrast

**User Story:** As a user, I want all text to be readable against the pure black background, so that I can use the application without eye strain.

#### Acceptance Criteria

1. WHEN dark mode is active, THE Theme_System SHALL ensure all text meets WCAG_AA contrast requirements
2. THE Theme_System SHALL set --foreground to a light color with minimum 4.5:1 contrast ratio against Pure_Black
3. THE Theme_System SHALL set --muted-foreground to a medium gray with minimum 4.5:1 contrast ratio
4. WHEN displaying primary text, THE contrast ratio SHALL be at least 7:1 (WCAG AAA preferred)
5. WHEN displaying secondary/muted text, THE contrast ratio SHALL be at least 4.5:1 (WCAG AA minimum)

### Requirement 4: Visible Borders and Dividers

**User Story:** As a user, I want borders and dividers to be visible against pure black, so that I can distinguish between UI sections and components.

#### Acceptance Criteria

1. WHEN dark mode is active, THE Theme_System SHALL use visible border colors against Pure_Black
2. THE Theme_System SHALL set --border to a gray value between 0 0% 15% and 0 0% 25%
3. THE Theme_System SHALL set --input to match --border for consistency
4. WHEN viewing bordered elements, THE borders SHALL be clearly visible without being harsh
5. THE border colors SHALL provide sufficient contrast for visual separation while maintaining aesthetic quality

### Requirement 5: Brand Color Compatibility

**User Story:** As a user, I want the Electric Teal primary color to work well with pure black backgrounds, so that the brand identity is maintained.

#### Acceptance Criteria

1. WHEN dark mode is active, THE Theme_System SHALL adjust the --primary color for optimal visibility on Pure_Black
2. THE Theme_System SHALL ensure the primary color maintains sufficient contrast against Pure_Black
3. THE Theme_System SHALL preserve the Electric Teal hue while adjusting lightness if necessary
4. WHEN viewing primary-colored elements, THE color SHALL appear vibrant and accessible
5. THE primary color contrast ratio SHALL meet WCAG_AA requirements for interactive elements

### Requirement 6: Secondary and Accent Colors

**User Story:** As a user, I want all accent and secondary colors to be visible and accessible on pure black, so that status indicators and UI accents are clear.

#### Acceptance Criteria

1. WHEN dark mode is active, THE Theme_System SHALL adjust --secondary, --muted, and --accent colors for Pure_Black compatibility
2. THE Theme_System SHALL use dark gray values (0 0% 10% to 0 0% 20%) for secondary and muted backgrounds
3. THE Theme_System SHALL maintain the Solar Orange accent color with appropriate brightness adjustments
4. WHEN viewing muted or secondary UI elements, THE colors SHALL be distinguishable from both Pure_Black and Elevated_Surfaces
5. THE accent colors SHALL maintain their semantic meaning while meeting contrast requirements

### Requirement 7: Semantic Status Colors

**User Story:** As a user, I want success, warning, and error colors to be clearly visible on pure black, so that I can quickly identify system status and alerts.

#### Acceptance Criteria

1. WHEN dark mode is active, THE Theme_System SHALL ensure all semantic status colors are visible on Pure_Black
2. THE Theme_System SHALL adjust --success, --warning, --info, and --destructive colors for optimal contrast
3. WHEN displaying success indicators, THE green color SHALL have sufficient brightness for visibility
4. WHEN displaying warning indicators, THE amber/yellow color SHALL be clearly distinguishable
5. WHEN displaying error indicators, THE red color SHALL be prominent and accessible

### Requirement 8: Chart Colors

**User Story:** As a user, I want chart visualizations to be clear and distinguishable on pure black backgrounds, so that I can interpret data effectively.

#### Acceptance Criteria

1. WHEN dark mode is active, THE Theme_System SHALL adjust all --chart-* variables for Pure_Black compatibility
2. THE Theme_System SHALL ensure chart colors have sufficient brightness and saturation for visibility
3. WHEN viewing charts, THE colors SHALL be easily distinguishable from each other
4. THE chart colors SHALL maintain sufficient contrast against Pure_Black backgrounds
5. THE chart color palette SHALL remain visually harmonious while meeting accessibility requirements

### Requirement 9: Legacy Compatibility Overrides

**User Story:** As a developer, I want the legacy Tailwind class overrides to work with pure black, so that existing components continue to function correctly without refactoring.

#### Acceptance Criteria

1. WHEN dark mode is active, THE Theme_System SHALL apply Pure_Black-compatible overrides to legacy Tailwind classes
2. THE .dark .bg-white override SHALL map to the updated --card value
3. THE .dark .bg-gray-50 and .dark .bg-gray-100 overrides SHALL map to appropriate muted values
4. THE .dark text and border overrides SHALL use the updated CSS variables
5. WHEN using legacy Tailwind classes, THE components SHALL render correctly with Pure_Black theme

### Requirement 10: Theme Toggle Preservation

**User Story:** As a user, I want the existing theme toggle to continue working exactly as before, so that I can switch between light, dark, and system themes seamlessly.

#### Acceptance Criteria

1. THE Theme_System SHALL preserve the existing theme toggle functionality
2. WHEN toggling to dark mode, THE Pure_Black theme SHALL be applied
3. WHEN toggling to light mode, THE existing light theme SHALL remain unchanged
4. WHEN selecting system theme, THE Theme_System SHALL respect OS preferences
5. THE theme preference SHALL persist in localStorage across sessions

### Requirement 11: Scrollbar Styling

**User Story:** As a user, I want scrollbars to be visible against pure black backgrounds, so that I can see scroll position and interact with scrollable content.

#### Acceptance Criteria

1. WHEN dark mode is active, THE Theme_System SHALL ensure scrollbar elements are visible on Pure_Black
2. THE scrollbar thumb SHALL use colors derived from --border or --muted-foreground
3. WHEN hovering over scrollbars, THE hover state SHALL be clearly visible
4. THE scrollbar styling SHALL maintain the existing subtle, minimal aesthetic
5. THE scrollbar colors SHALL provide sufficient contrast without being distracting

### Requirement 12: Table Row Interactions

**User Story:** As a user, I want table row hover and selection states to be visible on pure black, so that I can interact with data tables effectively.

#### Acceptance Criteria

1. WHEN dark mode is active, THE Theme_System SHALL ensure table hover states are visible on Pure_Black
2. THE table row hover background SHALL use --muted with appropriate opacity
3. THE table row selected state SHALL use --primary with appropriate opacity
4. WHEN hovering over table rows, THE hover state SHALL be clearly visible
5. WHEN selecting table rows, THE selected state SHALL be distinguishable from hover and default states
