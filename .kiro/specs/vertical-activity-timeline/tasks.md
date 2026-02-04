# Implementation Plan: Vertical Activity Timeline

## Overview

This implementation plan breaks down the Vertical Activity Timeline feature into discrete coding tasks that build incrementally across all three platforms (desktop, mobile web, and native mobile). The approach focuses on establishing the data layer first, then implementing core timeline functionality, and finally adding advanced features like real-time updates and export capabilities.

## Tasks

- [x] 1. Set up database schema and core data models
  - Create work_order_activities table with proper indexing
  - Set up Supabase real-time subscriptions for the activities table
  - Define TypeScript interfaces for Activity, ActivityMetadata, and TimelineFilters
  - _Requirements: 9.1, 9.4, 2.1_

- [x] 2. Implement core Timeline Service layer
  - [x] 2.1 Create TimelineService with activity CRUD operations
    - Implement getActivities method with filtering support
    - Implement addNote method for creating note activities
    - Add proper error handling and data validation
    - _Requirements: 2.5, 5.2, 9.4_
  
  - [ ]* 2.2 Write property test for Timeline Service
    - **Property 17: Data persistence integrity**
    - **Validates: Requirements 9.1, 9.4**
  
  - [x] 2.3 Implement RealtimeManager for live updates
    - Create subscription management for work order activities
    - Handle connection loss and reconnection logic
    - Implement update queuing for offline scenarios
    - _Requirements: 4.2, 4.5_
  
  - [ ]* 2.4 Write property test for real-time updates
    - **Property 7: Real-time update integration**
    - **Validates: Requirements 4.2, 4.5**

- [x] 3. Implement Desktop Timeline Components (src/)
  - [x] 3.1 Create TimelineContainer component using shadcn/ui
    - Use Card, CardHeader, CardTitle, CardContent with default styling
    - Implement ScrollArea for timeline scrolling
    - Add TimelineFilters integration
    - _Requirements: 1.1, 1.2, 6.1_
  
  - [x] 3.2 Create TimelineItem component with activity type styling
    - Implement distinct visual indicators for each activity type
    - Use Lucide React icons with consistent sizing (w-5 h-5)
    - Add hover interactions and keyboard navigation
    - _Requirements: 1.5, 2.2, 6.1_
  
  - [ ]* 3.3 Write property tests for desktop timeline display
    - **Property 1: Chronological ordering consistency**
    - **Property 3: Activity type visual distinction**
    - **Validates: Requirements 1.1, 1.5, 2.2**
  
  - [x] 3.4 Implement TimelineFilters component
    - Create date range picker using shadcn/ui components
    - Add activity type multi-select with checkboxes
    - Implement technician dropdown with search
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 3.5 Write property test for filtering functionality
    - **Property 6: Compound filtering accuracy**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

- [x] 4. Implement Mobile Web Timeline Components (mobile-web/)
  - [x] 4.1 Create TimelineContainer with custom Tailwind styling
    - Use touch-optimized interactions with min-h-[44px] tap targets
    - Implement responsive design with mobile-first approach
    - Add pull-to-refresh functionality
    - _Requirements: 1.1, 1.2, 6.2_
  
  - [x] 4.2 Create mobile-optimized TimelineItem component
    - Implement touch-friendly activity cards
    - Use industrial color system (steel blue, safety orange)
    - Ensure proper touch target sizes for all interactive elements
    - _Requirements: 1.5, 2.2, 6.2_
  
  - [ ]* 4.3 Write property test for mobile web touch interactions
    - **Property 11: Platform-specific interaction optimization**
    - **Validates: Requirements 6.2**
  
  - [x] 4.4 Implement mobile TimelineFilters with drawer interface
    - Create slide-up filter drawer for mobile
    - Optimize filter controls for touch interaction
    - Add clear visual feedback for applied filters
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 5. Implement Native Mobile Timeline Components (mobile/)
  - [x] 5.1 Create TimelineContainer using React Native Paper
    - Use Card component with elevation={2}
    - Implement FlatList for efficient scrolling
    - Add platform-specific navigation integration
    - _Requirements: 1.1, 1.2, 6.3_
  
  - [x] 5.2 Create native TimelineItem with Material Design
    - Use React Native Paper components and theming
    - Implement platform-specific gestures
    - Add proper accessibility labels for screen readers
    - _Requirements: 1.5, 2.2, 6.3_
  
  - [ ]* 5.3 Write property test for cross-platform data consistency
    - **Property 12: Cross-platform data consistency**
    - **Validates: Requirements 6.4**
  
  - [x] 5.4 Implement native TimelineFilters with modal interface
    - Create modal-based filter interface
    - Use React Native Paper components
    - Add platform-specific date/time pickers
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 6. Checkpoint - Core timeline functionality complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Add Note functionality across platforms
  - [x] 7.1 Create AddNoteInterface for desktop (shadcn/ui)
    - Implement expandable textarea with rich text support
    - Add character count and save/cancel actions
    - Use shadcn/ui Form components with validation
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 7.2 Create mobile web AddNoteInterface (custom Tailwind)
    - Implement touch-optimized note input
    - Add rich text formatting toolbar
    - Ensure proper keyboard handling on mobile
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 7.3 Create native AddNoteInterface (React Native Paper)
    - Use TextInput with multiline support
    - Implement platform-specific rich text editing
    - Add proper keyboard avoidance
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ]* 7.4 Write property tests for note functionality
    - **Property 8: Note processing completeness**
    - **Property 9: Rich text formatting support**
    - **Validates: Requirements 5.2, 5.3, 5.4**
  
  - [ ]* 7.5 Write unit tests for note error handling
    - Test note validation failures
    - Test network error scenarios
    - Test retry functionality
    - _Requirements: 5.5_

- [x] 8. Implement advanced filtering and search
  - [x] 8.1 Add date grouping functionality to timeline display
    - Implement date separators for multi-day activities
    - Add proper spacing and visual hierarchy
    - Ensure consistent styling across platforms
    - _Requirements: 1.3_
  
  - [ ]* 8.2 Write property test for date grouping
    - **Property 4: Date grouping accuracy**
    - **Validates: Requirements 1.3**
  
  - [x] 8.3 Implement search functionality for large datasets
    - Add search input to filter components
    - Implement debounced search with highlighting
    - Add search result count and clear functionality
    - _Requirements: 8.5_
  
  - [ ]* 8.4 Write property test for search functionality
    - **Property 16: Search functionality accuracy**
    - **Validates: Requirements 8.5**

- [x] 9. Implement performance optimizations
  - [x] 9.1 Add virtual scrolling for large activity lists
    - Implement virtual scrolling for desktop ScrollArea
    - Add pagination for mobile web and native
    - Ensure smooth scrolling performance
    - _Requirements: 8.1, 8.2_
  
  - [ ]* 9.2 Write property test for performance optimizations
    - **Property 15: Performance optimization with large datasets**
    - **Validates: Requirements 8.1, 8.2**
  
  - [x] 9.3 Implement activity data pagination
    - Add pagination to TimelineService
    - Implement infinite scroll loading
    - Add loading states and error handling
    - _Requirements: 8.2_

- [x] 10. Implement export functionality
  - [x] 10.1 Create ExportService for timeline data
    - Implement PDF export using jsPDF or similar
    - Implement CSV export with proper formatting
    - Add export filtering based on current timeline filters
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 10.2 Write property tests for export functionality
    - **Property 13: Export completeness and format support**
    - **Property 14: Export error handling**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
  
  - [x] 10.3 Add export UI controls to all platforms
    - Add export buttons to timeline headers
    - Implement format selection (PDF/CSV)
    - Add export progress indicators
    - _Requirements: 7.1, 7.5_

- [x] 11. Implement comprehensive error handling
  - [x] 11.1 Add error boundaries and fallback UI
    - Create error boundaries for timeline components
    - Implement graceful degradation for real-time failures
    - Add retry mechanisms for failed operations
    - _Requirements: 5.5, 7.5_
  
  - [ ]* 11.2 Write property test for error handling
    - **Property 10: Error handling consistency**
    - **Validates: Requirements 5.5**
  
  - [x] 11.3 Implement offline support and sync
    - Add offline activity queuing
    - Implement sync when connection restored
    - Add offline indicators to UI
    - _Requirements: 4.3_

- [x] 12. Add comprehensive testing and accessibility
  - [ ]* 12.1 Write remaining property tests
    - **Property 2: Complete activity data display**
    - **Property 5: Activity type tracking completeness**
    - **Property 18: Historical data immutability**
    - **Validates: Requirements 1.2, 2.1, 2.3, 2.4, 2.5, 9.5**
  
  - [ ]* 12.2 Write unit tests for edge cases
    - Empty timeline state display
    - Add note button click interaction
    - Export with no activities
    - Network failure scenarios
  
  - [ ]* 12.3 Add accessibility testing and improvements
    - Implement WCAG compliance testing
    - Add screen reader support
    - Test keyboard navigation
    - Add proper ARIA labels

- [x] 13. Integration and final wiring
  - [x] 13.1 Wire timeline components into existing work order views
    - Integrate timeline into desktop work order detail page
    - Add timeline to mobile web work order view
    - Integrate with native mobile work order screen
    - _Requirements: 6.4_
  
  - [x] 13.2 Set up real-time subscriptions in work order contexts
    - Initialize real-time subscriptions when viewing work orders
    - Clean up subscriptions on navigation away
    - Handle subscription errors gracefully
    - _Requirements: 4.1, 4.2_
  
  - [x] 13.3 Add activity tracking to existing work order operations
    - Hook into work order status changes
    - Track assignment changes
    - Record work order creation activities
    - _Requirements: 2.1, 2.3, 2.4_

- [x] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests focus on specific examples, edge cases, and error conditions
- Cross-platform implementation maintains visual consistency while respecting platform conventions
- Real-time functionality uses Supabase Realtime for live synchronization
- Performance optimizations ensure smooth experience with large activity datasets