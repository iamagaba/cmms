import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  NoteIcon,
  UserIcon,
  Motorbike01Icon,
  Calendar01Icon,
  LockIcon,
  Location01Icon,
  CheckmarkCircle01Icon
} from '@hugeicons/core-free-icons';
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
  // Calculate asset age from year with better formatting
  const getAssetAge = () => {
    if (!vehicle?.year) return null;
    
    const purchaseDate = dayjs(`${vehicle.year}-01-01`);
    const today = dayjs();
    
    const years = today.diff(purchaseDate, 'year');
    const months = today.diff(purchaseDate, 'month') % 12;
    const days = today.diff(purchaseDate, 'day');
    
    if (years >= 1) {
      return `${years} yr${years > 1 ? 's' : ''}`;
    } else if (months >= 1) {
      return `${months} mo`;
    } else {
      return `${days} d`;
    }
  };
  
  const assetAge = getAssetAge();
  
  // Calculate warranty status
  const getWarrantyStatus = () => {
    if (!vehicle?.warranty_end_date) return null;
    
    const warrantyEnd = dayjs(vehicle.warranty_end_date);
    const today = dayjs();
    
    if (warrantyEnd.isBefore(today)) {
      return { status: 'expired', label: 'Expired', color: 'text-red-600', bgColor: 'bg-red-50' };
    }
    
    const daysRemaining = warrantyEnd.diff(today, 'day');
    if (daysRemaining <= 30) {
      return { status: 'expiring', label: `${daysRemaining}d left`, color: 'text-amber-600', bgColor: 'bg-amber-50' };
    }
    
    const monthsRemaining = warrantyEnd.diff(today, 'month');
    return { status: 'active', label: `${monthsRemaining}mo left`, color: 'text-emerald-600', bgColor: 'bg-emerald-50' };
  };
  
  const warrantyInfo = getWarrantyStatus();

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center gap-6 text-sm">
        {/* License Plate - Primary identifier */}
        <div className="flex items-center gap-2 px-2.5 py-1 bg-purple-50 rounded-md" title="License Plate">
          <HugeiconsIcon icon={NoteIcon} size={16} className="text-purple-600" />
          <span className="font-semibold text-purple-900">
            {vehicle?.license_plate || vehicle?.licensePlate || 'N/A'}
          </span>
        </div>

        {/* Customer */}
        <div className="flex items-center gap-2" title="Customer">
          <HugeiconsIcon icon={UserIcon} size={16} className="text-gray-400" />
          <span className="text-gray-700">
            {customer?.name || workOrder.customerName || 'N/A'}
          </span>
        </div>

        {/* Model */}
        <div className="flex items-center gap-2" title="Vehicle Model">
          <HugeiconsIcon icon={Motorbike01Icon} size={16} className="text-gray-400" />
          <span className="text-gray-700">
            {vehicle ? `${vehicle.make} ${vehicle.model}` : 'N/A'}
          </span>
        </div>

        {/* Asset Age */}
        {assetAge && (
          <div className="flex items-center gap-2" title="Asset Age">
            <HugeiconsIcon icon={Calendar01Icon} size={16} className="text-gray-400" />
            <span className="text-gray-700">{assetAge}</span>
          </div>
        )}

        {/* Warranty Status */}
        <div 
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded ${warrantyInfo ? warrantyInfo.bgColor : 'bg-gray-100'}`} 
          title="Warranty Status"
        >
          <HugeiconsIcon icon={LockIcon} size={16} className={warrantyInfo ? warrantyInfo.color : 'text-gray-400'} />
          <span className={`text-xs font-medium ${warrantyInfo ? warrantyInfo.color : 'text-gray-500'}`}>
            {warrantyInfo ? warrantyInfo.label : 'No warranty'}
          </span>
        </div>

        {/* Spacer to push right items */}
        <div className="flex-1" />

        {/* Location */}
        <div className="flex items-center gap-2" title="Service Location">
          <HugeiconsIcon icon={Location01Icon} size={16} className="text-gray-400" />
          <span className="text-gray-700">
            {location?.name || workOrder.serviceCenter || 'N/A'}
          </span>
        </div>

        {/* Assigned Technician */}
        <div 
          className={`flex items-center gap-2 px-2.5 py-1 rounded-md ${technician ? 'bg-emerald-50' : 'bg-amber-50'}`} 
          title="Assigned Technician"
        >
          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className={technician ? 'text-emerald-600' : 'text-amber-600'} />
          <span className={`font-medium ${technician ? 'text-emerald-700' : 'text-amber-700'}`}>
            {technician?.name || 'Unassigned'}
          </span>
        </div>
      </div>
    </div>
  );
};
