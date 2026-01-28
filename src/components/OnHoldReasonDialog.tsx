import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface OnHoldReasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (reason: string) => void;
}

export const OnHoldReasonDialog: React.FC<OnHoldReasonDialogProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [reason, setReason] = useState('');

  const handleSave = () => {
    if (reason.trim()) {
      onSave?.(reason);
      setReason('');
      onClose();
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1 pt-1">
            <DialogHeader>
              <DialogTitle>On Hold Reason</DialogTitle>
              <DialogDescription className="mt-2">
                Provide a reason for putting this item on hold.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <Label htmlFor="reason" className="text-xs">
                Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for hold..."
                rows={3}
                className="mt-1.5"
              />
            </div>

            <DialogFooter className="mt-6 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={!reason.trim()}
              >
                Save
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
