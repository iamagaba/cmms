import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Title, Chip} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

interface QuickActionsProps {
  onQRScan?: () => void;
  onNewWorkOrder?: () => void;
  onViewMap?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onQRScan,
  onNewWorkOrder,
  onViewMap,
}) => {
  const navigation = useNavigation();

  const handleQRScan = () => {
    if (onQRScan) {
      onQRScan();
    } else {
      // Navigate to QR scanner screen
      navigation.navigate('Assets' as never, {screen: 'QRScanner', params: {type: 'asset'}} as never);
    }
  };

  const handleNewWorkOrder = () => {
    if (onNewWorkOrder) {
      onNewWorkOrder();
    } else {
      // Navigate to work order creation
      navigation.navigate('WorkOrders' as never, {screen: 'WorkOrderCreate'} as never);
    }
  };

  const handleViewMap = () => {
    if (onViewMap) {
      onViewMap();
    } else {
      // Navigate to map view screen
      navigation.navigate('MapView' as never);
    }
  };

  return (
    <Card style={styles.quickActionsCard}>
      <Card.Content>
        <Title>Quick Actions</Title>
        <View style={styles.chipContainer}>
          <Chip 
            icon="qrcode-scan" 
            mode="outlined" 
            style={styles.chip}
            onPress={handleQRScan}
          >
            Scan QR Code
          </Chip>
          <Chip 
            icon="plus" 
            mode="outlined" 
            style={styles.chip}
            onPress={handleNewWorkOrder}
          >
            New Work Order
          </Chip>
          <Chip 
            icon="map" 
            mode="outlined" 
            style={styles.chip}
            onPress={handleViewMap}
          >
            View Map
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  quickActionsCard: {
    marginTop: 16,
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
});

export default QuickActions;