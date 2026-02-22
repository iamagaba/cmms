import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Card, Icon, Badge, Button, Divider } from 'react-native-elements';
import { ScreenWrapper, LoadingSpinner, ErrorState } from '@/components/common';
import { useAssetDetails, useAssetMaintenanceHistory } from '@/hooks/useAssets';
import { AssetsStackParams } from '@/types';
import { theme } from '@/theme/theme';

type AssetDetailsScreenRouteProp = RouteProp<AssetsStackParams, 'AssetDetails'>;

export const AssetDetailsScreen: React.FC = () => {
  const route = useRoute<AssetDetailsScreenRouteProp>();
  const navigation = useNavigation();
  const { assetId } = route.params;

  const {
    data: asset,
    isLoading: assetLoading,
    error: assetError,
    refetch: refetchAsset,
  } = useAssetDetails(assetId);

  const {
    data: maintenanceHistory = [],
    isLoading: historyLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useAssetMaintenanceHistory(assetId);

  const handleRefresh = () => {
    refetchAsset();
    refetchHistory();
  };

  const handleCreateWorkOrder = () => {
    if (asset) {
      navigation.navigate('WorkOrders' as never, {
        screen: 'WorkOrderCreate',
        params: {
          prefilledData: {
            vehicleId: asset.id,
            customerId: asset.customer_id,
          },
        },
      } as never);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAssetInfo = () => {
    if (!asset) return '';
    return `${asset.year} ${asset.make} ${asset.model}`;
  };

  const getStatusColor = () => {
    if (asset?.is_emergency_bike) {
      return theme.colors.warning;
    }
    return theme.colors.success;
  };

  const getStatusText = () => {
    if (asset?.is_emergency_bike) {
      return 'Emergency Bike';
    }
    return 'Active';
  };

  if (assetLoading) {
    return (
      <ScreenWrapper>
        <LoadingSpinner message="Loading asset details..." />
      </ScreenWrapper>
    );
  }

  if (assetError || !asset) {
    return (
      <ScreenWrapper>
        <ErrorState
          title="Failed to Load Asset"
          message="Unable to load asset details. Please try again."
          onRetry={handleRefresh}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Asset Header */}
        <Card containerStyle={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <Icon
                name="motorcycle"
                type="material"
                size={32}
                color={theme.colors.primary}
                style={styles.headerIcon}
              />
              <View style={styles.titleContainer}>
                <Text style={styles.assetTitle}>{formatAssetInfo()}</Text>
                <Text style={styles.licensePlate}>{asset.license_plate}</Text>
              </View>
              <Badge
                value={getStatusText()}
                badgeStyle={[styles.statusBadge, { backgroundColor: getStatusColor() }]}
                textStyle={styles.statusText}
              />
            </View>
          </View>
        </Card>

        {/* Basic Information */}
        <Card containerStyle={styles.card}>
          <Text style={styles.cardTitle}>Basic Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>VIN</Text>
                <Text style={styles.infoValue}>{asset.vin}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Year</Text>
                <Text style={styles.infoValue}>{asset.year}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Make</Text>
                <Text style={styles.infoValue}>{asset.make}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Model</Text>
                <Text style={styles.infoValue}>{asset.model}</Text>
              </View>
            </View>
            {asset.mileage && (
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Mileage</Text>
                  <Text style={styles.infoValue}>{asset.mileage.toLocaleString()} km</Text>
                </View>
                <View style={styles.infoItem} />
              </View>
            )}
          </View>
        </Card>

        {/* Technical Specifications */}
        {(asset.battery_capacity || asset.motor_number) && (
          <Card containerStyle={styles.card}>
            <Text style={styles.cardTitle}>Technical Specifications</Text>
            <View style={styles.infoGrid}>
              {asset.battery_capacity && (
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Battery Capacity</Text>
                    <Text style={styles.infoValue}>{asset.battery_capacity} kWh</Text>
                  </View>
                  <View style={styles.infoItem} />
                </View>
              )}
              {asset.motor_number && (
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Motor Number</Text>
                    <Text style={styles.infoValue}>{asset.motor_number}</Text>
                  </View>
                  <View style={styles.infoItem} />
                </View>
              )}
              {asset.date_of_manufacture && (
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Manufacture Date</Text>
                    <Text style={styles.infoValue}>{formatDate(asset.date_of_manufacture)}</Text>
                  </View>
                  <View style={styles.infoItem} />
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Owner Information */}
        {asset.customers && (
          <Card containerStyle={styles.card}>
            <Text style={styles.cardTitle}>Owner Information</Text>
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>{asset.customers.name}</Text>
              {asset.customers.phone && (
                <TouchableOpacity
                  onPress={() => {
                    // Handle phone call
                    Alert.alert(
                      'Call Owner',
                      `Call ${asset.customers?.name} at ${asset.customers?.phone}?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Call', onPress: () => {/* Implement phone call */ } },
                      ]
                    );
                  }}
                >
                  <Text style={styles.ownerPhone}>{asset.customers.phone}</Text>
                </TouchableOpacity>
              )}
              {asset.customers.customer_type && (
                <Text style={styles.customerType}>
                  Customer Type: {asset.customers.customer_type}
                </Text>
              )}
            </View>
          </Card>
        )}

        {/* Maintenance History */}
        <Card containerStyle={styles.card}>
          <View style={styles.historyHeader}>
            <Text style={styles.cardTitle}>Maintenance History</Text>
            {historyLoading && (
              <Icon
                name="refresh"
                type="material"
                size={20}
                color={theme.colors.grey3}
              />
            )}
          </View>

          {historyError ? (
            <Text style={styles.errorText}>Failed to load maintenance history</Text>
          ) : maintenanceHistory.length === 0 ? (
            <Text style={styles.emptyText}>No maintenance history available</Text>
          ) : (
            <View style={styles.historyList}>
              {maintenanceHistory.slice(0, 5).map((workOrder, index) => (
                <View key={workOrder.id}>
                  <View style={styles.historyItem}>
                    <View style={styles.historyContent}>
                      <Text style={styles.historyTitle}>
                        {workOrder.workOrderNumber}
                      </Text>
                      <Text style={styles.historyDescription}>
                        {workOrder.service || workOrder.initialDiagnosis || 'No description'}
                      </Text>
                      <Text style={styles.historyDate}>
                        {formatDate(workOrder.created_at)}
                      </Text>
                    </View>
                    <Badge
                      value={workOrder.status}
                      badgeStyle={[
                        styles.historyStatusBadge,
                        {
                          backgroundColor:
                            workOrder.status === 'Completed'
                              ? theme.colors.success
                              : workOrder.status === 'In Progress'
                                ? theme.colors.warning
                                : theme.colors.grey3,
                        },
                      ]}
                      textStyle={styles.historyStatusText}
                    />
                  </View>
                  {index < maintenanceHistory.length - 1 && index < 4 && (
                    <Divider style={styles.historyDivider} />
                  )}
                </View>
              ))}
              {maintenanceHistory.length > 5 && (
                <TouchableOpacity style={styles.viewMoreButton}>
                  <Text style={styles.viewMoreText}>
                    View all {maintenanceHistory.length} work orders
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Card>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <Button
            title="Create Work Order"
            onPress={handleCreateWorkOrder}
            buttonStyle={styles.actionButton}
            titleStyle={styles.actionButtonText}
            icon={{
              name: 'add',
              type: 'material',
              size: 20,
              color: theme.colors.white,
            }}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  headerIcon: {
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  assetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.black,
    marginBottom: 4,
  },
  licensePlate: {
    fontSize: 16,
    color: theme.colors.grey2,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.grey2,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: theme.colors.black,
    fontWeight: '500',
  },
  ownerInfo: {
    gap: 8,
  },
  ownerName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.black,
  },
  ownerPhone: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  customerType: {
    fontSize: 14,
    color: theme.colors.grey2,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  historyList: {
    gap: 0,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  historyContent: {
    flex: 1,
    marginRight: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: 4,
  },
  historyDescription: {
    fontSize: 14,
    color: theme.colors.grey2,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: theme.colors.grey3,
  },
  historyStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  historyDivider: {
    backgroundColor: theme.colors.grey5,
  },
  viewMoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    textAlign: 'center',
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.grey2,
    textAlign: 'center',
    paddingVertical: 16,
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});