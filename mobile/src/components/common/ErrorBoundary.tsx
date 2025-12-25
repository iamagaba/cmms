import React, {Component, ErrorInfo, ReactNode} from 'react';
import {View, StyleSheet} from 'react-native';
import {Button, Card, Text, Title} from 'react-native-paper';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {hasError: true, error};
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({hasError: false, error: undefined});
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>Something went wrong</Title>
              <Text style={styles.message}>
                An unexpected error occurred. Please try again.
              </Text>
              {__DEV__ && this.state.error && (
                <Text style={styles.errorDetails}>
                  {this.state.error.message}
                </Text>
              )}
            </Card.Content>
            <Card.Actions>
              <Button mode="contained" onPress={this.handleRetry}>
                Try Again
              </Button>
            </Card.Actions>
          </Card>
        </View>
      );
    }

    return this.props.children;
  }
}

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
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
  },
  errorDetails: {
    fontSize: 12,
    color: 'red',
    marginTop: 8,
    fontFamily: 'monospace',
  },
});