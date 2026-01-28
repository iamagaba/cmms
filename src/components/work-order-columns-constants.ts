// Required columns that are always visible and cannot be toggled off
export const REQUIRED_COLUMNS = ['workOrderNumber', 'vehicleCustomer', 'status', 'createdAt'];

// Optional columns that users can toggle on/off
export const OPTIONAL_COLUMNS = [
  { label: 'Issue', value: 'service' },
  { label: 'Priority', value: 'priority' },
  { label: 'Technician', value: 'technician' },
  { label: 'Scheduled Date', value: 'scheduledDate' },
  { label: 'Due Date', value: 'dueDate' },
  { label: 'Channel', value: 'channel' },
  { label: 'Customer', value: 'customerName' },
  { label: 'Location', value: 'location' },
];

// All columns (for reference)
export const ALL_COLUMNS = [
  { label: 'Work Order #', value: 'workOrderNumber', required: true },
  { label: 'Vehicle / Customer', value: 'vehicleCustomer', required: true },
  { label: 'Issue', value: 'service', required: false },
  { label: 'Status', value: 'status', required: true },
  { label: 'Priority', value: 'priority', required: false },
  { label: 'Technician', value: 'technician', required: false },
  { label: 'Created', value: 'createdAt', required: true },
  { label: 'Scheduled Date', value: 'scheduledDate', required: false },
  { label: 'Due Date', value: 'dueDate', required: false },
  { label: 'Channel', value: 'channel', required: false },
  { label: 'Customer', value: 'customerName', required: false },
  { label: 'Location', value: 'location', required: false },
];