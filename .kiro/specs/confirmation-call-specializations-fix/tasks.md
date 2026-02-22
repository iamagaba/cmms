# Implementation Plan: Confirmation Call Specializations Fix

## Overview

This implementation plan addresses the database error that occurs during work order confirmation calls. The fix involves creating a new database migration that updates the trigger function to remove the specializations dependency entirely. This unblocks the confirmation call workflow immediately without requiring a service_categories table.

## Tasks

- [x] 1. Create the database migration file
  - Create file `supabase/migrations/YYYYMMDDHHMMSS_remove_specializations_from_assignment.sql`
  - Add migration header comment explaining the purpose
  - _Requirements: 1.1_

- [x] 2. Update the trigger function
  - [x] 2.1 Modify queue_work_order_for_assignment function
    - Remove service_categories table query
    - Remove required_specializations from INSERT statement
    - Preserve existing priority calculation logic
    - Preserve ON CONFLICT DO NOTHING behavior
    - Use CREATE OR REPLACE FUNCTION for safe update
    - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 2.2 Write property test for trigger execution
    - **Property 1: Trigger executes without errors for all work orders**
    - **Validates: Requirements 1.1, 1.2**
    - Test with work orders having NULL, valid, and invalid service_category_id
  
  - [ ]* 2.3 Write property test for auto-assignment control
    - **Property 2: Auto-assignment setting controls queue insertion**
    - **Validates: Requirements 3.2**
    - Test that queue insertion only occurs when auto_assignment_enabled is true

- [x] 3. Update assignment_queue table schema (if needed)
  - [x] 3.1 Check if required_specializations column exists in assignment_queue
    - If it exists and is NOT NULL, alter it to allow NULL values
    - If it exists and has a default, remove the default constraint
    - _Requirements: 1.3, 1.4_
  
  - [ ]* 3.2 Write unit test for schema compatibility
    - Verify assignment_queue accepts records without specializations
    - _Requirements: 1.3_

- [x] 4. Add migration documentation
  - [x] 4.1 Add inline comments explaining the change
    - Document why specializations are being removed
    - Document trigger function changes
    - _Requirements: 1.1_

- [x] 5. Final checkpoint - Test migration
  - Run migration in development environment
  - Verify no errors occur
  - Verify trigger function works correctly
  - Test confirmation call flow end-to-end
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster deployment
- The migration uses PostgreSQL SQL with Supabase patterns
- All SQL statements use CREATE OR REPLACE for idempotency
- Property tests should use pgTAP or similar PostgreSQL testing framework
- Each property test should run minimum 100 iterations
- The migration preserves all existing data (Requirements 2.1, 2.2)
- The fix enables immediate resumption of confirmation call functionality
- Specializations can be added back in the future if needed
