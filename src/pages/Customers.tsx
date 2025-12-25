import { useState } from "react";
import { Button, Space, Skeleton, Input } from "antd";
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import { CustomerDataTable } from "@/components/CustomerDataTable";
import { CustomerFormDialog } from "@/components/CustomerFormDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/supabase";
import { showSuccess, showError } from "@/utils/toast";
import { snakeToCamelCase, camelToSnakeCase } from "@/utils/data-helpers";
import AppBreadcrumb from "@/components/Breadcrumbs";
import Fab from "@/components/Fab";

const { Search } = Input;

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
      return (data || []).map(customer => snakeToCamelCase(customer) as Customer);
    }
  });

  const customerMutation = useMutation({
    mutationFn: async (customerData: Partial<Customer>) => {
      const { error } = await supabase.from('customers').upsert([camelToSnakeCase(customerData)]);
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

  const pageActions = (
    <Space size="middle" align="center">
      <Search
        placeholder="Search customers..."
        onSearch={setSearchTerm}
        onChange={(e) => !e.target.value && setSearchTerm("")}
        style={{ width: 250 }}
        allowClear
      />
  <Button className="primary-action-btn" type="primary" icon={<Icon icon="ant-design:plus-outlined" width={16} height={16} />} onClick={() => { setEditingCustomer(null); setIsDialogOpen(true); }}>
        Add Customer
      </Button>
    </Space>
  );

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
  <AppBreadcrumb actions={pageActions} />
      
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

      {/* Mobile FAB for quick add */}
      <div className="hide-on-desktop">
        <Fab label="Add Customer" onClick={() => { setEditingCustomer(null); setIsDialogOpen(true); }} />
      </div>
    </Space>
  );
};

export default CustomersPage;