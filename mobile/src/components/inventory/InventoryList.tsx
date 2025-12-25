import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SearchBar, Button } from 'react-native-elements';
import { InventoryCard } from './InventoryCard';
import { InventoryFilters } from './InventoryFilters';
import { useInventoryItems } from '../../hooks/useInventory';
import { MobileInventoryItem, InventoryFilter } from '../../types';
import { theme } from '../../theme/theme';

interface InventoryListProps {
  onItemPress?: (item: MobileInventoryItem) => void;
  showFilters?: boolean;
  initialFilter?: InventoryFilter;
  emptyMessage?: string;
}

export const InventoryList: React.FC<InventoryListProps> = ({
  onItemPress,
  showFilters = true,
  initialFilter = {},
  emptyMessage = 'No inventory items found',
}) => {
  const [filter, setFilter] = useState<InventoryFilter>(initialFilter);
  const [searchTerm, setSearchTerm] = useState(initialFilter.searchTerm || '');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInventoryItems(filter);

  const allItems = data?.pages.flatMap(page => page.items) || [];

  const handleSearch = useCallback((text: string) => {
    setSearchTerm(text);
    setFilter(prev => ({ ...prev, searchTerm: text }));
  }, []);

  const handleFilterApply = useCallback((newFilter: InventoryFilter) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
    setShowFilterModal(false);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(({ item }: { item: MobileInventoryItem }) => (
    <InventoryCard
      item={item}
      onPress={onItemPress}
    />
  ), [onItemPress]);

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading more items...</Text>
        </View>
      );
    }
    return null;
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{emptyMessage}</Text>
      <Button
        title="Refresh"
        onPress={() => refetch()}
        buttonStyle={styles.refreshButton}
        titleStyle={styles.refreshButtonText}
      />
    </View>
  );

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error loading inventory: {error?.message}
        </Text>
        <Button
          title="Retry"
          onPress={() => refetch()}
          buttonStyle={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showFilters && (
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder="Search by name, SKU, or description..."
            value={searchTerm}
            onChangeText={handleSearch}
            containerStyle={styles.searchBarContainer}
            inputContainerStyle={styles.searchBarInput}
            inputStyle={styles.searchBarText}
            searchIcon={{ size: 20 }}
            clearIcon={{ size: 20 }}
            platform="default"
          />
          <Button
            title="Filters"
            onPress={() => setShowFilterModal(true)}
            buttonStyle={styles.filterButton}
            titleStyle={styles.filterButtonText}
            icon={{
              name: 'filter-list',
              type: 'material',
              size: 16,
              color: theme.colors.primary,
            }}
            type="outline"
          />
        </View>
      )}

      <FlatList
        data={allItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        contentContainerStyle={allItems.length === 0 ? styles.emptyList : undefined}
        showsVerticalScrollIndicator={false}
      />

      <InventoryFilters
        visible={showFilterModal}
        currentFilter={filter}
        onApply={handleFilterApply}
        onClose={() => setShowFilterModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.grey5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey4,
  },
  searchBarContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
  },
  searchBarInput: {
    backgroundColor: theme.colors.grey5,
    borderRadius: 8,
    height: 40,
  },
  searchBarText: {
    fontSize: 14,
    color: theme.colors.grey0,
  },
  filterButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderColor: theme.colors.primary,
    borderRadius: 8,
  },
  filterButtonText: {
    fontSize: 12,
    marginLeft: 4,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.grey2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.grey2,
    textAlign: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
});