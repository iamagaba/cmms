/**
 * Professional Enhanced Data Table Component
 * 
 * An advanced data table component built for the professional design system
 * with maintenance workflow features, advanced filtering, bulk operations,
 * responsive design, and comprehensive accessibility support.
 * 
 * Features:
 * - Maintenance workflow optimization
 * - Advanced filtering and search
 * - Bulk operations support
 * - Export functionality
 * - Responsive design
 */

import React, { useState, useMemo, useCallback } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  ArrowUp01Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  Download01Icon,
  AlertCircleIcon,
  RefreshIcon,
  Search01Icon
} from '@hugeicons/core-free-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ProfessionalDataTable, { TableColumn, TableProps } from './ProfessionalDataTable';
import ProfessionalButton from './ProfessionalButton';
import ProfessionalInput from './ProfessionalInput';

// ============================================
// ENHANCED INTERFACES
// ============================================

export interface FilterOption {
  label: string;
  value: string | number;
  count?: number;
}

export interface ColumnFilter {
  key: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'text';
  label: string;
  options?: FilterOption[];
  placeholder?: string;
}

export interface BulkAction {
  key: string;
  label: string;
  icon: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  disabled?: (selectedRows: any[]) => boolean;
}

export interface ExportOption {
  key: string;
  label: string;
  icon: string;
  format: 'csv' | 'excel' | 'pdf' | 'json';
}

export interface ProfessionalEnhancedTableProps<T = any> extends Omit<TableProps<T>, 'searchable'> {
  // Advanced filtering
  filters?: ColumnFilter[];
  activeFilters?: Record<string, any>;
  onFiltersChange?: (filters: Record<string, any>) => void;
  
  // Search enhancements
  searchable?: boolean;
  globalSearch?: boolean;
  searchColumns?: string[];
  searchPlaceholder?: string;
  
  // Bulk operations
  bulkActions?: BulkAction[];
  onBulkAction?: (action: string, selectedRows: T[]) => void;
  
  // Export functionality
  exportOptions?: ExportOption[];
  onExport?: (format: string, data: T[]) => void;
  
  // Layout options
  compactMode?: boolean;
  stickyHeader?: boolean;
  virtualScrolling?: boolean;
  
  // Mobile responsiveness
  mobileBreakpoint?: number;
  mobileColumns?: string[];
  
  // Advanced features
  groupBy?: string;
  expandableRows?: boolean;
  renderExpandedRow?: (record: T) => React.ReactNode;
  
  // Performance
  enableVirtualization?: boolean;
  rowHeight?: number;
  
  // Accessibility
  ariaLabel?: string;
  ariaDescription?: string;
  
  // Loading states
  skeletonRows?: number;
  
  // Error handling
  error?: string;
  onRetry?: () => void;
}

// ============================================
// FILTER COMPONENTS
// ============================================

interface FilterBarProps {
  filters: ColumnFilter[];
  activeFilters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  activeFilters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeFilterCount = Object.keys(activeFilters).filter(key => 
    activeFilters[key] !== undefined && activeFilters[key] !== '' && 
    (Array.isArray(activeFilters[key]) ? activeFilters[key].length > 0 : true)
  ).length;

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...activeFilters,
      [key]: value,
    });
  };

  return (
    <div className="border-b border-machinery-200 bg-machinery-25">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <ProfessionalButton
            variant="ghost"
            size="sm"
            icon={isExpanded ? ArrowUp01Icon : ArrowDown01Icon}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-steel-600 text-white rounded-full">
                {activeFilterCount}
              </span>
            )}
          </ProfessionalButton>
          
          {activeFilterCount > 0 && (
            <ProfessionalButton
              variant="ghost"
              size="sm"
              icon={Cancel01Icon}
              onClick={onClearFilters}
            >
              Clear all
            </ProfessionalButton>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-machinery-600">
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
          </span>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filters.map((filter) => (
                <div key={filter.key} className="space-y-2">
                  <label className="text-sm font-medium text-machinery-700">
                    {filter.label}
                  </label>
                  
                  {filter.type === 'select' && (
                    <select
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-machinery-300 rounded-md focus:ring-2 focus:ring-steel-500 focus:border-steel-500 bg-white"
                    >
                      <option value="">{filter.placeholder || 'All'}</option>
                      {filter.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                          {option.count !== undefined && ` (${option.count})`}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {filter.type === 'text' && (
                    <ProfessionalInput
                      placeholder={filter.placeholder}
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      size="sm"
                    />
                  )}
                  
                  {filter.type === 'date' && (
                    <input
                      type="date"
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-machinery-300 rounded-md focus:ring-2 focus:ring-steel-500 focus:border-steel-500 bg-white"
                    />
                  )}
                  
                  {filter.type === 'number' && (
                    <input
                      type="number"
                      placeholder={filter.placeholder}
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-machinery-300 rounded-md focus:ring-2 focus:ring-steel-500 focus:border-steel-500 bg-white"
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// BULK ACTIONS BAR
// ============================================

interface BulkActionsBarProps<T> {
  selectedCount: number;
  totalCount: number;
  bulkActions: BulkAction[];
  selectedRows: T[];
  onBulkAction: (action: string, selectedRows: T[]) => void;
  onClearSelection: () => void;
}

const BulkActionsBar = <T,>({
  selectedCount,
  totalCount,
  bulkActions,
  selectedRows,
  onBulkAction,
  onClearSelection,
}: BulkActionsBarProps<T>) => {
  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-steel-50 border-b border-steel-200 px-4 py-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-steel-700">
            {selectedCount} of {totalCount} selected
          </span>
          
          <div className="flex items-center gap-2">
            {bulkActions.map((action) => (
              <ProfessionalButton
                key={action.key}
                variant={action.variant || 'outline'}
                size="sm"
                icon={action.icon}
                disabled={action.disabled?.(selectedRows)}
                onClick={() => {
                  if (action.requiresConfirmation) {
                    if (confirm(action.confirmationMessage || `Are you sure you want to ${action.label.toLowerCase()}?`)) {
                      onBulkAction(action.key, selectedRows);
                    }
                  } else {
                    onBulkAction(action.key, selectedRows);
                  }
                }}
              >
                {action.label}
              </ProfessionalButton>
            ))}
          </div>
        </div>
        
        <ProfessionalButton
          variant="ghost"
          size="sm"
          icon={Cancel01Icon}
          onClick={onClearSelection}
        >
          Clear selection
        </ProfessionalButton>
      </div>
    </motion.div>
  );
};

// ============================================
// EXPORT MENU
// ============================================

interface ExportMenuProps<T> {
  exportOptions: ExportOption[];
  data: T[];
  onExport: (format: string, data: T[]) => void;
}

const ExportMenu = <T,>({ exportOptions, data, onExport }: ExportMenuProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <ProfessionalButton
        variant="outline"
        size="sm"
        icon={Download01Icon}
        onClick={() => setIsOpen(!isOpen)}
      >
        Export
      </ProfessionalButton>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-machinery-200 py-2 z-50"
          >
            {exportOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  onExport(option.format, data);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-machinery-700 hover:bg-machinery-50 flex items-center gap-3 transition-colors"
              >
                <HugeiconsIcon icon={option.icon} size={16} />
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

// ============================================
// ERROR STATE COMPONENT
// ============================================

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
    <HugeiconsIcon icon={AlertCircleIcon} size={48} className="text-warning-500 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-machinery-900 mb-2">Error Loading Data</h3>
    <p className="text-machinery-600 mb-4">{error}</p>
    {onRetry && (
      <ProfessionalButton
        variant="primary"
        icon={RefreshIcon}
        onClick={onRetry}
      >
        Try Again
      </ProfessionalButton>
    )}
  </div>
);

// ============================================
// SKELETON LOADER COMPONENT
// ============================================

interface SkeletonLoaderProps {
  columns: TableColumn[];
  rows: number;
  selectable: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ columns, rows, selectable }) => (
  <div className="animate-pulse">
    <table className="w-full">
      <thead className="bg-machinery-50 border-b border-machinery-200">
        <tr>
          {selectable && (
            <th className="w-12 px-4 py-3">
              <div className="w-4 h-4 bg-machinery-200 rounded" />
            </th>
          )}
          {columns.map((column) => (
            <th key={column.key} className="px-4 py-3 text-left">
              <div className="h-4 bg-machinery-200 rounded w-24" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, index) => (
          <tr key={index} className="border-b border-machinery-100">
            {selectable && (
              <td className="px-4 py-3">
                <div className="w-4 h-4 bg-machinery-200 rounded" />
              </td>
            )}
            {columns.map((column) => (
              <td key={column.key} className="px-4 py-3">
                <div className="h-4 bg-machinery-200 rounded" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ============================================
// MAIN ENHANCED DATA TABLE
// ============================================

const ProfessionalEnhancedDataTable = <T extends Record<string, any>>({
  // Enhanced props
  filters = [],
  activeFilters = {},
  onFiltersChange,
  globalSearch = true,
  searchColumns = [],
  bulkActions = [],
  onBulkAction,
  exportOptions = [],
  onExport,
  compactMode = false,
  stickyHeader = false,
  mobileBreakpoint = 768,
  mobileColumns = [],
  groupBy,
  expandableRows = false,
  renderExpandedRow,
  enableVirtualization = false,
  ariaLabel,
  ariaDescription,
  skeletonRows = 5,
  error,
  onRetry,
  
  // Base props
  columns,
  data,
  loading = false,
  selectedRows = [],
  onSelectionChange,
  searchable = true,
  searchPlaceholder = 'Search...',
  onSearch,
  size = 'base',
  className,
  ...baseProps
}: ProfessionalEnhancedTableProps<T>) => {
  const [localFilters, setLocalFilters] = useState(activeFilters);
  const [searchValue, setSearchValue] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: Record<string, any>) => {
    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters);
  }, [onFiltersChange]);

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  }, [onSearch]);

  // Filter and search data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && 
          (Array.isArray(value) ? value.length > 0 : true)) {
        result = result.filter(item => {
          const itemValue = item[key];
          if (Array.isArray(value)) {
            return value.includes(itemValue);
          }
          return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
        });
      }
    });

    // Apply global search
    if (searchValue && globalSearch) {
      const searchLower = searchValue.toLowerCase();
      result = result.filter(item => {
        const searchFields = searchColumns.length > 0 ? searchColumns : Object.keys(item);
        return searchFields.some(field => 
          String(item[field]).toLowerCase().includes(searchLower)
        );
      });
    }

    return result;
  }, [data, localFilters, searchValue, globalSearch, searchColumns]);

  // Handle bulk actions
  const handleBulkAction = useCallback((action: string) => {
    const selectedData = processedData.filter(item => 
      selectedRows.includes(String(item.id || item.key))
    );
    onBulkAction?.(action, selectedData);
  }, [processedData, selectedRows, onBulkAction]);

  // Handle export
  const handleExport = useCallback((format: string) => {
    onExport?.(format, processedData);
  }, [processedData, onExport]);

  // Clear selection
  const handleClearSelection = useCallback(() => {
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setLocalFilters({});
    onFiltersChange?.({});
  }, [onFiltersChange]);

  // Enhanced columns with expand functionality
  const enhancedColumns = useMemo(() => {
    const cols = [...columns];
    
    if (expandableRows) {
      cols.unshift({
        key: '__expand__',
        title: '',
        width: 40,
        render: (_, record) => {
          const key = String(record.id || record.key);
          const isExpanded = expandedRows.has(key);
          
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newExpanded = new Set(expandedRows);
                if (isExpanded) {
                  newExpanded.delete(key);
                } else {
                  newExpanded.add(key);
                }
                setExpandedRows(newExpanded);
              }}
              className="p-1 hover:bg-machinery-100 rounded transition-colors"
              aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
            >
              <HugeiconsIcon
                icon={isExpanded ? ArrowDown01Icon : ArrowRight01Icon}
                size={16}
                className="text-machinery-500"
              />
            </button>
          );
        },
      });
    }
    
    return cols;
  }, [columns, expandableRows, expandedRows]);

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  return (
    <div 
      className={cn('bg-white rounded-lg shadow-sm overflow-hidden', className)}
      role="region"
      aria-label={ariaLabel || 'Data table'}
      aria-description={ariaDescription}
    >
      {/* Filters */}
      {filters.length > 0 && (
        <FilterBar
          filters={filters}
          activeFilters={localFilters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Bulk Actions */}
      <AnimatePresence>
        {bulkActions.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedRows.length}
            totalCount={processedData.length}
            bulkActions={bulkActions}
            selectedRows={processedData.filter(item => 
              selectedRows.includes(String(item.id || item.key))
            )}
            onBulkAction={handleBulkAction}
            onClearSelection={handleClearSelection}
          />
        )}
      </AnimatePresence>

      {/* Search and Export Bar */}
      {(searchable || exportOptions.length > 0) && (
        <div className="flex items-center justify-between p-4 border-b border-machinery-200 bg-white">
          {searchable && (
            <ProfessionalInput
              icon={Search01Icon}
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="max-w-md"
              aria-label="Search table data"
            />
          )}
          
          <div className="flex items-center gap-2">
            {exportOptions.length > 0 && (
              <ExportMenu
                exportOptions={exportOptions}
                data={processedData}
                onExport={handleExport}
              />
            )}
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <SkeletonLoader
            columns={enhancedColumns}
            rows={skeletonRows}
            selectable={!!onSelectionChange}
          />
        ) : (
          <ProfessionalDataTable
            {...baseProps}
            columns={enhancedColumns}
            data={processedData}
            loading={false}
            selectedRows={selectedRows}
            onSelectionChange={onSelectionChange}
            size={compactMode ? 'sm' : size}
            searchable={false} // We handle search above
            className={stickyHeader ? 'sticky-header' : ''}
          />
        )}
      </div>

      {/* Expandable Row Content */}
      {expandableRows && renderExpandedRow && (
        <div className="divide-y divide-machinery-100">
          {processedData.map((record) => {
            const key = String(record.id || record.key);
            const isExpanded = expandedRows.has(key);
            
            return (
              <AnimatePresence key={key}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-machinery-25"
                  >
                    <div className="p-4">
                      {renderExpandedRow(record)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default ProfessionalEnhancedDataTable;
export type { 
  ProfessionalEnhancedTableProps, 
  FilterOption, 
  ColumnFilter, 
  BulkAction, 
  ExportOption 
};