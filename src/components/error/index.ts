// Error handling components and utilities
export { ErrorBoundary, default as ErrorBoundaryComponent } from './ErrorBoundary';
export {
  ErrorFallback,
  LoadingErrorFallback,
  NetworkErrorFallback,
  default as ErrorFallbackComponent
} from './ErrorFallback';
export {
  ErrorReportingModal,
  useErrorReporting,
  default as ErrorReportingComponent
} from './ErrorReporting';
export {
  ErrorState,
  NetworkErrorState,
  LoadingErrorState,
  PermissionErrorState,
  DataErrorState,
  FormErrorState,
  LoadingWithError,
  InlineError,
  CriticalErrorState,
  MaintenanceState,
  default as ErrorStateComponent
} from './ErrorStates';
export {
  ErrorRecoveryWorkflow,
  useErrorRecoveryWorkflow,
  default as ErrorRecoveryWorkflowComponent
} from './ErrorRecoveryWorkflows';
export {
  ErrorDashboard,
  useErrorDashboard,
  default as ErrorDashboardComponent
} from './ErrorDashboard';

// New comprehensive error handling components
export {
  ErrorRecoveryWorkflow as ModernErrorRecoveryWorkflow,
  createNetworkErrorRecovery,
  createDataLoadErrorRecovery,
  createFormErrorRecovery
} from './ErrorRecoveryWorkflow';
export {
  ErrorDashboard as ModernErrorDashboard
} from './ErrorDashboard';
export {
  ContextualErrorHandler,
  useContextualErrorHandler,
  createWorkOrderErrorConfig,
  createNetworkErrorConfig,
  createFormErrorConfig
} from './ContextualErrorHandler';
export {
  ErrorNotificationSystem,
  useErrorNotifications,
  createNetworkErrorNotification,
  createFormErrorNotification,
  createDataLoadErrorNotification,
  createPermissionErrorNotification,
  errorNotifications
} from './ErrorNotificationSystem';
export {
  GlobalErrorHandler
} from './GlobalErrorHandler';
export {
  ComprehensiveErrorProvider,
  useComprehensiveError,
  withComprehensiveErrorHandling,
  useAsyncErrorHandling,
  useFormErrorHandling
} from './ComprehensiveErrorProvider';
export {
  PerformanceAuditDashboard
} from './PerformanceAuditDashboard';
export {
  ModernErrorHandlingDemo
} from './ModernErrorHandlingDemo';
export { ErrorHandlingDemo } from './ErrorHandlingDemo';

// Re-export types
export type { ErrorReport } from './ErrorReporting';
export type { ErrorFallbackProps } from './ErrorFallback';
export type { ErrorStateProps } from './ErrorStates';

// Convenience wrapper component that combines ErrorBoundary with ErrorReporting
export { EnhancedErrorBoundary } from './EnhancedErrorBoundary';
export type { EnhancedErrorBoundaryProps } from './EnhancedErrorBoundary';
