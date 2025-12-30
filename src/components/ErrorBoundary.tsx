// Legacy ErrorBoundary - kept for backward compatibility
// For new implementations, use the enhanced ErrorBoundary from ./error/ErrorBoundary
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Stack, Text, Title } from '@/components/tailwind-components';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon } from '@hugeicons/core-free-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  feature?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Log error using the new error logger
    import('../utils/errorLogger').then(({ errorLogger }) => {
      errorLogger.logError(error, {
        feature: this.props.feature || 'unknown',
        action: 'component_error',
        additionalData: {
          componentStack: errorInfo.componentStack
        }
      });
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
          <Stack gap="lg" align="center">
            <HugeiconsIcon icon={AlertCircleIcon} size={64} style={{ color: '#ef4444' }} />

            <Title order={2} ta="center">Something went wrong</Title>

            <Text ta="center" c="dimmed">
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </Text>

            <Stack gap="sm" style={{ width: '100%' }}>
              <Button onClick={this.handleReload} size="lg" fullWidth>
                Refresh Page
              </Button>
              <Button onClick={this.handleReset} variant="outline" size="lg" fullWidth>
                Try Again
              </Button>
            </Stack>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Alert
                color="red"
                title="Development Error Details"
                style={{ width: '100%', textAlign: 'left' }}
              >
                <Text size="sm" style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </Text>
              </Alert>
            )}
          </Stack>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;