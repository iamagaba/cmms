// Performance configuration for the CMMS application

export const PerformanceConfig = {
  // Virtualization settings
  virtualization: {
    enabled: true,
    threshold: 100, // Start virtualizing when more than 100 items
    itemHeight: {
      compact: 50,
      normal: 70,
      expanded: 100,
    },
    overscan: 5, // Number of items to render outside visible area
  },

  // Lazy loading settings
  lazyLoading: {
    enabled: true,
    intersectionThreshold: 0.1,
    rootMargin: '50px',
    preloadDistance: 2, // Preload components 2 routes away
  },

  // Memoization settings
  memoization: {
    enabled: true,
    maxCacheSize: 100,
    ttl: 5 * 60 * 1000, // 5 minutes
  },

  // Debouncing settings
  debouncing: {
    search: 300, // ms
    filter: 200, // ms
    resize: 100, // ms
    scroll: 16, // ms (~60fps)
  },

  // Bundle optimization
  bundleOptimization: {
    treeShaking: true,
    codeSplitting: true,
    dynamicImports: true,
    preloadCritical: true,
  },

  // Performance monitoring
  monitoring: {
    enabled: process.env.NODE_ENV === 'development',
    showInProduction: false,
    logToConsole: true,
    trackMemory: true,
    trackRenderTime: true,
    thresholds: {
      renderTime: 16, // ms (60fps)
      memoryUsage: 50, // MB
      reRenderCount: 10,
      bundleSize: 1024, // KB
    },
  },

  // Data processing
  dataProcessing: {
    chunkSize: 100,
    batchDelay: 16, // ms
    maxConcurrentOperations: 3,
  },

  // Cache settings
  cache: {
    enabled: true,
    maxSize: 50, // MB
    ttl: 10 * 60 * 1000, // 10 minutes
    strategies: {
      components: 'memory',
      data: 'indexeddb',
      images: 'cache-api',
    },
  },

  // Network optimization
  network: {
    retryAttempts: 3,
    retryDelay: 1000, // ms
    timeout: 30000, // ms
    batchRequests: true,
    compression: true,
  },

  // Feature flags for performance features
  features: {
    virtualScrolling: true,
    lazyComponents: true,
    memoizedSelectors: true,
    optimizedReRenders: true,
    bundleSplitting: true,
    serviceWorker: true,
    webWorkers: false, // Disabled by default
    offlineSupport: true,
  },
};

// Environment-specific overrides
export const getPerformanceConfig = () => {
  const config = { ...PerformanceConfig };

  // Production optimizations
  if (process.env.NODE_ENV === 'production') {
    config.monitoring.enabled = false;
    config.monitoring.logToConsole = false;
    config.virtualization.threshold = 50; // More aggressive virtualization
    config.lazyLoading.preloadDistance = 1; // Less aggressive preloading
  }

  // Development optimizations
  if (process.env.NODE_ENV === 'development') {
    config.monitoring.enabled = true;
    config.monitoring.showInProduction = false;
    config.virtualization.threshold = 200; // Less aggressive virtualization for debugging
    config.memoization.ttl = 1 * 60 * 1000; // Shorter cache for development
  }

  // Test environment
  if (process.env.NODE_ENV === 'test') {
    config.monitoring.enabled = false;
    config.lazyLoading.enabled = false; // Disable lazy loading in tests
    config.virtualization.enabled = false; // Disable virtualization in tests
  }

  return config;
};

// Performance presets for different use cases
export const PerformancePresets = {
  // High performance mode - maximum optimizations
  highPerformance: {
    ...PerformanceConfig,
    virtualization: {
      ...PerformanceConfig.virtualization,
      threshold: 25,
      overscan: 3,
    },
    memoization: {
      ...PerformanceConfig.memoization,
      maxCacheSize: 200,
    },
    debouncing: {
      ...PerformanceConfig.debouncing,
      search: 500,
      filter: 300,
    },
  },

  // Balanced mode - good performance with features
  balanced: PerformanceConfig,

  // Feature-rich mode - prioritize features over performance
  featureRich: {
    ...PerformanceConfig,
    virtualization: {
      ...PerformanceConfig.virtualization,
      threshold: 500,
      overscan: 10,
    },
    lazyLoading: {
      ...PerformanceConfig.lazyLoading,
      preloadDistance: 3,
    },
    debouncing: {
      ...PerformanceConfig.debouncing,
      search: 150,
      filter: 100,
    },
  },

  // Low-end device mode - optimized for slower devices
  lowEnd: {
    ...PerformanceConfig,
    virtualization: {
      ...PerformanceConfig.virtualization,
      threshold: 20,
      overscan: 2,
    },
    memoization: {
      ...PerformanceConfig.memoization,
      maxCacheSize: 50,
      ttl: 2 * 60 * 1000,
    },
    dataProcessing: {
      ...PerformanceConfig.dataProcessing,
      chunkSize: 50,
      maxConcurrentOperations: 1,
    },
  },
};

// Device-specific configuration
export const getDeviceOptimizedConfig = () => {
  const config = getPerformanceConfig();

  // Detect device capabilities
  const isLowEndDevice = navigator.hardwareConcurrency <= 2 || 
                        (navigator as any).deviceMemory <= 2;
  
  const isSlowConnection = (navigator as any).connection?.effectiveType === 'slow-2g' ||
                          (navigator as any).connection?.effectiveType === '2g';

  if (isLowEndDevice || isSlowConnection) {
    return PerformancePresets.lowEnd;
  }

  return config;
};