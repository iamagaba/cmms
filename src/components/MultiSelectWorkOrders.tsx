import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Square,
  X,
  Settings,
  MapPin,
  Navigation,
  Users,
  Download
} from 'lucide-react';
import { WorkOrder } from '../types/supabase';
import { useMultiSelect } from '../hooks/useMultiSelect';
import { useRoutePlanning } from '../hooks/useRoutePlanning';
import { BatchOperationsPanel } from './BatchOperationsPanel';
import { RouteOptimizationPanel } from './RouteOptimizationPanel';
import { Coordinates } from '../utils/distance';
import { workOrderHaptics } from '../utils/haptic';
import { useToast } from '@/hooks/use-toast';


export interface MultiSelectWorkOrdersProps {
  workOrders: WorkOrder[];
  userLocation: Coordinates | null;
  onSelectionChange?: (selectedIds: string[]) => void;
  onWorkOrderUpdate?: (workOrder: WorkOrder) => void;
  children: (props: {
    isMultiSelectMode: boolean;
    selectedCount: number;
    isSelected: (id: string) => boolean;
    toggleSelection: (id: string) => void;
    enterMultiSelectMode: () => void;
    exitMultiSelectMode: () => void;
    getLongPressHandlers: (workOrderId: string) => Record<string, any>;
  }) => React.ReactNode;
}

export function MultiSelectWorkOrders({
  workOrders,
  userLocation,
  onSelectionChange,
  onWorkOrderUpdate,
  children
}: MultiSelectWorkOrdersProps) {
  const [showBatchOperations, setShowBatchOperations] = useState(false);
  const [showRouteOptimization, setShowRouteOptimization] = useState(false);

  const multiSelect = useMultiSelect<string>({
    hapticFeedback: true,
    maxSelections: 25
  });

  const routePlanning = useRoutePlanning({
    hapticFeedback: true
  });
  const { toast } = useToast();


  // Notify parent of selection changes
  useEffect(() => {
    const selectedIds = Array.from(multiSelect.selectedItems);
    onSelectionChange?.(selectedIds);
  }, [multiSelect.selectedItems, onSelectionChange]);

  // Auto-exit multi-select when no items are selected
  useEffect(() => {
    if (multiSelect.isMultiSelectMode && multiSelect.selectionCount === 0) {
      // Small delay to prevent immediate exit during selection changes
      const timer = setTimeout(() => {
        if (multiSelect.selectionCount === 0) {
          multiSelect.exitMultiSelectMode();
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [multiSelect.isMultiSelectMode, multiSelect.selectionCount, multiSelect.exitMultiSelectMode]);

  const handleLongPress = useCallback((workOrderId: string) => {
    if (!multiSelect.isMultiSelectMode) {
      multiSelect.enterMultiSelectMode();
    }
    multiSelect.toggleSelection(workOrderId);
  }, [multiSelect]);

  const handleTap = useCallback((workOrderId: string) => {
    if (multiSelect.isMultiSelectMode) {
      multiSelect.toggleSelection(workOrderId);
    }
  }, [multiSelect]);

  const getLongPressHandlers = useCallback((workOrderId: string) => {
    return {
      onTouchStart: (event: React.TouchEvent) => {
        if (event.touches.length === 1) {
          const touch = event.touches[0];
          // Implementation would use useLongPress hook internally
          // For now, simplified version
        }
      },
      onTouchEnd: () => {
        // Handle touch end
      },
      onClick: (event: React.MouseEvent) => {
        if (multiSelect.isMultiSelectMode) {
          event.preventDefault();
          event.stopPropagation();
          handleTap(workOrderId);
        }
      },
      onContextMenu: (event: React.MouseEvent) => {
        event.preventDefault();
        handleLongPress(workOrderId);
      }
    };
  }, [multiSelect.isMultiSelectMode, handleTap, handleLongPress]);

  const handleSelectAll = () => {
    const allIds = workOrders.map(wo => wo.id);
    multiSelect.selectAll(allIds);
  };

  const handleClearSelection = () => {
    multiSelect.clearSelection();
  };

  const handleExitMultiSelect = () => {
    multiSelect.exitMultiSelectMode();
    setShowBatchOperations(false);
    setShowRouteOptimization(false);
  };

  const handlePlanRoute = () => {
    if (!userLocation) {
      toast({
        title: "Location Required",
        description: "Location access is required for route planning",
        variant: "destructive"
      });
      return;
    }

    const selectedWorkOrders = workOrders.filter(wo =>
      multiSelect.selectedItems.has(wo.id)
    );

    const validation = routePlanning.validateWorkOrders(selectedWorkOrders);

    if (!validation.hasValidOrders) {
      toast({
        title: "Missing Location Data",
        description: "Selected work orders do not have location data for route planning",
        variant: "destructive"
      });
      return;
    }

    if (validation.invalid.length > 0) {
      const proceed = confirm(
        `${validation.invalid.length} work orders will be excluded due to missing location data. Continue?`
      );
      if (!proceed) return;
    }

    routePlanning.optimizeRoute(selectedWorkOrders, userLocation);
    setShowRouteOptimization(true);
  };

  const selectedWorkOrders = workOrders.filter(wo =>
    multiSelect.selectedItems.has(wo.id)
  );

  const selectedWithLocation = selectedWorkOrders.filter(wo =>
    wo.customerLat && wo.customerLng
  );

  return (
    <>
      {/* Multi-Select Mode Header */}
      <AnimatePresence>
        {multiSelect.isMultiSelectMode && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
            className="fixed top-0 left-0 right-0 bg-blue-600 text-white z-40 px-4 py-3 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleExitMultiSelect}
                  className="p-1 hover:bg-blue-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="font-semibold">
                    {multiSelect.selectionCount} Selected
                  </h2>
                  <p className="text-xs text-blue-100">
                    Tap work orders to select/deselect
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {multiSelect.selectionCount < workOrders.length && (
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-1.5 bg-blue-700 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
                  >
                    Select All
                  </button>
                )}

                {multiSelect.selectionCount > 0 && (
                  <button
                    onClick={handleClearSelection}
                    className="px-3 py-1.5 bg-blue-700 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multi-Select Action Bar */}
      <AnimatePresence>
        {multiSelect.isMultiSelectMode && multiSelect.selectionCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
            className="fixed bottom-20 left-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 z-40 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">
                Actions for {multiSelect.selectionCount} work order{multiSelect.selectionCount !== 1 ? 's' : ''}
              </h3>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                {selectedWithLocation.length > 0 && (
                  <>
                    <MapPin className="w-3 h-3" />
                    <span>{selectedWithLocation.length} with location</span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Batch Operations */}
              <button
                onClick={() => setShowBatchOperations(true)}
                className="flex items-center justify-center space-x-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Batch Actions</span>
              </button>

              {/* Route Planning */}
              <button
                onClick={handlePlanRoute}
                disabled={!userLocation || selectedWithLocation.length === 0}
                className="flex items-center justify-center space-x-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Navigation className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Plan Route
                  {!userLocation && ' (Location needed)'}
                  {userLocation && selectedWithLocation.length === 0 && ' (No locations)'}
                </span>
              </button>
            </div>

            {/* Quick Actions Row */}
            <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => {
                  // Quick export action
                  const selectedIds = Array.from(multiSelect.selectedItems);
                  // This would trigger export directly
                  console.log('Quick export for:', selectedIds);
                }}
                className="flex-1 flex items-center justify-center space-x-1 p-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Download className="w-3 h-3" />
                <span className="text-xs font-medium">Export</span>
              </button>

              <button
                onClick={() => {
                  // Quick assign action - would show technician picker
                  console.log('Quick assign for:', Array.from(multiSelect.selectedItems));
                }}
                className="flex-1 flex items-center justify-center space-x-1 p-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <Users className="w-3 h-3" />
                <span className="text-xs font-medium">Assign</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={multiSelect.isMultiSelectMode ? 'pt-16 pb-32' : ''}>
        {children({
          isMultiSelectMode: multiSelect.isMultiSelectMode,
          selectedCount: multiSelect.selectionCount,
          isSelected: multiSelect.isSelected,
          toggleSelection: multiSelect.toggleSelection,
          enterMultiSelectMode: multiSelect.enterMultiSelectMode,
          exitMultiSelectMode: handleExitMultiSelect,
          getLongPressHandlers
        })}
      </div>

      {/* Selection Indicators */}
      {multiSelect.isMultiSelectMode && (
        <div className="fixed top-16 right-4 z-30">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-full p-2 shadow-lg border border-gray-200"
          >
            <div className="flex items-center space-x-1 text-xs">
              <CheckSquare className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-900">{multiSelect.selectionCount}</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Batch Operations Panel */}
      {showBatchOperations && (
        <BatchOperationsPanel
          selectedWorkOrders={Array.from(multiSelect.selectedItems)}
          workOrders={workOrders}
          onClose={() => setShowBatchOperations(false)}
          onOperationComplete={(result) => {
            // Handle operation completion
            if (result.successful.length > 0) {
              // Refresh work orders or notify parent
              console.log('Batch operation completed:', result);
            }
          }}
        />
      )}

      {/* Route Optimization Panel */}
      {showRouteOptimization && routePlanning.optimizationResult && (
        <RouteOptimizationPanel
          optimizationResult={routePlanning.optimizationResult}
          routeStats={routePlanning.routeStats}
          routeSummary={routePlanning.routeSummary}
          userLocation={userLocation}
          onClose={() => setShowRouteOptimization(false)}
          onOpenInMaps={(provider) => routePlanning.openInMaps(provider)}
        />
      )}
    </>
  );
}

/**
 * Enhanced work order card component with multi-select support
 */
export interface MultiSelectWorkOrderCardProps {
  workOrder: WorkOrder;
  isMultiSelectMode: boolean;
  isSelected: boolean;
  onToggleSelection: () => void;
  onLongPress: () => void;
  children: React.ReactNode;
}

export function MultiSelectWorkOrderCard({
  workOrder,
  isMultiSelectMode,
  isSelected,
  onToggleSelection,
  onLongPress,
  children
}: MultiSelectWorkOrderCardProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = useCallback(() => {
    setIsPressed(true);

    if (isMultiSelectMode) {
      workOrderHaptics.workOrderSelect();
    }
  }, [isMultiSelectMode]);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (isMultiSelectMode) {
      event.preventDefault();
      event.stopPropagation();
      onToggleSelection();
    }
  }, [isMultiSelectMode, onToggleSelection]);

  return (
    <motion.div
      className={`relative overflow-hidden transition-all duration-200 ${isMultiSelectMode ? 'cursor-pointer' : ''
        } ${isPressed ? 'scale-95' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onLongPress();
      }}
      animate={{
        scale: isSelected ? 0.98 : 1,
        borderColor: isSelected ? '#3B82F6' : 'transparent'
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Selection Overlay */}
      <AnimatePresence>
        {isMultiSelectMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 border-2 rounded-xl z-10 pointer-events-none ${isSelected ? 'border-blue-500 bg-blue-50 bg-opacity-20' : 'border-gray-300 border-dashed'
              }`}
          />
        )}
      </AnimatePresence>

      {/* Selection Checkbox */}
      <AnimatePresence>
        {isMultiSelectMode && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-3 right-3 z-20"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white' : 'bg-white border-2 border-gray-300'
              }`}>
              {isSelected ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Content */}
      <div className={isMultiSelectMode ? 'pr-10' : ''}>
        {children}
      </div>
    </motion.div>
  );
}