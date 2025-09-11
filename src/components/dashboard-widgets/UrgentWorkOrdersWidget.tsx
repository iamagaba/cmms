import React from 'react';
import { Col, Skeleton } from 'antd';
import UrgentWorkOrders from '@/components/UrgentWorkOrders';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, Technician } from '@/types/supabase';

interface UrgentWorkOrdersWidgetProps {
  widgetId: string;
}

const UrgentWorkOrdersWidget: React.FC<UrgentWorkOrdersWidgetProps> = () => {
  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders_for_urgent_widget'],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_orders').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map((item: any) => ({ ...item, slaDue: item.sla_due }));
    }
  });

  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({
    queryKey: ['technicians_for_urgent_widget'],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const isLoading = isLoadingWorkOrders || isLoadingTechnicians;

  if (isLoading) {
    return <Col xs={24} xl={16}><Skeleton active paragraph={{ rows: 5 }} /></Col>;
  }

  return (
    <Col xs={24} xl={16}>
      <UrgentWorkOrders workOrders={workOrders || []} technicians={technicians || []} />
    </Col>
  );
};

export default UrgentWorkOrdersWidget;