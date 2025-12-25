import React, { useMemo } from 'react';
import { Card, Typography, Space, Avatar, List, Empty, Tag } from 'antd';
import { Technician, WorkOrder } from '@/types/supabase';
import { haversineKm, estimateTravelMinutes } from '@/utils/geo';
import StatusChip from '@/components/StatusChip';

const { Text, Title } = Typography;

interface ProximityPanelProps {
  baseLat: number | null;
  baseLng: number | null;
  technicians: Technician[];
  workOrders: WorkOrder[];
}

const ProximityPanel: React.FC<ProximityPanelProps> = ({ baseLat, baseLng, technicians, workOrders }) => {
  const items = useMemo(() => {
    if (baseLat == null || baseLng == null) return [];

    return technicians.map(t => {
      const distanceKm = t.lat != null && t.lng != null ? haversineKm(baseLat, baseLng, t.lat, t.lng) : null;
      const travelMin = distanceKm != null ? estimateTravelMinutes(distanceKm) : null;
      const activeLoad = workOrders.filter(wo => wo.assignedTechnicianId === t.id && wo.status !== 'Completed').length;
      return { tech: t, distanceKm, travelMin, activeLoad };
    }).sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }, [baseLat, baseLng, technicians, workOrders]);

  if (items.length === 0) {
    return (
  <Card size="small" title="Proximity & Capacity">
        <Empty description="Select a work order with customer location to see proximity" />
      </Card>
    );
  }

  return (
  <Card size="small" title="Proximity & Capacity">
      <List
        dataSource={items}
        renderItem={({ tech, distanceKm, travelMin, activeLoad }) => (
          <List.Item>
            <Space>
              <Avatar src={tech.avatar || undefined}>{tech.name.split(' ').map(n => n[0]).join('')}</Avatar>
              <div>
                <Title level={5} style={{ margin: 0 }}>{tech.name}</Title>
                <Text type="secondary">{tech.specializations?.join(', ') || 'Generalist'}</Text>
              </div>
            </Space>
            <Space style={{ marginLeft: 'auto' }}>
              <StatusChip kind="tech" value={tech.status || 'offline'} />
              {distanceKm != null && (
                <Tag>{distanceKm.toFixed(1)} km • {travelMin} min</Tag>
              )}
              <StatusChip kind="custom" value={`Load: ${activeLoad}/${tech.max_concurrent_orders ?? '∞'}`} color="#64748B" />
            </Space>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default ProximityPanel;
