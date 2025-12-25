import { useMemo, useState, useEffect, useCallback } from 'react';

// Virtual scrolling configuration
export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // Number of items to render outside visible area
  threshold?: number; // Minimum items before virtualization kicks in
}

// Virtual scrolling hook
export function useVirtualScroll<T>(
  items: T[],
  config: VirtualScrollConfig
) {
  const { itemHeight, containerHeight, overscan = 5, threshold = 100 } = config;
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (items.length < threshold) {
      // Don't virtualize for small lists
      return {
        start: 0,
        end: items.length,
        visibleItems: items,
        totalHeight: items.length * itemHeight,
        offsetY: 0,
      };
    }

    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(items.length, start + visibleCount + overscan * 2);

    return {
      start,
      end,
      visibleItems: items.slice(start, end),
      totalHeight: items.length * itemHeight,
      offsetY: start * itemHeight,
    };
  }, [items, scrollTop, itemHeight, containerHeight, overscan, threshold]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    ...visibleRange,
    handleScroll,
    isVirtualized: items.length >= threshold,
  };
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [entries, setEntries] = useState<IntersectionObserverEntry[]>([]);
  const [observer, setObserver] = useState<IntersectionObserver | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      setEntries(entries);
    }, options);

    setObserver(obs);

    return () => {
      obs.disconnect();
    };
  }, [options.root, options.rootMargin, options.threshold]);

  const observe = useCallback((element: Element) => {
    if (observer) {
      observer.observe(element);
    }
  }, [observer]);

  const unobserve = useCallback((element: Element) => {
    if (observer) {
      observer.unobserve(element);
    }
  }, [observer]);

  return { entries, observe, unobserve };
}

// Windowing utility for large datasets
export class WindowedList<T> {
  private items: T[];
  private itemHeight: number;
  private containerHeight: number;
  private overscan: number;

  constructor(
    items: T[],
    itemHeight: number,
    containerHeight: number,
    overscan = 5
  ) {
    this.items = items;
    this.itemHeight = itemHeight;
    this.containerHeight = containerHeight;
    this.overscan = overscan;
  }

  getVisibleRange(scrollTop: number) {
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight);
    const start = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.overscan);
    const end = Math.min(this.items.length, start + visibleCount + this.overscan * 2);

    return {
      start,
      end,
      visibleItems: this.items.slice(start, end),
      totalHeight: this.items.length * this.itemHeight,
      offsetY: start * this.itemHeight,
    };
  }

  updateItems(newItems: T[]) {
    this.items = newItems;
  }
}

// Chunked processing for large operations
export function processInChunks<T, R>(
  items: T[],
  processor: (chunk: T[]) => R[],
  chunkSize = 100,
  onProgress?: (processed: number, total: number) => void
): Promise<R[]> {
  return new Promise((resolve) => {
    const results: R[] = [];
    let currentIndex = 0;

    function processChunk() {
      const chunk = items.slice(currentIndex, currentIndex + chunkSize);
      if (chunk.length === 0) {
        resolve(results);
        return;
      }

      const chunkResults = processor(chunk);
      results.push(...chunkResults);
      currentIndex += chunkSize;

      if (onProgress) {
        onProgress(currentIndex, items.length);
      }

      // Use setTimeout to prevent blocking the main thread
      setTimeout(processChunk, 0);
    }

    processChunk();
  });
}

// Batch updates to prevent excessive re-renders
export function useBatchedUpdates<T>(
  initialValue: T,
  batchDelay = 16 // ~60fps
) {
  const [value, setValue] = useState(initialValue);
  const [pendingValue, setPendingValue] = useState<T | null>(null);

  useEffect(() => {
    if (pendingValue !== null) {
      const timeoutId = setTimeout(() => {
        setValue(pendingValue);
        setPendingValue(null);
      }, batchDelay);

      return () => clearTimeout(timeoutId);
    }
  }, [pendingValue, batchDelay]);

  const batchedSetValue = useCallback((newValue: T) => {
    setPendingValue(newValue);
  }, []);

  return [value, batchedSetValue] as const;
}

// Efficient data filtering for large datasets
export function createFilteredDataSelector<T>(
  filterFunctions: Array<(item: T) => boolean>
) {
  return (data: T[]): T[] => {
    if (filterFunctions.length === 0) return data;

    return data.filter(item => 
      filterFunctions.every(filterFn => filterFn(item))
    );
  };
}

// Memoized search function
export function createSearchFunction<T>(
  searchFields: Array<keyof T>
) {
  return (items: T[], query: string): T[] => {
    if (!query.trim()) return items;

    const lowerQuery = query.toLowerCase();
    return items.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return value && String(value).toLowerCase().includes(lowerQuery);
      })
    );
  };
}

// Performance-optimized sorting
export function createSortFunction<T>(
  accessor: keyof T,
  direction: 'asc' | 'desc' = 'asc'
) {
  return (a: T, b: T): number => {
    const aVal = a[accessor];
    const bVal = b[accessor];

    if (aVal === bVal) return 0;
    
    let result = 0;
    if (aVal == null) result = -1;
    else if (bVal == null) result = 1;
    else if (typeof aVal === 'string' && typeof bVal === 'string') {
      result = aVal.localeCompare(bVal);
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      result = aVal - bVal;
    } else if (aVal instanceof Date && bVal instanceof Date) {
      result = aVal.getTime() - bVal.getTime();
    } else {
      result = String(aVal).localeCompare(String(bVal));
    }

    return direction === 'desc' ? -result : result;
  };
}