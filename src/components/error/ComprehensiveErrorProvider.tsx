import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useErrorReporting } from './ErrorReporting';
import { errorLogger } from '../../utils/errorLogger';

interface ComprehensiveErrorContextValue {
  logError: (error: Error, context?: any) => string;
  logWarning: (message: string, context?: any) => string;
  logInfo: (message: string, context?: any) => string;
  reportError: (error: Error, errorId: string, feature?: string, context?: any) => void;
  globalError: Error | null;
  setGlobalError: (error: Error | null) => void;
  getErrorMetrics: () => any;
  clearAllErrors: () => void;
  errorStats: {
    totalErrors: number;
    criticalErrors: number;
    recentErrors: number;
  };
}

const ComprehensiveErrorContext = createContext<ComprehensiveErrorContextValue | null>(null);

interface ComprehensiveErrorProviderProps {
  children: ReactNode;
  enableGlobalErrorHandling?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableErrorReporting?: boolean;
  enableErrorDashboard?: boolean;
  maxRetries?: number;
  feature?: string;
}

export function ComprehensiveErrorProvider({
  children,
  enableGlobalErrorHandling = true,
  enablePerformanceMonitoring = true,
  enableErrorReporting = true,
  enableErrorDashboard = true,
  maxRetries = 3,
  feature = 'app'
}: ComprehensiveErrorProviderProps) {
  const [globalError, setGlobalError] = useState<Error | null>(null);
  const [errorStats, setErrorStats] = useState({
    totalErrors: 0,
    criticalErrors: 0,
    recentErrors: 0
  });

  const { openErrorReport } = useErrorReporting();

  // Update error statistics periodically
  React.useEffect(() => {
    const updateStats = () => {
      const metrics = errorLogger.getMetrics();
      const recentTimeframe = Date.now() - (24 * 60 * 60 * 1000);
      const recentLogs = errorLogger.getLogs({
        timeframe: { start: recentTimeframe, end: Date.now() }
      });

      setErrorStats({
        totalErrors: metrics.totalErrors,
        criticalErrors: metrics.errorsByLevel.error || 0,
        recentErrors: recentLogs.length
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 60000);
    return () => clearInterval(interval);
  }, []);

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
    if (enableErrorReporting) {
      openErrorReport(error, errorId, feature, context);
    }
  }, [openErrorReport, enableErrorReporting]);

  const getErrorMetrics = useCallback(() => {
    return errorLogger.getMetrics();
  }, []);

  const clearAllErrors = useCallback(() => {
    errorLogger.clearLogs();
    setGlobalError(null);
    setErrorStats({
      totalErrors: 0,
      criticalErrors: 0,
      recentErrors: 0
    });
  }, []);

  const contextValue: ComprehensiveErrorContextValue = {
    logError,
    logWarning,
    logInfo,
    reportError,
    globalError,
    setGlobalError,
    getErrorMetrics,
    clearAllErrors,
    errorStats
  };

  return (
    <ComprehensiveErrorContext.Provider value={contextValue}>
      {children}
    </ComprehensiveErrorContext.Provider>
  );
}

export function useComprehensiveError() {
  const context = useContext(ComprehensiveErrorContext);
  if (!context) {
    throw new Error('useComprehensiveError must be used within a ComprehensiveErrorProvider');
  }
  return context;
}

export default ComprehensiveErrorProvider;