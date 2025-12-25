import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Space, Skeleton, Typography } from "antd";
import { Icon } from '@iconify/react';
import AppBreadcrumb from "@/components/Breadcrumbs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { snakeToCamelCase } from "@/utils/data-helpers";
import { WorkOrder } from "@/types/supabase";
import NotFound from "./NotFound";

const { Title, Text } = Typography;

interface WorkOrderDetailsProps {
  isDrawerMode?: boolean;
  workOrderId?: string | null;
}

// Debug version - testing what causes blank page in full-screen mode
const WorkOrderDetailsDebugPage = ({ isDrawerMode = false, workOrderId }: WorkOrderDetailsProps) => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const id = workOrderId || paramId;
  
  console.log('WorkOrderDetailsDebug: Component rendered');
  console.log('WorkOrderDetailsDebug: isDrawerMode:', isDrawerMode);
  console.log('WorkOrderDetailsDebug: id:', id);

  const { data: workOrder, isLoading, error } = useQuery<WorkOrder | null>({ 
    queryKey: ['work_order', id], 
    queryFn: async () => { 
      console.log('WorkOrderDetailsDebug: Fetching work order with id:', id);
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .eq('id', id)
        .single();
        
      console.log('WorkOrderDetailsDebug: Query result:', data, error);
      
      if (error) {
        console.error('WorkOrderDetailsDebug: Query error:', error);
        throw new Error(error.message);
      }
      
      if (data) {
        const transformed = snakeToCamelCase(data) as WorkOrder;
        console.log('WorkOrderDetailsDebug: Transformed data:', transformed);
        return transformed;
      }
      
      return null;
    }, 
    enabled: !!id
  });

  console.log('WorkOrderDetailsDebug: Current state:', { isLoading, workOrder, error, isDrawerMode });

  if (isLoading) {
    console.log('WorkOrderDetailsDebug: Showing loading skeleton');
    return <Skeleton active />;
  }
  
  if (!workOrder) {
    console.log('WorkOrderDetailsDebug: No work order found, showing NotFound');
    return isDrawerMode ? <div style={{ padding: 24 }}><NotFound /></div> : <NotFound />;
  }

  const backButton = (
    <Button 
      icon={<Icon icon="ant-design:arrow-left-outlined" width={18} height={18} />} 
      onClick={() => navigate('/work-orders')} 
    />
  );

  console.log('WorkOrderDetailsDebug: About to render main UI');
  console.log('WorkOrderDetailsDebug: isDrawerMode check:', isDrawerMode);

  return (
    <>
      <AppBreadcrumb backButton={!isDrawerMode ? backButton : undefined} />
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        <Card>
          <Title level={2}>Work Order Details (Debug Mode)</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Mode: </Text>
              <Text>{isDrawerMode ? 'Drawer Mode' : 'Full Screen Mode'}</Text>
            </div>
            <div>
              <Text strong>Work Order: </Text>
              <Text>{workOrder.workOrderNumber || 'N/A'}</Text>
            </div>
            <div>
              <Text strong>Status: </Text>
              <Text>{workOrder.status || 'N/A'}</Text>
            </div>
            <div>
              <Text strong>Service: </Text>
              <Text>{workOrder.service || 'N/A'}</Text>
            </div>
          </Space>
        </Card>

        {/* Test conditional rendering based on mode */}
        {isDrawerMode ? (
          <Card title="Drawer Mode Content">
            <Text>This content should only show in drawer mode</Text>
          </Card>
        ) : (
          <Card title="Full Screen Mode Content">
            <Text>This content should only show in full screen mode</Text>
          </Card>
        )}

      </Space>
    </>
  );
};

export default WorkOrderDetailsDebugPage;