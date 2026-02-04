/**
 * RealtimeManager Tests
 * Tests for enhanced real-time subscription management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { RealtimeSubscriptionConfig, Activity } from '@/types/activity-timeline';

// Mock Supabase client before importing
vi.mock('@/integrations/supabase/client', () => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn()
  };

  return {
    supabase: {
      channel: vi.fn(() => mockChannel)
    }
  };
});

import { RealtimeManager } from '../realtime-manager';

describe('RealtimeManager', () => {
  let realtimeManager: RealtimeManager;
  let mockConfig: RealtimeSubscriptionConfig;
  let mockSupabase: any;
  let mockChannel: any;

  beforeEach(() => {
    // Get the mocked supabase instance
    const { supabase } = require('@/integrations/supabase/client');
    mockSupabase = supabase;
    mockChannel = mockSupabase.channel();
    
    realtimeManager = new RealtimeManager();
    mockConfig = {
      workOrderId: '123e4567-e89b-12d3-a456-426614174000',
      onActivityAdded: vi.fn(),
      onActivityUpdated: vi.fn(),
      onError: vi.fn(),
      onConnectionChange: vi.fn()
    };

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    realtimeManager.cleanup();
  });

  describe('Subscription Management', () => {
    it('should create a subscription successfully', () => {
      const subscription = realtimeManager.subscribe(mockConfig);

      expect(subscription).toBeDefined();
      expect(subscription.id).toMatch(/^timeline_/);
      expect(subscription.workOrderId).toBe(mockConfig.workOrderId);
      expect(subscription.isActive).toBe(true);
      expect(mockSupabase.channel).toHaveBeenCalled();
    });

    it('should track active subscriptions', () => {
      expect(realtimeManager.getActiveSubscriptionsCount()).toBe(0);

      const subscription1 = realtimeManager.subscribe(mockConfig);
      expect(realtimeManager.getActiveSubscriptionsCount()).toBe(1);

      const subscription2 = realtimeManager.subscribe({
        ...mockConfig,
        workOrderId: '456e7890-e89b-12d3-a456-426614174001'
      });
      expect(realtimeManager.getActiveSubscriptionsCount()).toBe(2);

      realtimeManager.unsubscribe(subscription1);
      expect(realtimeManager.getActiveSubscriptionsCount()).toBe(1);

      realtimeManager.unsubscribe(subscription2);
      expect(realtimeManager.getActiveSubscriptionsCount()).toBe(0);
    });

    it('should unsubscribe properly', () => {
      const subscription = realtimeManager.subscribe(mockConfig);
      expect(realtimeManager.getActiveSubscriptionsCount()).toBe(1);

      realtimeManager.unsubscribe(subscription);
      expect(realtimeManager.getActiveSubscriptionsCount()).toBe(0);
      expect(subscription.isActive).toBe(false);
      expect(mockChannel.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Connection State Management', () => {
    it('should start with disconnected state', () => {
      expect(realtimeManager.getConnectionState()).toBe('disconnected');
    });

    it('should provide detailed connection info', () => {
      const info = realtimeManager.getConnectionInfo();
      expect(info.status).toBe('disconnected');
      expect(info.reconnectAttempts).toBe(0);
      expect(info.pendingUpdatesCount).toBe(0);
    });

    it('should handle connection loss', () => {
      const subscription = realtimeManager.subscribe(mockConfig);
      
      realtimeManager.handleConnectionLoss();
      
      expect(realtimeManager.getConnectionState()).toBe('disconnected');
      expect(mockConfig.onConnectionChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Offline Update Queuing', () => {
    it('should queue updates when disconnected', async () => {
      const subscription = realtimeManager.subscribe(mockConfig);
      
      // Simulate disconnection
      realtimeManager.handleConnectionLoss();
      
      // Get the INSERT handler from the mock calls
      const insertHandler = mockChannel.on.mock.calls.find(
        call => call[1].event === 'INSERT'
      )?.[2];
      
      expect(insertHandler).toBeDefined();
      
      // Simulate receiving an update while disconnected
      const mockActivity: Activity = {
        id: 'activity-1',
        work_order_id: mockConfig.workOrderId,
        activity_type: 'note_added',
        title: 'Test Note',
        user_name: 'Test User',
        created_at: new Date().toISOString()
      };
      
      insertHandler?.({ new: mockActivity });
      
      // Should not call the callback immediately
      expect(mockConfig.onActivityAdded).not.toHaveBeenCalled();
      
      // Should have queued the update
      const info = realtimeManager.getConnectionInfo();
      expect(info.pendingUpdatesCount).toBe(1);
    });

    it('should sync pending updates when connection restored', async () => {
      const subscription = realtimeManager.subscribe(mockConfig);
      
      // Simulate disconnection and queue an update
      realtimeManager.handleConnectionLoss();
      
      const insertHandler = mockChannel.on.mock.calls.find(
        call => call[1].event === 'INSERT'
      )?.[2];
      
      const mockActivity: Activity = {
        id: 'activity-1',
        work_order_id: mockConfig.workOrderId,
        activity_type: 'note_added',
        title: 'Test Note',
        user_name: 'Test User',
        created_at: new Date().toISOString()
      };
      
      insertHandler?.({ new: mockActivity });
      
      // Force sync pending updates
      await realtimeManager.forceSyncPendingUpdates();
      
      // Should have processed the queued update
      expect(mockConfig.onActivityAdded).toHaveBeenCalledWith(mockActivity);
    });

    it('should clear pending updates', () => {
      // Add some pending updates first
      realtimeManager.handleConnectionLoss();
      
      const subscription = realtimeManager.subscribe(mockConfig);
      const insertHandler = mockChannel.on.mock.calls.find(
        call => call[1].event === 'INSERT'
      )?.[2];
      
      insertHandler?.({ 
        new: {
          id: 'activity-1',
          work_order_id: mockConfig.workOrderId,
          activity_type: 'note_added',
          title: 'Test Note',
          user_name: 'Test User',
          created_at: new Date().toISOString()
        }
      });
      
      expect(realtimeManager.getConnectionInfo().pendingUpdatesCount).toBe(1);
      
      realtimeManager.clearPendingUpdates();
      expect(realtimeManager.getConnectionInfo().pendingUpdatesCount).toBe(0);
    });
  });

  describe('Health Check', () => {
    it('should return healthy status with no active subscriptions', () => {
      const health = realtimeManager.healthCheck();
      expect(health.status).toBe('healthy');
      expect(health.details.activeSubscriptions).toBe(0);
      expect(health.details.pendingUpdates).toBe(0);
    });

    it('should return degraded status with many pending updates', () => {
      // Simulate many pending updates
      for (let i = 0; i < 150; i++) {
        (realtimeManager as any).pendingUpdates.push({
          activity: { id: `activity-${i}` },
          timestamp: new Date(),
          subscriptionId: 'test',
          type: 'INSERT'
        });
      }
      
      const health = realtimeManager.healthCheck();
      expect(health.status).toBe('degraded');
      expect(health.details.pendingUpdates).toBe(150);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup all resources', () => {
      const subscription1 = realtimeManager.subscribe(mockConfig);
      const subscription2 = realtimeManager.subscribe({
        ...mockConfig,
        workOrderId: '456e7890-e89b-12d3-a456-426614174001'
      });
      
      expect(realtimeManager.getActiveSubscriptionsCount()).toBe(2);
      
      realtimeManager.cleanup();
      
      expect(realtimeManager.getActiveSubscriptionsCount()).toBe(0);
      expect(realtimeManager.getConnectionState()).toBe('disconnected');
      expect(realtimeManager.getConnectionInfo().pendingUpdatesCount).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle subscription creation errors gracefully', () => {
      // Mock channel creation to throw an error
      mockSupabase.channel.mockImplementationOnce(() => {
        throw new Error('Channel creation failed');
      });
      
      const subscription = realtimeManager.subscribe(mockConfig);
      
      expect(subscription.isActive).toBe(false);
      expect(mockConfig.onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Failed to create subscription')
        })
      );
    });

    it('should handle invalid activity data', () => {
      const subscription = realtimeManager.subscribe(mockConfig);
      
      const insertHandler = mockChannel.on.mock.calls.find(
        call => call[1].event === 'INSERT'
      )?.[2];
      
      // Simulate invalid activity data
      insertHandler?.({ new: { invalid: 'data' } });
      
      // Should not call the callback with invalid data
      expect(mockConfig.onActivityAdded).not.toHaveBeenCalled();
    });
  });
});