import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Col, Row, Space, Skeleton, Tabs, Typography, Descriptions, Alert } from "antd";
import { Icon } from '@iconify/react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { snakeToCamelCase } from "@/utils/data-helpers";
import { WorkOrder, Technician } from "@/types/supabase";
import { useState } from "react";
import AppBreadcrumb from "@/components/Breadcrumbs";
import NotFound from "./NotFound";
import StatusChip from "@/components/StatusChip";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface WorkOrderDetailsProps {
  isDrawerMode?: boolean;
  workOrderId?: string | null;
}

// Robust WorkOrder Details Component with error handling
const WorkOrderDetailsRobust = ({ isDrawerMode = false, workOrderId }: WorkOrderDetailsProps) => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  const id = workOrderId || paramId;
  
  console.log('WorkOrderDetailsRobust: Component rendered with id:', id, 'isDrawerMode:', isDrawerMode);

  // Work Order Query
  const { data: workOrder, isLoading: isLoadingWorkOrder, error: workOrderError } = useQuery<WorkOrder | null>({ 
    queryKey: ['work_order', id], 
    queryFn: async () => { 
      console.log('WorkOrderDetailsRobust: Fetching work order with id:', id);
      if (!id) return null;
      
      try {
        const { data, error } = await supabase
          .from('work_orders')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw new Error(error.message);
        
        if (data) {
          const transformed = snakeToCamelCase(data) as WorkOrder;
          console.log('WorkOrderDetailsRobust: Successfully loaded work order:', transformed.workOrderNumber);
          return transformed;
        }
        
        return null;
      } catch (err) {
        console.error('WorkOrderDetailsRobust: Error loading work order:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        throw err;
      }
    }, 
    enabled: !!id
  });

  // Technician Query (simplified)
  const { data: technician } = useQuery<Technician | null>({ 
    queryKey: ['technician', workOrder?.assignedTechnicianId], 
    queryFn: async () => { 
      if (!workOrder?.assignedTechnicianId) return null;
      try {
        const { data, error } = await supabase
          .from('technicians')
          .select('*')
          .eq('id', workOrder.assignedTechnicianId)
          .single(); 
        if (error) throw new Error(error.message); 
        return data ? snakeToCamelCase(data) as Technician : null;
      } catch (err) {
        console.warn('WorkOrderDetailsRobust: Could not load technician:', err);
        return null;
      }
    }, 
    enabled: !!workOrder?.assignedTechnicianId
  });

  console.log('WorkOrderDetailsRobust: Current state:', { 
    isLoading: isLoadingWorkOrder, 
    workOrder: !!workOrder, 
    error: error || workOrderError?.message,
    isDrawerMode 
  });

  if (isLoadingWorkOrder) {
    console.log('WorkOrderDetailsRobust: Showing loading skeleton');
    return <Skeleton active />;
  }
  
  if (error || workOrderError) {
    const errorMsg = error || workOrderError?.message || 'Unknown error';
    console.error('WorkOrderDetailsRobust: Showing error:', errorMsg);
    return (
      <div style={{ padding: '20px' }}>
        <Alert 
          message="Error Loading Work Order" 
          description={errorMsg}
          type="error" 
          showIcon 
          action={
            <Button onClick={() => navigate('/work-orders')}>
              Back to Work Orders
            </Button>
          }
        />
      </div>
    );
  }
  
  if (!workOrder) {
    console.log('WorkOrderDetailsRobust: No work order found, showing NotFound');
    return isDrawerMode ? <div style={{ padding: 24 }}><NotFound /></div> : <NotFound />;
  }

  console.log('WorkOrderDetailsRobust: Rendering work order:', workOrder.workOrderNumber);

  const backButton = (
    <Button 
      icon={<Icon icon="ant-design:arrow-left-outlined" width={18} height={18} />} 
      onClick={() => navigate('/work-orders')} 
    />
  );

  const WorkOrderHeader = () => (
    <Card size="small">
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Title level={2} style={{ margin: 0 }}>{workOrder.workOrderNumber}</Title>
          <Text type="secondary">Work Order Details</Text>
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          <StatusChip kind="status" value={workOrder.status || 'Unknown'} />
          {workOrder.priority && (
            <div style={{ marginTop: 8 }}>
              <StatusChip kind="priority" value={workOrder.priority} />
            </div>
          )}
        </Col>
      </Row>
    </Card>
  );

  const WorkOrderInfo = () => (
    <Card size="small" title="Work Order Information">
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="Work Order Number">
          {workOrder.workOrderNumber}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <StatusChip kind="status" value={workOrder.status || 'Unknown'} />
        </Descriptions.Item>
        <Descriptions.Item label="Service">
          {workOrder.service || 'No service description'}
        </Descriptions.Item>
        <Descriptions.Item label="Customer">
          {workOrder.customerName || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Technician">
          {technician?.name || 'Not assigned'}
        </Descriptions.Item>
        <Descriptions.Item label="Created">
          {workOrder.created_at ? new Date(workOrder.created_at).toLocaleString() : 'N/A'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );

  const ServiceDetails = () => (
    <Card size="small" title="Service Details">
      <Descriptions column={1} size="small">
        <Descriptions.Item label="Service Description">
          {workOrder.service || 'No description available'}
        </Descriptions.Item>
        {workOrder.serviceNotes && (
          <Descriptions.Item label="Service Notes">
            {workOrder.serviceNotes}
          </Descriptions.Item>
        )}
        {workOrder.customerAddress && (
          <Descriptions.Item label="Address">
            {workOrder.customerAddress}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );

  console.log('WorkOrderDetailsRobust: About to render UI. isDrawerMode:', isDrawerMode);

  return (
    <>
      {!isDrawerMode && <AppBreadcrumb backButton={backButton} />}
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        <WorkOrderHeader />
        
        {isDrawerMode ? (
          <>
            <Tabs defaultActiveKey="1">
            <TabPane tab={<span><Icon icon="ant-design:info-circle-filled" width={18} height={18} /> Overview</span>} key="1">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <WorkOrderInfo />
                <ServiceDetails />
              </Space>
            </TabPane>
            </Tabs>
          </>
        ) : (
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <ServiceDetails />
              </Space>
            </Col>
            <Col xs={24} lg={8}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <WorkOrderInfo />
              </Space>
            </Col>
          </Row>
        )}
        
      </Space>
    </>
  );
};

export default WorkOrderDetailsRobust;