import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Input, Button, Card } from 'react-native-elements';
import { InventoryCard } from './InventoryCard';
import { useInventoryItem, useStockValidation, useRecordPartUsage } from '../../hooks/useInventory';
import { MobileInventoryItem, PartUsage } from '../../types';
import { theme } from '../../theme/theme';

interface PartUsageFormProps {
  visible: boolean;
  workOrderId: string;
  selectedItem?: MobileInventoryItem;
  onClose: () => void;
  onSuccess?: (usage: PartUsage) => void;
}

export const PartUsageForm: React.FC<PartUsageFormProps> = ({
  visible,
  workOrderId,
  selectedItem,
  onClose,
  onSuccess,
}) => {
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: itemData } = useInventoryItem(selectedItem?.id || '');
  const item = itemData || selectedItem;

  const quantityNum = parseInt(quantity) || 0;
  const { data: stockValidation } = useStockValidation(
    item?.id || '',
    quantityNum
  );

  const recordPartUsageMutation = useRecordPartUsage();

  useEffect(() => {
    if (visible) {
      setQuantity('1');
      setNotes('');
      setIsSubmitting(false);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!item || !stockValidation?.isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const usage: Omit<PartUsage, 'id' | 'created_at'> = {
        work_order_id: workOrderId,
        item_id: item.id,
        quantity_used: quantityNum,
        price_at_time_of_use: item.unit_price,
      };

      const result = await recordPartUsageMutation.mutateAsync(usage);
      
      Alert.alert(
        'Success',
        `${quantityNum} ${item.name} recorded successfully`,
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess?.(result);
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to record part usage',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuantityChange = (text: string) => {
    // Only allow positive integers
    const numericValue = text.replace(/[^0-9]/g, '');
    setQuantity(numericValue);
  };

  const getTotalCost = () => {
    if (!item || !quantityNum) return 0;
    return quantityNum * item.unit_price;
  };

  const canSubmit = () => {
    return (
      item &&
      quantityNum > 0 &&
      stockValidation?.isValid &&
      !isSubmitting
    );
  };

  if (!item) {
    return null;
  }

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
          <Text style={styles.title}>Record Part Usage</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Selected Item */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Part</Text>
            <InventoryCard
              item={item}
              showQuantity={true}
              showPrice={true}
            />
          </View>

          {/* Quantity Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity to Use</Text>
            <Input
              value={quantity}
              onChangeText={handleQuantityChange}
              placeholder="Enter quantity"
              keyboardType="numeric"
              containerStyle={styles.inputContainer}
              inputStyle={styles.input}
              errorMessage={
                stockValidation && !stockValidation.isValid
                  ? stockValidation.message
                  : undefined
              }
              errorStyle={styles.errorText}
            />
            
            {stockValidation && (
              <View style={styles.stockInfo}>
                <Text style={styles.stockText}>
                  Available: {stockValidation.availableQuantity}
                </Text>
                {stockValidation.isValid && quantityNum > 0 && (
                  <Text style={[styles.stockText, { color: theme.colors.success }]}>
                    ✓ Stock available
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Cost Summary */}
          {quantityNum > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cost Summary</Text>
              <Card containerStyle={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Unit Price:</Text>
                  <Text style={styles.summaryValue}>${item.unit_price.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Quantity:</Text>
                  <Text style={styles.summaryValue}>{quantityNum}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total Cost:</Text>
                  <Text style={styles.totalValue}>${getTotalCost().toFixed(2)}</Text>
                </View>
              </Card>
            </View>
          )}

          {/* Notes (Optional) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <Input
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes about this part usage..."
              multiline
              numberOfLines={3}
              containerStyle={styles.inputContainer}
              inputStyle={[styles.input, styles.notesInput]}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={isSubmitting ? 'Recording...' : 'Record Usage'}
            onPress={handleSubmit}
            disabled={!canSubmit()}
            loading={isSubmitting}
            buttonStyle={[
              styles.submitButton,
              !canSubmit() && styles.disabledButton,
            ]}
            titleStyle={styles.submitButtonText}
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
  placeholder: {
    width: 60, // Same width as cancel button for centering
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
  inputContainer: {
    paddingHorizontal: 0,
  },
  input: {
    fontSize: 16,
    color: theme.colors.grey0,
  },
  notesInput: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  stockText: {
    fontSize: 14,
    color: theme.colors.grey2,
  },
  summaryCard: {
    borderRadius: 8,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.grey2,
  },
  summaryValue: {
    fontSize: 14,
    color: theme.colors.grey0,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.grey4,
    paddingTop: 8,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.grey0,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.grey4,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
  },
  disabledButton: {
    backgroundColor: theme.colors.grey3,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});