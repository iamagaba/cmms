import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Card, Text, Chip, Badge, useTheme} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {MobileWorkOrder} from '@/types';
import {SLATimer} from './SLATimer';

interface WorkOrderCardProps {
  workOrder: MobileWorkOrder;
  onPress: (workOrder: MobileWorkOrder) => void;
  showDistance?: boolean;
  compact?: boolean;
}

export const WorkOrderCard: React.FC<WorkOrderCardProps> = ({
  workOrder,
  onPress,
  showDistance = false,
  compact = false,
}) => {
  const theme = useTheme();

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

  const getMobileStatusIcon = (mobileStatus: string) => {
    switch (mobileStatus) {
      case 'assigned':
        return 'assignment';
      case 'traveling':
        return 'directions-car';
      case 'on_site':
        return 'location-on';
      case 'in_progress':
        return 'build';
      case 'completed':
        return 'check-circle';
      default:
        return 'assignment';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    return distance < 1 
      ? `${Math.round(distance * 1000)}m away`
      : `${distance.toFixed(1)}km away`;
  };

  const isOverdue = () => {
    if (!workOrder.appointmentDate || workOrder.status === 'Completed') {
      return false;
    }
    return new Date(workOrder.appointmentDate) < new Date();
  };

  return (
    <TouchableOpacity onPress={() => onPress(workOrder)}>
      <Card style={[
        compact ? styles.compactCard : styles.card, 
        isOverdue() && styles.overdueCard
      ]}>
        <Card.Content style={compact ? styles.compactContent : undefined}>
          {/* Header with work order number and priority */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text variant={compact ? "titleSmall" : "titleMedium"} style={styles.workOrderNumber}>
                {workOrder.workOrderNumber}
              </Text>
              {workOrder.localChanges && (
                <Icon 
                  name="sync-problem" 
                  size={compact ? 14 : 16} 
                  color={theme.colors.error}
                  style={styles.syncIcon}
                />
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

          {/* Status and mobile status */}
          <View style={styles.statusRow}>
            <View style={styles.statusContainer}>
              <Icon 
                name={getMobileStatusIcon(workOrder.mobileStatus)} 
                size={compact ? 14 : 16} 
                color={getStatusColor(workOrder.status)}
                style={styles.statusIcon}
              />
              <Text 
                variant="bodySmall" 
                style={[styles.statusText, {color: getStatusColor(workOrder.status)}]}>
                {workOrder.status}
              </Text>
            </View>
            {isOverdue() && (
              <Badge style={styles.overdueBadge}>
                Overdue
              </Badge>
            )}
          </View>

          {/* Customer and vehicle info - simplified in compact mode */}
          {compact ? (
            <View style={styles.infoRow}>
              <Icon name="person" size={14} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={styles.infoText} numberOfLines={1}>
                {workOrder.customerName} • {workOrder.vehicleModel}
              </Text>
            </View>
          ) : (
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Icon name="person" size={16} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={styles.infoText}>
                  {workOrder.customerName}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="directions-car" size={16} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={styles.infoText}>
                  {workOrder.vehicleModel}
                </Text>
              </View>
            </View>
          )}

          {/* Service description */}
          <Text 
            variant="bodySmall" 
            style={styles.serviceText}
            numberOfLines={compact ? 1 : 2}>
            {workOrder.service}
          </Text>

          {/* SLA Timer - only show in non-compact mode */}
          {!compact && (
            <SLATimer workOrder={workOrder} compact style={styles.slaTimer} />
          )}

          {/* Footer with date and distance */}
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <Icon name="schedule" size={compact ? 12 : 14} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={styles.footerText}>
                {formatDate(workOrder.appointmentDate)}
              </Text>
            </View>
            {showDistance && workOrder.distanceFromTechnician && (
              <View style={styles.footerRight}>
                <Icon name="location-on" size={compact ? 12 : 14} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodySmall" style={styles.footerText}>
                  {formatDistance(workOrder.distanceFromTechnician)}
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
  },
  compactCard: {
    marginVertical: 4,
    elevation: 1,
  },
  compactContent: {
    paddingVertical: 12,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    marginLeft: 8,
  },
  workOrderNumber: {
    fontWeight: 'bold',
  },
  syncIcon: {
    marginLeft: 8,
  },
  priorityChip: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontWeight: '500',
  },
  overdueBadge: {
    backgroundColor: '#f44336',
  },
  infoSection: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    marginLeft: 8,
    flex: 1,
  },
  serviceText: {
    marginBottom: 8,
    opacity: 0.8,
    lineHeight: 18,
  },
  slaTimer: {
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    marginLeft: 4,
    opacity: 0.7,
  },
});