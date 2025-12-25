import { useState, useCallback } from 'react';
import { WorkOrder } from '../types/supabase';
import { supabase } from '@/lib/supabase';
import { workOrderHaptics } from '../utils/haptic';

export interface BatchOperationResult {
  successful: string[];
  failed: { id: string; error: string }[];
  totalProcessed: number;
}

export interface BatchOperationState {
  isProcessing: boolean;
  progress: number;
  currentOperation: string | null;
  lastResult: BatchOperationResult | null;
  error: string | null;
}

export interface BatchOperationActions {
  updateStatus: (workOrderIds: string[], newStatus: WorkOrder['status']) => Promise<BatchOperationResult>;
  assignTechnician: (workOrderIds: string[], technicianId: string) => Promise<BatchOperationResult>;
  updatePriority: (workOrderIds: string[], priority: WorkOrder['priority']) => Promise<BatchOperationResult>;
  exportWorkOrders: (workOrderIds: string[]) => Promise<void>;
  clearResult: () => void;
}

export interface BatchOperationOptions {
  hapticFeedback?: boolean;
  maxConcurrent?: number;
  retryFailures?: boolean;
}

const DEFAULT_OPTIONS: Required<BatchOperationOptions> = {
  hapticFeedback: true,
  maxConcurrent: 5,
  retryFailures: false
};

/**
 * Custom hook for managing batch operations on work orders
 */
export function useBatchOperations(
  options: BatchOperationOptions = {}
): BatchOperationState & BatchOperationActions {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<BatchOperationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processInBatches = useCallback(async <T>(
    items: T[],
    processor: (item: T) => Promise<{ success: boolean; error?: string }>,
    operationName: string
  ): Promise<BatchOperationResult> => {
    const result: BatchOperationResult = {
      successful: [],
      failed: [],
      totalProcessed: 0
    };

    setIsProcessing(true);
    setProgress(0);
    setCurrentOperation(operationName);
    setError(null);

    try {
      const batches = [];
      for (let i = 0; i < items.length; i += opts.maxConcurrent) {
        batches.push(items.slice(i, i + opts.maxConcurrent));
      }

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        const batchPromises = batch.map(async (item, itemIndex) => {
          try {
            const itemResult = await processor(item);
            const itemId = typeof item === 'string' ? item : (item as any).id;
            
            if (itemResult.success) {
              result.successful.push(itemId);
            } else {
              result.failed.push({
                id: itemId,
                error: itemResult.error || 'Unknown error'
              });
            }
          } catch (err) {
            const itemId = typeof item === 'string' ? item : (item as any).id;
            result.failed.push({
              id: itemId,
              error: err instanceof Error ? err.message : 'Processing failed'
            });
          }
          
          result.totalProcessed++;
          setProgress((result.totalProcessed / items.length) * 100);
        });

        await Promise.all(batchPromises);
        
        // Small delay between batches to prevent overwhelming the server
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setLastResult(result);
      
      if (opts.hapticFeedback) {
        if (result.failed.length === 0) {
          workOrderHaptics.workOrderComplete();
        } else if (result.successful.length > 0) {
          workOrderHaptics.workOrderUpdate();
        } else {
          workOrderHaptics.workOrderError();
        }
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch operation failed';
      setError(errorMessage);
      
      if (opts.hapticFeedback) {
        workOrderHaptics.workOrderError();
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
      setCurrentOperation(null);
      setProgress(0);
    }
  }, [opts.maxConcurrent, opts.hapticFeedback]);

  const updateStatus = useCallback(async (
    workOrderIds: string[],
    newStatus: WorkOrder['status']
  ): Promise<BatchOperationResult> => {
    if (!newStatus) {
      throw new Error('Status is required for batch update');
    }

    return processInBatches(
      workOrderIds,
      async (workOrderId) => {
        const { error } = await supabase
          .from('work_orders')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', workOrderId);

        return {
          success: !error,
          error: error?.message
        };
      },
      `Updating status to ${newStatus}`
    );
  }, [processInBatches]);

  const assignTechnician = useCallback(async (
    workOrderIds: string[],
    technicianId: string
  ): Promise<BatchOperationResult> => {
    if (!technicianId) {
      throw new Error('Technician ID is required for batch assignment');
    }

    return processInBatches(
      workOrderIds,
      async (workOrderId) => {
        const { error } = await supabase
          .from('work_orders')
          .update({ 
            assignedTechnicianId: technicianId,
            updated_at: new Date().toISOString()
          })
          .eq('id', workOrderId);

        return {
          success: !error,
          error: error?.message
        };
      },
      'Assigning technician'
    );
  }, [processInBatches]);

  const updatePriority = useCallback(async (
    workOrderIds: string[],
    priority: WorkOrder['priority']
  ): Promise<BatchOperationResult> => {
    if (!priority) {
      throw new Error('Priority is required for batch update');
    }

    return processInBatches(
      workOrderIds,
      async (workOrderId) => {
        const { error } = await supabase
          .from('work_orders')
          .update({ 
            priority: priority,
            updated_at: new Date().toISOString()
          })
          .eq('id', workOrderId);

        return {
          success: !error,
          error: error?.message
        };
      },
      `Updating priority to ${priority}`
    );
  }, [processInBatches]);

  const exportWorkOrders = useCallback(async (workOrderIds: string[]): Promise<void> => {
    setIsProcessing(true);
    setCurrentOperation('Exporting work orders');
    setError(null);

    try {
      // Fetch work order details
      const { data: workOrders, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          customers (name, phone, customer_type),
          vehicles (make, model, year, license_plate),
          technicians (name, email, phone)
        `)
        .in('id', workOrderIds);

      if (error) {
        throw new Error(`Failed to fetch work orders: ${error.message}`);
      }

      if (!workOrders || workOrders.length === 0) {
        throw new Error('No work orders found for export');
      }

      // Prepare CSV data
      const csvHeaders = [
        'Work Order Number',
        'Status',
        'Priority',
        'Customer Name',
        'Customer Phone',
        'Vehicle',
        'Service',
        'Technician',
        'Created Date',
        'Address',
        'Diagnosis'
      ];

      const csvRows = workOrders.map(wo => [
        wo.workOrderNumber || '',
        wo.status || '',
        wo.priority || '',
        wo.customers?.name || wo.customerName || '',
        wo.customers?.phone || wo.customerPhone || '',
        wo.vehicles ? `${wo.vehicles.year} ${wo.vehicles.make} ${wo.vehicles.model}` : wo.vehicleModel || '',
        wo.service || '',
        wo.technicians?.name || '',
        wo.created_at ? new Date(wo.created_at).toLocaleDateString() : '',
        wo.customerAddress || '',
        wo.initialDiagnosis || ''
      ]);

      // Create CSV content
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `work-orders-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      if (opts.hapticFeedback) {
        workOrderHaptics.workOrderComplete();
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      
      if (opts.hapticFeedback) {
        workOrderHaptics.workOrderError();
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
      setCurrentOperation(null);
    }
  }, [opts.hapticFeedback]);

  const clearResult = useCallback(() => {
    setLastResult(null);
    setError(null);
  }, []);

  return {
    // State
    isProcessing,
    progress,
    currentOperation,
    lastResult,
    error,
    
    // Actions
    updateStatus,
    assignTechnician,
    updatePriority,
    exportWorkOrders,
    clearResult
  };
}

/**
 * Utility hook for batch operation validation
 */
export function useBatchOperationValidation() {
  const validateBatchOperation = useCallback((
    workOrderIds: string[],
    operationType: 'status' | 'assignment' | 'priority' | 'export'
  ) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (workOrderIds.length === 0) {
      errors.push('No work orders selected for batch operation');
    }

    if (workOrderIds.length > 50) {
      warnings.push('Large batch operations may take longer to complete');
    }

    switch (operationType) {
      case 'status':
        if (workOrderIds.length > 20) {
          warnings.push('Status updates for many work orders may affect system performance');
        }
        break;
      
      case 'assignment':
        if (workOrderIds.length > 10) {
          warnings.push('Assigning many work orders to one technician may create workload imbalance');
        }
        break;
      
      case 'export':
        if (workOrderIds.length > 100) {
          warnings.push('Large exports may take several minutes to complete');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      selectedCount: workOrderIds.length
    };
  }, []);

  return { validateBatchOperation };
}

/**
 * Hook for managing batch operation preferences
 */
export function useBatchOperationPreferences() {
  const [preferences, setPreferences] = useState({
    hapticFeedback: true,
    maxConcurrent: 5,
    retryFailures: false,
    confirmDestructiveActions: true
  });

  const updatePreference = useCallback(<K extends keyof typeof preferences>(
    key: K,
    value: typeof preferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  return {
    preferences,
    updatePreference
  };
}