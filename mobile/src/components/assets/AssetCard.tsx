import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Card, Badge, Icon} from 'react-native-elements';
import {Vehicle} from '@/types';
import {theme} from '@/theme/theme';

interface AssetCardProps {
  asset: Vehicle;
  onPress: (assetId: string) => void;
  showCustomer?: boolean;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  onPress,
  showCustomer = true,
}) => {
  const handlePress = () => {
    onPress(asset.id);
  };

  const getAssetTypeIcon = () => {
    // For now, all assets are vehicles/bikes
    return 'motorcycle';
  };

  const getAssetStatusColor = () => {
    // Basic status logic - can be enhanced based on maintenance status
    if (asset.is_emergency_bike) {
      return theme.colors.warning;
    }
    return theme.colors.success;
  };

  const formatAssetInfo = () => {
    return `${asset.year} ${asset.make} ${asset.model}`;
  };

  const formatMileage = () => {
    if (asset.mileage) {
      return `${asset.mileage.toLocaleString()} km`;
    }
    return 'N/A';
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Card containerStyle={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Icon
              name={getAssetTypeIcon()}
              type="material"
              size={24}
              color={theme.colors.primary}
              style={styles.icon}
            />
            <View style={styles.titleContainer}>
              <Text style={styles.assetModel}>{formatAssetInfo()}</Text>
              <Text style={styles.licensePlate}>{asset.license_plate}</Text>
            </View>
            <View style={styles.statusContainer}>
              <Badge
                value={asset.is_emergency_bike ? 'Emergency' : 'Active'}
                badgeStyle={[
                  styles.statusBadge,
                  {backgroundColor: getAssetStatusColor()},
                ]}
                textStyle={styles.statusText}
              />
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>VIN</Text>
              <Text style={styles.infoValue}>{asset.vin}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Mileage</Text>
              <Text style={styles.infoValue}>{formatMileage()}</Text>
            </View>
          </View>

          {asset.battery_capacity && (
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Battery</Text>
                <Text style={styles.infoValue}>{asset.battery_capacity}kWh</Text>
              </View>
              {asset.motor_number && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Motor #</Text>
                  <Text style={styles.infoValue}>{asset.motor_number}</Text>
                </View>
              )}
            </View>
          )}

          {showCustomer && asset.customers && (
            <View style={styles.customerSection}>
              <Text style={styles.customerLabel}>Owner</Text>
              <Text style={styles.customerName}>{asset.customers.name}</Text>
              {asset.customers.phone && (
                <Text style={styles.customerPhone}>{asset.customers.phone}</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Icon
            name="chevron-right"
            type="material"
            size={20}
            color={theme.colors.grey3}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    marginHorizontal: 0,
    marginVertical: 0,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  titleContainer: {
    flex: 1,
  },
  assetModel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: 2,
  },
  licensePlate: {
    fontSize: 14,
    color: theme.colors.grey2,
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.grey2,
    marginBottom: 2,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.black,
    fontWeight: '500',
  },
  customerSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.grey5,
  },
  customerLabel: {
    fontSize: 12,
    color: theme.colors.grey2,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  customerName: {
    fontSize: 14,
    color: theme.colors.black,
    fontWeight: '500',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 13,
    color: theme.colors.grey2,
  },
  footer: {
    alignItems: 'flex-end',
  },
});