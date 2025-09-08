import { useState } from "react";
import { Button, Typography, Space, Skeleton, Input, Row, Col } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { CustomerDataTable } from "@/components/CustomerDataTable";
import { CustomerFormDialog } from "@/components/CustomerFormDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/supabase";
import { showSuccess, showError } from "@/utils/toast";
import PageHeader from "@/components/PageHeader";

const { Title } = Typography;

const CustomersPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ['customers', searchTerm],
    queryFn: async () => {
      let query = supabase.from('customers').select('*').order('name');
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const customerMutation = useMutation({
    mutationFn: async (customerData: Partial<Customer>) => {
      const { error } = await supabase.from('customers').upsert([customerData]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      showSuccess('Customer has been saved.');
      setIsDialogOpen(false);
      setEditingCustomer(null);
    },
    onError: (error) => showError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      showSuccess('Customer has been deleted.');
    },
    onError: (error) => showError(error.message),
  });

  const handleSave = (customerData: Partial<Customer>) => {
    customerMutation.mutate(customerData);
  };

  const handleDelete = (customerData: Customer) => {
    deleteMutation.mutate(customerData.id);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsDialogOpen(true);
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <PageHeader
        title="Customer Management"
        onSearch={setSearchTerm}
        onSearchChange={(e) => !e.target.value && setSearchTerm("")}
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingCustomer(null); setIsDialogOpen(true); }}>
            Add Customer
          </Button>
        }
      />
      
      {isLoading ? <Skeleton active /> : (
        <CustomerDataTable 
          customers={customers || []} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {isDialogOpen && (
        <CustomerFormDialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          customer={editingCustomer}
        />
      )}
    </Space>
  );
};

export default CustomersPage;