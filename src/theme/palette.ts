// Centralized brand palette

export const palette = {
  purple: {
    50: '#F8F5FC', 100: '#F1E6FB', 200: '#E3CCF7', 300: '#CAA3F0', 400: '#AD79E6',
    500: '#8D4FD6', 600: '#7838C7', 700: '#6A0DAD', 800: '#530A86', 900: '#3C0760',
  },
  pink: {
    50: '#FFF5F9', 100: '#FFE6F1', 200: '#FFC9E2', 300: '#FFA3CD', 400: '#FF7AB5',
    500: '#FF4D9B', 600: '#EB2F96', 700: '#D81B78', 800: '#B11260', 900: '#8A0C4A',
  },
  gray: {
    50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB', 400: '#9CA3AF',
    500: '#6B7280', 600: '#4B5563', 700: '#374151', 800: '#1F2937', 900: '#111827',
  },
} as const;

export type Shade = keyof typeof palette.purple; // 50..900

export const brand = {
  primary: palette.purple[700],
  primaryHover: palette.purple[600],
  primaryActive: palette.purple[800],
  secondary: palette.pink[700], // ensure contrast for text on solid
  secondaryHover: palette.pink[600],
  secondaryActive: palette.pink[800],
  bgSubtle: palette.gray[50],
  border: palette.gray[200],
  textPrimary: '#1f2937',
  textSecondary: '#6b7280',
};

export const dataVizColors = [
  palette.purple[600],  // Primary brand
  palette.pink[600],    // Secondary brand
  '#06B6D4',           // Cyan (modern teal)
  '#3B82F6',           // Blue
  '#F59E0B',           // Amber
  '#10B981',           // Emerald
  '#8B5CF6',           // Violet
  '#EC4899',           // Pink accent
  '#14B8A6',           // Teal
  '#F97316',           // Orange
] as const;

/**
 * Gets a consistent color for a data series by its index.
 * Cycles through the dataVizColors array if the index exceeds its length.
 * @param index - The index of the data series.
 * @returns A color hex string.
 */
export const getDataVizColor = (index: number): string => {
  return dataVizColors[index % dataVizColors.length];
};

// Legacy Ant Design theme configurations removed
// All theme configuration now handled by Mantine theme in src/theme/mantine.ts
