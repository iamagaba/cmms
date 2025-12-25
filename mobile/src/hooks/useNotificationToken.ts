import { useState, useEffect, useCallback } from 'react';
import FirebaseService, { NotificationToken } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export interface NotificationTokenState {
  token: string | null;
  isRegistered: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useNotificationToken = () => {
  const [state, setState] = useState<NotificationTokenState>({
    token: null,
    isRegistered: false,
    isLoading: true,
    error: null,
  });

  const { user } = useAuth();
  const firebaseService = FirebaseService.getInstance();

  /**
   * Get current FCM token
   */
  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const token = await firebaseService.getFCMToken();
      
      setState(prev => ({
        ...prev,
        token,
        isLoading: false,
        error: token ? null : 'Failed to get notification token',
      }));
      
      return token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get notification token';
      setState(prev => ({
        ...prev,
        token: null,
        isLoading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, [firebaseService]);

  /**
   * Register token with server
   */
  const registerToken = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      setState(prev => ({
        ...prev,
        error: 'User not authenticated',
        isLoading: false,
      }));
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const success = await firebaseService.registerTokenWithServer(user.id);
      
      setState(prev => ({
        ...prev,
        isRegistered: success,
        isLoading: false,
        error: success ? null : 'Failed to register notification token',
      }));
      
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register notification token';
      setState(prev => ({
        ...prev,
        isRegistered: false,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [user?.id, firebaseService]);

  /**
   * Unregister token from server
   */
  const unregisterToken = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const success = await firebaseService.unregisterTokenFromServer();
      
      setState(prev => ({
        ...prev,
        isRegistered: !success,
        isLoading: false,
        error: success ? null : 'Failed to unregister notification token',
      }));
      
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unregister notification token';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [firebaseService]);

  /**
   * Refresh token and re-register with server
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Clear current token data
      await firebaseService.clearTokenData();
      
      // Get new token
      const newToken = await firebaseService.getFCMToken();
      
      if (newToken && user?.id) {
        // Register new token with server
        const registered = await firebaseService.registerTokenWithServer(user.id);
        
        setState({
          token: newToken,
          isRegistered: registered,
          isLoading: false,
          error: registered ? null : 'Failed to register new token',
        });
        
        return registered;
      } else {
        setState(prev => ({
          ...prev,
          token: null,
          isRegistered: false,
          isLoading: false,
          error: 'Failed to get new token',
        }));
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh notification token';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [user?.id, firebaseService]);

  /**
   * Get stored token information
   */
  const getStoredTokenInfo = useCallback(async (): Promise<NotificationToken | null> => {
    try {
      return await firebaseService.getStoredToken();
    } catch (error) {
      console.error('Failed to get stored token info:', error);
      return null;
    }
  }, [firebaseService]);

  /**
   * Initialize token management when user changes
   */
  useEffect(() => {
    const initializeToken = async () => {
      if (!user?.id) {
        setState({
          token: null,
          isRegistered: false,
          isLoading: false,
          error: null,
        });
        return;
      }

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Get current token
        const token = await firebaseService.getCurrentToken() || await firebaseService.getFCMToken();
        
        if (token) {
          // Check if token is already registered
          const storedInfo = await firebaseService.getStoredToken();
          const isRegistered = storedInfo !== null;
          
          setState({
            token,
            isRegistered,
            isLoading: false,
            error: null,
          });
          
          // Auto-register if not already registered
          if (!isRegistered) {
            await registerToken();
          }
        } else {
          setState({
            token: null,
            isRegistered: false,
            isLoading: false,
            error: 'No notification token available',
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize notification token';
        setState({
          token: null,
          isRegistered: false,
          isLoading: false,
          error: errorMessage,
        });
      }
    };

    initializeToken();
  }, [user?.id, firebaseService, registerToken]);

  /**
   * Clean up token when user logs out
   */
  useEffect(() => {
    if (!user?.id && state.isRegistered) {
      unregisterToken();
    }
  }, [user?.id, state.isRegistered, unregisterToken]);

  return {
    ...state,
    getToken,
    registerToken,
    unregisterToken,
    refreshToken,
    getStoredTokenInfo,
  };
};