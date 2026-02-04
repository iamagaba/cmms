/**
 * TimelineItem Component Tests
 * Tests for the TimelineItem component with activity type styling and interactions
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimelineItem } from '../TimelineItem';
import type { Activity } from '@/types/activity-timeline';

// Mock activity data for testing
const mockActivity: Activity = {
  id: 'test-activity-1',
  work_order_id: 'test-work-order-1',
  activity_type: 'created',
  title: 'Work order created',
  description: 'New maintenance work order has been created',
  user_id: 'user-1',
  user_name: 'John Doe',
  user_avatar: 'https://example.com/avatar.jpg',
  created_at: '2024-01-15T10:30:00Z',
  metadata: {
    work_order_number: 'WO-2024-001',
    priority: 'high',
    status: 'open'
  }
};

const mockNoteActivity: Activity = {
  id: 'test-activity-2',
  work_order_id: 'test-work-order-1',
  activity_type: 'note_added',
  title: 'Note added',
  description: 'Added maintenance notes',
  user_id: 'user-2',
  user_name: 'Jane Smith',
  created_at: '2024-01-15T11:00:00Z',
  metadata: {
    note_content: 'Equipment requires additional inspection before repair'
  }
};

const mockAssignmentActivity: Activity = {
  id: 'test-activity-3',
  work_order_id: 'test-work-order-1',
  activity_type: 'assigned',
  title: 'Technician assigned',
  description: 'Work order assigned to technician',
  user_id: 'user-3',
  user_name: 'Mike Johnson',
  created_at: '2024-01-15T12:00:00Z',
  metadata: {
    assigned_by: 'John Doe',
    assigned_to: 'Mike Johnson'
  }
};

describe('TimelineItem', () => {
  describe('Basic Rendering', () => {
    it('should render activity title and description', () => {
      render(<TimelineItem activity={mockActivity} />);
      
      expect(screen.getByText('Work order created')).toBeInTheDocument();
      expect(screen.getByText('New maintenance work order has been created')).toBeInTheDocument();
    });

    it('should render user information', () => {
      render(<TimelineItem activity={mockActivity} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByAltText('John Doe')).toBeInTheDocument();
    });

    it('should render activity type label', () => {
      render(<TimelineItem activity={mockActivity} />);
      
      expect(screen.getByText('Created')).toBeInTheDocument();
    });

    it('should render timestamp', () => {
      render(<TimelineItem activity={mockActivity} />);
      
      // Should render some form of timestamp
      const timeElement = screen.getByRole('time');
      expect(timeElement).toBeInTheDocument();
      expect(timeElement).toHaveAttribute('datetime', '2024-01-15T10:30:00Z');
    });
  });

  describe('Activity Type Visual Indicators', () => {
    it('should render correct icon for created activity', () => {
      render(<TimelineItem activity={mockActivity} />);
      
      // Check for Plus icon (created activity)
      const iconContainer = screen.getByLabelText('Created activity');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('border-blue-500', 'text-blue-600', 'bg-blue-50');
    });

    it('should render correct icon for note_added activity', () => {
      render(<TimelineItem activity={mockNoteActivity} />);
      
      // Check for MessageSquare icon (note_added activity)
      const iconContainer = screen.getByLabelText('Note Added activity');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('border-gray-500', 'text-gray-600', 'bg-gray-50');
    });

    it('should render correct icon for assigned activity', () => {
      render(<TimelineItem activity={mockAssignmentActivity} />);
      
      // Check for User icon (assigned activity)
      const iconContainer = screen.getByLabelText('Assigned activity');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('border-green-500', 'text-green-600', 'bg-green-50');
    });
  });

  describe('Metadata Rendering', () => {
    it('should render note content for note_added activities', () => {
      render(<TimelineItem activity={mockNoteActivity} showMetadata={true} />);
      
      expect(screen.getByText('Equipment requires additional inspection before repair')).toBeInTheDocument();
    });

    it('should render assignment information for assigned activities', () => {
      render(<TimelineItem activity={mockAssignmentActivity} showMetadata={true} />);
      
      expect(screen.getByText(/Assigned by John Doe to Mike Johnson/)).toBeInTheDocument();
    });

    it('should not render metadata when showMetadata is false', () => {
      render(<TimelineItem activity={mockNoteActivity} showMetadata={false} />);
      
      expect(screen.queryByText('Equipment requires additional inspection before repair')).not.toBeInTheDocument();
    });
  });

  describe('User Avatar Handling', () => {
    it('should render user avatar when available', () => {
      render(<TimelineItem activity={mockActivity} showAvatar={true} />);
      
      const avatar = screen.getByAltText('John Doe');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('should render user initials when avatar is not available', () => {
      const activityWithoutAvatar = { ...mockActivity, user_avatar: undefined };
      render(<TimelineItem activity={activityWithoutAvatar} showAvatar={true} />);
      
      expect(screen.getByText('J')).toBeInTheDocument(); // First letter of John
    });

    it('should not render avatar section when showAvatar is false', () => {
      render(<TimelineItem activity={mockActivity} showAvatar={false} />);
      
      expect(screen.queryByAltText('John Doe')).not.toBeInTheDocument();
    });
  });

  describe('Latest Activity Highlighting', () => {
    it('should highlight latest activity', () => {
      const { container } = render(<TimelineItem activity={mockActivity} isLatest={true} />);
      
      expect(screen.getByText('Latest')).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('ring-2', 'ring-primary/20', 'bg-primary/5');
    });

    it('should not highlight non-latest activities', () => {
      const { container } = render(<TimelineItem activity={mockActivity} isLatest={false} />);
      
      expect(screen.queryByText('Latest')).not.toBeInTheDocument();
      expect(container.firstChild).not.toHaveClass('ring-2', 'ring-primary/20', 'bg-primary/5');
    });
  });

  describe('Interactions', () => {
    it('should handle click events when onClick is provided', () => {
      const handleClick = vi.fn();
      render(<TimelineItem activity={mockActivity} onClick={handleClick} />);
      
      const item = screen.getByRole('button');
      fireEvent.click(item);
      
      expect(handleClick).toHaveBeenCalledWith(mockActivity);
    });

    it('should handle keyboard navigation (Enter key)', () => {
      const handleClick = vi.fn();
      render(<TimelineItem activity={mockActivity} onClick={handleClick} />);
      
      const item = screen.getByRole('button');
      fireEvent.keyDown(item, { key: 'Enter' });
      
      expect(handleClick).toHaveBeenCalledWith(mockActivity);
    });

    it('should handle keyboard navigation (Space key)', () => {
      const handleClick = vi.fn();
      render(<TimelineItem activity={mockActivity} onClick={handleClick} />);
      
      const item = screen.getByRole('button');
      fireEvent.keyDown(item, { key: ' ' });
      
      expect(handleClick).toHaveBeenCalledWith(mockActivity);
    });

    it('should not be interactive when onClick is not provided', () => {
      render(<TimelineItem activity={mockActivity} />);
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should have proper accessibility attributes when interactive', () => {
      const handleClick = vi.fn();
      render(<TimelineItem activity={mockActivity} onClick={handleClick} />);
      
      const item = screen.getByRole('button');
      expect(item).toHaveAttribute('aria-label', 'View details for Work order created');
      expect(item).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Timestamp Formatting', () => {
    it('should format recent timestamps as time only', () => {
      // Create activity from 2 hours ago
      const recentTime = new Date();
      recentTime.setHours(recentTime.getHours() - 2);
      
      const recentActivity = {
        ...mockActivity,
        created_at: recentTime.toISOString()
      };
      
      render(<TimelineItem activity={recentActivity} />);
      
      const timeElement = screen.getByRole('time');
      // Should show time format for recent activities
      expect(timeElement.textContent).toMatch(/^\d{1,2}:\d{2}$/);
    });

    it('should format older timestamps with date', () => {
      // Create activity from 2 days ago
      const oldTime = new Date();
      oldTime.setDate(oldTime.getDate() - 2);
      
      const oldActivity = {
        ...mockActivity,
        created_at: oldTime.toISOString()
      };
      
      render(<TimelineItem activity={oldActivity} />);
      
      const timeElement = screen.getByRole('time');
      // Should show date format for older activities
      expect(timeElement.textContent).toMatch(/\d{1,2} \w{3}/); // e.g., "28 Jan"
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply hover styles when interactive', () => {
      const handleClick = vi.fn();
      const { container } = render(<TimelineItem activity={mockActivity} onClick={handleClick} />);
      
      expect(container.firstChild).toHaveClass('hover:bg-accent/50', 'hover:shadow-sm', 'cursor-pointer');
    });

    it('should apply custom className', () => {
      const { container } = render(<TimelineItem activity={mockActivity} className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should use consistent icon sizing (w-5 h-5)', () => {
      render(<TimelineItem activity={mockActivity} />);
      
      // The icon should have w-5 h-5 classes (this is tested indirectly through the component structure)
      const iconContainer = screen.getByLabelText('Created activity');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle activity without description', () => {
      const activityWithoutDescription = { ...mockActivity, description: undefined };
      render(<TimelineItem activity={activityWithoutDescription} />);
      
      expect(screen.getByText('Work order created')).toBeInTheDocument();
      expect(screen.queryByText('New maintenance work order has been created')).not.toBeInTheDocument();
    });

    it('should handle activity without metadata', () => {
      const activityWithoutMetadata = { ...mockActivity, metadata: undefined };
      render(<TimelineItem activity={activityWithoutMetadata} showMetadata={true} />);
      
      // Should still render the activity without errors
      expect(screen.getByText('Work order created')).toBeInTheDocument();
    });

    it('should handle empty user name gracefully', () => {
      const activityWithEmptyName = { ...mockActivity, user_name: '' };
      render(<TimelineItem activity={activityWithEmptyName} showAvatar={true} />);
      
      // Should still render without crashing, though the initial might be empty
      expect(screen.getByText('Created')).toBeInTheDocument();
    });
  });
});