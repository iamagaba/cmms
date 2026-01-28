/**
 * Standardized Messages for Professional CMMS Design System
 * 
 * Copywriting Guidelines:
 * - Be Concise: Remove filler words (please, kindly, your, the, a, an, now, here, there, just, simply, easily)
 * - Be Direct: Start with action verbs, avoid passive voice
 * - Be Consistent: Use same terms throughout
 * - Be Professional: Avoid casual language, no exclamation marks
 */

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  // Network & Connection
  NETWORK_ERROR: 'Network connection failed',
  CONNECTION_TIMEOUT: 'Connection timeout',
  SERVER_ERROR: 'Server error occurred',
  
  // Data Operations
  SAVE_FAILED: 'Unable to save changes',
  DELETE_FAILED: 'Unable to delete item',
  UPDATE_FAILED: 'Unable to update item',
  LOAD_FAILED: 'Unable to load data',
  FETCH_FAILED: 'Unable to fetch data',
  
  // Work Orders
  WORK_ORDER_SAVE_FAILED: 'Unable to save work order',
  WORK_ORDER_DELETE_FAILED: 'Unable to delete work order',
  WORK_ORDER_UPDATE_FAILED: 'Unable to update work order',
  WORK_ORDER_LOAD_FAILED: 'Unable to load work order',
  
  // Assets
  ASSET_SAVE_FAILED: 'Unable to save asset',
  ASSET_DELETE_FAILED: 'Unable to delete asset',
  ASSET_UPDATE_FAILED: 'Unable to update asset',
  ASSET_LOAD_FAILED: 'Unable to load asset',
  
  // Technicians
  TECHNICIAN_SAVE_FAILED: 'Unable to save technician',
  TECHNICIAN_DELETE_FAILED: 'Unable to delete technician',
  TECHNICIAN_UPDATE_FAILED: 'Unable to update technician',
  TECHNICIAN_LOAD_FAILED: 'Unable to load technician',
  
  // Inventory
  INVENTORY_SAVE_FAILED: 'Unable to save inventory item',
  INVENTORY_DELETE_FAILED: 'Unable to delete inventory item',
  INVENTORY_UPDATE_FAILED: 'Unable to update inventory item',
  INVENTORY_LOAD_FAILED: 'Unable to load inventory item',
  STOCK_ADJUSTMENT_FAILED: 'Unable to adjust stock',
  
  // Suppliers
  SUPPLIER_SAVE_FAILED: 'Unable to save supplier',
  SUPPLIER_DELETE_FAILED: 'Unable to delete supplier',
  SUPPLIER_UPDATE_FAILED: 'Unable to update supplier',
  SUPPLIER_LOAD_FAILED: 'Unable to load supplier',
  
  // Authentication
  AUTH_FAILED: 'Authentication failed',
  SESSION_EXPIRED: 'Session expired',
  UNAUTHORIZED: 'Unauthorized access',
  
  // Validation
  VALIDATION_FAILED: 'Validation failed',
  INVALID_INPUT: 'Invalid input',
  REQUIRED_FIELD: 'Required field missing',
  
  // File Operations
  FILE_UPLOAD_FAILED: 'Unable to upload file',
  FILE_DELETE_FAILED: 'Unable to delete file',
  FILE_TOO_LARGE: 'File size exceeds limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  
  // Generic
  OPERATION_FAILED: 'Operation failed',
  UNEXPECTED_ERROR: 'Unexpected error occurred',
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  // Data Operations
  SAVED: 'Saved successfully',
  DELETED: 'Deleted successfully',
  UPDATED: 'Updated successfully',
  CREATED: 'Created successfully',
  
  // Work Orders
  WORK_ORDER_SAVED: 'Work order saved',
  WORK_ORDER_DELETED: 'Work order deleted',
  WORK_ORDER_UPDATED: 'Work order updated',
  WORK_ORDER_CREATED: 'Work order created',
  WORK_ORDER_ASSIGNED: 'Work order assigned',
  WORK_ORDER_COMPLETED: 'Work order completed',
  
  // Assets
  ASSET_SAVED: 'Asset saved',
  ASSET_DELETED: 'Asset deleted',
  ASSET_UPDATED: 'Asset updated',
  ASSET_CREATED: 'Asset created',
  
  // Technicians
  TECHNICIAN_SAVED: 'Technician saved',
  TECHNICIAN_DELETED: 'Technician deleted',
  TECHNICIAN_UPDATED: 'Technician updated',
  TECHNICIAN_CREATED: 'Technician added',
  
  // Inventory
  INVENTORY_SAVED: 'Inventory item saved',
  INVENTORY_DELETED: 'Inventory item deleted',
  INVENTORY_UPDATED: 'Inventory item updated',
  INVENTORY_CREATED: 'Inventory item created',
  STOCK_ADJUSTED: 'Stock adjusted',
  
  // Suppliers
  SUPPLIER_SAVED: 'Supplier saved',
  SUPPLIER_DELETED: 'Supplier deleted',
  SUPPLIER_UPDATED: 'Supplier updated',
  SUPPLIER_CREATED: 'Supplier created',
  
  // File Operations
  FILE_UPLOADED: 'File uploaded',
  FILE_DELETED: 'File deleted',
  
  // Generic
  OPERATION_COMPLETE: 'Operation complete',
} as const;

// ============================================================================
// VALIDATION MESSAGES
// ============================================================================

export const VALIDATION_MESSAGES = {
  // Required Fields
  REQUIRED: 'Required',
  FIELD_REQUIRED: (field: string) => `${field} is required`,
  
  // Format Validation
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PHONE: 'Invalid phone format',
  INVALID_URL: 'Invalid URL format',
  INVALID_DATE: 'Invalid date format',
  INVALID_NUMBER: 'Invalid number format',
  
  // Length Validation
  MIN_LENGTH: (field: string, min: number) => `${field} must be at least ${min} characters`,
  MAX_LENGTH: (field: string, max: number) => `${field} must not exceed ${max} characters`,
  
  // Range Validation
  MIN_VALUE: (field: string, min: number) => `${field} must be at least ${min}`,
  MAX_VALUE: (field: string, max: number) => `${field} must not exceed ${max}`,
  OUT_OF_RANGE: (field: string, min: number, max: number) => `${field} must be between ${min} and ${max}`,
  
  // Specific Fields
  TITLE_REQUIRED: 'Title is required',
  DESCRIPTION_REQUIRED: 'Description is required',
  ASSET_REQUIRED: 'Asset is required',
  TECHNICIAN_REQUIRED: 'Technician is required',
  PRIORITY_REQUIRED: 'Priority is required',
  STATUS_REQUIRED: 'Status is required',
  DATE_REQUIRED: 'Date is required',
  QUANTITY_REQUIRED: 'Quantity is required',
  REASON_REQUIRED: 'Reason is required',
  
  // Password Validation
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORD_MISMATCH: 'Passwords do not match',
  
  // Unique Validation
  ALREADY_EXISTS: (field: string) => `${field} already exists`,
  DUPLICATE_ENTRY: 'Duplicate entry',
} as const;

// ============================================================================
// EMPTY STATE MESSAGES
// ============================================================================

export const EMPTY_STATE_MESSAGES = {
  // Work Orders
  NO_WORK_ORDERS: 'No work orders',
  NO_WORK_ORDERS_FOUND: 'No work orders found',
  CREATE_FIRST_WORK_ORDER: 'Create your first work order',
  
  // Assets
  NO_ASSETS: 'No assets',
  NO_ASSETS_FOUND: 'No assets found',
  CREATE_FIRST_ASSET: 'Create your first asset',
  
  // Technicians
  NO_TECHNICIANS: 'No technicians',
  NO_TECHNICIANS_FOUND: 'No technicians found',
  ADD_FIRST_TECHNICIAN: 'Add your first technician',
  
  // Inventory
  NO_INVENTORY: 'No inventory items',
  NO_INVENTORY_FOUND: 'No inventory items found',
  CREATE_FIRST_INVENTORY: 'Create your first inventory item',
  
  // Suppliers
  NO_SUPPLIERS: 'No suppliers',
  NO_SUPPLIERS_FOUND: 'No suppliers found',
  CREATE_FIRST_SUPPLIER: 'Create your first supplier',
  
  // Search Results
  NO_RESULTS: 'No results found',
  NO_MATCHES: 'No matches found',
  TRY_DIFFERENT_SEARCH: 'Try different search terms',
  
  // Generic
  NO_DATA: 'No data available',
  NO_ITEMS: 'No items',
} as const;

// ============================================================================
// CONFIRMATION MESSAGES
// ============================================================================

export const CONFIRMATION_MESSAGES = {
  // Delete Confirmations
  DELETE_WORK_ORDER: 'Delete this work order?',
  DELETE_ASSET: 'Delete this asset?',
  DELETE_TECHNICIAN: 'Delete this technician?',
  DELETE_INVENTORY: 'Delete this inventory item?',
  DELETE_SUPPLIER: 'Delete this supplier?',
  
  // Action Confirmations
  DISCARD_CHANGES: 'Discard unsaved changes?',
  CANCEL_OPERATION: 'Cancel this operation?',
  COMPLETE_WORK_ORDER: 'Complete this work order?',
  ASSIGN_TECHNICIAN: 'Assign this technician?',
  
  // Warning Messages
  CANNOT_UNDO: 'This action cannot be undone',
  PERMANENT_ACTION: 'This is a permanent action',
} as const;

// ============================================================================
// LOADING MESSAGES
// ============================================================================

export const LOADING_MESSAGES = {
  LOADING: 'Loading',
  SAVING: 'Saving',
  DELETING: 'Deleting',
  UPDATING: 'Updating',
  CREATING: 'Creating',
  UPLOADING: 'Uploading',
  PROCESSING: 'Processing',
  
  // Specific Operations
  LOADING_WORK_ORDERS: 'Loading work orders',
  LOADING_ASSETS: 'Loading assets',
  LOADING_TECHNICIANS: 'Loading technicians',
  LOADING_INVENTORY: 'Loading inventory',
  LOADING_SUPPLIERS: 'Loading suppliers',
  
  SAVING_WORK_ORDER: 'Saving work order',
  SAVING_ASSET: 'Saving asset',
  SAVING_TECHNICIAN: 'Saving technician',
  SAVING_INVENTORY: 'Saving inventory item',
  SAVING_SUPPLIER: 'Saving supplier',
} as const;

// ============================================================================
// BUTTON LABELS
// ============================================================================

export const BUTTON_LABELS = {
  // Primary Actions
  CREATE: 'Create',
  SAVE: 'Save',
  DELETE: 'Delete',
  CANCEL: 'Cancel',
  EDIT: 'Edit',
  UPDATE: 'Update',
  SUBMIT: 'Submit',
  CONFIRM: 'Confirm',
  
  // Secondary Actions
  ADD: 'Add',
  REMOVE: 'Remove',
  ASSIGN: 'Assign',
  UNASSIGN: 'Unassign',
  EXPORT: 'Export',
  IMPORT: 'Import',
  DOWNLOAD: 'Download',
  UPLOAD: 'Upload',
  
  // Navigation
  BACK: 'Back',
  NEXT: 'Next',
  CLOSE: 'Close',
  VIEW: 'View',
  
  // Specific Actions
  ADD_TECHNICIAN: 'Add Technician',
  ADD_ASSET: 'Add Asset',
  ADD_SUPPLIER: 'Add Supplier',
  CREATE_WORK_ORDER: 'Create Work Order',
  CREATE_ASSET: 'Create Asset',
  CREATE_INVENTORY: 'Create Inventory Item',
  
  ASSIGN_TECHNICIAN: 'Assign Technician',
  COMPLETE_WORK_ORDER: 'Complete Work Order',
  ADJUST_STOCK: 'Adjust Stock',
} as const;

// ============================================================================
// FORM LABELS
// ============================================================================

export const FORM_LABELS = {
  // Common Fields
  TITLE: 'Title',
  DESCRIPTION: 'Description',
  NAME: 'Name',
  EMAIL: 'Email',
  PHONE: 'Phone',
  ADDRESS: 'Address',
  NOTES: 'Notes',
  
  // Work Order Fields
  ASSET: 'Asset',
  TECHNICIAN: 'Technician',
  PRIORITY: 'Priority',
  STATUS: 'Status',
  DUE_DATE: 'Due Date',
  COMPLETION_DATE: 'Completion Date',
  
  // Inventory Fields
  QUANTITY: 'Quantity',
  UNIT_PRICE: 'Unit Price',
  REORDER_POINT: 'Reorder Point',
  LOCATION: 'Location',
  
  // Supplier Fields
  SUPPLIER: 'Supplier',
  CONTACT_NAME: 'Contact Name',
  CONTACT_EMAIL: 'Contact Email',
  CONTACT_PHONE: 'Contact Phone',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get error message for a specific field validation
 */
export function getFieldError(field: string, error: string): string {
  return `${field} ${error}`;
}

/**
 * Get loading message for a specific operation
 */
export function getLoadingMessage(operation: string, entity: string): string {
  return `${operation} ${entity}`;
}

/**
 * Get success message for a specific operation
 */
export function getSuccessMessage(operation: string, entity: string): string {
  return `${entity} ${operation}`;
}
