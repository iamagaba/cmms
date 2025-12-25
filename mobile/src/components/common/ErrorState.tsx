import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Button, Card, Text, Title} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  title?: string;
  icon?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  title = 'Something went wrong',
  icon = 'error-outline',
}) => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Icon name={icon} size={48} color="#f44336" style={styles.icon} />
          <Title style={styles.title}>{title}</Title>
          <Text style={styles.message}>{message}</Text>
        </Card.Content>
        {onRetry && (
          <Card.Actions style={styles.actions}>
            <Button mode="contained" onPress={onRetry} icon="refresh">
              Try Again
            </Button>
          </Card.Actions>
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  content: {
    alignItems: 'center',
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
    marginBottom: 16,
  },
  actions: {
    justifyContent: 'center',
  },
});