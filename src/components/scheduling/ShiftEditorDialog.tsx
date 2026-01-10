import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/tailwind-components';
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
      setError('Please select a location');
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
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>{shift ? 'Edit Shift' : 'Create Shift'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 px-4 py-3">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 text-xs text-red-800 dark:text-red-200">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Add any notes about this shift..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" size="xs" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button size="xs" onClick={handleSave} disabled={saving || !locationId}>
              {saving ? 'Saving...' : shift ? 'Update Shift' : 'Create Shift'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
