/**
 * Component Documentation System
 * 
 * A comprehensive documentation system for the professional design system
 * that provides interactive examples, prop documentation, accessibility
 * guidelines, and implementation guides for all components.
 */

import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  ProfessionalCard,
  ProfessionalButton,
  ProfessionalInput,
  ProfessionalBadge,
  ThemeControls
} from '@/components/ui';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/layout/ResponsiveGrid';

// ============================================
// DOCUMENTATION INTERFACES
// ============================================

export interface PropDefinition {
  name: string;
  type: string;
  required?: boolean;
  defaultValue?: string;
  description: string;
  options?: string[];
}

export interface ComponentExample {
  title: string;
  description?: string;
  code: string;
  component: React.ReactNode;
  props?: Record<string, any>;
}

export interface AccessibilityGuideline {
  title: string;
  description: string;
  level: 'A' | 'AA' | 'AAA';
  implementation: string;
}

export interface ComponentDocumentationProps {
  name: string;
  description: string;
  category: string;
  props: PropDefinition[];
  examples: ComponentExample[];
  accessibility: AccessibilityGuideline[];
  usage: {
    installation: string;
    basicUsage: string;
    bestPractices: string[];
    commonMistakes: string[];
  };
  relatedComponents?: string[];
}

// ============================================
// CODE BLOCK COMPONENT
// ============================================

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  copyable?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'tsx',
  title,
  copyable = true,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <div className="bg-machinery-900 rounded-lg overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-machinery-800 border-b border-machinery-700">
          <span className="text-sm font-medium text-machinery-200">{title}</span>
          {copyable && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-2 py-1 text-xs text-machinery-300 hover:text-white transition-colors"
            >
              <Icon 
                icon={copied ? "tabler:check" : "tabler:copy"} 
                className="w-4 h-4" 
              />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-machinery-100 font-mono">
          {code}
        </code>
      </pre>
    </div>
  );
};

// ============================================
// PROP TABLE COMPONENT
// ============================================

interface PropTableProps {
  props: PropDefinition[];
}

const PropTable: React.FC<PropTableProps> = ({ props }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-machinery-50 border-b border-machinery-200">
            <th className="text-left p-3 font-semibold text-machinery-700">Name</th>
            <th className="text-left p-3 font-semibold text-machinery-700">Type</th>
            <th className="text-left p-3 font-semibold text-machinery-700">Default</th>
            <th className="text-left p-3 font-semibold text-machinery-700">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop, index) => (
            <tr key={prop.name} className={cn(
              'border-b border-machinery-100',
              index % 2 === 0 && 'bg-machinery-25'
            )}>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <code className="px-2 py-1 bg-steel-100 text-steel-700 rounded text-sm font-mono">
                    {prop.name}
                  </code>
                  {prop.required && (
                    <span className="text-xs text-error-600 font-medium">required</span>
                  )}
                </div>
              </td>
              <td className="p-3">
                <code className="text-sm text-machinery-600 font-mono">
                  {prop.type}
                </code>
                {prop.options && (
                  <div className="mt-1 text-xs text-machinery-500">
                    Options: {prop.options.join(', ')}
                  </div>
                )}
              </td>
              <td className="p-3">
                {prop.defaultValue ? (
                  <code className="text-sm text-machinery-600 font-mono">
                    {prop.defaultValue}
                  </code>
                ) : (
                  <span className="text-sm text-machinery-400">—</span>
                )}
              </td>
              <td className="p-3 text-sm text-machinery-700">
                {prop.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================
// EXAMPLE SHOWCASE COMPONENT
// ============================================

interface ExampleShowcaseProps {
  examples: ComponentExample[];
}

const ExampleShowcase: React.FC<ExampleShowcaseProps> = ({ examples }) => {
  const [activeExample, setActiveExample] = useState(0);

  return (
    <div className="space-y-6">
      {/* Example Tabs */}
      <div className="flex flex-wrap gap-2">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => setActiveExample(index)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeExample === index
                ? 'bg-steel-600 text-white'
                : 'bg-machinery-100 text-machinery-700 hover:bg-machinery-200'
            )}
          >
            {example.title}
          </button>
        ))}
      </div>

      {/* Active Example */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeExample}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {examples[activeExample] && (
            <div className="space-y-4">
              {examples[activeExample].description && (
                <p className="text-machinery-600">
                  {examples[activeExample].description}
                </p>
              )}

              {/* Live Preview */}
              <ProfessionalCard>
                <div className="p-6 bg-gradient-to-br from-machinery-25 to-steel-25">
                  <div className="flex items-center justify-center min-h-[120px]">
                    {examples[activeExample].component}
                  </div>
                </div>
              </ProfessionalCard>

              {/* Code */}
              <CodeBlock
                code={examples[activeExample].code}
                title="Code Example"
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ============================================
// ACCESSIBILITY GUIDELINES COMPONENT
// ============================================

interface AccessibilityGuidelinesProps {
  guidelines: AccessibilityGuideline[];
}

const AccessibilityGuidelines: React.FC<AccessibilityGuidelinesProps> = ({ guidelines }) => {
  const levelColors = {
    A: 'bg-success-100 text-success-700 border-success-200',
    AA: 'bg-warning-100 text-warning-700 border-warning-200',
    AAA: 'bg-error-100 text-error-700 border-error-200',
  };

  return (
    <div className="space-y-4">
      {guidelines.map((guideline, index) => (
        <div key={index} className="border border-machinery-200 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <span className={cn(
              'px-2 py-1 text-xs font-bold rounded border',
              levelColors[guideline.level]
            )}>
              WCAG {guideline.level}
            </span>
            <div className="flex-1">
              <h4 className="font-semibold text-machinery-900 mb-1">
                {guideline.title}
              </h4>
              <p className="text-sm text-machinery-600">
                {guideline.description}
              </p>
            </div>
          </div>
          
          <div className="mt-3">
            <h5 className="text-sm font-medium text-machinery-700 mb-2">
              Implementation:
            </h5>
            <CodeBlock
              code={guideline.implementation}
              language="tsx"
              copyable={false}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================
// USAGE GUIDELINES COMPONENT
// ============================================

interface UsageGuidelinesProps {
  usage: ComponentDocumentationProps['usage'];
}

const UsageGuidelines: React.FC<UsageGuidelinesProps> = ({ usage }) => {
  return (
    <div className="space-y-6">
      {/* Installation */}
      <div>
        <h3 className="text-lg font-semibold text-machinery-900 mb-3">
          Installation
        </h3>
        <CodeBlock
          code={usage.installation}
          language="bash"
          title="Install Component"
        />
      </div>

      {/* Basic Usage */}
      <div>
        <h3 className="text-lg font-semibold text-machinery-900 mb-3">
          Basic Usage
        </h3>
        <CodeBlock
          code={usage.basicUsage}
          title="Basic Implementation"
        />
      </div>

      {/* Best Practices */}
      <div>
        <h3 className="text-lg font-semibold text-machinery-900 mb-3">
          Best Practices
        </h3>
        <div className="space-y-2">
          {usage.bestPractices.map((practice, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-success-50 border border-success-200 rounded-lg">
              <Icon icon="tabler:check" className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-success-800">{practice}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Common Mistakes */}
      <div>
        <h3 className="text-lg font-semibold text-machinery-900 mb-3">
          Common Mistakes
        </h3>
        <div className="space-y-2">
          {usage.commonMistakes.map((mistake, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-error-50 border border-error-200 rounded-lg">
              <Icon icon="tabler:x" className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-error-800">{mistake}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT DOCUMENTATION
// ============================================

const ComponentDocumentation: React.FC<ComponentDocumentationProps> = ({
  name,
  description,
  category,
  props,
  examples,
  accessibility,
  usage,
  relatedComponents = [],
}) => {
  const [activeTab, setActiveTab] = useState('examples');

  const tabs = [
    { id: 'examples', label: 'Examples', icon: 'tabler:code' },
    { id: 'props', label: 'Props', icon: 'tabler:settings' },
    { id: 'accessibility', label: 'Accessibility', icon: 'tabler:accessible' },
    { id: 'usage', label: 'Usage', icon: 'tabler:book' },
  ];

  return (
    <ResponsiveContainer maxWidth="7xl" className="py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-machinery-200 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-steel-100 text-steel-700 rounded-full text-sm font-medium">
              {category}
            </span>
            <ThemeControls variant="inline" />
          </div>
          
          <h1 className="text-4xl font-bold text-machinery-900 mb-3">
            {name}
          </h1>
          
          <p className="text-lg text-machinery-600 max-w-3xl">
            {description}
          </p>

          {relatedComponents.length > 0 && (
            <div className="mt-4">
              <span className="text-sm font-medium text-machinery-700 mr-3">
                Related Components:
              </span>
              <div className="inline-flex flex-wrap gap-2">
                {relatedComponents.map((component) => (
                  <ProfessionalBadge key={component} variant="neutral" size="sm">
                    {component}
                  </ProfessionalBadge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-machinery-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2',
                activeTab === tab.id
                  ? 'text-steel-600 border-steel-600'
                  : 'text-machinery-600 border-transparent hover:text-machinery-800 hover:border-machinery-300'
              )}
            >
              <Icon icon={tab.icon} className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'examples' && (
              <div>
                <h2 className="text-2xl font-semibold text-machinery-900 mb-6">
                  Interactive Examples
                </h2>
                <ExampleShowcase examples={examples} />
              </div>
            )}

            {activeTab === 'props' && (
              <div>
                <h2 className="text-2xl font-semibold text-machinery-900 mb-6">
                  Component Props
                </h2>
                <ProfessionalCard>
                  <PropTable props={props} />
                </ProfessionalCard>
              </div>
            )}

            {activeTab === 'accessibility' && (
              <div>
                <h2 className="text-2xl font-semibold text-machinery-900 mb-6">
                  Accessibility Guidelines
                </h2>
                <AccessibilityGuidelines guidelines={accessibility} />
              </div>
            )}

            {activeTab === 'usage' && (
              <div>
                <h2 className="text-2xl font-semibold text-machinery-900 mb-6">
                  Usage Guidelines
                </h2>
                <UsageGuidelines usage={usage} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </ResponsiveContainer>
  );
};

// ============================================
// EXPORTS
// ============================================

export default ComponentDocumentation;
export {
  CodeBlock,
  PropTable,
  ExampleShowcase,
  AccessibilityGuidelines,
  UsageGuidelines,
};

export type {
  ComponentDocumentationProps,
  PropDefinition,
  ComponentExample,
  AccessibilityGuideline,
};