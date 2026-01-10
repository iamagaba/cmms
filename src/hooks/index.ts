// Performance optimization hooks
export * from './useOptimizedData';

// Re-export commonly used hooks
export {
  useOptimizedData,
  useOptimizedPagination,
  useOptimizedSelection,
  useOptimizedAsyncData,
  useOptimizedTableData,
} from './useOptimizedData';


// Density-aware spacing hook
export { useDensitySpacing } from './useDensitySpacing';
export type { DensitySpacing } from './useDensitySpacing';
