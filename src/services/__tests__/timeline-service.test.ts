/**
 * Timeline Service Tests
 * Tests for the enhanced TimelineService with validation and error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TimelineService, ValidationError, DatabaseError, TimelineServiceError } from '../timeline-service';
import type { TimelineFilters, CreateActivityInput } from '@/types/activity-timeline';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              data: [],
              error: null
            }))
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: 'test-id',
              work_order_id: 'test-work-order-id',
              activity_type: 'note_added',
              title: 'Note added',
              description: 'Test note',
              user_name: 'Test User',
              created_at: new Date().toISOString()
            },
            error: null
          }))
        }))
      }))
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        on: vi.fn(() => ({
          subscribe: vi.fn(() => ({
            unsubscribe: vi.fn()
          }))
        }))
      }))
    }))
  }
}));

describe('TimelineService', () => {
  let timelineService: TimelineService;

  beforeEach(() => {
    timelineService = new TimelineService();
    vi.clearAllMocks();
  });

  describe('Input Validation', () => {
    describe('validateWorkOrderId', () => {
      it('should throw ValidationError for invalid work order ID', async () => {
        await expect(timelineService.getActivities('')).rejects.toThrow(ValidationError);
        await expect(timelineService.getActivities('invalid-uuid')).rejects.toThrow(ValidationError);
        await expect(timelineService.getActivities('123')).rejects.toThrow(ValidationError);
      });

      it('should accept valid UUID work order ID', async () => {
        const validUuid = '123e4567-e89b-12d3-a456-426614174000';
        // Should not throw for valid UUID
        await expect(timelineService.getActivities(validUuid)).resolves.toBeDefined();
      });
    });

    describe('validateNoteContent', () => {
      const validWorkOrderId = '123e4567-e89b-12d3-a456-426614174000';
      const validUserId = '123e4567-e89b-12d3-a456-426614174001';

      it('should throw ValidationError for empty note content', async () => {
        await expect(timelineService.addNote(validWorkOrderId, '', validUserId)).rejects.toThrow(ValidationError);
        await expect(timelineService.addNote(validWorkOrderId, '   ', validUserId)).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError for note content exceeding limit', async () => {
        const longContent = 'a'.repeat(10001);
        await expect(timelineService.addNote(validWorkOrderId, longContent, validUserId)).rejects.toThrow(ValidationError);
      });

      it('should accept valid note content', async () => {
        const validContent = 'This is a valid note content';
        // Mock successful responses for this test
        const mockSupabase = await import('@/integrations/supabase/client');
        vi.mocked(mockSupabase.supabase.from).mockReturnValue({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: { id: validWorkOrderId },
                error: null
              }))
            }))
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
                data: {
                  id: 'test-activity-id',
                  work_order_id: validWorkOrderId,
                  activity_type: 'note_added',
                  title: 'Note added',
                  description: validContent,
                  user_name: 'Test User',
                  created_at: new Date().toISOString()
                },
                error: null
              }))
            }))
          }))
        } as any);

        await expect(timelineService.addNote(validWorkOrderId, validContent, validUserId)).resolves.toBeDefined();
      });
    });

    describe('validateTimelineFilters', () => {
      const validWorkOrderId = '123e4567-e89b-12d3-a456-426614174000';

      it('should throw ValidationError for invalid date range', async () => {
        const invalidFilters: TimelineFilters = {
          dateRange: {
            start: new Date('2024-01-02'),
            end: new Date('2024-01-01') // End before start
          }
        };
        await expect(timelineService.getActivities(validWorkOrderId, invalidFilters)).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError for future start date', async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        
        const invalidFilters: TimelineFilters = {
          dateRange: {
            start: futureDate,
            end: new Date()
          }
        };
        await expect(timelineService.getActivities(validWorkOrderId, invalidFilters)).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError for invalid activity types', async () => {
        const invalidFilters: TimelineFilters = {
          activityTypes: ['invalid_type' as any]
        };
        await expect(timelineService.getActivities(validWorkOrderId, invalidFilters)).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError for invalid pagination', async () => {
        const invalidFilters: TimelineFilters = {
          limit: -1
        };
        await expect(timelineService.getActivities(validWorkOrderId, invalidFilters)).rejects.toThrow(ValidationError);

        const invalidFilters2: TimelineFilters = {
          limit: 1001 // Exceeds maximum
        };
        await expect(timelineService.getActivities(validWorkOrderId, invalidFilters2)).rejects.toThrow(ValidationError);

        const invalidFilters3: TimelineFilters = {
          offset: -1
        };
        await expect(timelineService.getActivities(validWorkOrderId, invalidFilters3)).rejects.toThrow(ValidationError);
      });

      it('should accept valid filters', async () => {
        const validFilters: TimelineFilters = {
          dateRange: {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-02')
          },
          activityTypes: ['created', 'note_added'],
          technicianIds: ['123e4567-e89b-12d3-a456-426614174001'],
          searchQuery: 'test search',
          limit: 50,
          offset: 0
        };
        await expect(timelineService.getActivities(validWorkOrderId, validFilters)).resolves.toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                data: null,
                error: { message: 'Database connection failed' }
              }))
            }))
          }))
        }))
      } as any);

      const validWorkOrderId = '123e4567-e89b-12d3-a456-426614174000';
      await expect(timelineService.getActivities(validWorkOrderId)).rejects.toThrow(DatabaseError);
    });

    it('should handle unexpected errors', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      vi.mocked(mockSupabase.supabase.from).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const validWorkOrderId = '123e4567-e89b-12d3-a456-426614174000';
      await expect(timelineService.getActivities(validWorkOrderId)).rejects.toThrow(TimelineServiceError);
    });
  });

  describe('Data Processing', () => {
    it('should apply default limit when no filters provided', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      const mockLimit = vi.fn(() => ({
        data: [],
        error: null
      }));
      
      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: mockLimit
            }))
          }))
        }))
      } as any);

      const validWorkOrderId = '123e4567-e89b-12d3-a456-426614174000';
      await timelineService.getActivities(validWorkOrderId);
      
      expect(mockLimit).toHaveBeenCalledWith(50);
    });

    it('should escape SQL wildcards in search queries', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      const mockOr = vi.fn(() => ({
        limit: vi.fn(() => ({
          data: [],
          error: null
        }))
      }));
      
      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              or: mockOr
            }))
          }))
        }))
      } as any);

      const validWorkOrderId = '123e4567-e89b-12d3-a456-426614174000';
      const filters: TimelineFilters = {
        searchQuery: 'test%_search'
      };
      
      await timelineService.getActivities(validWorkOrderId, filters);
      
      // Should escape % and _ characters
      expect(mockOr).toHaveBeenCalledWith('title.ilike.%test\\%\\_search%,description.ilike.%test\\%\\_search%');
    });
  });

  describe('Health Check', () => {
    it('should return healthy status when database is accessible', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      } as any);

      const health = await timelineService.healthCheck();
      expect(health.status).toBe('healthy');
      expect(health.details.databaseConnection).toBe(true);
      expect(health.details.realtimeAvailable).toBe(true);
    });

    it('should return unhealthy status when database is not accessible', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: null,
            error: { message: 'Connection failed' }
          }))
        }))
      } as any);

      const health = await timelineService.healthCheck();
      expect(health.status).toBe('unhealthy');
      expect(health.details.databaseConnection).toBe(false);
    });
  });
});