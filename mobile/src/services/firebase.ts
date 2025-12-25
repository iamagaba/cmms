import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationToken {
  token: string;
  timestamp: number;
  deviceId: string;
}

class FirebaseService {
  private static instance: FirebaseService;
  private fcmToken: string | null = null;
  private isInitialized = false;

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  /**
   * Initialize Firebase messaging service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Request permission for notifications
      await this.requestNotificationPermission();
      
      // Get FCM token
      await this.getFCMToken();
      
      // Set up message handlers
      this.setupMessageHandlers();
      
      this.isInitialized = true;
      console.log('Firebase messaging initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase messaging:', error);
      throw error;
    }
  }

  /**
   * Request notification permissions
   */
  async requestNotificationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        // For Android 13+ (API level 33+), request POST_NOTIFICATIONS permission
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Permission',
              message: 'This app needs notification permission to keep you updated about work orders and important updates.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Notification permission denied');
            return false;
          }
        }
      }

      // Request Firebase messaging permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('Notification permission not granted');
        return false;
      }

      console.log('Notification permission granted');
      return true;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Get FCM token for this device
   */
  async getFCMToken(): Promise<string | null> {
    try {
      if (this.fcmToken) {
        return this.fcmToken;
      }

      const token = await messaging().getToken();
      if (token) {
        this.fcmToken = token;
        await this.saveTokenToStorage(token);
        console.log('FCM Token obtained:', token);
        return token;
      }
      
      console.log('No FCM token available');
      return null;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Save token to local storage
   */
  private async saveTokenToStorage(token: string): Promise<void> {
    try {
      const tokenData: NotificationToken = {
        token,
        timestamp: Date.now(),
        deviceId: await this.getDeviceId(),
      };
      
      await AsyncStorage.setItem('fcm_token', JSON.stringify(tokenData));
    } catch (error) {
      console.error('Error saving token to storage:', error);
    }
  }

  /**
   * Get stored token from local storage
   */
  async getStoredToken(): Promise<NotificationToken | null> {
    try {
      const tokenData = await AsyncStorage.getItem('fcm_token');
      if (tokenData) {
        return JSON.parse(tokenData);
      }
      return null;
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  /**
   * Register token with server
   */
  async registerTokenWithServer(userId: string): Promise<boolean> {
    try {
      const token = await this.getFCMToken();
      if (!token) {
        console.log('No FCM token available for registration');
        return false;
      }

      // TODO: Implement server registration
      // This would typically make an API call to register the token with the backend
      console.log('Registering token with server for user:', userId);
      
      // For now, just store the registration locally
      await AsyncStorage.setItem('token_registered', JSON.stringify({
        userId,
        token,
        registeredAt: Date.now(),
      }));

      return true;
    } catch (error) {
      console.error('Error registering token with server:', error);
      return false;
    }
  }

  /**
   * Unregister token from server
   */
  async unregisterTokenFromServer(): Promise<boolean> {
    try {
      // TODO: Implement server unregistration
      console.log('Unregistering token from server');
      
      await AsyncStorage.removeItem('token_registered');
      return true;
    } catch (error) {
      console.error('Error unregistering token from server:', error);
      return false;
    }
  }

  /**
   * Setup message handlers for different app states
   */
  private setupMessageHandlers(): void {
    // Handle messages when app is in background
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Message handled in the background!', remoteMessage);
      // Import NotificationHandler dynamically to avoid circular dependencies
      const { default: NotificationHandler } = await import('./notificationHandler');
      const handler = NotificationHandler.getInstance();
      await handler.processNotification(remoteMessage, true);
    });

    // Listen to token refresh
    messaging().onTokenRefresh((token) => {
      console.log('FCM token refreshed:', token);
      this.fcmToken = token;
      this.saveTokenToStorage(token);
      // TODO: Update token on server
    });
  }

  /**
   * Get device ID for token management
   */
  private async getDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem('device_id');
      if (!deviceId) {
        // Generate a simple device ID based on timestamp and random number
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('device_id', deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      return `device_${Date.now()}`;
    }
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const authStatus = await messaging().hasPermission();
      return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
             authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    } catch (error) {
      console.error('Error checking notification status:', error);
      return false;
    }
  }

  /**
   * Get current FCM token
   */
  getCurrentToken(): string | null {
    return this.fcmToken;
  }

  /**
   * Clear stored token data
   */
  async clearTokenData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['fcm_token', 'token_registered', 'device_id']);
      this.fcmToken = null;
      console.log('Token data cleared');
    } catch (error) {
      console.error('Error clearing token data:', error);
    }
  }
}

export default FirebaseService;