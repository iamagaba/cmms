import React from 'react';
import { Icon } from '@iconify/react';
import { WorkOrder, Customer, Vehicle, Technician, Location } from '@/types/supabase';
import dayjs from 'dayjs';

interface WorkOrderOverviewCardsProps {
  workOrder: WorkOrder;
  customer: Customer | null;
  vehicle: Vehicle | null;
  technician: Technician | null;
  location: Location | null;
}

export const WorkOrderOverviewCards: React.FC<WorkOrderOverviewCardsProps> = ({
  workOrder,
  customer,
  vehicle,
  technician,
  location
}) => {
  return (
    <div className="bg-white border-y border-gray-200 px-4 py-2.5 mb-3">
      <div className="flex items-center gap-5 text-xs">
        {/* Customer */}
        <div className="flex items-center gap-1.5">
          <Icon icon="tabler:user" className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span className="text-gray-500">Customer:</span>
          <span className="font-medium text-gray-900 whitespace-nowrap">{customer?.name || workOrder.customerName || 'N/A'}</span>
          {customer?.phone && (
            <span className="text-gray-400 whitespace-nowrap">• {customer.phone}</span>
          )}
        </div>

        <div className="w-px h-4 bg-gray-200" />

        {/* Asset */}
        <div className="flex items-center gap-1.5">
          <Icon icon="tabler:motorbike" className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
          <span className="text-gray-500">Asset:</span>
          <span className="font-medium text-gray-900">
            {vehicle?.license_plate || vehicle?.licensePlate || 'N/A'}
          </span>
          {vehicle && (
            <span className="text-gray-400">• {vehicle.make} {vehicle.model}</span>
          )}
        </div>

        <div className="w-px h-4 bg-gray-200" />

        {/* Location */}
        <div className="flex items-center gap-1.5">
          <Icon icon="tabler:map-pin" className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span className="text-gray-500">Location:</span>
          <span className="font-medium text-gray-900">
            {location?.name || workOrder.serviceCenter || 'Not assigned'}
          </span>
        </div>

        <div className="w-px h-4 bg-gray-200" />

        {/* Assigned Technician */}
        <div className="flex items-center gap-1.5">
          <Icon icon="tabler:user-check" className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span className="text-gray-500">Assigned:</span>
          <span className="font-medium text-gray-900">{technician?.name || 'Unassigned'}</span>
          {workOrder.priority && (
            <span className={`font-medium ${
              workOrder.priority === 'High' ? 'text-red-600' :
              workOrder.priority === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              • {workOrder.priority}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
