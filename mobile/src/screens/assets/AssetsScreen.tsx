import React, {useState, useCallback} from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Icon, SearchBar} from 'react-native-elements';
import {ScreenWrapper, LoadingSpinner, ErrorState, EmptyState, FloatingActionButton} from '@/components/common';
import {AssetCard, AssetFilters} from '@/components/assets';
import {useAssetList} from '@/hooks/useAssets';
import {AssetFilters as AssetFiltersType} from '@/services/assetService';
import {Vehicle} from '@/types';
import {theme} from '@/theme/theme';

export const AssetsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AssetFiltersType>({});

  // Combine search query with filters
  const combinedFilters = {
    ...filters,
    searchQuery: searchQuery.trim() || undefined,
  };

  const {
    assets,
    totalCount,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAssetList(combinedFilters);

  const handleAssetPress = useCallback((assetId: string) => {
    navigation.navigate('AssetDetails' as never, {assetId} as never);
  }, [navigation]);

  const handleQRScan = useCallback(() => {
    navigation.navigate('QRScanner' as never, {type: 'asset'} as never);
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleFiltersChange = useCallback((newFilters: AssetFiltersType) => {
    setFilters(newFilters);
  }, []);

  const renderAssetItem = useCallback(({item}: {item: Vehicle}) => (
    <AssetCard
      asset={item}
      onPress={handleAssetPress}
      showCustomer={true}
    />
  ), [handleAssetPress]);

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search assets..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchBarContainer}
          inputContainerStyle={styles.searchBarInput}
          inputStyle={styles.searchBarText}
          searchIcon={{color: theme.colors.grey3}}
          clearIcon={{color: theme.colors.grey3}}
          showCancel={false}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Icon
            name="filter-list"
            type="material"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>
      
      {totalCount > 0 && (
        <Text style={styles.resultCount}>
          {totalCount} asset{totalCount !== 1 ? 's' : ''} found
        </Text>
      )}
    </View>
  );

  const renderListFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.loadingFooter}>
          <LoadingSpinner size="small" />
        </View>
      );
    }
    return null;
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return null;
    }

    if (searchQuery || Object.keys(filters).length > 0) {
      return (
        <EmptyState
          title="No Assets Found"
          message="Try adjusting your search or filters to find assets."
          icon="search"
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setFilters({});
          }}
        />
      );
    }

    return (
      <EmptyState
        title="No Assets"
        message="No assets have been added to the system yet."
        icon="motorcycle"
        actionLabel="Scan QR Code"
        onAction={handleQRScan}
      />
    );
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <LoadingSpinner message="Loading assets..." />
      </ScreenWrapper>
    );
  }

  if (isError) {
    return (
      <ScreenWrapper>
        <ErrorState
          title="Failed to Load Assets"
          message={error?.message || 'Unable to load assets. Please try again.'}
          onRetry={handleRefresh}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <FlatList
        data={assets}
        renderItem={renderAssetItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isFetchingNextPage}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={[
          styles.listContainer,
          assets.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
      />

      <FloatingActionButton
        icon="qr-code-scanner"
        onPress={handleQRScan}
        style={styles.fab}
      />

      <AssetFilters
        visible={showFilters}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClose={() => setShowFilters(false)}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 100, // Space for FAB
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchBarContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
    marginRight: 12,
  },
  searchBarInput: {
    backgroundColor: theme.colors.grey5,
    borderRadius: 8,
    height: 40,
  },
  searchBarText: {
    fontSize: 16,
    color: theme.colors.black,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.grey5,
  },
  resultCount: {
    fontSize: 14,
    color: theme.colors.grey2,
    marginBottom: 8,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});