import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNotificationPermissions } from '../hooks/useNotificationPermissions';
import { useNotificationToken } from '../hooks/useNotificationToken';
import { useNotificationHandler } from '../hooks/useNotificationHandler';
import FirebaseService from '../services/firebase';
import NotificationHandler from '../services/notificationHandler';

export interface NotificationContextType {
  // Permission state
  hasPermission: boolean;
  isPermissionLoading: boolean;
  permissionError: string | null;
  
  // Token state
  token: string | null;
  isTokenRegistered: boolean;
  isTokenLoading: boolean;
  tokenError: string | null;
  
  // Notification handler state
  notifications: any[];
  unreadCount: number;
  badgeCount: number;
  isNotificationLoading: boolean;
  notificationError: string | null;
  
  // Actions
  requestPermissions: () => Promise<boolean>;
  registerToken: () => Promise<boolean>;
  unregisterToken: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  checkPermissionStatus: () => Promise<boolean>;
  
  // Notification actions
  loadNotifications: () => Promise<void>;
  markAsRead: (timestamp: number) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  
  // Service instances
  firebaseService: FirebaseService;
  notificationHandler: NotificationHandler;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  const {
    hasPermission,
    isLoading: isPermissionLoading,
    error: permissionError,
    requestPermissions,
    checkPermissionStatus,
  } = useNotificationPermissions();

  const {
    token,
    isRegistered: isTokenRegistered,
    isLoading: isTokenLoading,
    error: tokenError,
    registerToken,
    unregisterToken,
    refreshToken,
  } = useNotificationToken();

  const {
    notifications,
    unreadCount,
    badgeCount,
    isLoading: isNotificationLoading,
    error: notificationError,
    loadNotifications,
    markAsRead,
    clearAll: clearAllNotifications,
  } = useNotificationHandler();

  const firebaseService = FirebaseService.getInstance();
  const notificationHandler = NotificationHandler.getInstance();

  /**
   * Initialize notification service
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        await firebaseService.initialize();
        setIsInitialized(true);
        console.log('Notification service initialized');
      } catch (error) {
        console.error('Failed to initialize notification service:', error);
      }
    };

    if (!isInitialized) {
      initialize();
    }
  }, [firebaseService, isInitialized]);

  const contextValue: NotificationContextType = {
    // Permission state
    hasPermission,
    isPermissionLoading,
    permissionError,
    
    // Token state
    token,
    isTokenRegistered,
    isTokenLoading,
    tokenError,
    
    // Notification handler state
    notifications,
    unreadCount,
    badgeCount,
    isNotificationLoading,
    notificationError,
    
    // Actions
    requestPermissions,
    registerToken,
    unregisterToken,
    refreshToken,
    checkPermissionStatus,
    
    // Notification actions
    loadNotifications,
    markAsRead,
    clearAllNotifications,
    
    // Service instances
    firebaseService,
    notificationHandler,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;