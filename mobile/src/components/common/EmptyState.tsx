import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Button, Text, Title} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon = 'inbox',
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <Icon name={icon} size={64} color="#9e9e9e" style={styles.icon} />
      <Title style={styles.title}>{title}</Title>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <Button
          mode="contained"
          onPress={onAction}
          style={styles.button}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  button: {
    marginTop: 8,
  },
});