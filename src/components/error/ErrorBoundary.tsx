import { AlertCircle, Info, RefreshCw, ChevronDown, ChevronUp, Bug } from 'lucide-react';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Alert,
  Button,
  Stack,
  Text,
  Title,
  Group,
  Card,
  Badge,
  Collapse,
  ActionIcon,
  Box,
  Container,
  // ThemeIcon - removed due to Hugeicons dependency
} from '@/components/tailwind-components';
import type { LucideIcon } from 'lucide-react';

import { showError } from '@/utils/toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  feature?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  level?: 'page' | 'section' | 'component';
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
  showDetails: boolean;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  public state: State = {
    hasError: false,
    showDetails: false,
    retryCount: 0
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Report error to monitoring service
    this.reportError(error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Show notification for non-page level errors
    if (this.props.level !== 'page') {
      showError('A component encountered an error and has been reset.');
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      id: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      feature: this.props.feature || 'unknown',
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount
    };

    // Store error report locally
    try {
      const storedErrors = JSON.parse(localStorage.getItem('error_reports') || '[]');
      storedErrors.push(errorReport);

      // Keep only last 50 errors
      if (storedErrors.length > 50) {
        storedErrors.splice(0, storedErrors.length - 50);
      }

      localStorage.setItem('error_reports', JSON.stringify(storedErrors));
    } catch {
      console.warn('Failed to store error report locally');
    }

    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error monitoring service (Sentry, LogRocket, etc.)
      console.log('Error report would be sent to monitoring service:', errorReport);
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      showDetails: false,
      retryCount: this.state.retryCount + 1
    });
  };

  private handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      showError('Maximum retries reached. Refresh the page or contact support.');
      return;
    }

    this.handleReset();
  };

  private toggleDetails = () => {
    this.setState({ showDetails: !this.state.showDetails });
  };

  private getErrorSeverity = (): 'low' | 'medium' | 'high' | 'critical' => {
    const { error } = this.state;
    if (!error) return 'medium';

    // Determine severity based on error type and context
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return 'medium'; // Network/build issues
    }

    if (error.message.includes('Network Error') || error.message.includes('fetch')) {
      return 'low'; // Network issues
    }

    if (this.props.level === 'page') {
      return 'high'; // Page-level errors are more severe
    }

    return 'medium';
  };

  private getErrorIcon = (): LucideIcon => {
    const severity = this.getErrorSeverity();
    const icons: Record<string, LucideIcon> = {
      low: Info,
      medium: AlertCircle,
      high: AlertCircle,
      critical: AlertCircle
    };
    return icons[severity];
  };

  private getErrorColor = (): "blue" | "yellow" | "red" => {
    const severity = this.getErrorSeverity();
    const colors = {
      low: 'blue',
      medium: 'yellow',
      high: 'yellow',
      critical: 'red'
    } as const;
    return colors[severity];
  };

  private getUserFriendlyMessage = (): string => {
    const { error } = this.state;
    const { feature } = this.props;

    if (!error) return 'An unexpected error occurred.';

    // Chunk loading errors
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return 'Failed to load application resources. This usually happens after an update.';
    }

    // Network errors
    if (error.message.includes('Network Error') || error.message.includes('fetch')) {
      return 'Network connection failed. Check your internet connection.';
    }

    // Feature-specific messages
    if (feature) {
      const featureMessages: Record<string, string> = {
        'work_orders': 'Unable to load work orders feature',
        'technicians': 'Unable to load technicians feature',
        'assets': 'Unable to load assets feature',
        'dashboard': 'Unable to load dashboard',
        'calendar': 'Unable to load calendar feature',
        'settings': 'Unable to load settings',
        'cost_management': 'Unable to load cost management',
        'resource_planning': 'Unable to load resource planning',
        'workflow_management': 'Unable to load workflow management'
      };

      if (featureMessages[feature]) {
        return featureMessages[feature];
      }
    }

    return 'Operation failed. Try again.';
  };

  private renderErrorContent = () => {
    const { level = 'component' } = this.props;
    const severity = this.getErrorSeverity();
    const color = this.getErrorColor();
    const IconComponent = this.getErrorIcon();
    const message = this.getUserFriendlyMessage();
    const ToggleIcon = this.state.showDetails ? ChevronUp : ChevronDown;

    // Page-level error (full page)
    if (level === 'page') {
      return (
        <Container size="sm" className="py-12">
          <Card shadow="md" p="xl" radius="md">
            <Stack align="center" gap="lg">
              <Box className={`text-${color}-500`}>
                <IconComponent className="w-16 h-16" />
              </Box>

              <Stack align="center" gap="xs">
                <Title order={2} ta="center">
                  {severity === 'critical' ? 'Critical Error' : 'Something went wrong'}
                </Title>

                <Text ta="center" c="dimmed" size="lg">
                  {message}
                </Text>

                {this.state.errorId && (
                  <Badge variant="light" color={color} size="sm">
                    Error ID: {this.state.errorId}
                  </Badge>
                )}
              </Stack>

              <Group gap="sm">
                {this.state.retryCount < this.maxRetries && (
                  <Button
                    onClick={this.handleRetry}
                    size="lg"
                  >
                    <Group gap="xs">
                      <RefreshCw className="w-5 h-5" />
                      <span>Try Again</span>
                    </Group>
                  </Button>
                )}

                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  size="lg"
                >
                  <Group gap="xs">
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh Page</span>
                  </Group>
                </Button>
              </Group>

              {(process.env.NODE_ENV === 'development' || this.props.showDetails) && (
                <Stack style={{ width: '100%' }} gap="sm">
                  <Group justify="center">
                    <ActionIcon
                      variant="subtle"
                      onClick={this.toggleDetails}
                      aria-label="Toggle error details"
                    >
                      <ToggleIcon className="w-4 h-4" />
                    </ActionIcon>
                    <Text size="sm" c="dimmed">
                      {this.state.showDetails ? 'Hide' : 'Show'} Error Details
                    </Text>
                  </Group>

                  <Collapse in={this.state.showDetails}>
                    <Alert
                      color="red"
                      title="Technical Details"
                      icon={<Bug className="w-4 h-4" />}
                    >
                      <Stack gap="xs">
                        <Text size="sm" fw={500}>Error Message:</Text>
                        <Text size="sm" style={{ fontFamily: 'monospace' }}>
                          {this.state.error?.message}
                        </Text>

                        {this.state.error?.stack && (
                          <>
                            <Text size="sm" fw={500} mt="sm">Stack Trace:</Text>
                            <Text
                              size="xs"
                              style={{
                                fontFamily: 'monospace',
                                whiteSpace: 'pre-wrap',
                                maxHeight: '200px',
                                overflow: 'auto'
                              }}
                            >
                              {this.state.error.stack}
                            </Text>
                          </>
                        )}
                      </Stack>
                    </Alert>
                  </Collapse>
                </Stack>
              )}
            </Stack>
          </Card>
        </Container>
      );
    }

    // Section-level error (inline)
    if (level === 'section') {
      return (
        <Alert
          color={color}
          title="Section Error"
          icon={<IconComponent className="w-5 h-5" />}
          withCloseButton={false}
        >
          <Stack gap="sm">
            <Text size="sm">{message}</Text>

            <Group gap="xs">
              {this.state.retryCount < this.maxRetries && (
                <Button
                  size="xs"
                  variant="light"
                  color={color}
                  onClick={this.handleRetry}
                >
                  <Group gap="xs">
                    <RefreshCw className="w-5 h-5" />
                    <span>Retry</span>
                  </Group>
                </Button>
              )}

              {this.state.errorId && (
                <Badge variant="light" color={color} size="xs">
                  {this.state.errorId}
                </Badge>
              )}
            </Group>
          </Stack>
        </Alert>
      );
    }

    // Component-level error (minimal)
    return (
      <Alert
        color={color}
        icon={<IconComponent className="w-4 h-4" />}
        withCloseButton={false}
      >
        <Group justify="space-between" align="center">
          <Text size="sm">{message}</Text>

          {this.state.retryCount < this.maxRetries && (
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
          )}
        </Group>
      </Alert>
    );
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return this.renderErrorContent();
    }

    return this.props.children;
  }
}

export default ErrorBoundary;