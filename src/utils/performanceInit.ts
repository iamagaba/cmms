import { getDeviceOptimizedConfig } from '@/config/performance';
import { RuntimeOptimizations, MemoryOptimizations } from './bundleOptimization';
import { preloadCriticalComponents, preloadRouteComponents } from '@/components/lazy/LazyComponents';

// Initialize performance optimizations
export function initializePerformanceOptimizations() {
  const config = getDeviceOptimizedConfig();

  console.log('Initializing performance optimizations...', config);

  // 1. Runtime optimizations
  if (config.bundleOptimization.preloadCritical) {
    RuntimeOptimizations.preloadCritical();
  }

  // 2. Service worker registration
  if (config.features.serviceWorker) {
    RuntimeOptimizations.registerServiceWorker();
  }

  // 3. Preload critical components
  if (config.lazyLoading.enabled) {
    preloadCriticalComponents();
  }

  // 4. Set up memory management
  if (config.cache.enabled) {
    setupMemoryManagement();
  }

  // 5. Set up performance monitoring
  if (config.monitoring.enabled) {
    setupPerformanceMonitoring();
  }

  // 6. Set up route-based preloading
  setupRoutePreloading();

  // 7. Set up cleanup on page unload
  setupCleanup();

  console.log('Performance optimizations initialized successfully');
}

// Set up memory management
function setupMemoryManagement() {
  // Clean up caches periodically
  setInterval(() => {
    MemoryOptimizations.clearCaches();
  }, 5 * 60 * 1000); // Every 5 minutes

  // Clean up on low memory
  if ('memory' in performance) {
    const checkMemory = () => {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
      
      if (usedMB > limitMB * 0.8) { // 80% of limit
        console.warn('High memory usage detected, cleaning up...');
        MemoryOptimizations.clearCaches();
        MemoryOptimizations.forceGC();
      }
    };

    setInterval(checkMemory, 30 * 1000); // Every 30 seconds
  }
}

// Set up performance monitoring
function setupPerformanceMonitoring() {
  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            console.warn('Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
            });
          }
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.warn('Long task monitoring not supported');
    }
  }

  // Monitor layout shifts
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if ((entry as any).value > 0.1) { // CLS threshold
            console.warn('Layout shift detected:', {
              value: (entry as any).value,
              sources: (entry as any).sources,
            });
          }
        }
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('Layout shift monitoring not supported');
    }
  }

  // Monitor largest contentful paint
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('Largest Contentful Paint:', lastEntry.startTime);
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP monitoring not supported');
    }
  }
}

// Set up route-based preloading
function setupRoutePreloading() {
  // Preload components based on current route
  const currentPath = window.location.pathname;
  preloadRouteComponents(currentPath);

  // Set up intersection observer for navigation links
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement;
          const href = link.getAttribute('href');
          if (href && href.startsWith('/')) {
            preloadRouteComponents(href);
          }
        }
      });
    }, { rootMargin: '50px' });

    // Observe all navigation links
    setTimeout(() => {
      document.querySelectorAll('a[href^="/"]').forEach((link) => {
        observer.observe(link);
      });
    }, 1000);
  }
}

// Set up cleanup on page unload
function setupCleanup() {
  window.addEventListener('beforeunload', () => {
    MemoryOptimizations.cleanupEventListeners();
  });

  // Clean up on visibility change (tab switching)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Page is hidden, clean up non-essential resources
      MemoryOptimizations.clearCaches();
    }
  });
}

// Measure and log initial performance metrics
export function logInitialPerformanceMetrics() {
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      console.group('Initial Performance Metrics');
      console.log('DNS Lookup:', navigation.domainLookupEnd - navigation.domainLookupStart);
      console.log('TCP Connection:', navigation.connectEnd - navigation.connectStart);
      console.log('Request/Response:', navigation.responseEnd - navigation.requestStart);
      console.log('DOM Processing:', navigation.domContentLoadedEventEnd - navigation.responseEnd);
      console.log('Total Load Time:', navigation.loadEventEnd - navigation.navigationStart);
      
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log('Memory Usage:', {
          used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
          total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
          limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`,
        });
      }
      
      console.groupEnd();
    }, 2000);
  }
}

// Export performance utilities for use in components
export const PerformanceUtils = {
  measureComponentRender: (componentName: string, renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render time: ${end - start}ms`);
    }
  },

  measureAsyncOperation: async <T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const start = performance.now();
    const result = await operation();
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${operationName} took: ${end - start}ms`);
    }
    
    return result;
  },

  logMemoryUsage: (label: string) => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const memory = (performance as any).memory;
      console.log(`${label} - Memory:`, {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
      });
    }
  },
};