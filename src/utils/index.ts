// Performance optimization utilities
export * from './performance';
export * from './virtualization';
export * from './bundleOptimization';

// Re-export commonly used performance utilities
export {
  createLazyComponent,
  createMemoizedComponent,
  shallowEqual,
  deepEqual,
  measurePerformance,
  measureAsyncPerformance,
  LazyLoadingFallbacks,
} from './performance';

export {
  useVirtualScroll,
  useIntersectionObserver,
  WindowedList,
  processInChunks,
  useBatchedUpdates,
  createFilteredDataSelector,
  createSearchFunction,
  createSortFunction,
} from './virtualization';

export {
  MantineTreeShaking,
  CodeSplittingConfig,
  BundleAnalysis,
  PerformancePresets,
  DynamicImports,
  WebpackOptimizations,
  RuntimeOptimizations,
  MemoryOptimizations,
} from './bundleOptimization';