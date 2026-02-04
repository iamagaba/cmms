/**
 * TimelineContainer Component Tests
 * Basic unit tests for the TimelineContainer component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TimelineContainer } from '../TimelineContainer';

// Mock the useTimeline hook
vi.mock('@/hooks/useTimeline', () => ({
  useTimeline: vi.fn(() => ({
    activities: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
    addNote: vi.fn(),
    updateFilters: vi.fn(),
    isConnected: false
  }))
}));

// Mock the activity type config
vi.mock('@/utils/activity-type-config', () => ({
  getActivityTypeConfig: vi.fn((type) => ({
    type,
    label: type.replace('_', ' '),
    icon: 'MessageSquare',
    color: 'text-gray-600',
    description: `${type} activity`
  }))
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('TimelineContainer', () => {
  const mockWorkOrderId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders timeline container with title', () => {
    renderWithQueryClient(
      <TimelineContainer workOrderId={mockWorkOrderId} />
    );

    expect(screen.getByText('Activity Timeline')).toBeInTheDocument();
  });

  it('shows empty state when no activities', () => {
    renderWithQueryClient(
      <TimelineContainer workOrderId={mockWorkOrderId} />
    );

    expect(screen.getByText('No activities yet')).toBeInTheDocument();
    expect(screen.getByText('0 activities')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = renderWithQueryClient(
      <TimelineContainer 
        workOrderId={mockWorkOrderId} 
        className="custom-timeline"
      />
    );

    expect(container.firstChild).toHaveClass('custom-timeline');
  });
});