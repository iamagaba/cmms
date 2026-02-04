import { Bike, Calendar, CheckCircle, Lock, User } from 'lucide-react';
import React from 'react';


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

  // Calculate warranty status (production date + 1 year)
  const getWarrantyStatus = () => {
    // First check if there's an explicit warranty_end_date
    const endDate = vehicle?.warranty_end_date || (vehicle as any)?.warrantyEndDate;

    // If no explicit end date, calculate from production date + 1 year
    const productionDate = vehicle?.date_of_manufacture || (vehicle as any)?.dateOfManufacture;

    let warrantyEnd: dayjs.Dayjs;

    if (endDate) {
      warrantyEnd = dayjs(endDate);
    } else if (productionDate) {
      warrantyEnd = dayjs(productionDate).add(1, 'year');
    } else {
      return null;
    }
    const today = dayjs();

    if (warrantyEnd.isBefore(today)) {
      return { status: 'expired', label: 'Expired', color: 'text-destructive', bgColor: 'bg-destructive/10' };
    }

    const daysRemaining = warrantyEnd.diff(today, 'day');
    if (daysRemaining <= 30) {
      return { status: 'expiring', label: `${daysRemaining}d left`, color: 'text-amber-700', bgColor: 'bg-amber-50' };
    }

    const monthsRemaining = warrantyEnd.diff(today, 'month');
    return { status: 'active', label: `${monthsRemaining}mo left`, color: 'text-foreground', bgColor: 'bg-emerald-50' };
  };

  const warrantyInfo = getWarrantyStatus();

  return (
    <div className="px-4 py-3.5 border-b border-border">
      <div className="flex items-center w-full">
        {/* Vehicle Info Group */}
        <div className="flex items-center gap-4 pr-6 border-r border-border">
          {/* LICENSE PLATE */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-0.5">Plate</div>
            <div className="text-xs font-medium text-foreground">
              {vehicle?.license_plate || vehicle?.licensePlate || '—'}
            </div>
          </div>

          {/* MODEL */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-0.5">Model</div>
            <div className="text-xs font-medium text-foreground">
              {vehicle ? `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || '—' : '—'}
            </div>
          </div>

          {/* AGE */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-0.5">Age</div>
            <div className="text-xs font-medium text-foreground">
              {assetAge || '—'}
            </div>
          </div>
        </div>

        {/* Status Group */}
        <div className="flex items-center gap-4 pl-2 pr-6 border-r border-border">
          {/* WARRANTY */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-0.5">Warranty</div>
            <div className={`text-xs font-medium ${warrantyInfo ? warrantyInfo.color : 'text-foreground'}`}>
              {warrantyInfo ? warrantyInfo.label : '—'}
            </div>
          </div>

          {/* MILEAGE */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-0.5">Mileage</div>
            <div className="text-xs font-medium text-foreground">
              {(() => {
                const mileage = vehicle?.mileage ?? (workOrder as any)?.mileage ?? (workOrder as any)?.odometer ?? (workOrder as any)?.odometer_reading;
                return mileage != null ? `${Number(mileage).toLocaleString()} km` : '—';
              })()}
            </div>
          </div>
        </div>

        {/* Customer Group - Compact */}
        <div className="flex items-center gap-4 pl-2">
          {/* CUSTOMER */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-0.5">Customer</div>
            <div className="text-xs font-medium text-foreground truncate max-w-[200px]">
              {customer?.name || workOrder.customerName || '—'}
            </div>
          </div>

          {/* PHONE */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-0.5">Phone</div>
            <div className="text-xs font-medium text-foreground">
              {customer?.phone || workOrder.customerPhone || '—'}
            </div>
          </div>
        </div>


        {/* Operations Group */}
        <div className="flex items-center gap-4 pl-2 border-l border-border">
          {/* LOCATION */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-0.5 whitespace-nowrap">Location</div>
            <div className="text-xs font-medium text-foreground truncate max-w-[150px]">
              {location?.name || '—'}
            </div>
          </div>

          {/* TECHNICIAN */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-0.5 whitespace-nowrap">Technician</div>
            <div className="text-xs font-medium text-foreground truncate max-w-[150px]">
              {technician?.name || <span className="text-muted-foreground italic">Unassigned</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



