/**
 * Real-time Manager - Enhanced Supabase real-time subscriptions for activity timeline
 * Manages connection state, subscription lifecycle, offline sync, and error recovery
 * 
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Offline update queuing and synchronization
 * - Connection state monitoring and recovery
 * - Subscription lifecycle management
 * - Error handling and retry logic
 */

import { supabase } from '@/integrations/supabase/client';
import type { 
  RealtimeManager as IRealtimeManager,
  RealtimeSubscription,
  RealtimeSubscriptionConfig,
  Activity
} from '@/types/activity-timeline';

/**
 * Enhanced subscription data with additional metadata
 */
interface EnhancedSubscription {
  id: string;
  workOrderId: string;
  unsubscribe: () => void;
  isActive: boolean;
  config: RealtimeSubscriptionConfig;
  channel: any; // Supabase channel instance
  lastActivity?: Date;
  reconnectAttempts: number;
}

/**
 * Queued update with metadata for offline sync
 */
interface QueuedUpdate {
  activity: Activity;
  timestamp: Date;
  subscriptionId: string;
  type: 'INSERT' | 'UPDATE';
}

/**
 * Connection state with additional metadata
 */
interface ConnectionState {
  status: 'connected' | 'disconnected' | 'reconnecting';
  lastConnected?: Date;
  lastDisconnected?: Date;
  reconnectAttempts: number;
}

/**
 * Enhanced Real-time Manager implementation
 * Provides robust real-time subscription management with offline support
 */
export class RealtimeManager implements IRealtimeManager {
  private subscriptions = new Map<string, EnhancedSubscription>();
  private connectionState: ConnectionState = {
    status: 'disconnected',
    reconnectAttempts: 0
  };
  private pendingUpdates: QueuedUpdate[] = [];
  private maxReconnectAttempts = 10;
  private baseReconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private heartbeatInterval?: NodeJS.Timeout;
  private syncInProgress = false;

  constructor() {
    this.setupConnectionMonitoring();
    this.startHeartbeat();
  }

  /**
   * Subscribe to work order activity updates with enhanced error handling
   */
  subscribe(config: RealtimeSubscriptionConfig): RealtimeSubscription {
    const subscriptionId = `timeline_${config.workOrderId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`Creating enhanced timeline subscription for work order: ${config.workOrderId}`);

    try {
      const channel = supabase
        .channel(`work_order_activities:${config.workOrderId}:${subscriptionId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'work_order_activities',
            filter: `work_order_id=eq.${config.workOrderId}`
          },
          (payload) => {
            this.handleRealtimeUpdate(payload, 'INSERT', subscriptionId, config);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'work_order_activities',
            filter: `work_order_id=eq.${config.workOrderId}`
          },
          (payload) => {
            this.handleRealtimeUpdate(payload, 'UPDATE', subscriptionId, config);
          }
        )
        .subscribe((status) => {
          this.handleSubscriptionStatusChange(status, subscriptionId, config);
        });

      const subscription: EnhancedSubscription = {
        id: subscriptionId,
        workOrderId: config.workOrderId,
        config,
        channel,
        reconnectAttempts: 0,
        unsubscribe: () => {
          this.unsubscribeInternal(subscriptionId);
        },
        isActive: true
      };

      this.subscriptions.set(subscriptionId, subscription);
      
      console.log(`Timeline subscription created: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      console.error('Error creating timeline subscription:', error);
      
      if (config.onError) {
        config.onError(new Error(`Failed to create subscription: ${error}`));
      }
      
      // Return a dummy subscription that does nothing
      return {
        id: subscriptionId,
        workOrderId: config.workOrderId,
        unsubscribe: () => {},
        isActive: false
      };
    }
  }

  /**
   * Unsubscribe from updates with enhanced cleanup
   */
  unsubscribe(subscription: RealtimeSubscription): void {
    this.unsubscribeInternal(subscription.id);
  }

  /**
   * Internal unsubscribe method with comprehensive cleanup
   */
  private unsubscribeInternal(subscriptionId: string): void {
    console.log(`Unsubscribing timeline subscription: ${subscriptionId}`);
    
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      console.warn(`Subscription not found: ${subscriptionId}`);
      return;
    }

    try {
      // Unsubscribe from Supabase channel
      if (subscription.channel) {
        subscription.channel.unsubscribe();
      }
      
      // Mark as inactive
      subscription.isActive = false;
      
      // Remove from subscriptions map
      this.subscriptions.delete(subscriptionId);
      
      // Clean up any pending updates for this subscription
      this.pendingUpdates = this.pendingUpdates.filter(
        update => update.subscriptionId !== subscriptionId
      );
      
      console.log(`Timeline subscription cleaned up: ${subscriptionId}`);
    } catch (error) {
      console.error(`Error unsubscribing timeline subscription ${subscriptionId}:`, error);
    }
  }

  /**
   * Handle connection loss and recovery with enhanced state management
   */
  handleConnectionLoss(): void {
    console.log('Handling connection loss for timeline subscriptions');
    
    this.connectionState = {
      status: 'disconnected',
      lastDisconnected: new Date(),
      reconnectAttempts: this.connectionState.reconnectAttempts
    };
    
    // Notify all active subscriptions about connection loss
    this.subscriptions.forEach(subscription => {
      if (subscription.isActive && subscription.config.onConnectionChange) {
        try {
          subscription.config.onConnectionChange(false);
        } catch (error) {
          console.error('Error notifying connection change:', error);
        }
      }
    });
    
    // Start reconnection process
    this.scheduleReconnection();
  }

  /**
   * Enhanced sync for pending updates when connection is restored
   */
  async syncPendingUpdates(): Promise<void> {
    if (this.pendingUpdates.length === 0 || this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    console.log(`Syncing ${this.pendingUpdates.length} pending timeline updates`);

    try {
      // Sort updates by timestamp to maintain chronological order
      const sortedUpdates = [...this.pendingUpdates].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );

      // Process updates in batches to avoid overwhelming the UI
      const batchSize = 10;
      for (let i = 0; i < sortedUpdates.length; i += batchSize) {
        const batch = sortedUpdates.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (update) => {
          const subscription = this.subscriptions.get(update.subscriptionId);
          if (!subscription || !subscription.isActive) {
            return; // Skip if subscription no longer exists
          }

          try {
            if (update.type === 'INSERT' && subscription.config.onActivityAdded) {
              subscription.config.onActivityAdded(update.activity);
            } else if (update.type === 'UPDATE' && subscription.config.onActivityUpdated) {
              subscription.config.onActivityUpdated(update.activity);
            }
          } catch (error) {
            console.error('Error processing queued update:', error);
            
            if (subscription.config.onError) {
              subscription.config.onError(new Error(`Failed to process queued update: ${error}`));
            }
          }
        }));

        // Small delay between batches to prevent UI blocking
        if (i + batchSize < sortedUpdates.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Clear processed updates
      this.pendingUpdates = [];
      console.log('All pending timeline updates synced successfully');
      
    } catch (error) {
      console.error('Error syncing pending updates:', error);
      
      // Don't clear updates on error - they'll be retried on next sync
      // Notify subscriptions about sync error
      this.subscriptions.forEach(subscription => {
        if (subscription.isActive && subscription.config.onError) {
          subscription.config.onError(new Error(`Sync failed: ${error}`));
        }
      });
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Handle real-time update with enhanced error handling and queuing
   */
  private handleRealtimeUpdate(
    payload: any, 
    type: 'INSERT' | 'UPDATE', 
    subscriptionId: string, 
    config: RealtimeSubscriptionConfig
  ): void {
    try {
      console.log(`${type} activity received via real-time:`, payload);
      
      if (!payload.new) {
        console.warn('Received real-time update without new data:', payload);
        return;
      }

      const activity = payload.new as Activity;
      
      // Validate activity data
      if (!activity.id || !activity.work_order_id || !activity.activity_type) {
        console.warn('Received invalid activity data:', activity);
        return;
      }

      // Update subscription activity timestamp
      const subscription = this.subscriptions.get(subscriptionId);
      if (subscription) {
        subscription.lastActivity = new Date();
      }

      // Handle offline scenario - queue updates
      if (this.connectionState.status === 'disconnected') {
        const queuedUpdate: QueuedUpdate = {
          activity,
          timestamp: new Date(),
          subscriptionId,
          type
        };
        
        this.pendingUpdates.push(queuedUpdate);
        console.log(`Queued ${type} update for offline sync:`, activity.id);
        return;
      }

      // Process update immediately
      if (type === 'INSERT' && config.onActivityAdded) {
        config.onActivityAdded(activity);
      } else if (type === 'UPDATE' && config.onActivityUpdated) {
        config.onActivityUpdated(activity);
      }
      
    } catch (error) {
      console.error('Error handling real-time update:', error);
      
      if (config.onError) {
        config.onError(new Error(`Failed to process real-time update: ${error}`));
      }
    }
  }

  /**
   * Handle subscription status changes with enhanced reconnection logic
   */
  private handleSubscriptionStatusChange(
    status: string, 
    subscriptionId: string, 
    config: RealtimeSubscriptionConfig
  ): void {
    console.log(`Timeline subscription status for ${subscriptionId}:`, status);
    
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      console.warn(`Subscription not found for status change: ${subscriptionId}`);
      return;
    }

    try {
      switch (status) {
        case 'SUBSCRIBED':
          this.connectionState = {
            status: 'connected',
            lastConnected: new Date(),
            reconnectAttempts: 0
          };
          
          subscription.reconnectAttempts = 0;
          
          if (config.onConnectionChange) {
            config.onConnectionChange(true);
          }
          
          // Process any pending updates
          this.syncPendingUpdates();
          break;

        case 'CHANNEL_ERROR':
        case 'TIMED_OUT':
        case 'CLOSED':
          this.connectionState = {
            ...this.connectionState,
            status: 'disconnected',
            lastDisconnected: new Date()
          };
          
          if (config.onConnectionChange) {
            config.onConnectionChange(false);
          }
          
          if (config.onError) {
            config.onError(new Error(`Subscription error: ${status}`));
          }
          
          // Attempt reconnection for this specific subscription
          this.attemptSubscriptionReconnection(subscriptionId);
          break;

        case 'CONNECTING':
          this.connectionState = {
            ...this.connectionState,
            status: 'reconnecting'
          };
          break;

        default:
          console.log(`Unhandled subscription status: ${status}`);
      }
    } catch (error) {
      console.error('Error handling subscription status change:', error);
      
      if (config.onError) {
        config.onError(new Error(`Status change handler error: ${error}`));
      }
    }
  }

  /**
   * Enhanced connection monitoring with heartbeat
   */
  private setupConnectionMonitoring(): void {
    // Monitor online/offline status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('Network connection restored');
        this.connectionState = {
          ...this.connectionState,
          status: 'reconnecting'
        };
        this.reconnectAllSubscriptions();
      });

      window.addEventListener('offline', () => {
        console.log('Network connection lost');
        this.handleConnectionLoss();
      });

      // Monitor page visibility to pause/resume subscriptions
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          console.log('Page hidden - pausing real-time subscriptions');
          this.pauseSubscriptions();
        } else {
          console.log('Page visible - resuming real-time subscriptions');
          this.resumeSubscriptions();
        }
      });
    }
  }

  /**
   * Start heartbeat to monitor connection health
   */
  private startHeartbeat(): void {
    // Clear existing heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      this.checkConnectionHealth();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Check connection health and trigger reconnection if needed
   */
  private checkConnectionHealth(): void {
    const now = new Date();
    const activeSubscriptions = Array.from(this.subscriptions.values()).filter(sub => sub.isActive);
    
    if (activeSubscriptions.length === 0) {
      return; // No active subscriptions to check
    }

    // Check if any subscription has been inactive for too long
    const staleThreshold = 5 * 60 * 1000; // 5 minutes
    const staleSubscriptions = activeSubscriptions.filter(sub => {
      if (!sub.lastActivity) return false;
      return now.getTime() - sub.lastActivity.getTime() > staleThreshold;
    });

    if (staleSubscriptions.length > 0) {
      console.log(`Found ${staleSubscriptions.length} stale subscriptions, triggering health check`);
      
      // Attempt to reconnect stale subscriptions
      staleSubscriptions.forEach(sub => {
        this.attemptSubscriptionReconnection(sub.id);
      });
    }
  }

  /**
   * Pause subscriptions (e.g., when page is hidden)
   */
  private pauseSubscriptions(): void {
    // In a real implementation, you might want to pause subscriptions
    // to save resources when the page is not visible
    console.log('Pausing timeline subscriptions');
  }

  /**
   * Resume subscriptions (e.g., when page becomes visible)
   */
  private resumeSubscriptions(): void {
    console.log('Resuming timeline subscriptions');
    
    // Check if we need to reconnect any subscriptions
    const disconnectedSubscriptions = Array.from(this.subscriptions.values())
      .filter(sub => sub.isActive && this.connectionState.status === 'disconnected');
    
    if (disconnectedSubscriptions.length > 0) {
      this.reconnectAllSubscriptions();
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnection(): void {
    if (this.connectionState.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max global reconnection attempts reached');
      return;
    }

    this.connectionState.reconnectAttempts++;
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.connectionState.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(`Scheduling global reconnection attempt ${this.connectionState.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      if (this.connectionState.status === 'disconnected') {
        this.reconnectAllSubscriptions();
      }
    }, delay);
  }

  /**
   * Attempt to reconnect a specific subscription with enhanced logic
   */
  private attemptSubscriptionReconnection(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription || !subscription.isActive) {
      console.warn(`Cannot reconnect inactive subscription: ${subscriptionId}`);
      return;
    }

    if (subscription.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnection attempts reached for subscription: ${subscriptionId}`);
      
      // Mark subscription as inactive and notify
      subscription.isActive = false;
      if (subscription.config.onError) {
        subscription.config.onError(new Error('Max reconnection attempts reached'));
      }
      return;
    }

    subscription.reconnectAttempts++;
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, subscription.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(`Attempting subscription reconnection ${subscription.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms for ${subscriptionId}`);

    setTimeout(() => {
      if (!subscription.isActive) {
        return; // Subscription was unsubscribed
      }

      try {
        // Unsubscribe from old channel
        if (subscription.channel) {
          subscription.channel.unsubscribe();
        }

        // Create new subscription with same config
        const newSubscription = this.subscribe(subscription.config);
        
        // Update the subscription map with new subscription data
        const updatedSubscription: EnhancedSubscription = {
          ...subscription,
          channel: (newSubscription as any).channel,
          reconnectAttempts: subscription.reconnectAttempts
        };
        
        this.subscriptions.set(subscriptionId, updatedSubscription);
        
        console.log(`Subscription reconnected: ${subscriptionId}`);
      } catch (error) {
        console.error(`Failed to reconnect subscription ${subscriptionId}:`, error);
        
        if (subscription.config.onError) {
          subscription.config.onError(new Error(`Reconnection failed: ${error}`));
        }
        
        // Schedule another reconnection attempt
        this.attemptSubscriptionReconnection(subscriptionId);
      }
    }, delay);
  }

  /**
   * Enhanced reconnection for all active subscriptions
   */
  private reconnectAllSubscriptions(): void {
    console.log('Reconnecting all timeline subscriptions');
    
    const activeSubscriptions = Array.from(this.subscriptions.values())
      .filter(sub => sub.isActive);
    
    if (activeSubscriptions.length === 0) {
      console.log('No active subscriptions to reconnect');
      return;
    }

    this.connectionState = {
      ...this.connectionState,
      status: 'reconnecting'
    };

    // Reconnect each subscription with staggered timing to avoid overwhelming the server
    activeSubscriptions.forEach((subscription, index) => {
      setTimeout(() => {
        this.attemptSubscriptionReconnection(subscription.id);
      }, index * 1000); // Stagger by 1 second each
    });
  }

  /**
   * Get current connection state with detailed information
   */
  getConnectionState(): 'connected' | 'disconnected' | 'reconnecting' {
    return this.connectionState.status;
  }

  /**
   * Get detailed connection information
   */
  getConnectionInfo(): {
    status: 'connected' | 'disconnected' | 'reconnecting';
    lastConnected?: Date;
    lastDisconnected?: Date;
    reconnectAttempts: number;
    pendingUpdatesCount: number;
  } {
    return {
      status: this.connectionState.status,
      lastConnected: this.connectionState.lastConnected,
      lastDisconnected: this.connectionState.lastDisconnected,
      reconnectAttempts: this.connectionState.reconnectAttempts,
      pendingUpdatesCount: this.pendingUpdates.length
    };
  }

  /**
   * Get active subscriptions count
   */
  getActiveSubscriptionsCount(): number {
    return Array.from(this.subscriptions.values()).filter(sub => sub.isActive).length;
  }

  /**
   * Get detailed subscription information
   */
  getSubscriptionInfo(): Array<{
    id: string;
    workOrderId: string;
    isActive: boolean;
    reconnectAttempts: number;
    lastActivity?: Date;
  }> {
    return Array.from(this.subscriptions.values()).map(sub => ({
      id: sub.id,
      workOrderId: sub.workOrderId,
      isActive: sub.isActive,
      reconnectAttempts: sub.reconnectAttempts,
      lastActivity: sub.lastActivity
    }));
  }

  /**
   * Force sync of pending updates (useful for testing or manual recovery)
   */
  async forceSyncPendingUpdates(): Promise<void> {
    console.log('Force syncing pending updates');
    await this.syncPendingUpdates();
  }

  /**
   * Clear all pending updates (use with caution)
   */
  clearPendingUpdates(): void {
    console.log(`Clearing ${this.pendingUpdates.length} pending updates`);
    this.pendingUpdates = [];
  }

  /**
   * Enhanced cleanup with proper resource management
   */
  cleanup(): void {
    console.log('Cleaning up RealtimeManager resources');
    
    // Clear heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }

    // Unsubscribe from all subscriptions
    const subscriptionIds = Array.from(this.subscriptions.keys());
    subscriptionIds.forEach(id => {
      this.unsubscribeInternal(id);
    });
    
    // Clear all data
    this.subscriptions.clear();
    this.pendingUpdates = [];
    
    // Reset connection state
    this.connectionState = {
      status: 'disconnected',
      reconnectAttempts: 0
    };
    
    console.log('RealtimeManager cleanup completed');
  }

  /**
   * Health check for monitoring and debugging
   */
  healthCheck(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      connectionStatus: string;
      activeSubscriptions: number;
      pendingUpdates: number;
      reconnectAttempts: number;
      lastConnected?: string;
      lastDisconnected?: string;
    };
  } {
    const activeCount = this.getActiveSubscriptionsCount();
    const pendingCount = this.pendingUpdates.length;
    const reconnectAttempts = this.connectionState.reconnectAttempts;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (this.connectionState.status === 'disconnected' && activeCount > 0) {
      status = reconnectAttempts > 5 ? 'unhealthy' : 'degraded';
    } else if (pendingCount > 100) {
      status = 'degraded';
    }
    
    return {
      status,
      details: {
        connectionStatus: this.connectionState.status,
        activeSubscriptions: activeCount,
        pendingUpdates: pendingCount,
        reconnectAttempts,
        lastConnected: this.connectionState.lastConnected?.toISOString(),
        lastDisconnected: this.connectionState.lastDisconnected?.toISOString()
      }
    };
  }
}

// Export singleton instance
export const realtimeManager = new RealtimeManager();