import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { Modal, Stack, Button, Group, Badge, Skeleton } from '@/components/tailwind-components';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle } from '@/types/supabase';

interface AssignEmergencyBikeModalProps {
  open: boolean;
  onClose: () => void;
  onAssign: (bikeId: string, notes: string) => Promise<void>;
}

const AssignEmergencyBikeModal: React.FC<AssignEmergencyBikeModalProps> = ({ 
  open, 
  onClose, 
  onAssign 
}) => {
  const [selectedBikeId, setSelectedBikeId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch available emergency bikes (company assets marked as emergency bikes)
  const { data: emergencyBikes, isLoading } = useQuery({
    queryKey: ['company_emergency_bikes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('is_company_asset', true)
        .eq('is_emergency_bike', true)
        .order('registration_number', { ascending: true });

      if (error) throw error;
      return data as Vehicle[];
    },
    enabled: open,
  });

  // Fetch active assignments to determine which bikes are currently in use
  const { data: activeAssignments } = useQuery({
    queryKey: ['active_emergency_bike_assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emergency_bike_assignments')
        .select('emergency_bike_id')
        .is('returned_at', null);

      if (error) throw error;
      return data.map(a => a.emergency_bike_id);
    },
    enabled: open,
  });

  const availableBikes = emergencyBikes?.filter(
    bike => !activeAssignments?.includes(bike.id)
  ) || [];

  const handleAssign = async () => {
    if (!selectedBikeId) return;

    setIsSubmitting(true);
    try {
      await onAssign(selectedBikeId, notes);
      setSelectedBikeId('');
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Failed to assign emergency bike:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedBikeId('');
    setNotes('');
    onClose();
  };

  return (
    <Modal opened={open} onClose={handleClose} title="Assign Emergency Bike" size="lg">
      <Stack gap="md">
        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Icon icon="mdi:information" className="text-blue-600 flex-shrink-0" width={20} height={20} />
            <div className="text-sm text-blue-800">
              Assign an emergency bike to the customer while their vehicle is being repaired. 
              The bike will be marked as in-use until the work order is completed.
            </div>
          </div>
        </div>

        {/* Available Bikes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Available Emergency Bike
          </label>

          {isLoading ? (
            <Stack gap="sm">
              <Skeleton height={80} />
              <Skeleton height={80} />
            </Stack>
          ) : availableBikes.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <Icon icon="mdi:bike-fast" className="text-gray-400 mx-auto mb-2" width={48} height={48} />
              <p className="text-sm text-gray-600">No emergency bikes available at the moment</p>
              <p className="text-xs text-gray-500 mt-1">All bikes are currently assigned</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {availableBikes.map(bike => (
                <button
                  key={bike.id}
                  onClick={() => setSelectedBikeId(bike.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedBikeId === bike.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon 
                          icon="mdi:bike" 
                          className={selectedBikeId === bike.id ? 'text-primary-600' : 'text-gray-600'} 
                          width={20} 
                          height={20} 
                        />
                        <span className="font-semibold text-gray-900">
                          {bike.registration_number || bike.license_plate}
                        </span>
                        <Badge size="xs" variant="light" color="green">
                          Available
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {bike.make} {bike.model} {bike.year ? `(${bike.year})` : ''}
                      </div>
                      {bike.color && (
                        <div className="text-xs text-gray-500 mt-1">
                          Color: {bike.color}
                        </div>
                      )}
                    </div>
                    {selectedBikeId === bike.id && (
                      <Icon icon="mdi:check-circle" className="text-primary-600" width={24} height={24} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this emergency bike assignment..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
          />
        </div>

        {/* Actions */}
        <Group justify="flex-end" gap="sm">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            onClick={handleAssign}
            disabled={!selectedBikeId || isSubmitting}
            loading={isSubmitting}
            leftSection={<Icon icon="mdi:check" width={16} height={16} />}
          >
            Assign Emergency Bike
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default AssignEmergencyBikeModal;
