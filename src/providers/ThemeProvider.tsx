/**
 * Professional Theme Provider
 * 
 * A comprehensive theme system for the GOGO CMMS desktop application.
 * Provides theme switching, persistence, and CSS custom property management
 * for dynamic theming across the entire application.
 * 
 * Features:
 * - Light/Dark mode switching
 * - Density options (compact, comfortable, spacious)
 * - Brand color customization
 * - CSS custom property integration
 * - Local storage persistence
 * - Theme validation and fallbacks
 * - Accessibility support
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { designTokens, applyThemeConfig, type ThemeConfig, defaultThemeConfig } from '@/theme/professional-design-tokens';

// ============================================
// THEME CONTEXT TYPES
// ============================================

export interface ThemeContextValue {
  // Current theme configuration
  theme: ThemeConfig;
  
  // Theme switching methods
  setTheme: (theme: Partial<ThemeConfig>) => void;
  toggleMode: () => void;
  setMode: (mode: 'light' | 'dark') => void;
  setDensity: (density: 'compact' | 'comfortable' | 'spacious') => void;
  setPrimaryColor: (color: keyof typeof designTokens.colors) => void;
  setBorderRadius: (radius: 'sharp' | 'rounded' | 'soft') => void;
  
  // Theme utilities
  resetTheme: () => void;
  isSystemDarkMode: boolean;
  
  // CSS custom properties
  cssVariables: Record<string, string>;
  
  // Theme state
  isLoading: boolean;
}

// ============================================
// THEME CONTEXT
// ============================================

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ============================================
// THEME STORAGE UTILITIES
// ============================================

const THEME_STORAGE_KEY = 'gogo-cmms-theme';

const saveThemeToStorage = (theme: ThemeConfig): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error);
  }
};

const loadThemeFromStorage = (): Partial<ThemeConfig> | null => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate the stored theme
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to load theme from localStorage:', error);
  }
  return null;
};

// ============================================
// CSS CUSTOM PROPERTIES UTILITIES
// ============================================

const generateCSSVariables = (theme: ThemeConfig): Record<string, string> => {
  const themedTokens = applyThemeConfig(theme);
  const variables: Record<string, string> = {};
  
  // Generate CSS custom properties for colors
  Object.entries(themedTokens.colors).forEach(([colorName, colorScale]) => {
    if (typeof colorScale === 'object') {
      Object.entries(colorScale).forEach(([shade, value]) => {
        variables[`--color-${colorName}-${shade}`] = value;
      });
    } else {
      variables[`--color-${colorName}`] = colorScale;
    }
  });
  
  // Generate CSS custom properties for spacing
  Object.entries(themedTokens.spacing).forEach(([key, value]) => {
    variables[`--spacing-${key}`] = value;
  });
  
  // Generate CSS custom properties for typography
  Object.entries(themedTokens.typography.fontSizes).forEach(([size, value]) => {
    variables[`--font-size-${size}`] = value;
  });
  
  Object.entries(themedTokens.typography.lineHeights).forEach(([size, value]) => {
    variables[`--line-height-${size}`] = value;
  });
  
  // Generate CSS custom properties for effects
  Object.entries(themedTokens.effects.shadows).forEach(([level, value]) => {
    variables[`--shadow-${level}`] = value;
  });
  
  Object.entries(themedTokens.effects.borderRadius).forEach(([size, value]) => {
    variables[`--radius-${size}`] = value;
  });
  
  // Theme-specific variables
  variables['--theme-mode'] = theme.mode;
  variables['--theme-density'] = theme.density;
  variables['--theme-primary-color'] = theme.primaryColor;
  variables['--theme-border-radius'] = theme.borderRadius;
  
  return variables;
};

const applyCSSVariables = (variables: Record<string, string>): void => {
  const root = document.documentElement;
  
  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};

// ============================================
// SYSTEM THEME DETECTION
// ============================================

const useSystemTheme = (): boolean => {
  const [isSystemDarkMode, setIsSystemDarkMode] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isSystemDarkMode;
};

// ============================================
// THEME PROVIDER COMPONENT
// ============================================

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Partial<ThemeConfig>;
  enableSystemTheme?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = {},
  enableSystemTheme = true,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setThemeState] = useState<ThemeConfig>(defaultThemeConfig);
  const isSystemDarkMode = useSystemTheme();

  // Initialize theme from storage or defaults
  useEffect(() => {
    const initializeTheme = () => {
      const storedTheme = loadThemeFromStorage();
      const initialTheme: ThemeConfig = {
        ...defaultThemeConfig,
        ...defaultTheme,
        ...storedTheme,
      };

      // Apply system theme if enabled and no stored mode preference
      if (enableSystemTheme && !storedTheme?.mode) {
        initialTheme.mode = isSystemDarkMode ? 'dark' : 'light';
      }

      setThemeState(initialTheme);
      setIsLoading(false);
    };

    // Small delay to prevent flash of unstyled content
    const timer = setTimeout(initializeTheme, 50);
    return () => clearTimeout(timer);
  }, [defaultTheme, enableSystemTheme, isSystemDarkMode]);

  // Generate CSS variables
  const cssVariables = useMemo(() => generateCSSVariables(theme), [theme]);

  // Apply CSS variables to document
  useEffect(() => {
    if (!isLoading) {
      applyCSSVariables(cssVariables);
      
      // Add theme class to body for CSS targeting
      document.body.className = document.body.className
        .replace(/theme-\w+/g, '')
        .concat(` theme-${theme.mode} density-${theme.density} radius-${theme.borderRadius}`)
        .trim();
    }
  }, [cssVariables, theme, isLoading]);

  // Theme manipulation methods
  const setTheme = useCallback((newTheme: Partial<ThemeConfig>) => {
    setThemeState(current => {
      const updated = { ...current, ...newTheme };
      saveThemeToStorage(updated);
      return updated;
    });
  }, []);

  const toggleMode = useCallback(() => {
    setTheme({ mode: theme.mode === 'light' ? 'dark' : 'light' });
  }, [theme.mode, setTheme]);

  const setMode = useCallback((mode: 'light' | 'dark') => {
    setTheme({ mode });
  }, [setTheme]);

  const setDensity = useCallback((density: 'compact' | 'comfortable' | 'spacious') => {
    setTheme({ density });
  }, [setTheme]);

  const setPrimaryColor = useCallback((primaryColor: keyof typeof designTokens.colors) => {
    setTheme({ primaryColor });
  }, [setTheme]);

  const setBorderRadius = useCallback((borderRadius: 'sharp' | 'rounded' | 'soft') => {
    setTheme({ borderRadius });
  }, [setTheme]);

  const resetTheme = useCallback(() => {
    const resetConfig = { ...defaultThemeConfig, ...defaultTheme };
    setThemeState(resetConfig);
    saveThemeToStorage(resetConfig);
  }, [defaultTheme]);

  // Context value
  const contextValue: ThemeContextValue = useMemo(() => ({
    theme,
    setTheme,
    toggleMode,
    setMode,
    setDensity,
    setPrimaryColor,
    setBorderRadius,
    resetTheme,
    isSystemDarkMode,
    cssVariables,
    isLoading,
  }), [
    theme,
    setTheme,
    toggleMode,
    setMode,
    setDensity,
    setPrimaryColor,
    setBorderRadius,
    resetTheme,
    isSystemDarkMode,
    cssVariables,
    isLoading,
  ]);

  // Show loading state to prevent flash of unstyled content
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-steel-600"></div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// ============================================
// THEME HOOK
// ============================================

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

// ============================================
// THEME UTILITIES HOOK
// ============================================

export const useThemeUtils = () => {
  const { theme, cssVariables } = useTheme();
  
  return useMemo(() => ({
    // Get CSS variable value
    getCSSVariable: (name: string): string => {
      return cssVariables[name] || getComputedStyle(document.documentElement).getPropertyValue(name);
    },
    
    // Check if current theme is dark
    isDarkMode: theme.mode === 'dark',
    
    // Check if current theme is light
    isLightMode: theme.mode === 'light',
    
    // Get current density multiplier
    getDensityMultiplier: (): number => {
      switch (theme.density) {
        case 'compact': return 0.75;
        case 'spacious': return 1.25;
        default: return 1;
      }
    },
    
    // Get theme-aware class names
    getThemeClasses: (baseClasses: string): string => {
      return `${baseClasses} theme-${theme.mode} density-${theme.density} radius-${theme.borderRadius}`;
    },
    
    // Generate theme-aware styles
    getThemeStyles: (styles: Record<string, any>): Record<string, any> => {
      return {
        ...styles,
        '--theme-mode': theme.mode,
        '--theme-density': theme.density,
      };
    },
  }), [theme, cssVariables]);
};

// ============================================
// EXPORTS
// ============================================

export default ThemeProvider;
export type { ThemeConfig, ThemeContextValue };