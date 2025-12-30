import React, { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  LinkSquare02Icon,
  Cancel01Icon,
  NoteIcon,
  UserIcon,
  Motorbike01Icon,
  Calendar01Icon,
  LockIcon,
  Location01Icon,
  CheckmarkCircle01Icon,
  InformationCircleIcon,
  TagIcon,
  Clock01Icon,
  MapsIcon
} from '@hugeicons/core-free-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, Technician, Location, Customer, Vehicle, WorkOrderPart, Profile } from '@/types/supabase';
import { DiagnosticCategoryRow } from '@/types/diagnostic';
import { snakeToCamelCase } from '@/utils/data-helpers';
import { Skeleton } from '@/components/tailwind-components';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from 'react-router-dom';
import WorkOrderStepper from '@/components/WorkOrderStepper/WorkOrderStepper';
import { WorkOrderDetailsInfoCard } from '@/components/work-order-details/WorkOrderDetailsInfoCard';
import { WorkOrderCustomerVehicleCard } from '@/components/work-order-details/WorkOrderCustomerVehicleCard';
import { WorkOrderCostSummaryCard } from '@/components/work-order-details/WorkOrderCostSummaryCard';
import { WorkOrderActivityLogCard } from '@/components/work-order-details/WorkOrderActivityLogCard';
import { WorkOrderLocationMapCard } from '@/components/work-order-details/WorkOrderLocationMapCard';
import { WorkOrderRelatedHistoryCard } from '@/components/work-order-details/WorkOrderRelatedHistoryCard';
import { ConfirmationCallDialog } from '@/components/work-order-details/ConfirmationCallDialog';
import { WorkOrderOverviewCards } from '@/components/work-order-details/WorkOrderOverviewCards';

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
            {isLoadingWorkOrder ? (
              <Skeleton height={24} width={120} radius="md" />
            ) : (
              <h2 className="text-lg font-semibold text-gray-900">
                {workOrder?.workOrderNumber || 'Work Order'}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleViewFullPage}
              className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <HugeiconsIcon icon={LinkSquare02Icon} size={16} />
              Full Page
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={20} />
            </button>
          </div>
        </div>

        {/* Stepper */}
        {workOrder && (
          <div className="flex-shrink-0">
            <WorkOrderStepper 
              workOrder={workOrder} 
              profileMap={profileMap}
              onConfirmationClick={() => setIsConfirmationCallDialogOpen(true)}
            />
          </div>
        )}

        {/* Info Strip - Improved */}
        {workOrder && (
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center gap-3 text-sm">
              {/* License Plate */}
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={NoteIcon} size={16} className="text-purple-600" />
                <span className="font-semibold text-purple-900 text-xs">
                  {vehicle?.license_plate || vehicle?.licensePlate || 'N/A'}
                </span>
              </div>

              <div className="h-4 w-px bg-gray-300" />

              {/* Customer */}
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon icon={UserIcon} size={14} className="text-gray-400" />
                <span className="text-gray-900 font-medium text-xs">
                  {customer?.name || workOrder.customerName || 'N/A'}
                </span>
              </div>

              <div className="h-4 w-px bg-gray-300" />

              {/* Vehicle Model */}
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Motorbike01Icon} size={14} className="text-gray-400" />
                <span className="text-gray-700 text-xs">
                  {vehicle ? `${vehicle.make} ${vehicle.model}` : 'N/A'}
                </span>
              </div>

              <div className="h-4 w-px bg-gray-300" />

              {/* Asset Age */}
              {vehicle?.year && (
                <>
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-gray-400" />
                    <span className="text-gray-700 text-xs">
                      {(() => {
                        const purchaseDate = dayjs(`${vehicle.year}-01-01`);
                        const today = dayjs();
                        const years = today.diff(purchaseDate, 'year');
                        const months = today.diff(purchaseDate, 'month') % 12;
                        const days = today.diff(purchaseDate, 'day');
                        if (years >= 1) return `${years} yr${years > 1 ? 's' : ''}`;
                        else if (months >= 1) return `${months} mo`;
                        else return `${days} d`;
                      })()}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-gray-300" />
                </>
              )}

              {/* Warranty Status */}
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon icon={LockIcon} size={14} className={(() => {
                  if (!vehicle?.warranty_end_date) return 'text-gray-400';
                  const warrantyEnd = dayjs(vehicle.warranty_end_date);
                  const today = dayjs();
                  if (warrantyEnd.isBefore(today)) return 'text-red-600';
                  const daysRemaining = warrantyEnd.diff(today, 'day');
                  if (daysRemaining <= 30) return 'text-amber-600';
                  return 'text-emerald-600';
                })()} />
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${(() => {
                  if (!vehicle?.warranty_end_date) return 'bg-gray-50 text-gray-600 border-gray-200';
                  const warrantyEnd = dayjs(vehicle.warranty_end_date);
                  const today = dayjs();
                  if (warrantyEnd.isBefore(today)) return 'bg-red-50 text-red-700 border-red-200';
                  const daysRemaining = warrantyEnd.diff(today, 'day');
                  if (daysRemaining <= 30) return 'bg-amber-50 text-amber-700 border-amber-200';
                  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                })()}`}>
                  {(() => {
                    if (!vehicle?.warranty_end_date) return 'No warranty';
                    const warrantyEnd = dayjs(vehicle.warranty_end_date);
                    const today = dayjs();
                    if (warrantyEnd.isBefore(today)) return 'Expired';
                    const daysRemaining = warrantyEnd.diff(today, 'day');
                    if (daysRemaining <= 30) return `${daysRemaining}d left`;
                    const monthsRemaining = warrantyEnd.diff(today, 'month');
                    return `${monthsRemaining}mo left`;
                  })()}
                </span>
              </div>

              {/* Double divider for section break */}
              <div className="h-4 w-px bg-gray-400" />
              <div className="h-4 w-px bg-gray-400 -ml-2" />

              {/* Location */}
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Location01Icon} size={14} className="text-gray-400" />
                <span className="text-gray-700 text-xs">
                  {location?.name || workOrder.serviceCenter || 'N/A'}
                </span>
              </div>

              <div className="h-4 w-px bg-gray-300" />

              {/* Assigned Technician */}
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className={technician ? 'text-emerald-600' : 'text-amber-600'} />
                <span className={`text-xs font-medium ${technician ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {technician?.name || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs - Full width border */}
        <div className="flex border-b border-gray-200 px-4 flex-shrink-0 bg-white">
          {[
            { key: 'overview', label: 'Overview', icon: InformationCircleIcon },
            { key: 'parts', label: 'Parts & Cost', icon: TagIcon },
            { key: 'activity', label: 'Activity', icon: Clock01Icon },
            { key: 'location', label: 'Location', icon: MapsIcon },
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
              <Skeleton height={100} radius="md" />
              <Skeleton height={80} radius="md" />
              <Skeleton height={120} radius="md" />
            </div>
          ) : workOrder ? (
            <div className="p-4">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Work Order Details */}
                  <WorkOrderDetailsInfoCard
                    workOrder={workOrder}
                    customer={customer || null}
                    vehicle={vehicle || null}
                    technician={technician || null}
                    allTechnicians={allTechnicians || []}
                    allLocations={allLocations || []}
                    serviceCategories={serviceCategories || []}
                  />

                  {/* Related History */}
                  <WorkOrderRelatedHistoryCard
                    workOrder={workOrder}
                    customer={customer || null}
                    vehicle={vehicle || null}
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

      {/* Confirmation Call Dialog */}
      {workOrder && (
        <ConfirmationCallDialog
          isOpen={isConfirmationCallDialogOpen}
          onClose={() => setIsConfirmationCallDialogOpen(false)}
          onConfirm={async (notes, outcome, appointmentDate) => {
            // For drawer mode, just close and let user go to full page for full functionality
            setIsConfirmationCallDialogOpen(false);
            // Navigate to full page to complete the action
            navigate(`/work-orders/${workOrderId}`);
          }}
          workOrderNumber={workOrder.workOrderNumber || workOrder.id || ''}
          customerName={customer?.name || workOrder.customerName}
          customerPhone={customer?.phone || workOrder.customerPhone}
        />
      )}
    </div>
  );
};

export default WorkOrderDetailsDrawer;
