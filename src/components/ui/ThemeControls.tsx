/**
 * Theme Controls Component
 * 
 * Interactive controls for theme switching including mode, density,
 * primary color, and border radius customization. Designed for the
 * professional design system with accessibility and keyboard navigation.
 */

import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Sun03Icon, 
  Moon02Icon, 
  GridIcon, 
  Layout02Icon, 
  DistributeVerticalCenterIcon, 
  Cancel01Icon, 
  PaletteIcon, 
  RefreshIcon, 
  SquareIcon, 
  RoundedRectangleIcon, 
  CircleIcon 
} from '@hugeicons/core-free-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/providers/ThemeProvider';
import { designTokens } from '@/theme/professional-design-tokens';
import ProfessionalButton from './ProfessionalButton';

// ============================================
// THEME CONTROL INTERFACES
// ============================================

export interface ThemeControlsProps {
  variant?: 'dropdown' | 'panel' | 'inline';
  size?: 'sm' | 'base' | 'lg';
  showLabels?: boolean;
  className?: string;
}

// ============================================
// MODE TOGGLE COMPONENT
// ============================================

interface ModeToggleProps {
  size?: 'sm' | 'base' | 'lg';
  showLabel?: boolean;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ size = 'base', showLabel = true }) => {
  const { theme, toggleMode, isSystemDarkMode } = useTheme();
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    base: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <span className="text-sm font-medium text-machinery-700">
          Theme Mode
        </span>
      )}
      
      <button
        onClick={toggleMode}
        className={cn(
          'relative rounded-lg border-2 border-machinery-200 bg-white transition-all duration-200',
          'hover:border-steel-300 focus:outline-none focus:ring-2 focus:ring-steel-500 focus:ring-offset-2',
          'flex items-center justify-center',
          sizeClasses[size]
        )}
        aria-label={`Switch to ${theme.mode === 'light' ? 'dark' : 'light'} mode`}
        title={`Current: ${theme.mode} mode${isSystemDarkMode ? ' (system prefers dark)' : ''}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme.mode}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <HugeiconsIcon
              icon={theme.mode === 'light' ? Sun03Icon : Moon02Icon}
              size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20}
              className={cn(
                'transition-colors',
                theme.mode === 'light' ? 'text-warning-500' : 'text-steel-400'
              )}
            />
          </motion.div>
        </AnimatePresence>
      </button>
    </div>
  );
};

// ============================================
// DENSITY SELECTOR COMPONENT
// ============================================

interface DensitySelectorProps {
  size?: 'sm' | 'base' | 'lg';
  showLabel?: boolean;
}

const DensitySelector: React.FC<DensitySelectorProps> = ({ size = 'base', showLabel = true }) => {
  const { theme, setDensity } = useTheme();
  
  const densityOptions = [
    { value: 'compact', label: 'Compact', icon: GridIcon },
    { value: 'comfortable', label: 'Comfortable', icon: Layout02Icon },
    { value: 'spacious', label: 'Spacious', icon: DistributeVerticalCenterIcon },
  ] as const;

  return (
    <div className="space-y-2">
      {showLabel && (
        <span className="text-sm font-medium text-machinery-700">
          Density
        </span>
      )}
      
      <div className="flex gap-1 p-1 bg-machinery-50 rounded-lg border border-machinery-200">
        {densityOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setDensity(option.value)}
            className={cn(
              'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-steel-500 focus:ring-offset-1',
              theme.density === option.value
                ? 'bg-white text-steel-700 shadow-sm border border-steel-200'
                : 'text-machinery-600 hover:text-machinery-800 hover:bg-machinery-100'
            )}
            aria-label={`Set density to ${option.label}`}
            title={option.label}
          >
            <HugeiconsIcon icon={option.icon} size={16} className="mx-auto" />
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================
// COLOR PICKER COMPONENT
// ============================================

interface ColorPickerProps {
  size?: 'sm' | 'base' | 'lg';
  showLabel?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ size = 'base', showLabel = true }) => {
  const { theme, setPrimaryColor } = useTheme();
  
  const colorOptions = [
    { key: 'steelBlue', name: 'Steel Blue', color: '#475569' },
    { key: 'safetyOrange', name: 'Safety Orange', color: '#ea580c' },
    { key: 'industrialGreen', name: 'Industrial Green', color: '#059669' },
    { key: 'machineryGray', name: 'Machinery Gray', color: '#6b7280' },
    { key: 'warningRed', name: 'Warning Red', color: '#dc2626' },
    { key: 'maintenanceYellow', name: 'Maintenance Yellow', color: '#d97706' },
  ] as const;

  return (
    <div className="space-y-2">
      {showLabel && (
        <span className="text-sm font-medium text-machinery-700">
          Primary Color
        </span>
      )}
      
      <div className="grid grid-cols-3 gap-2">
        {colorOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => setPrimaryColor(option.key as any)}
            className={cn(
              'w-8 h-8 rounded-lg border-2 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-steel-500 focus:ring-offset-2',
              'hover:scale-110',
              theme.primaryColor === option.key
                ? 'border-steel-400 shadow-md'
                : 'border-machinery-200 hover:border-machinery-300'
            )}
            style={{ backgroundColor: option.color }}
            aria-label={`Set primary color to ${option.name}`}
            title={option.name}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================
// BORDER RADIUS SELECTOR COMPONENT
// ============================================

interface BorderRadiusSelectorProps {
  size?: 'sm' | 'base' | 'lg';
  showLabel?: boolean;
}

const BorderRadiusSelector: React.FC<BorderRadiusSelectorProps> = ({ 
  size = 'base', 
  showLabel = true 
}) => {
  const { theme, setBorderRadius } = useTheme();
  
  const radiusOptions = [
    { value: 'sharp', label: 'Sharp', icon: SquareIcon },
    { value: 'rounded', label: 'Rounded', icon: RoundedRectangleIcon },
    { value: 'soft', label: 'Soft', icon: CircleIcon },
  ] as const;

  return (
    <div className="space-y-2">
      {showLabel && (
        <span className="text-sm font-medium text-machinery-700">
          Border Radius
        </span>
      )}
      
      <div className="flex gap-1 p-1 bg-machinery-50 rounded-lg border border-machinery-200">
        {radiusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setBorderRadius(option.value)}
            className={cn(
              'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-steel-500 focus:ring-offset-1',
              theme.borderRadius === option.value
                ? 'bg-white text-steel-700 shadow-sm border border-steel-200'
                : 'text-machinery-600 hover:text-machinery-800 hover:bg-machinery-100'
            )}
            aria-label={`Set border radius to ${option.label}`}
            title={option.label}
          >
            <HugeiconsIcon icon={option.icon} size={16} className="mx-auto" />
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================
// THEME CONTROLS DROPDOWN
// ============================================

const ThemeControlsDropdown: React.FC<ThemeControlsProps> = ({ 
  size = 'base', 
  showLabels = true,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { resetTheme } = useTheme();

  return (
    <div className={cn('relative', className)}>
      <ProfessionalButton
        variant="outline"
        size={size === 'lg' ? 'base' : 'sm'}
        icon={PaletteIcon}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Theme settings"
        aria-expanded={isOpen}
      >
        Theme
      </ProfessionalButton>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-machinery-200 p-6 z-50"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-machinery-900">
                    Theme Settings
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-machinery-100 rounded transition-colors"
                    aria-label="Close theme settings"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={16} className="text-machinery-500" />
                  </button>
                </div>
                
                <ModeToggle size={size} showLabel={showLabels} />
                <DensitySelector size={size} showLabel={showLabels} />
                <ColorPicker size={size} showLabel={showLabels} />
                <BorderRadiusSelector size={size} showLabel={showLabels} />
                
                <div className="pt-4 border-t border-machinery-200">
                  <ProfessionalButton
                    variant="outline"
                    size="sm"
                    icon={RefreshIcon}
                    onClick={() => {
                      resetTheme();
                      setIsOpen(false);
                    }}
                    className="w-full"
                  >
                    Reset to Default
                  </ProfessionalButton>
                </div>
              </div>
            </motion.div>
            
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// THEME CONTROLS PANEL
// ============================================

const ThemeControlsPanel: React.FC<ThemeControlsProps> = ({ 
  size = 'base', 
  showLabels = true,
  className 
}) => {
  const { resetTheme } = useTheme();

  return (
    <div className={cn('bg-white rounded-lg border border-machinery-200 p-6', className)}>
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-machinery-900">
          Theme Settings
        </h3>
        
        <ModeToggle size={size} showLabel={showLabels} />
        <DensitySelector size={size} showLabel={showLabels} />
        <ColorPicker size={size} showLabel={showLabels} />
        <BorderRadiusSelector size={size} showLabel={showLabels} />
        
        <div className="pt-4 border-t border-machinery-200">
          <ProfessionalButton
            variant="outline"
            size="sm"
            icon={RefreshIcon}
            onClick={resetTheme}
            className="w-full"
          >
            Reset to Default
          </ProfessionalButton>
        </div>
      </div>
    </div>
  );
};

// ============================================
// THEME CONTROLS INLINE
// ============================================

const ThemeControlsInline: React.FC<ThemeControlsProps> = ({ 
  size = 'base', 
  showLabels = false,
  className 
}) => {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <ModeToggle size={size} showLabel={showLabels} />
      <div className="w-px h-6 bg-machinery-200" />
      <DensitySelector size={size} showLabel={showLabels} />
    </div>
  );
};

// ============================================
// MAIN THEME CONTROLS COMPONENT
// ============================================

const ThemeControls: React.FC<ThemeControlsProps> = ({ 
  variant = 'dropdown',
  ...props 
}) => {
  switch (variant) {
    case 'panel':
      return <ThemeControlsPanel {...props} />;
    case 'inline':
      return <ThemeControlsInline {...props} />;
    default:
      return <ThemeControlsDropdown {...props} />;
  }
};

// ============================================
// EXPORTS
// ============================================

export default ThemeControls;
export { ModeToggle, DensitySelector, ColorPicker, BorderRadiusSelector };
export type { ThemeControlsProps };