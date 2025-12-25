import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useEffect, useCallback} from 'react';
import {
  workOrderService,
  WorkOrderFilters,
  WorkOrderSortOptions,
  WorkOrderUpdateData,
} from '@/services/workOrderService';
import {MobileWorkOrder} from '@/types';
import {useAuth} from './useAuth';
import {useNetwork} from './useNetwork';
import {useWorkOrderStore} from '@/store/workOrderStore';

// Query keys for consistent cache management
export const workOrderKeys = {
  all: ['workOrders'] as const,
  lists: () => [...workOrderKeys.all, 'list'] as const,
  list: (technicianId: string, filters?: WorkOrderFilters, sort?: WorkOrderSortOptions) =>
    [...workOrderKeys.lists(), technicianId, filters, sort] as const,
  details: () => [...workOrderKeys.all, 'detail'] as const,
  detail: (id: string) => [...workOrderKeys.details(), id] as const,
  nearby: () => [...workOrderKeys.all, 'nearby'] as const,
  nearbyList: (lat: number, lng: number, radius?: number) =>
    [...workOrderKeys.nearby(), lat, lng, radius] as const,
};

/**
 * Hook to fetch work orders for the current technician with store integration
 */
export function useWorkOrders(
  filters?: WorkOrderFilters,
  sort?: WorkOrderSortOptions,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  const {user} = useAuth();
  const {isOnline} = useNetwork();
  const queryClient = useQueryClient();
  
  // Store integration
  const {
    setWorkOrders,
    setLoading,
    setError,
    setOnlineStatus,
    setLastSyncTimestamp,
    setFilters,
    setSortOptions,
    getFilteredWorkOrders,
    getSortedWorkOrders,
  } = useWorkOrderStore();

  // Update store with network status
  useEffect(() => {
    setOnlineStatus(isOnline);
  }, [isOnline, setOnlineStatus]);

  // Update store with filters and sort options
  useEffect(() => {
    if (filters) setFilters(filters);
  }, [filters, setFilters]);

  useEffect(() => {
    if (sort) setSortOptions(sort);
  }, [sort, setSortOptions]);

  const query = useQuery({
    queryKey: workOrderKeys.list(user?.id || '', filters, sort),
    queryFn: async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }
        
        const workOrders = await workOrderService.getWorkOrders(user.id, filters, sort);
        
        // Update store with fetched data
        setWorkOrders(workOrders);
        setLastSyncTimestamp(new Date().toISOString());
        
        return workOrders;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch work orders';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!user?.id && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchInterval: isOnline ? (options?.refetchInterval ?? 30000) : false, // 30 seconds when online
    refetchOnWindowFocus: isOnline,
    retry: (failureCount, error) => {
      // Don't retry if offline or authentication error
      if (!isOnline || error.message.includes('authenticated')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Set up real-time subscriptions with store integration
  useEffect(() => {
    if (!user?.id || !isOnline) return;

    const subscription = workOrderService.subscribeToWorkOrderUpdates(
      user.id,
      (payload) => {
        // Handle real-time updates
        if (payload.eventType === 'INSERT' && payload.new) {
          const newWorkOrder = workOrderService.transformToMobileWorkOrder(payload.new);
          queryClient.setQueryData(
            workOrderKeys.list(user.id, filters, sort),
            (oldData: MobileWorkOrder[] | undefined) => {
              if (!oldData) return [newWorkOrder];
              return [...oldData, newWorkOrder];
            }
          );
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          const updatedWorkOrder = workOrderService.transformToMobileWorkOrder(payload.new);
          
          // Update in query cache
          queryClient.setQueryData(
            workOrderKeys.list(user.id, filters, sort),
            (oldData: MobileWorkOrder[] | undefined) => {
              if (!oldData) return [updatedWorkOrder];
              return oldData.map(wo => wo.id === updatedWorkOrder.id ? updatedWorkOrder : wo);
            }
          );
          
          // Update detail cache
          queryClient.setQueryData(
            workOrderKeys.detail(updatedWorkOrder.id),
            updatedWorkOrder
          );
        } else if (payload.eventType === 'DELETE' && payload.old) {
          const deletedId = payload.old.id;
          
          // Remove from query cache
          queryClient.setQueryData(
            workOrderKeys.list(user.id, filters, sort),
            (oldData: MobileWorkOrder[] | undefined) => {
              if (!oldData) return [];
              return oldData.filter(wo => wo.id !== deletedId);
            }
          );
          
          // Remove detail cache
          queryClient.removeQueries({
            queryKey: workOrderKeys.detail(deletedId),
          });
        }

        // Invalidate and refetch to ensure consistency
        queryClient.invalidateQueries({
          queryKey: workOrderKeys.lists(),
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, isOnline, queryClient, filters, sort]);

  // Get filtered and sorted data from store for immediate UI updates
  const getOptimizedWorkOrders = useCallback(() => {
    if (query.data) {
      return query.data;
    }
    
    // Fallback to store data with client-side filtering/sorting
    const filtered = getFilteredWorkOrders();
    return getSortedWorkOrders(filtered);
  }, [query.data, getFilteredWorkOrders, getSortedWorkOrders]);

  return {
    ...query,
    workOrders: getOptimizedWorkOrders(),
  };
}

/**
 * Hook to fetch a single work order by ID
 */
export function useWorkOrder(
  id: string,
  options?: {
    enabled?: boolean;
  }
) {
  const {isOnline} = useNetwork();

  return useQuery({
    queryKey: workOrderKeys.detail(id),
    queryFn: () => workOrderService.getWorkOrderById(id),
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: isOnline,
    retry: (failureCount, error) => {
      if (!isOnline || error.message.includes('authenticated')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to fetch nearby work orders
 */
export function useNearbyWorkOrders(
  latitude?: number,
  longitude?: number,
  radiusKm?: number,
  options?: {
    enabled?: boolean;
  }
) {
  const {isOnline} = useNetwork();

  return useQuery({
    queryKey: workOrderKeys.nearbyList(latitude || 0, longitude || 0, radiusKm),
    queryFn: () => {
      if (!latitude || !longitude) {
        throw new Error('Location coordinates required');
      }
      return workOrderService.getNearbyWorkOrders(latitude, longitude, radiusKm);
    },
    enabled: !!latitude && !!longitude && (options?.enabled ?? true),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: isOnline,
    retry: (failureCount, error) => {
      if (!isOnline) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook to update work order with optimistic updates and store integration
 */
export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();
  const {user} = useAuth();
  const {isOnline} = useNetwork();
  
  // Store integration
  const {
    updateWorkOrder: updateWorkOrderInStore,
    markForSync,
    removeFromSync,
  } = useWorkOrderStore();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: WorkOrderUpdateData;
    }) => {
      // If offline, only update store and mark for sync
      if (!isOnline) {
        updateWorkOrderInStore(id, updates);
        markForSync(id);
        
        // Return optimistic response
        const currentWorkOrder = queryClient.getQueryData<MobileWorkOrder>(
          workOrderKeys.detail(id)
        );
        
        if (currentWorkOrder) {
          return {
            ...currentWorkOrder,
            ...updates,
            updatedAt: new Date().toISOString(),
            localChanges: true,
          };
        }
        
        throw new Error('Work order not found in cache');
      }
      
      // Online: perform actual API call
      return workOrderService.updateWorkOrder(id, updates);
    },
    
    // Optimistic update
    onMutate: async ({id, updates}) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({queryKey: workOrderKeys.detail(id)});
      await queryClient.cancelQueries({queryKey: workOrderKeys.lists()});

      // Snapshot previous values
      const previousWorkOrder = queryClient.getQueryData<MobileWorkOrder>(
        workOrderKeys.detail(id)
      );
      const previousWorkOrders = queryClient.getQueriesData({
        queryKey: workOrderKeys.lists(),
      });

      // Optimistically update work order detail
      if (previousWorkOrder) {
        const optimisticWorkOrder: MobileWorkOrder = {
          ...previousWorkOrder,
          ...updates,
          updatedAt: new Date().toISOString(),
          localChanges: !isOnline,
        };

        // Update query cache
        queryClient.setQueryData(workOrderKeys.detail(id), optimisticWorkOrder);

        // Update work order in lists
        queryClient.setQueriesData(
          {queryKey: workOrderKeys.lists()},
          (oldData: MobileWorkOrder[] | undefined) => {
            if (!oldData) return oldData;
            return oldData.map(wo =>
              wo.id === id ? optimisticWorkOrder : wo
            );
          }
        );

        // Update store immediately for UI responsiveness
        updateWorkOrderInStore(id, updates);
        
        // Mark for sync if offline
        if (!isOnline) {
          markForSync(id);
        }
      }

      return {previousWorkOrder, previousWorkOrders};
    },

    // On success, update cache with server response
    onSuccess: (updatedWorkOrder, {id}) => {
      // Update query cache with server response
      queryClient.setQueryData(workOrderKeys.detail(id), updatedWorkOrder);
      
      // Update work order in all list queries
      queryClient.setQueriesData(
        {queryKey: workOrderKeys.lists()},
        (oldData: MobileWorkOrder[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map(wo =>
            wo.id === id ? updatedWorkOrder : wo
          );
        }
      );

      // Update store with server response
      updateWorkOrderInStore(id, {
        ...updatedWorkOrder,
        localChanges: false,
      });

      // Remove from sync queue if online
      if (isOnline) {
        removeFromSync(id);
      }
    },

    // On error, revert optimistic updates
    onError: (error, {id}, context) => {
      if (context?.previousWorkOrder) {
        queryClient.setQueryData(workOrderKeys.detail(id), context.previousWorkOrder);
        
        // Revert store changes
        updateWorkOrderInStore(id, context.previousWorkOrder);
      }

      if (context?.previousWorkOrders) {
        context.previousWorkOrders.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Don't remove from sync queue on error - keep for retry
      console.error('Work order update failed:', error);
    },

    // Always refetch after mutation if online
    onSettled: (data, error, {id}) => {
      if (isOnline) {
        queryClient.invalidateQueries({queryKey: workOrderKeys.detail(id)});
        if (user?.id) {
          queryClient.invalidateQueries({
            queryKey: workOrderKeys.lists(),
          });
        }
      }
    },
  });
}

/**
 * Hook to prefetch work order details
 */
export function usePrefetchWorkOrder() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: workOrderKeys.detail(id),
      queryFn: () => workOrderService.getWorkOrderById(id),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };
}

/**
 * Hook to invalidate work order queries (useful for manual refresh)
 */
export function useInvalidateWorkOrders() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({queryKey: workOrderKeys.all});
    },
    invalidateLists: () => {
      queryClient.invalidateQueries({queryKey: workOrderKeys.lists()});
    },
    invalidateDetail: (id: string) => {
      queryClient.invalidateQueries({queryKey: workOrderKeys.detail(id)});
    },
    invalidateNearby: () => {
      queryClient.invalidateQueries({queryKey: workOrderKeys.nearby()});
    },
  };
}

/**
 * Hook for work order filtering and sorting state management
 */
export function useWorkOrderFilters() {
  const queryClient = useQueryClient();

  const applyFilters = (
    technicianId: string,
    filters: WorkOrderFilters,
    sort?: WorkOrderSortOptions
  ) => {
    // Prefetch with new filters
    queryClient.prefetchQuery({
      queryKey: workOrderKeys.list(technicianId, filters, sort),
      queryFn: () => workOrderService.getWorkOrders(technicianId, filters, sort),
      staleTime: 5 * 60 * 1000,
    });
  };

  const clearFilters = (technicianId: string) => {
    // Remove all filtered queries from cache
    queryClient.removeQueries({
      queryKey: workOrderKeys.lists(),
      predicate: (query) => {
        const [, , id, filters] = query.queryKey;
        return id === technicianId && !!filters;
      },
    });
  };

  return {
    applyFilters,
    clearFilters,
  };
}

/**
 * Hook to get work order statistics for dashboard
 */
export function useWorkOrderStats(
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  const {user} = useAuth();
  const {isOnline} = useNetwork();

  return useQuery({
    queryKey: [...workOrderKeys.all, 'stats', user?.id],
    queryFn: () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return workOrderService.getWorkOrderStats(user.id);
    },
    enabled: !!user?.id && (options?.enabled ?? true),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: isOnline ? (options?.refetchInterval ?? 60000) : false, // 1 minute when online
    refetchOnWindowFocus: isOnline,
    retry: (failureCount, error) => {
      if (!isOnline || error.message.includes('authenticated')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to search work orders
 */
export function useSearchWorkOrders(
  searchQuery: string,
  options?: {
    enabled?: boolean;
    includeCompleted?: boolean;
    limit?: number;
    debounceMs?: number;
  }
) {
  const {user} = useAuth();
  const {isOnline} = useNetwork();

  return useQuery({
    queryKey: [...workOrderKeys.all, 'search', user?.id, searchQuery, options],
    queryFn: () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return workOrderService.searchWorkOrders(user.id, searchQuery, {
        includeCompleted: options?.includeCompleted,
        limit: options?.limit,
      });
    },
    enabled: !!user?.id && !!searchQuery.trim() && (options?.enabled ?? true),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    refetchOnWindowFocus: false, // Don't refetch search results on focus
    retry: (failureCount, error) => {
      if (!isOnline || error.message.includes('authenticated')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook to batch update multiple work orders
 */
export function useBatchUpdateWorkOrders() {
  const queryClient = useQueryClient();
  const {user} = useAuth();

  return useMutation({
    mutationFn: (updates: Array<{id: string; data: WorkOrderUpdateData}>) =>
      workOrderService.batchUpdateWorkOrders(updates),
    
    onSuccess: (updatedWorkOrders) => {
      // Update individual work orders in cache
      updatedWorkOrders.forEach(workOrder => {
        queryClient.setQueryData(
          workOrderKeys.detail(workOrder.id),
          workOrder
        );
      });

      // Invalidate list queries to ensure consistency
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: workOrderKeys.lists(),
        });
        queryClient.invalidateQueries({
          queryKey: [...workOrderKeys.all, 'stats', user.id],
        });
      }
    },

    onError: (error) => {
      console.error('Batch update failed:', error);
      // Invalidate all queries to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: workOrderKeys.all,
      });
    },
  });
}

/**
 * Hook to manage offline work order changes with store integration
 */
export function useOfflineWorkOrders() {
  const queryClient = useQueryClient();
  const {isOnline} = useNetwork();
  const {user} = useAuth();
  
  // Store integration
  const {
    pendingChanges,
    clearPendingChanges,
    removeFromSync,
    getWorkOrderById,
  } = useWorkOrderStore();

  const getPendingChanges = useCallback(() => {
    return pendingChanges.map(id => getWorkOrderById(id)).filter(Boolean) as MobileWorkOrder[];
  }, [pendingChanges, getWorkOrderById]);

  const syncPendingChanges = async () => {
    if (!isOnline) {
      throw new Error('Cannot sync while offline');
    }

    const pendingWorkOrders = getPendingChanges();
    
    if (pendingWorkOrders.length === 0) {
      return [];
    }

    const syncResults: Array<{id: string; success: boolean; error?: string}> = [];

    // Sync each pending work order
    for (const workOrder of pendingWorkOrders) {
      try {
        // Extract the changes that need to be synced
        const updates: WorkOrderUpdateData = {
          status: workOrder.status,
          serviceNotes: workOrder.serviceNotes,
          // Add other fields that might have been updated offline
        };

        await workOrderService.updateWorkOrder(workOrder.id, updates);
        
        // Remove from sync queue on success
        removeFromSync(workOrder.id);
        
        syncResults.push({id: workOrder.id, success: true});
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sync failed';
        syncResults.push({
          id: workOrder.id,
          success: false,
          error: errorMessage,
        });
      }
    }

    // Invalidate and refetch all work order data after sync
    await queryClient.invalidateQueries({
      queryKey: workOrderKeys.all,
    });

    return syncResults;
  };

  const clearLocalChanges = () => {
    clearPendingChanges();
    
    // Remove local changes flag from all cached work orders
    queryClient.setQueriesData(
      {queryKey: workOrderKeys.all},
      (oldData: any) => {
        if (Array.isArray(oldData)) {
          return oldData.map((wo: MobileWorkOrder) => ({
            ...wo,
            localChanges: false,
          }));
        } else if (oldData && typeof oldData === 'object') {
          return {
            ...oldData,
            localChanges: false,
          };
        }
        return oldData;
      }
    );
  };

  return {
    getPendingChanges,
    syncPendingChanges,
    clearLocalChanges,
    hasPendingChanges: pendingChanges.length > 0,
    pendingChangesCount: pendingChanges.length,
  };
}

/**
 * Hook to manage real-time subscriptions for work orders
 */
export function useWorkOrderSubscriptions() {
  const {user} = useAuth();
  const {isOnline} = useNetwork();
  const queryClient = useQueryClient();
  const {setWorkOrders, updateWorkOrder, removeWorkOrder} = useWorkOrderStore();

  useEffect(() => {
    if (!user?.id || !isOnline) return;

    let subscription: any;

    const setupSubscription = () => {
      subscription = workOrderService.subscribeToWorkOrderUpdates(
        user.id,
        (payload) => {
          console.log('Real-time work order update:', payload);

          try {
            if (payload.eventType === 'INSERT' && payload.new) {
              const newWorkOrder = workOrderService.transformToMobileWorkOrder(payload.new);
              
              // Update query cache
              queryClient.setQueriesData(
                {queryKey: workOrderKeys.lists()},
                (oldData: MobileWorkOrder[] | undefined) => {
                  if (!oldData) return [newWorkOrder];
                  
                  // Check if work order already exists to avoid duplicates
                  const exists = oldData.some(wo => wo.id === newWorkOrder.id);
                  if (exists) return oldData;
                  
                  return [...oldData, newWorkOrder];
                }
              );

            } else if (payload.eventType === 'UPDATE' && payload.new) {
              const updatedWorkOrder = workOrderService.transformToMobileWorkOrder(payload.new);
              
              // Update store
              updateWorkOrder(updatedWorkOrder.id, updatedWorkOrder);
              
              // Update query cache
              queryClient.setQueriesData(
                {queryKey: workOrderKeys.lists()},
                (oldData: MobileWorkOrder[] | undefined) => {
                  if (!oldData) return [updatedWorkOrder];
                  return oldData.map(wo => wo.id === updatedWorkOrder.id ? updatedWorkOrder : wo);
                }
              );
              
              // Update detail cache
              queryClient.setQueryData(
                workOrderKeys.detail(updatedWorkOrder.id),
                updatedWorkOrder
              );

            } else if (payload.eventType === 'DELETE' && payload.old) {
              const deletedId = payload.old.id;
              
              // Update store
              removeWorkOrder(deletedId);
              
              // Update query cache
              queryClient.setQueriesData(
                {queryKey: workOrderKeys.lists()},
                (oldData: MobileWorkOrder[] | undefined) => {
                  if (!oldData) return [];
                  return oldData.filter(wo => wo.id !== deletedId);
                }
              );
              
              // Remove detail cache
              queryClient.removeQueries({
                queryKey: workOrderKeys.detail(deletedId),
              });
            }
          } catch (error) {
            console.error('Error processing real-time update:', error);
          }
        }
      );
    };

    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user?.id, isOnline, queryClient, updateWorkOrder, removeWorkOrder]);

  return {
    isSubscribed: !!user?.id && isOnline,
  };
}

/**
 * Hook to manage work order filtering and sorting with store integration
 */
export function useWorkOrderFiltersWithStore() {
  const queryClient = useQueryClient();
  const {user} = useAuth();
  
  const {
    filters,
    sortOptions,
    setFilters,
    setSortOptions,
    clearFilters,
    getFilteredWorkOrders,
    getSortedWorkOrders,
  } = useWorkOrderStore();

  const applyFilters = useCallback((
    newFilters: WorkOrderFilters,
    newSort?: WorkOrderSortOptions
  ) => {
    // Update store
    setFilters(newFilters);
    if (newSort) {
      setSortOptions(newSort);
    }

    // Prefetch with new filters if user is available
    if (user?.id) {
      queryClient.prefetchQuery({
        queryKey: workOrderKeys.list(user.id, newFilters, newSort || sortOptions),
        queryFn: () => workOrderService.getWorkOrders(user.id, newFilters, newSort || sortOptions),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [user?.id, queryClient, setFilters, setSortOptions, sortOptions]);

  const resetFilters = useCallback(() => {
    clearFilters();
    
    // Remove filtered queries from cache
    if (user?.id) {
      queryClient.removeQueries({
        queryKey: workOrderKeys.lists(),
        predicate: (query) => {
          const [, , id, queryFilters] = query.queryKey;
          return id === user.id && !!queryFilters && Object.keys(queryFilters).length > 0;
        },
      });
    }
  }, [clearFilters, user?.id, queryClient]);

  const getFilteredAndSortedWorkOrders = useCallback(() => {
    const filtered = getFilteredWorkOrders();
    return getSortedWorkOrders(filtered);
  }, [getFilteredWorkOrders, getSortedWorkOrders]);

  return {
    filters,
    sortOptions,
    applyFilters,
    resetFilters,
    getFilteredAndSortedWorkOrders,
  };
}