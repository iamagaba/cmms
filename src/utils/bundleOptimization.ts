// Bundle optimization utilities and configurations

// Tree shaking configuration for Mantine components
export const MantineTreeShaking = {
  // Core components - import only what's needed
  core: [
    'Box',
    'Group',
    'Stack',
    'Text',
    'Title',
    'Button',
    'ActionIcon',
    'TextInput',
    'Select',
    'MultiSelect',
    'Checkbox',
    'Badge',
    'Card',
    'Paper',
    'Skeleton',
    'Loader',
    'Tooltip',
    'Menu',
    'Modal',
    'Drawer',
    'Notification',
    'Alert',
    'Progress',
    'Avatar',
    'Divider',
    'Container',
    'Grid',
    'Flex',
    'ScrollArea',
    'Collapse',
    'Transition',
    'UnstyledButton',
    'ThemeIcon',
  ],
  
  // Hooks - import selectively
  hooks: [
    'useDisclosure',
    'useDebouncedValue',
    'useMediaQuery',
    'useViewportSize',
    'useHover',
    'useClickOutside',
    'useLocalStorage',
    'useSessionStorage',
  ],
  
  // Dates - only if needed
  dates: [
    'DatePickerInput',
    'DatePicker',
    'Calendar',
  ],
  
  // Charts - lazy load these
  charts: [
    'LineChart',
    'AreaChart',
    'BarChart',
    'PieChart',
    'DonutChart',
  ],
  
  // Notifications - import only notification system
  notifications: [
    'notifications',
    'Notifications',
  ],
  
  // Spotlight - lazy load
  spotlight: [
    'Spotlight',
    'SpotlightProvider',
  ],
};

// Code splitting configuration
export const CodeSplittingConfig = {
  // Route-based splitting
  routes: {
    dashboard: () => import('@/pages/Dashboard'),
    workOrders: () => import('@/pages/WorkOrders'),
    assets: () => import('@/pages/Assets'),
    technicians: () => import('@/pages/Technicians'),
    customers: () => import('@/pages/Customers'),
    locations: () => import('@/pages/Locations'),
    inventory: () => import('@/pages/Inventory'),
    calendar: () => import('@/pages/Calendar'),
    analytics: () => import('@/pages/Analytics'),
    settings: () => import('@/pages/Settings'),
  },
  
  // Component-based splitting
  components: {
    // Heavy data tables
    workOrderTable: () => import('@/components/tables/ModernWorkOrderDataTable'),
    assetTable: () => import('@/components/tables/ModernAssetDataTable'),
    technicianTable: () => import('@/components/tables/ModernTechnicianDataTable'),
    
    // Charts
    charts: () => import('@/components/charts'),
    
    // Forms
    forms: () => import('@/components/forms'),
    
    // Maps
    maps: () => import('@/components/maps'),
    
    // Calendar
    calendar: () => import('@/components/calendar'),
  },
  
  // Feature-based splitting
  features: {
    diagnostics: () => import('@/features/diagnostics'),
    routing: () => import('@/features/routing'),
    costTracking: () => import('@/features/costTracking'),
    resourcePlanning: () => import('@/features/resourcePlanning'),
  },
};

// Bundle analysis helpers
export const BundleAnalysis = {
  // Measure bundle impact of imports
  measureImportSize: async (importFn: () => Promise<any>) => {
    const start = performance.now();
    const module = await importFn();
    const end = performance.now();
    
    console.log(`Import took ${end - start}ms`);
    return module;
  },
  
  // Log bundle sizes in development
  logBundleInfo: () => {
    if (process.env.NODE_ENV === 'development') {
      console.group('Bundle Information');
      console.log('Mantine Core:', import('@mantine/core'));
      console.log('Mantine Hooks:', import('@mantine/hooks'));
      console.log('Mantine DataTable:', import('mantine-datatable'));
      console.log('Iconify React:', import('@iconify/react'));
      console.groupEnd();
    }
  },
};

// Performance optimization presets
export const PerformancePresets = {
  // Minimal bundle - only essential components
  minimal: {
    mantine: {
      core: ['Box', 'Group', 'Stack', 'Text', 'Button'],
      hooks: ['useDisclosure', 'useDebouncedValue'],
    },
    features: ['basic-crud'],
  },
  
  // Standard bundle - common components
  standard: {
    mantine: {
      core: MantineTreeShaking.core.slice(0, 15), // First 15 components
      hooks: MantineTreeShaking.hooks.slice(0, 6), // First 6 hooks
    },
    features: ['basic-crud', 'search', 'filtering'],
  },
  
  // Full bundle - all components (for development)
  full: {
    mantine: MantineTreeShaking,
    features: ['all'],
  },
};

// Dynamic import helpers
export const DynamicImports = {
  // Mantine components
  getMantineComponent: (componentName: string) => {
    return import('@mantine/core').then(module => module[componentName]);
  },
  
  // Third-party libraries
  getLibrary: (libraryName: string) => {
    const libraries = {
      dayjs: () => import('dayjs'),
      iconify: () => import('@iconify/react'),
      datatable: () => import('mantine-datatable'),
      recharts: () => import('recharts'),
      'react-big-calendar': () => import('react-big-calendar'),
    };
    
    return libraries[libraryName as keyof typeof libraries]?.();
  },
  
  // Feature modules
  getFeature: (featureName: string) => {
    return CodeSplittingConfig.features[featureName as keyof typeof CodeSplittingConfig.features]?.();
  },
};

// Webpack optimization hints
export const WebpackOptimizations = {
  // Chunk splitting strategy
  chunks: {
    vendor: {
      test: /[\\/]node_modules[\\/]/,
      name: 'vendors',
      chunks: 'all',
    },
    mantine: {
      test: /[\\/]node_modules[\\/]@mantine[\\/]/,
      name: 'mantine',
      chunks: 'all',
    },
    common: {
      name: 'common',
      minChunks: 2,
      chunks: 'all',
    },
  },
  
  // Tree shaking configuration
  treeShaking: {
    sideEffects: false,
    usedExports: true,
  },
  
  // Module concatenation
  concatenateModules: true,
  
  // Minimize configuration
  minimize: true,
};

// Runtime optimization helpers
export const RuntimeOptimizations = {
  // Preload critical resources
  preloadCritical: () => {
    // Preload critical CSS
    const criticalCSS = document.createElement('link');
    criticalCSS.rel = 'preload';
    criticalCSS.as = 'style';
    criticalCSS.href = '/critical.css';
    document.head.appendChild(criticalCSS);
    
    // Preload critical fonts
    const criticalFont = document.createElement('link');
    criticalFont.rel = 'preload';
    criticalFont.as = 'font';
    criticalFont.type = 'font/woff2';
    criticalFont.href = '/fonts/inter-var.woff2';
    criticalFont.crossOrigin = 'anonymous';
    document.head.appendChild(criticalFont);
  },
  
  // Prefetch non-critical resources
  prefetchNonCritical: () => {
    // Prefetch likely next pages
    const prefetchPages = ['/work-orders', '/assets', '/technicians'];
    prefetchPages.forEach(page => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      document.head.appendChild(link);
    });
  },
  
  // Service worker for caching
  registerServiceWorker: async () => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  },
};

// Memory optimization
export const MemoryOptimizations = {
  // Clean up event listeners
  cleanupEventListeners: () => {
    // Remove global event listeners that might cause memory leaks
    window.removeEventListener('resize', () => {});
    window.removeEventListener('scroll', () => {});
  },
  
  // Clear caches periodically
  clearCaches: () => {
    // Clear component caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('old-')) {
            caches.delete(name);
          }
        });
      });
    }
  },
  
  // Garbage collection hints (development only)
  forceGC: () => {
    if (process.env.NODE_ENV === 'development' && 'gc' in window) {
      (window as any).gc();
    }
  },
};