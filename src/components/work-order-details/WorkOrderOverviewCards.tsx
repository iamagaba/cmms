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
import { useDensitySpacing } from '@/hooks/useDensitySpacing';
import { useDensity } from '@/context/DensityContext';

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
  const spacing = useDensitySpacing();
  const { isCompact } = useDensity();

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
    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
      <div className="flex items-start gap-6 w-full">
        {/* LICENSE PLATE */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">License Plate</div>
          <div className="text-sm font-semibold text-gray-900">
            {vehicle?.license_plate || vehicle?.licensePlate || '—'}
          </div>
        </div>

        {/* MODEL */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Model</div>
          <div className="text-sm font-medium text-gray-900">
            {vehicle ? `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || '—' : '—'}
          </div>
        </div>

        {/* AGE */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Age</div>
          <div className="text-sm font-medium text-gray-900">
            {assetAge || '—'}
          </div>
        </div>

        {/* WARRANTY */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Warranty</div>
          <div className="text-sm font-medium text-gray-900">
            {warrantyInfo ? warrantyInfo.label : '—'}
          </div>
        </div>

        {/* MILEAGE */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Mileage</div>
          <div className="text-sm font-medium text-gray-900">
            {vehicle?.mileage ? `${vehicle.mileage.toLocaleString()} km` : '—'}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center px-4">
          <div className="h-10 w-px bg-gray-300" />
        </div>

        {/* CUSTOMER */}
        <div className="flex-[1.5] min-w-0">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Customer</div>
          <div className="text-sm font-semibold text-gray-900 truncate">
            {customer?.name || workOrder.customerName || '—'}
          </div>
        </div>

        {/* PHONE */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</div>
          <div className="text-sm font-medium text-gray-900">
            {customer?.phone || workOrder.customerPhone || '—'}
          </div>
        </div>
      </div>
    </div>
  );
};
