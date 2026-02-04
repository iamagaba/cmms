// App constants
export const APP_NAME = 'CMMS Mobile';
export const APP_VERSION = '1.0.0';

// API constants
export const API_TIMEOUT = 10000; // 10 seconds
export const RETRY_ATTEMPTS = 3;

// Cache constants
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
export const OFFLINE_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Location constants
export const LOCATION_ACCURACY_THRESHOLD = 100; // meters
export const PROXIMITY_THRESHOLD = 50; // meters for auto check-in

// Work order constants
export const WORK_ORDER_STATUSES = {
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  ON_HOLD: 'On Hold',
} as const;

export const WORK_ORDER_PRIORITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  EMERGENCY: 'Emergency',
} as const;

export const MOBILE_STATUSES = {
  ASSIGNED: 'assigned',
  TRAVELING: 'traveling',
  ON_SITE: 'on_site',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

// Notification constants
export const NOTIFICATION_TYPES = {
  WORK_ORDER_ASSIGNED: 'work_order_assigned',
  WORK_ORDER_UPDATED: 'work_order_updated',
  EMERGENCY_ORDER: 'emergency_order',
  PARTS_REQUIRED: 'parts_required',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  LAST_SYNC: 'last_sync',
  OFFLINE_DATA: 'offline_data',
  SESSION_CONFIG: 'session_config',
  APP_SETTINGS: 'app_settings',
  THEME_PREFERENCE: 'theme_preference',
  LANGUAGE_PREFERENCE: 'language_preference',
} as const;