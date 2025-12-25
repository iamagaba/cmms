import React from 'react';
import {StatusBar, Linking} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {PaperProvider} from 'react-native-paper';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {ErrorBoundary} from '@/components/common/ErrorBoundary';
import {AuthProvider} from '@/context/AuthContext';
import {NotificationProvider} from '@/context/NotificationContext';
import {AppNavigator} from '@/navigation/AppNavigator';
import {theme} from '@/theme/theme';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

// Navigation persistence key
const PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';

// Deep linking configuration
const linking = {
  prefixes: ['technician://', 'https://technician.app'],
  config: {
    screens: {
      Main: {
        screens: {
          Dashboard: {
            screens: {
              DashboardHome: 'dashboard',
            },
          },
          WorkOrders: {
            screens: {
              WorkOrdersList: 'work-orders',
              WorkOrderDetails: 'work-orders/:workOrderId',
            },
          },
          Assets: {
            screens: {
              AssetsList: 'assets',
              AssetDetails: 'assets/:assetId',
              QRScanner: 'scanner/:type',
            },
          },
          Profile: {
            screens: {
              ProfileHome: 'profile',
              Settings: 'profile/settings',
              Performance: 'profile/performance',
            },
          },
        },
      },
      Auth: {
        screens: {
          Login: 'login',
          BiometricSetup: 'biometric-setup',
        },
      },
    },
  },
};

const App: React.FC = () => {
  const [isReady, setIsReady] = React.useState(false);
  const [initialState, setInitialState] = React.useState();

  React.useEffect(() => {
    const restoreState = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();

        if (initialUrl == null) {
          // Only restore state if there's no deep link
          const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
          const state = savedStateString ? JSON.parse(savedStateString) : undefined;

          if (state !== undefined) {
            setInitialState(state);
          }
        }
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady) {
      restoreState();
    }
  }, [isReady]);

  const onStateChange = (state: any) => {
    AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
  };

  if (!isReady) {
    return null; // You can return a loading screen here
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <PaperProvider theme={theme}>
              <AuthProvider>
                <NotificationProvider>
                  <NavigationContainer
                    linking={linking}
                    initialState={initialState}
                    onStateChange={onStateChange}>
                    <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                    <AppNavigator />
                  </NavigationContainer>
                </NotificationProvider>
              </AuthProvider>
            </PaperProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

export default App;