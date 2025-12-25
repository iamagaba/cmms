import React from 'react';
import {View, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from 'react-native-paper';

import {LoadingSpinner} from './LoadingSpinner';
import {ErrorState} from './ErrorState';

interface ScreenWrapperProps {
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  backgroundColor?: string;
  padding?: boolean;
  safeArea?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  loading = false,
  error = null,
  onRetry,
  scrollable = false,
  refreshing = false,
  onRefresh,
  backgroundColor,
  padding = true,
  safeArea = true,
}) => {
  const theme = useTheme();

  const containerStyle = [
    styles.container,
    {
      backgroundColor: backgroundColor || theme.colors.background,
    },
    padding && styles.padding,
  ];

  const content = (
    <View style={containerStyle}>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : scrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            ) : undefined
          }>
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </View>
  );

  if (safeArea) {
    return <SafeAreaView style={styles.safeArea}>{content}</SafeAreaView>;
  }

  return content;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  padding: {
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});