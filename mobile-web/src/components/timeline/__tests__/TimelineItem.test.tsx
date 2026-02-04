import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TimelineItem } from '../TimelineItem'
import type { Activity } from '@/types/activity-timeline'

// Mock activity data for testing
const mockActivity: Activity = {
  id: '1',
  work_order_id: 'wo-123',
  activity_type: 'created',
  title: 'Work order created',
  description: 'New maintenance work order has been created for equipment inspection',
  user_id: 'user-1',
  user_name: 'John Doe',
  user_avatar: 'https://example.com/avatar.jpg',
  created_at: '2024-01-15T10:30:00Z',
  metadata: {
    work_order_number: 'WO-2024-001',
    priority: 'high',
    status: 'open'
  }
}

const mockActivityWithStatusChange: Activity = {
  id: '2',
  work_order_id: 'wo-123',
  activity_type: 'status_changed',
  title: 'Status updated',
  description: 'Work order status changed from Open to In Progress',
  user_id: 'user-2',
  user_name: 'Jane Smith',
  created_at: '2024-01-15T11:00:00Z',
  metadata: {
    previous_value: 'Open',
    new_value: 'In Progress'
  }
}

const mockActivityWithAssignment: Activity = {
  id: '3',
  work_order_id: 'wo-123',
  activity_type: 'assigned',
  title: 'Technician assigned',
  description: 'Work order assigned to maintenance technician',
  user_id: 'user-3',
  user_name: 'Mike Johnson',
  created_at: '2024-01-15T11:30:00Z',
  metadata: {
    assigned_to: 'Bob Wilson',
    assigned_by: 'Mike Johnson'
  }
}

describe('TimelineItem', () => {
  it('renders basic activity information correctly', () => {
    render(<TimelineItem activity={mockActivity} />)
    
    expect(screen.getByText('Work order created')).toBeInTheDocument()
    expect(screen.getByText('New maintenance work order has been created for equipment inspection')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Created')).toBeInTheDocument()
  })

  it('displays activity type icon and styling correctly', () => {
    render(<TimelineItem activity={mockActivity} />)
    
    // Check that the activity type indicator is present
    const indicator = screen.getByRole('button').querySelector('[class*="w-10 h-10"]')
    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveClass('bg-primary-100', 'border-primary-600')
  })

  it('shows formatted time and date correctly', () => {
    render(<TimelineItem activity={mockActivity} />)
    
    // Should show time in 12-hour format
    expect(screen.getByText(/10:30 AM/)).toBeInTheDocument()
    
    // Should show relative date
    const dateElement = screen.getByText(/Jan 15|Today|Yesterday/)
    expect(dateElement).toBeInTheDocument()
  })

  it('displays user avatar when provided', () => {
    render(<TimelineItem activity={mockActivity} />)
    
    const avatar = screen.getByAltText('John Doe')
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('shows user initials when no avatar is provided', () => {
    const activityWithoutAvatar = { ...mockActivity, user_avatar: undefined }
    render(<TimelineItem activity={activityWithoutAvatar} />)
    
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('displays work order metadata correctly', () => {
    render(<TimelineItem activity={mockActivity} showMetadata={true} />)
    
    expect(screen.getByText('Work Order:')).toBeInTheDocument()
    expect(screen.getByText('#WO-2024-001')).toBeInTheDocument()
  })

  it('shows status change metadata with proper styling', () => {
    render(<TimelineItem activity={mockActivityWithStatusChange} showMetadata={true} />)
    
    expect(screen.getByText('Status Change:')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('displays assignment metadata correctly', () => {
    render(<TimelineItem activity={mockActivityWithAssignment} showMetadata={true} />)
    
    expect(screen.getByText('Assignment:')).toBeInTheDocument()
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
    expect(screen.getByText('assigned by')).toBeInTheDocument()
    expect(screen.getByText('Mike Johnson')).toBeInTheDocument()
  })

  it('handles click events when onClick is provided', () => {
    const handleClick = vi.fn()
    render(<TimelineItem activity={mockActivity} onClick={handleClick} />)
    
    const timelineItem = screen.getByRole('button')
    fireEvent.click(timelineItem)
    
    expect(handleClick).toHaveBeenCalledWith(mockActivity)
  })

  it('handles keyboard navigation when onClick is provided', () => {
    const handleClick = vi.fn()
    render(<TimelineItem activity={mockActivity} onClick={handleClick} />)
    
    const timelineItem = screen.getByRole('button')
    
    // Test Enter key
    fireEvent.keyDown(timelineItem, { key: 'Enter' })
    expect(handleClick).toHaveBeenCalledWith(mockActivity)
    
    // Test Space key
    fireEvent.keyDown(timelineItem, { key: ' ' })
    expect(handleClick).toHaveBeenCalledTimes(2)
  })

  it('applies proper touch target sizing (min 44px height)', () => {
    render(<TimelineItem activity={mockActivity} />)
    
    const timelineItem = screen.getByRole('button')
    expect(timelineItem).toHaveClass('min-h-[60px]')
  })

  it('shows latest indicator when isLatest is true', () => {
    render(<TimelineItem activity={mockActivity} isLatest={true} />)
    
    const timelineItem = screen.getByRole('button')
    expect(timelineItem).toHaveClass('bg-primary-50', 'border-l-4', 'border-l-primary-600')
    
    // Check for the latest indicator dot
    const latestIndicator = timelineItem.querySelector('.absolute.-left-2')
    expect(latestIndicator).toBeInTheDocument()
  })

  it('applies industrial color system correctly', () => {
    render(<TimelineItem activity={mockActivity} />)
    
    // Check that primary colors (steel blue) are used
    const indicator = screen.getByRole('button').querySelector('[class*="border-primary-600"]')
    expect(indicator).toBeInTheDocument()
    
    // Check that the activity type badge uses the correct colors
    const badge = screen.getByText('Created')
    expect(badge).toHaveClass('bg-primary-100', 'text-primary-600')
  })

  it('hides metadata when showMetadata is false', () => {
    render(<TimelineItem activity={mockActivity} showMetadata={false} />)
    
    expect(screen.queryByText('Work Order:')).not.toBeInTheDocument()
    expect(screen.queryByText('#WO-2024-001')).not.toBeInTheDocument()
  })

  it('hides avatar when showAvatar is false', () => {
    render(<TimelineItem activity={mockActivity} showAvatar={false} />)
    
    expect(screen.queryByAltText('John Doe')).not.toBeInTheDocument()
    expect(screen.queryByText('J')).not.toBeInTheDocument()
  })

  it('applies custom className correctly', () => {
    render(<TimelineItem activity={mockActivity} className="custom-class" />)
    
    const timelineItem = screen.getByRole('button')
    expect(timelineItem).toHaveClass('custom-class')
  })

  it('provides proper accessibility attributes', () => {
    const handleClick = vi.fn()
    render(<TimelineItem activity={mockActivity} onClick={handleClick} />)
    
    const timelineItem = screen.getByRole('button')
    expect(timelineItem).toHaveAttribute('tabIndex', '0')
    expect(timelineItem).toHaveAttribute('aria-label', 'View details for Work order created')
  })

  it('does not have interactive attributes when onClick is not provided', () => {
    render(<TimelineItem activity={mockActivity} />)
    
    const container = screen.getByText('Work order created').closest('div')
    expect(container).not.toHaveAttribute('role')
    expect(container).not.toHaveAttribute('tabIndex')
    expect(container).not.toHaveAttribute('aria-label')
  })
})