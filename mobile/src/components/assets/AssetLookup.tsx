import React, {useState, useCallback} from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import {
  Text,
  Card,
  TextInput,
  Button,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import {Vehicle} from '@/types';
import {useAssetList} from '@/hooks/useAssets';
import {AssetCard} from './AssetCard';
import {EmptyState} from '@/components/common';

interface AssetLookupProps {
  onAssetSelect: (asset: Vehicle) => void;
  onCancel: () => void;
  placeholder?: string;
  title?: string;
}

export const AssetLookup: React.FC<AssetLookupProps> = ({
  onAssetSelect,
  onCancel,
  placeholder = 'Search by VIN, license plate, make, model...',
  title = 'Asset Lookup',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const {
    assets,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAssetList({
    searchQuery: searchQuery.trim(),
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearching(query.length > 0);
  }, []);

  const handleAssetPress = useCallback((assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      onAssetSelect(asset);
    }
  }, [assets, onAssetSelect]);

  const renderAssetItem = ({item}: {item: Vehicle}) => (
    <AssetCard
      asset={item}
      onPress={handleAssetPress}
      showCustomer={true}
    />
  );

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" />
        </View>
      );
    }
    return null;
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Searching assets...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <EmptyState
          icon="error"
          title="Search Error"
          message="Failed to search assets. Please try again."
          actionLabel="Retry"
          onAction={() => handleSearch(searchQuery)}
        />
      );
    }

    if (searchQuery.length === 0) {
      return (
        <EmptyState
          icon="search"
          title="Search Assets"
          message="Enter a VIN, license plate, or vehicle details to search for assets."
        />
      );
    }

    if (searchQuery.length > 0 && assets.length === 0) {
      return (
        <EmptyState
          icon="search-off"
          title="No Assets Found"
          message={`No assets found matching "${searchQuery}". Try a different search term.`}
        />
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Text variant="headlineSmall" style={styles.title}>
              {title}
            </Text>
            <Button
              mode="text"
              onPress={onCancel}
              compact
            >
              Cancel
            </Button>
          </View>
          
          <TextInput
            label="Search Assets"
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder={placeholder}
            mode="outlined"
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.searchInput}
            left={<TextInput.Icon icon="magnify" />}
            right={
              searchQuery.length > 0 ? (
                <TextInput.Icon
                  icon="close"
                  onPress={() => handleSearch('')}
                />
              ) : undefined
            }
          />
        </Card.Content>
      </Card>

      <View style={styles.resultsContainer}>
        {assets.length > 0 ? (
          <FlatList
            data={assets}
            renderItem={renderAssetItem}
            keyExtractor={(item) => item.id}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    flex: 1,
  },
  searchInput: {
    marginBottom: 8,
  },
  resultsContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  footerLoader: {
    padding: 16,
    alignItems: 'center',
  },
});