import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button, Stack } from '@/components/tailwind-components';

interface ConfirmationCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string, outcome: 'confirmed' | 'rescheduled' | 'cancelled') => void;
  workOrderNumber: string;
  customerName?: string;
  isSubmitting?: boolean;
}

export const ConfirmationCallDialog: React.FC<ConfirmationCallDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  workOrderNumber,
  customerName,
  isSubmitting = false
}) => {
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState<'confirmed' | 'rescheduled' | 'cancelled'>('confirmed');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(notes, outcome);
  };

  const handleClose = () => {
    setNotes('');
    setOutcome('confirmed');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-md backdrop-saturate-150 z-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <Icon icon="tabler:phone" className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Confirmation Call</h2>
                <p className="text-sm text-gray-500">Work Order: {workOrderNumber}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <Icon icon="tabler:x" className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <Stack gap="md">
              {/* Customer Info */}
              {customerName && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Icon icon="tabler:info-circle" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Customer: {customerName}</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Call the customer to confirm the work order details and schedule.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Call Outcome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call Outcome <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setOutcome('confirmed')}
                    className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      outcome === 'confirmed'
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon icon="tabler:check" className="w-5 h-5 mx-auto mb-1" />
                    Confirmed
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutcome('rescheduled')}
                    className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      outcome === 'rescheduled'
                        ? 'border-yellow-600 bg-yellow-50 text-yellow-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon icon="tabler:calendar-time" className="w-5 h-5 mx-auto mb-1" />
                    Rescheduled
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutcome('cancelled')}
                    className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      outcome === 'cancelled'
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon icon="tabler:x" className="w-5 h-5 mx-auto mb-1" />
                    Cancelled
                  </button>
                </div>
              </div>

              {/* Call Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Call Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  placeholder="Enter details about the call (e.g., customer confirmed appointment, requested reschedule, etc.)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Document what was discussed and any important details
                </p>
              </div>

              {/* Outcome-specific guidance */}
              {outcome === 'confirmed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <Icon icon="tabler:check-circle" className="inline w-4 h-4 mr-1" />
                    Work order will be moved to <strong>Confirmation</strong> status and marked as ready for scheduling.
                  </p>
                </div>
              )}
              {outcome === 'rescheduled' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <Icon icon="tabler:alert-circle" className="inline w-4 h-4 mr-1" />
                    Work order will remain <strong>Open</strong>. Follow up with customer to reschedule.
                  </p>
                </div>
              )}
              {outcome === 'cancelled' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">
                    <Icon icon="tabler:info-circle" className="inline w-4 h-4 mr-1" />
                    Work order will be marked as <strong>Cancelled</strong>. This action can be reversed if needed.
                  </p>
                </div>
              )}
            </Stack>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <button
                type="submit"
                disabled={isSubmitting || !notes.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="tabler:check" className="w-4 h-4" />
                    <span>Complete Call</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
