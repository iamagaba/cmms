import React from 'react';
import { Col, Skeleton } from 'antd';
import TechnicianStatusList from '@/components/TechnicianStatusList';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, Technician } from '@/types/supabase';

interface TechnicianStatusListWidgetProps {
  widgetId: string;
}

const TechnicianStatusListWidget: React.FC<TechnicianStatusListWidgetProps> = () => {
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({
    queryKey: ['technicians_for_status_widget'],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders_for_status_widget'],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_orders').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const isLoading = isLoadingTechnicians || isLoadingWorkOrders;

  if (isLoading) {
    return <Col xs={24} xl={8}><Skeleton active paragraph={{ rows: 5 }} /></Col>;
  }

  return (
    <Col xs={24} xl={8}>
      <TechnicianStatusList technicians={technicians || []} workOrders={workOrders || []} />
    </Col>
  );
};

export default TechnicianStatusListWidget;