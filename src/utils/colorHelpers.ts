/**
 * Color utility functions for consistent theming across the app
 */

export const statusColors = {
  Open: '#1890ff',
  Confirmation: '#13c2c2',
  Ready: '#722ed1',
  'In Progress': '#faad14',
  'On Hold': '#fa8c16',
  Completed: '#52c41a',
} as const;

export const priorityColors = {
  High: '#ff4d4f',
  Medium: '#faad14',
  Low: '#52c41a',
} as const;

export const technicianStatusColors = {
  available: '#52c41a',
  busy: '#faad14',
  offline: '#d9d9d9',
  'on-break': '#fa8c16',
} as const;

/**
 * Get status color with fallback
 */
export function getStatusColor(status: string): string {
  return statusColors[status as keyof typeof statusColors] || '#1890ff';
}

/**
 * Get priority color with fallback
 */
export function getPriorityColor(priority: string): string {
  return priorityColors[priority as keyof typeof priorityColors] || '#52c41a';
}

/**
 * Get technician status color with fallback
 */
export function getTechnicianStatusColor(status: string): string {
  const normalizedStatus = status.toLowerCase();
  return technicianStatusColors[normalizedStatus as keyof typeof technicianStatusColors] || '#1890ff';
}

/**
 * Convert hex color to rgba with opacity
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get contrasting text color (white or black) based on background
 */
export function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
