import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Card, Badge, IconButton } from 'react-native-paper';
import { NotificationData, NotificationType } from '../../services/notificationHandler';
import { useNotificationHandler } from '../../hooks/useNotificationHandler';

export interface NotificationListProps {
  onNotificationPress?: (notification: NotificationData) => void;
  showClearAll?: boolean;
  maxItems?: number;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  onNotificationPress,
  showClearAll = true,
  maxItems,
}) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    loadNotifications,
    markAsRead,
    clearAll,
    handleNotificationTap,
    getNotificationCategories,
  } = useNotificationHandler();

  const categories = getNotificationCategories();
  const displayNotifications = maxItems ? notifications.slice(0, maxItems) : notifications;

  const handleNotificationPress = async (notification: NotificationData) => {
    // Mark as read if unread
    if (!notification.isRead) {
      await markAsRead(notification.timestamp);
    }

    // Handle navigation
    await handleNotificationTap(notification);

    // Call custom handler if provided
    onNotificationPress?.(notification);
  };

  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  const getNotificationIcon = (type: NotificationType): string => {
    const category = categories[type];
    return category?.icon || 'notifications';
  };

  const getNotificationColor = (type: NotificationType): string => {
    const category = categories[type];
    return category?.color || '#757575';
  };

  const getPriorityBadgeColor = (priority: string): string => {
    switch (priority) {
      case 'emergency': return '#D32F2F';
      case 'high': return '#F57C00';
      case 'medium': return '#1976D2';
      case 'low': return '#388E3C';
      default: return '#757575';
    }
  };

  const renderNotificationItem = ({ item }: { item: NotificationData }) => {
    const isUnread = !item.isRead;
    const iconColor = getNotificationColor(item.type);
    const priorityColor = getPriorityBadgeColor(item.priority || 'medium');

    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        style={[styles.notificationItem, isUnread && styles.unreadItem]}
      >
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <View style={[styles.iconBackground, { backgroundColor: iconColor + '20' }]}>
                <IconButton
                  icon={getNotificationIcon(item.type)}
                  size={20}
                  iconColor={iconColor}
                />
              </View>
              {isUnread && <View style={styles.unreadDot} />}
            </View>

            <View style={styles.contentContainer}>
              <View style={styles.headerRow}>
                <Text style={[styles.title, isUnread && styles.unreadTitle]} numberOfLines={1}>
                  {item.title}
                </Text>
                {item.priority && item.priority !== 'medium' && (
                  <Badge
                    style={[styles.priorityBadge, { backgroundColor: priorityColor }]}
                    size={16}
                  >
                    {item.priority.toUpperCase()}
                  </Badge>
                )}
              </View>

              <Text style={styles.body} numberOfLines={2}>
                {item.body}
              </Text>

              <View style={styles.footerRow}>
                <Text style={styles.timestamp}>
                  {formatTimestamp(item.timestamp)}
                </Text>
                {item.workOrderId && (
                  <Text style={styles.workOrderId}>
                    WO #{item.workOrderId}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconButton icon="notifications-none" size={48} iconColor="#BDBDBD" />
      <Text style={styles.emptyStateText}>No notifications yet</Text>
      <Text style={styles.emptyStateSubtext}>
        You'll receive notifications about work orders and important updates here
      </Text>
    </View>
  );

  const renderHeader = () => {
    if (!showClearAll || notifications.length === 0) return null;

    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Badge style={styles.unreadBadge} size={20}>
              {unreadCount}
            </Badge>
          )}
        </View>
        <TouchableOpacity onPress={clearAll} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (error) {
    return (
      <View style={styles.errorState}>
        <IconButton icon="error-outline" size={48} iconColor="#F44336" />
        <Text style={styles.errorText}>Failed to load notifications</Text>
        <TouchableOpacity onPress={loadNotifications} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={displayNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.timestamp.toString()}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadNotifications}
            colors={['#2196F3']}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          displayNotifications.length === 0 && styles.emptyListContent,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#F44336',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationItem: {
    marginBottom: 12,
  },
  unreadItem: {
    // Additional styling for unread items if needed
  },
  card: {
    elevation: 2,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  iconBackground: {
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  priorityBadge: {
    alignSelf: 'flex-start',
  },
  body: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  workOrderId: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#757575',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default NotificationList;