import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import NotificationHandler, { NotificationData, NotificationType } from '../services/notificationHandler';

export interface NotificationHandlerState {
  notifications: NotificationData[];
  unreadCount: number;
  badgeCount: number;
  isLoading: boolean;
  error: string | null;
}

export const useNotificationHandler = (navigationRef?: any) => {
  const [state, setState] = useState<NotificationHandlerState>({
    notifications: [],
    unreadCount: 0,
    badgeCount: 0,
    isLoading: true,
    error: null,
  });

  const notificationHandler = NotificationHandler.getInstance();

  /**
   * Load stored notifications and counts
   */
  const loadNotifications = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const [notifications, unreadCount, badgeCount] = await Promise.all([
        notificationHandler.getStoredNotifications(),
        notificationHandler.getUnreadCount(),
        notificationHandler.getBadgeCount(),
      ]);

      setState({
        notifications,
        unreadCount,
        badgeCount,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load notifications';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [notificationHandler]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (timestamp: number) => {
    try {
      await notificationHandler.markNotificationAsRead(timestamp);
      await loadNotifications(); // Refresh state
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [notificationHandler, loadNotifications]);

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(async () => {
    try {
      await notificationHandler.clearAllNotifications();
      setState({
        notifications: [],
        unreadCount: 0,
        badgeCount: 0,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, [notificationHandler]);

  /**
   * Handle notification tap
   */
  const handleNotificationTap = useCallback(async (notificationData: NotificationData) => {
    try {
      await notificationHandler.handleNotificationTap(notificationData);
      await loadNotifications(); // Refresh badge count
    } catch (error) {
      console.error('Error handling notification tap:', error);
    }
  }, [notificationHandler, loadNotifications]);

  /**
   * Process foreground notification
   */
  const processForegroundNotification = useCallback(async (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ) => {
    try {
      await notificationHandler.processNotification(remoteMessage, false);
      await loadNotifications(); // Refresh state
    } catch (error) {
      console.error('Error processing foreground notification:', error);
    }
  }, [notificationHandler, loadNotifications]);

  /**
   * Get notification categories for UI styling
   */
  const getNotificationCategories = useCallback(() => {
    return notificationHandler.getNotificationCategories();
  }, [notificationHandler]);

  /**
   * Set up notification handlers
   */
  useEffect(() => {
    // Set navigation reference
    if (navigationRef) {
      notificationHandler.setNavigationRef(navigationRef);
    }

    // Handle foreground messages
    const unsubscribeForeground = messaging().onMessage(processForegroundNotification);

    // Handle notification opened app (from background)
    const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp(
      async (remoteMessage) => {
        if (remoteMessage) {
          console.log('Notification caused app to open from background state:', remoteMessage);
          await notificationHandler.processNotification(remoteMessage, false);
          await loadNotifications();
        }
      }
    );

    // Check whether an initial notification is available (app opened from quit state)
    messaging()
      .getInitialNotification()
      .then(async (remoteMessage) => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage);
          await notificationHandler.processNotification(remoteMessage, false);
          await loadNotifications();
        }
      });

    return () => {
      unsubscribeForeground();
      unsubscribeNotificationOpened();
    };
  }, [navigationRef, notificationHandler, processForegroundNotification, loadNotifications]);

  /**
   * Handle app state changes
   */
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App became active, process any queued notifications
        const queuedNotifications = notificationHandler.processQueuedNotifications();
        if (queuedNotifications.length > 0) {
          console.log('Processing queued notifications:', queuedNotifications.length);
          await loadNotifications();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [notificationHandler, loadNotifications]);

  /**
   * Load initial data
   */
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    ...state,
    loadNotifications,
    markAsRead,
    clearAll,
    handleNotificationTap,
    getNotificationCategories,
    processForegroundNotification,
  };
};