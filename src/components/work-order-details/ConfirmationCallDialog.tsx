import React, { useState, useEffect, useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Cancel01Icon,
  Call02Icon,
  UserIcon,
  Tick01Icon,
  Calendar01Icon,
  AlertCircleIcon,
  Alert01Icon
} from '@hugeicons/core-free-icons';
import { Button, Stack } from '@/components/tailwind-components';

interface ConfirmationCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string, outcome: 'confirmed' | 'cancelled' | 'unreachable', appointmentDate?: string) => void;
  workOrderNumber: string;
  customerName?: string;
  customerPhone?: string;
  isSubmitting?: boolean;
}

export const ConfirmationCallDialog: React.FC<ConfirmationCallDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  workOrderNumber,
  customerName,
  customerPhone,
  isSubmitting = false
}) => {
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState<'confirmed' | 'cancelled' | 'unreachable'>('confirmed');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [validationError, setValidationError] = useState('');
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const firstOutcomeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management and keyboard shortcuts
  useEffect(() => {
    if (isOpen) {
      // Focus the notes field when dialog opens
      setTimeout(() => {
        notesRef.current?.focus();
      }, 100);

      // Keyboard shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.altKey) {
          if (e.key === 'c' || e.key === 'C') {
            e.preventDefault();
            setOutcome('confirmed');
          } else if (e.key === 'u' || e.key === 'U') {
            e.preventDefault();
            setOutcome('unreachable');
          } else if (e.key === 'x' || e.key === 'X') {
            e.preventDefault();
            setOutcome('cancelled');
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!notes.trim()) {
      setValidationError('Please add notes about the call');
      notesRef.current?.focus();
      return;
    }

    if (outcome === 'confirmed' && !appointmentDate) {
      setValidationError('Please select an appointment date for the confirmed service');
      return;
    }

    setValidationError('');
    onConfirm(notes, outcome, appointmentDate || undefined);
  };

  const handleClose = () => {
    setNotes('');
    setOutcome('confirmed');
    setAppointmentDate('');
    setValidationError('');
    onClose();
  };

  const handleOutcomeChange = (newOutcome: 'confirmed' | 'cancelled' | 'unreachable') => {
    setOutcome(newOutcome);
    setValidationError('');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200"
        style={{ zIndex: 1040 }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div 
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 1050 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-call-title"
      >
        <div
          className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-sm">
                <HugeiconsIcon icon={Call02Icon} size={16} className="text-white" />
              </div>
              <div>
                <h2 id="confirmation-call-title" className="text-base font-semibold text-gray-900">Confirmation Call</h2>
                <p className="text-xs text-gray-600">Work Order: {workOrderNumber}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-lg transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Close dialog"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-4">
            <Stack gap="sm">
              {/* Customer Info */}
              {customerName && (
                <div className="bg-blue-50 rounded-lg p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <HugeiconsIcon icon={UserIcon} size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">{customerName}</p>
                        {customerPhone && (
                          <p className="text-xs text-blue-800 mt-0.5 font-medium">{customerPhone}</p>
                        )}
                      </div>
                    </div>
                    {customerPhone && (
                      <a
                        href={`tel:${customerPhone}`}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
                        aria-label={`Call ${customerName}`}
                      >
                        <HugeiconsIcon icon={Call02Icon} size={12} />
                        Call
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Call Outcome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Call Outcome <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOutcomeChange('confirmed')}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all outline-none ${
                      outcome === 'confirmed'
                        ? 'border-2 border-green-600 bg-green-50 text-green-800 shadow-sm'
                        : 'border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                    aria-label="Mark as confirmed (Alt+C)"
                    title="Alt+C"
                  >
                    <HugeiconsIcon icon={Tick01Icon} size={16} className="mx-auto mb-0.5" />
                    Confirmed
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOutcomeChange('unreachable')}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all outline-none ${
                      outcome === 'unreachable'
                        ? 'border-2 border-orange-600 bg-orange-50 text-orange-800 shadow-sm'
                        : 'border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                    aria-label="Mark as unreachable (Alt+U)"
                    title="Alt+U"
                  >
                    <HugeiconsIcon icon={Call02Icon} size={16} className="mx-auto mb-0.5" />
                    Unreachable
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOutcomeChange('cancelled')}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all outline-none ${
                      outcome === 'cancelled'
                        ? 'border-2 border-red-600 bg-red-50 text-red-800 shadow-sm'
                        : 'border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                    aria-label="Mark as cancelled (Alt+X)"
                    title="Alt+X"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={16} className="mx-auto mb-0.5" />
                    Cancelled
                  </button>
                </div>
              </div>

              {/* Call Notes */}
              <div>
                <label htmlFor="call-notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Call Notes <span className="text-red-600 font-bold">*</span>
                </label>
                <textarea
                  id="call-notes"
                  ref={notesRef}
                  required
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg outline-none resize-none transition-colors text-sm ${
                    validationError ? 'border-2 border-red-300 bg-red-50' : 'border-2 border-gray-300'
                  }`}
                  placeholder="Document call details and customer response..."
                  aria-describedby="call-notes-help"
                  aria-invalid={!!validationError}
                />
                {validationError && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1" role="alert">
                    <HugeiconsIcon icon={Alert01Icon} size={12} />
                    {validationError}
                  </p>
                )}
              </div>

              {/* Outcome-specific guidance */}
              {outcome === 'confirmed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
                  <p className="text-sm text-green-800 mb-1.5 font-medium">
                    <HugeiconsIcon icon={Calendar01Icon} size={16} className="inline mr-1" />
                    Schedule Service Appointment
                  </p>
                  <label htmlFor="appointment-date" className="block text-xs font-medium text-green-900 mb-1">
                    Appointment Date & Time <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="appointment-date"
                    type="datetime-local"
                    value={appointmentDate}
                    onChange={(e) => {
                      setAppointmentDate(e.target.value);
                      if (validationError) setValidationError('');
                    }}
                    min={new Date().toISOString().slice(0, 16)}
                    className={`w-full px-2 py-1.5 text-sm rounded bg-white outline-none ${
                      validationError && !appointmentDate ? 'border-2 border-red-300' : 'border-2 border-green-300'
                    }`}
                    required
                  />
                </div>
              )}
              {outcome === 'unreachable' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5">
                  <p className="text-sm text-orange-800 font-medium">
                    <HugeiconsIcon icon={Call02Icon} size={16} className="inline mr-1" />
                    Customer Unreachable
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    Work order remains open. Retry call later.
                  </p>
                </div>
              )}
              {outcome === 'cancelled' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
                  <p className="text-sm text-red-800 font-medium">
                    <HugeiconsIcon icon={AlertCircleIcon} size={16} className="inline mr-1" />
                    Cancel Work Order
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    This action can be reversed if needed.
                  </p>
                </div>
              )}
            </Stack>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-sm px-3 py-1.5"
              >
                Cancel
              </Button>
              <button
                type="submit"
                disabled={isSubmitting || !notes.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white font-medium text-sm rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={Tick01Icon} size={12} />
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
