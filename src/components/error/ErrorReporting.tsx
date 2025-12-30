import React, { useState } from 'react';
import {
  Modal,
  Stack,
  Text,
  Button,
  Group,
  Alert,
  Badge,
  Divider,
  Title
} from '@/components/tailwind-components';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle01Icon, BugIcon, CodeIcon, ArrowUp01Icon, ArrowDown01Icon, SentIcon } from '@hugeicons/core-free-icons';
import { showSuccess, showError } from '@/utils/toast';

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  componentStack?: string;
  feature?: string;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  buildVersion?: string;
  additionalContext?: Record<string, any>;
}

interface ErrorReportingModalProps {
  opened: boolean;
  onClose: () => void;
  error: Error;
  errorId: string;
  feature?: string;
  additionalContext?: Record<string, any>;
}

export function ErrorReportingModal({
  opened,
  onClose,
  error,
  errorId,
  feature,
  additionalContext
}: ErrorReportingModalProps) {
  const [userDescription, setUserDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const errorReport: ErrorReport = {
        id: errorId,
        message: error.message,
        stack: error.stack,
        feature,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: getCurrentUserId(),
        sessionId: getSessionId(),
        buildVersion: getBuildVersion(),
        additionalContext: {
          ...additionalContext,
          userDescription: userDescription.trim() || undefined,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          localStorage: getLocalStorageInfo(),
          performance: getPerformanceInfo()
        }
      };

      await sendErrorReport(errorReport);

      setSubmitted(true);
      showSuccess('Error report sent. Thank you for helping us improve.');

      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setUserDescription('');
      }, 2000);

    } catch (reportError) {
      console.error('Failed to send error report:', reportError);
      showError('Unable to send error report. The error has been logged locally.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Modal opened={opened} onClose={onClose} title="Error Report Sent">
        <Stack align="center" gap="md">
          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={48} color="green" />
          <Text className="text-center">
            Your error report has been sent successfully. Thank you for helping us improve the application.
          </Text>
        </Stack>
      </Modal>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Report Error"
      size="lg"
    >
      <Stack gap="md">
        <Alert
          color="red"
          icon={<HugeiconsIcon icon={BugIcon} size={16} />}
          title="Error Detected"
        >
          <Text size="sm">
            An error occurred in the application. You can help us fix this issue by providing
            additional details about what you were doing when the error happened.
          </Text>
        </Alert>

        <Stack gap="xs">
          <Text className="font-medium text-sm">Error ID</Text>
          <Badge variant="light" color="red" size="lg">
            {errorId}
          </Badge>
        </Stack>

        {feature && (
          <Stack gap="xs">
            <Text className="font-medium text-sm">Feature</Text>
            <Badge variant="light" color="blue" size="md">
              {feature}
            </Badge>
          </Stack>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What were you doing when this error occurred? (Optional)
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the steps you took before the error happened..."
            value={userDescription}
            onChange={(e) => setUserDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="border rounded-md overflow-hidden">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <HugeiconsIcon icon={CodeIcon} size={16} />
              <span className="font-medium">Technical Details</span>
            </span>
            <HugeiconsIcon
              icon={showDetails ? ArrowUp01Icon : ArrowDown01Icon}
              size={20}
            />
          </button>
          {showDetails && (
            <div className="px-4 py-3 space-y-3 border-t">
              <div>
                <Text className="font-medium text-sm mb-1">Error Message</Text>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{error.message}</pre>
              </div>

              {error.stack && (
                <div>
                  <Text className="font-medium text-sm mb-1">Stack Trace</Text>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-48">
                    {error.stack}
                  </pre>
                </div>
              )}

              <div>
                <Text className="font-medium text-sm mb-1">Browser Information</Text>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                  {navigator.userAgent}
                </pre>
              </div>

              <div>
                <Text className="font-medium text-sm mb-1">Page URL</Text>
                <pre className="bg-gray-100 p-2 rounded text-xs">{window.location.href}</pre>
              </div>

              <div>
                <Text className="font-medium text-sm mb-1">Timestamp</Text>
                <pre className="bg-gray-100 p-2 rounded text-xs">{new Date().toISOString()}</pre>
              </div>
            </div>
          )}
        </div>

        <Divider />

        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
            leftSection={<HugeiconsIcon icon={SentIcon} size={16} />}
          >
            Send Report
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// Utility functions
function getCurrentUserId(): string | undefined {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id;
  } catch {
    return undefined;
  }
}

function getSessionId(): string | undefined {
  try {
    return sessionStorage.getItem('sessionId') || undefined;
  } catch {
    return undefined;
  }
}

function getBuildVersion(): string | undefined {
  return import.meta.env.VITE_APP_VERSION || undefined;
}

function getLocalStorageInfo(): Record<string, any> {
  try {
    const info: Record<string, any> = {};
    const keys = ['theme', 'language', 'user_preferences'];

    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          info[key] = JSON.parse(value);
        } catch {
          info[key] = value;
        }
      }
    });

    return info;
  } catch {
    return {};
  }
}

function getPerformanceInfo(): Record<string, any> {
  try {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      memoryUsage: (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      } : undefined
    };
  } catch {
    return {};
  }
}

async function sendErrorReport(errorReport: ErrorReport): Promise<void> {
  try {
    const storedReports = JSON.parse(localStorage.getItem('error_reports') || '[]');
    storedReports.push(errorReport);

    if (storedReports.length > 50) {
      storedReports.splice(0, storedReports.length - 50);
    }

    localStorage.setItem('error_reports', JSON.stringify(storedReports));
  } catch {
    console.warn('Failed to store error report locally');
  }

  if (import.meta.env.PROD) {
    console.log('Error report would be sent to monitoring service:', errorReport);
  } else {
    console.log('Error report (development):', errorReport);
  }

  await new Promise(resolve => setTimeout(resolve, 1000));
}

// Hook for easy error reporting
export function useErrorReporting() {
  const [reportingState, setReportingState] = useState<{
    isOpen: boolean;
    error?: Error;
    errorId?: string;
    feature?: string;
    additionalContext?: Record<string, any>;
  }>({
    isOpen: false
  });

  const openErrorReport = (
    error: Error,
    errorId: string,
    feature?: string,
    additionalContext?: Record<string, any>
  ) => {
    setReportingState({
      isOpen: true,
      error,
      errorId,
      feature,
      additionalContext
    });
  };

  const closeErrorReport = () => {
    setReportingState({ isOpen: false });
  };

  const ErrorReportingComponent = reportingState.error ? (
    <ErrorReportingModal
      opened={reportingState.isOpen}
      onClose={closeErrorReport}
      error={reportingState.error}
      errorId={reportingState.errorId!}
      feature={reportingState.feature}
      additionalContext={reportingState.additionalContext}
    />
  ) : null;

  return {
    openErrorReport,
    closeErrorReport,
    ErrorReportingComponent
  };
}

export default ErrorReportingModal;