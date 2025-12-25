/**
 * Performance auditing utilities for comprehensive error handling system
 * Provides automated performance monitoring, bundle analysis, and accessibility checks
 */

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  
  // Memory metrics
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
    usagePercent: number;
  };
  
  // Bundle metrics
  bundleSize?: {
    total: number;
    javascript: number;
    css: number;
    images: number;
  };
  
  // Performance timing
  loadTime?: number;
  domContentLoaded?: number;
  firstPaint?: number;
  
  // Error metrics
  errorRate?: number;
  errorCount?: number;
  
  // Accessibility score
  accessibilityScore?: number;
}

export interface PerformanceAuditResult {
  timestamp: number;
  url: string;
  metrics: PerformanceMetrics;
  recommendations: string[];
  score: number; // Overall performance score (0-100)
  issues: Array<{
    type: 'performance' | 'accessibility' | 'bundle' | 'error';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    recommendation: string;
  }>;
}

class PerformanceAuditor {
  private observer?: PerformanceObserver;
  private metrics: PerformanceMetrics = {};
  private auditResults: PerformanceAuditResult[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers(): void {
    // Core Web Vitals observer
    if ('PerformanceObserver' in window) {
      try {
        // LCP Observer
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.lcp = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // FID Observer
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.fid = entry.processingStart - entry.startTime;
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // CLS Observer
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.cls = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Long task observer
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.duration > 50) {
              console.warn(`Long task detected: ${entry.duration}ms`);
            }
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });

      } catch (error) {
        console.warn('Performance observers not fully supported:', error);
      }
    }
  }

  /**
   * Collect current performance metrics
   */
  public collectMetrics(): PerformanceMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    // Basic timing metrics
    if (navigation) {
      this.metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
    }

    // Paint metrics
    const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
    if (fcp) {
      this.metrics.fcp = fcp.startTime;
    }

    const fp = paint.find(entry => entry.name === 'first-paint');
    if (fp) {
      this.metrics.firstPaint = fp.startTime;
    }

    // Memory metrics
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usagePercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }

    return { ...this.metrics };
  }

  /**
   * Analyze bundle size and composition
   */
  public async analyzeBundleSize(): Promise<void> {
    try {
      // Get resource timing entries
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      let totalSize = 0;
      let jsSize = 0;
      let cssSize = 0;
      let imageSize = 0;

      resources.forEach(resource => {
        const size = resource.transferSize || 0;
        totalSize += size;

        if (resource.name.includes('.js')) {
          jsSize += size;
        } else if (resource.name.includes('.css')) {
          cssSize += size;
        } else if (resource.name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
          imageSize += size;
        }
      });

      this.metrics.bundleSize = {
        total: totalSize,
        javascript: jsSize,
        css: cssSize,
        images: imageSize
      };
    } catch (error) {
      console.warn('Bundle size analysis failed:', error);
    }
  }

  /**
   * Run accessibility audit
   */
  public auditAccessibility(): number {
    let score = 100;
    const issues: string[] = [];

    // Check for missing alt attributes
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      score -= images.length * 5;
      issues.push(`${images.length} images missing alt attributes`);
    }

    // Check for missing form labels
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    const unlabeledInputs = Array.from(inputs).filter(input => {
      const id = input.getAttribute('id');
      return !id || !document.querySelector(`label[for="${id}"]`);
    });
    if (unlabeledInputs.length > 0) {
      score -= unlabeledInputs.length * 10;
      issues.push(`${unlabeledInputs.length} form inputs missing labels`);
    }

    // Check for missing headings hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    let hierarchyIssues = 0;
    
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        hierarchyIssues++;
      }
      previousLevel = level;
    });
    
    if (hierarchyIssues > 0) {
      score -= hierarchyIssues * 15;
      issues.push(`${hierarchyIssues} heading hierarchy issues`);
    }

    // Check for low contrast (basic check)
    const elements = document.querySelectorAll('*');
    let contrastIssues = 0;
    
    elements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Basic contrast check (simplified)
      if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        // This is a simplified check - in production, use a proper contrast ratio calculator
        const colorLuminance = this.getLuminance(color);
        const bgLuminance = this.getLuminance(backgroundColor);
        const contrast = (Math.max(colorLuminance, bgLuminance) + 0.05) / (Math.min(colorLuminance, bgLuminance) + 0.05);
        
        if (contrast < 4.5) { // WCAG AA standard
          contrastIssues++;
        }
      }
    });

    if (contrastIssues > 0) {
      score -= Math.min(contrastIssues * 2, 30); // Cap at 30 points
      issues.push(`${contrastIssues} potential contrast issues`);
    }

    this.metrics.accessibilityScore = Math.max(0, score);
    return this.metrics.accessibilityScore;
  }

  /**
   * Calculate luminance for contrast checking (simplified)
   */
  private getLuminance(color: string): number {
    // This is a simplified luminance calculation
    // In production, use a proper color parsing library
    const rgb = color.match(/\d+/g);
    if (!rgb || rgb.length < 3) return 0;
    
    const [r, g, b] = rgb.map(c => {
      const val = parseInt(c) / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Run comprehensive performance audit
   */
  public async runAudit(): Promise<PerformanceAuditResult> {
    const startTime = Date.now();
    
    // Collect all metrics
    this.collectMetrics();
    await this.analyzeBundleSize();
    const accessibilityScore = this.auditAccessibility();

    // Calculate overall score
    let score = 100;
    const issues: PerformanceAuditResult['issues'] = [];
    const recommendations: string[] = [];

    // Evaluate Core Web Vitals
    if (this.metrics.lcp && this.metrics.lcp > 2500) {
      score -= 20;
      issues.push({
        type: 'performance',
        severity: this.metrics.lcp > 4000 ? 'high' : 'medium',
        message: `LCP is ${Math.round(this.metrics.lcp)}ms (should be < 2500ms)`,
        recommendation: 'Optimize images, reduce server response time, eliminate render-blocking resources'
      });
    }

    if (this.metrics.fid && this.metrics.fid > 100) {
      score -= 15;
      issues.push({
        type: 'performance',
        severity: this.metrics.fid > 300 ? 'high' : 'medium',
        message: `FID is ${Math.round(this.metrics.fid)}ms (should be < 100ms)`,
        recommendation: 'Reduce JavaScript execution time, split long tasks, use web workers'
      });
    }

    if (this.metrics.cls && this.metrics.cls > 0.1) {
      score -= 10;
      issues.push({
        type: 'performance',
        severity: this.metrics.cls > 0.25 ? 'high' : 'medium',
        message: `CLS is ${this.metrics.cls.toFixed(3)} (should be < 0.1)`,
        recommendation: 'Set dimensions for images and videos, avoid inserting content above existing content'
      });
    }

    // Evaluate memory usage
    if (this.metrics.memoryUsage && this.metrics.memoryUsage.usagePercent > 80) {
      score -= 15;
      issues.push({
        type: 'performance',
        severity: this.metrics.memoryUsage.usagePercent > 90 ? 'critical' : 'high',
        message: `High memory usage: ${this.metrics.memoryUsage.usagePercent.toFixed(1)}%`,
        recommendation: 'Optimize memory usage, check for memory leaks, implement lazy loading'
      });
    }

    // Evaluate bundle size
    if (this.metrics.bundleSize && this.metrics.bundleSize.javascript > 1000000) { // 1MB
      score -= 10;
      issues.push({
        type: 'bundle',
        severity: this.metrics.bundleSize.javascript > 2000000 ? 'high' : 'medium',
        message: `Large JavaScript bundle: ${Math.round(this.metrics.bundleSize.javascript / 1024)}KB`,
        recommendation: 'Implement code splitting, tree shaking, and lazy loading'
      });
    }

    // Evaluate accessibility
    if (accessibilityScore < 90) {
      score -= (100 - accessibilityScore) * 0.3;
      issues.push({
        type: 'accessibility',
        severity: accessibilityScore < 70 ? 'high' : 'medium',
        message: `Accessibility score: ${accessibilityScore}/100`,
        recommendation: 'Fix accessibility issues: add alt text, improve form labels, fix heading hierarchy'
      });
    }

    // Generate recommendations
    if (issues.length === 0) {
      recommendations.push('Great job! No major performance issues detected.');
    } else {
      recommendations.push('Consider implementing the following optimizations:');
      issues.forEach(issue => {
        recommendations.push(`• ${issue.recommendation}`);
      });
    }

    const result: PerformanceAuditResult = {
      timestamp: startTime,
      url: window.location.href,
      metrics: { ...this.metrics },
      recommendations,
      score: Math.max(0, Math.round(score)),
      issues
    };

    this.auditResults.push(result);
    return result;
  }

  /**
   * Get audit history
   */
  public getAuditHistory(): PerformanceAuditResult[] {
    return [...this.auditResults];
  }

  /**
   * Export audit results
   */
  public exportResults(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['Timestamp', 'URL', 'Score', 'LCP', 'FID', 'CLS', 'Memory Usage %', 'Bundle Size KB', 'Accessibility Score'];
      const rows = this.auditResults.map(result => [
        new Date(result.timestamp).toISOString(),
        result.url,
        result.score,
        result.metrics.lcp || 'N/A',
        result.metrics.fid || 'N/A',
        result.metrics.cls || 'N/A',
        result.metrics.memoryUsage?.usagePercent.toFixed(1) || 'N/A',
        result.metrics.bundleSize ? Math.round(result.metrics.bundleSize.total / 1024) : 'N/A',
        result.metrics.accessibilityScore || 'N/A'
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(this.auditResults, null, 2);
  }

  /**
   * Clear audit history
   */
  public clearHistory(): void {
    this.auditResults = [];
  }
}

// Global performance auditor instance
export const performanceAuditor = new PerformanceAuditor();

// Utility functions for manual performance checks
export function measurePageLoad(): Promise<PerformanceMetrics> {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve(performanceAuditor.collectMetrics());
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          resolve(performanceAuditor.collectMetrics());
        }, 100);
      });
    }
  });
}

export function measureFunction<T extends (...args: any[]) => any>(
  fn: T,
  name?: string
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    console.log(`${name || fn.name || 'Function'} execution time: ${(end - start).toFixed(2)}ms`);
    
    return result;
  };
}

export async function measureAsyncFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name?: string
): Promise<(...args: Parameters<T>) => Promise<ReturnType<T>>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();
    
    console.log(`${name || fn.name || 'Async Function'} execution time: ${(end - start).toFixed(2)}ms`);
    
    return result;
  };
}

// Lighthouse-like scoring
export function calculatePerformanceScore(metrics: PerformanceMetrics): number {
  let score = 100;
  
  // LCP scoring (25% weight)
  if (metrics.lcp) {
    if (metrics.lcp > 4000) score -= 25;
    else if (metrics.lcp > 2500) score -= 15;
    else if (metrics.lcp > 1200) score -= 5;
  }
  
  // FID scoring (25% weight)
  if (metrics.fid) {
    if (metrics.fid > 300) score -= 25;
    else if (metrics.fid > 100) score -= 15;
    else if (metrics.fid > 50) score -= 5;
  }
  
  // CLS scoring (25% weight)
  if (metrics.cls) {
    if (metrics.cls > 0.25) score -= 25;
    else if (metrics.cls > 0.1) score -= 15;
    else if (metrics.cls > 0.05) score -= 5;
  }
  
  // Memory usage scoring (15% weight)
  if (metrics.memoryUsage) {
    if (metrics.memoryUsage.usagePercent > 90) score -= 15;
    else if (metrics.memoryUsage.usagePercent > 80) score -= 10;
    else if (metrics.memoryUsage.usagePercent > 70) score -= 5;
  }
  
  // Bundle size scoring (10% weight)
  if (metrics.bundleSize) {
    const totalMB = metrics.bundleSize.total / (1024 * 1024);
    if (totalMB > 5) score -= 10;
    else if (totalMB > 3) score -= 7;
    else if (totalMB > 2) score -= 3;
  }
  
  return Math.max(0, Math.round(score));
}

export default performanceAuditor;