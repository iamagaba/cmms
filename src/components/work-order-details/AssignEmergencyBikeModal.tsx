import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bike, Info, X, Check, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
          className="bg-white rounded-lg shadow-sm max-w-lg w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-orange-50 to-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center shadow-sm">
                <Bike className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 id="assign-emergency-bike-title" className="text-base font-semibold text-foreground">Assign Emergency Bike</h2>
                <p className="text-xs text-muted-foreground">Temporary bike while vehicle is repaired</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-4">
              {/* Info Alert */}
              <div className="bg-muted border border-blue-200 rounded-lg p-3 shadow-sm">
                <div className="flex gap-3">
                  <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    Bike will be marked as in-use until work order is completed.
                  </div>
                </div>
              </div>

              {/* Available Bikes */}
              <div>
                <Label className="text-xs font-medium mb-2">
                  Select Available Emergency Bike
                </Label>

                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-20 bg-muted rounded-lg animate-pulse" />
                    <div className="h-20 bg-muted rounded-lg animate-pulse" />
                  </div>
                ) : availableBikes.length === 0 ? (
                  <div className="text-center py-8 bg-muted rounded-lg border border-border">
                    <Bike className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No emergency bikes available</p>
                    <p className="text-xs text-muted-foreground mt-1">All bikes are currently assigned</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[240px] overflow-y-auto">
                    {availableBikes.map(bike => (
                      <Button
                        key={bike.id}
                        variant="outline"
                        onClick={() => setSelectedBikeId(bike.id)}
                        className={`w-full h-auto p-3 justify-start ${selectedBikeId === bike.id
                          ? 'border-orange-500 bg-muted shadow-sm'
                          : 'border-border hover:border-border/80 bg-background'
                          }`}
                      >
                        <div className="flex items-start justify-between w-full">
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-1">
                              <Bike
                                className={`w-4 h-4 ${selectedBikeId === bike.id ? 'text-muted-foreground' : 'text-muted-foreground'}`}
                              />
                              <span className="font-semibold text-foreground text-sm">
                                {bike.registration_number || bike.license_plate}
                              </span>
                              <Badge variant="success">Available</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {bike.make} {bike.model} {bike.year ? `(${bike.year})` : ''}
                            </div>
                            {bike.color && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Color: {bike.color}
                              </div>
                            )}
                          </div>
                          {selectedBikeId === bike.id && (
                            <CheckCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="emergency-bike-notes" className="text-xs font-medium mb-1">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="emergency-bike-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes for this assignment"
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border bg-muted/30">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAssign}
              disabled={!selectedBikeId || isSubmitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  <span>Assigning</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  <span>Assign Emergency Bike</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export { AssignEmergencyBikeModal };
export default AssignEmergencyBikeModal;


