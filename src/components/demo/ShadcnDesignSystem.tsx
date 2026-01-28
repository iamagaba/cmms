import { Info } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';



// Design System Sections
import TypographyHierarchySection from './design-system/TypographyHierarchySection';
import SpacingSystemSection from './design-system/SpacingSystemSection';
import ColorUsageGuidelinesSection from './design-system/ColorUsageGuidelinesSection';
import IconUsageGuidelinesSection from './design-system/IconUsageGuidelinesSection';
import TouchTargetSizesSection from './design-system/TouchTargetSizesSection';
import DesignTokensSection from './design-system/DesignTokensSection';


import CoreComponentsSection from './design-system/CoreComponentsSection';

import PatternsSection from './design-system/PatternsSection';
import LoadingStatesSection from './design-system/LoadingStatesSection';
import ErrorStatesSection from './design-system/ErrorStatesSection';
import DataTablePatternsSection from './design-system/DataTablePatternsSection';
import FormValidationPatternsSection from './design-system/FormValidationPatternsSection';
import CommonCMMSPatternsSection from './design-system/CommonCMMSPatternsSection';

import ComponentUsageGuideSection from './design-system/ComponentUsageGuideSection';
import DosAndDontsSection from './design-system/DosAndDontsSection';
import ResponsivePatternsSection from './design-system/ResponsivePatternsSection';
import CopywritingGuidelinesSection from './design-system/CopywritingGuidelinesSection';
import CodeSnippetsSection from './design-system/CodeSnippetsSection';

const ShadcnDesignSystem: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-12 max-w-[1200px]">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Professional CMMS Design System</h1>
          <p className="text-lg text-gray-600 mt-2">
            A comprehensive design system built with shadcn/ui and Tailwind CSS, featuring the new Nova visual style.
            This system provides the building blocks for consistent, accessible, and professional interfaces.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button variant="outline" asChild>
            <a href="#foundation">Foundation</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="#components">Components</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="#patterns">Patterns</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="#guidelines">Guidelines</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="#tokens">Design Tokens</a>
          </Button>
        </div>
      </div>

      {/* Section 1: Foundation */}
      <section id="foundation" className="space-y-8">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">1. Foundation</h2>
          <p className="text-gray-600">Core visual elements and design tokens.</p>
        </div>
        <div className="space-y-8">
          <ColorUsageGuidelinesSection />
          <TypographyHierarchySection />
          <SpacingSystemSection />
          <IconUsageGuidelinesSection />
          <TouchTargetSizesSection />
        </div>
      </section>

      {/* Section 2: Core Components */}
      <section id="components" className="space-y-8">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">2. Core Components</h2>
          <p className="text-gray-600">Standard UI components with Nova styling.</p>
        </div>
        <CoreComponentsSection />
      </section>

      {/* Section 3: UI Patterns */}
      <section id="patterns" className="space-y-8">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">3. UI Patterns</h2>
          <p className="text-gray-600">Complex interactions and common workflows.</p>
        </div>
        <div className="space-y-8">
          <PatternsSection />
          <DataTablePatternsSection />
          <LoadingStatesSection />
          <ErrorStatesSection />
          <FormValidationPatternsSection />
          <CommonCMMSPatternsSection />
        </div>
      </section>

      {/* Section 4: Guidelines */}
      <section id="guidelines" className="space-y-8">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">4. Guidelines</h2>
          <p className="text-gray-600">Best practices for usage, accessibility, and content.</p>
        </div>
        <div className="space-y-8">
          <ComponentUsageGuideSection />
          <DosAndDontsSection />
          <ResponsivePatternsSection />
          <CopywritingGuidelinesSection />
          <CodeSnippetsSection />
        </div>
      </section>

      {/* Section 5: Design Tokens */}
      <section id="tokens" className="space-y-8">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">5. Live Design Tokens</h2>
          <p className="text-gray-600">The actual CSS variables currently computed by the browser.</p>
        </div>
        <DesignTokensSection />
      </section>

      {/* Footer */}
      <div className="mt-16 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <Info className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Legacy Design System</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          The legacy design system is still available for reference during the migration.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" size="sm" asChild>
            <a href="/design-system" target="_blank" rel="noopener noreferrer">
              View Legacy System <LinkSquare02Icon className="w-4 h-4 ml-2" />
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="https://ui.shadcn.com" target="_blank" rel="noopener noreferrer">
              shadcn/ui Documentation <LinkSquare02Icon className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShadcnDesignSystem;



