import { render, screen } from '@testing-library/react';
import WorkOrderServiceLifecycleCard from './WorkOrderServiceLifecycleCard';
import React from 'react';

describe('WorkOrderServiceLifecycleCard', () => {
  it('renders initial diagnosis notes', () => {
    const workOrder = {
      initialDiagnosis: 'Test diagnosis notes',
      // ...other required props with dummy values
    };
    render(
      <WorkOrderServiceLifecycleCard
        workOrder={workOrder as any}
        handleUpdateWorkOrder={() => {}}
        usedPartsCount={0}
      />
    );
    expect(screen.getByText('Test diagnosis notes')).toBeInTheDocument();
  });

  it('shows fallback when no diagnosis', () => {
    const workOrder = {
      initialDiagnosis: '',
    };
    render(
      <WorkOrderServiceLifecycleCard
        workOrder={workOrder as any}
        handleUpdateWorkOrder={() => {}}
        usedPartsCount={0}
      />
    );
    expect(screen.getByText('No initial diagnosis provided.')).toBeInTheDocument();
  });
});
