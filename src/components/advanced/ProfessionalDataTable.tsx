/**
 * Professional CMMS Data Table System
 * 
 * A comprehensive data table component optimized for desktop CMMS workflows.
 * Features advanced filtering, sorting, bulk operations, export functionality,
 * and professional industrial styling designed for maintenance management.
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ProfessionalButton from '@/components/ui/ProfessionalButton';
import ProfessionalInput from '@/components/ui/ProfessionalInput';
import { ProfessionalPagination } from '@/components/layout/ProfessionalNavigation';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'number' | 'boolean';
  filterOptions?: Array<{ label: string; value: any }>;
  width?: string | number;
  minWidth?: string | number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  className?: string;
  responsive?: 'always' | 'desktop' | 'tablet' | 'mobile';
  priority?: 'high' | 'medium' | 'low';
}

export interface FilterConfig {
  key: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean' | 'range';
  label: string;
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
}

export interface BulkAction<T = any> {
  key: string;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  confirmMessage?: string;
  action: (selectedRows: T[]) => void | Promise<void>;
}

export interface ExportOption {
  key: string;
  label: string;
  icon?: string;
  format: 'csv' | 'excel' | 'pdf' | 'json';
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface ProfessionalDataTableProps<T = any> {
  /**
   * Table data
   */
  data: T[];
  
  /**
   * Table columns configuration
   */
  columns: TableColumn<T>[];
  
  /**
   * Loading state
   */
  loading?: boolean;
  
  /**
   * Row selection configuration
   */
  rowSelection?: {
    type?: 'checkbox' | 'radio';
    selectedRowKeys?: React.Key[];
    onChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
    getCheckboxProps?: (record: T) => { disabled?: boolean };
  };
  
  /**
   * Pagination configuration
   */
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    pageSizeOptions?: number[];
    onChange: (page: number, pageSize: number) => void;
  };
  
  /**
   * Sorting configuration
   */
  sorting?: {
    sortConfig?: SortConfig;
    onSort?: (sortConfig: SortConfig | null) => void;
  };
  
  /**
   * Filtering configuration
   */
  filtering?: {
    filters?: FilterConfig[];
    onFilter?: (filters: Record<string, any>) => void;
  };
  
  /**
   * Bulk actions
   */
  bulkActions?: BulkAction<T>[];
  
  /**
   * Export options
   */
  exportOptions?: ExportOption[];
  
  /**
   * Table title
   */
  title?: string;
  
  /**
   * Table description
   */
  description?: string;
  
  /**
   * Empty state configuration
   */
  emptyState?: {
    title?: string;
    description?: string;
    icon?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  
  /**
   * Row click handler
   */
  onRowClick?: (record: T, index: number) => void;
  
  /**
   * Row key extractor
   */
  rowKey?: string | ((record: T) => React.Key);
  
  /**
   * Table size
   */
  size?: 'sm' | 'base' | 'lg';
  
  /**
   * Sticky header
   */
  stickyHeader?: boolean;
  
  /**
   * Custom className
   */
  className?: string;
}

// ============================================
// FILTER COMPONENT
// ============================================

interface TableFilterProps {
  filters: FilterConfig[];
  onFilter: (filters: Record<string, any>) => void;
  className?: string;
}

const TableFilter: React.FC<TableFilterProps> = ({ filters, onFilter, className }) => {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = useCallback((key: string, value: any) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    onFilter(newFilters);
  }, [filterValues, onFilter]);

  const clearFilters = useCallback(() => {
    setFilterValues({});
    onFilter({});
  }, [onFilter]);

  const hasActiveFilters = Object.values(filterValues).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  return (
    <div className={cn('bg-white border border-machinery-200 rounded-lg', className)}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-machinery-200">
        <div className="flex items-center gap-2">
          <Icon icon="tabler:filter" className="w-5 h-5 text-machinery-500" />
          <span className="font-medium text-machinery-900">Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-steel-100 text-steel-700 text-xs rounded-full">
              {Object.values(filterValues).filter(v => v !== undefined && v !== null && v !== '').length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <ProfessionalButton
              variant="ghost"
              size="sm"
              onClick={clearFilters}
            >
              Clear All
            </ProfessionalButton>
          )}
          <ProfessionalButton
            variant="ghost"
            size="sm"
            icon={isExpanded ? 'tabler:chevron-up' : 'tabler:chevron-down'}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </ProfessionalButton>
        </div>
      </div>

      {/* Filter Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.map((filter) => (
                <div key={filter.key}>
                  {filter.type === 'select' ? (
                    <ProfessionalInput
                      label={filter.label}
                      value={filterValues[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      placeholder={filter.placeholder}
                    />
                  ) : (
                    <ProfessionalInput
                      label={filter.label}
                      type={filter.type === 'number' ? 'number' : filter.type === 'date' ? 'date' : 'text'}
                      value={filterValues[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      placeholder={filter.placeholder}
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
// BULK ACTIONS COMPONENT
// ============================================

interface BulkActionsBarProps<T> {
  selectedCount: number;
  totalCount: number;
  actions: BulkAction<T>[];
  selectedRows: T[];
  onClearSelection: () => void;
  className?: string;
}

const BulkActionsBar = <T,>({
  selectedCount,
  totalCount,
  actions,
  selectedRows,
  onClearSelection,
  className,
}: BulkActionsBarProps<T>) => {
  const [confirmAction, setConfirmAction] = useState<BulkAction<T> | null>(null);

  const handleAction = useCallback(async (action: BulkAction<T>) => {
    if (action.confirmMessage) {
      setConfirmAction(action);
    } else {
      await action.action(selectedRows);
      onClearSelection();
    }
  }, [selectedRows, onClearSelection]);

  const confirmAndExecute = useCallback(async () => {
    if (confirmAction) {
      await confirmAction.action(selectedRows);
      setConfirmAction(null);
      onClearSelection();
    }
  }, [confirmAction, selectedRows, onClearSelection]);

  return (
    <>
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'bg-steel-50 border border-steel-200 rounded-lg p-4 mb-4',
              className
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-steel-900">
                  {selectedCount} of {totalCount} items selected
                </span>
                <ProfessionalButton
                  variant="ghost"
                  size="sm"
                  onClick={onClearSelection}
                >
                  Clear Selection
                </ProfessionalButton>
              </div>
              <div className="flex items-center gap-2">
                {actions.map((action) => (
                  <ProfessionalButton
                    key={action.key}
                    variant={action.variant || 'secondary'}
                    size="sm"
                    icon={action.icon}
                    onClick={() => handleAction(action)}
                  >
                    {action.label}
                  </ProfessionalButton>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md backdrop-saturate-150">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-machinery-900 mb-2">
              Confirm Action
            </h3>
            <p className="text-machinery-600 mb-6">
              {confirmAction.confirmMessage}
            </p>
            <div className="flex justify-end gap-3">
              <ProfessionalButton
                variant="secondary"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </ProfessionalButton>
              <ProfessionalButton
                variant={confirmAction.variant || 'primary'}
                onClick={confirmAndExecute}
              >
                Confirm
              </ProfessionalButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ============================================
// EMPTY STATE COMPONENT
// ============================================

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data available',
  description = 'There are no items to display at the moment.',
  icon = 'tabler:database-off',
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-machinery-100 rounded-full flex items-center justify-center mb-4">
        <Icon icon={icon} className="w-8 h-8 text-machinery-400" />
      </div>
      <h3 className="text-lg font-semibold text-machinery-900 mb-2">
        {title}
      </h3>
      <p className="text-machinery-600 text-center mb-6 max-w-md">
        {description}
      </p>
      {action && (
        <ProfessionalButton
          variant="primary"
          onClick={action.onClick}
        >
          {action.label}
        </ProfessionalButton>
      )}
    </div>
  );
};

// ============================================
// MAIN DATA TABLE COMPONENT
// ============================================

const ProfessionalDataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  rowSelection,
  pagination,
  sorting,
  filtering,
  bulkActions = [],
  exportOptions = [],
  title,
  description,
  emptyState,
  onRowClick,
  rowKey = 'id',
  size = 'base',
  stickyHeader = false,
  className,
}: ProfessionalDataTableProps<T>) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);

  // Get row key
  const getRowKey = useCallback((record: T, index: number): React.Key => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || index;
  }, [rowKey]);

  // Handle row selection
  const handleRowSelection = useCallback((key: React.Key, checked: boolean) => {
    const newSelectedKeys = checked
      ? [...selectedRowKeys, key]
      : selectedRowKeys.filter(k => k !== key);
    
    setSelectedRowKeys(newSelectedKeys);
    
    if (rowSelection?.onChange) {
      const selectedRows = data.filter((record, index) => 
        newSelectedKeys.includes(getRowKey(record, index))
      );
      rowSelection.onChange(newSelectedKeys, selectedRows);
    }
  }, [selectedRowKeys, data, getRowKey, rowSelection]);

  // Handle select all
  const handleSelectAll = useCallback((checked: boolean) => {
    const newSelectedKeys = checked
      ? data.map((record, index) => getRowKey(record, index))
      : [];
    
    setSelectedRowKeys(newSelectedKeys);
    
    if (rowSelection?.onChange) {
      const selectedRows = checked ? data : [];
      rowSelection.onChange(newSelectedKeys, selectedRows);
    }
  }, [data, getRowKey, rowSelection]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedRowKeys([]);
    if (rowSelection?.onChange) {
      rowSelection.onChange([], []);
    }
  }, [rowSelection]);

  // Get selected rows
  const selectedRows = useMemo(() => {
    return data.filter((record, index) => 
      selectedRowKeys.includes(getRowKey(record, index))
    );
  }, [data, selectedRowKeys, getRowKey]);

  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    base: 'text-sm',
    lg: 'text-base',
  };

  const cellPaddingClasses = {
    sm: 'px-3 py-2',
    base: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  if (loading) {
    return (
      <div className={cn('bg-white border border-machinery-200 rounded-lg', className)}>
        {/* Loading skeleton */}
        <div className="animate-pulse">
          <div className="h-12 bg-machinery-100 rounded-t-lg"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-machinery-50 border-t border-machinery-100"></div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('bg-white border border-machinery-200 rounded-lg', className)}>
        <EmptyState {...emptyState} />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Table Header */}
      {(title || description || filtering?.filters || bulkActions.length > 0) && (
        <div className="space-y-4">
          {/* Title and Description */}
          {(title || description) && (
            <div>
              {title && (
                <h2 className="text-xl font-semibold text-machinery-900 mb-1">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-machinery-600">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Filters */}
          {filtering?.filters && (
            <TableFilter
              filters={filtering.filters}
              onFilter={filtering.onFilter || (() => {})}
            />
          )}

          {/* Bulk Actions */}
          {bulkActions.length > 0 && (
            <BulkActionsBar
              selectedCount={selectedRowKeys.length}
              totalCount={data.length}
              actions={bulkActions}
              selectedRows={selectedRows}
              onClearSelection={clearSelection}
            />
          )}
        </div>
      )}

      {/* Table Container */}
      <div 
        ref={tableRef}
        className="bg-white border border-machinery-200 rounded-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className={cn('w-full', sizeClasses[size])}>
            {/* Table Header */}
            <thead className={cn(
              'bg-machinery-50/85 backdrop-blur-md backdrop-saturate-150 border-b border-machinery-200',
              stickyHeader && 'sticky top-0 z-10'
            )}>
              <tr>
                {/* Selection Column */}
                {rowSelection && (
                  <th className={cn('text-left font-medium text-machinery-700', cellPaddingClasses[size])}>
                    {rowSelection.type !== 'radio' && (
                      <input
                        type="checkbox"
                        checked={selectedRowKeys.length === data.length && data.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-machinery-300 text-steel-600 focus:ring-steel-500"
                      />
                    )}
                  </th>
                )}

                {/* Data Columns */}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'text-left font-medium text-machinery-700',
                      cellPaddingClasses[size],
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.className
                    )}
                    style={{
                      width: column.width,
                      minWidth: column.minWidth,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.title}</span>
                      {column.sortable && sorting && (
                        <button
                          onClick={() => {
                            const currentSort = sorting.sortConfig;
                            const newSort = currentSort?.key === column.key
                              ? currentSort.direction === 'asc'
                                ? { key: column.key, direction: 'desc' as const }
                                : null
                              : { key: column.key, direction: 'asc' as const };
                            
                            sorting.onSort?.(newSort);
                          }}
                          className="text-machinery-400 hover:text-machinery-600"
                        >
                          <Icon 
                            icon={
                              sorting.sortConfig?.key === column.key
                                ? sorting.sortConfig.direction === 'asc'
                                  ? 'tabler:chevron-up'
                                  : 'tabler:chevron-down'
                                : 'tabler:selector'
                            }
                            className="w-4 h-4"
                          />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {data.map((record, index) => {
                const key = getRowKey(record, index);
                const isSelected = selectedRowKeys.includes(key);
                
                return (
                  <tr
                    key={key}
                    className={cn(
                      'border-b border-machinery-100 transition-colors',
                      'hover:bg-machinery-50',
                      isSelected && 'bg-steel-50',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(record, index)}
                  >
                    {/* Selection Column */}
                    {rowSelection && (
                      <td className={cellPaddingClasses[size]}>
                        <input
                          type={rowSelection.type || 'checkbox'}
                          checked={isSelected}
                          onChange={(e) => handleRowSelection(key, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-machinery-300 text-steel-600 focus:ring-steel-500"
                          {...rowSelection.getCheckboxProps?.(record)}
                        />
                      </td>
                    )}

                    {/* Data Columns */}
                    {columns.map((column) => {
                      const value = column.dataIndex ? record[column.dataIndex] : undefined;
                      const content = column.render ? column.render(value, record, index) : value;
                      
                      return (
                        <td
                          key={column.key}
                          className={cn(
                            cellPaddingClasses[size],
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right',
                            column.className
                          )}
                          style={{
                            width: column.width,
                            minWidth: column.minWidth,
                          }}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="border-t border-machinery-200 p-4">
            <ProfessionalPagination
              currentPage={pagination.current}
              totalPages={Math.ceil(pagination.total / pagination.pageSize)}
              onPageChange={(page) => pagination.onChange(page, pagination.pageSize)}
              showPageSize={pagination.showSizeChanger}
              pageSizes={pagination.pageSizeOptions}
              pageSize={pagination.pageSize}
              onPageSizeChange={(size) => pagination.onChange(1, size)}
              totalItems={pagination.total}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default ProfessionalDataTable;
export type {
  ProfessionalDataTableProps,
  TableColumn,
  FilterConfig,
  BulkAction,
  ExportOption,
  SortConfig,
};