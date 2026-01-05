import React, { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FullScreenIcon,
  Cancel01Icon,
  InformationCircleIcon,
  TagIcon,
  Clock01Icon,
  MapsIcon,
  Motorbike01Icon,
} from '@hugeicons/core-free-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, Technician, Location, Customer, Vehicle, WorkOrderPart, Profile } from '@/types/supabase';
import { DiagnosticCategoryRow } from '@/types/diagnostic';
import { snakeToCamelCase, camelToSnakeCase } from '@/utils/data-helpers';
import { Skeleton } from '@/components/tailwind-components';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from "@/utils/toast";
import { useSession } from "@/context/SessionContext";
import WorkOrderStepper from '@/components/WorkOrderStepper/WorkOrderStepper';
import { WorkOrderDetailsInfoCard } from '@/components/work-order-details/WorkOrderDetailsInfoCard';

import { WorkOrderCostSummaryCard } from '@/components/work-order-details/WorkOrderCostSummaryCard';
import { WorkOrderActivityLogCard } from '@/components/work-order-details/WorkOrderActivityLogCard';
import { WorkOrderLocationMapCard } from '@/components/work-order-details/WorkOrderLocationMapCard';
import { WorkOrderRelatedHistoryCard } from '@/components/work-order-details/WorkOrderRelatedHistoryCard';
import { ConfirmationCallDialog } from './work-order-details/ConfirmationCallDialog';
import { AssignTechnicianModal } from '@/components/work-order-details/AssignTechnicianModal';
import { useWorkOrderMutations } from '@/hooks/useWorkOrderMutations';
import { UgandaLicensePlate } from '@/components/ui/UgandaLicensePlate';

dayjs.extend(relativeTime);

interface WorkOrderDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  workOrderId?: string | null;
}

export const WorkOrderDetailsDrawer: React.FC<WorkOrderDetailsDrawerProps> = ({
  open,
  onClose,
  workOrderId
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'parts' | 'activity' | 'location'>('overview');
  const [isConfirmationCallDialogOpen, setIsConfirmationCallDialogOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Fetch work order
  const { data: workOrder, isLoading: isLoadingWorkOrder } = useQuery<WorkOrder | null>({
    queryKey: ['work_order_drawer', workOrderId],
    queryFn: async () => {
      if (!workOrderId) return null;
      const { data, error } = await supabase.from('work_orders').select('*').eq('id', workOrderId).single();
      if (error) throw new Error(error.message);
      return snakeToCamelCase(data) as WorkOrder;
    },
    enabled: !!workOrderId && open,
  });

  // Fetch technician
  const { data: technician } = useQuery<Technician | null>({
    queryKey: ['technician', workOrder?.assignedTechnicianId],
    queryFn: async () => {
      if (!workOrder?.assignedTechnicianId) return null;
      const { data, error } = await supabase.from('technicians').select('*').eq('id', workOrder.assignedTechnicianId).single();
      if (error) return null;
      return snakeToCamelCase(data) as Technician;
    },
    enabled: !!workOrder?.assignedTechnicianId,
  });

  // Fetch all technicians for the info card
  const { data: allTechnicians } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*');
      if (error) return [];
      return (data || []).map(t => snakeToCamelCase(t) as Technician);
    },
  });

  // Fetch location
  const { data: location } = useQuery<Location | null>({
    queryKey: ['location', workOrder?.locationId],
    queryFn: async () => {
      if (!workOrder?.locationId) return null;
      const { data, error } = await supabase.from('locations').select('*').eq('id', workOrder.locationId).single();
      if (error) return null;
      return snakeToCamelCase(data) as Location;
    },
    enabled: !!workOrder?.locationId,
  });

  // Fetch all locations
  const { data: allLocations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) return [];
      return (data || []).map(l => snakeToCamelCase(l) as Location);
    },
  });

  const { updateWorkOrder } = useWorkOrderMutations({
    serviceCategories: [],
    slaPolicies: [],
    technicians: allTechnicians || [],
    locations: allLocations || []
  });

  // Fetch customer
  const { data: customer } = useQuery<Customer | null>({
    queryKey: ['customer', workOrder?.customerId],
    queryFn: async () => {
      if (!workOrder?.customerId) return null;
      const { data, error } = await supabase.from('customers').select('*').eq('id', workOrder.customerId).single();
      if (error) return null;
      return snakeToCamelCase(data) as Customer;
    },
    enabled: !!workOrder?.customerId,
  });

  // Fetch vehicle
  const { data: vehicle } = useQuery<Vehicle | null>({
    queryKey: ['vehicle', workOrder?.vehicleId],
    queryFn: async () => {
      if (!workOrder?.vehicleId) return null;
      const { data, error } = await supabase.from('vehicles').select('*').eq('id', workOrder.vehicleId).single();
      if (error) return null;
      return snakeToCamelCase(data) as Vehicle;
    },
    enabled: !!workOrder?.vehicleId,
  });

  // Fetch parts used
  const { data: usedParts } = useQuery<WorkOrderPart[]>({
    queryKey: ['work_order_parts', workOrderId],
    queryFn: async () => {
      if (!workOrderId) return [];
      const { data, error } = await supabase
        .from('work_order_parts')
        .select('*, inventory_items(*)')
        .eq('work_order_id', workOrderId);
      if (error) return [];
      return (data || []).map(p => snakeToCamelCase(p) as WorkOrderPart);
    },
    enabled: !!workOrderId && open,
  });

  // Fetch profiles for activity log
  const { data: profiles } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) return [];
      return (data || []).map(p => snakeToCamelCase(p) as Profile);
    },
  });

  // Fetch diagnostic categories
  const { data: serviceCategories } = useQuery<DiagnosticCategoryRow[]>({
    queryKey: ['diagnostic_categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('diagnostic_categories').select('*');
      if (error) return [];
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const profileMap = new Map(
    (profiles || []).map(p => [p.id, `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown'])
  );

  const { session } = useSession();
  const queryClient = useQueryClient();

  // Mutation for updating work order
  const workOrderMutation = useMutation({
    mutationFn: async (workOrderData: Partial<WorkOrder>) => {
      const snakeCaseData = camelToSnakeCase(workOrderData);
      const { data, error } = await supabase
        .from('work_orders')
        .upsert([snakeCaseData])
        .select();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_order_drawer', workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['work_orders'] });
      // Also invalidate single work order query in case user navigates to full page
      queryClient.invalidateQueries({ queryKey: ['work_order', workOrderId] });
    },
    onError: (error) => {
      showError(error.message);
    }
  });

  const handleAssignTechnician = (technicianId: string) => {
    if (!workOrder) return;
    updateWorkOrder(workOrder, {
      status: 'In Progress',
      assignedTechnicianId: technicianId,
      work_started_at: new Date().toISOString()
    });
    setIsAssignModalOpen(false);
  };



  const handleConfirmationCall = async (notes: string, outcome: 'confirmed' | 'cancelled' | 'unreachable', appointmentDate?: string) => {
    if (!workOrder) return;

    try {
      const now = new Date().toISOString();
      const updates: Partial<WorkOrder> = {
        id: workOrder.id,
        confirmation_call_completed: outcome === 'confirmed' || outcome === 'cancelled',
        confirmation_call_notes: notes,
        confirmation_call_by: session?.user.id || null,
        confirmation_call_at: now
      };

      // Update status based on outcome
      if (outcome === 'confirmed') {
        updates.status = 'Ready';
        updates.confirmed_at = now;
        updates.ready_at = now;
        // If coming directly from Open, mark entry into confirmation flow as well
        if (workOrder.status === 'Open') {
          updates.confirmation_status_entered_at = now;
        }
        if (appointmentDate) {
          updates.appointmentDate = appointmentDate;
        }
      } else if (outcome === 'unreachable') {
        // Move to 'Confirmation' status if we made contact attempt but failed
        if (workOrder.status === 'Open') {
          updates.status = 'Confirmation';
          updates.confirmation_status_entered_at = now;
        }
        updates.confirmation_call_completed = false;
        updates.last_call_attempt_at = now;
      }

      workOrderMutation.mutate(updates, {
        onSuccess: () => {
          setIsConfirmationCallDialogOpen(false);
          showSuccess(
            outcome === 'confirmed'
              ? 'Appointment scheduled successfully. Work Order is Ready.'
              : outcome === 'cancelled'
                ? 'Work order cancelled.'
                : 'Call attempt logged. Will retry later.'
          );
        }
      });

    } catch (error: any) {
      showError(error.message || 'Failed to save confirmation call');
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const handleViewFullPage = () => {
    if (workOrderId) {
      navigate(`/work-orders/${workOrderId}`);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-md backdrop-saturate-150" />

        {/* Drawer - Increased width to 800px */}
        <div
          className="relative w-full max-w-4xl bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors self-start"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={20} />
              </button>
              <div className="h-8 w-px bg-gray-200" />
              {isLoadingWorkOrder ? (
                <Skeleton height="24px" width="120px" radius="md" />
              ) : (
                <div className="flex items-center gap-3">
                  {/* Work Order Number + Status Chip */}
                  <h2 className="text-lg font-bold text-gray-900 leading-none">
                    {workOrder?.workOrderNumber || 'Work Order'}
                  </h2>
                  
                  {/* Status Chip - Same level as WO number */}
                  {workOrder && (
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                      workOrder.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                      workOrder.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                      workOrder.status === 'Ready' ? 'bg-blue-100 text-blue-700' :
                      workOrder.status === 'Confirmation' ? 'bg-purple-100 text-purple-700' :
                      workOrder.status === 'On Hold' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                        workOrder.status === 'Completed' ? 'bg-emerald-500' :
                        workOrder.status === 'In Progress' ? 'bg-amber-500' :
                        workOrder.status === 'Ready' ? 'bg-blue-500' :
                        workOrder.status === 'Confirmation' ? 'bg-purple-500' :
                        workOrder.status === 'On Hold' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`} />
                      {workOrder.status}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 self-start">
              <button
                onClick={handleViewFullPage}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HugeiconsIcon icon={FullScreenIcon} size={20} />
              </button>
            </div>
          </div>



          {/* Info Strip */}
          {workOrder && (
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
              <div className="flex items-start gap-6 w-full overflow-x-auto">
                {/* License Plate */}
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1 leading-none">Plate</span>
                  <span className="text-sm font-bold text-gray-900 leading-tight">
                    {(vehicle as any)?.licensePlate || vehicle?.license_plate || '-'}
                  </span>
                </div>

                {/* Model */}
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1 leading-none">Model</span>
                  <span className="text-sm font-semibold text-gray-700 whitespace-nowrap leading-tight">
                    {vehicle ? `${vehicle.make} ${vehicle.model}` : '-'}
                  </span>
                </div>

                {/* Age */}
                {vehicle?.year && (
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1 leading-none">Age</span>
                    <span className="text-sm font-semibold text-gray-700 whitespace-nowrap leading-tight">
                      {(() => {
                        const purchaseDate = dayjs(`${vehicle.year}-01-01`);
                        const today = dayjs();
                        return `${today.diff(purchaseDate, 'day')} days`;
                      })()}
                    </span>
                  </div>
                )}

                {/* Warranty */}
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1 leading-none">Warranty</span>
                  {vehicle?.warranty_end_date ? (
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap w-fit ${(() => {
                      const warrantyEnd = dayjs(vehicle.warranty_end_date);
                      const today = dayjs();
                      if (warrantyEnd.isBefore(today)) return 'bg-red-100 text-red-700';
                      const daysRemaining = warrantyEnd.diff(today, 'day');
                      if (daysRemaining <= 30) return 'bg-amber-100 text-amber-700';
                      return 'bg-emerald-100 text-emerald-700';
                    })()}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${(() => {
                        const warrantyEnd = dayjs(vehicle.warranty_end_date);
                        const today = dayjs();
                        if (warrantyEnd.isBefore(today)) return 'bg-red-500';
                        const daysRemaining = warrantyEnd.diff(today, 'day');
                        if (daysRemaining <= 30) return 'bg-amber-500';
                        return 'bg-emerald-500';
                      })()}`} />
                      {(() => {
                        const warrantyEnd = dayjs(vehicle.warranty_end_date);
                        const today = dayjs();
                        if (warrantyEnd.isBefore(today)) return 'Expired';
                        const daysRemaining = warrantyEnd.diff(today, 'day');
                        if (daysRemaining <= 30) return `${daysRemaining}d left`;
                        const monthsRemaining = warrantyEnd.diff(today, 'month');
                        return `${monthsRemaining}mo left`;
                      })()}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 leading-tight">-</span>
                  )}
                </div>

                {/* Mileage */}
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1 leading-none">Mileage</span>
                  <span className="text-sm font-bold text-gray-900 tabular-nums leading-tight">
                    {(vehicle?.mileage || (workOrder as any)?.mileage) 
                      ? `${(vehicle?.mileage || (workOrder as any)?.mileage).toLocaleString()} km`
                      : '-'}
                  </span>
                </div>

                <div className="h-10 w-px bg-gray-200 shrink-0" />

                {/* Customer */}
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1 leading-none">Customer</span>
                  <span className="text-sm font-semibold text-gray-900 leading-tight">
                    {customer?.name || workOrder.customerName || '-'}
                  </span>
                </div>

                {/* Phone */}
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1 leading-none">Phone</span>
                  <span className="text-sm font-semibold text-gray-700 leading-tight">
                    {customer?.phone || workOrder.customerPhone || '-'}
                  </span>
                </div>
              </div>
            </div>
          )}


          {/* Stepper */}
          {
            workOrder && (
              <div className="flex-shrink-0">
                <WorkOrderStepper
                  workOrder={workOrder}
                  profileMap={profileMap}
                  onConfirmationClick={() => setIsConfirmationCallDialogOpen(true)}
                />
              </div>
            )
          }

          {/* Assign Technician Modal */}
          <AssignTechnicianModal
            open={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            technicians={allTechnicians || []}
            onAssign={handleAssignTechnician}
          />

          {/* Tabs - Full width border */}
          <div className="flex border-b border-gray-200 px-4 flex-shrink-0 bg-white">
            {[
              { key: 'overview', label: 'Overview', icon: InformationCircleIcon },
              { key: 'location', label: 'Location', icon: MapsIcon },
              { key: 'parts', label: 'Parts & Cost', icon: TagIcon },
              { key: 'activity', label: 'Activity', icon: Clock01Icon },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <HugeiconsIcon icon={tab.icon} size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content - Scrollable with thin scrollbar */}
          <div className="flex-1 overflow-y-auto bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {isLoadingWorkOrder ? (
              <div className="p-4 space-y-4">
                <Skeleton height="100px" radius="md" />
                <Skeleton height="80px" radius="md" />
                <Skeleton height="120px" radius="md" />
              </div>
            ) : workOrder ? (
              <div className="p-4">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {/* Work Order Details */}
                    <WorkOrderDetailsInfoCard
                      workOrder={workOrder}
                      allLocations={allLocations || []}
                      serviceCategories={serviceCategories || []}
                    />

                    {/* Related History */}
                    <WorkOrderRelatedHistoryCard
                      workOrder={workOrder}
                    />
                  </div>
                )}

                {activeTab === 'parts' && (
                  <WorkOrderCostSummaryCard
                    workOrder={workOrder}
                    usedParts={usedParts || []}
                  />
                )}

                {activeTab === 'activity' && (
                  <WorkOrderActivityLogCard
                    workOrder={workOrder}
                    profileMap={profileMap}
                  />
                )}

                {activeTab === 'location' && (
                  <WorkOrderLocationMapCard
                    workOrder={workOrder}
                    location={location || null}
                    allLocations={allLocations || []}
                  />
                )}
              </div>
            ) : (
              <div className="p-3 text-center text-gray-500 text-sm">
                Work order not found
              </div>
            )}
          </div>

          {/* Footer - Simplified, no duplicate button */}
          <div className="px-4 py-3 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="text-xs text-gray-500">
              {workOrder?.created_at && (
                <span>Created {dayjs(workOrder.created_at).format('MMM D, YYYY • h:mm A')}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Call Dialog */}
      {workOrder && (
        <ConfirmationCallDialog
          isOpen={isConfirmationCallDialogOpen}
          onClose={() => setIsConfirmationCallDialogOpen(false)}
          onConfirm={handleConfirmationCall}
          workOrderNumber={workOrder.workOrderNumber || workOrder.id || ''}
          customerName={customer?.name || workOrder.customerName || ''}
          customerPhone={customer?.phone || workOrder.customerPhone || ''}
        />
      )}
    </>
  );
};

export default WorkOrderDetailsDrawer;