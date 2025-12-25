import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {DashboardScreen} from '@/screens/dashboard/DashboardScreen';
import {MapViewScreen} from '@/screens/dashboard/MapViewScreen';
import {WorkOrdersScreen, WorkOrderDetailsScreen, WorkOrderCreateScreen} from '@/screens/workorders';
import {AssetsScreen, AssetDetailsScreen, QRScannerScreen} from '@/screens/assets';
import {ProfileScreen} from '@/screens/profile/ProfileScreen';
import {ProfileEditScreen} from '@/screens/profile/ProfileEditScreen';
import {SettingsScreen} from '@/screens/profile/SettingsScreen';
import {withPermissions} from '@/components/auth/withPermissions';
import {Permission} from '@/services/permissions';
import {theme} from '@/theme/theme';

// Stack navigators for each tab
type DashboardStackParams = {
  DashboardHome: undefined;
  MapView: undefined;
};

type WorkOrdersStackParams = {
  WorkOrdersList: undefined;
  WorkOrderDetails: {workOrderId: string};
  WorkOrderCreate: {assetId?: string};
};

type AssetsStackParams = {
  AssetsList: undefined;
  AssetDetails: {assetId: string};
  QRScanner: {type: 'asset' | 'part'};
};

type ProfileStackParams = {
  ProfileHome: undefined;
  ProfileEdit: undefined;
  Settings: undefined;
  Performance: undefined;
};

type MainTabParams = {
  Dashboard: undefined;
  WorkOrders: undefined;
  Assets: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParams>();
const DashboardStack = createNativeStackNavigator<DashboardStackParams>();
const WorkOrdersStack = createNativeStackNavigator<WorkOrdersStackParams>();
const AssetsStack = createNativeStackNavigator<AssetsStackParams>();
const ProfileStack = createNativeStackNavigator<ProfileStackParams>();

// Protected screen components
const ProtectedDashboardScreen = withPermissions(DashboardScreen, {
  requiredPermissions: [Permission.VIEW_WORK_ORDERS],
});

const ProtectedWorkOrdersScreen = withPermissions(WorkOrdersScreen, {
  requiredPermissions: [Permission.VIEW_WORK_ORDERS],
});

const ProtectedAssetsScreen = withPermissions(AssetsScreen, {
  requiredPermissions: [Permission.VIEW_ASSETS],
});

// Stack Navigators for each tab
const DashboardStackNavigator: React.FC = () => (
  <DashboardStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.surface,
      },
      headerTintColor: theme.colors.onSurface,
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}>
    <DashboardStack.Screen
      name="DashboardHome"
      component={ProtectedDashboardScreen}
      options={{title: 'Dashboard'}}
    />
    <DashboardStack.Screen
      name="MapView"
      component={MapViewScreen}
      options={{title: 'Map View'}}
    />
  </DashboardStack.Navigator>
);

const WorkOrdersStackNavigator: React.FC = () => (
  <WorkOrdersStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.surface,
      },
      headerTintColor: theme.colors.onSurface,
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}>
    <WorkOrdersStack.Screen
      name="WorkOrdersList"
      component={ProtectedWorkOrdersScreen}
      options={{title: 'Work Orders'}}
    />
    <WorkOrdersStack.Screen
      name="WorkOrderDetails"
      component={WorkOrderDetailsScreen}
      options={{title: 'Work Order Details'}}
    />
    <WorkOrdersStack.Screen
      name="WorkOrderCreate"
      component={WorkOrderCreateScreen}
      options={{title: 'Create Work Order'}}
    />
  </WorkOrdersStack.Navigator>
);

const AssetsStackNavigator: React.FC = () => (
  <AssetsStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.surface,
      },
      headerTintColor: theme.colors.onSurface,
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}>
    <AssetsStack.Screen
      name="AssetsList"
      component={ProtectedAssetsScreen}
      options={{title: 'Assets'}}
    />
    <AssetsStack.Screen
      name="AssetDetails"
      component={AssetDetailsScreen}
      options={{title: 'Asset Details'}}
    />
    <AssetsStack.Screen
      name="QRScanner"
      component={QRScannerScreen}
      options={{title: 'QR Scanner'}}
    />
  </AssetsStack.Navigator>
);

const ProfileStackNavigator: React.FC = () => (
  <ProfileStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.surface,
      },
      headerTintColor: theme.colors.onSurface,
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}>
    <ProfileStack.Screen
      name="ProfileHome"
      component={ProfileScreen}
      options={{title: 'Profile'}}
    />
    <ProfileStack.Screen
      name="ProfileEdit"
      component={ProfileEditScreen}
      options={{title: 'Edit Profile'}}
    />
    <ProfileStack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{title: 'Settings'}}
    />
    {/* Performance screen will be added in future tasks */}
  </ProfileStack.Navigator>
);

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({color, size}) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'WorkOrders':
              iconName = 'assignment';
              break;
            case 'Assets':
              iconName = 'build';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerShown: false, // Hide tab navigator headers since stacks have their own
      })}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardStackNavigator}
        options={{title: 'Dashboard'}}
      />
      <Tab.Screen
        name="WorkOrders"
        component={WorkOrdersStackNavigator}
        options={{title: 'Work Orders'}}
      />
      <Tab.Screen
        name="Assets"
        component={AssetsStackNavigator}
        options={{title: 'Assets'}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{title: 'Profile'}}
      />
    </Tab.Navigator>
  );
};