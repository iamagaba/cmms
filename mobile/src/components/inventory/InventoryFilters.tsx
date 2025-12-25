import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Button, CheckBox, ButtonGroup } from 'react-native-elements';
import { InventoryFilter } from '../../types';
import { theme } from '../../theme/theme';

interface InventoryFiltersProps {
  visible: boolean;
  currentFilter: InventoryFilter;
  onApply: (filter: InventoryFilter) => void;
  onClose: () => void;
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  visible,
  currentFilter,
  onApply,
  onClose,
}) => {
  const [tempFilter, setTempFilter] = useState<InventoryFilter>(currentFilter);

  const sortByOptions = [
    { label: 'Name', value: 'name' },
    { label: 'SKU', value: 'sku' },
    { label: 'Quantity', value: 'quantity' },
    { label: 'Price', value: 'price' },
  ];

  const sortOrderOptions = ['Ascending', 'Descending'];

  const handleApply = () => {
    onApply(tempFilter);
  };

  const handleReset = () => {
    const resetFilter: InventoryFilter = {
      searchTerm: currentFilter.searchTerm, // Keep search term
      sortBy: 'name',
      sortOrder: 'asc',
    };
    setTempFilter(resetFilter);
  };

  const getSortByIndex = () => {
    return sortByOptions.findIndex(option => option.value === tempFilter.sortBy) || 0;
  };

  const getSortOrderIndex = () => {
    return tempFilter.sortOrder === 'desc' ? 1 : 0;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Filter Inventory</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetButton}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stock Status Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stock Status</Text>
            <CheckBox
              title="Show only low stock items"
              checked={tempFilter.lowStockOnly || false}
              onPress={() =>
                setTempFilter(prev => ({
                  ...prev,
                  lowStockOnly: !prev.lowStockOnly,
                }))
              }
              containerStyle={styles.checkboxContainer}
              textStyle={styles.checkboxText}
              checkedColor={theme.colors.primary}
            />
          </View>

          {/* Sort By */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            <ButtonGroup
              buttons={sortByOptions.map(option => option.label)}
              selectedIndex={getSortByIndex()}
              onPress={(index) =>
                setTempFilter(prev => ({
                  ...prev,
                  sortBy: sortByOptions[index].value as any,
                }))
              }
              containerStyle={styles.buttonGroupContainer}
              selectedButtonStyle={styles.selectedButton}
              selectedTextStyle={styles.selectedButtonText}
              textStyle={styles.buttonText}
            />
          </View>

          {/* Sort Order */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort Order</Text>
            <ButtonGroup
              buttons={sortOrderOptions}
              selectedIndex={getSortOrderIndex()}
              onPress={(index) =>
                setTempFilter(prev => ({
                  ...prev,
                  sortOrder: index === 0 ? 'asc' : 'desc',
                }))
              }
              containerStyle={styles.buttonGroupContainer}
              selectedButtonStyle={styles.selectedButton}
              selectedTextStyle={styles.selectedButtonText}
              textStyle={styles.buttonText}
            />
          </View>

          {/* Filter Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Filters</Text>
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>
                Sort: {sortByOptions.find(opt => opt.value === tempFilter.sortBy)?.label || 'Name'} ({tempFilter.sortOrder === 'desc' ? 'Descending' : 'Ascending'})
              </Text>
              {tempFilter.lowStockOnly && (
                <Text style={styles.summaryText}>• Low stock items only</Text>
              )}
              {tempFilter.searchTerm && (
                <Text style={styles.summaryText}>• Search: "{tempFilter.searchTerm}"</Text>
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Apply Filters"
            onPress={handleApply}
            buttonStyle={styles.applyButton}
            titleStyle={styles.applyButtonText}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.grey0,
  },
  cancelButton: {
    fontSize: 16,
    color: theme.colors.grey2,
  },
  resetButton: {
    fontSize: 16,
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.grey0,
    marginBottom: 12,
  },
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingLeft: 0,
    marginLeft: 0,
  },
  checkboxText: {
    fontSize: 14,
    color: theme.colors.grey1,
    fontWeight: 'normal',
  },
  buttonGroupContainer: {
    borderRadius: 8,
    borderColor: theme.colors.grey4,
    marginHorizontal: 0,
  },
  selectedButton: {
    backgroundColor: theme.colors.primary,
  },
  selectedButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  buttonText: {
    fontSize: 14,
    color: theme.colors.grey1,
  },
  summaryContainer: {
    backgroundColor: theme.colors.grey5,
    padding: 12,
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 14,
    color: theme.colors.grey1,
    marginBottom: 4,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.grey4,
  },
  applyButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});