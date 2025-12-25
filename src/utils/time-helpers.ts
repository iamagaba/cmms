// Utility to format elapsed minutes as a human-readable string (e.g., '2h 15m')
export function formatElapsed(minutes: number): string {
  if (minutes < 1) return 'just now';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}
