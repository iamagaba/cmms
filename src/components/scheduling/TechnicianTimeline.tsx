import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Card, Typography, Avatar } from 'antd';
import { Technician, WorkOrder } from '@/types/supabase';
import dayjs from 'dayjs';
import StatusChip from '@/components/StatusChip';

const { Text, Title } = Typography;

interface TimelineItem {
  id: string;
  start: string | null;
  end: string | null;
  wo: WorkOrder;
}

interface TechnicianTimelineProps {
  technician: Technician;
  items: TimelineItem[];
  onDrop: (workOrderId: string, technicianId: string, start: string) => void;
  vehiclesById?: Map<string, PlateLookup> | Record<string, PlateLookup | undefined>;
  onOpenDrawer?: (workOrderId: string) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => 8 + i); // 8am - 8pm

const TechnicianTimeline: React.FC<TechnicianTimelineProps> = ({ technician, items, onDrop, vehiclesById, onOpenDrawer }) => {
  const [dragOverHour, setDragOverHour] = useState<number | null>(null);
  const [nowTs, setNowTs] = useState<number>(Date.now());

  // Lightweight refresh every 10 minutes to update durations and the "Now" endpoint for in-progress bars
  useEffect(() => {
    // Update every minute for near real-time timeline accuracy
    const id = setInterval(() => setNowTs(Date.now()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, hour: number) => {
    e.preventDefault();
    setDragOverHour(hour);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, hour: number) => {
    e.preventDefault();
    const workOrderId = e.dataTransfer.getData('text/plain');
    const start = dayjs().hour(hour).minute(0).second(0).toISOString();
    onDrop(workOrderId, technician.id, start);
    setDragOverHour(null);
  };

  const windowStart = dayjs().tz('Africa/Kampala').hour(8).minute(0).second(0);
  const windowEnd = dayjs().tz('Africa/Kampala').hour(20).minute(0).second(0);

  // Normalize items for display: choose a sensible start/end per rules
  type Normalized = {
    id: string;
    wo: WorkOrder;
    status: string;
    rawStart: dayjs.Dayjs | null;
    rawEnd: dayjs.Dayjs | null;
    isQueuedUnscheduled: boolean;
  };

  const normalized = useMemo<Normalized[]>(() => {
    return items.map(it => {
      const w = it.wo as any;
      const status: string = w.status || 'Open';
      const workStarted: string | null = (w.workStartedAt ?? w.work_started_at) || null;
      const completed: string | null = (w.completedAt ?? w.completed_at) || null;
      const appointment: string | null = (w.appointmentDate ?? w.appointment_date ?? it.start) || null;

      let rawStart: dayjs.Dayjs | null = null;
      let rawEnd: dayjs.Dayjs | null = null;
      let isQueuedUnscheduled = false;

      if (status === 'In Progress') {
        rawStart = workStarted ? dayjs(workStarted).tz('Africa/Kampala') : (appointment ? dayjs(appointment).tz('Africa/Kampala') : dayjs().tz('Africa/Kampala'));
        // Do not set rawEnd here; we'll compute dynamic "now" in the bar calculation
        rawEnd = null;
      } else if (status === 'Completed') {
        rawStart = workStarted ? dayjs(workStarted) : (appointment ? dayjs(appointment) : null);
        rawEnd = completed ? dayjs(completed) : (rawStart ? rawStart.add(30, 'minute') : null);
      } else if (status === 'Ready') {
        rawStart = appointment ? dayjs(appointment) : null;
        rawEnd = rawStart ? rawStart.add(30, 'minute') : null;
        if (!rawStart) {
          // Assigned but unscheduled (no appointment) – show a small placeholder at window start
          isQueuedUnscheduled = true;
          rawStart = windowStart;
          rawEnd = windowStart.add(30, 'minute');
        }
      } else {
        // Other statuses are ignored unless they have meaningful times
        rawStart = appointment ? dayjs(appointment) : (workStarted ? dayjs(workStarted) : null);
        rawEnd = completed ? dayjs(completed) : (rawStart ? rawStart.add(30, 'minute') : null);
      }

      return { id: it.id, wo: it.wo, status, rawStart, rawEnd, isQueuedUnscheduled };
    });
  }, [items, windowStart]);

  // Compute bar positions across the full 8:00–20:00 window
  type Bar = {
    id: string;
    leftPct: number;
    widthPct: number;
    lane: number;
    color: string;
    label: string;
  };

  const bars: Bar[] = useMemo(() => {
    const now = dayjs(nowTs).tz('Africa/Kampala');
    const totalMins = windowEnd.diff(windowStart, 'minute');
    const sorted = normalized
      .map(it => {
        const rawStart = it.rawStart;
        const rawEnd = it.rawEnd;
        if (!rawStart) return null;
        // Skip if the range doesn't intersect today's window
        const potentialEnd = (it.status === 'In Progress') ? now : (rawEnd || rawStart.add(30, 'minute'));
        if (potentialEnd.isBefore(windowStart) || rawStart.isAfter(windowEnd)) return null;

        const start = rawStart.isBefore(windowStart) ? windowStart : rawStart;
        const endBase = (it.status === 'In Progress') ? now : (rawEnd || rawStart.add(30, 'minute'));
        const end = endBase.isAfter(windowEnd) ? windowEnd : endBase;
        if (!end.isAfter(start)) return null;

        const leftPct = (start.diff(windowStart, 'minute') / totalMins) * 100;
        const widthPct = (end.diff(start, 'minute') / totalMins) * 100;
        const isInProgress = it.status === 'In Progress';
        const isCompleted = it.status === 'Completed';
        const color = isInProgress ? '#fa8c16' : isCompleted ? '#52c41a' : '#1677ff';
        // Determine license plate if available
        const woVehicleId = (it.wo as any).vehicleId || (it.wo as any).vehicle_id || null;
        let plate: string | undefined;
        if (woVehicleId && vehiclesById) {
          if (vehiclesById instanceof Map) {
            plate = vehiclesById.get(woVehicleId)?.license_plate;
          } else {
            plate = (vehiclesById as Record<string, PlateLookup | undefined>)[woVehicleId]?.license_plate;
          }
        }
        // Fallbacks if plate unavailable
        const fallbackPlate = (it.wo as any).vehicleModel || (it.wo as any).workOrderNumber || (it.wo as any).id;
        const plateLabel = plate || fallbackPlate;

        // Compute assignedAt from activityLog (last "Assigned to ..." for this tech), fallback to appointment/work_started
        const activityLog = ((it.wo as any).activityLog || []) as { timestamp: string; activity: string }[];
        const techName = technician.name;
        let assignedAt: dayjs.Dayjs | null = null;
        for (let i = activityLog.length - 1; i >= 0; i--) {
          const a = activityLog[i];
          const msg = (a.activity || '').toLowerCase();
          if (msg.includes('assigned to')) {
            if (msg.includes(techName.toLowerCase())) {
              assignedAt = dayjs(a.timestamp);
              break;
            }
            // If message doesn't include name, still consider it as a last resort
            if (!assignedAt) assignedAt = dayjs(a.timestamp);
          }
        }
        if (!assignedAt) {
          const appr = (it.wo as any).appointmentDate || (it.wo as any).appointment_date;
          const started = (it.wo as any).workStartedAt || (it.wo as any).work_started_at;
          assignedAt = appr ? dayjs(appr) : (started ? dayjs(started) : null);
        }

        const ageMins = assignedAt ? Math.max(0, now.diff(assignedAt, 'minute')) : null;
        const ageLabel = ageMins !== null ? formatElapsed(ageMins) : '';
        const queuedSuffix = it.isQueuedUnscheduled && it.status === 'Ready' ? ' (queued)' : '';
        const label = `${plateLabel}${queuedSuffix}${ageLabel ? ` • ${ageLabel}` : ''}`.trim();
        return { id: it.id, start, end, leftPct, widthPct, label, color };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.start.valueOf() - b.start.valueOf()) as any[];

    // Greedy lane assignment to reduce overlaps
    const laneEnds: dayjs.Dayjs[] = [];
    const result: Bar[] = [];
    for (const it of sorted) {
      let lane = laneEnds.findIndex(end => end.isSame(it.start) || end.isBefore(it.start));
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(it.end);
      } else {
        laneEnds[lane] = it.end;
      }
      result.push({ id: it.id, leftPct: it.leftPct, widthPct: it.widthPct, lane, color: it.color, label: it.label });
    }
    return result;
  }, [normalized, windowEnd, windowStart, vehiclesById, technician.name, nowTs]);

  // Compute hour from overlay pointer X
  const computeHourFromClientX = useCallback((container: HTMLDivElement | null, clientX: number): number | null => {
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    if (width <= 0) return null;
    const idx = Math.min(HOURS.length - 1, Math.max(0, Math.floor((x / width) * HOURS.length)));
    return HOURS[idx] ?? null;
  }, []);

  const handleOverlayDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const hour = computeHourFromClientX(e.currentTarget, e.clientX);
    if (hour !== null) setDragOverHour(hour);
  };

  const handleOverlayDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const hour = computeHourFromClientX(e.currentTarget, e.clientX);
    if (hour !== null) {
      const workOrderId = e.dataTransfer.getData('text/plain');
      const start = dayjs().hour(hour).minute(0).second(0).toISOString();
      onDrop(workOrderId, technician.id, start);
    }
    setDragOverHour(null);
  };

  // Count of items visible on today's window (for capacity badge)
  const visibleCount = useMemo(() => {
    const now = dayjs(nowTs).tz('Africa/Kampala');
    return normalized.filter(it => {
      const rawStart = it.rawStart;
      const rawEnd = (it.status === 'In Progress') ? now : (it.rawEnd || (rawStart ? rawStart.add(30, 'minute') : null));
      if (!rawStart || !rawEnd) return false;
      return !(rawEnd.isBefore(windowStart) || rawStart.isAfter(windowEnd));
    }).length;
  }, [normalized, windowEnd, windowStart, nowTs]);

  // Determine required height based on overlap lanes (each lane ~26px high)
  const laneCount = bars.length ? Math.max(...bars.map(b => b.lane)) + 1 : 0;
  const rowHeight = bars.length ? (12 + laneCount * 26) : 24; // Collapse when no items
  
  // Make card height responsive to work order count - if no work orders, use compact height
  const hasWorkOrders = bars.length > 0;
  const cardBodyHeight = hasWorkOrders ? 'auto' : '60px';

  return (
    <Card 
      size="small" 
      style={{ 
        marginBottom: 12,
        minHeight: hasWorkOrders ? 'auto' : '120px' // Compact when no work orders
      }}
      bodyStyle={{
        height: cardBodyHeight,
        padding: hasWorkOrders ? undefined : '8px 16px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Avatar src={technician.avatar || undefined}>{technician.name.split(' ').map(n => n[0]).join('')}</Avatar>
        <Title level={5} style={{ margin: 0 }}>{technician.name}</Title>
        <StatusChip kind="tech" value={technician.status || 'offline'} />
  <Text type="secondary">Capacity: {visibleCount}/{technician.max_concurrent_orders ?? '∞'}</Text>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(${HOURS.length}, 1fr)`, gap: 4, position: 'relative' }}>
        <div />
        {HOURS.map(h => (
          <div key={h} style={{ textAlign: 'center', color: 'var(--ant-colorTextSecondary)' }}>{h}:00</div>
        ))}
  <div style={{ color: 'var(--ant-colorTextSecondary)' }}>Today</div>
        {HOURS.map(h => {
          const isOver = dragOverHour === h;
          return (
            <div
              key={h}
              onDragOver={(e) => handleDragOver(e, h)}
              onDrop={(e) => handleDrop(e, h)}
              style={{
                minHeight: rowHeight,
                background: isOver ? 'var(--ant-colorPrimaryBgHover)' : 'var(--ant-colorFillTertiary)',
                border: '1px dashed var(--ant-colorSplit)',
                borderRadius: 6,
                position: 'relative',
                padding: 4,
              }}
            >
              {/* Cards removed in favor of overlay span bars */}
            </div>
          );
        })}

  {/* Overlay bar layer across the droppable row */}
        <div
          style={{
            gridColumn: `2 / span ${HOURS.length}`,
            gridRow: 2,
            position: 'relative',
            height: rowHeight,
            // Allow clicking bars while still enabling DnD by handling drag events here
            pointerEvents: 'auto',
            zIndex: 1,
          }}
          onDragOver={handleOverlayDragOver}
          onDrop={handleOverlayDrop}
          onDragLeave={() => setDragOverHour(null)}
        >
          {bars.map(bar => (
            <div
              key={bar.id}
              style={{
                position: 'absolute',
                left: `${bar.leftPct}%`,
                width: `${bar.widthPct}%`,
                top: 6 + bar.lane * 26,
                height: 20,
                background: bar.color,
                color: '#fff',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                padding: '0 6px',
                fontSize: 12,
                boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                cursor: 'pointer'
              }}
              title={bar.label}
              onClick={() => onOpenDrawer && onOpenDrawer(bar.id)}
            >
              <Text style={{ color: '#fff' }} ellipsis>{bar.label}</Text>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default TechnicianTimeline;

// Format elapsed minutes into compact label: 1mo, 2d, 1d, 1h, 2h 37m, 45m
function formatElapsed(totalMins: number): string {
  const mins = totalMins;
  const months = Math.floor(mins / (60 * 24 * 30));
  if (months >= 1) return `${months}mo`;
  const days = Math.floor(mins / (60 * 24));
  if (days >= 2) return `${days}d`;
  if (days === 1) return '1d';
  const hours = Math.floor((mins % (60 * 24)) / 60);
  const remMins = mins % 60;
  if (hours >= 2 && remMins === 0) return `${hours}h`;
  if (hours >= 2) return `${hours}h ${remMins}m`;
  if (hours === 1 && remMins === 0) return '1h';
  if (hours === 1) return `1h ${remMins}m`;
  return `${remMins}m`;
}

// Minimal lookup type for license plate
type PlateLookup = { license_plate?: string };
