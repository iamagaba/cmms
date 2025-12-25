// Shared mapping of work order status -> marker color
const STATUS_COLORS: Record<string, string> = {
  Open: '#2f54eb',
  Confirmation: '#13c2c2',
  Ready: '#8c8c8c',
  'In Progress': '#fa8c16',
  'On Hold': '#faad14',
  Completed: '#52c41a',
};

export default STATUS_COLORS;
