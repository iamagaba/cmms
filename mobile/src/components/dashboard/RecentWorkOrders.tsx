import React from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import {Card, Title, Paragraph, ActivityIndicator} from 'react-native-paper';
import {useWorkOrders} from '@/hooks/useWorkOrders';
import {WorkOrderCard} from '@/components/workorders';
import {MobileWorkOrder} from '@/types';

interface RecentWorkOrdersProps {
  limit?: number;
  onWorkOrderPress?: (workOrder: MobileWorkOrder) => void;
}

export const RecentWorkOrders: React.FC<RecentWorkOrdersProps> = ({
  limit = 3,
  onWorkOrderPress,
}) => {
  const {
    workOrders,
    isLoading,
    error,
  } = useWorkOrders(
    {
      status: ['New', 'In Progress', 'Ready'],
    },
    {
      field: 'appointmentDate',
      direction: 'asc',
    }
  );

  const recentWorkOrders = workOrders?.slice(0, limit) || [];

  const renderWorkOrder = ({item}: {item: MobileWorkOrder}) => (
    <WorkOrderCard
      workOrder={item}
      onPress={() => onWorkOrderPress?.(item)}
      compact
    />
  );

  if (isLoading && !workOrders) {
    return (
      <Card style={styles.recentOrdersCard}>
        <Card.Content>
          <Title>Recent Work Orders</Title>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" />
            <Paragraph style={styles.loadingText}>Loading work orders...</Paragraph>
          </View>
        </Card.Content>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={styles.recentOrdersCard}>
        <Card.Content>
          <Title>Recent Work Orders</Title>
          <Paragraph style={styles.errorText}>
            Unable to load work orders. Please try again.
          </Paragraph>
        </Card.Content>
      </Card>
    );
  }

  if (recentWorkOrders.length === 0) {
    return (
      <Card style={styles.recentOrdersCard}>
        <Card.Content>
          <Title>Recent Work Orders</Title>
          <Paragraph style={styles.placeholder}>
            No active work orders assigned. Check back later or contact dispatch.
          </Paragraph>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.recentOrdersCard}>
      <Card.Content>
        <Title>Recent Work Orders</Title>
        <FlatList
          data={recentWorkOrders}
          renderItem={renderWorkOrder}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  recentOrdersCard: {
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  loadingText: {
    marginLeft: 8,
  },
  errorText: {
    color: '#d32f2f',
    marginTop: 8,
  },
  placeholder: {
    fontStyle: 'italic',
    opacity: 0.6,
    marginTop: 8,
  },
  separator: {
    height: 8,
  },
});

export default RecentWorkOrders;