/**
 * Loading Components Examples
 * 
 * Demonstration of the professional loading and skeleton components
 * for use in the CMMS application.
 */

import React, { useState } from 'react';
import LoadingSpinner, {
  Skeleton,
  LoadingState,
  LoadingButton,
  CardSkeleton,
  TableSkeleton,
  FormSkeleton,
  DashboardSkeleton,
} from './ProfessionalLoading';
import ProfessionalCard from './ProfessionalCard';

const LoadingExamples: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const handleToggleLoading = () => {
    setIsLoading(!isLoading);
  };

  const handleButtonClick = () => {
    setButtonLoading(true);
    setTimeout(() => {
      setButtonLoading(false);
    }, 2000);
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-machinery-900 mb-4">
          Professional Loading Components
        </h1>
        <p className="text-machinery-600 mb-8">
          Industrial-inspired loading states and skeleton patterns for the CMMS application
        </p>
      </div>

      {/* Loading Spinners */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-machinery-900">Loading Spinners</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProfessionalCard title="Default Spinner" className="text-center">
            <LoadingSpinner />
          </ProfessionalCard>
          
          <ProfessionalCard title="Industrial Variant" className="text-center">
            <LoadingSpinner variant="industrial" theme="primary" />
          </ProfessionalCard>
          
          <ProfessionalCard title="Minimal Style" className="text-center">
            <LoadingSpinner variant="minimal" theme="success" />
          </ProfessionalCard>
          
          <ProfessionalCard title="Dots Animation" className="text-center">
            <LoadingSpinner variant="dots" theme="warning" />
          </ProfessionalCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProfessionalCard title="With Text" className="text-center">
            <LoadingSpinner text="Loading data..." />
          </ProfessionalCard>
          
          <ProfessionalCard title="Large Size" className="text-center">
            <LoadingSpinner size="xl" theme="primary" />
          </ProfessionalCard>
          
          <ProfessionalCard title="Inline Usage" className="text-center">
            <div className="flex items-center justify-center gap-2">
              Processing
              <LoadingSpinner size="sm" inline />
            </div>
          </ProfessionalCard>
        </div>
      </section>

      {/* Loading Buttons */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-machinery-900">Loading Buttons</h2>
        
        <div className="flex flex-wrap gap-4">
          <LoadingButton
            variant="primary"
            loading={buttonLoading}
            onClick={handleButtonClick}
            loadingText="Processing..."
          >
            Submit Work Order
          </LoadingButton>
          
          <LoadingButton
            variant="secondary"
            icon="tabler:plus"
          >
            Add Asset
          </LoadingButton>
          
          <LoadingButton
            variant="outline"
            size="lg"
          >
            Generate Report
          </LoadingButton>
          
          <LoadingButton
            variant="ghost"
            size="sm"
            loading={true}
          >
            Saving...
          </LoadingButton>
        </div>
      </section>

      {/* Skeleton Patterns */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-machinery-900">Skeleton Patterns</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProfessionalCard title="Card Skeleton">
            <CardSkeleton />
          </ProfessionalCard>
          
          <ProfessionalCard title="Form Skeleton">
            <FormSkeleton fields={3} />
          </ProfessionalCard>
        </div>
        
        <ProfessionalCard title="Table Skeleton">
          <TableSkeleton rows={4} columns={5} />
        </ProfessionalCard>
        
        <ProfessionalCard title="Dashboard Skeleton">
          <DashboardSkeleton />
        </ProfessionalCard>
      </section>

      {/* Loading State Wrapper */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-machinery-900">Loading State Wrapper</h2>
        
        <div className="flex gap-4 mb-4">
          <button
            onClick={handleToggleLoading}
            className="px-4 py-2 bg-steel-600 text-white rounded-lg hover:bg-steel-700 transition-colors"
          >
            {isLoading ? 'Hide Loading' : 'Show Loading'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingState
            loading={isLoading}
            overlay="blur"
            spinnerProps={{ text: "Loading content..." }}
          >
            <ProfessionalCard title="Work Order Details">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className="text-industrial-600">In Progress</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Priority:</span>
                  <span className="text-maintenance-600">High</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Assigned to:</span>
                  <span>John Smith</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Due Date:</span>
                  <span>2024-01-15</span>
                </div>
              </div>
            </ProfessionalCard>
          </LoadingState>
          
          <LoadingState
            loading={isLoading}
            overlay="none"
            skeletonProps={{ variant: 'text', lines: 6 }}
          >
            <ProfessionalCard title="Asset Information">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Asset ID:</span>
                  <span>EV-001</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Model:</span>
                  <span>Electric Bike Pro</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Location:</span>
                  <span>Warehouse A</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Last Service:</span>
                  <span>2024-01-10</span>
                </div>
              </div>
            </ProfessionalCard>
          </LoadingState>
        </div>
      </section>

      {/* Individual Skeletons */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-machinery-900">Individual Skeletons</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProfessionalCard title="Text Skeleton">
            <div className="space-y-3">
              <Skeleton variant="text" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
            </div>
          </ProfessionalCard>
          
          <ProfessionalCard title="Circular Skeleton">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={48} height={48} />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="70%" />
                <Skeleton variant="text" width="50%" />
              </div>
            </div>
          </ProfessionalCard>
          
          <ProfessionalCard title="Rectangular Skeleton">
            <div className="space-y-3">
              <Skeleton variant="rectangular" height={120} />
              <Skeleton variant="text" />
              <Skeleton variant="text" width="75%" />
            </div>
          </ProfessionalCard>
          
          <ProfessionalCard title="Rounded Skeleton">
            <div className="space-y-3">
              <Skeleton variant="rounded" height={80} />
              <Skeleton variant="text" lines={2} />
            </div>
          </ProfessionalCard>
        </div>
      </section>
    </div>
  );
};

export default LoadingExamples;