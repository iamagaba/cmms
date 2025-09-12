import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceCategory, SlaPolicy } from "@/types/supabase";
import { showSuccess, showError } from "@/utils/toast";
import { ServiceSlaFormDialog, ServiceSlaData } from "@/components/ServiceSlaFormDialog"; // Use Ant Design dialog

import { Card, Table, Button, Space, Typography, Modal, Popconfirm, Menu, Dropdown, Skeleton, Empty } from "antd";
import { Icon } from '@iconify/react'; // Using Iconify for icons

const { Title, Paragraph } = Typography;

type ServiceSlaRow = ServiceCategory & { sla_policies: SlaPolicy | null };

const ServiceSlaManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState<ServiceSlaData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

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
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
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

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete);
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'First Response (mins)', dataIndex: ['sla_policies', 'first_response_minutes'], key: 'first_response_minutes', render: (text: any) => text || 'N/A' },
    { title: 'Response (hrs)', dataIndex: ['sla_policies', 'response_hours'], key: 'response_hours', render: (text: any) => text || 'N/A' },
    { title: 'Resolution (hrs)', dataIndex: ['sla_policies', 'resolution_hours'], key: 'resolution_hours', render: (text: any) => text || 'N/A' },
    { title: 'Expected Repair (hrs)', dataIndex: ['sla_policies', 'expected_repair_hours'], key: 'expected_repair_hours', render: (text: any) => text || 'N/A' },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right' as const,
      render: (_: any, record: ServiceSlaRow) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="edit" icon={<Icon icon="ph:pencil-fill" />} onClick={() => handleEdit(record)}>
                Edit
              </Menu.Item>
              <Menu.Item key="delete" icon={<Icon icon="ph:trash-fill" />} danger onClick={() => handleDeleteClick(record.id)}>
                Delete
              </Menu.Item>
            </Menu>
          }
          trigger={["click"]}
        >
          <Button type="text" icon={<Icon icon="ph:dots-three-horizontal-fill" style={{ fontSize: '18px' }} />} />
        </Dropdown>
      ),
    },
  ];

  if (isLoading) {
    return <Skeleton active />;
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={5} style={{ margin: 0 }}>Manage Service Categories & SLAs</Title>
          <Button type="primary" icon={<Icon icon="ph:plus-fill" />} onClick={() => { setEditingData(null); setIsDialogOpen(true); }}>
            Add Service
          </Button>
        </div>
      }
      style={{ width: '100%' }}
    >
      <Table
        dataSource={services}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        size="small"
        locale={{ emptyText: <Empty description="No service categories found." /> }}
      />

      {isDialogOpen && (
        <ServiceSlaFormDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          serviceSlaData={editingData}
        />
      )}
      <Modal
        title="Confirm Deletion"
        open={isDeleteDialogOpen}
        onOk={confirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
      >
        <Paragraph>
          This action cannot be undone. This will permanently delete the service category and its associated SLA policy.
        </Paragraph>
      </Modal>
    </Card>
  );
};

export default ServiceSlaManagement;