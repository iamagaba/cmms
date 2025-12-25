# Push Notifications Implementation

This document describes the push notification implementation for the Mobile Technician App.

## Overview

The notification system is built using Firebase Cloud Messaging (FCM) and provides:
- Push notification infrastructure
- Permission management
- Token registration and management
- Notification handling and routing
- Deep linking from notifications
- Badge management
- Notification history

## Architecture

### Core Components

1. **FirebaseService** (`firebase.ts`)
   - Manages FCM initialization and configuration
   - Handles token generation and refresh
   - Manages notification permissions
   - Sets up message handlers

2. **NotificationHandler** (`notificationHandler.ts`)
   - Processes incoming notifications
   - Handles deep linking and navigation
   - Manages notification storage and badge counts
   - Categorizes different notification types

3. **NotificationContext** (`NotificationContext.tsx`)
   - Provides app-wide notification state
   - Combines permission, token, and handler functionality
   - Manages initialization and lifecycle

### Hooks

1. **useNotificationPermissions**
   - Manages notification permission requests
   - Provides user-friendly permission dialogs
   - Handles permission status checking

2. **useNotificationToken**
   - Manages FCM token lifecycle
   - Handles server registration/unregistration
   - Provides token refresh functionality

3. **useNotificationHandler**
   - Manages notification processing and display
   - Handles notification history and badge counts
   - Provides notification interaction methods

### UI Components

1. **NotificationList**
   - Displays notification history
   - Handles notification interactions
   - Provides pull-to-refresh and clear all functionality

2. **NotificationBadge**
   - Shows unread notification count
   - Configurable size and styling
   - Auto-updates with notification state

3. **NotificationScreen**
   - Full-screen notification management
   - Integrates with navigation system

## Notification Types

The system supports the following notification types:

- `WORK_ORDER_ASSIGNED` - New work order assignments
- `WORK_ORDER_UPDATED` - Work order modifications
- `WORK_ORDER_CANCELLED` - Work order cancellations
- `WORK_ORDER_PRIORITY_CHANGED` - Priority updates
- `EMERGENCY_WORK_ORDER` - Emergency assignments
- `SCHEDULE_CHANGE` - Schedule modifications
- `SYSTEM_MAINTENANCE` - System announcements
- `GENERAL_ANNOUNCEMENT` - General notifications

## Deep Linking

Notifications automatically route users to relevant screens:

- Work order notifications → Work Order Details
- Emergency notifications → Work Order Details (with priority)
- Schedule changes → Dashboard
- General announcements → Dashboard

## Usage

### Basic Setup

```typescript
// App.tsx - Already integrated
import { NotificationProvider } from './context/NotificationContext';

<NotificationProvider>
  {/* Your app content */}
</NotificationProvider>
```

### Using Notifications in Components

```typescript
import { useNotification } from '../context/NotificationContext';

const MyComponent = () => {
  const {
    hasPermission,
    unreadCount,
    requestPermissions,
    loadNotifications,
  } = useNotification();

  // Request permissions
  const handleRequestPermissions = async () => {
    const granted = await requestPermissions();
    if (granted) {
      console.log('Notifications enabled');
    }
  };

  return (
    <View>
      {!hasPermission && (
        <Button onPress={handleRequestPermissions}>
          Enable Notifications
        </Button>
      )}
      {unreadCount > 0 && (
        <Text>You have {unreadCount} unread notifications</Text>
      )}
    </View>
  );
};
```

### Displaying Notification Badge

```typescript
import { NotificationBadge } from '../components/notifications';

const TabIcon = () => (
  <View>
    <Icon name="notifications" />
    <NotificationBadge size="small" />
  </View>
);
```

### Showing Notification List

```typescript
import { NotificationList } from '../components/notifications';

const NotificationsTab = () => (
  <NotificationList
    onNotificationPress={(notification) => {
      console.log('Notification pressed:', notification);
    }}
    showClearAll={true}
    maxItems={50}
  />
);
```

## Testing

Use the `NotificationTestUtils` for development testing:

```typescript
import NotificationTestUtils from '../utils/notificationTestUtils';

// Create test notifications
await NotificationTestUtils.createTestWorkOrderNotification();
await NotificationTestUtils.createTestEmergencyNotification();
await NotificationTestUtils.createMultipleTestNotifications();

// Clear test data
await NotificationTestUtils.clearAllTestNotifications();
```

## Configuration Requirements

### Firebase Setup

1. Add Firebase configuration to your project
2. Configure FCM in Firebase Console
3. Add platform-specific configuration files:
   - iOS: `GoogleService-Info.plist`
   - Android: `google-services.json`

### Platform-Specific Setup

#### iOS
- Add notification capabilities in Xcode
- Configure APNs certificates in Firebase Console
- Add notification service extension for rich notifications

#### Android
- Add FCM dependencies to `android/app/build.gradle`
- Configure notification channels for Android 8+
- Add notification icons and sounds

### Permissions

The system automatically handles:
- iOS: Notification authorization requests
- Android: POST_NOTIFICATIONS permission (API 33+)
- Graceful degradation for denied permissions

## Server Integration

To complete the notification system, implement server-side functionality:

1. **Token Registration API**
   ```typescript
   POST /api/notifications/register
   {
     "userId": "user_id",
     "token": "fcm_token",
     "deviceId": "device_id"
   }
   ```

2. **Send Notification API**
   ```typescript
   POST /api/notifications/send
   {
     "userIds": ["user1", "user2"],
     "type": "work_order_assigned",
     "title": "New Work Order",
     "body": "You have a new assignment",
     "data": {
       "workOrderId": "WO-123",
       "priority": "high"
     }
   }
   ```

3. **Notification History API**
   ```typescript
   GET /api/notifications/history?userId=user_id&limit=50
   ```

## Security Considerations

- Tokens are stored securely using device keychain/keystore
- All API communications should use HTTPS
- Implement token validation on the server
- Regular token refresh and cleanup
- User consent for notification permissions

## Performance Optimization

- Notification batching for multiple updates
- Efficient local storage management
- Background processing for notification handling
- Lazy loading of notification history
- Automatic cleanup of old notifications

## Troubleshooting

### Common Issues

1. **Notifications not received**
   - Check Firebase configuration
   - Verify token registration
   - Check device notification settings

2. **Deep linking not working**
   - Verify navigation setup
   - Check notification data format
   - Ensure proper screen registration

3. **Permission denied**
   - Guide users to device settings
   - Provide clear permission explanations
   - Implement graceful fallbacks

### Debug Tools

- Use Firebase Console for testing
- Check device logs for FCM messages
- Use notification test utilities
- Monitor token registration status

## Future Enhancements

- Rich notifications with images and actions
- Notification scheduling and batching
- Advanced notification categories
- Integration with wearable devices
- Voice notification support
- Notification analytics and tracking