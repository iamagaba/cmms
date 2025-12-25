/**
 * Advanced Professional CMMS Theme Controls
 * 
 * Comprehensive theme controls for Phase 5 implementation.
 * Features advanced theme switching, dark mode, density options,
 * brand customization, and accessibility settings.
 */

import React, { useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ProfessionalButton from '@/components/ui/ProfessionalButton';
import ProfessionalInput, { ProfessionalSelect } from '@/components/ui/ProfessionalInput';
import ProfessionalCard from '@/components/ui/ProfessionalCard';
import { ProfessionalTabs } from '@/components/layout/ProfessionalNavigation';
import { useAdvancedTheme, themePresets, brandThemes, type AdvancedThemeConfig } from '@/theme/advanced-theme-system';

// ============================================
// COMPONENT INTERFACES
// ============================================

export interface AdvancedThemeControlsProps {
  variant?: 'panel' | 'modal' | 'drawer';
  onClose?: () => void;
  className?: string;
}

// ============================================
// THEME MODE CONTROLS
// ============================================

const ThemeModeControls: React.FC = () => {
  const { theme, setTheme } = useAdvancedTheme();
  
  const modeOptions = [
    { id: 'light', label: 'Light', icon: 'tabler:sun' },
    { id: 'dark', label: 'Dark', icon: 'tabler:moon' },
    { id: 'auto', label: 'Auto', icon: 'tabler:device-desktop' },
  ];
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-machinery-900">Theme Mode</h3>
      
      <div className="grid grid-cols-3 gap-2">
        {modeOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setTheme({ mode: option.id as any })}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
              'hover:border-steel-300 focus:outline-none focus:ring-2 focus:ring-steel-500',
              theme.mode === option.id
                ? 'border-steel-500 bg-steel-50 text-steel-700'
                : 'border-machinery-200 bg-white text-machinery-600'
            )}
          >
            <Icon icon={option.icon} className="w-6 h-6" />
            <span className="text-sm font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================
// DENSITY CONTROLS
// ============================================

const DensityControls: React.FC = () => {
  const { theme, setTheme } = useAdvancedTheme();
  
  const densityOptions = [
    { id: 'compact', label: 'Compact', icon: 'tabler:layout-grid', description: 'More content, less spacing' },
    { id: 'comfortable', label: 'Comfortable', icon: 'tabler:layout-2', description: 'Balanced spacing' },
    { id: 'spacious', label: 'Spacious', icon: 'tabler:layout-distribute-vertical', description: 'More spacing, easier reading' },
  ];
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-machinery-900">Density</h3>
      
      <div className="space-y-2">
        {densityOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setTheme({ density: option.id as any })}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
              'hover:border-steel-300 focus:outline-none focus:ring-2 focus:ring-steel-500',
              theme.density === option.id
                ? 'border-steel-500 bg-steel-50'
                : 'border-machinery-200 bg-white'
            )}
          >
            <Icon icon={option.icon} className="w-5 h-5 text-steel-600" />
            <div className="flex-1">
              <div className="font-medium text-machinery-900">{option.label}</div>
              <div className="text-sm text-machinery-600">{option.description}</div>
            </div>
            {theme.density === option.id && (
              <Icon icon="tabler:check" className="w-5 h-5 text-steel-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================
// COLOR SCHEME CONTROLS
// ============================================

const ColorSchemeControls: React.FC = () => {
  const { theme, setTheme } = useAdvancedTheme();
  
  const colorSchemes = [
    { id: 'default', label: 'Default', description: 'Standard color palette' },
    { id: 'high-contrast', label: 'High Contrast', description: 'Enhanced contrast for accessibility' },
    { id: 'colorblind-friendly', label: 'Colorblind Friendly', description: 'Optimized for color vision deficiency' },
  ];
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-machinery-900">Color Scheme</h3>
      
      <ProfessionalSelect
        value={theme.colorScheme}
        onChange={(e) => setTheme({ colorScheme: e.target.value as any })}
        options={colorSchemes.map(scheme => ({
          value: scheme.id,
          label: scheme.label,
        }))}
      />
      
      <p className="text-sm text-machinery-600">
        {colorSchemes.find(s => s.id === theme.colorScheme)?.description}
      </p>
    </div>
  );
};

// ============================================
// BRAND CUSTOMIZATION CONTROLS
// ============================================

const BrandCustomizationControls: React.FC = () => {
  const { theme, setTheme } = useAdvancedTheme();
  
  const handleBrandChange = useCallback((field: keyof AdvancedThemeConfig['brand'], value: string) => {
    setTheme({
      brand: {
        ...theme.brand,
        [field]: value,
      },
    });
  }, [theme.brand, setTheme]);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-machinery-900">Brand Customization</h3>
      
      <div className="space-y-4">
        <ProfessionalInput
          label="Brand Name"
          value={theme.brand.name}
          onChange={(e) => handleBrandChange('name', e.target.value)}
          placeholder="Enter brand name"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-machinery-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.brand.primaryColor}
                onChange={(e) => handleBrandChange('primaryColor', e.target.value)}
                className="w-12 h-10 rounded border border-machinery-300"
              />
              <ProfessionalInput
                value={theme.brand.primaryColor}
                onChange={(e) => handleBrandChange('primaryColor', e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-machinery-700 mb-2">
              Secondary Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.brand.secondaryColor}
                onChange={(e) => handleBrandChange('secondaryColor', e.target.value)}
                className="w-12 h-10 rounded border border-machinery-300"
              />
              <ProfessionalInput
                value={theme.brand.secondaryColor}
                onChange={(e) => handleBrandChange('secondaryColor', e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-machinery-700 mb-2">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.brand.accentColor}
                onChange={(e) => handleBrandChange('accentColor', e.target.value)}
                className="w-12 h-10 rounded border border-machinery-300"
              />
              <ProfessionalInput
                value={theme.brand.accentColor}
                onChange={(e) => handleBrandChange('accentColor', e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// TYPOGRAPHY CONTROLS
// ============================================

const TypographyControls: React.FC = () => {
  const { theme, setTheme } = useAdvancedTheme();
  
  const fontFamilyOptions = [
    { value: 'system', label: 'System Default' },
    { value: 'inter', label: 'Inter' },
    { value: 'roboto', label: 'Roboto' },
    { value: 'custom', label: 'Custom' },
  ];
  
  const scaleOptions = [
    { value: 'small', label: 'Small (87.5%)' },
    { value: 'medium', label: 'Medium (100%)' },
    { value: 'large', label: 'Large (112.5%)' },
    { value: 'custom', label: 'Custom' },
  ];
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-machinery-900">Typography</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProfessionalSelect
          label="Font Family"
          value={theme.typography.fontFamily}
          onChange={(e) => setTheme({
            typography: {
              ...theme.typography,
              fontFamily: e.target.value as any,
            },
          })}
          options={fontFamilyOptions}
        />
        
        <ProfessionalSelect
          label="Font Scale"
          value={theme.typography.scale}
          onChange={(e) => setTheme({
            typography: {
              ...theme.typography,
              scale: e.target.value as any,
            },
          })}
          options={scaleOptions}
        />
      </div>
      
      {theme.typography.fontFamily === 'custom' && (
        <ProfessionalInput
          label="Custom Font Family"
          value={theme.typography.customFontFamily || ''}
          onChange={(e) => setTheme({
            typography: {
              ...theme.typography,
              customFontFamily: e.target.value,
            },
          })}
          placeholder="Enter font family CSS value"
        />
      )}
    </div>
  );
};

// ============================================
// ACCESSIBILITY CONTROLS
// ============================================

const AccessibilityControls: React.FC = () => {
  const { theme, setTheme } = useAdvancedTheme();
  
  const handleAccessibilityChange = useCallback((field: keyof AdvancedThemeConfig['accessibility'], value: boolean) => {
    setTheme({
      accessibility: {
        ...theme.accessibility,
        [field]: value,
      },
    });
  }, [theme.accessibility, setTheme]);
  
  const accessibilityOptions = [
    {
      key: 'highContrast' as const,
      label: 'High Contrast',
      description: 'Increase contrast for better visibility',
      icon: 'tabler:contrast',
    },
    {
      key: 'reducedMotion' as const,
      label: 'Reduced Motion',
      description: 'Minimize animations and transitions',
      icon: 'tabler:player-pause',
    },
    {
      key: 'focusVisible' as const,
      label: 'Focus Indicators',
      description: 'Show focus rings for keyboard navigation',
      icon: 'tabler:focus',
    },
    {
      key: 'screenReaderOptimized' as const,
      label: 'Screen Reader Optimized',
      description: 'Enhanced screen reader support',
      icon: 'tabler:accessibility',
    },
  ];
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-machinery-900">Accessibility</h3>
      
      <div className="space-y-3">
        {accessibilityOptions.map((option) => (
          <div key={option.key} className="flex items-center justify-between p-3 bg-machinery-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon icon={option.icon} className="w-5 h-5 text-steel-600" />
              <div>
                <div className="font-medium text-machinery-900">{option.label}</div>
                <div className="text-sm text-machinery-600">{option.description}</div>
              </div>
            </div>
            <button
              onClick={() => handleAccessibilityChange(option.key, !theme.accessibility[option.key])}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-steel-500 focus:ring-offset-2',
                theme.accessibility[option.key] ? 'bg-steel-600' : 'bg-machinery-300'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  theme.accessibility[option.key] ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// PRESET CONTROLS
// ============================================

const PresetControls: React.FC = () => {
  const { applyPreset, applyBrandTheme, exportTheme, importTheme } = useAdvancedTheme();
  const [importValue, setImportValue] = useState('');
  
  const handleImport = useCallback(() => {
    if (importTheme(importValue)) {
      setImportValue('');
      // Show success message
    } else {
      // Show error message
    }
  }, [importValue, importTheme]);
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-machinery-900 mb-4">Theme Presets</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(themePresets).map((preset) => (
            <ProfessionalButton
              key={preset}
              variant="outline"
              size="sm"
              onClick={() => applyPreset(preset as any)}
              className="justify-start"
            >
              {preset.charAt(0).toUpperCase() + preset.slice(1)}
            </ProfessionalButton>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-machinery-900 mb-4">Brand Themes</h3>
        <div className="grid grid-cols-1 gap-2">
          {Object.keys(brandThemes).map((brand) => (
            <ProfessionalButton
              key={brand}
              variant="outline"
              size="sm"
              onClick={() => applyBrandTheme(brand as any)}
              className="justify-start"
            >
              {brand.charAt(0).toUpperCase() + brand.slice(1)}
            </ProfessionalButton>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-machinery-900 mb-4">Import/Export</h3>
        <div className="space-y-3">
          <ProfessionalButton
            variant="outline"
            size="sm"
            icon="tabler:download"
            onClick={() => {
              const theme = exportTheme();
              const blob = new Blob([theme], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'cmms-theme.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="w-full"
          >
            Export Theme
          </ProfessionalButton>
          
          <div className="space-y-2">
            <ProfessionalInput
              label="Import Theme JSON"
              value={importValue}
              onChange={(e) => setImportValue(e.target.value)}
              placeholder="Paste theme JSON here..."
            />
            <ProfessionalButton
              variant="primary"
              size="sm"
              icon="tabler:upload"
              onClick={handleImport}
              disabled={!importValue.trim()}
              className="w-full"
            >
              Import Theme
            </ProfessionalButton>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN ADVANCED THEME CONTROLS COMPONENT
// ============================================

const AdvancedThemeControls: React.FC<AdvancedThemeControlsProps> = ({
  variant = 'panel',
  onClose,
  className,
}) => {
  const [activeTab, setActiveTab] = useState('appearance');
  const { resetTheme } = useAdvancedTheme();
  
  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: 'tabler:palette' },
    { id: 'layout', label: 'Layout', icon: 'tabler:layout' },
    { id: 'brand', label: 'Brand', icon: 'tabler:brand-abstract' },
    { id: 'accessibility', label: 'Accessibility', icon: 'tabler:accessibility' },
    { id: 'presets', label: 'Presets', icon: 'tabler:template' },
  ];
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return (
          <div className="space-y-8">
            <ThemeModeControls />
            <DensityControls />
            <ColorSchemeControls />
            <TypographyControls />
          </div>
        );
      case 'layout':
        return (
          <div className="space-y-8">
            {/* Layout controls would go here */}
            <div className="text-center py-8 text-machinery-500">
              Layout controls coming soon...
            </div>
          </div>
        );
      case 'brand':
        return (
          <div className="space-y-8">
            <BrandCustomizationControls />
          </div>
        );
      case 'accessibility':
        return (
          <div className="space-y-8">
            <AccessibilityControls />
          </div>
        );
      case 'presets':
        return (
          <div className="space-y-8">
            <PresetControls />
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <ProfessionalCard className={cn('max-w-4xl', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-machinery-200">
        <div>
          <h2 className="text-xl font-semibold text-machinery-900">
            Advanced Theme Settings
          </h2>
          <p className="text-sm text-machinery-600 mt-1">
            Customize your CMMS interface appearance and behavior
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ProfessionalButton
            variant="outline"
            size="sm"
            icon="tabler:refresh"
            onClick={resetTheme}
          >
            Reset
          </ProfessionalButton>
          {onClose && (
            <ProfessionalButton
              variant="ghost"
              size="sm"
              icon="tabler:x"
              onClick={onClose}
            />
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-machinery-200">
        <ProfessionalTabs
          items={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="underline"
          className="px-6"
        />
      </div>
      
      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </ProfessionalCard>
  );
};

// ============================================
// EXPORTS
// ============================================

export default AdvancedThemeControls;
export type { AdvancedThemeControlsProps };