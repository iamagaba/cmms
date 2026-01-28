import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, User, Check, Calendar, AlertCircle, AlertTriangle } from 'lucide-react';
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
      setValidationError('Add notes about the call');
      notesRef.current?.focus();
      return;
    }

    if (outcome === 'confirmed' && !appointmentDate) {
      setValidationError('Select an appointment date for confirmed service');
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
              <Phone className="w-4 h-4 text-primary" />
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
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                    <User className="w-4 h-4" />
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
                      <Phone className="w-3.5 h-3.5" />
                      Call
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Call Outcome */}
          <div className="space-y-2">
            <Label>Call Outcome <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={outcome === 'confirmed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleOutcomeChange('confirmed')}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 h-auto py-2",
                  outcome === 'confirmed' && "border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                )}
              >
                <Check className="w-4 h-4" />
                <span className="text-xs font-medium">Confirmed</span>
              </Button>
              <Button
                type="button"
                variant={outcome === 'unreachable' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleOutcomeChange('unreachable')}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 h-auto py-2",
                  outcome === 'unreachable' && "border-orange-500 bg-orange-50 text-orange-700 hover:bg-orange-100"
                )}
              >
                <Phone className="w-4 h-4" />
                <span className="text-xs font-medium">Unreachable</span>
              </Button>
              <Button
                type="button"
                variant={outcome === 'cancelled' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleOutcomeChange('cancelled')}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 h-auto py-2",
                  outcome === 'cancelled' && "border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/15"
                )}
              >
                <X className="w-4 h-4" />
                <span className="text-xs font-medium">Cancelled</span>
              </Button>
            </div>
          </div>

          {/* Outcome Info Sections */}
          {outcome === 'confirmed' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-1.5">
                <Label htmlFor="appointment-date" className="text-foreground text-xs">
                  Appointment Date & Time <span className="text-destructive">*</span>
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
                  className="bg-white border-emerald-200 text-foreground focus-visible:ring-emerald-500/30 h-9"
                  required
                />
              </div>
            </div>
          )}

          {outcome === 'unreachable' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 animate-in fade-in slide-in-from-top-2 duration-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Work order will remain open. Try calling the customer again later.</p>
            </div>
          )}

          {outcome === 'cancelled' && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-xs text-destructive animate-in fade-in slide-in-from-top-2 duration-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>This will cancel the work order. This action can be reversed if needed by reopening the ticket.</p>
            </div>
          )}

          {/* Call Notes */}
          <div className="space-y-2">
            <Label htmlFor="call-notes">Call Notes <span className="text-destructive">*</span></Label>
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
                <AlertCircle className="w-3 h-3" />
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
                  <Check className="w-4 h-4 mr-1.5" />
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


