import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Motorbike01Icon, InformationCircleIcon, Cancel01Icon, Tick01Icon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';
import { Button, Stack } from '@/components/tailwind-components';
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
        // .eq('is_company_asset', true) // Removed to ensure all emergency bikes show up
        .eq('is_emergency_bike', true)
        .order('license_plate', { ascending: true });

      if (error) throw error;
      console.log('🚲 Emergency bikes from DB:', data);
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
        .select('emergency_bike_asset_id')
        .is('returned_at', null);

      if (error) throw error;
      console.log('🔒 Active assignments:', data);
      return data.map(a => a.emergency_bike_asset_id);
    },
    enabled: open,
  });

  const availableBikes = emergencyBikes?.filter(
    bike => !activeAssignments?.includes(bike.id)
  ) || [];

  console.log('✅ Available bikes after filter:', availableBikes);

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

  if (!open) return null;

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
        aria-labelledby="assign-emergency-bike-title"
      >
        <div
          className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center shadow-sm">
                <HugeiconsIcon icon={Motorbike01Icon} className="w-4 h-4 text-white" size={16} />
              </div>
              <div>
                <h2 id="assign-emergency-bike-title" className="text-base font-semibold text-gray-900">Assign Emergency Bike</h2>
                <p className="text-xs text-gray-600">Temporary bike for customer</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-lg transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Close dialog"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
            <Stack gap="sm">
              {/* Info Alert */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm">
                <div className="flex gap-3">
                  <HugeiconsIcon icon={InformationCircleIcon} className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
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
                  <div className="space-y-2">
                    <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                    <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                  </div>
                ) : availableBikes.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <HugeiconsIcon icon={Motorbike01Icon} className="text-gray-400 mx-auto mb-2" size={48} />
                    <p className="text-sm text-gray-600">No emergency bikes available at the moment</p>
                    <p className="text-xs text-gray-500 mt-1">All bikes are currently assigned</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[240px] overflow-y-auto">
                    {availableBikes.map(bike => (
                      <button
                        key={bike.id}
                        type="button"
                        onClick={() => setSelectedBikeId(bike.id)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${selectedBikeId === bike.id
                          ? 'border-orange-500 bg-orange-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <HugeiconsIcon
                                icon={Motorbike01Icon}
                                className={selectedBikeId === bike.id ? 'text-orange-600' : 'text-gray-600'}
                                size={18}
                              />
                              <span className="font-semibold text-gray-900 text-sm">
                                {bike.registration_number || bike.license_plate}
                              </span>
                              <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                                Available
                              </span>
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
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="text-orange-600 flex-shrink-0" size={20} />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="emergency-bike-notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  id="emergency-bike-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this emergency bike assignment..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none outline-none transition-colors"
                />
              </div>
            </Stack>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAssign}
              disabled={!selectedBikeId || isSubmitting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white font-medium text-sm rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={Tick01Icon} className="w-3 h-3" size={12} />
                  <span>Assign Emergency Bike</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssignEmergencyBikeModal;
