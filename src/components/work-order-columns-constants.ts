// Required columns that are always visible and cannot be toggled off or reordered
export const REQUIRED_COLUMNS = ['workOrderNumber', 'service', 'status', 'location'];

// Optional columns that users can toggle on/off and reorder
export const OPTIONAL_COLUMNS = [
  { label: 'Priority', value: 'priority' },
  { label: 'SLA Status', value: 'sla' },
  { label: 'Technician', value: 'technician' },
  { label: 'Created', value: 'createdAt' },
  { label: 'Scheduled Date', value: 'scheduledDate' },
  { label: 'Due Date', value: 'dueDate' },
  { label: 'Channel', value: 'channel' },
  { label: 'Customer', value: 'customerName' },
];

// All columns (for reference)
export const ALL_COLUMNS = [
  { label: 'Work Order #', value: 'workOrderNumber', required: true },
  { label: 'Issue', value: 'service', required: true },
  { label: 'Status', value: 'status', required: true },
  { label: 'Location', value: 'location', required: true },
  { label: 'Priority', value: 'priority', required: false },
  { label: 'SLA Status', value: 'sla', required: false },
  { label: 'Technician', value: 'technician', required: false },
  { label: 'Created', value: 'createdAt', required: false },
  { label: 'Scheduled Date', value: 'scheduledDate', required: false },
  { label: 'Due Date', value: 'dueDate', required: false },
  { label: 'Channel', value: 'channel', required: false },
  { label: 'Customer', value: 'customerName', required: false },
];