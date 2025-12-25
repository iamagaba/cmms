import React from 'react';
import { Icon } from '@iconify/react';
import { WorkOrder, Technician, Location } from '@/types/supabase';
import dayjs from 'dayjs';

interface WorkOrderDetailsInfoCardProps {
  workOrder: WorkOrder;
  technician?: Technician | null;
  allTechnicians?: Technician[];
  allLocations?: Location[];
  handleUpdateWorkOrder?: (updates: Partial<WorkOrder>) => void;
  emergencyBike?: any | null;
  emergencyAssignment?: any | null;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  'Open': { color: 'text-blue-700', bg: 'bg-blue-50', icon: 'tabler:circle' },
  'Confirmation': { color: 'text-purple-700', bg: 'bg-purple-50', icon: 'tabler:circle-check' },
  'On Hold': { color: 'text-gray-700', bg: 'bg-gray-50', icon: 'tabler:clock-pause' },
  'Ready': { color: 'text-cyan-700', bg: 'bg-cyan-50', icon: 'tabler:circle-dot' },
  'In Progress': { color: 'text-purple-700', bg: 'bg-purple-50', icon: 'tabler:progress' },
  'Completed': { color: 'text-emerald-700', bg: 'bg-emerald-50', icon: 'tabler:circle-check-filled' },
};

const PRIORITY_CONFIG: Record<string, { color: string; bg: string }> = {
  'Critical': { color: 'text-red-700', bg: 'bg-red-50' },
  'High': { color: 'text-orange-700', bg: 'bg-orange-50' },
  'Medium': { color: 'text-amber-700', bg: 'bg-amber-50' },
  'Low': { color: 'text-emerald-700', bg: 'bg-emerald-50' },
};

export const WorkOrderDetailsInfoCard: React.FC<WorkOrderDetailsInfoCardProps> = ({
  workOrder,
  technician,
  allTechnicians = [],
  allLocations = [],
  handleUpdateWorkOrder,
  emergencyBike = null,
  emergencyAssignment = null,
}) => {
  const statusConfig = STATUS_CONFIG[workOrder.status || 'Open'] || STATUS_CONFIG['Open'];
  const priorityConfig = PRIORITY_CONFIG[workOrder.priority || 'Medium'] || PRIORITY_CONFIG['Medium'];
  const hasEmergencyBike = !!emergencyBike && !!emergencyAssignment;
  const location = allLocations.find(l => l.id === workOrder.locationId);

  return (
    <div className="bg-white border-y border-gray-200">
      {/* Header with Title & Badges */}
      <div className="px-4 py-3 border-b border-gray-100">
        {/* Badges at top */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.color.replace('text-', 'border-').replace('-700', '-200')}`}>
            <Icon icon={statusConfig.icon} className="w-3 h-3" />
            {workOrder.status || 'Open'}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${priorityConfig.bg} ${priorityConfig.color}`}>
            <Icon icon="tabler:flag" className="w-3 h-3" />
            {workOrder.priority || 'Medium'}
          </span>
        </div>
        {/* Title - Full wrapping allowed */}
        <div>
          <h2 className="text-base font-bold text-gray-900 leading-snug">
            {(() => {
              const title = workOrder.title || workOrder.service || workOrder.initialDiagnosis || 'General maintenance';
              // Remove leading hyphen and trim whitespace
              return title.replace(/^-\s*/, '').trim() || 'General maintenance';
            })()}
          </h2>
          {workOrder.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{workOrder.description}</p>
          )}
        </div>
      </div>

      {/* Emergency Bike - Compact Alert */}
      {hasEmergencyBike && (
        <div className="px-3 py-2 bg-blue-50 border-b border-blue-200 flex items-center gap-2 text-xs">
          <Icon icon="tabler:lifebuoy" className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span className="text-blue-900 font-medium">Emergency Bike:</span>
          <span className="text-blue-800">{emergencyBike.license_plate} • {emergencyBike.make} {emergencyBike.model}</span>
          <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-medium rounded ml-auto">ACTIVE</span>
        </div>
      )}

      {/* Compact Grid Layout */}
      <div className="px-4 py-3 text-xs">
        <div className="grid grid-cols-4 gap-x-4 gap-y-3">
          {/* Row 1 */}
          {/* WO# */}
          <div>
            <span className="text-gray-500 block mb-1">WO#</span>
            <span className="text-gray-900 font-medium">{workOrder.workOrderNumber || '-'}</span>
          </div>
          
          {/* Channel - Only show if has value */}
          {workOrder.channel && (
            <div>
              <span className="text-gray-500 block mb-1">Channel</span>
              <span className="text-gray-900">{workOrder.channel}</span>
            </div>
          )}
          
          {/* Created */}
          {workOrder.created_at && (
            <div>
              <span className="text-gray-500 block mb-1">Created</span>
              <span className="text-gray-900">
                {dayjs(workOrder.created_at).format('MMM D, h:mm A')}
              </span>
            </div>
          )}
          
          {/* SLA Due - Red if overdue */}
          <div>
            <span className="text-gray-500 block mb-1">SLA Due</span>
            <span className={`${
              workOrder.slaDue && dayjs(workOrder.slaDue).isBefore(dayjs()) 
                ? 'text-red-600 font-semibold' 
                : 'text-gray-900'
            }`}>
              {workOrder.slaDue ? dayjs(workOrder.slaDue).format('MMM D, h:mm A') : '-'}
            </span>
          </div>
          
          {/* Row 2 - Service Center moved up, Technician removed (it's in ribbon) */}
          {/* Service Center - Only show if has value */}
          {location?.name && (
            <div className="col-span-2">
              <span className="text-gray-500 block mb-1">Service Center</span>
              <span className="text-gray-900">{location.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* On Hold Reason - Compact */}
      {workOrder.status === 'On Hold' && workOrder.onHoldReason && (
        <div className="px-3 py-2 bg-amber-50 border-t border-amber-200 flex items-start gap-2 text-xs">
          <Icon icon="tabler:clock-pause" className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
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
