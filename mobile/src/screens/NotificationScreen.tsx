import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NotificationList } from '../components/notifications/NotificationList';
import { NotificationData } from '../services/notificationHandler';

export const NotificationScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleNotificationPress = (notification: NotificationData) => {
    // Navigation is handled by the NotificationList component
    // This is just for any additional custom handling if needed
    console.log('Notification pressed in screen:', notification);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Notifications" />
      </Appbar.Header>
      
      <View style={styles.content}>
        <NotificationList
          onNotificationPress={handleNotificationPress}
          showClearAll={true}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
});

export default NotificationScreen;