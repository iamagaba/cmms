import { useState } from "react";
import { Button, Card, Col, Row, Typography, Table, Space, Popconfirm, Skeleton } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceCategory, SlaPolicy } from "@/types/supabase";
import { showSuccess, showError } from "@/utils/toast";
import { ServiceSlaFormDialog, ServiceSlaData } from "@/components/ServiceSlaFormDialog";

const { Title } = Typography;

type ServiceSlaRow = ServiceCategory & { sla_policies: SlaPolicy | null };

const ServiceSlaManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState<ServiceSlaData | null>(null);

  const { data: services, isLoading } = useQuery<ServiceSlaRow[]>({
    queryKey: ['service_categories_with_sla'],
    queryFn: async () => {
      const { data, error } = await supabase.from('service_categories').select('*, sla_policies(*)');
      if (error) throw new Error(error.message);
      return (data || []).map(d => ({ ...d, sla_policies: d.sla_policies[0] || null }));
    }
  });

  const upsertCategoryMutation = useMutation({
    mutationFn: async (categoryData: Partial<ServiceCategory>) => {
      const { data, error } = await supabase.from('service_categories').upsert(categoryData).select().single();
      if (error) throw error;
      return data;
    },
  });

  const upsertSlaMutation = useMutation({
    mutationFn: async (slaData: Partial<SlaPolicy>) => {
      const { error } = await supabase.from('sla_policies').upsert(slaData);
      if (error) throw error;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('service_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service_categories_with_sla'] });
      showSuccess('Service category has been deleted.');
    },
    onError: (error: any) => showError(error.message),
  });

  const handleSave = async (categoryData: Partial<ServiceCategory>, slaData: Partial<SlaPolicy>) => {
    try {
      const savedCategory = await upsertCategoryMutation.mutateAsync(categoryData);
      if (savedCategory) {
        await upsertSlaMutation.mutateAsync({ ...slaData, service_category_id: savedCategory.id });
      }
      queryClient.invalidateQueries({ queryKey: ['service_categories_with_sla'] });
      showSuccess('Service & SLA have been saved.');
      setIsDialogOpen(false);
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleEdit = (record: ServiceSlaRow) => {
    setEditingData(record);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'First Response (mins)', dataIndex: ['sla_policies', 'first_response_minutes'], key: 'fr' },
    { title: 'Response (hrs)', dataIndex: ['sla_policies', 'response_hours'], key: 'resp' },
    { title: 'Resolution (hrs)', dataIndex: ['sla_policies', 'resolution_hours'], key: 'reso' },
    { title: 'Expected Repair (hrs)', dataIndex: ['sla_policies', 'expected_repair_hours'], key: 'repair' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ServiceSlaRow) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small">Edit</Button>
          <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} danger size="small">Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return <Skeleton active />;
  }

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col><Title level={5}>Manage Service Categories & SLAs</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingData(null); setIsDialogOpen(true); }}>Add Service</Button></Col>
      </Row>
      <Table columns={columns} dataSource={services} rowKey="id" size="small" />
      {isDialogOpen && (
        <ServiceSlaFormDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          serviceSlaData={editingData}
        />
      )}
    </Card>
  );
};

export default ServiceSlaManagement;