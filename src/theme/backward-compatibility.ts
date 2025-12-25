/**
 * Backward Compatibility Utilities
 * 
 * This module provides utilities to maintain backward compatibility during
 * the migration to the Professional Design System. It includes deprecation
 * warnings, legacy class mappings, and migration helpers.
 */

// ============================================
// LEGACY CLASS MAPPINGS
// ============================================

/**
 * Mapping of legacy Tailwind classes to new design system classes
 */
export const legacyClassMappings: Record<string, string> = {
  // Button mappings
  'bg-blue-600 hover:bg-blue-700 text-white': 'btn-primary',
  'bg-gray-100 hover:bg-gray-200 text-gray-800': 'btn-secondary',
  'border border-blue-600 text-blue-600 hover:bg-blue-50': 'btn-outline',
  'text-blue-600 hover:bg-blue-50': 'btn-ghost',
  'bg-red-600 hover:bg-red-700 text-white': 'btn-danger',
  
  // Input mappings
  'border border-gray-300 px-3 py-2 rounded focus:border-blue-500': 'input-base',
  'border-red-500 focus:border-red-500': 'input-error',
  'border-green-500 focus:border-green-500': 'input-success',
  
  // Card mappings
  'bg-white border border-gray-200 rounded-lg shadow-sm': 'card-base',
  'bg-white border border-gray-200 rounded-lg shadow-lg': 'card-elevated',
  'bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md cursor-pointer': 'card-interactive',
  
  // Status mappings
  'bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm': 'status-success',
  'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm': 'status-warning',
  'bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm': 'status-error',
  'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm': 'status-info',
};

/**
 * Individual color class mappings
 */
export const colorClassMappings: Record<string, string> = {
  // Background colors
  'bg-blue-50': 'bg-steel-50',
  'bg-blue-100': 'bg-steel-100',
  'bg-blue-200': 'bg-steel-200',
  'bg-blue-300': 'bg-steel-300',
  'bg-blue-400': 'bg-steel-400',
  'bg-blue-500': 'bg-steel-500',
  'bg-blue-600': 'bg-steel-600',
  'bg-blue-700': 'bg-steel-700',
  'bg-blue-800': 'bg-steel-800',
  'bg-blue-900': 'bg-steel-900',
  
  // Text colors
  'text-blue-50': 'text-steel-50',
  'text-blue-100': 'text-steel-100',
  'text-blue-200': 'text-steel-200',
  'text-blue-300': 'text-steel-300',
  'text-blue-400': 'text-steel-400',
  'text-blue-500': 'text-steel-500',
  'text-blue-600': 'text-steel-600',
  'text-blue-700': 'text-steel-700',
  'text-blue-800': 'text-steel-800',
  'text-blue-900': 'text-steel-900',
  
  // Border colors
  'border-blue-50': 'border-steel-50',
  'border-blue-100': 'border-steel-100',
  'border-blue-200': 'border-steel-200',
  'border-blue-300': 'border-steel-300',
  'border-blue-400': 'border-steel-400',
  'border-blue-500': 'border-steel-500',
  'border-blue-600': 'border-steel-600',
  'border-blue-700': 'border-steel-700',
  'border-blue-800': 'border-steel-800',
  'border-blue-900': 'border-steel-900',
  
  // Green to industrial mappings
  'bg-green-50': 'bg-industrial-50',
  'bg-green-100': 'bg-industrial-100',
  'bg-green-500': 'bg-industrial-500',
  'bg-green-600': 'bg-industrial-600',
  'text-green-800': 'text-industrial-800',
  'border-green-500': 'border-industrial-500',
  
  // Red to warning mappings
  'bg-red-50': 'bg-warning-50',
  'bg-red-100': 'bg-warning-100',
  'bg-red-500': 'bg-warning-500',
  'bg-red-600': 'bg-warning-600',
  'text-red-800': 'text-warning-800',
  'border-red-500': 'border-warning-500',
  
  // Yellow to maintenance mappings
  'bg-yellow-50': 'bg-maintenance-50',
  'bg-yellow-100': 'bg-maintenance-100',
  'bg-yellow-500': 'bg-maintenance-500',
  'text-yellow-800': 'text-maintenance-800',
  
  // Orange to safety mappings
  'bg-orange-50': 'bg-safety-50',
  'bg-orange-100': 'bg-safety-100',
  'bg-orange-500': 'bg-safety-500',
  'text-orange-800': 'text-safety-800',
  
  // Gray to machinery mappings (with warning)
  'bg-gray-50': 'bg-machinery-50',
  'bg-gray-100': 'bg-machinery-100',
  'bg-gray-200': 'bg-machinery-200',
  'bg-gray-300': 'bg-machinery-300',
  'bg-gray-400': 'bg-machinery-400',
  'bg-gray-500': 'bg-machinery-500',
  'bg-gray-600': 'bg-machinery-600',
  'bg-gray-700': 'bg-machinery-700',
  'bg-gray-800': 'bg-machinery-800',
  'bg-gray-900': 'bg-machinery-900',
  'text-gray-500': 'text-machinery-500',
  'text-gray-600': 'text-machinery-600',
  'text-gray-700': 'text-machinery-700',
  'text-gray-800': 'text-machinery-800',
  'text-gray-900': 'text-machinery-900',
  'border-gray-200': 'border-machinery-200',
  'border-gray-300': 'border-machinery-300',
};

// ============================================
// DEPRECATION WARNINGS
// ============================================

/**
 * List of deprecated classes that should trigger warnings
 */
export const deprecatedClasses = [
  // Legacy button classes
  'bg-blue-600',
  'bg-blue-700',
  'hover:bg-blue-700',
  'bg-gray-100',
  'hover:bg-gray-200',
  
  // Legacy color classes
  'text-blue-600',
  'text-green-800',
  'text-red-800',
  'text-yellow-800',
  'border-blue-600',
  'border-green-500',
  'border-red-500',
  
  // Legacy status classes
  'bg-green-100',
  'bg-red-100',
  'bg-yellow-100',
];

/**
 * Check for deprecated classes in the DOM and log warnings
 */
export function checkDeprecatedClasses(): void {
  if (process.env.NODE_ENV !== 'development') return;

  const deprecatedFound: Array<{ className: string; elements: number; suggestion?: string }> = [];

  deprecatedClasses.forEach(className => {
    const elements = document.querySelectorAll(`.${className.replace(':', '\\:')}`);
    if (elements.length > 0) {
      const suggestion = colorClassMappings[className] || legacyClassMappings[className];
      deprecatedFound.push({
        className,
        elements: elements.length,
        suggestion
      });
    }
  });

  if (deprecatedFound.length > 0) {
    console.group('🚨 Deprecated Design System Classes Found');
    console.warn('The following deprecated classes were found in your application:');
    
    deprecatedFound.forEach(({ className, elements, suggestion }) => {
      console.warn(`• "${className}" (${elements} element${elements > 1 ? 's' : ''})`);
      if (suggestion) {
        console.log(`  → Migrate to: "${suggestion}"`);
      }
    });
    
    console.log('\n📖 See migration guide: src/theme/migration-guide.md');
    console.log('🔧 Run codemods: npm run migrate:design-system');
    console.groupEnd();
  }
}

// ============================================
// MIGRATION HELPERS
// ============================================

/**
 * Migrate a className string from legacy to design system classes
 */
export function migrateClassName(className: string): string {
  if (!className) return className;

  let migratedClassName = className;

  // First, try to match complete patterns
  Object.entries(legacyClassMappings).forEach(([legacy, modern]) => {
    if (migratedClassName.includes(legacy)) {
      migratedClassName = migratedClassName.replace(legacy, modern);
    }
  });

  // Then, migrate individual color classes
  Object.entries(colorClassMappings).forEach(([legacy, modern]) => {
    const regex = new RegExp(`\\b${legacy.replace(':', '\\:')}\\b`, 'g');
    migratedClassName = migratedClassName.replace(regex, modern);
  });

  // Clean up extra spaces
  migratedClassName = migratedClassName.replace(/\s+/g, ' ').trim();

  return migratedClassName;
}

/**
 * React hook to automatically migrate className props
 */
export function useMigratedClassName(className?: string): string {
  if (!className) return '';
  
  const migratedClassName = migrateClassName(className);
  
  // Log warning if migration occurred
  if (process.env.NODE_ENV === 'development' && migratedClassName !== className) {
    console.warn(
      `🔄 Auto-migrated className:\n` +
      `  From: "${className}"\n` +
      `  To:   "${migratedClassName}"\n` +
      `  Please update your code to use the new design system classes.`
    );
  }
  
  return migratedClassName;
}

/**
 * Component wrapper that automatically migrates className props
 */
export function withClassNameMigration<T extends { className?: string }>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return function MigratedComponent(props: T) {
    const migratedProps = {
      ...props,
      className: useMigratedClassName(props.className),
    };
    
    return <Component {...migratedProps} />;
  };
}

// ============================================
// FEATURE FLAGS
// ============================================

/**
 * Feature flags for gradual design system rollout
 */
export interface DesignSystemFeatureFlags {
  useNewButtons: boolean;
  useNewInputs: boolean;
  useNewCards: boolean;
  useNewNavigation: boolean;
  useNewColors: boolean;
  useThemeSystem: boolean;
  enableDeprecationWarnings: boolean;
  autoMigrateClassNames: boolean;
}

/**
 * Default feature flags - can be overridden via environment variables
 */
export const defaultFeatureFlags: DesignSystemFeatureFlags = {
  useNewButtons: process.env.REACT_APP_DS_NEW_BUTTONS === 'true',
  useNewInputs: process.env.REACT_APP_DS_NEW_INPUTS === 'true',
  useNewCards: process.env.REACT_APP_DS_NEW_CARDS === 'true',
  useNewNavigation: process.env.REACT_APP_DS_NEW_NAVIGATION === 'true',
  useNewColors: process.env.REACT_APP_DS_NEW_COLORS === 'true',
  useThemeSystem: process.env.REACT_APP_DS_THEME_SYSTEM === 'true',
  enableDeprecationWarnings: process.env.NODE_ENV === 'development',
  autoMigrateClassNames: process.env.REACT_APP_DS_AUTO_MIGRATE === 'true',
};

/**
 * Get current feature flags (can be extended to read from API, localStorage, etc.)
 */
export function getFeatureFlags(): DesignSystemFeatureFlags {
  return defaultFeatureFlags;
}

/**
 * Check if a specific design system feature is enabled
 */
export function isFeatureEnabled(feature: keyof DesignSystemFeatureFlags): boolean {
  return getFeatureFlags()[feature];
}

// ============================================
// MIGRATION UTILITIES
// ============================================

/**
 * Generate migration report for a given file or directory
 */
export interface MigrationReport {
  totalFiles: number;
  filesWithDeprecatedClasses: number;
  deprecatedClassCount: number;
  migrationSuggestions: Array<{
    file: string;
    line: number;
    column: number;
    deprecated: string;
    suggested: string;
  }>;
}

/**
 * Validate that all required design system features are properly configured
 */
export function validateDesignSystemSetup(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if CSS custom properties are available
  if (typeof document !== 'undefined') {
    const testElement = document.createElement('div');
    testElement.style.setProperty('--test-var', 'test');
    const supportsCustomProperties = testElement.style.getPropertyValue('--test-var') === 'test';
    
    if (!supportsCustomProperties) {
      errors.push('CSS custom properties are not supported in this browser');
    }
  }

  // Check if design system CSS is loaded
  if (typeof document !== 'undefined') {
    const hasDesignSystemCSS = document.querySelector('style[data-design-system]') ||
                               document.querySelector('link[href*="design-system"]');
    
    if (!hasDesignSystemCSS) {
      warnings.push('Design system CSS may not be loaded');
    }
  }

  // Check Tailwind CSS integration
  if (typeof window !== 'undefined' && window.getComputedStyle) {
    const testElement = document.createElement('div');
    testElement.className = 'btn-primary';
    document.body.appendChild(testElement);
    
    const styles = window.getComputedStyle(testElement);
    const hasDesignSystemStyles = styles.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
                                  styles.backgroundColor !== 'transparent';
    
    document.body.removeChild(testElement);
    
    if (!hasDesignSystemStyles) {
      warnings.push('Design system utility classes may not be working properly');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Initialize backward compatibility features
 */
export function initializeBackwardCompatibility(): void {
  if (typeof window === 'undefined') return;

  // Set up deprecation warning checker
  if (getFeatureFlags().enableDeprecationWarnings) {
    // Check immediately
    setTimeout(checkDeprecatedClasses, 1000);
    
    // Check periodically during development
    if (process.env.NODE_ENV === 'development') {
      setInterval(checkDeprecatedClasses, 30000); // Every 30 seconds
    }
  }

  // Validate setup
  const validation = validateDesignSystemSetup();
  if (!validation.isValid) {
    console.error('Design System Setup Errors:', validation.errors);
  }
  if (validation.warnings.length > 0) {
    console.warn('Design System Setup Warnings:', validation.warnings);
  }

  // Add design system marker to document
  document.documentElement.setAttribute('data-design-system', 'professional-cmms');
}

// ============================================
// EXPORTS
// ============================================

export {
  legacyClassMappings,
  colorClassMappings,
  deprecatedClasses,
  checkDeprecatedClasses,
  migrateClassName,
  useMigratedClassName,
  withClassNameMigration,
  getFeatureFlags,
  isFeatureEnabled,
  validateDesignSystemSetup,
  initializeBackwardCompatibility,
};