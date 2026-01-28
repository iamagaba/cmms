# Implementation Plan: shadcn/ui Aesthetic Compliance

## Overview

This implementation plan refactors the desktop CMMS application to fully embrace shadcn/ui design principles with Nova-style refinements. The approach is incremental, starting with foundational changes and progressing through components in priority order to minimize risk and allow for testing at each step.

## Tasks

- [x] 1. Foundation: Update App.css and remove custom utilities
  - Remove custom compact utility classes (p-compact, gap-compact, space-y-compact, etc.)
  - Verify CSS variables are correct (Nova purple primary already configured)
  - Keep useful utilities (no-scrollbar, scrollbar styling)
  - _Requirements: 4.1, 7.4, 7.5_

- [ ] 2. Enhance Badge component with semantic variants
  - [x] 2.1 Update badge.tsx with comprehensive variant system
    - Add status variants (success, warning, error, info)
    - Add work order status variants (open, in-progress, completed, cancelled)
    - Add priority variants (critical, high, medium, low)
    - Include dark mode support for all variants
    - _Requirements: 6.4_
  
  - [x] 2.2 Create StatusBadge helper component
    - Create src/components/StatusBadge.tsx
    - Map status values to badge variants
    - Export StatusBadge component
    - _Requirements: 6.1_
  
  - [x] 2.3 Create PriorityBadge helper component
    - Create src/components/PriorityBadge.tsx
    - Map priority values to badge variants
    - Export PriorityBadge component
    - _Requirements: 6.2_

- [ ] 3. Refactor Dashboard Components
  - [x] 3.1 Refactor ModernKPICard.tsx
    - Replace custom color classes with CSS variables
    - Change p-5 to p-6 (use CardContent with default padding)
    - Update title from text-xs to text-sm font-medium
    - Ensure icons use w-5 h-5 (already correct)
    - Use text-muted-foreground for secondary text
    - Use bg-muted for skeleton loading states
    - _Requirements: 1.1, 2.4, 2.5, 3.1, 7.1, 7.3_
  
  - [x] 3.2 Refactor ActivityFeed.tsx
    - Use text-sm for activity descriptions
    - Use text-xs text-muted-foreground for timestamps
    - Use space-y-4 for activity item spacing
    - Use w-5 h-5 for activity icons
    - Replace inline badge styling with StatusBadge/PriorityBadge
    - _Requirements: 2.4, 2.6, 3.1, 4.5, 6.1, 6.2_
  
  - [x] 3.3 Refactor AssetStatusOverview.tsx
    - Add CardHeader + CardTitle structure
    - Use text-sm for body text
    - Use w-5 h-5 for status icons
    - Replace inline badge styling with badge variants
    - Use space-y-4 for section spacing
    - _Requirements: 2.3, 2.4, 3.1, 4.5, 5.1, 6.5_
  
  - [x] 3.4 Refactor PriorityWorkOrders.tsx
    - Add CardHeader + CardTitle + CardDescription
    - Use text-sm for work order titles
    - Use text-xs text-muted-foreground for metadata
    - Replace inline priority styling with PriorityBadge
    - Use space-y-4 for work order list spacing
    - _Requirements: 2.3, 2.4, 2.6, 4.5, 5.1, 6.2_
  
  - [x] 3.5 Refactor QuickActionsPanel.tsx
    - Ensure Button components use default sizes
    - Use w-5 h-5 for action icons
    - Use gap-4 for action button spacing
    - Use text-sm for action labels
    - _Requirements: 1.2, 2.4, 3.1, 4.2_
  
  - [x] 3.6 Refactor TechniciansList.tsx
    - Use text-sm for technician names
    - Use text-xs text-muted-foreground for status/location
    - Replace inline badge styling with badge variants
    - Use w-5 h-5 for avatar/icon sizes
    - Use space-y-4 for list spacing
    - _Requirements: 2.4, 2.6, 3.1, 4.5, 6.5_
  
  - [x] 3.7 Refactor WorkOrderTrendsChart.tsx
    - Add CardHeader + CardTitle structure
    - Use text-sm for chart labels
    - Use text-xs for axis labels
    - Ensure chart colors use CSS variables where possible
    - _Requirements: 2.3, 2.4, 2.6, 5.1, 7.1_

- [x] 4. Checkpoint - Verify dashboard components
  - Ensure all dashboard components render correctly
  - Test dark mode for all dashboard components
  - Verify badge variants display correctly
  - Ask the user if questions arise

- [ ] 5. Refactor Data Table Components
  - [x] 5.1 Refactor EnhancedDataTable.tsx
    - Use text-sm for table cells (readable body text)
    - Use text-xs font-medium uppercase tracking-wider for headers
    - Use p-4 for cell padding (comfortable spacing)
    - Use border-border for all borders
    - Use hover:bg-accent for row hover states
    - Use text-muted-foreground for secondary cell content
    - Ensure pagination uses Button component with default sizes
    - _Requirements: 1.2, 2.4, 2.6, 4.2, 5.5, 7.3, 8.4_
  
  - [x] 5.2 Refactor DataTableFilterBar.tsx
    - Ensure Input components use default height (h-9)
    - Ensure Button components use default sizes
    - Use gap-4 for filter spacing
    - Use text-sm for filter labels
    - Replace inline badge styling with badge variants for active filters
    - _Requirements: 1.2, 1.3, 2.4, 4.2, 6.5_
  
  - [x] 5.3 Refactor DataTableBulkActions.tsx
    - Ensure Button components use default sizes
    - Use w-4 h-4 for action icons
    - Use gap-4 for action button spacing
    - Use text-sm for action labels
    - _Requirements: 1.2, 2.4, 3.2, 4.2_

- [ ] 6. Refactor Main Pages
  - [x] 6.1 Refactor ProfessionalCMMSDashboard.tsx
    - Use text-2xl font-bold for page title
    - Use gap-6 for dashboard grid spacing
    - Use space-y-6 for vertical section spacing
    - Verify all KPI cards use refactored ModernKPICard
    - Verify all dashboard components follow new patterns
    - _Requirements: 2.1, 4.4, 8.1_
  
  - [x] 6.2 Refactor Assets.tsx
    - Use text-2xl font-bold for page title
    - Add CardHeader + CardTitle for main card
    - Verify EnhancedDataTable uses refactored styling
    - Replace inline badge styling with badge variants for asset status
    - Use gap-4 for filter/action spacing
    - _Requirements: 2.1, 2.3, 4.2, 5.1, 6.5_
  
  - [x] 6.3 Refactor WorkOrders.tsx
    - Use text-2xl font-bold for page title
    - Add CardHeader + CardTitle for main card
    - Replace inline status/priority styling with StatusBadge and PriorityBadge
    - Verify EnhancedDataTable uses refactored styling
    - Use gap-4 for filter/action spacing
    - _Requirements: 2.1, 2.3, 4.2, 5.1, 6.1, 6.2_
  
  - [x] 6.4 Refactor WorkOrderDetailsEnhanced.tsx
    - Use text-2xl font-bold for work order title
    - Add Card + CardHeader + CardTitle for sections
    - Use text-sm for body text
    - Use text-xs text-muted-foreground for metadata
    - Replace inline styling with StatusBadge and PriorityBadge
    - Use space-y-6 for section spacing
    - Use space-y-4 for form field spacing
    - _Requirements: 2.1, 2.3, 2.4, 2.6, 4.4, 4.5, 5.1, 6.1, 6.2_
  
  - [x] 6.5 Refactor Customers.tsx
    - Use text-2xl font-bold for page title
    - Add CardHeader + CardTitle structure
    - Use text-sm for body text
    - Use text-xs text-muted-foreground for metadata
    - Replace inline badge styling with badge variants for customer status
    - Use space-y-6 for section spacing
    - _Requirements: 2.1, 2.3, 2.4, 2.6, 4.4, 5.1, 6.5_
  
  - [x] 6.6 Refactor CustomerDetails.tsx
    - Use text-2xl font-bold for page title
    - Add Card + CardHeader + CardTitle for sections
    - Use text-sm for body text
    - Use text-xs text-muted-foreground for metadata
    - Replace inline badge styling with badge variants
    - Use space-y-6 for section spacing
    - _Requirements: 2.1, 2.3, 2.4, 2.6, 4.4, 5.1, 6.5_
  
  - [x] 6.7 Refactor Inventory.tsx
    - Use text-2xl font-bold for page title
    - Add CardHeader + CardTitle structure
    - Verify EnhancedDataTable uses refactored styling
    - Replace inline badge styling with badge variants for stock status
    - Use gap-4 for filter/action spacing
    - _Requirements: 2.1, 2.3, 4.2, 5.1, 6.5_
  
  - [x] 6.8 Refactor Locations.tsx
    - Use text-2xl font-bold for page title
    - Add CardHeader + CardTitle structure
    - Verify EnhancedDataTable uses refactored styling
    - Use gap-4 for filter/action spacing
    - _Requirements: 2.1, 2.3, 4.2, 5.1_
  
  - [x] 6.9 Refactor Technicians.tsx
    - Use text-2xl font-bold for page title
    - Add CardHeader + CardTitle structure
    - Verify EnhancedDataTable uses refactored styling
    - Replace inline badge styling with badge variants for technician status
    - Use gap-4 for filter/action spacing
    - _Requirements: 2.1, 2.3, 4.2, 5.1, 6.5_
  
  - [x] 6.10 Refactor Scheduling.tsx
    - Use text-2xl font-bold for page title
    - Add CardHeader + CardTitle for calendar card
    - Use text-sm for event titles
    - Use text-xs for event times
    - Replace inline badge styling with badge variants for event types
    - Ensure calendar styling uses CSS variables
    - _Requirements: 2.1, 2.3, 2.4, 2.6, 5.1, 6.5, 7.1_
  
  - [x] 6.11 Refactor Reports.tsx
    - Use text-2xl font-bold for page title
    - Add CardHeader + CardTitle for report cards
    - Use text-sm for report descriptions
    - Ensure Button components use default sizes
    - Use gap-6 for report card grid
    - _Requirements: 1.2, 2.1, 2.3, 2.4, 4.4, 5.1_
  
  - [x] 6.12 Refactor Settings.tsx
    - Use text-2xl font-bold for page title
    - Add Card + CardHeader + CardTitle for setting sections
    - Ensure Form components use proper structure (FormField + FormItem + FormLabel + FormControl)
    - Use space-y-4 for form field spacing
    - Use space-y-6 for section spacing
    - Ensure Button components use default sizes
    - _Requirements: 1.2, 2.1, 2.3, 4.4, 4.5, 5.1, 5.4_

- [x] 7. Checkpoint - Verify all pages
  - Test all pages for visual consistency
  - Verify typography hierarchy across all pages
  - Test dark mode for all pages
  - Verify badge usage is consistent
  - Ask the user if questions arise

- [x] 8. Refactor Form Components and Dialogs
  - [x] 8.1 Audit and refactor all Dialog components
    - Ensure all dialogs use DialogHeader + DialogTitle + DialogDescription
    - Ensure all forms in dialogs use FormField + FormItem + FormLabel + FormControl
    - Use space-y-4 for form field spacing
    - Ensure Button components use default sizes
    - _Requirements: 1.2, 4.5, 5.3, 5.4_
  
  - [x] 8.2 Audit and refactor all standalone Form components
    - Ensure all forms use FormField + FormItem + FormLabel + FormControl structure
    - Ensure Input components use default height (h-9)
    - Use space-y-4 for form field spacing
    - Ensure Button components use default sizes
    - _Requirements: 1.2, 1.3, 4.5, 5.4_

- [x] 9. Polish and Accessibility
  - [x] 9.1 Add consistent shadows and transitions
    - Ensure Cards use shadow-sm for elevation
    - Add smooth transitions to interactive elements (transition-colors, transition-transform)
    - Ensure hover states use bg-accent for subtle feedback
    - Ensure focus states use ring-1 ring-ring/30
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [x] 9.2 Verify accessibility compliance
    - Ensure all interactive elements have proper focus states
    - Verify all form fields have associated labels
    - Verify all buttons have descriptive text or aria-labels
    - Test keyboard navigation throughout the app
    - _Requirements: 9.1, 9.3, 9.4_
  
  - [ ]* 9.3 Run color contrast verification
    - Calculate contrast ratios for all text/background combinations
    - Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
    - Document any contrast issues and fix them
    - _Requirements: 9.2_

- [x] 10. Compliance Testing and Documentation
  - [x] 10.1 Implement codebase scanning tests

    - Create test to scan for arbitrary font sizes (text-[Npx])
    - Create test to scan for arbitrary icon sizes (size={N})
    - Create test to scan for custom compact utilities
    - Create test to scan for inline badge color classes
    - Create test to scan for hardcoded color values
    - Run all compliance tests and fix any violations
    - _Requirements: 2.7, 3.4, 4.1, 6.3, 7.2_
  
  - [ ]* 10.2 Set up continuous compliance monitoring
    - Add ESLint rules to prevent arbitrary Tailwind values
    - Configure pre-commit hooks to run compliance tests
    - Set up CI/CD pipeline to run compliance tests on PRs
    - _Requirements: 10.1, 10.3_
  
  - [x] 10.3 Update design system documentation

    - Document typography scale and usage guidelines
    - Document icon sizing standards
    - Document spacing system
    - Document badge variants and usage
    - Document color token usage patterns
    - Create component usage examples
    - _Requirements: 10.2, 10.5_

- [x] 11. Final Checkpoint - Complete verification
  - Run full test suite
  - Perform visual regression testing on all pages
  - Test dark mode across entire application
  - Verify accessibility with screen reader
  - Test keyboard navigation throughout
  - Ensure all compliance tests pass
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster completion
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and allow for user feedback
- The refactoring is incremental to minimize risk and allow testing at each step
- Focus on visual consistency and adherence to shadcn/ui design principles
- Maintain existing functionality - no breaking changes to behavior

