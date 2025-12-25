import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {useAuth} from '@/hooks/useAuth';
import {usePermissions} from '@/hooks/usePermissions';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import {ActivityTracker} from '@/components/auth/ActivityTracker';
import {ProtectedRoute} from '@/components/auth/ProtectedRoute';
import {AuthNavigator} from './AuthNavigator';
import {MainNavigator} from './MainNavigator';
import {NavigationParams} from '@/types';

const Stack = createNativeStackNavigator<NavigationParams>();

export const AppNavigator: React.FC = () => {
  const {isAuthenticated, isLoading} = useAuth();
  const permissions = usePermissions();

  if (isLoading) {
    return <LoadingSpinner message="Initializing app..." />;
  }

  return (
    <ActivityTracker>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {isAuthenticated ? (
          <Stack.Screen 
            name="Main" 
            component={() => (
              <ProtectedRoute>
                <MainNavigator />
              </ProtectedRoute>
            )} 
          />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </ActivityTracker>
  );
};