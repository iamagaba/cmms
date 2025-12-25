# Implementation Plan: Inventory Categorization & Organization

## Overview

This plan implements categorization, supplier tracking, storage locations, and units of measure for inventory items.

## Tasks

- [x] 1. Database schema and types
  - [x] 1.1 Create suppliers table and inventory_items extensions migration
    - Create SQL migration with suppliers table and new inventory_items columns
    - _Requirements: 2.1, 3.1, 4.1_
  - [x] 1.2 Update TypeScript types
    - Add Supplier, ItemCategory, UnitOfMeasure types
    - Extend InventoryItem interface with new fields
    - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 2. Utility functions and constants
  - [x] 2.1 Create inventory categorization helpers
    - Category labels, unit labels, location formatting, base unit calculation
    - _Requirements: 3.5, 4.4_
  - [ ]* 2.2 Write property test for storage location formatting
    - **Property 4: Storage Location Format Consistency**
    - **Validates: Requirements 3.5**
  - [ ]* 2.3 Write property test for base unit conversion
    - **Property 5: Base Unit Conversion Accuracy**
    - **Validates: Requirements 4.4**

- [x] 3. Supplier management
  - [x] 3.1 Create useSuppliers hook
    - CRUD operations for suppliers
    - _Requirements: 2.1, 2.6_
  - [x] 3.2 Create SupplierSelect component
    - Dropdown with search and inline creation
    - _Requirements: 2.2, 2.4_

- [x] 4. Checkpoint - Core utilities complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Form field components
  - [x] 5.1 Create CategoryMultiSelect component
    - Multi-select with category badges
    - _Requirements: 1.2_
  - [x] 5.2 Create StorageLocationFields component
    - Warehouse, zone, aisle, bin, shelf inputs
    - _Requirements: 3.2_
  - [x] 5.3 Create UnitOfMeasureSelect component
    - Unit dropdown with conversion factor input
    - _Requirements: 4.2, 4.3_

- [x] 6. Update InventoryItemFormDialog
  - [x] 6.1 Add category selection to form
    - Integrate CategoryMultiSelect
    - _Requirements: 1.2_
  - [x] 6.2 Add supplier selection to form
    - Integrate SupplierSelect
    - _Requirements: 2.2_
  - [x] 6.3 Add storage location fields to form
    - Integrate StorageLocationFields
    - _Requirements: 3.2_
  - [x] 6.4 Add unit of measure fields to form
    - Integrate UnitOfMeasureSelect
    - _Requirements: 4.2, 4.3_

- [x] 7. Update Inventory page display
  - [x] 7.1 Add category badges to list items
    - Show categories in inventory list
    - _Requirements: 1.3_
  - [x] 7.2 Add supplier and location to detail view
    - Show supplier info and storage location in item details
    - _Requirements: 2.3, 3.3_
  - [x] 7.3 Add unit display to quantity fields
    - Show quantity with unit and base unit conversion
    - _Requirements: 4.4_

- [x] 8. Enhanced filtering
  - [x] 8.1 Add category filter to filter panel
    - Multi-select category filter
    - _Requirements: 1.4, 1.5_
  - [x] 8.2 Add supplier filter to filter panel
    - Supplier dropdown filter
    - _Requirements: 2.5_
  - [x] 8.3 Add warehouse filter to filter panel
    - Warehouse dropdown filter
    - _Requirements: 3.4_
  - [x] 8.4 Update filter logic for new fields
    - Apply AND logic for all filters
    - _Requirements: 5.1, 5.2_
  - [ ]* 8.5 Write property test for multi-filter AND logic
    - **Property 6: Multi-Filter AND Logic**
    - **Validates: Requirements 5.2**

- [x] 9. Final checkpoint
  - All implementation tasks complete. Optional property tests can be added later.

## Notes

- Tasks marked with `*` are optional property-based tests
- Database migration should be run via Supabase CLI or dashboard
- All components follow existing enterprise design patterns
