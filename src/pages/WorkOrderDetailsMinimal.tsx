import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Space, Typography, Skeleton } from "antd";
import { Icon } from '@iconify/react';
import AppBreadcrumb from "@/components/Breadcrumbs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { snakeToCamelCase } from "@/utils/data-helpers";
import { WorkOrder } from "@/types/supabase";
import NotFound from "./NotFound";

const { Title, Text } = Typography;

// Testing with React Query to isolate issue
const WorkOrderDetailsMinimal = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  console.log('WorkOrderDetailsMinimal: Component rendered with id:', id);

  // Query for the specific work order
  const { data: workOrder, isLoading, error } = useQuery({ 
    queryKey: ['work_order', id], 
    queryFn: async () => { 
      console.log('WorkOrderDetailsMinimal: Fetching work order with id:', id);
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .eq('id', id)
        .single();
        
      console.log('WorkOrderDetailsMinimal: Single work order result:', data, error);
      
      if (error) {
        console.error('WorkOrderDetailsMinimal: Query error:', error);
        throw new Error(error.message);
      }
      
      if (data) {
        const transformed = snakeToCamelCase(data) as WorkOrder;
        console.log('WorkOrderDetailsMinimal: Transformed data:', transformed);
        return transformed;
      }
      
      return null;
    }, 
    enabled: !!id
  });

  console.log('WorkOrderDetailsMinimal: Query state - isLoading:', isLoading, 'workOrder:', workOrder, 'error:', error);

  const backButton = (
    <Button 
      icon={<Icon icon="ant-design:arrow-left-outlined" width={18} height={18} />} 
      onClick={() => navigate('/work-orders')} 
    />
  );
  
  if (isLoading) {
    console.log('WorkOrderDetailsMinimal: Showing loading skeleton');
    return <Skeleton active />;
  }
  
  if (!workOrder) {
    console.log('WorkOrderDetailsMinimal: No work order found, showing NotFound');
    return <NotFound />;
  }

  return (
    <>
      <AppBreadcrumb backButton={backButton} />
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card>
          <div style={{ padding: '20px' }}>
            <Title level={2}>Work Order Details (Minimal)</Title>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>ID from URL: </Text>
                <Text>{id || 'No ID provided'}</Text>
              </div>
              <div>
                <Text strong>Status: </Text>
                <Text>Testing with React Query</Text>
              </div>
              <div>
                <Text strong>Work Order: </Text>
                <Text>{workOrder ? `${workOrder.workOrderNumber} - ${workOrder.status}` : 'Not found'}</Text>
              </div>
              {workOrder && (
                <>
                  <div>
                    <Text strong>Service: </Text>
                    <Text>{workOrder.service || 'N/A'}</Text>
                  </div>
                  <div>
                    <Text strong>Customer: </Text>
                    <Text>{workOrder.customerName || 'N/A'}</Text>
                  </div>
                  <div>
                    <Text strong>Created: </Text>
                    <Text>{workOrder.created_at ? new Date(workOrder.created_at).toLocaleString() : 'N/A'}</Text>
                  </div>
                </>
              )}
              <div>
                <Text strong>Timestamp: </Text>
                <Text>{new Date().toLocaleString()}</Text>
              </div>
            </Space>
          </div>
        </Card>
      </Space>
    </>
  );
};

export default WorkOrderDetailsMinimal;