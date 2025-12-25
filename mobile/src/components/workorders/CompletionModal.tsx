import React, {useState} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {
  Modal,
  Portal,
  Button,
  Text,
  TextInput,
  Checkbox,
  Divider,
  useTheme,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {MobileWorkOrder} from '@/types';

interface CompletionModalProps {
  visible: boolean;
  onDismiss: () => void;
  workOrder: MobileWorkOrder;
  onComplete: (completionData: CompletionData) => Promise<void>;
  isCompleting?: boolean;
}

export interface CompletionData {
  completionNotes: string;
  customerSatisfied: boolean;
  followUpRequired: boolean;
  followUpNotes?: string;
  partsUsed?: Array<{
    name: string;
    quantity: number;
  }>;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  visible,
  onDismiss,
  workOrder,
  onComplete,
  isCompleting = false,
}) => {
  const theme = useTheme();
  
  const [completionNotes, setCompletionNotes] = useState('');
  const [customerSatisfied, setCustomerSatisfied] = useState(true);
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!completionNotes.trim()) {
      errors.push('Completion notes are required');
    }
    
    if (completionNotes.trim().length < 10) {
      errors.push('Completion notes must be at least 10 characters');
    }
    
    if (followUpRequired && !followUpNotes.trim()) {
      errors.push('Follow-up notes are required when follow-up is needed');
    }
    
    return errors;
  };

  const handleComplete = async () => {
    const errors = validateForm();
    setValidationErrors(errors);
    
    if (errors.length > 0) {
      return;
    }

    const completionData: CompletionData = {
      completionNotes: completionNotes.trim(),
      customerSatisfied,
      followUpRequired,
      followUpNotes: followUpRequired ? followUpNotes.trim() : undefined,
    };

    try {
      await onComplete(completionData);
      onDismiss();
      // Reset form
      resetForm();
    } catch (error) {
      setValidationErrors([error instanceof Error ? error.message : 'Failed to complete work order']);
    }
  };

  const resetForm = () => {
    setCompletionNotes('');
    setCustomerSatisfied(true);
    setFollowUpRequired(false);
    setFollowUpNotes('');
    setValidationErrors([]);
  };

  const handleCancel = () => {
    resetForm();
    onDismiss();
  };

  const isFormValid = () => {
    const errors = validateForm();
    return errors.length === 0;
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modal, {backgroundColor: theme.colors.surface}]}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Icon name="check-circle" size={32} color={theme.colors.primary} />
            <Text variant="headlineSmall" style={styles.title}>
              Complete Work Order
            </Text>
            <Text variant="bodyMedium" style={styles.workOrderNumber}>
              {workOrder.workOrderNumber}
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Work Summary */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Work Summary
            </Text>
            <View style={styles.summaryCard}>
              <Text variant="bodyMedium" style={styles.summaryLabel}>Customer:</Text>
              <Text variant="bodyMedium" style={styles.summaryValue}>
                {workOrder.customerName}
              </Text>
              
              <Text variant="bodyMedium" style={styles.summaryLabel}>Vehicle:</Text>
              <Text variant="bodyMedium" style={styles.summaryValue}>
                {workOrder.vehicleModel}
              </Text>
              
              <Text variant="bodyMedium" style={styles.summaryLabel}>Service:</Text>
              <Text variant="bodyMedium" style={styles.summaryValue}>
                {workOrder.service}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Completion Notes */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Completion Notes *
            </Text>
            <Text variant="bodySmall" style={styles.fieldDescription}>
              Describe the work performed, any issues encountered, and the final outcome.
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Describe the work completed..."
              value={completionNotes}
              onChangeText={setCompletionNotes}
              multiline
              numberOfLines={4}
              style={styles.textInput}
              error={validationErrors.some(e => e.includes('Completion notes'))}
            />
          </View>

          <Divider style={styles.divider} />

          {/* Customer Satisfaction */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Customer Satisfaction
            </Text>
            <View style={styles.checkboxRow}>
              <Checkbox
                status={customerSatisfied ? 'checked' : 'unchecked'}
                onPress={() => setCustomerSatisfied(!customerSatisfied)}
              />
              <Text variant="bodyMedium" style={styles.checkboxLabel}>
                Customer is satisfied with the work performed
              </Text>
            </View>
            {!customerSatisfied && (
              <View style={styles.warningBox}>
                <Icon name="warning" size={16} color={theme.colors.error} />
                <Text variant="bodySmall" style={[styles.warningText, {color: theme.colors.error}]}>
                  Please ensure any customer concerns are addressed before completing.
                </Text>
              </View>
            )}
          </View>

          <Divider style={styles.divider} />

          {/* Follow-up Required */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Follow-up
            </Text>
            <View style={styles.checkboxRow}>
              <Checkbox
                status={followUpRequired ? 'checked' : 'unchecked'}
                onPress={() => setFollowUpRequired(!followUpRequired)}
              />
              <Text variant="bodyMedium" style={styles.checkboxLabel}>
                Follow-up appointment required
              </Text>
            </View>
            
            {followUpRequired && (
              <View style={styles.followUpSection}>
                <Text variant="bodySmall" style={styles.fieldDescription}>
                  Describe what follow-up work is needed and when it should be scheduled.
                </Text>
                <TextInput
                  mode="outlined"
                  placeholder="Describe follow-up requirements..."
                  value={followUpNotes}
                  onChangeText={setFollowUpNotes}
                  multiline
                  numberOfLines={3}
                  style={styles.textInput}
                  error={validationErrors.some(e => e.includes('Follow-up notes'))}
                />
              </View>
            )}
          </View>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <View style={styles.errorContainer}>
              <Icon name="error" size={16} color={theme.colors.error} />
              <View style={styles.errorList}>
                {validationErrors.map((error, index) => (
                  <Text key={index} variant="bodySmall" style={[styles.errorText, {color: theme.colors.error}]}>
                    • {error}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Completion Confirmation */}
          <View style={styles.confirmationSection}>
            <View style={styles.confirmationBox}>
              <Icon name="info" size={20} color={theme.colors.primary} />
              <Text variant="bodySmall" style={styles.confirmationText}>
                By completing this work order, you confirm that all work has been performed 
                according to specifications and the customer has been notified of completion.
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={handleCancel}
              style={styles.actionButton}
              disabled={isCompleting}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleComplete}
              style={styles.actionButton}
              disabled={isCompleting || !isFormValid()}
              loading={isCompleting}
              icon="check-circle">
              Complete Work Order
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    borderRadius: 8,
    maxHeight: '90%',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  scrollView: {
    maxHeight: '100%',
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    marginTop: 8,
    textAlign: 'center',
  },
  workOrderNumber: {
    marginTop: 4,
    opacity: 0.7,
  },
  divider: {
    marginVertical: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  fieldDescription: {
    marginBottom: 8,
    opacity: 0.7,
    lineHeight: 16,
  },
  summaryCard: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 12,
    borderRadius: 8,
  },
  summaryLabel: {
    fontWeight: '500',
    marginTop: 4,
  },
  summaryValue: {
    marginBottom: 4,
    opacity: 0.8,
  },
  textInput: {
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkboxLabel: {
    marginLeft: 8,
    flex: 1,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  followUpSection: {
    marginTop: 12,
    paddingLeft: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    paddingTop: 0,
  },
  errorList: {
    marginLeft: 8,
    flex: 1,
  },
  errorText: {
    lineHeight: 16,
  },
  confirmationSection: {
    padding: 16,
    paddingTop: 0,
  },
  confirmationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  confirmationText: {
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
    opacity: 0.8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});