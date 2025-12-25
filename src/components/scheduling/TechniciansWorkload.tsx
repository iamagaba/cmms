import React, { useMemo, useState } from 'react';
import { Card, List, Space, Avatar, Typography, Progress } from 'antd';
import { Technician, WorkOrder } from '@/types/supabase';
import StatusChip from '@/components/StatusChip';

const { Text } = Typography;

interface TechniciansWorkloadProps {
  technicians: Technician[];
  workOrders: WorkOrder[];
  selectedTechnicianId?: string | null;
  onSelectTechnician?: (id: string | null) => void;
  targetBodyHeightPx?: number | null; // if provided, compute page size to fit
}

const TechniciansWorkload: React.FC<TechniciansWorkloadProps> = ({ technicians, workOrders, selectedTechnicianId = null, onSelectTechnician, targetBodyHeightPx = null }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const metrics = useMemo(() => {
    return (technicians || []).map(t => {
      const active = (workOrders || []).filter(w => w.assignedTechnicianId === t.id && w.status !== 'Completed');
      const cap = t.max_concurrent_orders ?? undefined;
      const utilization = cap ? Math.min(100, Math.round((active.length / cap) * 100)) : undefined;
      return { tech: t, activeCount: active.length, cap, utilization };
    });
  }, [technicians, workOrders]);

  // Compute dynamic page size to roughly match target height.
  // Show as many technicians as the available height allows, not restricted to 5.
  const computedPageSize = useMemo(() => {
    if (!targetBodyHeightPx || targetBodyHeightPx <= 0) return metrics.length; // show all if we can't measure
    // Estimate per-card height (includes margin)
    const perItem = 90;
    const headerAndPadding = 110; // card header + paddings + pagination controls space
    const available = Math.max(0, targetBodyHeightPx - headerAndPadding);
    const count = Math.max(1, Math.floor(available / perItem));
    // Don't artificially limit - let it fill the available space
    return count;
  }, [targetBodyHeightPx, metrics.length]);

  // Paginated data
  const fitsAll = metrics.length <= computedPageSize;
  const paginatedMetrics = useMemo(() => {
    if (fitsAll) return metrics;
    const startIndex = (currentPage - 1) * computedPageSize;
    return metrics.slice(startIndex, startIndex + computedPageSize);
  }, [metrics, currentPage, computedPageSize, fitsAll]);

  return (
    <Card size="small" title="Technicians Workload" style={{ height: '100%', display: 'flex', flexDirection: 'column' }} bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <List
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        split={false}
        dataSource={paginatedMetrics}
        pagination={fitsAll ? false : {
          current: currentPage,
          pageSize: computedPageSize,
          total: metrics.length,
          onChange: setCurrentPage,
          showSizeChanger: false,
          size: 'small',
          style: { textAlign: 'center', marginTop: 16 }
        }}
        renderItem={({ tech, activeCount, cap, utilization }) => (
          <List.Item
            onClick={() => onSelectTechnician?.(selectedTechnicianId === tech.id ? null : tech.id)}
            style={{
              cursor: 'pointer',
              background: selectedTechnicianId === tech.id ? 'var(--ant-colorPrimaryBgHover)' : 'var(--ant-colorBgElevated)',
              borderRadius: 10,
              border: '1px solid var(--ant-colorBorder)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              padding: 12,
              margin: '8px 0'
            }}
          >
            <Space>
              <Avatar src={tech.avatar || undefined}>{tech.name.split(' ').map(n => n[0]).join('')}</Avatar>
              <div>
                <Text strong>{tech.name}</Text>
                <div><Text type="secondary">{tech.specializations?.join(', ') || 'Generalist'}</Text></div>
              </div>
            </Space>
            <Space style={{ marginLeft: 'auto' }}>
              <StatusChip kind="tech" value={tech.status || 'offline'} />
              <Text type="secondary">Active: {activeCount}{cap ? `/${cap}` : ''}</Text>
              {utilization != null && (
                <Progress percent={utilization} size="small" style={{ width: 120 }} />
              )}
            </Space>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default TechniciansWorkload;
