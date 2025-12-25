/**
 * Theme System Demo Component
 * 
 * A comprehensive demonstration of the professional design system's
 * theme capabilities including mode switching, density options,
 * color customization, and component integration.
 */

import React from 'react';
import { Icon } from '@iconify/react';
import { useTheme } from '@/providers/ThemeProvider';
import { 
  ThemeControls,
  ProfessionalButton,
  ProfessionalCard,
  ProfessionalInput,
  ProfessionalBadge,
  ProfessionalMetricCard,
  MetricCardGrid
} from '@/components/ui';

// ============================================
// THEME DEMO COMPONENT
// ============================================

const ThemeDemo: React.FC = () => {
  const { theme, cssVariables } = useTheme();

  // Sample data for metric cards
  const sampleMetrics = [
    {
      title: 'Active Work Orders',
      value: 24,
      unit: 'orders',
      changePercentage: 12.5,
      trendDirection: 'up' as const,
      icon: 'tabler:clipboard-list',
      color: 'primary' as const,
    },
    {
      title: 'Equipment Uptime',
      value: '98.2',
      unit: '%',
      changePercentage: -0.3,
      trendDirection: 'down' as const,
      icon: 'tabler:activity',
      color: 'success' as const,
    },
    {
      title: 'Maintenance Cost',
      value: '$12,450',
      changePercentage: -8.2,
      trendDirection: 'down' as const,
      icon: 'tabler:currency-dollar',
      color: 'warning' as const,
    },
    {
      title: 'Critical Alerts',
      value: 3,
      unit: 'alerts',
      changePercentage: 50,
      trendDirection: 'up' as const,
      icon: 'tabler:alert-triangle',
      color: 'error' as const,
      status: 'critical' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-machinery-25 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-machinery-900">
              Professional Design System
            </h1>
            <p className="text-machinery-600 mt-2">
              Theme System Demonstration
            </p>
          </div>
          
          <ThemeControls variant="dropdown" />
        </div>

        {/* Current Theme Info */}
        <ProfessionalCard>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-machinery-900 mb-4">
              Current Theme Configuration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-machinery-700">Mode</label>
                <div className="flex items-center gap-2">
                  <Icon 
                    icon={theme.mode === 'light' ? 'tabler:sun' : 'tabler:moon'} 
                    className="w-4 h-4 text-machinery-500" 
                  />
                  <span className="text-machinery-900 capitalize">{theme.mode}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-machinery-700">Density</label>
                <div className="flex items-center gap-2">
                  <Icon 
                    icon="tabler:layout-2" 
                    className="w-4 h-4 text-machinery-500" 
                  />
                  <span className="text-machinery-900 capitalize">{theme.density}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-machinery-700">Primary Color</label>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-steel-600 rounded border border-machinery-200" />
                  <span className="text-machinery-900">{theme.primaryColor}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-machinery-700">Border Radius</label>
                <div className="flex items-center gap-2">
                  <Icon 
                    icon={
                      theme.borderRadius === 'sharp' ? 'tabler:square' :
                      theme.borderRadius === 'soft' ? 'tabler:circle' : 'tabler:square-rounded'
                    }
                    className="w-4 h-4 text-machinery-500" 
                  />
                  <span className="text-machinery-900 capitalize">{theme.borderRadius}</span>
                </div>
              </div>
            </div>
          </div>
        </ProfessionalCard>

        {/* Metric Cards Demo */}
        <div>
          <h2 className="text-2xl font-semibold text-machinery-900 mb-6">
            Dashboard Metrics
          </h2>
          
          <MetricCardGrid columns={4} gap="lg">
            {sampleMetrics.map((metric, index) => (
              <ProfessionalMetricCard
                key={index}
                {...metric}
                variant="detailed"
                size={theme.density === 'compact' ? 'sm' : theme.density === 'spacious' ? 'lg' : 'base'}
              />
            ))}
          </MetricCardGrid>
        </div>

        {/* Component Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Buttons Demo */}
          <ProfessionalCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-machinery-900 mb-4">
                Button Components
              </h3>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <ProfessionalButton variant="primary" icon="tabler:plus">
                    Primary
                  </ProfessionalButton>
                  <ProfessionalButton variant="secondary" icon="tabler:edit">
                    Secondary
                  </ProfessionalButton>
                  <ProfessionalButton variant="outline" icon="tabler:download">
                    Outline
                  </ProfessionalButton>
                  <ProfessionalButton variant="ghost" icon="tabler:settings">
                    Ghost
                  </ProfessionalButton>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <ProfessionalButton variant="danger" icon="tabler:trash">
                    Danger
                  </ProfessionalButton>
                  <ProfessionalButton variant="primary" loading>
                    Loading
                  </ProfessionalButton>
                  <ProfessionalButton variant="outline" disabled>
                    Disabled
                  </ProfessionalButton>
                </div>
              </div>
            </div>
          </ProfessionalCard>

          {/* Form Components Demo */}
          <ProfessionalCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-machinery-900 mb-4">
                Form Components
              </h3>
              
              <div className="space-y-4">
                <ProfessionalInput
                  label="Equipment Name"
                  placeholder="Enter equipment name"
                  icon="tabler:device-desktop"
                />
                
                <ProfessionalInput
                  label="Serial Number"
                  placeholder="Enter serial number"
                  icon="tabler:hash"
                  helperText="Unique identifier for the equipment"
                />
                
                <ProfessionalInput
                  label="Status"
                  type="select"
                  placeholder="Select status"
                  icon="tabler:status-change"
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'maintenance', label: 'Under Maintenance' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                />
              </div>
            </div>
          </ProfessionalCard>
        </div>

        {/* Badges Demo */}
        <ProfessionalCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-machinery-900 mb-4">
              Status Badges
            </h3>
            
            <div className="flex flex-wrap gap-3">
              <ProfessionalBadge variant="success" icon="tabler:check">
                Completed
              </ProfessionalBadge>
              <ProfessionalBadge variant="warning" icon="tabler:clock">
                In Progress
              </ProfessionalBadge>
              <ProfessionalBadge variant="error" icon="tabler:alert-circle">
                Critical
              </ProfessionalBadge>
              <ProfessionalBadge variant="info" icon="tabler:info-circle">
                Scheduled
              </ProfessionalBadge>
              <ProfessionalBadge variant="neutral" icon="tabler:minus">
                On Hold
              </ProfessionalBadge>
            </div>
          </div>
        </ProfessionalCard>

        {/* Theme Controls Panel */}
        <div>
          <h2 className="text-2xl font-semibold text-machinery-900 mb-6">
            Theme Customization
          </h2>
          
          <ThemeControls variant="panel" showLabels />
        </div>

        {/* CSS Variables Display */}
        <ProfessionalCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-machinery-900 mb-4">
              Active CSS Variables (Sample)
            </h3>
            
            <div className="bg-machinery-50 rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto theme-scrollbar">
              {Object.entries(cssVariables)
                .slice(0, 20)
                .map(([property, value]) => (
                  <div key={property} className="flex justify-between py-1">
                    <span className="text-steel-600">{property}:</span>
                    <span className="text-machinery-700">{value}</span>
                  </div>
                ))}
              <div className="text-machinery-500 text-center py-2">
                ... and {Object.keys(cssVariables).length - 20} more variables
              </div>
            </div>
          </div>
        </ProfessionalCard>
      </div>
    </div>
  );
};

export default ThemeDemo;