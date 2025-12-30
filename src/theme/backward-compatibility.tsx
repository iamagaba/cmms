/**
 * Backward Compatibility Utilities
 * 
 * This module provides utilities to maintain backward compatibility during
 * the migration to the Professional Design System. It includes deprecation
 * warnings, legacy class mappings, and migration helpers.
 */

import React from 'react';

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
  'bg-blue-600': 'bg-steel-600',
  'bg-blue-700': 'bg-steel-700',
  
  // Text colors
  'text-blue-600': 'text-steel-600',
  'text-blue-700': 'text-steel-700',
  
  // Border colors
  'border-blue-600': 'border-steel-600',
  
  // Green to industrial mappings
  'bg-green-100': 'bg-industrial-100',
  'text-green-800': 'text-industrial-800',
  
  // Red to warning mappings
  'bg-red-100': 'bg-warning-100',
  'text-red-800': 'text-warning-800',
  
  // Yellow to maintenance mappings
  'bg-yellow-100': 'bg-maintenance-100',
  'text-yellow-800': 'text-maintenance-800',
};

// ============================================
// DEPRECATION WARNINGS
// ============================================

/**
 * List of deprecated classes that should trigger warnings
 */
export const deprecatedClasses = [
  'bg-blue-600',
  'bg-blue-700',
  'hover:bg-blue-700',
  'bg-gray-100',
  'hover:bg-gray-200',
  'text-blue-600',
  'text-green-800',
  'text-red-800',
  'text-yellow-800',
  'border-blue-600',
  'border-green-500',
  'border-red-500',
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
    deprecatedFound.forEach(({ className, elements, suggestion }) => {
      console.warn(`• "${className}" (${elements} element${elements > 1 ? 's' : ''})`);
      if (suggestion) {
        console.log(`  → Migrate to: "${suggestion}"`);
      }
    });
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

  Object.entries(legacyClassMappings).forEach(([legacy, modern]) => {
    if (migratedClassName.includes(legacy)) {
      migratedClassName = migratedClassName.replace(legacy, modern);
    }
  });

  Object.entries(colorClassMappings).forEach(([legacy, modern]) => {
    const regex = new RegExp(`\\b${legacy.replace(':', '\\:')}\\b`, 'g');
    migratedClassName = migratedClassName.replace(regex, modern);
  });

  return migratedClassName.replace(/\s+/g, ' ').trim();
}

/**
 * React hook to automatically migrate className props
 */
export function useMigratedClassName(className?: string): string {
  if (!className) return '';
  return migrateClassName(className);
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

export const defaultFeatureFlags: DesignSystemFeatureFlags = {
  useNewButtons: false,
  useNewInputs: false,
  useNewCards: false,
  useNewNavigation: false,
  useNewColors: false,
  useThemeSystem: false,
  enableDeprecationWarnings: process.env.NODE_ENV === 'development',
  autoMigrateClassNames: false,
};

export function getFeatureFlags(): DesignSystemFeatureFlags {
  return defaultFeatureFlags;
}

export function isFeatureEnabled(feature: keyof DesignSystemFeatureFlags): boolean {
  return getFeatureFlags()[feature];
}

// ============================================
// VALIDATION
// ============================================

export function validateDesignSystemSetup(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof document !== 'undefined') {
    const testElement = document.createElement('div');
    testElement.style.setProperty('--test-var', 'test');
    const supportsCustomProperties = testElement.style.getPropertyValue('--test-var') === 'test';
    
    if (!supportsCustomProperties) {
      errors.push('CSS custom properties are not supported in this browser');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function initializeBackwardCompatibility(): void {
  if (typeof window === 'undefined') return;

  if (getFeatureFlags().enableDeprecationWarnings) {
    setTimeout(checkDeprecatedClasses, 1000);
  }

  const validation = validateDesignSystemSetup();
  if (!validation.isValid) {
    console.error('Design System Setup Errors:', validation.errors);
  }

  document.documentElement.setAttribute('data-design-system', 'professional-cmms');
}
