# Design Document

## Overview

The Field Technician Workflow Optimization feature enhances the mobile web app with location-aware functionality, improved interaction patterns, and intelligent work order management. The design focuses on reducing cognitive load and physical interaction overhead while providing contextual information that helps technicians make better decisions in the field.

The solution leverages modern web APIs (Geolocation, Vibration, Clipboard) and progressive enhancement principles to ensure functionality across different devices and network conditions. The architecture maintains the existing Next.js/React structure while adding new hooks, utilities, and components for enhanced mobile interactions.

## Architecture

### System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        UI[Mobile Web UI]
        PWA[Progressive Web App]
        SW[Service Worker]
    end
    
    subgraph "Application Layer"
        Hooks[Custom Hooks]
        Utils[Utility Functions]
        Components[Enhanced Components]
        State[State Management]
    end
    
    subgraph "Data Layer"
        Cache[Local Cache]
        Queue[Sync Queue]
        Storage[Local Storage]
    end
    
    subgraph "External APIs"
        Geo[Geolocation API]
        Haptic[Vibration API]
        Clipboard[Clipboard API]
        Maps[Maps Integration]
    end
    
    subgraph "Backend"
        Supabase[Supabase Database]
        RealTime[Real-time Updates]
    end
    
    UI --> Hooks
    UI --> Components
    Hooks --> Utils
    Hooks --> Cache
    Components --> State
    State --> Queue
    Queue --> Supabase
    Cache --> Storage
    Utils --> Geo
    Utils --> Haptic
    Utils --> Clipboard
    Components --> Maps
    SW --> Cache
    PWA --> SW```


### Data Flow

1. **Location Acquisition**: App requests geolocation on load, caches position for 5 minutes
2. **Distance Calculation**: Haversine formula calculates distances between user and work orders
3. **Smart Sorting**: Algorithm combines distance and priority for optimal work order ranking
4. **Interaction Enhancement**: Haptic feedback and gesture recognition enhance user interactions
5. **Offline Handling**: Service worker caches data and queues actions for later sync

## Components and Interfaces

### Core Hooks

#### useGeolocation Hook
```typescript
interface GeolocationState {
  location: Coordinates | null
  error: string | null
  loading: boolean
  accuracy: number | null
}

interface Coordinates {
  lat: number
  lng: number
}

export function useGeolocation(options?: GeolocationOptions): GeolocationState
```

**Responsibilities:**
- Request and manage geolocation permissions
- Provide current user coordinates
- Handle location errors gracefully
- Cache location for performance
- Update location when user moves significantly

#### useHapticFeedback Hook
```typescript
interface HapticPatterns {
  light: () => void
  medium: () => void
  heavy: () => void
  success: () => void
  error: () => void
  warning: () => void
}

export function useHapticFeedback(): HapticPatterns
```

**Responsibilities:**
- Provide consistent haptic feedback patterns
- Check device support for vibration
- Respect user preferences for reduced motion
- Provide fallback for unsupported devices

#### useOfflineSync Hook
```typescript
interface OfflineSyncState {
  isOnline: boolean
  syncQueue: QueuedAction[]
  queueCount: number
  sync: () => Promise<void>
  addToQueue: (action: QueuedAction) => void
}

interface QueuedAction {
  id: string
  type: 'status_update' | 'note_add' | 'photo_upload'
  data: any
  timestamp: number
  retryCount: number
}

export function useOfflineSync(): OfflineSyncState
```

**Responsibilities:**
- Monitor online/offline status
- Queue actions when offline
- Automatically sync when connection restored
- Handle sync failures with retry logic
- Provide sync status to UI components

### Enhanced Components

#### LocationAwareWorkOrderCard
```typescript
interface LocationAwareWorkOrderCardProps {
  workOrder: WorkOrder
  userLocation: Coordinates | null
  onStatusUpdate: (id: string, status: WorkOrderStatus) => void
  onSwipeAction: (id: string, action: 'start' | 'complete') => void
}
```

**Features:**
- Distance badge display
- Swipe gesture handling
- Quick status updates
- Haptic feedback integration
- Progressive disclosure of details

#### PhoneQuickActions Component
```typescript
interface PhoneQuickActionsProps {
  phone: string
  customerName?: string
  onAction: (action: 'call' | 'sms' | 'whatsapp' | 'copy') => void
}
```

**Features:**
- Context menu for phone numbers
- Multiple communication options
- Haptic feedback on selection
- Accessibility support
- Error handling for unsupported actions

#### MultiSelectWorkOrders Component
```typescript
interface MultiSelectWorkOrdersProps {
  workOrders: WorkOrder[]
  onSelectionChange: (selected: string[]) => void
  onRouteplan: (workOrderIds: string[]) => void
}
```

**Features:**
- Long-press activation
- Visual selection indicators
- Batch operation support
- Route planning integration
- Selection persistence

### Utility Functions

#### Distance Calculation
```typescript
export function calculateDistance(from: Coordinates, to: Coordinates): number
export function formatDistance(kilometers: number): string
export function sortByProximityAndPriority(
  workOrders: WorkOrder[], 
  userLocation: Coordinates
): WorkOrder[]
```

#### Haptic Utilities
```typescript
export const hapticPatterns = {
  light: () => void
  medium: () => void
  success: () => void
  error: () => void
  selection: () => void
}
```

#### Gesture Recognition
```typescript
export function useSwipeGesture(
  element: RefObject<HTMLElement>,
  onSwipe: (direction: 'left' | 'right') => void,
  threshold?: number
): void
```

## Data Models

### Enhanced Work Order Model
```typescript
interface WorkOrder {
  // Existing fields...
  id: string
  workOrderNumber: string
  status: WorkOrderStatus
  priority: Priority
  
  // Location fields
  latitude?: number
  longitude?: number
  customerAddress?: string
  
  // Calculated fields (client-side)
  distanceFromUser?: number
  proximityScore?: number
  
  // Sync fields
  lastSyncedAt?: string
  pendingChanges?: PendingChange[]
}
```

### Geolocation State Model
```typescript
interface GeolocationState {
  coordinates: Coordinates | null
  accuracy: number | null
  timestamp: number
  error: GeolocationError | null
  permissionStatus: 'granted' | 'denied' | 'prompt'
}
```

### Sync Queue Model
```typescript
interface QueuedAction {
  id: string
  type: ActionType
  workOrderId: string
  data: any
  timestamp: number
  retryCount: number
  maxRetries: number
  status: 'pending' | 'syncing' | 'failed' | 'completed'
}

type ActionType = 
  | 'status_update'
  | 'note_add' 
  | 'photo_upload'
  | 'location_update'
  | 'time_tracking'
```

### Search History Model
```typescript
interface SearchHistoryItem {
  query: string
  timestamp: number
  resultCount: number
}

interface SearchHistory {
  items: SearchHistoryItem[]
  maxItems: number
  add: (query: string, resultCount: number) => void
  clear: () => void
  getRecent: (limit?: number) => SearchHistoryItem[]
}
```

## Error Handling

### Geolocation Errors
- **Permission Denied**: Show informative message, fall back to manual location entry
- **Position Unavailable**: Use cached location or disable location features gracefully
- **Timeout**: Retry with lower accuracy requirements, show loading state

### Network Errors
- **Offline Mode**: Queue actions, show offline indicator, enable cached data access
- **Sync Failures**: Implement exponential backoff, show retry options, maintain queue integrity
- **Partial Failures**: Handle individual action failures without affecting entire sync

### Device Capability Errors
- **No Haptic Support**: Silently fail, provide visual feedback alternatives
- **No Geolocation**: Disable location features, show appropriate messaging
- **Limited Storage**: Implement cache cleanup, prioritize critical data

### User Experience Errors
- **Invalid Phone Numbers**: Validate format, provide correction suggestions
- **Route Planning Failures**: Fall back to individual navigation, show error messaging
- **Search Errors**: Maintain search history, provide search suggestions

## Testing Strategy

### Unit Testing
- **Geolocation Hook**: Mock navigator.geolocation, test permission states, error handling
- **Distance Calculations**: Test Haversine formula accuracy, edge cases, performance
- **Haptic Utilities**: Mock vibration API, test pattern execution, device support
- **Sync Queue**: Test action queuing, retry logic, data persistence

### Integration Testing
- **Location-Aware Sorting**: Test with real coordinate data, verify sorting accuracy
- **Offline Sync**: Test network state changes, queue persistence, sync recovery
- **Multi-Select Flow**: Test selection state, route planning integration, error scenarios
- **Phone Actions**: Test communication app integration, fallback behaviors

### Mobile Device Testing
- **iOS Safari**: Test geolocation permissions, haptic feedback, PWA behavior
- **Android Chrome**: Test vibration patterns, offline functionality, gesture recognition
- **Various Screen Sizes**: Test responsive design, touch targets, gesture areas
- **Network Conditions**: Test on 3G, WiFi, offline scenarios

### Performance Testing
- **Location Updates**: Measure battery impact, update frequency optimization
- **Distance Calculations**: Test with large datasets, optimize calculation frequency
- **Gesture Recognition**: Test responsiveness, prevent accidental triggers
- **Cache Management**: Test storage limits, cleanup strategies, performance impact

### Accessibility Testing
- **Screen Readers**: Test with VoiceOver/TalkBack, ensure proper labeling
- **Motor Impairments**: Test with assistive touch, verify touch target sizes
- **Visual Impairments**: Test contrast ratios, font sizes, color dependencies
- **Cognitive Load**: Test information hierarchy, progressive disclosure effectiveness

### User Acceptance Testing
- **Field Scenarios**: Test in actual work environments, various weather conditions
- **Workflow Efficiency**: Measure task completion times, error rates, user satisfaction
- **Device Compatibility**: Test across different mobile devices, operating systems
- **Network Reliability**: Test in areas with poor connectivity, validate offline functionality

## Performance Considerations

### Location Services
- Cache user location for 5 minutes to reduce battery drain
- Use low-accuracy mode for distance calculations to improve performance
- Implement geofencing to trigger location updates only when needed
- Debounce location updates to prevent excessive calculations

### Haptic Feedback
- Limit vibration duration to preserve battery life
- Implement user preference controls for haptic intensity
- Use appropriate patterns that don't interfere with device notifications
- Provide visual alternatives for accessibility

### Offline Functionality
- Implement intelligent caching strategies for frequently accessed data
- Compress queued actions to minimize storage usage
- Use background sync when available for seamless user experience
- Implement cache eviction policies to manage storage limits

### Gesture Recognition
- Use passive event listeners to improve scroll performance
- Implement proper touch event handling to prevent conflicts
- Optimize gesture thresholds for different screen sizes
- Provide visual feedback during gesture recognition

This design provides a comprehensive foundation for implementing location-aware, mobile-optimized workflow enhancements while maintaining performance, accessibility, and reliability standards.