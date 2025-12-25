import { useCallback, useRef } from 'react';
import { 
  notificationSystem,
  EnhancedNotificationConfig,
  NotificationAction,
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
  showLoadingNotification,
  showCriticalNotification,
  showActionNotification,
  showProgressNotification
} from '@/components/notifications/NotificationSystem';

export interface UseNotificationsReturn {
  // Basic notification methods
  showSuccess: (message: string, config?: Partial<EnhancedNotificationConfig>) => string;
  showError: (message: string, config?: Partial<EnhancedNotificationConfig>) => string;
  showWarning: (message: string, config?: Partial<EnhancedNotificationConfig>) => string;
  showInfo: (message: string, config?: Partial<EnhancedNotificationConfig>) => string;
  showLoading: (message: string, config?: Partial<EnhancedNotificationConfig>) => string;
  showCritical: (message: string, config?: Partial<EnhancedNotificationConfig>) => string;
  
  // Advanced notification methods
  showAction: (message: string, actions: NotificationAction[], config?: Partial<EnhancedNotificationConfig>) => string;
  showProgress: (message: string, config?: Partial<EnhancedNotificationConfig>) => string;
  show: (config: EnhancedNotificationConfig) => string;
  
  // Management methods
  update: (id: string, config: Partial<EnhancedNotificationConfig>) => void;
  hide: (id: string) => void;
  hideAll: () => void;
  
  // Utility methods
  getActiveCount: () => number;
  getQueuedCount: () => number;
  
  // Specialized notification patterns
  showOperationResult: (success: boolean, successMessage: string, errorMessage: string) => string;
  showConfirmAction: (message: string, onConfirm: () => void, onCancel?: () => void) => string;
  showUndoAction: (message: string, onUndo: () => void, undoTimeout?: number) => string;
  showSaveStatus: (isSaving: boolean, saveMessage?: string, successMessage?: string) => string;
}

/**
 * Enhanced notifications hook with common patterns and utilities
 */
export function useNotifications(): UseNotificationsReturn {
  const loadingNotificationRef = useRef<string | null>(null);

  // Basic notification methods
  const showSuccess = useCallback((message: string, config?: Partial<EnhancedNotificationConfig>) => {
    return showSuccessNotification(message, config);
  }, []);

  const showError = useCallback((message: string, config?: Partial<EnhancedNotificationConfig>) => {
    return showErrorNotification(message, config);
  }, []);

  const showWarning = useCallback((message: string, config?: Partial<EnhancedNotificationConfig>) => {
    return showWarningNotification(message, config);
  }, []);

  const showInfo = useCallback((message: string, config?: Partial<EnhancedNotificationConfig>) => {
    return showInfoNotification(message, config);
  }, []);

  const showLoading = useCallback((message: string, config?: Partial<EnhancedNotificationConfig>) => {
    return showLoadingNotification(message, config);
  }, []);

  const showCritical = useCallback((message: string, config?: Partial<EnhancedNotificationConfig>) => {
    return showCriticalNotification(message, config);
  }, []);

  // Advanced notification methods
  const showAction = useCallback((
    message: string, 
    actions: NotificationAction[], 
    config?: Partial<EnhancedNotificationConfig>
  ) => {
    return showActionNotification(message, actions, config);
  }, []);

  const showProgress = useCallback((message: string, config?: Partial<EnhancedNotificationConfig>) => {
    return showProgressNotification(message, config);
  }, []);

  const show = useCallback((config: EnhancedNotificationConfig) => {
    return notificationSystem.show(config);
  }, []);

  // Management methods
  const update = useCallback((id: string, config: Partial<EnhancedNotificationConfig>) => {
    notificationSystem.update(id, config);
  }, []);

  const hide = useCallback((id: string) => {
    notificationSystem.hide(id);
  }, []);

  const hideAll = useCallback(() => {
    notificationSystem.hideAll();
  }, []);

  // Utility methods
  const getActiveCount = useCallback(() => {
    return notificationSystem.getActiveCount();
  }, []);

  const getQueuedCount = useCallback(() => {
    return notificationSystem.getQueuedCount();
  }, []);

  // Specialized notification patterns
  const showOperationResult = useCallback((
    success: boolean, 
    successMessage: string, 
    errorMessage: string
  ) => {
    if (success) {
      return showSuccess(successMessage);
    } else {
      return showError(errorMessage);
    }
  }, [showSuccess, showError]);

  const showConfirmAction = useCallback((
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void
  ) => {
    return showAction(message, [
      {
        label: 'Confirm',
        onClick: onConfirm,
        variant: 'filled',
        color: 'blue'
      },
      {
        label: 'Cancel',
        onClick: onCancel || (() => {}),
        variant: 'subtle'
      }
    ], {
      type: 'user-action',
      persistent: true
    });
  }, [showAction]);

  const showUndoAction = useCallback((
    message: string, 
    onUndo: () => void, 
    undoTimeout: number = 5000
  ) => {
    return showAction(message, [
      {
        label: 'Undo',
        onClick: onUndo,
        variant: 'light',
        icon: 'mdi:undo'
      }
    ], {
      type: 'info',
      autoClose: undoTimeout
    });
  }, [showAction]);

  const showSaveStatus = useCallback((
    isSaving: boolean, 
    saveMessage: string = 'Saving...', 
    successMessage: string = 'Saved successfully'
  ) => {
    if (isSaving) {
      // Hide previous loading notification if exists
      if (loadingNotificationRef.current) {
        hide(loadingNotificationRef.current);
      }
      
      // Show new loading notification
      const id = showLoading(saveMessage);
      loadingNotificationRef.current = id;
      return id;
    } else {
      // Hide loading notification
      if (loadingNotificationRef.current) {
        hide(loadingNotificationRef.current);
        loadingNotificationRef.current = null;
      }
      
      // Show success notification
      return showSuccess(successMessage);
    }
  }, [showLoading, showSuccess, hide]);

  return {
    // Basic methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showCritical,
    
    // Advanced methods
    showAction,
    showProgress,
    show,
    
    // Management methods
    update,
    hide,
    hideAll,
    
    // Utility methods
    getActiveCount,
    getQueuedCount,
    
    // Specialized patterns
    showOperationResult,
    showConfirmAction,
    showUndoAction,
    showSaveStatus
  };
}

export default useNotifications;