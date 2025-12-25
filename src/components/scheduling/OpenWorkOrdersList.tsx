import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Card, List, Typography, Space, Tag } from 'antd';
import { WorkOrder, Technician } from '@/types/supabase';
import StatusChip from '@/components/StatusChip';
import dayjs from 'dayjs';

const { Title } = Typography;

interface OpenWorkOrdersListProps {
  workOrders: WorkOrder[];
  technicians?: Technician[]; // optional, currently unused in rendering
  onlyUnassigned?: boolean;
  technicianId?: string | null;
  onListBodyHeight?: (height: number) => void;
  vehiclesById?: Map<string, { license_plate?: string }>;
}

const OpenWorkOrdersList: React.FC<OpenWorkOrdersListProps> = ({ workOrders, onlyUnassigned = false, technicianId = null, onListBodyHeight, vehiclesById }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const listRef = useRef<HTMLDivElement | null>(null);

  const openOrders = useMemo(() => {
    let items = (workOrders || []).filter(wo => wo.status !== 'Completed');
    if (onlyUnassigned) items = items.filter(wo => !wo.assignedTechnicianId);
    if (technicianId) items = items.filter(wo => wo.assignedTechnicianId === technicianId);
    return items;
  }, [workOrders, onlyUnassigned, technicianId]);

  const unassignedCount = useMemo(() => (workOrders || []).filter(wo => wo.status !== 'Completed' && !wo.assignedTechnicianId).length, [workOrders]);

  // Paginated data
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return openOrders.slice(startIndex, startIndex + pageSize);
  }, [openOrders, currentPage, pageSize]);

  // Measure list body height and report up for sibling alignment
  useEffect(() => {
    if (!onListBodyHeight) return;
    const el = listRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        onListBodyHeight(h);
      }
    });
    ro.observe(el);
    // Initial measure
    onListBodyHeight(el.getBoundingClientRect().height);
    return () => ro.disconnect();
  }, [onListBodyHeight, listRef]);

  return (
    <Card size="small" style={{ height: '100%', display: 'flex', flexDirection: 'column' }} bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1 }} title={
      <Space>
        <span>Open Work Orders ({openOrders.length})</span>
        <Tag color="warning">Unassigned: {unassignedCount}</Tag>
      </Space>
    }>
      <List
        ref={listRef as any}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 420 }}
        dataSource={paginatedOrders}
        itemLayout="vertical"
        split={false}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: openOrders.length,
          onChange: setCurrentPage,
          showSizeChanger: false,
          size: 'small',
          style: { textAlign: 'center', marginTop: 16 }
        }}
        renderItem={(wo) => {
          const licensePlate = vehiclesById && wo.vehicleId ? vehiclesById.get(wo.vehicleId)?.license_plate : undefined;
          const age = wo.created_at ? formatAgeCompact(dayjs().diff(dayjs(wo.created_at), 'minute')) : '—';
          return (
            <List.Item
              key={wo.id}
              style={{
                border: '1px solid var(--ant-colorBorder)',
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
                background: 'var(--ant-colorBgElevated)',
                minHeight: 96,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 6px 14px rgba(0,0,0,0.14)'
              }}
              className="open-wo-item"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                <Title level={5} style={{ margin: 0 }}>{wo.workOrderNumber}</Title>
                <Space>
                  <StatusChip kind="status" value={wo.status || 'Open'} />
                </Space>
              </div>
              <div style={{ marginTop: 6 }}>
                <Typography.Paragraph style={{ margin: 0, fontSize: 12 }} ellipsis={{ rows: 2 }}>
                  {wo.initialDiagnosis || wo.service || '—'}
                </Typography.Paragraph>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, color: 'var(--ant-colorTextSecondary)', fontSize: 12 }}>
                <span>{wo.customerAddress || 'No location'}</span>
                <span>
                  {licensePlate && <span style={{ marginRight: 8 }}><b>{licensePlate}</b></span>}
                  {age}
                </span>
              </div>
            </List.Item>
          );
        }}
      />
    </Card>
  );
};

export default OpenWorkOrdersList;

// Format relative age in compact form: 1w, 2d, 1d, 1h, 2h 37m, 45m
function formatAgeCompact(totalMins: number): string {
  const mins = Math.max(0, totalMins | 0);
  const weeks = Math.floor(mins / (60 * 24 * 7));
  if (weeks >= 1) return `${weeks}w`;
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
