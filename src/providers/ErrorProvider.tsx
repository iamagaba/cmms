import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { showError } from '@/utils/toast';
import { useErrorReporting } from '../components/error/ErrorReporting';
import { errorLogger } from '../utils/errorLogger';

interface ErrorContextValue {
  // Error logging
  logError: (error: Error, context?: any) => string;
  logWarning: (message: string, context?: any) => string;
  logInfo: (message: string, context?: any) => string;

  // Error reporting
  reportError: (error: Error, errorId: string, feature?: string, context?: any) => void;

  // Global error state
  globalError: Error | null;
  setGlobalError: (error: Error | null) => void;

  // Error metrics
  getErrorMetrics: () => any;
  clearErrors: () => void;
}

const ErrorContext = createContext<ErrorContextValue | null>(null);

interface ErrorProviderProps {
  children: ReactNode;
  enableGlobalErrorHandling?: boolean;
  enablePerformanceMonitoring?: boolean;
  maxRetries?: number;
}

export function ErrorProvider({
  children,
  enableGlobalErrorHandling = true,
  enablePerformanceMonitoring = true,
  maxRetries = 3
}: ErrorProviderProps) {
  const [globalError, setGlobalError] = useState<Error | null>(null);
  const { openErrorReport } = useErrorReporting();

  // Setup global error handlers
  React.useEffect(() => {
    if (!enableGlobalErrorHandling) return;

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = new Error(`Unhandled Promise Rejection: ${event.reason}`);
      errorLogger.logError(error, {
        feature: 'global',
        action: 'unhandled_rejection',
        additionalData: { reason: event.reason }
      });

      showError('An unexpected error occurred. The error has been logged.');
    };

    const handleError = (event: ErrorEvent) => {
      const error = new Error(event.message);
      errorLogger.logError(error, {
        feature: 'global',
        action: 'javascript_error',
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [enableGlobalErrorHandling]);

  // Performance monitoring
  React.useEffect(() => {
    if (!enablePerformanceMonitoring) return;

    // Monitor page load performance
    const checkPageLoadPerformance = () => {
      try {
        if ('performance' in window && 'getEntriesByType' in performance) {
          const entries = performance.getEntriesByType('navigation');
          if (!entries || entries.length === 0) return;

          const navigation = entries[0] as PerformanceNavigationTiming;

          if (navigation && navigation.loadEventEnd && navigation.loadEventStart) {
            const loadTime = navigation.loadEventEnd - navigation.loadEventStart;

            // Only log, don't show notifications for performance warnings
            if (loadTime > 3000) { // Log slow page loads (>3s)
              console.debug('Slow page load detected:', loadTime);
              errorLogger.logInfo('Slow page load detected', {
                feature: 'performance',
                action: 'slow_page_load',
                additionalData: {
                  loadTime,
                  domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                  firstPaint: navigation.responseEnd - navigation.requestStart
                }
              });
            }
          }
        }
      } catch (error) {
        // Silently fail - performance monitoring is non-critical
        console.debug('Performance monitoring failed:', error);
      }
    };

    // Check performance after page load
    if (document.readyState === 'complete') {
      checkPageLoadPerformance();
    } else {
      window.addEventListener('load', checkPageLoadPerformance);
    }

    return () => {
      window.removeEventListener('load', checkPageLoadPerformance);
    };
  }, [enablePerformanceMonitoring]);

  const logError = useCallback((error: Error, context?: any) => {
    return errorLogger.logError(error, context);
  }, []);

  const logWarning = useCallback((message: string, context?: any) => {
    return errorLogger.logWarning(message, context);
  }, []);

  const logInfo = useCallback((message: string, context?: any) => {
    return errorLogger.logInfo(message, context);
  }, []);

  const reportError = useCallback((error: Error, errorId: string, feature?: string, context?: any) => {
    openErrorReport(error, errorId, feature, context);
  }, [openErrorReport]);

  const getErrorMetrics = useCallback(() => {
    return errorLogger.getMetrics();
  }, []);

  const clearErrors = useCallback(() => {
    errorLogger.clearLogs();
    setGlobalError(null);
  }, []);

  const contextValue: ErrorContextValue = {
    logError,
    logWarning,
    logInfo,
    reportError,
    globalError,
    setGlobalError,
    getErrorMetrics,
    clearErrors
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

// Higher-order component for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    feature?: string;
    level?: 'page' | 'section' | 'component';
    fallback?: React.ComponentType<any>;
  } = {}
) {
  const WrappedComponent = (props: P) => {
    return (
      <ErrorBoundary
        feature={options.feature}
        level={options.level || 'component'}
        fallback={options.fallback ? <options.fallback /> : undefined}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Hook for handling async operations with automatic error logging
export function useAsyncError() {
  const { logError } = useError();

  const handleAsyncError = useCallback(async (
    operation: () => Promise<any>,
    context?: {
      feature?: string;
      action?: string;
      onError?: (error: Error) => void;
      onSuccess?: (result: any) => void;
    }
  ): Promise<any> => {
    try {
      const result = await operation();
      context?.onSuccess?.(result);
      return result;
    } catch (error) {
      const err = error as Error;
      logError(err, {
        feature: context?.feature,
        action: context?.action
      });
      context?.onError?.(err);
      return null;
    }
  }, [logError]);

  return { handleAsyncError };
}

export default ErrorProvider;