import {useQuery, useInfiniteQuery} from '@tanstack/react-query';
import {assetService, AssetFilters} from '@/services/assetService';
import {Vehicle} from '@/types';

export const ASSET_QUERY_KEYS = {
  all: ['assets'] as const,
  lists: () => [...ASSET_QUERY_KEYS.all, 'list'] as const,
  list: (filters: AssetFilters) => [...ASSET_QUERY_KEYS.lists(), filters] as const,
  details: () => [...ASSET_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ASSET_QUERY_KEYS.details(), id] as const,
  history: (id: string) => [...ASSET_QUERY_KEYS.all, 'history', id] as const,
  makes: () => [...ASSET_QUERY_KEYS.all, 'makes'] as const,
  models: (make?: string) => [...ASSET_QUERY_KEYS.all, 'models', make] as const,
  search: (code: string) => [...ASSET_QUERY_KEYS.all, 'search', code] as const,
};

/**
 * Hook for fetching paginated assets with infinite scroll
 */
export const useAssets = (filters: AssetFilters = {}) => {
  return useInfiniteQuery({
    queryKey: ASSET_QUERY_KEYS.list(filters),
    queryFn: ({ pageParam = 1 }) => assetService.getAssets(pageParam, 20, filters),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for fetching asset details
 */
export const useAssetDetails = (assetId: string) => {
  return useQuery({
    queryKey: ASSET_QUERY_KEYS.detail(assetId),
    queryFn: () => assetService.getAssetById(assetId),
    enabled: !!assetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for fetching asset maintenance history
 */
export const useAssetMaintenanceHistory = (assetId: string) => {
  return useQuery({
    queryKey: ASSET_QUERY_KEYS.history(assetId),
    queryFn: () => assetService.getAssetMaintenanceHistory(assetId),
    enabled: !!assetId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for fetching available asset makes
 */
export const useAssetMakes = () => {
  return useQuery({
    queryKey: ASSET_QUERY_KEYS.makes(),
    queryFn: () => assetService.getAssetMakes(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

/**
 * Hook for fetching available asset models
 */
export const useAssetModels = (make?: string) => {
  return useQuery({
    queryKey: ASSET_QUERY_KEYS.models(make),
    queryFn: () => assetService.getAssetModels(make),
    enabled: !!make,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

/**
 * Hook for searching assets by QR code or VIN
 */
export const useAssetSearch = (code: string) => {
  return useQuery({
    queryKey: ASSET_QUERY_KEYS.search(code),
    queryFn: () => assetService.searchAssetByCode(code),
    enabled: !!code && code.length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Helper hook to get flattened asset list from infinite query
 */
export const useAssetList = (filters: AssetFilters = {}) => {
  const query = useAssets(filters);
  
  const assets = query.data?.pages.flatMap(page => page.data) ?? [];
  const totalCount = query.data?.pages[0]?.count ?? 0;
  
  return {
    ...query,
    assets,
    totalCount,
  };
};