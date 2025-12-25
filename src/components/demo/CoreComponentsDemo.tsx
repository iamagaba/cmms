/**
 * Core Components Demo
 * 
 * Demonstrates the professional design system components including
 * buttons, inputs, and cards with various configurations and states.
 */

import React, { useState } from 'react';
import {
  ProfessionalButton,
  ProfessionalButtonGroup,
  ProfessionalIconButton,
  ProfessionalInput,
  ProfessionalTextarea,
  ProfessionalSelect,
  ProfessionalCard,
  MetricCard,
  DataCard,
  ActionCard,
  Container,
  CardGrid,
} from '../ui';

const CoreComponentsDemo: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const sampleData = [
    { label: 'Active Assets', value: '150', icon: 'tabler:device-desktop' },
    { label: 'Pending Repairs', value: '23', icon: 'tabler:tools' },
    { label: 'Completed Today', value: '8', icon: 'tabler:check' },
    { label: 'Overdue Tasks', value: '3', icon: 'tabler:alert-triangle' },
  ];

  return (
    <Container size="xl" className="py-8">
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-machinery-900 mb-4">
            Professional Design System Components
          </h1>
          <p className="text-lg text-machinery-600 max-w-2xl mx-auto">
            A comprehensive showcase of the CMMS professional design system components
            including buttons, inputs, cards, and layout elements.
          </p>
        </div>

        {/* Button Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-machinery-900">Button Components</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-machinery-700 mb-3">Button Variants</h3>
              <div className="flex flex-wrap gap-3">
                <ProfessionalButton variant="primary">Primary</ProfessionalButton>
                <ProfessionalButton variant="secondary">Secondary</ProfessionalButton>
                <ProfessionalButton variant="outline">Outline</ProfessionalButton>
                <ProfessionalButton variant="ghost">Ghost</ProfessionalButton>
                <ProfessionalButton variant="danger">Danger</ProfessionalButton>
                <ProfessionalButton variant="success">Success</ProfessionalButton>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-machinery-700 mb-3">Button Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <ProfessionalButton size="sm">Small</ProfessionalButton>
                <ProfessionalButton size="base">Base</ProfessionalButton>
                <ProfessionalButton size="lg">Large</ProfessionalButton>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-machinery-700 mb-3">Button States</h3>
              <div className="flex flex-wrap gap-3">
                <ProfessionalButton icon="tabler:plus">With Icon</ProfessionalButton>
                <ProfessionalButton iconRight="tabler:arrow-right">Icon Right</ProfessionalButton>
                <ProfessionalButton loading={loading} onClick={handleLoadingDemo}>
                  {loading ? 'Loading...' : 'Click for Loading'}
                </ProfessionalButton>
                <ProfessionalButton disabled>Disabled</ProfessionalButton>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-machinery-700 mb-3">Button Group & Icon Buttons</h3>
              <div className="flex flex-wrap items-center gap-6">
                <ProfessionalButtonGroup>
                  <ProfessionalButton variant="outline">Left</ProfessionalButton>
                  <ProfessionalButton variant="outline">Center</ProfessionalButton>
                  <ProfessionalButton variant="outline">Right</ProfessionalButton>
                </ProfessionalButtonGroup>
                
                <div className="flex gap-2">
                  <ProfessionalIconButton
                    icon="tabler:edit"
                    aria-label="Edit"
                    variant="outline"
                  />
                  <ProfessionalIconButton
                    icon="tabler:trash"
                    aria-label="Delete"
                    variant="danger"
                  />
                  <ProfessionalIconButton
                    icon="tabler:share"
                    aria-label="Share"
                    variant="ghost"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Input Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-machinery-900">Input Components</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <ProfessionalInput
                label="Text Input"
                placeholder="Enter some text..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                description="This is a helper text"
              />
              
              <ProfessionalInput
                label="Input with Icon"
                icon="tabler:search"
                placeholder="Search..."
              />
              
              <ProfessionalInput
                label="Error State"
                error="This field is required"
                placeholder="Required field"
                required
              />
              
              <ProfessionalInput
                label="Success State"
                success="Looks good!"
                placeholder="Valid input"
                defaultValue="Valid value"
              />
            </div>
            
            <div className="space-y-4">
              <ProfessionalSelect
                label="Select Dropdown"
                placeholder="Choose an option..."
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                options={[
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                ]}
              />
              
              <ProfessionalTextarea
                label="Textarea"
                placeholder="Enter a longer description..."
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                autoResize
                minRows={3}
                maxRows={6}
              />
              
              <ProfessionalInput
                label="Loading Input"
                loading
                placeholder="Loading..."
              />
            </div>
          </div>
        </section>

        {/* Card Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-machinery-900">Card Components</h2>
          
          <div className="space-y-8">
            {/* Basic Cards */}
            <div>
              <h3 className="text-lg font-medium text-machinery-700 mb-4">Basic Cards</h3>
              <CardGrid columns={{ default: 1, md: 2, lg: 3 }}>
                <ProfessionalCard
                  title="Default Card"
                  subtitle="Basic card with title and subtitle"
                  icon="tabler:info-circle"
                >
                  <p className="text-machinery-600">
                    This is a basic card with some content. It demonstrates the default styling
                    and layout of the professional card component.
                  </p>
                </ProfessionalCard>
                
                <ProfessionalCard
                  variant="elevated"
                  title="Elevated Card"
                  subtitle="Card with enhanced shadow"
                  interactive
                  onClick={() => alert('Card clicked!')}
                >
                  <p className="text-machinery-600">
                    This is an interactive elevated card. Click on it to see the interaction.
                  </p>
                </ProfessionalCard>
                
                <ProfessionalCard
                  variant="outlined"
                  title="Outlined Card"
                  actions={
                    <ProfessionalIconButton
                      icon="tabler:dots-vertical"
                      aria-label="More options"
                      variant="ghost"
                      size="sm"
                    />
                  }
                >
                  <p className="text-machinery-600">
                    This card has a prominent border and includes action buttons in the header.
                  </p>
                </ProfessionalCard>
              </CardGrid>
            </div>

            {/* Metric Cards */}
            <div>
              <h3 className="text-lg font-medium text-machinery-700 mb-4">Metric Cards</h3>
              <CardGrid columns={{ default: 1, sm: 2, lg: 4 }}>
                <MetricCard
                  value="150"
                  label="Total Assets"
                  icon="tabler:device-desktop"
                  theme="default"
                  change={{
                    value: '+12',
                    type: 'increase',
                    label: 'this month'
                  }}
                />
                
                <MetricCard
                  value="23"
                  label="Pending Repairs"
                  icon="tabler:tools"
                  theme="warning"
                  change={{
                    value: '-5',
                    type: 'decrease',
                    label: 'vs last week'
                  }}
                />
                
                <MetricCard
                  value="98.5%"
                  label="Uptime"
                  icon="tabler:chart-line"
                  theme="success"
                  change={{
                    value: '+0.3%',
                    type: 'increase',
                    label: 'improvement'
                  }}
                />
                
                <MetricCard
                  value="$12,450"
                  label="Monthly Costs"
                  icon="tabler:currency-dollar"
                  theme="info"
                  change={{
                    value: '0%',
                    type: 'neutral',
                    label: 'no change'
                  }}
                />
              </CardGrid>
            </div>

            {/* Data Card */}
            <div>
              <h3 className="text-lg font-medium text-machinery-700 mb-4">Data Card</h3>
              <div className="max-w-md">
                <DataCard
                  title="Asset Summary"
                  data={sampleData}
                  showDividers={true}
                />
              </div>
            </div>

            {/* Action Cards */}
            <div>
              <h3 className="text-lg font-medium text-machinery-700 mb-4">Action Cards</h3>
              <CardGrid columns={{ default: 1, md: 2 }}>
                <ActionCard
                  title="Create Work Order"
                  description="Start a new maintenance task for your assets"
                  icon="tabler:plus"
                  theme="default"
                  primaryAction={{
                    label: 'Create Order',
                    onClick: () => alert('Creating work order...'),
                    icon: 'tabler:plus',
                  }}
                  secondaryAction={{
                    label: 'View Templates',
                    onClick: () => alert('Opening templates...'),
                    icon: 'tabler:template',
                  }}
                />
                
                <ActionCard
                  title="Emergency Response"
                  description="Quickly respond to critical maintenance issues"
                  icon="tabler:alert-triangle"
                  theme="error"
                  primaryAction={{
                    label: 'Emergency Mode',
                    onClick: () => alert('Activating emergency mode...'),
                    icon: 'tabler:bolt',
                  }}
                />
              </CardGrid>
            </div>
          </div>
        </section>

        {/* Loading States */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-machinery-900">Loading States</h2>
          <CardGrid columns={{ default: 1, md: 3 }}>
            <ProfessionalCard loading />
            <ProfessionalCard loading />
            <ProfessionalCard loading />
          </CardGrid>
        </section>
      </div>
    </Container>
  );
};

export default CoreComponentsDemo;