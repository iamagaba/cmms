import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {LoginScreen} from '@/screens/auth/LoginScreen';
import {BiometricSetupScreen} from '@/screens/auth/BiometricSetupScreen';

type AuthStackParams = {
  Login: undefined;
  BiometricSetup: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParams>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen 
        name="BiometricSetup" 
        component={BiometricSetupScreen}
        options={{
          headerShown: true,
          title: 'Biometric Setup',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};