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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={Call02Icon} size={20} className="text-primary-600" />
            </div>
            <div>
              <DialogTitle>Confirmation Call</DialogTitle>
              <DialogDescription className="mt-1">
                Work Order: <span className="font-mono text-xs">{workOrderNumber}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Info */}
          {customerName && (
            <div className="bg-muted/40 rounded-lg p-3 border border-border/50">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                    <HugeiconsIcon icon={UserIcon} size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{customerName}</p>
                    {customerPhone && (
                      <p className="text-xs text-muted-foreground font-mono">{customerPhone}</p>
                    )}
                  </div>
                </div>
                {customerPhone && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 shrink-0"
                    asChild
                  >
                    <a href={`tel:${customerPhone}`}>
                      <HugeiconsIcon icon={Call02Icon} size={14} />
                      Call
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Call Outcome */}
          <div className="space-y-2">
            <Label>Call Outcome <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleOutcomeChange('confirmed')}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border-2 text-xs font-medium transition-all hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  outcome === 'confirmed'
                    ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-50"
                    : "border-transparent bg-muted/30 hover:border-border text-muted-foreground"
                )}
              >
                <HugeiconsIcon icon={Tick01Icon} size={18} />
                Confirmed
              </button>
              <button
                type="button"
                onClick={() => handleOutcomeChange('unreachable')}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border-2 text-xs font-medium transition-all hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  outcome === 'unreachable'
                    ? "border-orange-500 bg-orange-50 text-orange-700 hover:bg-orange-50"
                    : "border-transparent bg-muted/30 hover:border-border text-muted-foreground"
                )}
              >
                <HugeiconsIcon icon={Call02Icon} size={18} />
                Unreachable
              </button>
              <button
                type="button"
                onClick={() => handleOutcomeChange('cancelled')}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border-2 text-xs font-medium transition-all hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  outcome === 'cancelled'
                    ? "border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/15"
                    : "border-transparent bg-muted/30 hover:border-border text-muted-foreground"
                )}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={18} />
                Cancelled
              </button>
            </div>
          </div>

          {/* Outcome Info Sections */}
          {outcome === 'confirmed' && (
            <div className="bg-green-50/50 border border-green-100 rounded-lg p-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-1.5">
                <Label htmlFor="appointment-date" className="text-green-900 text-xs">
                  Appointment Date & Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="appointment-date"
                  type="datetime-local"
                  value={appointmentDate}
                  onChange={(e) => {
                    setAppointmentDate(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  min={new Date().toISOString().slice(0, 16)}
                  className="bg-white border-green-200 text-green-900 focus-visible:ring-green-500/30 h-9"
                  required
                />
              </div>
            </div>
          )}

          {outcome === 'unreachable' && (
            <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-3 text-xs text-orange-800 animate-in fade-in slide-in-from-top-2 duration-200 flex items-start gap-2">
              <HugeiconsIcon icon={Alert01Icon} size={16} className="shrink-0 mt-0.5" />
              <p>Work order will remain open. Please try calling the customer again later.</p>
            </div>
          )}

          {outcome === 'cancelled' && (
            <div className="bg-red-50/50 border border-red-100 rounded-lg p-3 text-xs text-red-800 animate-in fade-in slide-in-from-top-2 duration-200 flex items-start gap-2">
              <HugeiconsIcon icon={AlertCircleIcon} size={16} className="shrink-0 mt-0.5" />
              <p>This will cancel the work order. This action can be reversed if needed by reopening the ticket.</p>
            </div>
          )}

          {/* Call Notes */}
          <div className="space-y-2">
            <Label htmlFor="call-notes">Call Notes <span className="text-red-500">*</span></Label>
            <Textarea
              id="call-notes"
              ref={notesRef}
              required
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (validationError) setValidationError('');
              }}
              className={cn(
                "min-h-[100px] resize-none",
                validationError && "border-destructive focus-visible:ring-destructive"
              )}
              placeholder="Document call details and customer response..."
            />
            {validationError && (
              <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                <HugeiconsIcon icon={AlertCircleIcon} size={12} />
                {validationError}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !notes.trim()}
              className="gap-1.5"
            >
              {isSubmitting ? (
                <>Saving...</>
              ) : (
                <>
                  <HugeiconsIcon icon={Tick01Icon} size={16} />
                  Complete Call
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
