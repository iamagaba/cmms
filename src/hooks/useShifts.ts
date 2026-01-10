import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import dayjs from 'dayjs';

interface Shift {
  id: string;
  technician_id: string;
  start_datetime: string;
  end_datetime: string;
  location_id: string;
  shift_type: string;
  status: string;
  notes?: string;
  break_duration_minutes?: number;
  created_by?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  technician?: {
    id: string;
    name: string;
  };
  location?: {
    id: string;
    name: string;
  };
}

export const useShifts = (startDate: string, endDate: string) => {
  const queryClient = useQueryClient();

  const { data: shifts, isLoading, refetch } = useQuery({
    queryKey: ['shifts', startDate, endDate],
    queryFn: async () => {
      console.log('Fetching shifts for:', startDate, 'to', endDate);
      const { data, error } = await supabase
        .from('shifts')
        .select(`
          *,
          technician:technicians(id, name),
          location:locations(id, name)
        `)
        .gte('start_datetime', startDate)
        .lte('start_datetime', endDate)
        .order('start_datetime', { ascending: true });

      if (error) {
        console.error('Error fetching shifts:', error);
        throw error;
      }
      console.log('Fetched shifts:', data);
      return data as Shift[];
    },
  });

  const deleteShift = useMutation({
    mutationFn: async (shiftId: string) => {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shiftId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });

  const publishShifts = useMutation({
    mutationFn: async (shiftIds: string[]) => {
      const { error } = await supabase
        .from('shifts')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .in('id', shiftIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });

  const copyWeek = useMutation({
    mutationFn: async ({ sourceStart, targetStart }: { sourceStart: string; targetStart: string }) => {
      const sourceEnd = dayjs(sourceStart).add(7, 'day').toISOString();
      
      // Fetch source week shifts
      const { data: sourceShifts, error: fetchError } = await supabase
        .from('shifts')
        .select('*')
        .gte('start_datetime', sourceStart)
        .lt('start_datetime', sourceEnd);

      if (fetchError) throw fetchError;
      if (!sourceShifts || sourceShifts.length === 0) return;

      // Calculate day difference
      const dayDiff = dayjs(targetStart).diff(dayjs(sourceStart), 'day');

      // Create new shifts for target week
      const newShifts = sourceShifts.map((shift) => ({
        technician_id: shift.technician_id,
        start_datetime: dayjs(shift.start_datetime).add(dayDiff, 'day').toISOString(),
        end_datetime: dayjs(shift.end_datetime).add(dayDiff, 'day').toISOString(),
        location_id: shift.location_id,
        shift_type: shift.shift_type,
        status: 'draft',
        notes: shift.notes,
        break_duration_minutes: shift.break_duration_minutes,
      }));

      const { error: insertError } = await supabase
        .from('shifts')
        .insert(newShifts);

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });

  return {
    shifts,
    isLoading,
    refetch,
    deleteShift,
    publishShifts,
    copyWeek,
  };
};
