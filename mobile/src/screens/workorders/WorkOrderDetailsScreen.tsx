import React, {useState, useCallback} from 'react';
import {View, StyleSheet, ScrollView, Linking, Alert} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  Divider,
  IconButton,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {ScreenWrapper, LoadingSpinner, ErrorState} from '@/components/common';
import {
  StatusUpdateModal,
  CompletionModal,
  SLATimer,
  ActivityLog,
  type CompletionData,
  type ActivityLogEntry,
} from '@/components/workorders';
import {useWorkOrder, usePrefetchWorkOrder, useUpdateWorkOrder} from '@/hooks/useWorkOrders';
import {useNetwork} from '@/hooks/useNetwork';
import {MobileWorkOrder} from '@/types';

interface WorkOrderDetailsScreenProps {
  route: {
    params: {
      workOrderId: string;
    };
  };
  navigation?: any;
}

export const WorkOrderDetailsScreen: React.FC<WorkOrderDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const {workOrderId} = route.params;
  const theme = useTheme();
  const {isOnline} = useNetwork();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Hooks
  const {
    data: workOrder,
    isLoading,
    error,
    refetch,
  } = useWorkOrder(workOrderId);

  const prefetchWorkOrder = usePrefetchWorkOrder();
  const updateWorkOrderMutation = useUpdateWorkOrder();

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (!isOnline) return;
    
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [isOnline, refetch]);

  // Handle phone call
  const handleCallCustomer = useCallback((phoneNumber: string) => {
    const phoneUrl = `tel:${phoneNumber}`;
    Linking.canOpenURL(phoneUrl).then(supported => {
      if (supported) {
        Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Phone calls are not supported on this device');
      }
    });
  }, []);

  // Handle navigation
  const handleNavigateToCustomer = useCallback((workOrder: MobileWorkOrder) => {
    if (!workOrder.customerLat || !workOrder.customerLng) {
      Alert.alert('Error', 'Customer location not available');
      return;
    }

    const destination = `${workOrder.customerLat},${workOrder.customerLng}`;
    const label = encodeURIComponent(workOrder.customerAddress || 'Customer Location');
    
    // Try Google Maps first, then Apple Maps
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${label}`;
    const appleMapsUrl = `http://maps.apple.com/?daddr=${destination}&dirflg=d`;
    
    Linking.canOpenURL(googleMapsUrl).then(supported => {
      if (supported) {
        Linking.openURL(googleMapsUrl);
      } else {
        Linking.openURL(appleMapsUrl);
      }
    });
  }, []);

  // Handle status update
  const handleStatusUpdate = useCallback(() => {
    setShowStatusModal(true);
  }, []);

  // Handle completion
  const handleComplete = useCallback(() => {
    setShowCompletionModal(true);
  }, []);

  // Handle status change
  const handleStatusChange = useCallback(async (status: string, notes?: string) => {
    if (!workOrder) return;

    const activityEntry = {
      timestamp: new Date().toISOString(),
      activity: `Status changed from ${workOrder.status} to ${status}${notes ? `: ${notes}` : ''}`,
      userId: 'current-user', // This would come from auth context
    };

    await updateWorkOrderMutation.mutateAsync({
      id: workOrder.id,
      updates: {
        status,
        serviceNotes: notes ? `${workOrder.serviceNotes || ''}\n\n${notes}`.trim() : workOrder.serviceNotes,
        activityLog: [activityEntry],
      },
    });
  }, [workOrder, updateWorkOrderMutation]);

  // Handle work order completion
  const handleWorkOrderCompletion = useCallback(async (completionData: CompletionData) => {
    if (!workOrder) return;

    const activityEntry = {
      timestamp: new Date().toISOString(),
      activity: `Work order completed: ${completionData.completionNotes}`,
      userId: 'current-user', // This would come from auth context
    };

    const completionNotes = [
      workOrder.serviceNotes || '',
      '',
      '=== COMPLETION NOTES ===',
      completionData.completionNotes,
      '',
      `Customer Satisfied: ${completionData.customerSatisfied ? 'Yes' : 'No'}`,
      `Follow-up Required: ${completionData.followUpRequired ? 'Yes' : 'No'}`,
      completionData.followUpRequired && completionData.followUpNotes 
        ? `Follow-up Notes: ${completionData.followUpNotes}`
        : '',
    ].filter(Boolean).join('\n');

    await updateWorkOrderMutation.mutateAsync({
      id: workOrder.id,
      updates: {
        status: 'Completed',
        serviceNotes: completionNotes,
        completedAt: new Date().toISOString(),
        activityLog: [activityEntry],
      },
    });
  }, [workOrder, updateWorkOrderMutation]);

  // Utility functions
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Emergency':
        return '#f44336';
      case 'High':
        return '#ff9800';
      case 'Medium':
        return '#2196f3';
      case 'Low':
        return '#4caf50';
      default:
        return theme.colors.primary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return '#2196f3';
      case 'In Progress':
        return '#ff9800';
      case 'Completed':
        return '#4caf50';
      case 'On Hold':
        return '#9e9e9e';
      case 'Cancelled':
        return '#f44336';
      default:
        return theme.colors.primary;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = (workOrder: MobileWorkOrder) => {
    if (!workOrder.appointmentDate || workOrder.status === 'Completed') {
      return false;
    }
    return new Date(workOrder.appointmentDate) < new Date();
  };

  // Generate activity log from work order data
  const generateActivityLog = (workOrder: MobileWorkOrder): ActivityLogEntry[] => {
    const activities: ActivityLogEntry[] = [];

    // Add creation activity
    activities.push({
      id: `created-${workOrder.id}`,
      timestamp: workOrder.createdAt,
      activity: 'Work order created',
      userId: workOrder.assignedTechnicianId,
      type: 'assignment',
    });

    // Add status changes from activity log if available
    if (workOrder.activityLog && Array.isArray(workOrder.activityLog)) {
      workOrder.activityLog.forEach((entry: any, index: number) => {
        activities.push({
          id: `activity-${workOrder.id}-${index}`,
          timestamp: entry.timestamp,
          activity: entry.activity,
          userId: entry.userId,
          userName: entry.userName,
          type: entry.activity.toLowerCase().includes('status') ? 'status_change' : 'other',
        });
      });
    }

    // Add completion activity if completed
    if (workOrder.status === 'Completed' && workOrder.completedAt) {
      activities.push({
        id: `completed-${workOrder.id}`,
        timestamp: workOrder.completedAt,
        activity: 'Work order completed',
        userId: workOrder.assignedTechnicianId,
        type: 'completion',
      });
    }

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <LoadingSpinner />
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper>
        <ErrorState
          message={error.message || 'Failed to load work order details'}
          onRetry={handleRefresh}
        />
      </ScreenWrapper>
    );
  }

  if (!workOrder) {
    return (
      <ScreenWrapper>
        <ErrorState
          message="Work order not found"
          onRetry={() => navigation?.goBack()}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      scrollable
      refreshing={refreshing}
      onRefresh={handleRefresh}
      padding={false}>
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <Card style={[styles.card, isOverdue(workOrder) && styles.overdueCard]}>
          <Card.Content>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text variant="headlineSmall" style={styles.workOrderNumber}>
                  {workOrder.workOrderNumber}
                </Text>
                {workOrder.localChanges && (
                  <View style={styles.syncIndicator}>
                    <Icon name="sync-problem" size={16} color={theme.colors.error} />
                    <Text variant="bodySmall" style={[styles.syncText, {color: theme.colors.error}]}>
                      Pending sync
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.headerRight}>
                <Chip
                  mode="flat"
                  textStyle={[styles.priorityText, {color: getPriorityColor(workOrder.priority)}]}
                  style={[styles.priorityChip, {borderColor: getPriorityColor(workOrder.priority)}]}>
                  {workOrder.priority}
                </Chip>
              </View>
            </View>

            <View style={styles.statusRow}>
              <Chip
                mode="flat"
                textStyle={[styles.statusText, {color: getStatusColor(workOrder.status)}]}
                style={[styles.statusChip, {borderColor: getStatusColor(workOrder.status)}]}>
                {workOrder.status}
              </Chip>
              {isOverdue(workOrder) && (
                <Chip
                  mode="flat"
                  textStyle={styles.overdueText}
                  style={styles.overdueChip}>
                  Overdue
                </Chip>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Customer Information */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Icon name="person" size={24} color={theme.colors.primary} />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Customer Information
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Name:</Text>
              <Text variant="bodyMedium" style={styles.value}>
                {workOrder.customerName}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Phone:</Text>
              <View style={styles.phoneRow}>
                <Text variant="bodyMedium" style={styles.value}>
                  {workOrder.customerPhone}
                </Text>
                <IconButton
                  icon="phone"
                  size={20}
                  onPress={() => handleCallCustomer(workOrder.customerPhone)}
                />
              </View>
            </View>

            {workOrder.customerAddress && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>Address:</Text>
                <View style={styles.addressRow}>
                  <Text variant="bodyMedium" style={[styles.value, styles.addressText]}>
                    {workOrder.customerAddress}
                  </Text>
                  <IconButton
                    icon="directions"
                    size={20}
                    onPress={() => handleNavigateToCustomer(workOrder)}
                  />
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Vehicle Information */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Icon name="directions-car" size={24} color={theme.colors.primary} />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Vehicle Information
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Vehicle:</Text>
              <Text variant="bodyMedium" style={styles.value}>
                {workOrder.vehicleModel}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Service Information */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Icon name="build" size={24} color={theme.colors.primary} />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Service Requirements
              </Text>
            </View>
            
            <Text variant="bodyMedium" style={styles.serviceDescription}>
              {workOrder.service}
            </Text>

            {workOrder.serviceNotes && (
              <>
                <Divider style={styles.divider} />
                <Text variant="titleMedium" style={styles.notesTitle}>
                  Service Notes
                </Text>
                <Text variant="bodyMedium" style={styles.serviceNotes}>
                  {workOrder.serviceNotes}
                </Text>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Schedule Information */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Icon name="schedule" size={24} color={theme.colors.primary} />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Schedule
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Appointment:</Text>
              <Text variant="bodyMedium" style={styles.value}>
                {formatDate(workOrder.appointmentDate)}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Created:</Text>
              <Text variant="bodyMedium" style={styles.value}>
                {formatDate(workOrder.createdAt)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Last Updated:</Text>
              <Text variant="bodyMedium" style={styles.value}>
                {formatDate(workOrder.updatedAt)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* SLA Timer */}
        <Card style={styles.card}>
          <Card.Content>
            <SLATimer workOrder={workOrder} />
          </Card.Content>
        </Card>

        {/* Distance Information (if available) */}
        {workOrder.distanceFromTechnician && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Icon name="location-on" size={24} color={theme.colors.primary} />
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Location
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>Distance:</Text>
                <Text variant="bodyMedium" style={styles.value}>
                  {workOrder.distanceFromTechnician < 1 
                    ? `${Math.round(workOrder.distanceFromTechnician * 1000)}m away`
                    : `${workOrder.distanceFromTechnician.toFixed(1)}km away`
                  }
                </Text>
              </View>

              {workOrder.estimatedTravelTime && (
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium" style={styles.label}>Travel Time:</Text>
                  <Text variant="bodyMedium" style={styles.value}>
                    ~{workOrder.estimatedTravelTime} minutes
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Activity Log */}
        <ActivityLog 
          activities={generateActivityLog(workOrder)}
          maxHeight={200}
        />

        {/* Action Buttons */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={handleStatusUpdate}
                style={styles.actionButton}
                icon="edit">
                Update Status
              </Button>
              
              {workOrder.status !== 'Completed' && (
                <Button
                  mode="contained"
                  onPress={handleComplete}
                  style={styles.actionButton}
                  icon="check-circle">
                  Complete
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Offline Indicator */}
        {!isOnline && (
          <View style={styles.offlineIndicator}>
            <Icon name="cloud-off" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={styles.offlineText}>
              Viewing cached data. Connect to internet for latest updates.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Status Update Modal */}
      <StatusUpdateModal
        visible={showStatusModal}
        onDismiss={() => setShowStatusModal(false)}
        workOrder={workOrder}
        onUpdateStatus={handleStatusChange}
        isUpdating={updateWorkOrderMutation.isPending}
      />

      {/* Completion Modal */}
      <CompletionModal
        visible={showCompletionModal}
        onDismiss={() => setShowCompletionModal(false)}
        workOrder={workOrder}
        onComplete={handleWorkOrderCompletion}
        isCompleting={updateWorkOrderMutation.isPending}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 16,
  },
  workOrderNumber: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncText: {
    marginLeft: 4,
    fontSize: 12,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityChip: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusChip: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  overdueChip: {
    backgroundColor: '#f44336',
  },
  overdueText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontWeight: '500',
    flex: 1,
  },
  value: {
    flex: 2,
    textAlign: 'right',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 2,
    justifyContent: 'flex-end',
  },
  addressText: {
    textAlign: 'right',
    flex: 1,
  },
  serviceDescription: {
    lineHeight: 20,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  notesTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  serviceNotes: {
    lineHeight: 20,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  offlineText: {
    marginLeft: 8,
    opacity: 0.7,
  },
});