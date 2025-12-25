import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationData {
  type: NotificationType;
  workOrderId?: string;
  assetId?: string;
  priority?: 'low' | 'medium' | 'high' | 'emergency';
  title: string;
  body: string;
  timestamp: number;
  actionUrl?: string;
  customData?: Record<string, any>;
}

export enum NotificationType {
  WORK_ORDER_ASSIGNED = 'work_order_assigned',
  WORK_ORDER_UPDATED = 'work_order_updated',
  WORK_ORDER_CANCELLED = 'work_order_cancelled',
  WORK_ORDER_PRIORITY_CHANGED = 'work_order_priority_changed',
  EMERGENCY_WORK_ORDER = 'emergency_work_order',
  SCHEDULE_CHANGE = 'schedule_change',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  GENERAL_ANNOUNCEMENT = 'general_announcement',
}

export interface NotificationAction {
  type: 'navigate' | 'external_link' | 'custom';
  target: string;
  params?: Record<string, any>;
}

class NotificationHandler {
  private static instance: NotificationHandler;
  private navigationRef: any = null;
  private notificationQueue: NotificationData[] = [];
  private badgeCount = 0;

  static getInstance(): NotificationHandler {
    if (!NotificationHandler.instance) {
      NotificationHandler.instance = new NotificationHandler();
    }
    return NotificationHandler.instance;
  }

  /**
   * Set navigation reference for deep linking
   */
  setNavigationRef(ref: any): void {
    this.navigationRef = ref;
  }

  /**
   * Process incoming notification message
   */
  async processNotification(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
    isBackground = false
  ): Promise<void> {
    try {
      const notificationData = this.parseNotificationData(remoteMessage);
      
      console.log('Processing notification:', notificationData);

      // Store notification for history
      await this.storeNotification(notificationData);

      // Update badge count
      await this.updateBadgeCount(1);

      if (isBackground) {
        // Handle background notification
        await this.handleBackgroundNotification(notificationData);
      } else {
        // Handle foreground notification
        await this.handleForegroundNotification(notificationData);
      }

      // Queue notification for processing when app becomes active
      this.notificationQueue.push(notificationData);
    } catch (error) {
      console.error('Error processing notification:', error);
    }
  }

  /**
   * Parse Firebase remote message into structured notification data
   */
  private parseNotificationData(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): NotificationData {
    const { notification, data } = remoteMessage;
    
    return {
      type: (data?.type as NotificationType) || NotificationType.GENERAL_ANNOUNCEMENT,
      workOrderId: data?.workOrderId,
      assetId: data?.assetId,
      priority: (data?.priority as any) || 'medium',
      title: notification?.title || 'Notification',
      body: notification?.body || '',
      timestamp: Date.now(),
      actionUrl: data?.actionUrl,
      customData: data ? { ...data } : {},
    };
  }

  /**
   * Handle notification when app is in foreground
   */
  private async handleForegroundNotification(notificationData: NotificationData): Promise<void> {
    // For foreground notifications, we can show in-app notifications
    // This would typically integrate with a toast/banner component
    console.log('Foreground notification:', notificationData);
    
    // You can implement custom in-app notification display here
    // For now, we'll just log it
  }

  /**
   * Handle notification when app is in background
   */
  private async handleBackgroundNotification(notificationData: NotificationData): Promise<void> {
    console.log('Background notification:', notificationData);
    
    // Background notifications are handled by the system
    // We can perform data sync or other background tasks here
    
    // Example: Pre-fetch work order data if it's a work order notification
    if (notificationData.workOrderId && 
        [NotificationType.WORK_ORDER_ASSIGNED, NotificationType.WORK_ORDER_UPDATED].includes(notificationData.type)) {
      // TODO: Pre-fetch work order data for faster loading when user opens app
      console.log('Pre-fetching work order data:', notificationData.workOrderId);
    }
  }

  /**
   * Handle notification tap (when user taps on notification)
   */
  async handleNotificationTap(notificationData: NotificationData): Promise<void> {
    try {
      console.log('Notification tapped:', notificationData);

      // Clear this notification from badge count
      await this.updateBadgeCount(-1);

      // Determine navigation action based on notification type
      const action = this.getNavigationAction(notificationData);
      
      if (action) {
        await this.executeNavigationAction(action);
      }
    } catch (error) {
      console.error('Error handling notification tap:', error);
    }
  }

  /**
   * Get navigation action for notification type
   */
  private getNavigationAction(notificationData: NotificationData): NotificationAction | null {
    switch (notificationData.type) {
      case NotificationType.WORK_ORDER_ASSIGNED:
      case NotificationType.WORK_ORDER_UPDATED:
      case NotificationType.EMERGENCY_WORK_ORDER:
        if (notificationData.workOrderId) {
          return {
            type: 'navigate',
            target: 'WorkOrderDetails',
            params: { workOrderId: notificationData.workOrderId },
          };
        }
        return {
          type: 'navigate',
          target: 'WorkOrdersList',
        };

      case NotificationType.WORK_ORDER_PRIORITY_CHANGED:
        if (notificationData.workOrderId) {
          return {
            type: 'navigate',
            target: 'WorkOrderDetails',
            params: { workOrderId: notificationData.workOrderId },
          };
        }
        break;

      case NotificationType.SCHEDULE_CHANGE:
        return {
          type: 'navigate',
          target: 'Dashboard',
        };

      case NotificationType.SYSTEM_MAINTENANCE:
      case NotificationType.GENERAL_ANNOUNCEMENT:
        return {
          type: 'navigate',
          target: 'Dashboard',
        };

      default:
        return {
          type: 'navigate',
          target: 'Dashboard',
        };
    }

    return null;
  }

  /**
   * Execute navigation action
   */
  private async executeNavigationAction(action: NotificationAction): Promise<void> {
    if (!this.navigationRef) {
      console.warn('Navigation ref not set, cannot navigate');
      return;
    }

    switch (action.type) {
      case 'navigate':
        this.navigationRef.navigate(action.target, action.params);
        break;

      case 'external_link':
        await Linking.openURL(action.target);
        break;

      case 'custom':
        // Handle custom actions
        console.log('Custom action:', action);
        break;

      default:
        console.warn('Unknown navigation action type:', action.type);
    }
  }

  /**
   * Store notification in local storage for history
   */
  private async storeNotification(notificationData: NotificationData): Promise<void> {
    try {
      const existingNotifications = await this.getStoredNotifications();
      const updatedNotifications = [notificationData, ...existingNotifications];
      
      // Keep only last 50 notifications
      const trimmedNotifications = updatedNotifications.slice(0, 50);
      
      await AsyncStorage.setItem('stored_notifications', JSON.stringify(trimmedNotifications));
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  /**
   * Get stored notifications from local storage
   */
  async getStoredNotifications(): Promise<NotificationData[]> {
    try {
      const stored = await AsyncStorage.getItem('stored_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored notifications:', error);
      return [];
    }
  }

  /**
   * Update notification badge count
   */
  async updateBadgeCount(delta: number): Promise<void> {
    try {
      const currentCount = await this.getBadgeCount();
      const newCount = Math.max(0, currentCount + delta);
      
      this.badgeCount = newCount;
      await AsyncStorage.setItem('notification_badge_count', newCount.toString());
      
      // TODO: Update app icon badge (requires additional native setup)
      console.log('Badge count updated:', newCount);
    } catch (error) {
      console.error('Error updating badge count:', error);
    }
  }

  /**
   * Get current badge count
   */
  async getBadgeCount(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem('notification_badge_count');
      return stored ? parseInt(stored, 10) : 0;
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  /**
   * Clear all notifications and reset badge count
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['stored_notifications', 'notification_badge_count']);
      this.badgeCount = 0;
      this.notificationQueue = [];
      console.log('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(timestamp: number): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      const updatedNotifications = notifications.map(notification => 
        notification.timestamp === timestamp 
          ? { ...notification, isRead: true }
          : notification
      );
      
      await AsyncStorage.setItem('stored_notifications', JSON.stringify(updatedNotifications));
      await this.updateBadgeCount(-1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getStoredNotifications();
      return notifications.filter(n => !n.isRead).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Process queued notifications (called when app becomes active)
   */
  processQueuedNotifications(): NotificationData[] {
    const queued = [...this.notificationQueue];
    this.notificationQueue = [];
    return queued;
  }

  /**
   * Create notification categories for different types
   */
  getNotificationCategories(): Record<NotificationType, { color: string; icon: string; priority: number }> {
    return {
      [NotificationType.WORK_ORDER_ASSIGNED]: {
        color: '#2196F3',
        icon: 'assignment',
        priority: 3,
      },
      [NotificationType.WORK_ORDER_UPDATED]: {
        color: '#FF9800',
        icon: 'update',
        priority: 2,
      },
      [NotificationType.WORK_ORDER_CANCELLED]: {
        color: '#F44336',
        icon: 'cancel',
        priority: 2,
      },
      [NotificationType.WORK_ORDER_PRIORITY_CHANGED]: {
        color: '#FF5722',
        icon: 'priority-high',
        priority: 3,
      },
      [NotificationType.EMERGENCY_WORK_ORDER]: {
        color: '#D32F2F',
        icon: 'emergency',
        priority: 5,
      },
      [NotificationType.SCHEDULE_CHANGE]: {
        color: '#9C27B0',
        icon: 'schedule',
        priority: 3,
      },
      [NotificationType.SYSTEM_MAINTENANCE]: {
        color: '#607D8B',
        icon: 'build',
        priority: 1,
      },
      [NotificationType.GENERAL_ANNOUNCEMENT]: {
        color: '#4CAF50',
        icon: 'announcement',
        priority: 1,
      },
    };
  }
}

export default NotificationHandler;