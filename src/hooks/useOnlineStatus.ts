import { useState, useEffect } from 'react';

interface OnlineStatusState {
  isOnline: boolean;
  isInitialized: boolean;
}

/**
 * Hook to monitor online/offline status
 * Tracks network connectivity and provides real-time updates
 */
export function useOnlineStatus(): OnlineStatusState {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);
    setIsInitialized(true);

    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Add event listeners for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isInitialized,
  };
}