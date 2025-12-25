import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Supplier } from '@/types/supabase';
import { showSuccess, showError } from '@/utils/toast';

// Query keys
export const supplierKeys = {
  all: ['suppliers'] as const,
  detail: (id: string) => ['suppliers', id] as const,
};

/**
 * Fetch all suppliers
 */
export function useSuppliers() {
  return useQuery({
    queryKey: supplierKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) throw new Error(error.message);
      return (data || []) as Supplier[];
    },
  });
}

/**
 * Fetch a single supplier by ID
 */
export function useSupplier(id: string | undefined) {
  return useQuery({
    queryKey: supplierKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);
      return data as Supplier;
    },
    enabled: !!id,
  });
}

/**
 * Create a new supplier
 */
export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([supplier])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Supplier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      showSuccess('Supplier created successfully');
    },
    onError: (error) => {
      console.error('Create supplier error:', error);
      showError(error.message || 'Failed to create supplier');
    },
  });
}

/**
 * Update an existing supplier
 */
export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Supplier> & { id: string }) => {
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Supplier;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(data.id) });
      showSuccess('Supplier updated successfully');
    },
    onError: (error) => {
      console.error('Update supplier error:', error);
      showError(error.message || 'Failed to update supplier');
    },
  });
}

/**
 * Delete a supplier
 */
export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      showSuccess('Supplier deleted successfully');
    },
    onError: (error) => {
      console.error('Delete supplier error:', error);
      showError(error.message || 'Failed to delete supplier');
    },
  });
}
