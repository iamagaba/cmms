# Implementation Plan: Inventory Stock Adjustments

## Overview

This plan implements batch stock adjustments with audit trail functionality. Tasks are ordered to build incrementally, starting with database schema, then types, then UI components.

## Tasks

- [x] 1. Database schema and types setup
  - [x] 1.1 Create stock_adjustments table migration
    - Create SQL migration file with table, indexes, and RLS policies
    - _Requirements: 4.1, 4.3_
  - [x] 1.2 Update TypeScript types
    - Add StockAdjustment interface and AdjustmentReason type to supabase.ts
    - _Requirements: 4.1_

- [x] 2. Core adjustment logic
  - [x] 2.1 Implement validation functions
    - Create validateAdjustment function to check for negative quantities
    - Create validateBatchAdjustment for batch validation
    - _Requirements: 1.8, 2.2_
  - [ ]* 2.2 Write property test for negative quantity prevention
    - **Property 4: Negative Quantity Prevention**
    - **Validates: Requirements 1.8**
  - [x] 2.3 Implement batch adjustment mutation
    - Create createBatchAdjustment function with atomic transaction
    - Update inventory quantities and create adjustment records
    - _Requirements: 1.7, 1.9, 4.1, 4.2_
  - [ ]* 2.4 Write property test for adjustment record integrity
    - **Property 5: Adjustment Record Integrity**
    - **Validates: Requirements 1.9, 4.1, 4.2**

- [x] 3. Checkpoint - Core logic complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Stock Adjustment Dialog UI
  - [x] 4.1 Create AdjustmentReasonBadge component
    - Display reason with appropriate color styling
    - _Requirements: 2.1, 2.3_
  - [x] 4.2 Create StockAdjustmentDialog component
    - Slide-over dialog with item search and selection
    - Line items with quantity delta input and projected quantity
    - Reason dropdown and notes field
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2_
  - [ ]* 4.3 Write property test for projected quantity calculation
    - **Property 2: Projected Quantity Calculation**
    - **Validates: Requirements 1.4**

- [x] 5. Adjustment History UI
  - [x] 5.1 Create AdjustmentHistoryPanel component
    - Display list of adjustments with timestamp, delta, reason, notes
    - Support both item-specific and global views
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 5.2 Add history filtering functionality
    - Date range picker, reason filter, item filter for global view
    - _Requirements: 3.4, 3.5_
  - [ ]* 5.3 Write property test for history chronological ordering
    - **Property 9: History Chronological Ordering**
    - **Validates: Requirements 3.5**

- [x] 6. Integration with Inventory Page
  - [x] 6.1 Add batch adjustment button to Inventory page header
    - Opens StockAdjustmentDialog
    - _Requirements: 1.1_
  - [x] 6.2 Add Quick Adjust button to item detail view
    - Opens StockAdjustmentDialog pre-populated with selected item
    - _Requirements: 5.1, 5.2_
  - [x] 6.3 Add adjustment history tab/section to item detail view
    - Shows AdjustmentHistoryPanel for selected item
    - _Requirements: 3.1_
  - [x] 6.4 Add global adjustment history access
    - Navigation or button to view all adjustments
    - _Requirements: 3.3_

- [x] 7. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests
- Database migration should be run via Supabase CLI or dashboard
- All components follow existing enterprise design patterns
- React Query handles caching and invalidation
