import React, {useEffect} from 'react';
import {View, PanResponder} from 'react-native';
import {useAuth} from '@/hooks/useAuth';

interface ActivityTrackerProps {
  children: React.ReactNode;
}

/**
 * Component that tracks user activity and updates session management
 * Wraps the app content and listens for touch events
 */
export const ActivityTracker: React.FC<ActivityTrackerProps> = ({children}) => {
  const {updateActivity, isAuthenticated} = useAuth();

  // Create pan responder to capture touch events
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => {
      if (isAuthenticated) {
        updateActivity();
      }
      return false; // Don't capture the touch, let it pass through
    },
    onMoveShouldSetPanResponder: () => false,
    onPanResponderGrant: () => {
      if (isAuthenticated) {
        updateActivity();
      }
    },
  });

  // Also track other types of activity
  useEffect(() => {
    if (!isAuthenticated) return;

    // Update activity when component mounts (screen changes, etc.)
    updateActivity();
  }, [isAuthenticated, updateActivity]);

  return (
    <View style={{flex: 1}} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};