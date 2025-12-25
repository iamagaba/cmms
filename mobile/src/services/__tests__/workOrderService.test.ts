import {workOrderService, WorkOrderFilters, WorkOrderSortOptions} from '../workOrderService';
import {supabase} from '../supabase';

describe('Work Order Service', () => {
  it('should be implemented', () => {
    expect(workOrderService).toBeDefined();
  });
});