import { StatusBadge } from '@/components/badges';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserIcon, Location01Icon, AlertCircleIcon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';
import { WorkOrder, Technician, Vehicle } from '@/types/supabase';
import { formatDistanceToNow, isPast, isValid } from 'date-fns';
import React from 'react';
import { AssetCustodyBadge } from '@/components/AssetCustodyBadge';
import { useDensitySpacing } from '@/hooks/useDensitySpacing';
import { useDensity } from '@/context/DensityContext';

interface UrgentWorkOrdersTableProps {
  workOrders: WorkOrder[];
  technicians: Technician[];
  vehicles: Vehicle[];
  onViewDetails?: (workOrderId: string) => void;
  loading?: boolean;
}

const UrgentWorkOrdersTable: React.FC<UrgentWorkOrdersTableProps> = ({ workOrders, technicians, vehicles, onViewDetails, loading = false }) => {
  const spacing = useDensitySpacing();
  const { isCompact } = useDensity();
  const now = new Date();
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const safeWorkOrders = Array.isArray(workOrders) ? workOrders : [];

  const vehicleMap = React.useMemo(() => new Map((vehicles || []).map(v => [v.id, v])), [vehicles]);

  const urgentOrders = safeWorkOrders
    .filter(wo => {
      if (wo.status === 'Completed' || !wo.slaDue) return false;
      const dueDate = new Date(wo.slaDue as string);
      if (!isValid(dueDate)) return false;
      return isPast(dueDate) || dueDate < twentyFourHoursFromNow;
    })
    .sort((a, b) => {
      const da = new Date(a.slaDue as string);
      const db = new Date(b.slaDue as string);
      const ta = isValid(da) ? da.getTime() : Number.POSITIVE_INFINITY;
      const tb = isValid(db) ? db.getTime() : Number.POSITIVE_INFINITY;
      return ta - tb;
    });

  const renderLicensePlate = (record: WorkOrder) => {
    let licensePlate: string | undefined;
    if (record.vehicleId) {
      const vehicle = vehicleMap.get(record.vehicleId);
      if (vehicle) {
        licensePlate = (vehicle as any).licensePlate || (vehicle as any).license_plate || (vehicle as any).plate;
      }
    }
    if (!licensePlate && (record as any).vehicleModel) licensePlate = (record as any).vehicleModel as any;
    if (!licensePlate && record.vehicleId) licensePlate = record.vehicleId;

    return licensePlate ? <span className={`${spacing.text.caption} font-semibold`}>{licensePlate}</span> : <span className={`${spacing.text.caption} text-gray-400`}>N/A</span>;
  };

  const renderTechnician = (techId: string) => {
    const tech = technicians.find(t => t.id === techId);
    return tech ? (
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 overflow-hidden">
          {tech.avatar ? (
            <img src={tech.avatar} alt={tech.name} className="w-full h-full object-cover" />
          ) : (
            <HugeiconsIcon icon={UserIcon} size={12} />
          )}
        </div>
        <span className={`${spacing.text.caption} truncate max-w-[100px]`}>{tech.name}</span>
      </div>
    ) : (
      <span className={`${spacing.text.caption} text-gray-400`}>Unassigned</span>
    );
  };

  const renderAddress = (address: string) => address ? (
    <div className="flex items-center gap-1">
      <HugeiconsIcon icon={Location01Icon} className="w-3 h-3 text-gray-500" size={12} />
      <span className="text-xs truncate max-w-[150px]" title={address}>{address}</span>
    </div>
  ) : <span className={`${spacing.text.caption} text-gray-400`}>N/A</span>;

  const renderDueStatus = (slaDue: string) => {
    const dueDate = new Date(slaDue);
    if (!isValid(dueDate)) {
      return <StatusBadge status="neutral" size="sm">Unknown</StatusBadge>;
    }
    const overdue = isPast(dueDate);
    return <StatusBadge status={overdue ? 'error' : 'warning'} size="sm">{overdue ? 'Overdue' : 'Due Soon'}</StatusBadge>;
  };

  const renderDueIn = (slaDue: string) => {
    const dueDate = new Date(slaDue);
    return isValid(dueDate)
      ? <span className="text-xs text-gray-500" style={{ fontSize: '10px' }}>{formatDistanceToNow(dueDate, { addSuffix: true })}</span>
      : <span className="text-xs text-gray-500">-</span>;
  };

  const rowCount = 5;

  return (
    <div className="bg-white border border-slate-100 shadow-sm h-full flex flex-col rounded-xl overflow-hidden">
      <div className={`${spacing.card} border-b border-slate-50 flex items-center ${spacing.gap}`}>
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-rose-50 text-rose-500">
          <HugeiconsIcon icon={AlertCircleIcon} className="w-4 h-4" size={spacing.icon.sm} />
        </div>
        <div>
          <span className={`${spacing.text.body} font-bold text-slate-800 block`}>Urgent Work Orders</span>
          <span className={`${spacing.text.caption} text-slate-500`}>
            Due &lt; 24h
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {urgentOrders.length === 0 ? (
          loading ? (
            <div className="p-4 flex flex-col gap-2">
              {Array.from({ length: rowCount }).map((_, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-5 h-5 text-emerald-500" size={20} />
              </div>
              <span className="text-xs font-medium text-slate-500">No urgent work orders</span>
            </div>
          )
        ) : (
          <div className="min-w-[600px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className={`${spacing.rowPadding} ${spacing.text.caption} font-bold text-slate-500 uppercase tracking-wider`}>License Plate</th>
                  <th className={`${spacing.rowPadding} ${spacing.text.caption} font-bold text-slate-500 uppercase tracking-wider`}>Custody</th>
                  <th className={`${spacing.rowPadding} ${spacing.text.caption} font-bold text-slate-500 uppercase tracking-wider`}>Service</th>
                  <th className={`${spacing.rowPadding} ${spacing.text.caption} font-bold text-slate-500 uppercase tracking-wider`}>Technician</th>
                  <th className={`${spacing.rowPadding} ${spacing.text.caption} font-bold text-slate-500 uppercase tracking-wider`}>Location</th>
                  <th className={`${spacing.rowPadding} ${spacing.text.caption} font-bold text-slate-500 uppercase tracking-wider`}>Status</th>
                  <th className={`${spacing.rowPadding} ${spacing.text.caption} font-bold text-slate-500 uppercase tracking-wider`}>Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {urgentOrders.map((record) => (
                  <tr
                    key={record.id}
                    onClick={() => onViewDetails && onViewDetails(record.id)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && onViewDetails) {
                        e.preventDefault();
                        onViewDetails(record.id);
                      }
                    }}
                    className={`
                    group transition-colors duration-150 cursor-pointer hover:bg-slate-50/50
                    focus:outline-none focus:bg-primary-50/50
                  `}
                  >
                    <td className={`${spacing.rowPadding} border-r border-transparent`}>{renderLicensePlate(record)}</td>
                    <td className={`${spacing.rowPadding} border-r border-transparent`}>
                      <AssetCustodyBadge vehicle={record.vehicleId ? vehicleMap.get(record.vehicleId) : null} size="sm" />
                    </td>
                    <td className={`${spacing.rowPadding} border-r border-transparent`}><span className={`${spacing.text.caption} font-medium text-slate-700`}>{record.service}</span></td>
                    <td className={`${spacing.rowPadding} border-r border-transparent`}>{renderTechnician(record.assignedTechnicianId || '')}</td>
                    <td className={`${spacing.rowPadding} border-r border-transparent`}>{renderAddress(record.customerAddress || '')}</td>
                    <td className={`${spacing.rowPadding} border-r border-transparent`}>{renderDueStatus(record.slaDue as string)}</td>
                    <td className={spacing.rowPadding}>{renderDueIn(record.slaDue as string)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(UrgentWorkOrdersTable);
