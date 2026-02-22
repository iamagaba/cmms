import React, { useState, useEffect, useRef } from 'react';
import { Phone, User, Check, Calendar, AlertCircle, X, Clock, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';

interface ConfirmationCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string, outcome: 'confirmed' | 'cancelled' | 'unreachable', appointmentDate?: string) => void;
  workOrderNumber: string;
  customerName?: string;
  customerPhone?: string;
  isSubmitting?: boolean;
  error?: string | null;
}

export const ConfirmationCallDialog: React.FC<ConfirmationCallDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  workOrderNumber,
  customerName,
  customerPhone,
  isSubmitting = false,
  error
}) => {
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState<'confirmed' | 'cancelled' | 'unreachable'>('confirmed');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [validationError, setValidationError] = useState('');
  const notesRef = useRef<HTMLTextAreaElement>(null);

  // Focus management and keyboard shortcuts
  useEffect(() => {
    if (isOpen) {
      if (!appointmentDate) {
        // Default to next day 9 AM
        const tomorrow = dayjs().add(1, 'day').hour(9).minute(0).second(0);
        setAppointmentDate(tomorrow.format('YYYY-MM-DDTHH:mm'));
      }

      // Keyboard shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.altKey && !isSubmitting) {
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
      setValidationError('Enter notes');
      notesRef.current?.focus();
      return;
    }

    setValidationError('');
    onConfirm(notes, outcome, appointmentDate || undefined);
  };

  const handleClose = () => {
    setNotes('');
    setOutcome('confirmed');
    setValidationError('');
    onClose();
  };

  const handleOutcomeChange = (newOutcome: 'confirmed' | 'cancelled' | 'unreachable') => {
    setOutcome(newOutcome);
    setValidationError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-semibold">Confirmation Call</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-5 space-y-4">
            {/* Customer Info */}
            {customerName && (
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50 border">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{customerName}</div>
                  {customerPhone && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span className="font-mono">{customerPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Outcome Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Outcome</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleOutcomeChange('confirmed')}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all",
                    outcome === 'confirmed'
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    outcome === 'confirmed' ? "bg-emerald-500" : "bg-muted"
                  )}>
                    <Check className={cn("w-4 h-4", outcome === 'confirmed' ? "text-white" : "text-muted-foreground")} />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">Confirmed</div>
                    <div className="text-[10px] text-muted-foreground">Book</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleOutcomeChange('unreachable')}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all",
                    outcome === 'unreachable'
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-950"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    outcome === 'unreachable' ? "bg-amber-500" : "bg-muted"
                  )}>
                    <Phone className={cn("w-4 h-4", outcome === 'unreachable' ? "text-white" : "text-muted-foreground")} />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">No Answer</div>
                    <div className="text-[10px] text-muted-foreground">Try Later</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleOutcomeChange('cancelled')}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all",
                    outcome === 'cancelled'
                      ? "border-red-500 bg-red-50 dark:bg-red-950"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    outcome === 'cancelled' ? "bg-red-500" : "bg-muted"
                  )}>
                    <Ban className={cn("w-4 h-4", outcome === 'cancelled' ? "text-white" : "text-muted-foreground")} />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">Cancelled</div>
                    <div className="text-[10px] text-muted-foreground">Close Ticket</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Schedule (only for confirmed) */}
            {outcome === 'confirmed' && (
              <div className="space-y-1.5">
                <Label htmlFor="appointment-date" className="text-xs font-medium flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  Schedule <span className="text-muted-foreground font-normal">(Optional)</span>
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
                  className="text-sm h-9"
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="call-notes" className="text-xs font-medium">
                Notes <span className="text-destructive">*</span>
              </Label>
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
                  "min-h-[80px] resize-none text-sm",
                  validationError && "border-destructive"
                )}
                placeholder="Enter confirmation details"
              />
              {validationError && (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {validationError}
                </div>
              )}
            </div>
            {/* Error Message from Parent */}
            {error && (
              <div className="mx-5 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="px-5 py-3.5 mt-4 border-t bg-muted/30">
            <div className="flex items-center justify-between w-full gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-sm h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !notes.trim()}
                className={cn(
                  "gap-2 text-sm min-w-[120px] h-9",
                  outcome === 'confirmed' && "bg-emerald-600 hover:bg-emerald-700",
                  outcome === 'unreachable' && "bg-amber-600 hover:bg-amber-700",
                  outcome === 'cancelled' && "bg-red-600 hover:bg-red-700"
                )}
              >
                {isSubmitting ? (
                  "Saving..."
                ) : (
                  <>
                    {outcome === 'confirmed' && (
                      <>
                        <Check className="w-4 h-4" />
                        Confirm
                      </>
                    )}
                    {outcome === 'unreachable' && (
                      <>
                        <Clock className="w-4 h-4" />
                        Log Attempt
                      </>
                    )}
                    {outcome === 'cancelled' && (
                      <>
                        <Ban className="w-4 h-4" />
                        Cancel Order
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
