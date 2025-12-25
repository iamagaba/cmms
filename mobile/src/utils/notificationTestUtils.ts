import NotificationHandler, { NotificationData, NotificationType } from '../services/notificationHandler';

/**
 * Utility functions for testing notifications during development
 */
export class NotificationTestUtils {
  private static notificationHandler = NotificationHandler.getInstance();

  /**
   * Create a test work order notification
   */
  static async createTestWorkOrderNotification(): Promise<void> {
    const testNotification: NotificationData = {
      type: NotificationType.WORK_ORDER_ASSIGNED,
      workOrderId: 'WO-12345',
      priority: 'high',
      title: 'New Work Order Assigned',
      body: 'You have been assigned a new work order for vehicle maintenance at Downtown Location.',
      timestamp: Date.now(),
      customData: {
        customerName: 'Test Customer',
        vehicleId: 'V-789',
        location: 'Downtown Service Center',
      },
    };

    await this.notificationHandler.processNotification(
      this.createMockRemoteMessage(testNotification),
      false
    );
  }

  /**
   * Create a test emergency notification
   */
  static async createTestEmergencyNotification(): Promise<void> {
    const testNotification: NotificationData = {
      type: NotificationType.EMERGENCY_WORK_ORDER,
      workOrderId: 'WO-EMRG-001',
      priority: 'emergency',
      title: 'EMERGENCY: Immediate Response Required',
      body: 'Emergency work order requires immediate attention. Vehicle breakdown on Highway 101.',
      timestamp: Date.now(),
      customData: {
        location: 'Highway 101, Mile Marker 45',
        customerPhone: '+1-555-0123',
        vehicleId: 'V-EMRG-001',
      },
    };

    await this.notificationHandler.processNotification(
      this.createMockRemoteMessage(testNotification),
      false
    );
  }

  /**
   * Create a test schedule change notification
   */
  static async createTestScheduleChangeNotification(): Promise<void> {
    const testNotification: NotificationData = {
      type: NotificationType.SCHEDULE_CHANGE,
      priority: 'medium',
      title: 'Schedule Update',
      body: 'Your schedule has been updated. Please check your dashboard for new assignments.',
      timestamp: Date.now(),
      customData: {
        changedAppointments: 3,
        nextAppointment: '2:00 PM - Vehicle Inspection',
      },
    };

    await this.notificationHandler.processNotification(
      this.createMockRemoteMessage(testNotification),
      false
    );
  }

  /**
   * Create a test priority change notification
   */
  static async createTestPriorityChangeNotification(): Promise<void> {
    const testNotification: NotificationData = {
      type: NotificationType.WORK_ORDER_PRIORITY_CHANGED,
      workOrderId: 'WO-67890',
      priority: 'high',
      title: 'Work Order Priority Updated',
      body: 'Work Order #67890 priority has been changed to HIGH. Please prioritize this task.',
      timestamp: Date.now(),
      customData: {
        oldPriority: 'medium',
        newPriority: 'high',
        reason: 'Customer escalation',
      },
    };

    await this.notificationHandler.processNotification(
      this.createMockRemoteMessage(testNotification),
      false
    );
  }

  /**
   * Create multiple test notifications for testing list functionality
   */
  static async createMultipleTestNotifications(): Promise<void> {
    const notifications = [
      {
        type: NotificationType.WORK_ORDER_ASSIGNED,
        workOrderId: 'WO-001',
        priority: 'medium',
        title: 'New Work Order #001',
        body: 'Routine maintenance for Fleet Vehicle #123',
        timestamp: Date.now() - 300000, // 5 minutes ago
      },
      {
        type: NotificationType.WORK_ORDER_UPDATED,
        workOrderId: 'WO-002',
        priority: 'low',
        title: 'Work Order Updated',
        body: 'Additional parts have been added to your work order.',
        timestamp: Date.now() - 600000, // 10 minutes ago
      },
      {
        type: NotificationType.GENERAL_ANNOUNCEMENT,
        priority: 'low',
        title: 'System Maintenance Tonight',
        body: 'The system will be under maintenance from 11 PM to 2 AM.',
        timestamp: Date.now() - 3600000, // 1 hour ago
      },
    ];

    for (const notification of notifications) {
      await this.notificationHandler.processNotification(
        this.createMockRemoteMessage(notification as NotificationData),
        false
      );
    }
  }

  /**
   * Clear all test notifications
   */
  static async clearAllTestNotifications(): Promise<void> {
    await this.notificationHandler.clearAllNotifications();
  }

  /**
   * Create a mock Firebase remote message from notification data
   */
  private static createMockRemoteMessage(notificationData: NotificationData): any {
    return {
      messageId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      notification: {
        title: notificationData.title,
        body: notificationData.body,
      },
      data: {
        type: notificationData.type,
        workOrderId: notificationData.workOrderId,
        assetId: notificationData.assetId,
        priority: notificationData.priority,
        actionUrl: notificationData.actionUrl,
        ...notificationData.customData,
      },
      from: 'test-sender',
      ttl: 3600,
      sentTime: notificationData.timestamp,
    };
  }

  /**
   * Get notification handler instance for direct testing
   */
  static getNotificationHandler(): NotificationHandler {
    return this.notificationHandler;
  }
}

export default NotificationTestUtils;