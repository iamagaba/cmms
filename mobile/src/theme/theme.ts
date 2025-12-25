import {MD3LightTheme, configureFonts} from 'react-native-paper';

const fontConfig = {
  web: {
    regular: {
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'normal' as const,
    },
    medium: {
      fontFamily: 'Inter, sans-serif',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'Inter, sans-serif',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'Inter, sans-serif',
      fontWeight: '100' as const,
    },
  },
  ios: {
    regular: {
      fontFamily: 'System',
      fontWeight: 'normal' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100' as const,
    },
  },
  android: {
    regular: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: 'normal' as const,
    },
    medium: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: '100' as const,
    },
  },
};

export const theme = {
  ...MD3LightTheme,
  fonts: configureFonts({config: fontConfig}),
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6A0DAD', // Purple brand color from web app
    primaryContainer: '#E8D5F2',
    secondary: '#625B71',
    secondaryContainer: '#E8DEF8',
    tertiary: '#7D5260',
    tertiaryContainer: '#FFD8E4',
    surface: '#FFFBFE',
    surfaceVariant: '#E7E0EC',
    background: '#FFFBFE',
    error: '#BA1A1A',
    errorContainer: '#FFDAD6',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#21005D',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#1D192B',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#31111D',
    onSurface: '#1C1B1F',
    onSurfaceVariant: '#49454F',
    onError: '#FFFFFF',
    onErrorContainer: '#410E0B',
    onBackground: '#1C1B1F',
    outline: '#79747E',
    outlineVariant: '#CAC4D0',
    inverseSurface: '#313033',
    inverseOnSurface: '#F4EFF4',
    inversePrimary: '#D0BCFF',
    shadow: '#000000',
    scrim: '#000000',
    surfaceDisabled: 'rgba(28, 27, 31, 0.12)',
    onSurfaceDisabled: 'rgba(28, 27, 31, 0.38)',
    backdrop: 'rgba(73, 69, 79, 0.4)',
  },
};