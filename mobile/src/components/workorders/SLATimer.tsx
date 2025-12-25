import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {MobileWorkOrder} from '@/types';

interface SLATimerProps {
  workOrder: MobileWorkOrder;
  style?: any;
  compact?: boolean;
}

interface SLAInfo {
  deadline: Date;
  timeRemaining: number; // in milliseconds
  isOverdue: boolean;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export const SLATimer: React.FC<SLATimerProps> = ({
  workOrder,
  style,
  compact = false,
}) => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update timer every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const calculateSLA = (): SLAInfo | null => {
    // Skip if work order is completed
    if (workOrder.status === 'Completed') {
      return null;
    }

    // Calculate SLA deadline based on priority and appointment date
    let slaHours = 24; // Default 24 hours
    
    switch (workOrder.priority) {
      case 'Emergency':
        slaHours = 2; // 2 hours for emergency
        break;
      case 'High':
        slaHours = 4; // 4 hours for high priority
        break;
      case 'Medium':
        slaHours = 8; // 8 hours for medium priority
        break;
      case 'Low':
        slaHours = 24; // 24 hours for low priority
        break;
    }

    // Use appointment date as base, or creation date if no appointment
    const baseDate = workOrder.appointmentDate 
      ? new Date(workOrder.appointmentDate)
      : new Date(workOrder.createdAt);
    
    const deadline = new Date(baseDate.getTime() + (slaHours * 60 * 60 * 1000));
    const timeRemaining = deadline.getTime() - currentTime.getTime();
    const isOverdue = timeRemaining < 0;

    // Calculate urgency level based on time remaining
    let urgencyLevel: SLAInfo['urgencyLevel'] = 'low';
    const hoursRemaining = Math.abs(timeRemaining) / (1000 * 60 * 60);
    
    if (isOverdue) {
      urgencyLevel = 'critical';
    } else if (hoursRemaining <= 1) {
      urgencyLevel = 'critical';
    } else if (hoursRemaining <= 2) {
      urgencyLevel = 'high';
    } else if (hoursRemaining <= 4) {
      urgencyLevel = 'medium';
    }

    return {
      deadline,
      timeRemaining,
      isOverdue,
      urgencyLevel,
    };
  };

  const formatTimeRemaining = (milliseconds: number): string => {
    const totalMinutes = Math.abs(Math.floor(milliseconds / (1000 * 60)));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (days > 0) {
      return `${days}d ${remainingHours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getUrgencyColor = (urgencyLevel: SLAInfo['urgencyLevel'], isOverdue: boolean) => {
    if (isOverdue) {
      return '#f44336'; // Red for overdue
    }
    
    switch (urgencyLevel) {
      case 'critical':
        return '#f44336'; // Red
      case 'high':
        return '#ff9800'; // Orange
      case 'medium':
        return '#ffc107'; // Amber
      case 'low':
        return '#4caf50'; // Green
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getUrgencyIcon = (urgencyLevel: SLAInfo['urgencyLevel'], isOverdue: boolean) => {
    if (isOverdue) {
      return 'error';
    }
    
    switch (urgencyLevel) {
      case 'critical':
        return 'warning';
      case 'high':
        return 'schedule';
      case 'medium':
        return 'access-time';
      case 'low':
        return 'check-circle';
      default:
        return 'schedule';
    }
  };

  const slaInfo = calculateSLA();

  if (!slaInfo) {
    return null; // Don't show timer for completed work orders
  }

  const urgencyColor = getUrgencyColor(slaInfo.urgencyLevel, slaInfo.isOverdue);
  const urgencyIcon = getUrgencyIcon(slaInfo.urgencyLevel, slaInfo.isOverdue);
  const timeText = formatTimeRemaining(slaInfo.timeRemaining);

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <Icon name={urgencyIcon} size={16} color={urgencyColor} />
        <Text 
          variant="bodySmall" 
          style={[styles.compactText, {color: urgencyColor}]}>
          {slaInfo.isOverdue ? `+${timeText}` : timeText}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style, {borderColor: urgencyColor}]}>
      <View style={styles.header}>
        <Icon name={urgencyIcon} size={20} color={urgencyColor} />
        <Text variant="titleSmall" style={[styles.title, {color: urgencyColor}]}>
          SLA {slaInfo.isOverdue ? 'Overdue' : 'Deadline'}
        </Text>
      </View>
      
      <View style={styles.timeContainer}>
        <Text variant="headlineSmall" style={[styles.timeText, {color: urgencyColor}]}>
          {slaInfo.isOverdue ? '+' : ''}{timeText}
        </Text>
        <Text variant="bodySmall" style={styles.deadlineText}>
          Due: {slaInfo.deadline.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      {slaInfo.isOverdue && (
        <View style={styles.overdueIndicator}>
          <Text variant="bodySmall" style={[styles.overdueText, {color: urgencyColor}]}>
            This work order is overdue
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeText: {
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  deadlineText: {
    marginTop: 4,
    opacity: 0.7,
  },
  overdueIndicator: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(244, 67, 54, 0.3)',
  },
  overdueText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactText: {
    marginLeft: 4,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
});