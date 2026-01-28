import React from 'react';
import { User, Phone, Bike, AlertCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import { WorkOrder, Customer, Vehicle } from '@/types/supabase';

interface WorkOrderCustomerVehicleCardProps {
  workOrder: WorkOrder;
  customer?: Customer | null;
  vehicle?: Vehicle | null;
}

export const WorkOrderCustomerVehicleCard: React.FC<WorkOrderCustomerVehicleCardProps> = ({
  workOrder,
  customer,
  vehicle,
}) => {
  // Use customer data from props or fallback to work order fields
  const customerName = customer?.name || workOrder.customerName || null;
  const customerPhone = customer?.phone || workOrder.customerPhone || null;
  const customerType = customer?.customerType || customer?.customer_type || null;

  const hasCustomerInfo = customerName || customerPhone;
  const hasVehicleInfo = vehicle?.vin || vehicle?.license_plate;

  if (!hasCustomerInfo && !hasVehicleInfo) {
    return (
      <div className="bg-white">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Customer & Vehicle</h3>
        </div>
        <div className="px-3 py-2">
          <p className="text-xs text-gray-400 italic">No customer or vehicle information available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-l border-gray-200 pl-3">
      <div className="pb-2 border-b border-gray-200">
        <h3 className="text-[10px] font-semibold text-gray-900 uppercase tracking-wide">Customer & Vehicle</h3>
      </div>

      {/* Use divide-y for sections */}
      <div className="divide-y divide-gray-100">
        {/* Customer Section */}
        {hasCustomerInfo && (
          <div className="py-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-blue-700">
                  {customerName?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <User  className="text-gray-400" />
                  <p className="text-xs font-bold text-gray-900">{customerName || '-'}</p>
                </div>
                {customerType && (
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${customerType === 'WATU' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      customerType === 'B2B' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                    {customerType}
                  </span>
                )}
                {customerPhone && (
                  <a
                    href={`tel:${customerPhone}`}
                    className="text-[10px] text-primary-600 hover:text-primary-700 flex items-center gap-1 mt-1"
                  >
                    <Phone  />
                    {customerPhone}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Section */}
        {hasVehicleInfo && (
          <div className="py-2">
            {/* Vehicle Header with Image */}
            <div className="flex items-start gap-2 mb-2">
              {vehicle?.image_url ? (
                <img
                  src={vehicle.image_url}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-14 h-14 object-cover rounded border border-gray-200 flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 bg-gray-100 rounded border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <Bike  className="text-gray-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Bike  className="text-gray-400" />
                  <span className="text-xs font-bold text-gray-900">
                    {vehicle?.make} {vehicle?.model}
                  </span>
                </div>
                {vehicle?.year && (
                  <span className="text-xs text-gray-500 block mb-1">{vehicle.year}</span>
                )}
                {vehicle?.status && (
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${vehicle.status === 'Normal' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      vehicle.status === 'In Repair' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                    <Icon
                      icon={
                        vehicle.status === 'Normal' ? 'tabler:circle-check' :
                          vehicle.status === 'In Repair' ? 'tabler:tool' :
                            'tabler:circle-x'
                      }
                      className="w-2.5 h-2.5"
                    />
                    {vehicle.status}
                  </span>
                )}
              </div>
            </div>

            {/* Vehicle Details - Grid Layout */}
            <div className="grid grid-cols-2 gap-y-1 text-xs">
              {vehicle?.license_plate && (
                <>
                  <div className="text-gray-500">License Plate</div>
                  <div className="font-medium text-gray-900 text-right">{vehicle.license_plate}</div>
                </>
              )}
              {vehicle?.vin && (
                <>
                  <div className="text-gray-500">VIN</div>
                  <div className="font-mono text-gray-900 text-right text-[10px]" title={vehicle.vin}>
                    {vehicle.vin}
                  </div>
                </>
              )}
              {vehicle?.mileage != null && (
                <>
                  <div className="text-gray-500">Mileage</div>
                  <div className="font-medium text-gray-900 text-right">{vehicle.mileage.toLocaleString()} km</div>
                </>
              )}
              {vehicle?.battery_capacity != null && (
                <>
                  <div className="text-gray-500">Battery</div>
                  <div className="font-medium text-gray-900 text-right">{vehicle.battery_capacity} kWh</div>
                </>
              )}
            </div>

            {/* Warranty Status - Compact */}
            <WarrantyStatus vehicle={vehicle} />
          </div>
        )}
      </div>
    </div>
  );
};

// Warranty Status Component
const WarrantyStatus: React.FC<{ vehicle?: Vehicle | null }> = ({ vehicle }) => {
  if (!vehicle) return null;

  // Calculate warranty status based on warranty_end_date or warranty_start_date + warranty_months
  let warrantyEndDate: Date | null = null;

  if (vehicle.warranty_end_date) {
    warrantyEndDate = new Date(vehicle.warranty_end_date);
  } else if (vehicle.warranty_start_date && vehicle.warranty_months) {
    const startDate = new Date(vehicle.warranty_start_date);
    warrantyEndDate = new Date(startDate);
    warrantyEndDate.setMonth(warrantyEndDate.getMonth() + vehicle.warranty_months);
  } else if (vehicle.release_date) {
    // Default: assume 12 months warranty from release date if no warranty info
    const releaseDate = new Date(vehicle.release_date);
    warrantyEndDate = new Date(releaseDate);
    warrantyEndDate.setMonth(warrantyEndDate.getMonth() + 12);
  }

  if (!warrantyEndDate) return null;

  const now = new Date();
  const daysRemaining = Math.ceil((warrantyEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = daysRemaining < 0;
  const isExpiringSoon = !isExpired && daysRemaining <= 30;

  const formatDaysRemaining = () => {
    if (isExpired) {
      const daysExpired = Math.abs(daysRemaining);
      if (daysExpired > 365) return `${Math.floor(daysExpired / 365)}y ${Math.floor((daysExpired % 365) / 30)}m ago`;
      if (daysExpired > 30) return `${Math.floor(daysExpired / 30)} months ago`;
      return `${daysExpired} days ago`;
    }
    if (daysRemaining > 365) return `${Math.floor(daysRemaining / 365)}y ${Math.floor((daysRemaining % 365) / 30)}m`;
    if (daysRemaining > 30) return `${Math.floor(daysRemaining / 30)} months`;
    return `${daysRemaining} days`;
  };

  return (
    <div className={`mt-1.5 px-2 py-1 rounded border ${isExpired
        ? 'bg-red-50 border-red-200'
        : isExpiringSoon
          ? 'bg-amber-50 border-amber-200'
          : 'bg-emerald-50 border-emerald-200'
      }`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 flex-1 min-w-0">
          {isExpired ? (
            <AlertTriangle className={`w-4 h-4 flex-shrink-0 text-red-600`} />
          ) : isExpiringSoon ? (
            <AlertCircle className={`w-4 h-4 flex-shrink-0 text-amber-600`} />
          ) : (
            <ShieldCheck className={`w-4 h-4 flex-shrink-0 text-emerald-600`} />
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-[10px] font-medium ${isExpired ? 'text-red-700' : isExpiringSoon ? 'text-amber-700' : 'text-emerald-700'
              }`}>
              {isExpired ? 'Warranty Expired' : isExpiringSoon ? 'Expiring Soon' : 'Under Warranty'}
            </p>
            <p className="text-[10px] text-gray-500 truncate">
              {warrantyEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`text-xs font-bold ${isExpired ? 'text-red-700' : isExpiringSoon ? 'text-amber-700' : 'text-emerald-700'
            }`}>
            {formatDaysRemaining()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderCustomerVehicleCard;


