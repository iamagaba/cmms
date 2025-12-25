import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Badge, Icon } from 'react-native-elements';
import { MobileInventoryItem } from '../../types';
import { theme } from '../../theme/theme';

interface InventoryCardProps {
  item: MobileInventoryItem;
  onPress?: (item: MobileInventoryItem) => void;
  showQuantity?: boolean;
  showPrice?: boolean;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({
  item,
  onPress,
  showQuantity = true,
  showPrice = true,
}) => {
  const handlePress = () => {
    onPress?.(item);
  };

  const getStockStatusColor = () => {
    if (item.isLowStock) {
      return theme.colors.error;
    }
    if (item.quantity_on_hand <= item.reorder_level * 1.5) {
      return theme.colors.warning;
    }
    return theme.colors.success;
  };

  const getStockStatusText = () => {
    if (item.isLowStock) {
      return 'Low Stock';
    }
    if (item.quantity_on_hand <= item.reorder_level * 1.5) {
      return 'Running Low';
    }
    return 'In Stock';
  };

  return (
    <TouchableOpacity onPress={handlePress} disabled={!onPress}>
      <Card containerStyle={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.sku}>SKU: {item.sku}</Text>
          </View>
          <Badge
            value={getStockStatusText()}
            badgeStyle={[styles.statusBadge, { backgroundColor: getStockStatusColor() }]}
            textStyle={styles.statusText}
          />
        </View>

        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.details}>
          {showQuantity && (
            <View style={styles.detailItem}>
              <Icon
                name="inventory"
                type="material"
                size={16}
                color={theme.colors.grey3}
                style={styles.detailIcon}
              />
              <Text style={styles.detailText}>
                Qty: {item.quantity_on_hand}
              </Text>
              {item.isLowStock && (
                <Text style={[styles.detailText, { color: theme.colors.error }]}>
                  (Min: {item.reorder_level})
                </Text>
              )}
            </View>
          )}

          {showPrice && (
            <View style={styles.detailItem}>
              <Icon
                name="attach-money"
                type="material"
                size={16}
                color={theme.colors.grey3}
                style={styles.detailIcon}
              />
              <Text style={styles.detailText}>
                ${item.unit_price.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {item.localChanges && (
          <View style={styles.syncStatus}>
            <Icon
              name="sync-problem"
              type="material"
              size={14}
              color={theme.colors.warning}
            />
            <Text style={styles.syncText}>Pending sync</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.grey0,
    marginBottom: 2,
  },
  sku: {
    fontSize: 12,
    color: theme.colors.grey3,
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: theme.colors.grey2,
    marginBottom: 8,
    lineHeight: 18,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    marginRight: 4,
  },
  detailText: {
    fontSize: 12,
    color: theme.colors.grey2,
    marginRight: 4,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.grey5,
  },
  syncText: {
    fontSize: 11,
    color: theme.colors.warning,
    marginLeft: 4,
  },
});