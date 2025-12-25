// Centralized brand palette
import { theme } from 'antd';

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
  palette.purple[700],
  palette.pink[700],
  '#14B8A6', // teal
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#10B981', // emerald
  '#EF4444', // red
  '#64748B', // slate
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

export const antdLightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: brand.primary,
    colorLink: brand.primary,
    colorInfo: '#14B8A6',
    colorBgLayout: palette.gray[50],
    colorBgContainer: '#ffffff',
    colorBorder: palette.gray[200],
    colorSplit: palette.gray[100],
    colorText: palette.gray[800],
    colorTextSecondary: palette.gray[600],
    colorTextTertiary: palette.gray[400],
    colorSurface: '#ffffff', // Base surface for cards, modals
    colorSurfaceSubtle: palette.gray[50], // For subtle backgrounds like table row stripes
    colorTextAction: brand.primary, // For text links
    colorTextActionHover: brand.primaryHover,
  },
  components: {
    Button: {
      colorPrimary: brand.primary,
      colorPrimaryHover: brand.primaryHover,
    },
  }
};

export const antdDarkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: palette.purple[400], // Use a lighter purple for accessibility on dark backgrounds
    colorLink: palette.purple[400],
    colorInfo: '#14B8A6',
    colorBgLayout: palette.gray[900],
    colorBgContainer: palette.gray[800],
    colorBorder: palette.gray[700],
    colorSplit: palette.gray[800],
    colorText: palette.gray[50],
    colorTextSecondary: palette.gray[300],
    colorTextTertiary: palette.gray[400],
    colorSurface: palette.gray[800],
    colorSurfaceSubtle: palette.gray[700],
    colorTextAction: palette.purple[400],
    colorTextActionHover: palette.purple[300],
  },
  components: {
    Button: {
      colorPrimary: palette.purple[400],
      colorPrimaryHover: palette.purple[300],
    },
  }
};
