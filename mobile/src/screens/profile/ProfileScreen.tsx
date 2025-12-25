import React from 'react';
import {Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {ScreenWrapper} from '@/components/common';
import {TechnicianProfile} from '@/components/profile/TechnicianProfile';
import {Permission} from '@/services/permissions';
import {ProtectedRoute} from '@/components/auth/ProtectedRoute';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleEditProfile = () => {
    navigation.navigate('ProfileEdit' as any);
  };

  const handleViewPerformance = () => {
    // TODO: Navigate to performance screen (will be implemented in future tasks)
    Alert.alert(
      'Performance Metrics',
      'Performance metrics will be available in a future update.',
      [{text: 'OK'}]
    );
  };

  const handleOpenSettings = () => {
    navigation.navigate('Settings' as any);
  };

  return (
    <ScreenWrapper>
      <ProtectedRoute requiredPermissions={[Permission.VIEW_PROFILE]}>
        <TechnicianProfile
          onEditProfile={handleEditProfile}
          onViewPerformance={handleViewPerformance}
          onOpenSettings={handleOpenSettings}
        />
      </ProtectedRoute>
    </ScreenWrapper>
  );
};