import React, {useState} from 'react';
import {View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert} from 'react-native';
import {Button, ButtonGroup, Input, Icon, ListItem} from 'react-native-elements';
import {AssetFilters as AssetFiltersType} from '@/services/assetService';
import {useAssetMakes, useAssetModels} from '@/hooks/useAssets';
import {theme} from '@/theme/theme';

interface AssetFiltersProps {
  visible: boolean;
  filters: AssetFiltersType;
  onFiltersChange: (filters: AssetFiltersType) => void;
  onClose: () => void;
}

export const AssetFilters: React.FC<AssetFiltersProps> = ({
  visible,
  filters,
  onFiltersChange,
  onClose,
}) => {
  const [localFilters, setLocalFilters] = useState<AssetFiltersType>(filters);
  const [selectedMake, setSelectedMake] = useState<string | undefined>(filters.make);

  const {data: makes = []} = useAssetMakes();
  const {data: models = []} = useAssetModels(selectedMake);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters: AssetFiltersType = {};
    setLocalFilters(clearedFilters);
    setSelectedMake(undefined);
    onFiltersChange(clearedFilters);
    onClose();
  };

  const handleMakeChange = (make: string) => {
    setSelectedMake(make);
    setLocalFilters(prev => ({
      ...prev,
      make: make || undefined,
      model: undefined, // Clear model when make changes
    }));
  };

  const handleModelChange = (model: string) => {
    setLocalFilters(prev => ({
      ...prev,
      model: model || undefined,
    }));
  };

  const handleYearChange = (year: string) => {
    setLocalFilters(prev => ({
      ...prev,
      year: year ? parseInt(year, 10) : undefined,
    }));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 20}, (_, i) => currentYear - i);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" type="material" size={24} color={theme.colors.grey2} />
          </TouchableOpacity>
          <Text style={styles.title}>Filter Assets</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search</Text>
            <Input
              placeholder="Search by make, model, license plate, or VIN"
              value={localFilters.searchQuery || ''}
              onChangeText={(text) =>
                setLocalFilters(prev => ({
                  ...prev,
                  searchQuery: text || undefined,
                }))
              }
              leftIcon={{
                name: 'search',
                type: 'material',
                color: theme.colors.grey3,
              }}
              inputContainerStyle={styles.inputContainer}
              containerStyle={styles.inputWrapper}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Make</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                Alert.alert(
                  'Select Make',
                  'Choose a vehicle make',
                  [
                    {text: 'All Makes', onPress: () => handleMakeChange('')},
                    ...makes.map(make => ({
                      text: make,
                      onPress: () => handleMakeChange(make)
                    })),
                    {text: 'Cancel', style: 'cancel'}
                  ]
                );
              }}
            >
              <Text style={styles.dropdownText}>
                {selectedMake || 'All Makes'}
              </Text>
              <Icon name="arrow-drop-down" type="material" size={24} color={theme.colors.grey3} />
            </TouchableOpacity>
          </View>

          {selectedMake && models.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Model</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => {
                  Alert.alert(
                    'Select Model',
                    'Choose a vehicle model',
                    [
                      {text: 'All Models', onPress: () => handleModelChange('')},
                      ...models.map(model => ({
                        text: model,
                        onPress: () => handleModelChange(model)
                      })),
                      {text: 'Cancel', style: 'cancel'}
                    ]
                  );
                }}
              >
                <Text style={styles.dropdownText}>
                  {localFilters.model || 'All Models'}
                </Text>
                <Icon name="arrow-drop-down" type="material" size={24} color={theme.colors.grey3} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Year</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                Alert.alert(
                  'Select Year',
                  'Choose a vehicle year',
                  [
                    {text: 'All Years', onPress: () => handleYearChange('')},
                    ...years.map(year => ({
                      text: year.toString(),
                      onPress: () => handleYearChange(year.toString())
                    })),
                    {text: 'Cancel', style: 'cancel'}
                  ]
                );
              }}
            >
              <Text style={styles.dropdownText}>
                {localFilters.year?.toString() || 'All Years'}
              </Text>
              <Icon name="arrow-drop-down" type="material" size={24} color={theme.colors.grey3} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Clear All"
            type="outline"
            onPress={handleClearFilters}
            buttonStyle={[styles.button, styles.clearButton]}
            titleStyle={styles.clearButtonText}
          />
          <Button
            title="Apply Filters"
            onPress={handleApplyFilters}
            buttonStyle={[styles.button, styles.applyButton]}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey5,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.black,
  },
  placeholder: {
    width: 32,
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
    color: theme.colors.black,
    marginBottom: 12,
  },
  inputContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey4,
    paddingHorizontal: 0,
  },
  inputWrapper: {
    paddingHorizontal: 0,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.grey4,
    borderRadius: 8,
    backgroundColor: theme.colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 50,
  },
  dropdownText: {
    fontSize: 16,
    color: theme.colors.black,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.grey5,
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
  },
  clearButton: {
    borderColor: theme.colors.grey3,
    backgroundColor: 'transparent',
  },
  clearButtonText: {
    color: theme.colors.grey2,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: theme.colors.primary,
  },
  applyButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
  },
});