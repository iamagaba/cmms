import React, { useState, useEffect, useRef } from 'react';
import { Phone, User, Check, Calendar, AlertCircle, AlertTriangle, Clock, CalendarDays, Ban, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';

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
      <DialogContent
        className="sm:max-w-[500px] p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl max-h-[85vh] flex flex-col z-[110]"
      >
        <DialogHeader className="p-4 border-b border-border/50 bg-muted/20 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10 shadow-sm">
                <Ticket className="w-4 h-4 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold tracking-tight text-foreground/90">Confirmation Call</DialogTitle>
                <DialogDescription className="mt-0.5 flex items-center gap-2">
                  <span className="font-mono text-[10px] bg-muted/80 border border-border px-1.5 py-0.5 rounded text-foreground/70 font-medium">
                    {workOrderNumber}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-5">
            {/* Contact Card */}
            {customerName && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-50/50 dark:bg-slate-900/50 rounded-xl p-3 border border-border/60 shadow-sm group relative overflow-hidden"
              >
                <div className="relative flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-black shadow-sm flex items-center justify-center text-muted-foreground border border-border/50 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-foreground truncate leading-tight">{customerName}</h4>
                      {customerPhone ? (
                        <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span className="font-mono text-xs tracking-wide">{customerPhone}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No phone number</span>
                      )}
                    </div>
                  </div>

                  {customerPhone && (
                    <Button
                      type="button"
                      size="sm"
                      className="md:hidden rounded-full h-8 px-4 gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white border-none shrink-0 text-xs font-medium"
                      asChild
                    >
                      <a href={`tel:${customerPhone}`}>
                        <Phone className="w-3.5 h-3.5" />
                        Call
                      </a>
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Outcome Selection */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">Outcome</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'confirmed', label: 'Confirmed', icon: Check, color: 'emerald', desc: 'Book' },
                  { id: 'unreachable', label: 'No Answer', icon: Phone, color: 'amber', desc: 'Try Later' },
                  { id: 'cancelled', label: 'Cancelled', icon: Ban, color: 'red', desc: 'Close Ticket' }
                ].map((item) => {
                  const isSelected = outcome === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleOutcomeChange(item.id as any)}
                      className={cn(
                        "group relative flex flex-col items-start justify-center p-3 rounded-xl border transition-all duration-150 ease-out h-[88px] text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-1 select-none",
                        "bg-card/50 hover:bg-muted/50",
                        isSelected
                          ? item.color === 'emerald' ? "border-emerald-500 bg-emerald-50/10 ring-1 ring-emerald-500/20"
                            : item.color === 'amber' ? "border-amber-500 bg-amber-50/10 ring-1 ring-amber-500/20"
                              : "border-red-500 bg-red-50/10 ring-1 ring-red-500/20"
                          : "border-border/60 text-muted-foreground hover:border-foreground/20"
                      )}
                    >
                      <div className="flex items-center justify-between w-full mb-auto">
                        <div className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200",
                          isSelected
                            ? item.color === 'emerald' ? "bg-emerald-500 text-white shadow-emerald-200"
                              : item.color === 'amber' ? "bg-amber-500 text-white shadow-amber-200"
                                : "bg-red-500 text-white shadow-red-200"
                            : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                        )}>
                          <item.icon className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="mt-2.5">
                        <span className={cn(
                          "block font-semibold text-xs leading-none transition-colors duration-200",
                          isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                        )}>
                          {item.label}
                        </span>
                        <span className="text-[10px] block mt-1 opacity-70 leading-none">{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Content Area */}
            <div className="min-h-[60px] relative">
              <AnimatePresence mode="popLayout">
                {outcome === 'confirmed' && (
                  <motion.div
                    key="confirmed"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="space-y-3 bg-emerald-50/30 dark:bg-emerald-950/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50 overflow-hidden"
                  >
                    <div className="flex gap-2 text-emerald-800 dark:text-emerald-400 items-center">
                      <CalendarDays className="w-4 h-4" />
                      <h4 className="font-semibold text-xs tracking-tight">Schedule <span className="text-emerald-600/70 dark:text-emerald-400/60 font-medium ml-1">(Optional)</span></h4>
                    </div>

                    <div className="space-y-1">
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-emerald-600 transition-colors pointer-events-none">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <Input
                          id="appointment-date"
                          type="datetime-local"
                          value={appointmentDate}
                          onChange={(e) => {
                            setAppointmentDate(e.target.value);
                            if (validationError) setValidationError('');
                          }}
                          min={new Date().toISOString().slice(0, 16)}
                          className="pl-9 bg-white/50 dark:bg-background/50 border-emerald-200/60 dark:border-emerald-900/60 text-foreground h-9 text-sm focus-visible:ring-emerald-500 hover:border-emerald-300 transition-colors"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {outcome === 'unreachable' && (
                  <motion.div
                    key="unreachable"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex flex-col gap-2 overflow-hidden"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-400">Unreachable</h4>
                        <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80 mt-1 leading-relaxed">
                          Work order remains in <span className="font-mono bg-amber-100/80 dark:bg-amber-900/80 px-1 py-0.5 rounded text-[10px] font-bold">Confirmation</span>.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {outcome === 'cancelled' && (
                  <motion.div
                    key="cancelled"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 flex flex-col gap-2 overflow-hidden"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
                        <Ban className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-red-900 dark:text-red-400">Cancel Order?</h4>
                        <p className="text-[11px] text-red-800/80 dark:text-red-400/80 mt-1 leading-relaxed">
                          Action is reversible.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Common Notes Field */}
            <div className="space-y-1.5 mt-4">
              <Label htmlFor="call-notes" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">
                Notes <span className="text-destructive">*</span>
              </Label>
              <div className="relative group">
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
                    "min-h-[90px] resize-none bg-muted/30 focus-visible:ring-primary/20 transition-all text-xs leading-relaxed p-3 hover:bg-muted/50 focus:bg-background",
                    validationError && "border-destructive focus-visible:ring-destructive"
                  )}
                  placeholder={
                    outcome === 'confirmed' ? "Enter confirmation details" :
                      outcome === 'unreachable' ? "Enter attempt details" :
                        "Enter cancellation reason"
                  }
                />
                {validationError && (
                  <div className="absolute bottom-3 right-3 text-[10px] text-destructive flex items-center gap-1.5 font-medium bg-white/95 dark:bg-black/95 px-2 py-1 rounded-md shadow-sm border border-destructive/20 animate-in fade-in slide-in-from-bottom-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationError}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-border bg-muted/10 flex items-center justify-between sm:justify-between shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-muted-foreground hover:text-foreground h-9 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !notes.trim()}
              size="sm"
              className={cn(
                "gap-2 min-w-[130px] shadow-sm transition-all duration-300 h-9 text-xs font-medium rounded-lg",
                outcome === 'confirmed' ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200/50" :
                  outcome === 'unreachable' ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200/50" :
                    "bg-red-600 hover:bg-red-700 text-white shadow-red-200/50"
              )}
            >
              {isSubmitting ? (
                <>Saving...</>
              ) : (
                <>
                  {outcome === 'confirmed' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Confirm
                    </>
                  ) : outcome === 'unreachable' ? (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      Log Attempt
                    </>
                  ) : (
                    <>
                      <Ban className="w-3.5 h-3.5" />
                      Cancel Order
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
