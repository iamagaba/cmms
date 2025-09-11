import React, { useEffect, useState } from 'react';
import { Breadcrumb, Typography, Skeleton, Row, Col, Button, Space } from 'antd';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, Technician, Location, Customer, Vehicle } from '@/types/supabase';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface BreadcrumbItem {
  path: string;
  breadcrumbName: string | React.ReactNode;
}

interface BreadcrumbsProps {
  actions?: React.ReactNode;
  backButton?: React.ReactNode;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ actions, backButton }) => {
  const location = useLocation();
  const params = useParams();
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([]);

  // Fetch data for dynamic segments
  const { data: workOrder, isLoading: isLoadingWorkOrder } = useQuery<WorkOrder | null>({
    queryKey: ['work_order_breadcrumb', params.id],
    queryFn: async () => {
      if (!params.id || !location.pathname.startsWith('/work-orders/')) return null;
      const { data, error } = await supabase.from('work_orders').select('*').eq('id', params.id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!params.id && location.pathname.startsWith('/work-orders/'),
  });

  const { data: technician, isLoading: isLoadingTechnician } = useQuery<Technician | null>({
    queryKey: ['technician_breadcrumb', params.id],
    queryFn: async () => {
      if (!params.id || !location.pathname.startsWith('/technicians/')) return null;
      const { data, error } = await supabase.from('technicians').select('*').eq('id', params.id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!params.id && location.pathname.startsWith('/technicians/'),
  });

  const { data: asset, isLoading: isLoadingAsset } = useQuery<Vehicle | null>({
    queryKey: ['asset_breadcrumb', params.id],
    queryFn: async () => {
      if (!params.id || !location.pathname.startsWith('/assets/')) return null;
      const { data, error } = await supabase.from('vehicles').select('*').eq('id', params.id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!params.id && location.pathname.startsWith('/assets/'),
  });

  const { data: customer, isLoading: isLoadingCustomer } = useQuery<Customer | null>({
    queryKey: ['customer_breadcrumb', params.id],
    queryFn: async () => {
      if (!params.id || !location.pathname.startsWith('/customers/')) return null;
      const { data, error } = await supabase.from('customers').select('*').eq('id', params.id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!params.id && location.pathname.startsWith('/customers/'),
  });

  const { data: loc, isLoading: isLoadingLoc } = useQuery<Location | null>({
    queryKey: ['location_breadcrumb', params.id],
    queryFn: async () => {
      if (!params.id || !location.pathname.startsWith('/locations/')) return null;
      const { data, error } = await supabase.from('locations').select('*').eq('id', params.id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!params.id && location.pathname.startsWith('/locations/'),
  });

  useEffect(() => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const items: BreadcrumbItem[] = [{ path: '/', breadcrumbName: 'Dashboard' }];

    pathnames.forEach((name, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;

      let breadcrumbName: string | React.ReactNode = name.replace(/-/g, ' ');

      // Handle dynamic segments
      if (params.id && name === params.id) {
        if (location.pathname.startsWith('/work-orders/')) {
          breadcrumbName = isLoadingWorkOrder ? <Skeleton.Input active size="small" style={{ width: 100 }} /> : (workOrder?.workOrderNumber || 'Details');
        } else if (location.pathname.startsWith('/technicians/')) {
          breadcrumbName = isLoadingTechnician ? <Skeleton.Input active size="small" style={{ width: 100 }} /> : (technician?.name || 'Details');
        } else if (location.pathname.startsWith('/assets/')) {
          breadcrumbName = isLoadingAsset ? <Skeleton.Input active size="small" style={{ width: 100 }} /> : (asset?.license_plate || 'Details');
        } else if (location.pathname.startsWith('/customers/')) {
          breadcrumbName = isLoadingCustomer ? <Skeleton.Input active size="small" style={{ width: 100 }} /> : (customer?.name || 'Details');
        } else if (location.pathname.startsWith('/locations/')) {
          breadcrumbName = isLoadingLoc ? <Skeleton.Input active size="small" style={{ width: 100 }} /> : (loc?.name || 'Details');
        } else {
          breadcrumbName = 'Details'; // Fallback for other dynamic IDs
        }
      } else {
        // Capitalize first letter of each word for static segments
        if (typeof breadcrumbName === 'string') { // Type guard for string operations
          breadcrumbName = breadcrumbName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
      }

      items.push({
        path: routeTo,
        breadcrumbName: isLast ? <Text strong>{breadcrumbName}</Text> : breadcrumbName,
      });
    });

    setBreadcrumbItems(items);
  }, [location.pathname, params.id, workOrder, technician, asset, customer, loc, isLoadingWorkOrder, isLoadingTechnician, isLoadingAsset, isLoadingCustomer, isLoadingLoc]);

  // Don't render breadcrumbs on the login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
      <Col>
        <Space size="small">
          {backButton}
          <Breadcrumb>
            {breadcrumbItems.map((item, index) => (
              <Breadcrumb.Item key={item.path}>
                {index === breadcrumbItems.length - 1 ? (
                  item.breadcrumbName
                ) : (
                  <Link to={item.path}>{item.breadcrumbName}</Link>
                )}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </Space>
      </Col>
      <Col>
        {actions}
      </Col>
    </Row>
  );
};

export default Breadcrumbs;