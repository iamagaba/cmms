import React from 'react';
import {View, StyleSheet, RefreshControl} from 'react-native';
import {Card, Title, Paragraph, ActivityIndicator} from 'react-native-paper';
import {useWorkOrderStats} from '@/hooks/useWorkOrders';
import {ResponsiveGrid} from '@/components/common';

interface DashboardStatsProps {
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  refreshing = false,
  onRefresh,
}) => {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useWorkOrderStats({
    refetchInterval: 60000, // Refresh every minute
  });

  const handleRefresh = () => {
    refetch();
    onRefresh?.();
  };

  if (isLoading && !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Paragraph style={styles.loadingText}>Loading dashboard...</Paragraph>
      </View>
    );
  }

  if (error) {
    return (
      <Card style={styles.errorCard}>
        <Card.Content>
          <Title style={styles.errorTitle}>Unable to load stats</Title>
          <Paragraph style={styles.errorText}>
            {error instanceof Error ? error.message : 'Something went wrong'}
          </Paragraph>
        </Card.Content>
      </Card>
    );
  }

  const statsData = stats || {
    total: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    todayCompleted: 0,
  };

  return (
    <ResponsiveGrid 
      columns={2} 
      spacing={12}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Card style={styles.statCard}>
        <Card.Content>
          <Title style={styles.statNumber}>{statsData.total}</Title>
          <Paragraph>Total Assigned</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.statCard}>
        <Card.Content>
          <Title style={styles.statNumber}>{statsData.inProgress}</Title>
          <Paragraph>In Progress</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.statCard}>
        <Card.Content>
          <Title style={styles.statNumber}>{statsData.todayCompleted}</Title>
          <Paragraph>Completed Today</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.statCard}>
        <Card.Content>
          <Title 
            style={[
              styles.statNumber, 
              statsData.overdue > 0 && styles.overdueNumber
            ]}
          >
            {statsData.overdue}
          </Title>
          <Paragraph>Overdue</Paragraph>
        </Card.Content>
      </Card>
    </ResponsiveGrid>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    textAlign: 'center',
  },
  errorCard: {
    marginBottom: 16,
  },
  errorTitle: {
    color: '#d32f2f',
    fontSize: 18,
  },
  errorText: {
    marginTop: 8,
  },
  statCard: {
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  overdueNumber: {
    color: '#d32f2f',
  },
});

export default DashboardStats;