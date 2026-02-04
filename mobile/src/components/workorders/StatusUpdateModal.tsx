import React, {useState} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {
  Modal,
  Portal,
  Button,
  Text,
  RadioButton,
  TextInput,
  Divider,
  useTheme,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {MobileWorkOrder} from '@/types';

interface StatusUpdateModalProps {
  visible: boolean;
  onDismiss: () => void;
  workOrder: MobileWorkOrder;
  onUpdateStatus: (status: string, notes?: string) => Promise<void>;
  isUpdating?: boolean;
}

const statusOptions = [
  {value: 'New', label: 'New', description: 'Work order is ready to be started'},
  {value: 'In Progress', label: 'In Progress', description: 'Currently working on this order'},
  {value: 'On Hold', label: 'On Hold', description: 'Temporarily paused'},
  {value: 'Completed', label: 'Completed', description: 'Work has been finished'},
];

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  visible,
  onDismiss,
  workOrder,
  onUpdateStatus,
  isUpdating = false,
}) => {
  const theme = useTheme();
  
  const [selectedStatus, setSelectedStatus] = useState(workOrder.status);
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateStatusChange = (newStatus: string): string | null => {
    const currentStatus = workOrder.status;
    
    // Define valid status transitions
    const validTransitions: Record<string, string[]> = {
      'New': ['In Progress', 'On Hold'],
      'In Progress': ['Completed', 'On Hold'],
      'On Hold': ['New', 'In Progress'],
      'Completed': [], // Completed orders cannot be changed
    };

    if (currentStatus === newStatus) {
      return 'Status is already set to this value';
    }

    if (currentStatus === 'Completed') {
      return 'Cannot change status of completed work orders';
    }

    const allowedStatuses = validTransitions[currentStatus] || [];
    if (!allowedStatuses.includes(newStatus)) {
      return `Cannot change from ${currentStatus} to ${newStatus}`;
    }

    return null;
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    const error = validateStatusChange(status);
    setValidationError(error);
  };

  const handleUpdate = async () => {
    const error = validateStatusChange(selectedStatus);
    if (error) {
      setValidationError(error);
      return;
    }

    try {
      await onUpdateStatus(selectedStatus, notes.trim() || undefined);
      onDismiss();
      // Reset form
      setNotes('');
      setValidationError(null);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  const handleCancel = () => {
    setSelectedStatus(workOrder.status);
    setNotes('');
    setValidationError(null);
    onDismiss();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'New':
        return 'assignment';
      case 'In Progress':
        return 'build';
      case 'On Hold':
        return 'pause';
      case 'Completed':
        return 'check-circle';
      default:
        return 'help';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return '#2196f3';
      case 'In Progress':
        return '#ff9800';
      case 'On Hold':
        return '#9e9e9e';
      case 'Completed':
        return '#4caf50';
      default:
        return theme.colors.primary;
    }
  };

  const isStatusDisabled = (status: string) => {
    return !!validateStatusChange(status);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modal, {backgroundColor: theme.colors.surface}]}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text variant="headlineSmall">Update Status</Text>
            <Text variant="bodyMedium" style={styles.workOrderNumber}>
              {workOrder.workOrderNumber}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.currentStatus}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Current Status
            </Text>
            <View style={styles.statusRow}>
              <Icon 
                name={getStatusIcon(workOrder.status)} 
                size={20} 
                color={getStatusColor(workOrder.status)}
              />
              <Text 
                variant="bodyLarge" 
                style={[styles.statusText, {color: getStatusColor(workOrder.status)}]}>
                {workOrder.status}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              New Status
            </Text>
            
            <RadioButton.Group
              onValueChange={handleStatusChange}
              value={selectedStatus}>
              {statusOptions.map(option => (
                <View key={option.value} style={styles.radioOption}>
                  <View style={styles.radioRow}>
                    <RadioButton 
                      value={option.value} 
                      disabled={isStatusDisabled(option.value)}
                    />
                    <View style={styles.radioContent}>
                      <View style={styles.radioHeader}>
                        <Icon 
                          name={getStatusIcon(option.value)} 
                          size={18} 
                          color={isStatusDisabled(option.value) 
                            ? theme.colors.onSurfaceDisabled 
                            : getStatusColor(option.value)
                          }
                        />
                        <Text 
                          variant="bodyLarge" 
                          style={[
                            styles.radioLabel,
                            isStatusDisabled(option.value) && {color: theme.colors.onSurfaceDisabled}
                          ]}>
                          {option.label}
                        </Text>
                      </View>
                      <Text 
                        variant="bodySmall" 
                        style={[
                          styles.radioDescription,
                          isStatusDisabled(option.value) && {color: theme.colors.onSurfaceDisabled}
                        ]}>
                        {option.description}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </RadioButton.Group>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Notes (Optional)
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Add notes about this status change..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={styles.notesInput}
            />
          </View>

          {validationError && (
            <View style={styles.errorContainer}>
              <Icon name="error" size={16} color={theme.colors.error} />
              <Text variant="bodySmall" style={[styles.errorText, {color: theme.colors.error}]}>
                {validationError}
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={handleCancel}
              style={styles.actionButton}
              disabled={isUpdating}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleUpdate}
              style={styles.actionButton}
              disabled={isUpdating || !!validationError || selectedStatus === workOrder.status}
              loading={isUpdating}>
              Update Status
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
    maxHeight: '80%',
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
  workOrderNumber: {
    marginTop: 4,
    opacity: 0.7,
  },
  divider: {
    marginVertical: 8,
  },
  currentStatus: {
    padding: 16,
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusText: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  radioOption: {
    marginBottom: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  radioContent: {
    marginLeft: 8,
    flex: 1,
  },
  radioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  radioLabel: {
    marginLeft: 8,
    fontWeight: '500',
  },
  radioDescription: {
    opacity: 0.7,
    lineHeight: 16,
  },
  notesInput: {
    marginTop: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 0,
  },
  errorText: {
    marginLeft: 8,
    flex: 1,
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