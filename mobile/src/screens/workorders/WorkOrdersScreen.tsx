import React, {useState, useCallback, useMemo} from 'react';
import {View, StyleSheet, FlatList, RefreshControl} from 'react-native';
import {FAB, Text, useTheme} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';

import {ScreenWrapper, EmptyState, SearchBar, LoadingSpinner} from '@/components/common';
import {WorkOrderCard, WorkOrderFiltersModal, FilterChipBar} from '@/components/workorders';
import {
  useWorkOrders,
  useWorkOrderFiltersWithStore,
  useInvalidateWorkOrders,
  usePrefetchWorkOrder,
} from '@/hooks/useWorkOrders';
import {useAuth} from '@/hooks/useAuth';
import {useNetwork} from '@/hooks/useNetwork';
import {MobileWorkOrder} from '@/types';
import {WorkOrderFilters, WorkOrderSortOptions} from '@/services/workOrderService';

interface WorkOrdersScreenProps {
  navigation: any;
}

export const WorkOrdersScreen: React.FC<WorkOrdersScreenProps> = ({navigation}) => {
  const theme = useTheme();
  // const {user} = useAuth(); // Will be used in future tasks
  const {isOnline} = useNetwork();
  
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Hooks
  const {
    filters,
    sortOptions,
    applyFilters,
    resetFilters,
    // getFilteredAndSortedWorkOrders, // Will be used for client-side filtering
  } = useWorkOrderFiltersWithStore();
  
  const {invalidateAll} = useInvalidateWorkOrders();
  const prefetchWorkOrder = usePrefetchWorkOrder();

  // Create filters with search query
  const activeFilters = useMemo(() => ({
    ...filters,
    searchQuery: searchQuery.trim() || undefined,
  }), [filters, searchQuery]);

  // Fetch work orders
  const {
    data: workOrders = [],
    isLoading,
    error,
    refetch,
  } = useWorkOrders(activeFilters, sortOptions, {
    refetchInterval: isOnline ? 30000 : undefined, // 30 seconds when online
  });

  // Refresh focus effect
  useFocusEffect(
    useCallback(() => {
      if (isOnline) {
        refetch();
      }
    }, [isOnline, refetch])
  );

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    if (!isOnline) return;
    
    setRefreshing(true);
    try {
      await invalidateAll();
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [isOnline, invalidateAll, refetch]);

  // Handle work order press
  const handleWorkOrderPress = useCallback((workOrder: MobileWorkOrder) => {
    navigation.navigate('WorkOrderDetails', {workOrderId: workOrder.id});
  }, [navigation]);

  // Handle filter application
  const handleApplyFilters = useCallback((
    newFilters: WorkOrderFilters,
    newSort: WorkOrderSortOptions
  ) => {
    applyFilters(newFilters, newSort);
  }, [applyFilters]);

  // Handle filter removal
  const handleRemoveFilter = useCallback((filterType: string, value?: string) => {
    if (filterType === 'search') {
      setSearchQuery('');
      return;
    }

    if (filterType === 'sort') {
      applyFilters(filters, {field: 'priority', direction: 'desc'});
      return;
    }

    const newFilters = {...filters};

    if (filterType === 'status' && value) {
      newFilters.status = newFilters.status?.filter(s => s !== value);
      if (!newFilters.status?.length) {
        delete newFilters.status;
      }
    } else if (filterType === 'priority' && value) {
      newFilters.priority = newFilters.priority?.filter(p => p !== value);
      if (!newFilters.priority?.length) {
        delete newFilters.priority;
      }
    }

    applyFilters(newFilters, sortOptions);
  }, [filters, sortOptions, applyFilters]);

  // Handle work order item rendering
  const renderWorkOrderItem = useCallback(({item, index}: {item: MobileWorkOrder; index: number}) => {
    // Prefetch next item for better performance
    if (index < workOrders.length - 1) {
      const nextItem = workOrders[index + 1];
      prefetchWorkOrder(nextItem.id);
    }

    return (
      <WorkOrderCard
        workOrder={item}
        onPress={handleWorkOrderPress}
        showDistance={!!item.distanceFromTechnician}
      />
    );
  }, [workOrders, prefetchWorkOrder, handleWorkOrderPress]);

  // Handle empty state
  const renderEmptyState = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

    const hasActiveFilters = !!(
      activeFilters.status?.length ||
      activeFilters.priority?.length ||
      activeFilters.searchQuery?.trim()
    );

    if (hasActiveFilters) {
      return (
        <EmptyState
          title="No Matching Work Orders"
          message="No work orders match your current filters. Try adjusting your search criteria."
          icon="search-off"
          actionLabel="Clear Filters"
          onAction={resetFilters}
        />
      );
    }

    return (
      <EmptyState
        title="No Work Orders"
        message={
          isOnline
            ? "You don't have any assigned work orders at the moment."
            : "No work orders available offline. Connect to internet to sync latest data."
        }
        icon="assignment"
        actionLabel={isOnline ? "Refresh" : "Retry"}
        onAction={handleRefresh}
      />
    );
  };

  // Handle list header
  const renderListHeader = () => (
    <View>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search work orders..."
        style={styles.searchBar}
      />
      <FilterChipBar
        filters={activeFilters}
        sortOptions={sortOptions}
        onRemoveFilter={handleRemoveFilter}
        onOpenFilters={() => setShowFilters(true)}
      />
    </View>
  );

  // Handle list footer
  const renderListFooter = () => {
    if (!isOnline && workOrders.length > 0) {
      return (
        <View style={styles.offlineIndicator}>
          <Text variant="bodySmall" style={styles.offlineText}>
            Showing cached data. Connect to internet for latest updates.
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <ScreenWrapper
      loading={isLoading && workOrders.length === 0}
      error={error?.message || null}
      onRetry={refetch}
      padding={false}>
      
      {workOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          {renderListHeader()}
          {renderEmptyState()}
        </View>
      ) : (
        <FlatList
          data={workOrders}
          renderItem={renderWorkOrderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderListFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              enabled={isOnline}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={8}
          getItemLayout={(_data, index) => ({
            length: 180, // Approximate item height
            offset: 180 * index,
            index,
          })}
        />
      )}

      {/* Floating Action Button for creating new work orders */}
      <FAB
        icon="add"
        style={[styles.fab, {backgroundColor: theme.colors.primary}]}
        onPress={() => {
          // Navigate to create work order screen (future implementation)
          console.log('Create new work order');
        }}
      />

      {/* Filters Modal */}
      <WorkOrderFiltersModal
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
        filters={filters}
        sortOptions={sortOptions}
        onApplyFilters={handleApplyFilters}
        onClearFilters={resetFilters}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  listContent: {
    paddingBottom: 100, // Space for FAB
  },
  offlineIndicator: {
    padding: 16,
    alignItems: 'center',
  },
  offlineText: {
    opacity: 0.7,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});