import { render, screen, fireEvent } from '@testing-library/react';
import WorkOrderFormDrawer from '../components/WorkOrderFormDrawer';
import React from 'react';

describe('WorkOrderFormDrawer', () => {
  it('renders and saves initialDiagnosis notes', async () => {
    const onSave = vi.fn();
    render(
      <WorkOrderFormDrawer
        isOpen={true}
        onClose={() => {}}
        onSave={onSave}
        workOrder={null}
        technicians={[]}
        locations={[]}
        serviceCategories={[]}
        prefillData={{}}
      />
    );
    // Find the textarea and enter diagnosis
    const textarea = screen.getByPlaceholderText('What is the initial diagnosis?');
    fireEvent.change(textarea, { target: { value: 'Test diagnosis notes' } });
    // Save
    const saveButton = screen.getByText('Save Work Order');
    fireEvent.click(saveButton);
    // onSave should be called with initialDiagnosis
    await screen.findByText('Work order saved successfully!');
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ initialDiagnosis: 'Test diagnosis notes' }));
  });
});
