import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  AlertTriangle, 
  Download, 
  X,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { WorkOrder, Technician } from '../types/supabase';
import { useBatchOperations, BatchOperationResult } from '../hooks/useBatchOperations';
import { supabase } from '@/lib/supabase';

export interface BatchOperationsPanelProps {
  selectedWorkOrders: string[];
  workOrders: WorkOrder[];
  onClose: () => void;
  onOperationComplete?: (result: BatchOperationResult) => void;
}

export function BatchOperationsPanel({
  selectedWorkOrders,
  workOrders,
  onClose,
  onOperationComplete
}: BatchOperationsPanelProps) {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showTechnicianDropdown, setShowTechnicianDropdown] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    action: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const {
    isProcessing,
    progress,
    currentOperation,
    lastResult,
    error,
    updateStatus,
    assignTechnician,
    updatePriority,
    exportWorkOrders,
    clearResult
  } = useBatchOperations();

  // Fetch technicians for assignment
  useEffect(() => {
    const fetchTechnicians = async () => {
      const { data, error } = await supabase
        .from('technicians')
        .select('id, name, status')
        .eq('status', 'available')
        .order('name');

      if (!error && data) {
        setTechnicians(data);
      }
    };

    fetchTechnicians();
  }, []);

  // Notify parent of operation completion
  useEffect(() => {
    if (lastResult && onOperationComplete) {
      onOperationComplete(lastResult);
    }
  }, [lastResult, onOperationComplete]);

  const selectedWorkOrdersData = workOrders.filter(wo => 
    selectedWorkOrders.includes(wo.id)
  );

  const statusOptions: WorkOrder['status'][] = [
    'Open', 'Confirmation', 'On Hold', 'Ready', 'In Progress', 'Completed'
  ];

  const priorityOptions: WorkOrder['priority'][] = [
    'High', 'Medium', 'Low'
  ];

  const handleStatusUpdate = async (newStatus: WorkOrder['status']) => {
    if (!newStatus) return;

    setShowConfirmDialog({
      action: `Update Status to ${newStatus}`,
      description: `This will update ${selectedWorkOrders.length} work orders to "${newStatus}" status.`,
      onConfirm: async () => {
        try {
          await updateStatus(selectedWorkOrders, newStatus);
          setShowConfirmDialog(null);
          setShowStatusDropdown(false);
        } catch (err) {
          console.error('Batch status update failed:', err);
        }
      }
    });
  };

  const handlePriorityUpdate = async (newPriority: WorkOrder['priority']) => {
    if (!newPriority) return;

    setShowConfirmDialog({
      action: `Update Priority to ${newPriority}`,
      description: `This will update ${selectedWorkOrders.length} work orders to "${newPriority}" priority.`,
      onConfirm: async () => {
        try {
          await updatePriority(selectedWorkOrders, newPriority);
          setShowConfirmDialog(null);
          setShowPriorityDropdown(false);
        } catch (err) {
          console.error('Batch priority update failed:', err);
        }
      }
    });
  };

  const handleTechnicianAssignment = async (technicianId: string) => {
    const technician = technicians.find(t => t.id === technicianId);
    if (!technician) return;

    setShowConfirmDialog({
      action: `Assign to ${technician.name}`,
      description: `This will assign ${selectedWorkOrders.length} work orders to ${technician.name}.`,
      onConfirm: async () => {
        try {
          await assignTechnician(selectedWorkOrders, technicianId);
          setShowConfirmDialog(null);
          setShowTechnicianDropdown(false);
        } catch (err) {
          console.error('Batch technician assignment failed:', err);
        }
      }
    });
  };

  const handleExport = async () => {
    setShowConfirmDialog({
      action: 'Export Work Orders',
      description: `This will export ${selectedWorkOrders.length} work orders to a CSV file.`,
      onConfirm: async () => {
        try {
          await exportWorkOrders(selectedWorkOrders);
          setShowConfirmDialog(null);
        } catch (err) {
          console.error('Export failed:', err);
        }
      }
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-md backdrop-saturate-150 z-50 flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 500 }}
          className="w-full bg-white rounded-t-2xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Batch Operations</h2>
              <p className="text-sm text-gray-500">
                {selectedWorkOrders.length} work order{selectedWorkOrders.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="p-4 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">{currentOperation}</p>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-700 mt-1">{Math.round(progress)}% complete</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-900">Operation Failed</p>
                  <p className="text-xs text-red-700">{error}</p>
                </div>
                <button
                  onClick={clearResult}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Success/Result Display */}
          {lastResult && !error && (
            <div className="p-4 bg-green-50 border-b border-green-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">
                    Operation Completed
                  </p>
                  <p className="text-xs text-green-700">
                    {lastResult.successful.length} successful
                    {lastResult.failed.length > 0 && `, ${lastResult.failed.length} failed`}
                  </p>
                </div>
                <button
                  onClick={clearResult}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {/* Selected Work Orders Preview */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Selected Work Orders</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {selectedWorkOrdersData.slice(0, 5).map((wo) => (
                  <div key={wo.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{wo.workOrderNumber}</span>
                    <span className="text-gray-500">{wo.customerName || 'Unknown'}</span>
                  </div>
                ))}
                {selectedWorkOrdersData.length > 5 && (
                  <p className="text-xs text-gray-500 text-center pt-1">
                    +{selectedWorkOrdersData.length - 5} more...
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Status Update */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">Update Status</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showStatusDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(status)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Priority Update */}
              <div className="relative">
                <button
                  onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-between p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">Update Priority</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showPriorityDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showPriorityDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {priorityOptions.map((priority) => (
                      <button
                        key={priority}
                        onClick={() => handlePriorityUpdate(priority)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Technician Assignment */}
              <div className="relative">
                <button
                  onClick={() => setShowTechnicianDropdown(!showTechnicianDropdown)}
                  disabled={isProcessing || technicians.length === 0}
                  className="w-full flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span className="font-medium">
                      Assign Technician
                      {technicians.length === 0 && ' (No available technicians)'}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showTechnicianDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showTechnicianDropdown && technicians.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {technicians.map((technician) => (
                      <button
                        key={technician.id}
                        onClick={() => handleTechnicianAssignment(technician.id)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span>{technician.name}</span>
                          <span className="text-xs text-gray-500 capitalize">{technician.status}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Export */}
              <button
                onClick={handleExport}
                disabled={isProcessing}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-5 h-5" />
                <span className="font-medium">Export to CSV</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-md backdrop-saturate-150 z-60 flex items-center justify-center p-4"
          onClick={() => setShowConfirmDialog(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm {showConfirmDialog.action}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {showConfirmDialog.description}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmDialog(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={showConfirmDialog.onConfirm}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}