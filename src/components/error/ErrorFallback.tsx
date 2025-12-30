import React from 'react';
import {
  Alert,
  Button,
  Stack,
  Text,
  Title,
  Group,
  Card,
  Badge,
  ActionIcon,
  Box,
  Container,
  Skeleton
} from '@/components/tailwind-components';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  InformationCircleIcon, 
  AlertCircleIcon, 
  Alert01Icon, 
  AlertSquareIcon, 
  RefreshIcon, 
  ReloadIcon, 
  Loading01Icon, 
  WifiOffIcon 
} from '@hugeicons/core-free-icons';

export interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  errorId?: string;
  feature?: string;
  level?: 'page' | 'section' | 'component';
  showRetry?: boolean;
  showReload?: boolean;
  customMessage?: string;
  customActions?: React.ReactNode;
}

export function ErrorFallback({
  error,
  resetError,
  errorId,
  feature,
  level = 'component',
  showRetry = true,
  showReload = false,
  customMessage,
  customActions
}: ErrorFallbackProps) {
  const getUserFriendlyMessage = (): string => {
    if (customMessage) return customMessage;
    if (!error) return 'An unexpected error occurred.';

    // Chunk loading errors
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return 'Failed to load application resources. This usually happens after an update.';
    }

    // Network errors
    if (error.message.includes('Network Error') || error.message.includes('fetch')) {
      return 'Network connection issue. Please check your internet connection.';
    }

    // Feature-specific messages
    if (feature) {
      const featureMessages: Record<string, string> = {
        'work_orders': 'Unable to load work orders. Please try again.',
        'technicians': 'Unable to load technician information. Please try again.',
        'assets': 'Unable to load asset information. Please try again.',
        'dashboard': 'Unable to load dashboard data. Please try again.',
        'calendar': 'Unable to load calendar events. Please try again.',
        'settings': 'Unable to load settings. Please try again.',
        'data_table': 'Unable to load table data. Please try again.',
        'form': 'There was an issue with the form. Please try again.',
        'chart': 'Unable to load chart data. Please try again.'
      };

      if (featureMessages[feature]) {
        return featureMessages[feature];
      }
    }

    return 'Something went wrong. Please try again.';
  };

  const getErrorSeverity = (): 'low' | 'medium' | 'high' | 'critical' => {
    if (!error) return 'medium';

    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return 'medium';
    }

    if (error.message.includes('Network Error') || error.message.includes('fetch')) {
      return 'low';
    }

    if (level === 'page') {
      return 'high';
    }

    return 'medium';
  };

  const severity = getErrorSeverity();
  const message = getUserFriendlyMessage();

  const getErrorIcon = () => {
    const icons = {
      low: InformationCircleIcon,
      medium: AlertCircleIcon,
      high: AlertCircleIcon,
      critical: AlertSquareIcon
    };
    return icons[severity];
  };

  const getErrorColor = () => {
    const colors = {
      low: 'blue',
      medium: 'yellow',
      high: 'orange',
      critical: 'red'
    };
    return colors[severity];
  };

  const handleReload = () => {
    window.location.reload();
  };

  const color = getErrorColor();
  const icon = getErrorIcon();

  // Page-level error fallback
  if (level === 'page') {
    return (
      <Container size="sm" py="xl">
        <Card shadow="md" padding="xl" radius="md">
          <Stack align="center" gap="lg">
            <Box c={color}>
              <HugeiconsIcon icon={icon} size={64} />
            </Box>

            <Stack align="center" gap="xs">
              <Title order={2} ta="center">
                {severity === 'critical' ? 'Critical Error' : 'Something went wrong'}
              </Title>

              <Text ta="center" c="dimmed" size="lg">
                {message}
              </Text>

              {errorId && (
                <Badge variant="light" color={color} size="sm">
                  Error ID: {errorId}
                </Badge>
              )}
            </Stack>

            {customActions || (
              <Group gap="sm">
                {showRetry && resetError && (
                  <Button
                    onClick={resetError}
                    leftSection={<HugeiconsIcon icon={RefreshIcon} size={16} />}
                    size="lg"
                  >
                    Try Again
                  </Button>
                )}

                {showReload && (
                  <Button
                    onClick={handleReload}
                    variant="outline"
                    leftSection={<HugeiconsIcon icon={ReloadIcon} size={16} />}
                    size="lg"
                  >
                    Refresh Page
                  </Button>
                )}
              </Group>
            )}
          </Stack>
        </Card>
      </Container>
    );
  }

  // Section-level error fallback
  if (level === 'section') {
    return (
      <Alert
        color={color}
        title="Section Error"
        icon={<HugeiconsIcon icon={icon} size={20} />}
        withCloseButton={false}
      >
        <Stack gap="sm">
          <Text size="sm">{message}</Text>

          {(showRetry || showReload || customActions) && (
            <Group gap="xs">
              {showRetry && resetError && (
                <Button
                  size="xs"
                  variant="light"
                  color={color}
                  onClick={resetError}
                  leftSection={<HugeiconsIcon icon={RefreshIcon} size={14} />}
                >
                  Retry
                </Button>
              )}

              {showReload && (
                <Button
                  size="xs"
                  variant="outline"
                  color={color}
                  onClick={handleReload}
                  leftSection={<HugeiconsIcon icon={ReloadIcon} size={14} />}
                >
                  Reload
                </Button>
              )}

              {customActions}

              {errorId && (
                <Badge variant="light" color={color} size="xs">
                  {errorId}
                </Badge>
              )}
            </Group>
          )}
        </Stack>
      </Alert>
    );
  }

  // Component-level error fallback
  return (
    <Alert
      color={color}
      icon={<HugeiconsIcon icon={icon} size={16} />}
      withCloseButton={false}
    >
      <Group justify="space-between" align="center">
        <Text size="sm">{message}</Text>

        <Group gap="xs">
          {showRetry && resetError && (
            <ActionIcon
              size="sm"
              variant="subtle"
              color={color}
              onClick={resetError}
              aria-label="Retry"
            >
              <HugeiconsIcon icon={RefreshIcon} size={14} />
            </ActionIcon>
          )}

          {customActions}
        </Group>
      </Group>
    </Alert>
  );
}

// Loading error fallback
export function LoadingErrorFallback({
  message = "Failed to load content",
  onRetry,
  showSkeleton = true
}: {
  message?: string;
  onRetry?: () => void;
  showSkeleton?: boolean;
}) {
  if (showSkeleton) {
    return (
      <Stack gap="md">
        <Skeleton height={20} width="60%" />
        <Skeleton height={100} />
        <Group justify="center">
          <Button
            variant="light"
            size="sm"
            onClick={onRetry}
            leftSection={<HugeiconsIcon icon={RefreshIcon} size={14} />}
          >
            Retry Loading
          </Button>
        </Group>
      </Stack>
    );
  }

  return (
    <Alert
      color="yellow"
      icon={<HugeiconsIcon icon={Loading01Icon} size={16} />}
    >
      <Group justify="space-between" align="center">
        <Text size="sm">{message}</Text>
        {onRetry && (
          <ActionIcon
            size="sm"
            variant="subtle"
            onClick={onRetry}
            aria-label="Retry"
          >
            <HugeiconsIcon icon={RefreshIcon} size={14} />
          </ActionIcon>
        )}
      </Group>
    </Alert>
  );
}

// Network error fallback
export function NetworkErrorFallback({
  onRetry,
  showOfflineMessage = true
}: {
  onRetry?: () => void;
  showOfflineMessage?: boolean;
}) {
  return (
    <Alert
      color="orange"
      title="Connection Issue"
      icon={<HugeiconsIcon icon={WifiOffIcon} size={16} />}
    >
      <Stack gap="sm">
        <Text size="sm">
          {showOfflineMessage
            ? "You appear to be offline. Some features may be limited."
            : "Unable to connect to the server. Please check your internet connection."
          }
        </Text>

        {onRetry && (
          <Button
            size="xs"
            variant="light"
            color="orange"
            onClick={onRetry}
            leftSection={<HugeiconsIcon icon={RefreshIcon} size={14} />}
          >
            Try Again
          </Button>
        )}
      </Stack>
    </Alert>
  );
}

export default ErrorFallback;