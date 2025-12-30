/**
 * Temporary NotificationSystem placeholder
 * This is a minimal implementation to fix build errors
 * TODO: Implement full notification system as part of design system
 */

export interface EnhancedNotificationConfig {
  id?: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading' | 'critical' | 'user-action';
  message: string;
  title?: string;
  autoClose?: boolean | number;
  persistent?: boolean;
  actions?: NotificationAction[];
  progress?: number;
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'filled' | 'light' | 'subtle';
  color?: string;
  icon?: string;
}

// Simple notification system placeholder
class SimpleNotificationSystem {
  private notifications: Map<string, EnhancedNotificationConfig> = new Map();
  private idCounter = 0;

  show(config: EnhancedNotificationConfig): string {
    const id = config.id || `notification-${++this.idCounter}`;
    this.notifications.set(id, { ...config, id });

    // Simple console log for now
    console.log(`[${config.type?.toUpperCase() || 'INFO'}] ${config.message}`);

    return id;
  }

  update(id: string, config: Partial<EnhancedNotificationConfig>): void {
    const existing = this.notifications.get(id);
    if (existing) {
      this.notifications.set(id, { ...existing, ...config });
    }
  }

  hide(id: string): void {
    this.notifications.delete(id);
  }

  hideAll(): void {
    this.notifications.clear();
  }

  getActiveCount(): number {
    return this.notifications.size;
  }

  getQueuedCount(): number {
    return 0; // No queue in simple implementation
  }
}

export const notificationSystem = new SimpleNotificationSystem();

// Helper functions
export const showSuccessNotification = (message: string, config?: Partial<EnhancedNotificationConfig>) => {
  return notificationSystem.show({ ...config, message, type: 'success' });
};

export const showErrorNotification = (message: string, config?: Partial<EnhancedNotificationConfig>) => {
  return notificationSystem.show({ ...config, message, type: 'error' });
};

export const showWarningNotification = (message: string, config?: Partial<EnhancedNotificationConfig>) => {
  return notificationSystem.show({ ...config, message, type: 'warning' });
};

export const showInfoNotification = (message: string, config?: Partial<EnhancedNotificationConfig>) => {
  return notificationSystem.show({ ...config, message, type: 'info' });
};

export const showLoadingNotification = (message: string, config?: Partial<EnhancedNotificationConfig>) => {
  return notificationSystem.show({ ...config, message, type: 'loading' });
};

export const showCriticalNotification = (message: string, config?: Partial<EnhancedNotificationConfig>) => {
  return notificationSystem.show({ ...config, message, type: 'critical' });
};

export const showActionNotification = (
  message: string,
  actions: NotificationAction[],
  config?: Partial<EnhancedNotificationConfig>
) => {
  return notificationSystem.show({ ...config, message, actions, type: 'user-action' });
};

export const showProgressNotification = (message: string, config?: Partial<EnhancedNotificationConfig>) => {
  return notificationSystem.show({ ...config, message, type: 'loading' });
};