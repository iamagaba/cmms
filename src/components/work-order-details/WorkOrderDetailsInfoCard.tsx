import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FlagIcon,
  InformationCircleIcon,
  TagIcon,
  Calendar01Icon,
  Clock01Icon,
  Call02Icon,
  Building01Icon,
  PauseIcon
} from '@hugeicons/core-free-icons';
import { WorkOrder, Technician, Location, Customer, Vehicle } from '@/types/supabase';
import { DiagnosticCategoryRow } from '@/types/diagnostic';
import dayjs from 'dayjs';

interface WorkOrderDetailsInfoCardProps {
  workOrder: WorkOrder;
  customer?: Customer | null;
  vehicle?: Vehicle | null;
  technician?: Technician | null;
  allTechnicians?: Technician[];
  allLocations?: Location[];
  serviceCategories?: DiagnosticCategoryRow[];
  handleUpdateWorkOrder?: (updates: Partial<WorkOrder>) => void;
  emergencyBike?: any | null;
  emergencyAssignment?: any | null;
}

const PRIORITY_CONFIG: Record<string, { color: string; bg: string }> = {
  'Critical': { color: 'text-red-700', bg: 'bg-red-50' },
  'High': { color: 'text-orange-700', bg: 'bg-orange-50' },
  'Medium': { color: 'text-amber-700', bg: 'bg-amber-50' },
  'Low': { color: 'text-emerald-700', bg: 'bg-emerald-50' },
};

export const WorkOrderDetailsInfoCard: React.FC<WorkOrderDetailsInfoCardProps> = ({
  workOrder,
  customer,
  vehicle,
  technician,
  allTechnicians = [],
  allLocations = [],
  serviceCategories = [],
  handleUpdateWorkOrder,
  emergencyBike = null,
  emergencyAssignment = null,
}) => {
  const priorityConfig = PRIORITY_CONFIG[workOrder.priority || 'Medium'] || PRIORITY_CONFIG['Medium'];
  const hasEmergencyBike = !!emergencyBike && !!emergencyAssignment;
  const location = allLocations.find(l => l.id === workOrder.locationId);

  // Calculate asset age
  const getAssetAge = () => {
    if (!vehicle?.year) return null;
    const purchaseDate = dayjs(`${vehicle.year}-01-01`);
    const today = dayjs();
    const years = today.diff(purchaseDate, 'year');
    const months = today.diff(purchaseDate, 'month') % 12;
    const days = today.diff(purchaseDate, 'day');
    if (years >= 1) return `${years} yr${years > 1 ? 's' : ''}`;
    else if (months >= 1) return `${months} mo`;
    else return `${days} d`;
  };

  // Calculate warranty status
  const getWarrantyStatus = () => {
    if (!vehicle?.warranty_end_date) return null;
    const warrantyEnd = dayjs(vehicle.warranty_end_date);
    const today = dayjs();
    if (warrantyEnd.isBefore(today)) {
      return { label: 'Expired', color: 'text-red-600', bgColor: 'bg-red-50' };
    }
    const daysRemaining = warrantyEnd.diff(today, 'day');
    if (daysRemaining <= 30) {
      return { label: `${daysRemaining}d left`, color: 'text-amber-600', bgColor: 'bg-amber-50' };
    }
    const monthsRemaining = warrantyEnd.diff(today, 'month');
    return { label: `${monthsRemaining}mo left`, color: 'text-emerald-600', bgColor: 'bg-emerald-50' };
  };

  const assetAge = getAssetAge();
  const warrantyInfo = getWarrantyStatus();

  // Get the display title
  const getDisplayTitle = () => {
    const title = workOrder.title || workOrder.service || workOrder.initialDiagnosis || 'General maintenance';
    const getServiceCategoryInfo = (serviceId?: string | null) => {
      if (!serviceId) return null;
      return serviceCategories?.find(c => c.id === serviceId);
    };
    const categoryInfo = getServiceCategoryInfo(workOrder.service);
    const displayTitle = categoryInfo?.label || categoryInfo?.name || title;
    return displayTitle.replace(/^-\s*/, '').trim() || 'General maintenance';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header - Title First, Prominent */}
      <div className="px-4 py-4 border-b border-gray-100">
        {/* Title - Large and prominent at top */}
        <h2 className="text-lg font-semibold text-gray-900 leading-tight mb-2">
          {getDisplayTitle()}
        </h2>

        {/* Description if exists */}
        {workOrder.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{workOrder.description}</p>
        )}

        {/* Priority badge only - Status is shown in stepper */}
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig.bg} ${priorityConfig.color}`}>
          <HugeiconsIcon icon={FlagIcon} size={12} />
          {workOrder.priority || 'Medium'} Priority
        </span>
      </div>

      {/* Emergency Bike - Compact Alert */}
      {hasEmergencyBike && (
        <div className="px-3 py-2 bg-blue-50 border-b border-blue-200 flex items-center gap-2 text-xs">
          <HugeiconsIcon icon={InformationCircleIcon} size={14} className="text-blue-600 flex-shrink-0" />
          <span className="text-blue-900 font-medium">Emergency Bike:</span>
          <span className="text-blue-800">{emergencyBike.license_plate} • {emergencyBike.make} {emergencyBike.model}</span>
          <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-medium rounded ml-auto">ACTIVE</span>
        </div>
      )}

      {/* Compact Inline Details */}
      <div className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          {/* WO# */}
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon icon={TagIcon} size={16} className="text-gray-400" />
            <span className="text-gray-900 font-medium">{workOrder.workOrderNumber || '-'}</span>
          </div>

          {/* Created */}
          {workOrder.created_at && (
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon icon={Calendar01Icon} size={16} className="text-gray-400" />
              <span className="text-gray-600">{dayjs(workOrder.created_at).format('MMM D, h:mm A')}</span>
            </div>
          )}

          {/* SLA Due */}
          {workOrder.slaDue && (
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon icon={Clock01Icon} size={16} className="text-gray-400" />
              <span className={`${dayjs(workOrder.slaDue).isBefore(dayjs()) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                Due {dayjs(workOrder.slaDue).format('MMM D, h:mm A')}
              </span>
            </div>
          )}

          {/* Channel */}
          {workOrder.channel && (
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon icon={Call02Icon} size={16} className="text-gray-400" />
              <span className="text-gray-600">{workOrder.channel}</span>
            </div>
          )}

          {/* Service Center */}
          {location?.name && (
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon icon={Building01Icon} size={16} className="text-gray-400" />
              <span className="text-gray-600">{location.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* On Hold Reason - Compact */}
      {workOrder.status === 'On Hold' && workOrder.onHoldReason && (
        <div className="px-3 py-2 bg-amber-50 border-t border-amber-200 flex items-start gap-2 text-xs">
          <HugeiconsIcon icon={PauseIcon} size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-amber-700 font-medium">On Hold: </span>
            <span className="text-amber-800">{workOrder.onHoldReason}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderDetailsInfoCard;
