import { useState, useEffect, useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import FirebaseService from '../services/firebase';

export interface NotificationPermissionState {
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useNotificationPermissions = () => {
  const [state, setState] = useState<NotificationPermissionState>({
    hasPermission: false,
    isLoading: true,
    error: null,
  });

  const firebaseService = FirebaseService.getInstance();

  /**
   * Check current permission status
   */
  const checkPermissionStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const hasPermission = await firebaseService.areNotificationsEnabled();
      
      setState({
        hasPermission,
        isLoading: false,
        error: null,
      });
      
      return hasPermission;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check notification permissions';
      setState({
        hasPermission: false,
        isLoading: false,
        error: errorMessage,
      });
      return false;
    }
  }, [firebaseService]);

  /**
   * Request notification permissions with user-friendly explanation
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Show explanation dialog first
      const shouldRequest = await showPermissionExplanation();
      if (!shouldRequest) {
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      const granted = await firebaseService.requestNotificationPermission();
      
      setState({
        hasPermission: granted,
        isLoading: false,
        error: granted ? null : 'Notification permission was denied',
      });

      if (!granted) {
        showPermissionDeniedDialog();
      }

      return granted;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request notification permissions';
      setState({
        hasPermission: false,
        isLoading: false,
        error: errorMessage,
      });
      return false;
    }
  }, [firebaseService]);

  /**
   * Show explanation dialog before requesting permissions
   */
  const showPermissionExplanation = (): Promise<boolean> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Enable Notifications',
        'Stay updated with important work order notifications, emergency alerts, and schedule changes. This helps you provide better service to customers.',
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Enable',
            onPress: () => resolve(true),
          },
        ],
        { cancelable: false }
      );
    });
  };

  /**
   * Show dialog when permission is denied with option to go to settings
   */
  const showPermissionDeniedDialog = (): void => {
    Alert.alert(
      'Notifications Disabled',
      'You won\'t receive important work order updates. You can enable notifications in your device settings.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );
  };

  /**
   * Initialize Firebase and check permissions on mount
   */
  useEffect(() => {
    const initializeAndCheck = async () => {
      try {
        await firebaseService.initialize();
        await checkPermissionStatus();
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
        setState({
          hasPermission: false,
          isLoading: false,
          error: 'Failed to initialize notification service',
        });
      }
    };

    initializeAndCheck();
  }, [firebaseService, checkPermissionStatus]);

  return {
    ...state,
    requestPermissions,
    checkPermissionStatus,
    showPermissionExplanation,
  };
};