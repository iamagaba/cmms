/**
 * Enhanced error logging and monitoring utilities
 * Provides comprehensive error tracking, reporting, and analytics
 */

export interface ErrorLogEntry {
  id: string;
  timestamp: number;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  stack?: string;
  context: {
    feature?: string;
    action?: string;
    userId?: string;
    sessionId?: string;
    url: string;
    userAgent: string;
    viewport: {
      width: number;
      height: number;
    };
    performance?: {
      memory?: any;
      timing?: any;
    };
    additionalData?: Record<string, any>;
  };
  tags: string[];
  fingerprint?: string;
  resolved: boolean;
  reportedToService: boolean;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByLevel: Record<string, number>;
  errorsByFeature: Record<string, number>;
  errorsByTimeframe: Record<string, number>;
  topErrors: Array<{
    message: string;
    count: number;
    lastOccurrence: number;
  }>;
  errorRate: number;
  averageResolutionTime: number;
}

class ErrorLogger {
  private logs: Map<string, ErrorLogEntry> = new Map();
  private maxLogs = 1000;
  private storageKey = 'error_logs';
  private metricsKey = 'error_metrics';
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadStoredLogs();
    this.setupPerformanceMonitoring();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load previously stored error logs
   */
  private loadStoredLogs(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const logs = JSON.parse(stored) as ErrorLogEntry[];
        logs.forEach(log => {
          this.logs.set(log.id, log);
        });

        // Clean up old logs
        this.cleanupOldLogs();
      }
    } catch (error) {
      console.warn('Failed to load stored error logs:', error);
    }
  }

  /**
   * Save logs to localStorage
   */
  private saveLogs(): void {
    try {
      const logsArray = Array.from(this.logs.values());
      localStorage.setItem(this.storageKey, JSON.stringify(logsArray));
    } catch (error) {
      console.warn('Failed to save error logs:', error);
    }
  }

  /**
   * Clean up old logs to prevent storage overflow
   */
  private cleanupOldLogs(): void {
    const logsArray = Array.from(this.logs.values());
    
    // Remove logs older than 7 days
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentLogs = logsArray.filter(log => log.timestamp > weekAgo);

    // Keep only the most recent logs if still too many
    if (recentLogs.length > this.maxLogs) {
      recentLogs.sort((a, b) => b.timestamp - a.timestamp);
      recentLogs.splice(this.maxLogs);
    }

    // Update the logs map
    this.logs.clear();
    recentLogs.forEach(log => {
      this.logs.set(log.id, log);
    });

    this.saveLogs();
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) { // Log tasks longer than 50ms
              this.log('warn', `Long task detected: ${entry.duration}ms`, {
                feature: 'performance',
                action: 'long_task',
                additionalData: {
                  duration: entry.duration,
                  startTime: entry.startTime,
                  name: entry.name
                }
              });
            }
          });
        });

        observer.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('Performance monitoring not available:', error);
      }
    }

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        if (usagePercent > 80) {
          this.log('warn', `High memory usage: ${usagePercent.toFixed(1)}%`, {
            feature: 'performance',
            action: 'memory_warning',
            additionalData: {
              usedJSHeapSize: memory.usedJSHeapSize,
              totalJSHeapSize: memory.totalJSHeapSize,
              jsHeapSizeLimit: memory.jsHeapSizeLimit,
              usagePercent
            }
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Generate error fingerprint for deduplication
   */
  private generateFingerprint(message: string, stack?: string): string {
    const content = stack ? `${message}:${stack.split('\n')[0]}` : message;
    return btoa(content).replace(/[^a-zA-Z0-9]/g, '').substr(0, 16);
  }

  /**
   * Get current performance metrics
   */
  private getPerformanceMetrics(): any {
    const metrics: any = {};

    // Memory usage
    if ('memory' in performance) {
      metrics.memory = (performance as any).memory;
    }

    // Navigation timing
    if ('getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        metrics.timing = {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: navigation.responseEnd - navigation.requestStart
        };
      }
    }

    return metrics;
  }

  /**
   * Main logging method
   */
  public log(
    level: 'error' | 'warn' | 'info' | 'debug',
    message: string,
    context: {
      feature?: string;
      action?: string;
      userId?: string;
      additionalData?: Record<string, any>;
      tags?: string[];
      error?: Error;
    } = {}
  ): string {
    const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();
    
    const logEntry: ErrorLogEntry = {
      id,
      timestamp,
      level,
      message,
      stack: context.error?.stack,
      context: {
        feature: context.feature,
        action: context.action,
        userId: context.userId,
        sessionId: this.sessionId,
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        performance: this.getPerformanceMetrics(),
        additionalData: context.additionalData
      },
      tags: context.tags || [],
      fingerprint: this.generateFingerprint(message, context.error?.stack),
      resolved: false,
      reportedToService: false
    };

    // Add automatic tags based on context
    if (context.feature) {
      logEntry.tags.push(`feature:${context.feature}`);
    }
    if (context.action) {
      logEntry.tags.push(`action:${context.action}`);
    }
    logEntry.tags.push(`level:${level}`);

    this.logs.set(id, logEntry);

    // Console logging with appropriate level
    const consoleMethod = level === 'debug' ? 'debug' : 
                         level === 'info' ? 'info' : 
                         level === 'warn' ? 'warn' : 'error';
    
    console[consoleMethod](`[${level.toUpperCase()}] ${message}`, {
      context: logEntry.context,
      tags: logEntry.tags,
      error: context.error
    });

    // Report critical errors immediately
    if (level === 'error') {
      this.reportToService(logEntry);
    }

    // Cleanup and save
    this.cleanupOldLogs();
    this.saveLogs();

    return id;
  }

  /**
   * Log an error with full context
   */
  public logError(
    error: Error,
    context: {
      feature?: string;
      action?: string;
      userId?: string;
      additionalData?: Record<string, any>;
      tags?: string[];
    } = {}
  ): string {
    return this.log('error', error.message, { ...context, error });
  }

  /**
   * Log a warning
   */
  public logWarning(
    message: string,
    context: {
      feature?: string;
      action?: string;
      additionalData?: Record<string, any>;
      tags?: string[];
    } = {}
  ): string {
    return this.log('warn', message, context);
  }

  /**
   * Log an info message
   */
  public logInfo(
    message: string,
    context: {
      feature?: string;
      action?: string;
      additionalData?: Record<string, any>;
      tags?: string[];
    } = {}
  ): string {
    return this.log('info', message, context);
  }

  /**
   * Log a debug message
   */
  public logDebug(
    message: string,
    context: {
      feature?: string;
      action?: string;
      additionalData?: Record<string, any>;
      tags?: string[];
    } = {}
  ): string {
    return this.log('debug', message, context);
  }

  /**
   * Mark an error as resolved
   */
  public resolveError(errorId: string): void {
    const log = this.logs.get(errorId);
    if (log) {
      log.resolved = true;
      this.logs.set(errorId, log);
      this.saveLogs();
    }
  }

  /**
   * Get error logs with filtering
   */
  public getLogs(filters: {
    level?: 'error' | 'warn' | 'info' | 'debug';
    feature?: string;
    resolved?: boolean;
    timeframe?: { start: number; end: number };
    limit?: number;
  } = {}): ErrorLogEntry[] {
    let logs = Array.from(this.logs.values());

    // Apply filters
    if (filters.level) {
      logs = logs.filter(log => log.level === filters.level);
    }

    if (filters.feature) {
      logs = logs.filter(log => log.context.feature === filters.feature);
    }

    if (filters.resolved !== undefined) {
      logs = logs.filter(log => log.resolved === filters.resolved);
    }

    if (filters.timeframe) {
      logs = logs.filter(log => 
        log.timestamp >= filters.timeframe!.start && 
        log.timestamp <= filters.timeframe!.end
      );
    }

    // Sort by timestamp (newest first)
    logs.sort((a, b) => b.timestamp - a.timestamp);

    // Apply limit
    if (filters.limit) {
      logs = logs.slice(0, filters.limit);
    }

    return logs;
  }

  /**
   * Get error metrics and analytics
   */
  public getMetrics(timeframe?: { start: number; end: number }): ErrorMetrics {
    let logs = Array.from(this.logs.values());

    if (timeframe) {
      logs = logs.filter(log => 
        log.timestamp >= timeframe.start && 
        log.timestamp <= timeframe.end
      );
    }

    const totalErrors = logs.length;
    const errorsByLevel: Record<string, number> = {};
    const errorsByFeature: Record<string, number> = {};
    const errorsByTimeframe: Record<string, number> = {};
    const errorCounts: Record<string, { count: number; lastOccurrence: number }> = {};

    logs.forEach(log => {
      // Count by level
      errorsByLevel[log.level] = (errorsByLevel[log.level] || 0) + 1;

      // Count by feature
      if (log.context.feature) {
        errorsByFeature[log.context.feature] = (errorsByFeature[log.context.feature] || 0) + 1;
      }

      // Count by hour for timeframe analysis
      const hour = new Date(log.timestamp).toISOString().substr(0, 13);
      errorsByTimeframe[hour] = (errorsByTimeframe[hour] || 0) + 1;

      // Count by fingerprint for top errors
      if (log.fingerprint) {
        if (!errorCounts[log.fingerprint]) {
          errorCounts[log.fingerprint] = { count: 0, lastOccurrence: 0 };
        }
        errorCounts[log.fingerprint].count++;
        errorCounts[log.fingerprint].lastOccurrence = Math.max(
          errorCounts[log.fingerprint].lastOccurrence,
          log.timestamp
        );
      }
    });

    // Calculate top errors
    const topErrors = Object.entries(errorCounts)
      .map(([fingerprint, data]) => {
        const log = logs.find(l => l.fingerprint === fingerprint);
        return {
          message: log?.message || 'Unknown error',
          count: data.count,
          lastOccurrence: data.lastOccurrence
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate error rate (errors per hour)
    const timeSpan = timeframe 
      ? (timeframe.end - timeframe.start) / (1000 * 60 * 60)
      : 24; // Default to 24 hours
    const errorRate = totalErrors / timeSpan;

    // Calculate average resolution time
    const resolvedErrors = logs.filter(log => log.resolved);
    const averageResolutionTime = resolvedErrors.length > 0
      ? resolvedErrors.reduce((sum, log) => sum + (Date.now() - log.timestamp), 0) / resolvedErrors.length
      : 0;

    return {
      totalErrors,
      errorsByLevel,
      errorsByFeature,
      errorsByTimeframe,
      topErrors,
      errorRate,
      averageResolutionTime
    };
  }

  /**
   * Report error to external monitoring service
   */
  private async reportToService(logEntry: ErrorLogEntry): Promise<void> {
    if (logEntry.reportedToService) {
      return;
    }

    try {
      // In production, integrate with your error monitoring service
      if (process.env.NODE_ENV === 'production') {
        // Example integrations:
        
        // Sentry
        // Sentry.captureException(new Error(logEntry.message), {
        //   tags: logEntry.tags.reduce((acc, tag) => {
        //     const [key, value] = tag.split(':');
        //     acc[key] = value;
        //     return acc;
        //   }, {}),
        //   extra: logEntry.context
        // });

        // Custom API endpoint
        // await fetch('/api/error-reports', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(logEntry)
        // });

        console.log('Error would be reported to monitoring service:', logEntry);
      }

      logEntry.reportedToService = true;
      this.logs.set(logEntry.id, logEntry);
      this.saveLogs();

    } catch (error) {
      console.warn('Failed to report error to monitoring service:', error);
    }
  }

  /**
   * Export logs for debugging or support
   */
  public exportLogs(format: 'json' | 'csv' = 'json'): string {
    const logs = this.getLogs();

    if (format === 'csv') {
      const headers = ['Timestamp', 'Level', 'Message', 'Feature', 'Action', 'Tags', 'Resolved'];
      const rows = logs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.level,
        log.message,
        log.context.feature || '',
        log.context.action || '',
        log.tags.join(';'),
        log.resolved.toString()
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(logs, null, 2);
  }

  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this.logs.clear();
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.metricsKey);
    } catch (error) {
      console.warn('Failed to clear stored logs:', error);
    }
  }
}

// Global error logger instance
const errorLogger = new ErrorLogger();

// Export convenience functions
export const logError = (error: Error, context?: any) => errorLogger.logError(error, context);
export const logWarning = (message: string, context?: any) => errorLogger.logWarning(message, context);
export const logInfo = (message: string, context?: any) => errorLogger.logInfo(message, context);
export const logDebug = (message: string, context?: any) => errorLogger.logDebug(message, context);

export { errorLogger };
export default errorLogger;