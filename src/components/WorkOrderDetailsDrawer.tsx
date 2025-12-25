import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, Technician, Location, Customer, Vehicle, WorkOrderPart, Profile } from '@/types/supabase';
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
              <Icon icon="tabler:external-link" className="w-4 h-4" />
              Full Page
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon icon="tabler:x" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stepper */}
        {workOrder && (
          <div className="flex-shrink-0">
            <WorkOrderStepper workOrder={workOrder} profileMap={profileMap} />
          </div>
        )}

        {/* Info Strip - Customer, Vehicle, Location, Assigned */}
        {workOrder && (
          <div className="flex-shrink-0 px-4 py-2.5 bg-white border-b border-gray-200">
            <div className="flex items-center gap-6 text-xs">
              {/* Customer */}
              <div className="flex items-center gap-2">
                <Icon icon="tabler:user" className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Customer:</span>
                <span className="font-medium text-gray-900">
                  {customer?.name || workOrder.customerName || 'Unknown'}
                </span>
                {(customer?.phone || workOrder.customerPhone) && (
                  <span className="text-gray-600">
                    • {customer?.phone || workOrder.customerPhone}
                  </span>
                )}
              </div>

              {/* Asset - Smart display logic */}
              <div className="flex items-center gap-2">
                <Icon icon="tabler:motorbike" className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Asset:</span>
                <span className="font-medium text-gray-900">
                  {(() => {
                    const licensePlate = vehicle?.license_plate;
                    const make = vehicle?.make;
                    const model = vehicle?.model;
                    
                    // If we have license plate, show it with make/model
                    if (licensePlate && (make || model)) {
                      return `${licensePlate} - ${make || ''} ${model || ''}`.trim();
                    }
                    // If only license plate
                    if (licensePlate) {
                      return licensePlate;
                    }
                    // If only make/model, show as unassigned
                    if (make || model) {
                      return `${make || ''} ${model || ''}`.trim() + ' (Unassigned)';
                    }
                    // Nothing available
                    return 'Not assigned';
                  })()}
                </span>
              </div>

              {/* Location - Only show if has value */}
              {location?.name && (
                <div className="flex items-center gap-2">
                  <Icon icon="tabler:map-pin" className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Location:</span>
                  <span className="font-medium text-gray-900">
                    {location.name}
                  </span>
                </div>
              )}

              {/* Assigned Technician */}
              <div className="flex items-center gap-2">
                <Icon icon="tabler:user-cog" className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Assigned:</span>
                <span className="font-medium text-gray-900">
                  {technician?.name || 'Unassigned'}
                </span>
              </div>

              {/* Priority - Use pill style matching the body badge */}
              {workOrder.priority && (
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    workOrder.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                    workOrder.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                    workOrder.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    <Icon icon="tabler:flag" className="w-3 h-3" />
                    {workOrder.priority}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabs - Full width border */}
        <div className="flex border-b border-gray-200 px-4 flex-shrink-0 bg-white">
          {[
            { key: 'overview', label: 'Overview', icon: 'tabler:info-circle' },
            { key: 'parts', label: 'Parts & Cost', icon: 'tabler:receipt' },
            { key: 'activity', label: 'Activity', icon: 'tabler:history' },
            { key: 'location', label: 'Location', icon: 'tabler:map-pin' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key 
                  ? 'border-primary-600 text-primary-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon icon={tab.icon} className="w-4 h-4" />
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
                    technician={technician || null}
                    allTechnicians={allTechnicians || []}
                    allLocations={allLocations || []}
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
    </div>
  );
};

export default WorkOrderDetailsDrawer;
