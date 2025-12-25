import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import { Header, FAB } from 'react-native-elements';
import { InventoryList, PartSelector, PartUsageForm } from '../../components/inventory';
import { useLowStockItems, useInventoryStats } from '../../hooks/useInventory';
import { MobileInventoryItem } from '../../types';
import { theme } from '../../theme/theme';

export const InventoryScreen: React.FC = () => {
  const [showPartSelector, setShowPartSelector] = useState(false);
  const [showUsageForm, setShowUsageForm] = useState(false);
  const [selectedPart, setSelectedPart] = useState<MobileInventoryItem | null>(null);

  const { data: lowStockItems } = useLowStockItems();
  const inventoryStats = useInventoryStats();

  const handlePartPress = (part: MobileInventoryItem) => {
    Alert.alert(
      part.name,
      `SKU: ${part.sku}\nQuantity: ${part.quantity_on_hand}\nPrice: $${part.unit_price.toFixed(2)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Use Part',
          onPress: () => {
            setSelectedPart(part);
            setShowUsageForm(true);
          },
        },
      ]
    );
  };

  const handlePartSelected = (part: MobileInventoryItem) => {
    setSelectedPart(part);
    setShowUsageForm(true);
  };

  const handleUsageSuccess = () => {
    Alert.alert('Success', 'Part usage recorded successfully');
  };

  const getHeaderSubtitle = () => {
    const { totalItems, lowStockCount } = inventoryStats;
    if (lowStockCount > 0) {
      return `${totalItems} items • ${lowStockCount} low stock`;
    }
    return `${totalItems} items`;
  };

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{
          text: 'Inventory',
          style: { color: theme.colors.white, fontSize: 18, fontWeight: '600' },
        }}
        rightComponent={{
          text: getHeaderSubtitle(),
          style: { color: theme.colors.white, fontSize: 12 },
        }}
        backgroundColor={theme.colors.primary}
      />

      <InventoryList
        onItemPress={handlePartPress}
        showFilters={true}
        emptyMessage="No inventory items found"
      />

      <FAB
        icon={{ name: 'qr-code-scanner', type: 'material', color: theme.colors.white }}
        onPress={() => setShowPartSelector(true)}
        placement="right"
        color={theme.colors.primary}
        size="large"
      />

      <PartSelector
        visible={showPartSelector}
        onClose={() => setShowPartSelector(false)}
        onPartSelected={handlePartSelected}
        title="Select Part to Use"
      />

      <PartUsageForm
        visible={showUsageForm}
        workOrderId="demo-work-order" // In real app, this would come from navigation params
        selectedItem={selectedPart}
        onClose={() => {
          setShowUsageForm(false);
          setSelectedPart(null);
        }}
        onSuccess={handleUsageSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.grey5,
  },
});