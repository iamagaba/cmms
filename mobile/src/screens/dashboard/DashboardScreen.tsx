import React, { useState, useCallback } from 'react';
import { StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { Title, Paragraph } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { ScreenWrapper } from '@/components/common';
import { DashboardStats, QuickActions, RecentWorkOrders } from '@/components/dashboard';
import { MobileWorkOrder } from '@/types';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // The individual components will handle their own refresh logic
    // This is just for the pull-to-refresh UI state
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleWorkOrderPress = (workOrder: MobileWorkOrder) => {
    navigation.navigate('WorkOrders' as never, {
      screen: 'WorkOrderDetails',
      params: { workOrderId: workOrder.id },
    } as never);
  };

  const handleQRScan = () => {
    navigation.navigate('Assets' as never, {
      screen: 'QRScanner',
      params: { type: 'asset' },
    } as never);
  };

  const handleNewWorkOrder = () => {
    navigation.navigate('WorkOrders' as never, {
      screen: 'WorkOrderCreate',
    } as never);
  };

  const handleViewMap = () => {
    navigation.navigate('MapView' as never);
  };

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Title style={styles.welcomeTitle}>Welcome back!</Title>
        <Paragraph style={styles.subtitle}>
          Here's your work summary for today
        </Paragraph>

        <DashboardStats refreshing={refreshing} onRefresh={onRefresh} />

        <QuickActions
          onQRScan={handleQRScan}
          onNewWorkOrder={handleNewWorkOrder}
          onViewMap={handleViewMap}
        />

        <RecentWorkOrders
          limit={3}
          onWorkOrderPress={handleWorkOrderPress}
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 24,
  },
});