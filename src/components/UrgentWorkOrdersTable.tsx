import { CheckCircle, User } from 'lucide-react';
import { StatusBadge } from '@/components/badges';
import { EmptyState } from '@/components/ui/empty-state';


import { WorkOrder, Technician, Vehicle } from '@/types/supabase';
import { formatDistanceToNow, isPast, isValid } from 'date-fns';
import React from 'react';
import { AssetCustodyBadge } from '@/components/AssetCustodyBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UrgentWorkOrdersTableProps {
  workOrders: WorkOrder[];
  technicians: Technician[];
  vehicles: Vehicle[];
  onViewDetails?: (workOrderId: string) => void;
  loading?: boolean;
}

const UrgentWorkOrdersTable: React.FC<UrgentWorkOrdersTableProps> = ({ workOrders, technicians, vehicles, onViewDetails, loading = false }) => {
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

    return licensePlate ? <span className="text-xs font-semibold">{licensePlate}</span> : <span className="text-xs text-gray-400">N/A</span>;
  };

  const renderTechnician = (techId: string) => {
    const tech = technicians.find(t => t.id === techId);
    return tech ? (
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
          {tech.avatar ? (
            <img src={tech.avatar} alt={tech.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-5 h-5" />
          )}
        </div>
        <span className="text-xs truncate max-w-[100px]">{tech.name}</span>
      </div>
    ) : (
      <span className="text-xs text-gray-400">Unassigned</span>
    );
  };

  const renderAddress = (address: string) => address ? (
    <div className="flex items-center gap-1">
      <Location01Icon className="w-3 h-3 text-gray-500 w-4 h-4" />
      <span className="text-xs truncate max-w-[150px]" title={address}>{address}</span>
    </div>
  ) : <span className="text-xs text-gray-400">N/A</span>;

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
    <div className="bg-white border border-border shadow-sm h-full flex flex-col rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-rose-50 text-rose-500">
          <AlertCircle className="w-4 h-4 w-4 h-4" />
        </div>
        <div>
          <span className="text-sm font-bold text-foreground block">Urgent Work Orders</span>
          <span className="text-xs text-muted-foreground">
            Due &lt; 24h
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {urgentOrders.length === 0 ? (
          loading ? (
            <div className="p-4 flex flex-col gap-2">
              {Array.from({ length: rowCount }).map((_, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<CheckCircle className="w-6 h-6 text-emerald-500" />}
              title="No urgent work orders"
              description="All urgent work orders have been completed"
            />
          )
        ) : (
          <div className="min-w-[600px]">
            <div className="min-w-[600px] p-2">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="px-4 py-3 text-xs font-bold text-muted-foreground">License Plate</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-bold text-muted-foreground">Custody</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-bold text-muted-foreground">Service</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-bold text-muted-foreground">Technician</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-bold text-muted-foreground">Location</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-bold text-muted-foreground">Status</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-bold text-muted-foreground">Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {urgentOrders.map((record) => (
                    <TableRow
                      key={record.id}
                      onClick={() => onViewDetails && onViewDetails(record.id)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && onViewDetails) {
                          e.preventDefault();
                          onViewDetails(record.id);
                        }
                      }}
                      className="group cursor-pointer hover:bg-muted/50 focus:outline-none focus:bg-primary/5"
                    >
                      <TableCell className="px-4 py-3 border-r border-transparent">{renderLicensePlate(record)}</TableCell>
                      <TableCell className="px-4 py-3 border-r border-transparent">
                        <AssetCustodyBadge vehicle={record.vehicleId ? vehicleMap.get(record.vehicleId) : null} size="sm" />
                      </TableCell>
                      <TableCell className="px-4 py-3 border-r border-transparent"><span className="text-xs font-medium text-foreground">{record.service}</span></TableCell>
                      <TableCell className="px-4 py-3 border-r border-transparent">{renderTechnician(record.assignedTechnicianId || '')}</TableCell>
                      <TableCell className="px-4 py-3 border-r border-transparent">{renderAddress(record.customerAddress || '')}</TableCell>
                      <TableCell className="px-4 py-3 border-r border-transparent">{renderDueStatus(record.slaDue as string)}</TableCell>
                      <TableCell className="px-4 py-3">{renderDueIn(record.slaDue as string)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(UrgentWorkOrdersTable);




