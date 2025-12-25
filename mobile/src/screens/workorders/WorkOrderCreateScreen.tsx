import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Card, Button} from 'react-native-paper';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';

import {ScreenWrapper} from '@/components/common';
import {WorkOrdersStackParams} from '@/types';
import {useAssetDetails} from '@/hooks/useAssets';

type WorkOrderCreateScreenRouteProp = RouteProp<WorkOrdersStackParams, 'WorkOrderCreate'>;

export const WorkOrderCreateScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<WorkOrderCreateScreenRouteProp>();
  const {assetId} = route.params || {};

  const {data: asset, isLoading: isLoadingAsset} = useAssetDetails(assetId || '');

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {assetId && asset && (
          <Card style={styles.assetCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.assetTitle}>
                Selected Asset
              </Text>
              <Text style={styles.assetInfo}>
                {asset.year} {asset.make} {asset.model}
              </Text>
              <Text style={styles.assetDetail}>
                License: {asset.license_plate}
              </Text>
              <Text style={styles.assetDetail}>
                VIN: {asset.vin}
              </Text>
              {asset.customers && (
                <Text style={styles.assetDetail}>
                  Owner: {asset.customers.name}
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        <Card style={styles.placeholderCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              Create Work Order
            </Text>
            {assetId ? (
              <Text style={styles.description}>
                Work order creation functionality will be implemented in future phases.
                {'\n\n'}The selected asset information is shown above and will be pre-filled in the work order form.
              </Text>
            ) : (
              <Text style={styles.description}>
                Work order creation functionality will be implemented in future phases.
              </Text>
            )}
            <Text style={styles.features}>
              Features to be implemented:
              {'\n'}• Customer selection
              {'\n'}• Vehicle/asset selection via QR scan
              {'\n'}• Service type selection
              {'\n'}• Priority assignment
              {'\n'}• Scheduling and appointment setting
              {'\n'}• Photo and note attachments
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              Back to Work Orders
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  assetCard: {
    marginBottom: 16,
    backgroundColor: '#e8f5e8',
  },
  assetTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#2e7d32',
  },
  assetInfo: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  assetDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  placeholderCard: {
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  features: {
    marginBottom: 24,
    lineHeight: 24,
  },
  backButton: {
    alignSelf: 'center',
  },
});