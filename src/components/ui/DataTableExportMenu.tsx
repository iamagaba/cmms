/**
 * Data Table Export Menu Component
 * 
 * Provides export functionality for the Enhanced Professional Data Table.
 * Supports multiple formats with professional styling and progress indicators.
 */

import React, { useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ExportOption } from './EnhancedProfessionalDataTable';

// ============================================
// INTERFACES
// ============================================

interface ExportMenuProps<T> {
  exportOptions: ExportOption[];
  data: T[];
  selectedData?: T[];
  onExport: (format: string, data: T[]) => void;
  className?: string;
  disabled?: boolean;
}

interface ExportProgressProps {
  isVisible: boolean;
  format: string;
  progress: number;
  onCancel?: () => void;
}

// ============================================
// EXPORT PROGRESS COMPONENT
// ============================================

const ExportProgress: React.FC<ExportProgressProps> = ({
  isVisible,
  format,
  progress,
  onCancel,
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="bg-white border border-machinery-200 rounded-lg shadow-lg p-4 min-w-80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon icon="tabler:download" className="w-4 h-4 text-steel-600" />
            <span className="text-sm font-medium text-machinery-700">
              Exporting as {format.toUpperCase()}
            </span>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-machinery-400 hover:text-machinery-600 transition-colors"
            >
              <Icon icon="tabler:x" className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-machinery-500">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-machinery-200 rounded-full h-2">
            <motion.div
              className="bg-steel-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// EXPORT OPTION COMPONENT
// ============================================

interface ExportOptionButtonProps {
  option: ExportOption;
  dataCount: number;
  selectedCount?: number;
  onExport: (option: ExportOption, useSelected: boolean) => void;
  disabled?: boolean;
}

const ExportOptionButton: React.FC<ExportOptionButtonProps> = ({
  option,
  dataCount,
  selectedCount = 0,
  onExport,
  disabled = false,
}) => {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const hasSelection = selectedCount > 0;

  const handleExport = (useSelected: boolean) => {
    onExport(option, useSelected);
    setShowSubmenu(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          if (hasSelection) {
            setShowSubmenu(!showSubmenu);
          } else {
            handleExport(false);
          }
        }}
        disabled={disabled}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 text-left',
          'text-machinery-700 hover:bg-machinery-50 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus:outline-none focus:bg-machinery-50'
        )}
      >
        <Icon icon={option.icon} className="w-4 h-4 text-machinery-500" />
        <div className="flex-1">
          <div className="font-medium">{option.label}</div>
          <div className="text-xs text-machinery-500">
            {dataCount} record{dataCount !== 1 ? 's' : ''}
            {hasSelection && ` • ${selectedCount} selected`}
          </div>
        </div>
        {hasSelection && (
          <Icon 
            icon="tabler:chevron-right" 
            className="w-4 h-4 text-machinery-400" 
          />
        )}
      </button>

      {/* Submenu for selection choice */}
      <AnimatePresence>
        {showSubmenu && hasSelection && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute left-full top-0 ml-1 bg-white border border-machinery-200 rounded-md shadow-lg min-w-48 z-10"
          >
            <button
              type="button"
              onClick={() => handleExport(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-machinery-700 hover:bg-machinery-50 transition-colors"
            >
              <Icon icon="tabler:check" className="w-4 h-4 text-steel-600" />
              <div>
                <div className="font-medium">Export Selected</div>
                <div className="text-xs text-machinery-500">
                  {selectedCount} record{selectedCount !== 1 ? 's' : ''}
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleExport(false)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-machinery-700 hover:bg-machinery-50 transition-colors"
            >
              <Icon icon="tabler:database" className="w-4 h-4 text-machinery-500" />
              <div>
                <div className="font-medium">Export All</div>
                <div className="text-xs text-machinery-500">
                  {dataCount} record{dataCount !== 1 ? 's' : ''}
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for submenu */}
      {showSubmenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowSubmenu(false)}
        />
      )}
    </div>
  );
};

// ============================================
// MAIN EXPORT MENU COMPONENT
// ============================================

const DataTableExportMenu = <T,>({
  exportOptions,
  data,
  selectedData = [],
  onExport,
  className,
  disabled = false,
}: ExportMenuProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState({
    isVisible: false,
    format: '',
    progress: 0,
  });

  // Handle export with progress simulation
  const handleExport = useCallback(async (option: ExportOption, useSelected: boolean) => {
    const exportData = useSelected ? selectedData : data;
    
    // Show progress
    setExportProgress({
      isVisible: true,
      format: option.format,
      progress: 0,
    });

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setExportProgress(prev => ({
        ...prev,
        progress: Math.min(prev.progress + 10, 90),
      }));
    }, 100);

    try {
      // Call the actual export function
      await onExport(option.format, exportData);
      
      // Complete progress
      setExportProgress(prev => ({ ...prev, progress: 100 }));
      
      // Hide progress after a short delay
      setTimeout(() => {
        setExportProgress(prev => ({ ...prev, isVisible: false }));
      }, 1000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportProgress(prev => ({ ...prev, isVisible: false }));
    } finally {
      clearInterval(progressInterval);
      setIsOpen(false);
    }
  }, [data, selectedData, onExport]);

  // Cancel export
  const handleCancelExport = useCallback(() => {
    setExportProgress(prev => ({ ...prev, isVisible: false }));
  }, []);

  if (exportOptions.length === 0) return null;

  return (
    <>
      <div className={cn('relative', className)}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled || data.length === 0}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium',
            'text-machinery-700 bg-white border border-machinery-300 rounded-md',
            'hover:bg-machinery-50 hover:border-steel-400 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-steel-500',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Icon icon="tabler:download" className="w-4 h-4" />
          <span>Export</span>
          <Icon 
            icon={isOpen ? "tabler:chevron-up" : "tabler:chevron-down"} 
            className="w-3 h-3" 
          />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-machinery-200 py-2 z-50 min-w-64"
            >
              {/* Header */}
              <div className="px-4 py-2 border-b border-machinery-200">
                <div className="flex items-center gap-2">
                  <Icon icon="tabler:download" className="w-4 h-4 text-steel-600" />
                  <span className="text-sm font-medium text-machinery-700">
                    Export Data
                  </span>
                </div>
                <div className="text-xs text-machinery-500 mt-1">
                  Choose format and data to export
                </div>
              </div>

              {/* Export Options */}
              <div className="py-1">
                {exportOptions.map((option) => (
                  <ExportOptionButton
                    key={option.key}
                    option={option}
                    dataCount={data.length}
                    selectedCount={selectedData.length}
                    onExport={handleExport}
                    disabled={disabled}
                  />
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-machinery-200">
                <div className="flex items-center gap-2 text-xs text-machinery-500">
                  <Icon icon="tabler:info-circle" className="w-3 h-3" />
                  <span>
                    Exports include all visible columns and applied filters
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>

      {/* Export Progress */}
      <AnimatePresence>
        <ExportProgress
          isVisible={exportProgress.isVisible}
          format={exportProgress.format}
          progress={exportProgress.progress}
          onCancel={handleCancelExport}
        />
      </AnimatePresence>
    </>
  );
};

// ============================================
// EXPORTS
// ============================================

export default DataTableExportMenu;
export type { ExportMenuProps };