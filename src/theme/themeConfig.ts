import { theme } from 'antd';
import type { ThemeConfig } from 'antd/es/config-provider/context';
import { palette, brand } from './palette';

// Color Palette
export const colors = {
  primary: brand.primary,
  success: '#52C41A',
  warning: '#FAAD14',
  error: '#FF4D4F',
  info: '#14B8A6',
  confirmation: '#13C2C2',
  text: {
    primary: brand.textPrimary,
    secondary: brand.textSecondary,
  },
  layout: {
    background: palette.gray[50],
    border: palette.gray[200],
    divider: palette.gray[100],
  },
};

// Custom token overrides
export const tokens = {
  // Font Sizes
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  // Heights
  heights: {
    cardBodyMin: 160,
  },
  // Line Heights
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  // Spacing
  spacing: {
    px: 1,
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
  },
};

// Professional theme configuration
export const themeConfig: ThemeConfig = {
  algorithm: [theme.defaultAlgorithm, theme.compactAlgorithm],
  token: {
    // Colors
    colorPrimary: colors.primary,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.error,
    colorInfo: colors.info,
    colorText: colors.text.primary,
    colorTextSecondary: colors.text.secondary,
    colorBgContainer: '#ffffff',
    colorBgLayout: colors.layout.background,
    colorBorder: colors.layout.border,
    colorBorderSecondary: colors.layout.divider,
    colorSplit: colors.layout.divider,

    // Typography
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: tokens.fontSizes.base,
    
    // Borders
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    borderRadiusXS: 2,
    
    // Sizes
    controlHeight: 36,
    controlHeightLG: 42,
    controlHeightSM: 30,
    
    // Misc
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    boxShadowSecondary: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  },
  components: {
    Table: {
      borderRadius: 8,
      padding: 12, // For default size, was tokens.spacing[4] (16px)
      paddingSM: 8, // For size="small"
      paddingContentHorizontalLG: tokens.spacing[6],
      paddingContentVerticalLG: tokens.spacing[4],
      headerBg: colors.layout.divider,
      headerColor: colors.text.primary,
      rowHoverBg: '#F9F0FF', // primary-light
      headerSplitColor: colors.layout.border,
      borderColor: colors.layout.border,
    },
    Form: {
      itemMarginBottom: tokens.spacing[4],
      marginLG: 16, // Reduce vertical margin between form items, was 24px
      labelColor: colors.text.primary,
    },
    Card: {
      borderRadius: 8,
      padding: tokens.spacing[6],
      paddingLG: 16, // Reduce padding inside cards, was 24px
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    },
    List: {
      // Reduce padding for list items
      padding: 12,
      paddingLG: 16,
    },
    Descriptions: {
      // Reduce the bottom padding for each item
      itemPaddingBottom: 8,
      // Reduce the default vertical padding in bordered mode
      padding: 8,
    },
    Button: {
      borderRadius: 6,
      controlHeight: 36,
      paddingContentHorizontal: tokens.spacing[4],
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#F9F0FF', // primary-light
      itemSelectedColor: colors.primary,
      itemHoverBg: colors.layout.divider,
      itemHoverColor: colors.primary,
      itemHeight: 40,
      itemBorderRadius: 6,
      itemMarginInline: tokens.spacing[2],
      itemPaddingInline: tokens.spacing[4],
    },
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 64,
      bodyBg: colors.layout.background,
      siderBg: '#ffffff',
      triggerBg: colors.layout.divider,
    },
    Typography: {
      fontWeightStrong: 600,
      titleMarginTop: tokens.spacing[4],
      titleMarginBottom: tokens.spacing[2],
    },
    Input: {
      borderRadius: 6,
      controlHeight: 36,
      paddingBlock: tokens.spacing[2],
      paddingInline: tokens.spacing[3],
    },
    Select: {
      borderRadius: 6,
      controlHeight: 36,
    },
    Dropdown: {
      borderRadius: 8,
      controlHeight: 36,
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    },
    Modal: {
      borderRadius: 12,
      headerBg: '#ffffff',
      titleColor: colors.text.primary,
      padding: tokens.spacing[6],
    },
    Drawer: {
      borderRadius: 0,
    },
    Message: {
      borderRadius: 8,
      contentPadding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
    },
    Notification: {
      borderRadius: 8,
      padding: tokens.spacing[4],
    },
    Tag: {
      borderRadius: 4,
      fontSize: tokens.fontSizes.sm,
      lineHeight: tokens.lineHeights.snug,
    }
  },
};