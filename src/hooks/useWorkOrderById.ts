import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/supabase";

export const useWorkOrderById = (id: string) => {
  const { data: workOrder, isLoading, error } = useQuery<WorkOrder | null>({
    queryKey: ['workOrder', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  return { workOrder, isLoading, error };
};