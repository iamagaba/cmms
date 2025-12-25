export interface NotificationData {
  type: NotificationType;
  workOrderId?: string;
  assetId?: string;
  priority?: 'low' | 'medium' | 'high' | 'emergency';
  title: string;
  body: string;
  timestamp: number;
  actionUrl?: string;
  customData?: Record<string, any>;
  isRead?: boolean;
}

export enum NotificationType {
  WORK_ORDER_ASSIGNED = 'work_order_assigned',
  WORK_ORDER_UPDATED = 'work_order_updated',
  WORK_ORDER_CANCELLED = 'work_order_cancelled',
  WORK_ORDER_PRIORITY_CHANGED = 'work_order_priority_changed',
  EMERGENCY_WORK_ORDER = 'emergency_work_order',
  SCHEDULE_CHANGE = 'schedule_change',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  GENERAL_ANNOUNCEMENT = 'general_announcement',
}

export interface NotificationAction {
  type: 'navigate' | 'external_link' | 'custom';
  target: string;
  params?: Record<string, any>;
}

export interface NotificationToken {
  token: string;
  timestamp: number;
  deviceId: string;
}

export interface NotificationPermissionState {
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationTokenState {
  token: string | null;
  isRegistered: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationHandlerState {
  notifications: NotificationData[];
  unreadCount: number;
  badgeCount: number;
  isLoading: boolean;
  error: string | null;
}