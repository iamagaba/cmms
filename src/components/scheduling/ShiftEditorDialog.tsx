import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { showSuccess, showError } from '@/utils/toast';
import dayjs from 'dayjs';

interface Location {
  id: string;
  name: string;
}

interface Shift {
  id?: string;
  technician_id: string;
  start_datetime: string;
  end_datetime: string;
  location_id: string;
  notes?: string;
  status: 'draft' | 'published';
}

interface ShiftEditorDialogProps {
  open: boolean;
  onClose: () => void;
  shift?: Shift | null;
  technicianId: string;
  date: string;
  locations: Location[];
  onSave: () => void;
}

export const ShiftEditorDialog: React.FC<ShiftEditorDialogProps> = ({
  open,
  onClose,
  shift,
  technicianId,
  date,
  locations,
  onSave,
}) => {
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [locationId, setLocationId] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (shift) {
      setStartTime(dayjs(shift.start_datetime).format('HH:mm'));
      setEndTime(dayjs(shift.end_datetime).format('HH:mm'));
      setLocationId(shift.location_id);
      setNotes(shift.notes || '');
    } else {
      setStartTime('08:00');
      setEndTime('16:00');
      setLocationId(locations[0]?.id || '');
      setNotes('');
    }
  }, [shift, locations]);

  const handleSave = async () => {
    if (!locationId) {
      setError('Select a location');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const startDatetime = dayjs(date).hour(parseInt(startTime.split(':')[0])).minute(parseInt(startTime.split(':')[1])).toISOString();
      const endDatetime = dayjs(date).hour(parseInt(endTime.split(':')[0])).minute(parseInt(endTime.split(':')[1])).toISOString();

      const shiftData = {
        technician_id: technicianId,
        start_datetime: startDatetime,
        end_datetime: endDatetime,
        location_id: locationId,
        notes: notes || null,
        status: 'draft' as const,
      };

      console.log('Saving shift:', shiftData);

      if (shift?.id) {
        const { error } = await supabase
          .from('shifts')
          .update(shiftData)
          .eq('id', shift.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        showSuccess('Shift updated successfully');
      } else {
        const { data, error } = await supabase
          .from('shifts')
          .insert([shiftData])
          .select();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        console.log('Shift created:', data);
        showSuccess('Shift created successfully');
      }

      // Invalidate queries to refetch data
      await queryClient.invalidateQueries({ queryKey: ['shifts'] });

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving shift:', error);
      const errorMessage = error.message || 'Failed to save shift';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{shift ? 'Edit Shift' : 'Create Shift'}</DialogTitle>
          <DialogDescription>
            {shift ? 'Update shift details and publish when ready.' : 'Schedule a new shift for this technician.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded p-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger id="location">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this shift..."
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving || !locationId}>
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving || !locationId}>
            {saving ? 'Publishing...' : shift ? 'Publish' : 'Create Shift'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

