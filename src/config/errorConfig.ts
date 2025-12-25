/**
 * Error handling configuration
 * Centralized configuration for error handling, logging, and recovery
 */

export interface ErrorConfig {
  // Logging configuration
  logging: {
    enabled: boolean;
    level: 'error' | 'warn' | 'info' | 'debug';
    maxLogs: number;
    retentionDays: number;
    enableConsoleLogging: boolean;
    enableLocalStorage: boolean;
  };

  // Error reporting configuration
  reporting: {
    enabled: boolean;
    autoReport: boolean;
    reportingService?: 'sentry' | 'bugsnag' | 'custom';
    apiEndpoint?: string;
    apiKey?: string;
    enableUserReporting: boolean;
    enableScreenshots: boolean;
  };

  // Recovery configuration
  recovery: {
    maxRetries: number;
    retryDelay: number;
    exponentialBackoff: boolean;
    enableAutoRecovery: boolean;
    recoveryStrategies: {
      network: boolean;
      permission: boolean;
      chunk: boolean;
      memory: boolean;
    };
  };

  // Performance monitoring
  performance: {
    enabled: boolean;
    longTaskThreshold: number;
    memoryThreshold: number;
    loadTimeThreshold: number;
    enableResourceMonitoring: boolean;
  };

  // Feature-specific configurations
  features: {
    [featureName: string]: {
      errorLevel: 'error' | 'warn' | 'info';
      enableRecovery: boolean;
      customHandling?: boolean;
    };
  };

  // Development settings
  development: {
    enableDetailedErrors: boolean;
    enableStackTraces: boolean;
    enableComponentStack: boolean;
    enableErrorOverlay: boolean;
  };
}

// Default configuration
export const defaultErrorConfig: ErrorConfig = {
  logging: {
    enabled: true,
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
    maxLogs: 1000,
    retentionDays: 7,
    enableConsoleLogging: true,
    enableLocalStorage: true
  },

  reporting: {
    enabled: process.env.NODE_ENV === 'production',
    autoReport: false,
    enableUserReporting: true,
    enableScreenshots: false
  },

  recovery: {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    enableAutoRecovery: true,
    recoveryStrategies: {
      network: true,
      permission: true,
      chunk: true,
      memory: false
    }
  },

  performance: {
    enabled: true,
    longTaskThreshold: 50,
    memoryThreshold: 80,
    loadTimeThreshold: 3000,
    enableResourceMonitoring: process.env.NODE_ENV === 'development'
  },

  features: {
    work_orders: {
      errorLevel: 'error',
      enableRecovery: true
    },
    technicians: {
      errorLevel: 'error',
      enableRecovery: true
    },
    assets: {
      errorLevel: 'error',
      enableRecovery: true
    },
    dashboard: {
      errorLevel: 'warn',
      enableRecovery: true
    },
    calendar: {
      errorLevel: 'warn',
      enableRecovery: true
    },
    settings: {
      errorLevel: 'error',
      enableRecovery: false
    },
    authentication: {
      errorLevel: 'error',
      enableRecovery: false
    },
    data_sync: {
      errorLevel: 'warn',
      enableRecovery: true
    },
    geolocation: {
      errorLevel: 'info',
      enableRecovery: true
    },
    notifications: {
      errorLevel: 'warn',
      enableRecovery: true
    }
  },

  development: {
    enableDetailedErrors: process.env.NODE_ENV === 'development',
    enableStackTraces: process.env.NODE_ENV === 'development',
    enableComponentStack: process.env.NODE_ENV === 'development',
    enableErrorOverlay: process.env.NODE_ENV === 'development'
  }
};

// Error severity mapping
export const ERROR_SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
} as const;

// Error categories
export const ERROR_CATEGORIES = {
  NETWORK: 'network',
  PERMISSION: 'permission',
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  DATA: 'data',
  UI: 'ui',
  PERFORMANCE: 'performance',
  SYSTEM: 'system',
  UNKNOWN: 'unknown'
} as const;

// Recovery strategies
export const RECOVERY_STRATEGIES = {
  RETRY: 'retry',
  FALLBACK: 'fallback',
  REFRESH: 'refresh',
  REDIRECT: 'redirect',
  IGNORE: 'ignore'
} as const;

// Error messages for different scenarios
export const ERROR_MESSAGES = {
  NETWORK: {
    OFFLINE: 'You appear to be offline. Some features may be limited.',
    TIMEOUT: 'Request timed out. Please check your connection and try again.',
    SERVER_ERROR: 'Server error occurred. Please try again later.',
    CONNECTION_FAILED: 'Failed to connect to server. Please check your internet connection.'
  },
  
  PERMISSION: {
    LOCATION_DENIED: 'Location access denied. Please enable location services to use this feature.',
    CAMERA_DENIED: 'Camera access denied. Please enable camera permissions to use this feature.',
    MICROPHONE_DENIED: 'Microphone access denied. Please enable microphone permissions to use this feature.',
    NOTIFICATION_DENIED: 'Notification permission denied. You may miss important updates.'
  },
  
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_PHONE: 'Please enter a valid phone number.',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
    PASSWORDS_DONT_MATCH: 'Passwords do not match.'
  },
  
  AUTHENTICATION: {
    LOGIN_FAILED: 'Login failed. Please check your credentials and try again.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.'
  },
  
  DATA: {
    LOAD_FAILED: 'Failed to load data. Please try again.',
    SAVE_FAILED: 'Failed to save changes. Please try again.',
    DELETE_FAILED: 'Failed to delete item. Please try again.',
    SYNC_FAILED: 'Failed to sync data. Changes will be saved locally.'
  },
  
  UI: {
    COMPONENT_ERROR: 'A component encountered an error and has been reset.',
    RENDER_ERROR: 'Failed to render content. Please refresh the page.',
    INTERACTION_FAILED: 'Action failed. Please try again.'
  },
  
  PERFORMANCE: {
    SLOW_PERFORMANCE: 'The application is running slowly. Consider closing other tabs.',
    MEMORY_WARNING: 'High memory usage detected. Some features may be limited.',
    LONG_TASK: 'A long-running task is affecting performance.'
  },
  
  SYSTEM: {
    BROWSER_NOT_SUPPORTED: 'Your browser is not fully supported. Please update to the latest version.',
    FEATURE_NOT_SUPPORTED: 'This feature is not supported in your browser.',
    STORAGE_FULL: 'Local storage is full. Some features may not work properly.'
  }
} as const;

// Configuration validation
export function validateErrorConfig(config: Partial<ErrorConfig>): ErrorConfig {
  return {
    ...defaultErrorConfig,
    ...config,
    logging: {
      ...defaultErrorConfig.logging,
      ...config.logging
    },
    reporting: {
      ...defaultErrorConfig.reporting,
      ...config.reporting
    },
    recovery: {
      ...defaultErrorConfig.recovery,
      ...config.recovery,
      recoveryStrategies: {
        ...defaultErrorConfig.recovery.recoveryStrategies,
        ...config.recovery?.recoveryStrategies
      }
    },
    performance: {
      ...defaultErrorConfig.performance,
      ...config.performance
    },
    features: {
      ...defaultErrorConfig.features,
      ...config.features
    },
    development: {
      ...defaultErrorConfig.development,
      ...config.development
    }
  };
}

// Get configuration for specific feature
export function getFeatureErrorConfig(feature: string, config: ErrorConfig = defaultErrorConfig) {
  return config.features[feature] || {
    errorLevel: 'error' as const,
    enableRecovery: true
  };
}

// Check if error reporting is enabled
export function isErrorReportingEnabled(config: ErrorConfig = defaultErrorConfig): boolean {
  return config.reporting.enabled && (
    config.reporting.reportingService !== undefined ||
    config.reporting.apiEndpoint !== undefined
  );
}

// Check if performance monitoring is enabled
export function isPerformanceMonitoringEnabled(config: ErrorConfig = defaultErrorConfig): boolean {
  return config.performance.enabled;
}

export default defaultErrorConfig;