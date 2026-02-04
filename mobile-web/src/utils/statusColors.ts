// Status colors matching desktop enterprise design system exactly
export const STATUS_COLORS: Record<string, string> = {
  New: '#0077ce',        // Steel Blue (Primary)
  Confirmation: '#0c96f1', // Light Steel Blue
  Ready: '#64748b',       // Slate Gray
  Scheduled: '#64748b',   // Slate Gray
  'In Progress': '#f97316', // Safety Orange
  'On Hold': '#eab308',   // Warning Yellow
  Completed: '#22c55e',   // Success Green
  Cancelled: '#ef4444',   // Error Red
}

export const PRIORITY_COLORS: Record<string, string> = {
  Critical: '#dc2626',    // Dark Red
  High: '#ea580c',        // Orange-Red
  Medium: '#ca8a04',      // Dark Yellow
  Low: '#64748b',         // Slate Gray
  Routine: '#16a34a',     // Dark Green
}

export const getStatusColor = (status: string | null): string => {
  return STATUS_COLORS[status || ''] || STATUS_COLORS.New
}

export const getPriorityColor = (priority: string | null): string => {
  return PRIORITY_COLORS[priority || ''] || PRIORITY_COLORS.Low
}

export function getStatusStyle(status: string) {
  const color = getStatusColor(status)
  return {
    backgroundColor: color,
    color: 'white',
  }
}

export function getPriorityStyle(priority: string) {
  const color = getPriorityColor(priority)
  return {
    backgroundColor: color,
    color: 'white',
  }
}

// CSS classes for styling
export function getStatusClass(status: string) {
  switch (status) {
    case 'New':
      return 'status-open'
    case 'Confirmation':
      return 'status-confirmation'
    case 'Ready':
      return 'status-ready'
    case 'In Progress':
      return 'status-progress'
    case 'On Hold':
      return 'status-hold'
    case 'Completed':
      return 'status-completed'
    default:
      return 'status-open'
  }
}

export function getPriorityClass(priority: string) {
  switch (priority) {
    case 'High':
      return 'priority-high'
    case 'Medium':
      return 'priority-medium'
    case 'Low':
      return 'priority-low'
    default:
      return 'priority-low'
  }
}