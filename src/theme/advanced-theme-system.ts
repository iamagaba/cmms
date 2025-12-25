/**
 * Advanced Professional CMMS Theme System
 * 
 * A comprehensive theme system for Phase 5 implementation.
 * Features advanced theme switching, dark mode, density options,
 * and brand customization for desktop CMMS workflows.
 */

import { designTokens, type ThemeConfig } from './professional-design-tokens';

// ============================================
// ADVANCED THEME TYPES
// ============================================

export interface AdvancedThemeConfig extends ThemeConfig {
  // Brand customization
  brand: {
    name: string;
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  
  // Advanced density options
  density: 'compact' | 'comfortable' | 'spacious' | 'custom';
  customDensity?: {
    scale: number;
    padding: number;
    fontSize: number;
    lineHeight: number;
  };
  
  // Color scheme variants
  colorScheme: 'default' | 'high-contrast' | 'colorblind-friendly' | 'custom';
  customColors?: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  // Typography options
  typography: {
    fontFamily: 'system' | 'inter' | 'roboto' | 'custom';
    customFontFamily?: string;
    scale: 'small' | 'medium' | 'large' | 'custom';
    customScale?: number;
  };
  
  // Motion preferences
  motion: {
    enabled: boolean;
    speed: 'slow' | 'normal' | 'fast';
    easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  };
  
  // Accessibility options
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    focusVisible: boolean;
    screenReaderOptimized: boolean;
  };
  
  // Layout preferences
  layout: {
    sidebarWidth: number;
    headerHeight: number;
    contentMaxWidth: number;
    gridGap: number;
  };
}

// ============================================
// THEME PRESETS
// ============================================

export const themePresets: Record<string, Partial<AdvancedThemeConfig>> = {
  // Default CMMS theme
  default: {
    mode: 'light',
    density: 'comfortable',
    primaryColor: 'steelBlue',
    borderRadius: 'rounded',
    colorScheme: 'default',
    typography: {
      fontFamily: 'system',
      scale: 'medium',
    },
    motion: {
      enabled: true,
      speed: 'normal',
      easing: 'ease-out',
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      focusVisible: true,
      screenReaderOptimized: false,
    },
  },
  
  // Dark mode optimized
  darkMode: {
    mode: 'dark',
    density: 'comfortable',
    primaryColor: 'steelBlue',
    borderRadius: 'rounded',
    colorScheme: 'default',
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      focusVisible: true,
      screenReaderOptimized: false,
    },
  },
  
  // High contrast for accessibility
  highContrast: {
    mode: 'light',
    density: 'spacious',
    primaryColor: 'steelBlue',
    borderRadius: 'sharp',
    colorScheme: 'high-contrast',
    typography: {
      fontFamily: 'system',
      scale: 'large',
    },
    accessibility: {
      highContrast: true,
      reducedMotion: true,
      focusVisible: true,
      screenReaderOptimized: true,
    },
  },
  
  // Compact for data-heavy interfaces
  compact: {
    mode: 'light',
    density: 'compact',
    primaryColor: 'machineryGray',
    borderRadius: 'sharp',
    colorScheme: 'default',
    typography: {
      fontFamily: 'system',
      scale: 'small',
    },
    motion: {
      enabled: true,
      speed: 'fast',
      easing: 'ease-out',
    },
  },
  
  // Colorblind friendly
  colorblindFriendly: {
    mode: 'light',
    density: 'comfortable',
    primaryColor: 'steelBlue',
    borderRadius: 'rounded',
    colorScheme: 'colorblind-friendly',
    typography: {
      fontFamily: 'system',
      scale: 'medium',
    },
  },
};

// ============================================
// BRAND THEMES
// ============================================

export const brandThemes: Record<string, Partial<AdvancedThemeConfig>> = {
  // Industrial theme
  industrial: {
    brand: {
      name: 'Industrial CMMS',
      primaryColor: '#475569', // Steel blue
      secondaryColor: '#64748b', // Machinery gray
      accentColor: '#ea580c', // Safety orange
    },
    primaryColor: 'steelBlue',
    colorScheme: 'default',
  },
  
  // Safety-focused theme
  safety: {
    brand: {
      name: 'Safety First CMMS',
      primaryColor: '#ea580c', // Safety orange
      secondaryColor: '#dc2626', // Warning red
      accentColor: '#059669', // Industrial green
    },
    primaryColor: 'safetyOrange',
    colorScheme: 'default',
  },
  
  // Eco-friendly theme
  eco: {
    brand: {
      name: 'Eco CMMS',
      primaryColor: '#059669', // Industrial green
      secondaryColor: '#16a34a', // Success green
      accentColor: '#eab308', // Maintenance yellow
    },
    primaryColor: 'industrialGreen',
    colorScheme: 'default',
  },
};

// ============================================
// THEME UTILITIES
// ============================================

export class AdvancedThemeManager {
  private static instance: AdvancedThemeManager;
  private currentTheme: AdvancedThemeConfig;
  private observers: Array<(theme: AdvancedThemeConfig) => void> = [];
  
  private constructor() {
    this.currentTheme = this.getDefaultTheme();
  }
  
  static getInstance(): AdvancedThemeManager {
    if (!AdvancedThemeManager.instance) {
      AdvancedThemeManager.instance = new AdvancedThemeManager();
    }
    return AdvancedThemeManager.instance;
  }
  
  private getDefaultTheme(): AdvancedThemeConfig {
    return {
      mode: 'light',
      density: 'comfortable',
      primaryColor: 'steelBlue',
      borderRadius: 'rounded',
      brand: {
        name: 'GOGO CMMS',
        primaryColor: '#475569',
        secondaryColor: '#64748b',
        accentColor: '#ea580c',
      },
      colorScheme: 'default',
      typography: {
        fontFamily: 'system',
        scale: 'medium',
      },
      motion: {
        enabled: true,
        speed: 'normal',
        easing: 'ease-out',
      },
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        focusVisible: true,
        screenReaderOptimized: false,
      },
      layout: {
        sidebarWidth: 280,
        headerHeight: 64,
        contentMaxWidth: 1200,
        gridGap: 24,
      },
    };
  }
  
  // Theme management
  setTheme(theme: Partial<AdvancedThemeConfig>): void {
    this.currentTheme = { ...this.currentTheme, ...theme };
    this.notifyObservers();
    this.persistTheme();
    this.applyTheme();
  }
  
  getTheme(): AdvancedThemeConfig {
    return { ...this.currentTheme };
  }
  
  resetTheme(): void {
    this.currentTheme = this.getDefaultTheme();
    this.notifyObservers();
    this.persistTheme();
    this.applyTheme();
  }
  
  // Preset management
  applyPreset(presetName: keyof typeof themePresets): void {
    const preset = themePresets[presetName];
    if (preset) {
      this.setTheme(preset);
    }
  }
  
  applyBrandTheme(brandName: keyof typeof brandThemes): void {
    const brandTheme = brandThemes[brandName];
    if (brandTheme) {
      this.setTheme(brandTheme);
    }
  }
  
  // Observer pattern
  subscribe(observer: (theme: AdvancedThemeConfig) => void): () => void {
    this.observers.push(observer);
    return () => {
      this.observers = this.observers.filter(obs => obs !== observer);
    };
  }
  
  private notifyObservers(): void {
    this.observers.forEach(observer => observer(this.currentTheme));
  }
  
  // Persistence
  private persistTheme(): void {
    try {
      localStorage.setItem('gogo-cmms-advanced-theme', JSON.stringify(this.currentTheme));
    } catch (error) {
      console.warn('Failed to persist theme:', error);
    }
  }
  
  loadPersistedTheme(): void {
    try {
      const stored = localStorage.getItem('gogo-cmms-advanced-theme');
      if (stored) {
        const theme = JSON.parse(stored);
        this.currentTheme = { ...this.getDefaultTheme(), ...theme };
        this.applyTheme();
      }
    } catch (error) {
      console.warn('Failed to load persisted theme:', error);
    }
  }
  
  // CSS application
  private applyTheme(): void {
    this.applyCSSVariables();
    this.applyBodyClasses();
    this.applyAccessibilitySettings();
  }
  
  private applyCSSVariables(): void {
    const root = document.documentElement;
    const theme = this.currentTheme;
    
    // Brand colors
    root.style.setProperty('--brand-primary', theme.brand.primaryColor);
    root.style.setProperty('--brand-secondary', theme.brand.secondaryColor);
    root.style.setProperty('--brand-accent', theme.brand.accentColor);
    
    // Density scaling
    const densityScale = this.getDensityScale();
    root.style.setProperty('--density-scale', densityScale.toString());
    root.style.setProperty('--density-padding', `${densityScale}rem`);
    root.style.setProperty('--density-font-size', `${densityScale}rem`);
    
    // Typography
    const fontFamily = this.getFontFamily();
    root.style.setProperty('--font-family-primary', fontFamily);
    
    const typeScale = this.getTypographyScale();
    root.style.setProperty('--typography-scale', typeScale.toString());
    
    // Layout
    root.style.setProperty('--layout-sidebar-width', `${theme.layout.sidebarWidth}px`);
    root.style.setProperty('--layout-header-height', `${theme.layout.headerHeight}px`);
    root.style.setProperty('--layout-content-max-width', `${theme.layout.contentMaxWidth}px`);
    root.style.setProperty('--layout-grid-gap', `${theme.layout.gridGap}px`);
    
    // Motion
    const motionDuration = this.getMotionDuration();
    root.style.setProperty('--motion-duration', `${motionDuration}ms`);
    root.style.setProperty('--motion-easing', theme.motion.easing);
  }
  
  private applyBodyClasses(): void {
    const body = document.body;
    const theme = this.currentTheme;
    
    // Remove existing theme classes
    body.className = body.className.replace(/theme-\w+|density-\w+|motion-\w+|accessibility-\w+/g, '');
    
    // Add new theme classes
    const classes = [
      `theme-${theme.mode}`,
      `density-${theme.density}`,
      `color-scheme-${theme.colorScheme}`,
      `typography-${theme.typography.fontFamily}`,
      `motion-${theme.motion.enabled ? 'enabled' : 'disabled'}`,
      theme.accessibility.highContrast && 'accessibility-high-contrast',
      theme.accessibility.reducedMotion && 'accessibility-reduced-motion',
      theme.accessibility.focusVisible && 'accessibility-focus-visible',
    ].filter(Boolean);
    
    body.className = `${body.className} ${classes.join(' ')}`.trim();
  }
  
  private applyAccessibilitySettings(): void {
    const theme = this.currentTheme;
    
    // Reduced motion
    if (theme.accessibility.reducedMotion) {
      document.documentElement.style.setProperty('--motion-duration', '0ms');
    }
    
    // High contrast
    if (theme.accessibility.highContrast) {
      document.documentElement.setAttribute('data-high-contrast', 'true');
    } else {
      document.documentElement.removeAttribute('data-high-contrast');
    }
  }
  
  // Utility methods
  private getDensityScale(): number {
    const { density, customDensity } = this.currentTheme;
    
    if (density === 'custom' && customDensity) {
      return customDensity.scale;
    }
    
    switch (density) {
      case 'compact': return 0.75;
      case 'spacious': return 1.25;
      default: return 1;
    }
  }
  
  private getFontFamily(): string {
    const { typography } = this.currentTheme;
    
    if (typography.fontFamily === 'custom' && typography.customFontFamily) {
      return typography.customFontFamily;
    }
    
    switch (typography.fontFamily) {
      case 'inter': return 'Inter, system-ui, sans-serif';
      case 'roboto': return 'Roboto, system-ui, sans-serif';
      default: return 'system-ui, -apple-system, sans-serif';
    }
  }
  
  private getTypographyScale(): number {
    const { typography } = this.currentTheme;
    
    if (typography.scale === 'custom' && typography.customScale) {
      return typography.customScale;
    }
    
    switch (typography.scale) {
      case 'small': return 0.875;
      case 'large': return 1.125;
      default: return 1;
    }
  }
  
  private getMotionDuration(): number {
    const { motion } = this.currentTheme;
    
    if (!motion.enabled) return 0;
    
    switch (motion.speed) {
      case 'slow': return 400;
      case 'fast': return 150;
      default: return 250;
    }
  }
  
  // Theme validation
  validateTheme(theme: Partial<AdvancedThemeConfig>): boolean {
    // Add validation logic here
    return true;
  }
  
  // Export/Import
  exportTheme(): string {
    return JSON.stringify(this.currentTheme, null, 2);
  }
  
  importTheme(themeJson: string): boolean {
    try {
      const theme = JSON.parse(themeJson);
      if (this.validateTheme(theme)) {
        this.setTheme(theme);
        return true;
      }
    } catch (error) {
      console.error('Failed to import theme:', error);
    }
    return false;
  }
}

// ============================================
// THEME HOOKS
// ============================================

import React from 'react';

export const useAdvancedTheme = () => {
  const themeManager = AdvancedThemeManager.getInstance();
  const [theme, setTheme] = React.useState(themeManager.getTheme());
  
  React.useEffect(() => {
    const unsubscribe = themeManager.subscribe(setTheme);
    return unsubscribe;
  }, [themeManager]);
  
  return {
    theme,
    setTheme: (newTheme: Partial<AdvancedThemeConfig>) => themeManager.setTheme(newTheme),
    resetTheme: () => themeManager.resetTheme(),
    applyPreset: (preset: keyof typeof themePresets) => themeManager.applyPreset(preset),
    applyBrandTheme: (brand: keyof typeof brandThemes) => themeManager.applyBrandTheme(brand),
    exportTheme: () => themeManager.exportTheme(),
    importTheme: (json: string) => themeManager.importTheme(json),
  };
};

// ============================================
// EXPORTS
// ============================================

export default AdvancedThemeManager;
export type { AdvancedThemeConfig };
export { themePresets, brandThemes };