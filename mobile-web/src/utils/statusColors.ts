// Status colors matching main app exactly
export const STATUS_COLORS: Record<string, string> = {
  Open: '#2f54eb',
  Confirmation: '#13c2c2',
  Ready: '#8c8c8c',
  'In Progress': '#fa8c16',
  'On Hold': '#faad14',
  Completed: '#52c41a',
}

export const PRIORITY_COLORS: Record<string, string> = {
  High: '#ff4d4f',
  Medium: '#faad14',
  Low: '#52c41a',
}

export const getStatusColor = (status: string | null): string => {
  return STATUS_COLORS[status || ''] || STATUS_COLORS.Open
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
    case 'Open':
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