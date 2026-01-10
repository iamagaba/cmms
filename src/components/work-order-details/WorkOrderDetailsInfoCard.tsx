import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FlagIcon,
  InformationCircleIcon,
  TagIcon,
  Calendar01Icon,
  Clock01Icon,
  Building01Icon,
  PauseIcon,
  ArrowRight01Icon,
  UserIcon
} from '@hugeicons/core-free-icons';
import { WorkOrder, Location } from '@/types/supabase';
import { DiagnosticCategoryRow } from '@/types/diagnostic';
import { UgandaLicensePlate } from '@/components/ui/UgandaLicensePlate';
import dayjs from 'dayjs';

interface WorkOrderDetailsInfoCardProps {
  workOrder: WorkOrder;
  allLocations?: Location[];
  serviceCategories?: DiagnosticCategoryRow[];
  technicians?: any[]; // Using any to avoid importing Technician type if not already imported, but better to import
  onAssignClick?: () => void;
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
  allLocations = [],
  serviceCategories = [],
  technicians = [],
  onAssignClick,
  emergencyBike = null,
  emergencyAssignment = null,
}) => {
  const priorityConfig = PRIORITY_CONFIG[workOrder.priority || 'Medium'] || PRIORITY_CONFIG['Medium'];
  const hasEmergencyBike = !!emergencyBike && !!emergencyAssignment;
  const location = allLocations.find(l => l.id === workOrder.locationId);



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
    <div className="bg-white border border-gray-200 rounded overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
        <div>
          {/* Title */}
          <h2 className="text-sm font-bold text-gray-900 leading-tight">
            {getDisplayTitle()}
          </h2>
        </div>

        {/* Priority Badge */}
        <span className={`flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${priorityConfig.bg} ${priorityConfig.color}`}>
          <HugeiconsIcon icon={FlagIcon} size={10} />
          {workOrder.priority ? workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1).toLowerCase() : 'Medium'}
        </span>
      </div>

      {/* Emergency Bike Alert */}
      {hasEmergencyBike && (
        <div className="px-3 py-1.5 bg-blue-50 border-b border-blue-200 flex items-center gap-2 text-xs">
          <HugeiconsIcon icon={InformationCircleIcon} size={12} className="text-blue-600 flex-shrink-0" />
          <span className="text-blue-900 font-medium">Emergency Bike:</span>
          <UgandaLicensePlate
            plateNumber={emergencyBike.license_plate || emergencyBike.licensePlate || 'N/A'}
            className="scale-[0.6] origin-left"
          />
          <span className="text-blue-800 -ml-8 tracking-tighter">• {emergencyBike.make} {emergencyBike.model}</span>
          <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-medium rounded ml-auto">ACTIVE</span>
        </div>
      )}

      {/* 3-Column Grid for Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-200 relative">
        {/* Issue Column */}
        <div className="px-3 py-2 relative border-b md:border-b-0 md:border-r border-gray-200 group">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Issue</h3>
          <div className="text-xs text-gray-900">
            {workOrder.initialDiagnosis ? (
              <ul className="list-disc pl-3 space-y-0.5">
                {workOrder.initialDiagnosis.split(/[,;\n]+/).map((item, index) => {
                  const cleanItem = item.includes(':') ? item.split(':')[1].trim() : item.trim();
                  if (!cleanItem) return null;
                  return <li key={index}>{cleanItem}</li>;
                })}
              </ul>
            ) : (
              <span className="text-xs text-gray-900">{workOrder.description || <span className="text-gray-400 italic">No issue recorded.</span>}</span>
            )}
          </div>

          {/* Arrow Indicator (Desktop Only) */}
          <div className="hidden md:flex absolute top-1/2 -right-2.5 -translate-y-1/2 z-10 bg-white p-0.5 rounded-full border border-gray-200 text-gray-400 shadow-sm">
            <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
          </div>
        </div>

        {/* Confirmation Column */}
        <div className="px-3 py-2 bg-gray-50/30 relative border-b md:border-b-0 md:border-r border-gray-200">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Confirmation</h3>
          <div className="text-xs text-gray-900 whitespace-pre-wrap">
            {(workOrder as any).confirmationCallNotes || workOrder.confirmation_call_notes || (
              <span className="text-gray-400 italic">No confirmation notes.</span>
            )}
          </div>

          {/* Arrow Indicator (Desktop Only) */}
          <div className="hidden md:flex absolute top-1/2 -right-2.5 -translate-y-1/2 z-10 bg-white p-0.5 rounded-full border border-gray-200 text-gray-400 shadow-sm">
            <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
          </div>
        </div>

        {/* Maintenance Decision Column */}
        <div className="px-3 py-2">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Maintenance Decision</h3>
          <div className="text-xs text-gray-900 whitespace-pre-wrap">
            {workOrder.maintenanceNotes ? (
              workOrder.maintenanceNotes
            ) : (
              <span className="text-gray-400 italic">No maintenance decision.</span>
            )}
          </div>
        </div>
      </div>

      {/* Compact Metadata Footer */}
      <div className="px-3 py-2 bg-gray-50 mt-auto">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
          {/* Created */}
          {workOrder.created_at && (
            <div className="flex items-center gap-1">
              <HugeiconsIcon icon={Calendar01Icon} size={12} className="text-gray-400" />
              <span>{dayjs(workOrder.created_at).format('MMM D, h:mm A')}</span>
            </div>
          )}

          {/* SLA Due */}
          {workOrder.slaDue && (
            <div className="flex items-center gap-1">
              <HugeiconsIcon icon={Clock01Icon} size={12} className="text-gray-400" />
              <span className={`${dayjs(workOrder.slaDue).isBefore(dayjs()) ? 'text-red-600 font-medium' : ''}`}>
                Due {dayjs(workOrder.slaDue).format('MMM D, h:mm A')}
              </span>
            </div>
          )}

          {/* Location Chip */}
          {location?.name && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <HugeiconsIcon icon={Building01Icon} size={10} />
              {location.name}
            </span>
          )}

          {/* Technician Chip - Closer to location */}
          {(() => {
            const technician = technicians?.find(t => t.id === workOrder.assignedTechnicianId);
            if (technician) {
              return (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <HugeiconsIcon icon={UserIcon} size={10} />
                  {technician.name}
                </span>
              );
            } else if (workOrder.status === 'Ready' && onAssignClick) {
              return (
                <button
                  onClick={onAssignClick}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <HugeiconsIcon icon={UserIcon} size={10} />
                  + Assign
                </button>
              );
            } else {
              return (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
                  <HugeiconsIcon icon={UserIcon} size={10} />
                  Unassigned
                </span>
              );
            }
          })()}
        </div>
      </div>

      {/* On Hold Reason (if applicable) */}
      {
        workOrder.status === 'On Hold' && workOrder.onHoldReason && (
          <div className="px-3 py-1.5 bg-amber-50 border-t border-amber-200 flex items-start gap-1.5 text-xs">
            <HugeiconsIcon icon={PauseIcon} size={12} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-amber-700 font-medium">On Hold: </span>
              <span className="text-amber-800">{workOrder.onHoldReason}</span>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default WorkOrderDetailsInfoCard;
