import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WorkOrderFormDrawer from './WorkOrderFormDrawer';
import React from 'react';
import { vi, expect } from 'vitest';

// Mock the session context so the provider doesn't show the loading state
import * as SessionContext from '@/context/SessionContext';

vi.mock('@/context/SessionContext', async () => {
  const actual = await vi.importActual<typeof SessionContext>('@/context/SessionContext');
  return {
    ...actual,
    SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useSession: () => ({ session: null, isLoading: false, profile: null, isLoadingProfile: false }),
  };
});

describe('WorkOrderFormDrawer', () => {
  it('renders and saves initialDiagnosis notes', async () => {
    const onSave = vi.fn();
  const locations = [{ id: 'loc-1', name: 'Main Service Center', address: '123 Test St', lat: 0, lng: 0 }];
    render(
      <WorkOrderFormDrawer
        isOpen={true}
        onClose={() => {}}
        onSave={onSave}
        workOrder={null}
        technicians={[]}
        locations={locations}
        prefillData={{ initialDiagnosis: 'Prefilled diagnosis', customerAddress: '123 Test St', locationId: 'loc-1' }}
      />
    );
    // Find the textarea and enter diagnosis
    const textarea = screen.getByPlaceholderText('What is the initial diagnosis?');
    fireEvent.change(textarea, { target: { value: 'Test diagnosis notes' } });
    // Save
    const saveButton = screen.getByText('Save Work Order');
    fireEvent.click(saveButton);
    // onSave should be called with initialDiagnosis (wait for async handlers)
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ initialDiagnosis: 'Test diagnosis notes' }));
    });
  });
});
