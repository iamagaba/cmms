import React, { useMemo, useState } from 'react';
import { Modal, List, Avatar, Space, Typography, Progress, Input, Tag } from 'antd';
import StatusChip from '@/components/StatusChip';
import { Technician, WorkOrder } from '@/types/supabase';

const { Text } = Typography;
const { Search } = Input;

interface AssignTechnicianModalProps {
  open: boolean;
  technicians: Technician[];
  workOrders: WorkOrder[];
  onCancel: () => void;
  onConfirm: (technicianId: string) => void;
}

export const AssignTechnicianModal: React.FC<AssignTechnicianModalProps> = ({ open, technicians, workOrders, onCancel, onConfirm }) => {
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const metrics = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (technicians || []).map(t => {
      const active = (workOrders || []).filter(w => w.assignedTechnicianId === t.id && w.status !== 'Completed');
      const cap = (t as any).max_concurrent_orders ?? undefined;
      const utilization = cap ? Math.min(100, Math.round((active.length / cap) * 100)) : undefined;
      return { tech: t, activeCount: active.length, cap, utilization };
    });
    return q ? list.filter(({ tech }) => (tech.name || '').toLowerCase().includes(q)) : list;
  }, [technicians, workOrders, query]);

  return (
    <Modal
      open={open}
      title="Assign a Technician to Start Work"
      okText="Assign & Start"
      okButtonProps={{ disabled: !selectedTechId }}
      onOk={() => selectedTechId && onConfirm(selectedTechId)}
      onCancel={() => { setSelectedTechId(null); onCancel(); }}
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <Text type="secondary">
          This work order is moving from Ready to In Progress. Please choose a technician. We’ve shown each tech’s current active load to help you decide.
        </Text>
        <Search
          allowClear
          placeholder="Search technicians by name"
          onChange={(e) => setQuery(e.target.value)}
          value={query}
        />
        <List
          dataSource={metrics}
          renderItem={({ tech, activeCount, cap, utilization }) => (
            <List.Item
              onClick={() => setSelectedTechId(prev => prev === tech.id ? null : tech.id)}
              style={{
                cursor: 'pointer',
                background: selectedTechId === tech.id ? 'var(--ant-colorPrimaryBgHover)' : undefined,
                borderRadius: 6,
              }}
            >
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <Avatar src={(tech as any).avatar || undefined}>{(tech.name || '').split(' ').map(n => n[0]).join('')}</Avatar>
                  <div>
                    <Text strong>{tech.name}</Text>
                    <div>
                      <Text type="secondary">{(tech as any).specializations?.join(', ') || 'Generalist'}</Text>
                    </div>
                    {cap ? (
                      <div>
                        <Tag color={utilization && utilization > 90 ? 'red' : utilization && utilization > 70 ? 'orange' : 'blue'}>
                          Active {activeCount}/{cap}
                        </Tag>
                      </div>
                    ) : (
                      <div>
                        <Tag>Active {activeCount}</Tag>
                      </div>
                    )}
                  </div>
                </Space>
                <Space>
                  <StatusChip kind="tech" value={(tech as any).status || 'offline'} />
                  {utilization != null && (
                    <Progress percent={utilization} size="small" style={{ width: 120 }} />
                  )}
                </Space>
              </Space>
            </List.Item>
          )}
        />
      </Space>
    </Modal>
  );
};

export default AssignTechnicianModal;
