import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text, Card, useTheme} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  activity: string;
  userId: string;
  userName?: string;
  type: 'status_change' | 'note_added' | 'completion' | 'assignment' | 'other';
  details?: Record<string, any>;
}

interface ActivityLogProps {
  activities: ActivityLogEntry[];
  maxHeight?: number;
  showUserNames?: boolean;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({
  activities,
  maxHeight = 300,
  showUserNames = true,
}) => {
  const theme = useTheme();

  const getActivityIcon = (type: ActivityLogEntry['type']) => {
    switch (type) {
      case 'status_change':
        return 'swap-horiz';
      case 'note_added':
        return 'note-add';
      case 'completion':
        return 'check-circle';
      case 'assignment':
        return 'person-add';
      default:
        return 'info';
    }
  };

  const getActivityColor = (type: ActivityLogEntry['type']) => {
    switch (type) {
      case 'status_change':
        return '#2196f3';
      case 'note_added':
        return '#ff9800';
      case 'completion':
        return '#4caf50';
      case 'assignment':
        return '#9c27b0';
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours}h ago`;
    } else if (diffInHours < 168) { // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (activities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="history" size={32} color={theme.colors.onSurfaceVariant} />
        <Text variant="bodyMedium" style={styles.emptyText}>
          No activity recorded yet
        </Text>
      </View>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Icon name="history" size={20} color={theme.colors.primary} />
          <Text variant="titleMedium" style={styles.title}>
            Activity Log
          </Text>
        </View>
        
        <ScrollView 
          style={[styles.scrollView, {maxHeight}]}
          showsVerticalScrollIndicator={false}>
          {sortedActivities.map((activity, index) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityHeader}>
                <View style={styles.activityIconContainer}>
                  <Icon 
                    name={getActivityIcon(activity.type)} 
                    size={16} 
                    color={getActivityColor(activity.type)}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text variant="bodyMedium" style={styles.activityText}>
                    {activity.activity}
                  </Text>
                  <View style={styles.activityMeta}>
                    {showUserNames && activity.userName && (
                      <Text variant="bodySmall" style={styles.userName}>
                        by {activity.userName}
                      </Text>
                    )}
                    <Text variant="bodySmall" style={styles.timestamp}>
                      {formatTimestamp(activity.timestamp)}
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Show additional details if available */}
              {activity.details && Object.keys(activity.details).length > 0 && (
                <View style={styles.detailsContainer}>
                  {Object.entries(activity.details).map(([key, value]) => (
                    <Text key={key} variant="bodySmall" style={styles.detailText}>
                      {key}: {String(value)}
                    </Text>
                  ))}
                </View>
              )}
              
              {/* Add separator line except for last item */}
              {index < sortedActivities.length - 1 && (
                <View style={styles.separator} />
              )}
            </View>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  activityItem: {
    paddingVertical: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    lineHeight: 20,
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    opacity: 0.7,
    marginRight: 8,
  },
  timestamp: {
    opacity: 0.5,
  },
  detailsContainer: {
    marginTop: 8,
    marginLeft: 36,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 4,
  },
  detailText: {
    opacity: 0.7,
    lineHeight: 16,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginTop: 12,
    marginLeft: 36,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 8,
    opacity: 0.7,
  },
});