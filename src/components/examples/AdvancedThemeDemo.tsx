/**
 * Advanced Theme System Demo
 * 
 * Demonstrates the comprehensive advanced theme system capabilities
 * including theme switching, brand customization, and accessibility features.
 */

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import ProfessionalButton from '@/components/ui/ProfessionalButton';
import ProfessionalCard from '@/components/ui/ProfessionalCard';
import { ProfessionalDataTable } from '@/components/advanced';
import { AdvancedThemeControls } from '@/components/advanced';
import { useAdvancedTheme } from '@/theme/advanced-theme-system';

// ============================================
// DEMO COMPONENT
// ============================================

const AdvancedThemeDemo: React.FC = () => {
  const [showThemeControls, setShowThemeControls] = useState(false);
  const { theme, applyPreset, applyBrandTheme } = useAdvancedTheme();

  // Sample data for demonstration
  const sampleData = [
    { id: 1, equipment: 'Pump A-101', status: 'Running', lastMaintenance: '2024-01-15', priority: 'High' },
    { id: 2, equipment: 'Motor B-202', status: 'Maintenance', lastMaintenance: '2024-01-10', priority: 'Medium' },
    { id: 3, equipment: 'Valve C-303', status: 'Stopped', lastMaintenance: '2024-01-05', priority: 'Low' },
  ];

  const columns = [
    { key: 'equipment', label: 'Equipment', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'lastMaintenance', label: 'Last Maintenance', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
  ];

  return (
    <div className="min-h-screen bg-machinery-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-machinery-900">
              Advanced Theme System Demo
            </h1>
            <p className="text-machinery-600 mt-2">
              Experience the comprehensive theming capabilities of the Professional CMMS Design System
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <ProfessionalButton
              variant="outline"
              icon="tabler:palette"
              onClick={() => setShowThemeControls(!showThemeControls)}
            >
              Theme Settings
            </ProfessionalButton>
          </div>
        </div>

        {/* Theme Controls Panel */}
        {showThemeControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <AdvancedThemeControls
              variant="panel"
              onClose={() => setShowThemeControls(false)}
            />
          </motion.div>
        )}

        {/* Current Theme Info */}
        <ProfessionalCard className="p-6">
          <h2 className="text-xl font-semibold text-machinery-900 mb-4">
            Current Theme Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-machinery-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-machinery-600">Mode</div>
              <div className="text-lg font-semibold text-machinery-900 capitalize">
                {theme.mode}
              </div>
            </div>
            
            <div className="bg-machinery-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-machinery-600">Density</div>
              <div className="text-lg font-semibold text-machinery-900 capitalize">
                {theme.density}
              </div>
            </div>
            
            <div className="bg-machinery-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-machinery-600">Brand</div>
              <div className="text-lg font-semibold text-machinery-900">
                {theme.brand.name}
              </div>
            </div>
            
            <div className="bg-machinery-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-machinery-600">Color Scheme</div>
              <div className="text-lg font-semibold text-machinery-900 capitalize">
                {theme.colorScheme}
              </div>
            </div>
          </div>
        </ProfessionalCard>

        {/* Quick Theme Presets */}
        <ProfessionalCard className="p-6">
          <h2 className="text-xl font-semibold text-machinery-900 mb-4">
            Quick Theme Presets
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <ProfessionalButton
              variant="outline"
              size="sm"
              onClick={() => applyPreset('default')}
              className="justify-start"
            >
              <Icon icon="tabler:sun" className="w-4 h-4 mr-2" />
              Default
            </ProfessionalButton>
            
            <ProfessionalButton
              variant="outline"
              size="sm"
              onClick={() => applyPreset('darkMode')}
              className="justify-start"
            >
              <Icon icon="tabler:moon" className="w-4 h-4 mr-2" />
              Dark Mode
            </ProfessionalButton>
            
            <ProfessionalButton
              variant="outline"
              size="sm"
              onClick={() => applyPreset('highContrast')}
              className="justify-start"
            >
              <Icon icon="tabler:contrast" className="w-4 h-4 mr-2" />
              High Contrast
            </ProfessionalButton>
            
            <ProfessionalButton
              variant="outline"
              size="sm"
              onClick={() => applyPreset('compact')}
              className="justify-start"
            >
              <Icon icon="tabler:layout-grid" className="w-4 h-4 mr-2" />
              Compact
            </ProfessionalButton>
            
            <ProfessionalButton
              variant="outline"
              size="sm"
              onClick={() => applyPreset('colorblindFriendly')}
              className="justify-start"
            >
              <Icon icon="tabler:accessibility" className="w-4 h-4 mr-2" />
              Colorblind
            </ProfessionalButton>
          </div>
        </ProfessionalCard>

        {/* Brand Themes */}
        <ProfessionalCard className="p-6">
          <h2 className="text-xl font-semibold text-machinery-900 mb-4">
            Industry Brand Themes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => applyBrandTheme('industrial')}
              className="p-4 border-2 border-machinery-200 rounded-lg hover:border-steel-300 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 bg-steel-500 rounded"></div>
                <div className="font-semibold text-machinery-900">Industrial</div>
              </div>
              <div className="text-sm text-machinery-600">
                Steel blue and machinery gray palette for industrial environments
              </div>
            </button>
            
            <button
              onClick={() => applyBrandTheme('safety')}
              className="p-4 border-2 border-machinery-200 rounded-lg hover:border-steel-300 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 bg-safety-500 rounded"></div>
                <div className="font-semibold text-machinery-900">Safety</div>
              </div>
              <div className="text-sm text-machinery-600">
                Safety orange and warning red focus for safety-critical operations
              </div>
            </button>
            
            <button
              onClick={() => applyBrandTheme('eco')}
              className="p-4 border-2 border-machinery-200 rounded-lg hover:border-steel-300 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 bg-industrial-500 rounded"></div>
                <div className="font-semibold text-machinery-900">Eco</div>
              </div>
              <div className="text-sm text-machinery-600">
                Industrial green and sustainable colors for eco-friendly operations
              </div>
            </button>
          </div>
        </ProfessionalCard>

        {/* Component Showcase */}
        <ProfessionalCard className="p-6">
          <h2 className="text-xl font-semibold text-machinery-900 mb-4">
            Component Showcase
          </h2>
          
          <div className="space-y-6">
            {/* Buttons */}
            <div>
              <h3 className="text-lg font-medium text-machinery-800 mb-3">Buttons</h3>
              <div className="flex flex-wrap gap-3">
                <ProfessionalButton variant="primary">Primary</ProfessionalButton>
                <ProfessionalButton variant="secondary">Secondary</ProfessionalButton>
                <ProfessionalButton variant="outline">Outline</ProfessionalButton>
                <ProfessionalButton variant="ghost">Ghost</ProfessionalButton>
                <ProfessionalButton variant="danger">Danger</ProfessionalButton>
              </div>
            </div>

            {/* Data Table */}
            <div>
              <h3 className="text-lg font-medium text-machinery-800 mb-3">Data Table</h3>
              <ProfessionalDataTable
                data={sampleData}
                columns={columns}
                searchable
                filterable
                exportable
                className="max-h-64"
              />
            </div>
          </div>
        </ProfessionalCard>

        {/* Accessibility Features */}
        <ProfessionalCard className="p-6">
          <h2 className="text-xl font-semibold text-machinery-900 mb-4">
            Accessibility Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-machinery-800 mb-3">Current Settings</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-machinery-50 rounded">
                  <span className="text-sm text-machinery-700">High Contrast</span>
                  <span className={cn(
                    "text-sm font-medium",
                    theme.accessibility.highContrast ? "text-industrial-600" : "text-machinery-500"
                  )}>
                    {theme.accessibility.highContrast ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-machinery-50 rounded">
                  <span className="text-sm text-machinery-700">Reduced Motion</span>
                  <span className={cn(
                    "text-sm font-medium",
                    theme.accessibility.reducedMotion ? "text-industrial-600" : "text-machinery-500"
                  )}>
                    {theme.accessibility.reducedMotion ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-machinery-50 rounded">
                  <span className="text-sm text-machinery-700">Focus Indicators</span>
                  <span className={cn(
                    "text-sm font-medium",
                    theme.accessibility.focusVisible ? "text-industrial-600" : "text-machinery-500"
                  )}>
                    {theme.accessibility.focusVisible ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-machinery-800 mb-3">WCAG Compliance</h3>
              <div className="space-y-2 text-sm text-machinery-600">
                <div className="flex items-center gap-2">
                  <Icon icon="tabler:check" className="w-4 h-4 text-industrial-600" />
                  <span>Color contrast ratios meet WCAG AA standards</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="tabler:check" className="w-4 h-4 text-industrial-600" />
                  <span>Keyboard navigation support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="tabler:check" className="w-4 h-4 text-industrial-600" />
                  <span>Screen reader compatibility</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="tabler:check" className="w-4 h-4 text-industrial-600" />
                  <span>Motion sensitivity options</span>
                </div>
              </div>
            </div>
          </div>
        </ProfessionalCard>
      </div>
    </div>
  );
};

export default AdvancedThemeDemo;