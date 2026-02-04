import { Info, Pause, ChevronRight, Flag } from 'lucide-react';
import React from 'react';
import { WorkOrderSLAStatus } from './WorkOrderSLAStatus';


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

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  'Critical': { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
  'High': { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  'Medium': { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  'Low': { color: 'text-foreground', bg: 'bg-muted', border: 'border-border' },
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
    <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border flex items-start justify-between bg-muted/50">
        <div>
          {/* Title */}
          <h2 className="text-sm font-bold text-foreground leading-tight">
            {getDisplayTitle()}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* SLA Status Badge */}
          <WorkOrderSLAStatus workOrder={workOrder} variant="compact" />

          {/* Priority Badge */}
          {/* Priority Badge */}
          <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${priorityConfig.bg} ${priorityConfig.color} ${priorityConfig.border}`}>
            <Flag className="w-3.5 h-3.5" />
            {workOrder.priority ? workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1).toLowerCase() : 'Medium'}
          </span>
        </div>
      </div>

      {/* Emergency Bike Alert */}
      {hasEmergencyBike && (
        <div className="px-3 py-2 bg-muted border-b border-muted-foreground/20 flex items-center gap-2 text-xs">
          <Info className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span className="text-foreground font-medium">Emergency Bike:</span>
          <UgandaLicensePlate
            plateNumber={emergencyBike.license_plate || emergencyBike.licensePlate || 'N/A'}
            className="scale-[0.6] origin-left"
          />
          <span className="text-muted-foreground -ml-8 tracking-tighter">• {emergencyBike.make} {emergencyBike.model}</span>
          <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg ml-auto">ACTIVE</span>
        </div>
      )}

      {/* 3-Column Grid for Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-b border-border relative">
        {/* Issue Column */}
        <div className="px-3 py-2 relative border-b md:border-b-0 md:border-r border-border group flex flex-col min-h-[80px]">
          <div className="mb-2">
            <h3 className="text-xs font-bold text-foreground">Issue</h3>
            {(workOrder.created_at || (workOrder as any).createdAt) && (
              <div className="text-xs text-muted-foreground font-medium mt-0.5">
                {dayjs(workOrder.created_at || (workOrder as any).createdAt).format('MMM D, h:mm A')}
              </div>
            )}
          </div>
          <div className="text-xs text-foreground flex-1">
            {workOrder.initialDiagnosis ? (
              <ul className="list-disc pl-3 space-y-0.5">
                {workOrder.initialDiagnosis.split(/[,;\n]+/).map((item, index) => {
                  const cleanItem = item.includes(':') ? item.split(':')[1].trim() : item.trim();
                  if (!cleanItem) return null;
                  return <li key={index}>{cleanItem}</li>;
                })}
              </ul>
            ) : (
              <span className="text-xs text-foreground">{workOrder.description || <span className="text-muted-foreground italic">No issue recorded.</span>}</span>
            )}
          </div>

          {/* Arrow Indicator (Desktop Only) */}
          <div className="hidden md:flex absolute top-1/2 -right-2.5 -translate-y-1/2 z-10 bg-white p-0.5 rounded-full border border-border text-muted-foreground shadow-sm">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Confirmation Column */}
        <div className="px-3 py-2 bg-muted/30 relative border-b md:border-b-0 md:border-r border-border flex flex-col min-h-[80px]">
          <div className="mb-2">
            <h3 className="text-xs font-bold text-foreground">Confirmation</h3>
            {((workOrder as any).confirmation_call_at || (workOrder as any).confirmationCallAt) && (
              <div className="text-xs text-muted-foreground font-medium mt-0.5">
                {dayjs((workOrder as any).confirmation_call_at || (workOrder as any).confirmationCallAt).format('MMM D, h:mm A')}
              </div>
            )}
          </div>
          <div className="text-xs text-foreground whitespace-pre-wrap flex-1">
            {(workOrder as any).confirmationCallNotes || workOrder.confirmation_call_notes || (
              <span className="text-muted-foreground italic">No confirmation notes.</span>
            )}
          </div>

          {/* Arrow Indicator (Desktop Only) */}
          <div className="hidden md:flex absolute top-1/2 -right-2.5 -translate-y-1/2 z-10 bg-white p-0.5 rounded-full border border-border text-muted-foreground shadow-sm">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Maintenance Decision Column */}
        <div className="px-3 py-2 flex flex-col min-h-[80px]">
          <div className="mb-2">
            <h3 className="text-xs font-bold text-foreground">Maintenance Decision</h3>
            {(workOrder.completed_at || (workOrder as any).completedAt) && (
              <div className="text-xs text-muted-foreground font-medium mt-0.5">
                {dayjs(workOrder.completed_at || (workOrder as any).completedAt).format('MMM D, h:mm A')}
              </div>
            )}
          </div>
          <div className="text-xs text-foreground whitespace-pre-wrap flex-1">
            {workOrder.maintenanceNotes ? (
              workOrder.maintenanceNotes
            ) : (
              <span className="text-muted-foreground italic">No maintenance decision.</span>
            )}
          </div>
          {workOrder.completed_at && (
            <div className="mt-2 text-xs text-gray-400 font-medium hidden">
              {/* Hidden as it's now in header */}
            </div>
          )}
        </div>
      </div>





      {/* On Hold Reason (if applicable) */}
      {
        workOrder.status === 'On Hold' && workOrder.onHoldReason && (
          <div className="px-3 py-1.5 bg-amber-50 border-t border-amber-200 flex items-start gap-1.5 text-xs">
            <Pause className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-amber-700 font-medium">On Hold: </span>
              <span className="text-amber-800">{workOrder.onHoldReason}</span>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default WorkOrderDetailsInfoCard;




