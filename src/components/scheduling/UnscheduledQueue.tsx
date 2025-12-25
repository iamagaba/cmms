import React, { useMemo, useState } from 'react';
import { Card, Typography, Space, Row, Col, List, Button, Empty } from 'antd';
import { WorkOrder, Technician } from '@/types/supabase';
import dayjs from 'dayjs';
import StatusChip from '@/components/StatusChip';

const { Text, Title } = Typography;

interface UnscheduledQueueProps {
  workOrders: WorkOrder[];
  technicians: Technician[];
  onAssign: (workOrderId: string, technicianId: string, when?: string) => void;
  onPick: (workOrderId: string) => void;
}

const UnscheduledQueue: React.FC<UnscheduledQueueProps> = ({ workOrders, technicians, onAssign, onPick }) => {
  const unscheduled = useMemo(() => (workOrders || []).filter(wo => !wo.appointmentDate && wo.status !== 'Completed'), [workOrders]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (unscheduled.length === 0) {
    return (
  <Card size="small" title="Unscheduled Work Orders">
        <Empty description="No unscheduled work orders" />
      </Card>
    );
  }

  return (
  <Card size="small" title="Unscheduled Work Orders">
      <List
        dataSource={unscheduled}
        renderItem={wo => (
          <List.Item
            onClick={() => { setSelectedId(wo.id); onPick(wo.id); }}
            style={{ cursor: 'pointer' }}
            extra={
              <Space>
                <StatusChip kind="priority" value={wo.priority || 'Low'} />
                <Text type="secondary">SLA: {wo.slaDue ? dayjs(wo.slaDue).format('MMM D, h:mm A') : '—'}</Text>
              </Space>
            }
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', wo.id);
              // Provide a minimal drag image for better UX
              const img = document.createElement('div');
              img.style.position = 'absolute';
              img.style.top = '-1000px';
              img.style.padding = '4px 8px';
              img.style.background = 'var(--ant-colorBgElevated)';
              img.style.border = '1px solid var(--ant-colorSplit)';
              img.style.borderRadius = '4px';
              img.style.color = 'var(--ant-colorText)';
              img.style.fontSize = '12px';
              img.textContent = `${wo.workOrderNumber}`;
              document.body.appendChild(img);
              e.dataTransfer.setDragImage(img, 0, 0);
              // Remove after a tick to avoid layout leaks
              setTimeout(() => img.remove(), 0);
            }}
          >
            <List.Item.Meta
              title={<Title level={5} style={{ margin: 0 }}>{wo.workOrderNumber}</Title>}
              description={
                <>
                  <Text>{wo.service || wo.initialDiagnosis}</Text>
                  {wo.customerAddress && (
                    <div><Text type="secondary">{wo.customerAddress}</Text></div>
                  )}
                </>
              }
            />
            {selectedId === wo.id && (
              <div>
                <Text strong>Assign to:</Text>
                <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                  {technicians.map(t => (
                    <Col key={t.id} span={12}>
                      <Button block onClick={() => onAssign(wo.id, t.id)}>{t.name}</Button>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </List.Item>
        )}
      />
    </Card>
  );
};

export default UnscheduledQueue;
