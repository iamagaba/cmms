/**
 * Enhanced Professional Data Table Component
 * 
 * A comprehensive data table component designed for the GOGO CMMS Professional Design System.
 * This component extends the existing data table functionality with maintenance workflow features,
 * advanced filtering, bulk operations, responsive design patterns, and accessibility compliance.
 * 
 * Features:
 * - Professional industrial styling with design tokens
 * - Advanced filtering with multiple filter types
 * - Bulk operations with confirmation dialogs
 * - Export functionality (CSV, Excel, PDF)
 * - Responsive design with mobile-friendly patterns
 * - Loading states and skeleton patterns
 * - Accessibility compliance (WCAG 2.1 AA)
 * - Keyboard navigation support
 * - Touch-friendly interactions for mobile
 * - Maintenance-specific status indicators
 * - Professional color coding and typography
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { designTokens } from '@/theme/professional-design-tokens';
import DataTableFilterBar from './DataTableFilterBar';
import DataTableBulkActions from './DataTableBulkActions';
import DataTableExportMenu from './DataTableExportMenu';
import DataTableMobile from './DataTableMobile';

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
  width?: string | number;
  minWidth?: string | number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  className?: string;
  responsive?: boolean;
  priority?: 'high' | 'medium' | 'low'; // For responsive column hiding
}

export interface FilterOption {
  label: string;
  value: string | number;
  count?: number;
  color?: string;
}

export interface ColumnFilter {
  key: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'text' | 'boolean';
  label: string;
  options?: FilterOption[];
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface BulkAction {
  key: string;
  label: string;
  icon: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  disabled?: (selectedRows: any[]) => boolean;
  shortcut?: string;
}

export interface ExportOption {
  key: string;
  label: string;
  icon: string;
  format: 'csv' | 'excel' | 'pdf' | 'json';
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface EnhancedDataTableProps<T = any> {
  // Core table props
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  error?: string;
  
  // Row configuration
  rowKey?: keyof T | ((record: T) => string);
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedKeys: string[]) => void;
  onRowClick?: (record: T, index: number) => void;
  
  // Pagination
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    pageSizeOptions?: number[];
    onChange: (page: number, pageSize: number) => void;
  };
  
  // Search and filtering
  searchable?: boolean;
  globalSearch?: boolean;
  searchColumns?: string[];
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  filters?: ColumnFilter[];
  activeFilters?: Record<string, any>;
  onFiltersChange?: (filters: Record<string, any>) => void;
  
  // Bulk operations
  bulkActions?: BulkAction[];
  onBulkAction?: (action: string, selectedRows: T[]) => void;
  
  // Export functionality
  exportOptions?: ExportOption[];
  onExport?: (format: string, data: T[]) => void;
  
  // Layout and appearance
  size?: 'compact' | 'comfortable' | 'spacious';
  striped?: boolean;
  bordered?: boolean;
  stickyHeader?: boolean;
  maxHeight?: string | number;
  
  // Responsive behavior
  responsive?: boolean;
  mobileBreakpoint?: number;
  mobileColumns?: string[];
  
  // Advanced features
  expandableRows?: boolean;
  renderExpandedRow?: (record: T) => React.ReactNode;
  groupBy?: string;
  virtualScrolling?: boolean;
  
  // Empty states
  emptyText?: string;
  emptyIcon?: string;
  emptyAction?: React.ReactNode;
  
  // Accessibility
  ariaLabel?: string;
  ariaDescription?: string;
  
  // Styling
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  
  // Callbacks
  onSort?: (sortConfig: SortConfig | null) => void;
  onColumnResize?: (columnKey: string, width: number) => void;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

const getSizeClasses = (size: 'compact' | 'comfortable' | 'spacious') => {
  const sizeMap = {
    compact: {
      padding: 'px-3 py-2',
      text: 'text-sm',
      height: 'h-10',
    },
    comfortable: {
      padding: 'px-4 py-3',
      text: 'text-sm',
      height: 'h-12',
    },
    spacious: {
      padding: 'px-6 py-4',
      text: 'text-base',
      height: 'h-14',
    },
  };
  
  return sizeMap[size];
};

const getResponsiveColumnPriority = (column: TableColumn): number => {
  const priorityMap = {
    high: 1,
    medium: 2,
    low: 3,
  };
  
  return priorityMap[column.priority || 'medium'];
};

// ============================================
// LOADING SKELETON COMPONENT
// ============================================

interface TableSkeletonProps {
  columns: number;
  rows?: number;
  size: 'compact' | 'comfortable' | 'spacious';
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ columns, rows = 5, size }) => {
  const sizeClasses = getSizeClasses(size);
  
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="bg-machinery-50 border-b border-machinery-200">
        <div className={cn('flex gap-4', sizeClasses.padding)}>
          {Array.from({ length: columns }).map((_, i) => (
            <div 
              key={i} 
              className="h-4 bg-machinery-200 rounded flex-1"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
      
      {/* Rows skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="border-b border-machinery-100">
          <div className={cn('flex gap-4', sizeClasses.padding)}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div 
                key={colIndex} 
                className="h-4 bg-machinery-200 rounded flex-1"
                style={{ 
                  animationDelay: `${(rowIndex * columns + colIndex) * 50}ms` 
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================
// EMPTY STATE COMPONENT
// ============================================

interface EmptyStateProps {
  icon?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "tabler:database-off",
  title = "No data available",
  description = "There are no items to display at the moment.",
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="w-16 h-16 bg-machinery-100 rounded-full flex items-center justify-center mb-6">
      <Icon icon={icon} className="w-8 h-8 text-machinery-400" />
    </div>
    <h3 className="text-lg font-semibold text-machinery-700 mb-2">{title}</h3>
    <p className="text-machinery-500 text-center max-w-md mb-6">{description}</p>
    {action}
  </div>
);

// ============================================
// ERROR STATE COMPONENT
// ============================================

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mb-6">
      <Icon icon="tabler:alert-circle" className="w-8 h-8 text-warning-500" />
    </div>
    <h3 className="text-lg font-semibold text-machinery-700 mb-2">Error Loading Data</h3>
    <p className="text-machinery-500 text-center max-w-md mb-6">{error}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-steel-600 text-white rounded-md hover:bg-steel-700 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

// ============================================
// TABLE HEADER COMPONENT
// ============================================

interface TableHeaderProps<T> {
  columns: TableColumn<T>[];
  sortConfig: SortConfig | null;
  onSort: (key: string) => void;
  selectable: boolean;
  allSelected: boolean;
  indeterminate: boolean;
  onSelectAll: () => void;
  size: 'compact' | 'comfortable' | 'spacious';
  stickyHeader: boolean;
}

const TableHeader = <T,>({
  columns,
  sortConfig,
  onSort,
  selectable,
  allSelected,
  indeterminate,
  onSelectAll,
  size,
  stickyHeader,
}: TableHeaderProps<T>) => {
  const sizeClasses = getSizeClasses(size);

  return (
    <thead 
      className={cn(
        'bg-machinery-50/85 backdrop-blur-md backdrop-saturate-150 border-b border-machinery-200',
        stickyHeader && 'sticky top-0 z-10'
      )}
    >
      <tr>
        {selectable && (
          <th className={cn('w-12', sizeClasses.padding)}>
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) input.indeterminate = indeterminate;
              }}
              onChange={onSelectAll}
              className="w-4 h-4 text-steel-600 border-machinery-300 rounded focus:ring-steel-500 focus:ring-2"
              aria-label="Select all rows"
            />
          </th>
        )}
        {columns.map((column) => (
          <th
            key={column.key}
            className={cn(
              'font-semibold text-machinery-700 text-left border-b border-machinery-200',
              sizeClasses.padding,
              sizeClasses.text,
              column.align === 'center' && 'text-center',
              column.align === 'right' && 'text-right',
              column.className
            )}
            style={{ 
              width: column.width,
              minWidth: column.minWidth,
            }}
          >
            {column.sortable ? (
              <button
                onClick={() => onSort(column.key)}
                className="flex items-center gap-2 hover:text-steel-600 transition-colors focus:outline-none focus:ring-2 focus:ring-steel-500 focus:ring-offset-1 rounded"
                aria-label={`Sort by ${column.title}`}
              >
                <span>{column.title}</span>
                <div className="flex flex-col">
                  <Icon
                    icon="tabler:chevron-up"
                    className={cn(
                      'w-3 h-3 -mb-1 transition-colors',
                      sortConfig?.key === column.key && sortConfig.direction === 'asc'
                        ? 'text-steel-600'
                        : 'text-machinery-400'
                    )}
                  />
                  <Icon
                    icon="tabler:chevron-down"
                    className={cn(
                      'w-3 h-3 transition-colors',
                      sortConfig?.key === column.key && sortConfig.direction === 'desc'
                        ? 'text-steel-600'
                        : 'text-machinery-400'
                    )}
                  />
                </div>
              </button>
            ) : (
              column.title
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
};

// ============================================
// TABLE ROW COMPONENT
// ============================================

interface TableRowProps<T> {
  record: T;
  index: number;
  columns: TableColumn<T>[];
  rowKey: string;
  selected: boolean;
  onSelect: () => void;
  onClick?: () => void;
  selectable: boolean;
  size: 'compact' | 'comfortable' | 'spacious';
  striped: boolean;
  expandable?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

const TableRow = <T,>({
  record,
  index,
  columns,
  rowKey,
  selected,
  onSelect,
  onClick,
  selectable,
  size,
  striped,
  expandable,
  expanded,
  onToggleExpand,
}: TableRowProps<T>) => {
  const sizeClasses = getSizeClasses(size);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className={cn(
        'border-b border-machinery-100 transition-colors group',
        'hover:bg-steel-50 focus-within:bg-steel-50',
        selected && 'bg-steel-100 hover:bg-steel-150',
        striped && index % 2 === 1 && 'bg-machinery-25',
        onClick && 'cursor-pointer',
        'focus-within:ring-2 focus-within:ring-steel-500 focus-within:ring-inset'
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {selectable && (
        <td className={cn('w-12', sizeClasses.padding)}>
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 text-steel-600 border-machinery-300 rounded focus:ring-steel-500 focus:ring-2"
            aria-label={`Select row ${index + 1}`}
          />
        </td>
      )}
      {expandable && (
        <td className={cn('w-10', sizeClasses.padding)}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand?.();
            }}
            className="p-1 hover:bg-machinery-100 rounded focus:outline-none focus:ring-2 focus:ring-steel-500"
            aria-label={expanded ? "Collapse row" : "Expand row"}
          >
            <Icon
              icon={expanded ? "tabler:chevron-down" : "tabler:chevron-right"}
              className="w-4 h-4 text-machinery-500 transition-transform"
            />
          </button>
        </td>
      )}
      {columns.map((column) => {
        const value = column.dataIndex ? record[column.dataIndex] : undefined;
        const content = column.render ? column.render(value, record, index) : value;

        return (
          <td
            key={column.key}
            className={cn(
              'text-machinery-700',
              sizeClasses.padding,
              sizeClasses.text,
              column.align === 'center' && 'text-center',
              column.align === 'right' && 'text-right',
              column.className
            )}
          >
            {content}
          </td>
        );
      })}
    </motion.tr>
  );
};

// ============================================
// MAIN ENHANCED DATA TABLE COMPONENT
// ============================================

const EnhancedProfessionalDataTable = <T extends Record<string, any>>({
  // Core props
  columns,
  data,
  loading = false,
  error,
  
  // Row configuration
  rowKey = 'id',
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  
  // Pagination
  pagination,
  
  // Search and filtering
  searchable = false,
  globalSearch = true,
  searchColumns = [],
  searchPlaceholder = 'Search...',
  onSearch,
  filters = [],
  activeFilters = {},
  onFiltersChange,
  
  // Bulk operations
  bulkActions = [],
  onBulkAction,
  
  // Export
  exportOptions = [],
  onExport,
  
  // Layout
  size = 'comfortable',
  striped = false,
  bordered = true,
  stickyHeader = false,
  maxHeight,
  
  // Responsive
  responsive = true,
  mobileBreakpoint = 768,
  
  // Advanced features
  expandableRows = false,
  renderExpandedRow,
  
  // Empty states
  emptyText = 'No data available',
  emptyIcon = 'tabler:database-off',
  emptyAction,
  
  // Accessibility
  ariaLabel = 'Data table',
  ariaDescription = 'A table displaying data with filtering, sorting, and selection capabilities',
  
  // Styling
  className,
  tableClassName,
  headerClassName,
  bodyClassName,
  
  // Callbacks
  onSort,
}: EnhancedDataTableProps<T>) => {
  // State management
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  
  // Refs
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Get row key function
  const getRowKey = useCallback((record: T): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey]);
  }, [rowKey]);

  // Handle responsive behavior
  useEffect(() => {
    if (!responsive) return;
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [responsive, mobileBreakpoint]);

  // Handle sorting
  const handleSort = useCallback((key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    const newSortConfig = { key, direction };
    setSortConfig(newSortConfig);
    onSort?.(newSortConfig);
  }, [sortConfig, onSort]);

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  }, [onSearch]);

  // Handle selection
  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;
    
    const allKeys = data.map(getRowKey);
    const isAllSelected = allKeys.every(key => selectedRows.includes(key));
    
    if (isAllSelected) {
      onSelectionChange(selectedRows.filter(key => !allKeys.includes(key)));
    } else {
      onSelectionChange([...new Set([...selectedRows, ...allKeys])]);
    }
  }, [data, selectedRows, onSelectionChange, getRowKey]);

  const handleSelectRow = useCallback((record: T) => {
    if (!onSelectionChange) return;
    
    const key = getRowKey(record);
    const isSelected = selectedRows.includes(key);
    
    if (isSelected) {
      onSelectionChange(selectedRows.filter(k => k !== key));
    } else {
      onSelectionChange([...selectedRows, key]);
    }
  }, [selectedRows, onSelectionChange, getRowKey]);

  // Selection state calculations
  const allSelected = data.length > 0 && data.every(record => 
    selectedRows.includes(getRowKey(record))
  );
  const indeterminate = selectedRows.length > 0 && !allSelected;

  // Handle row expansion
  const handleToggleExpand = useCallback((record: T) => {
    const key = getRowKey(record);
    const newExpanded = new Set(expandedRows);
    
    if (expandedRows.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    
    setExpandedRows(newExpanded);
  }, [expandedRows, getRowKey]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!tableRef.current?.contains(document.activeElement)) return;
      
      switch (event.key) {
        case 'Escape':
          if (selectedRows.length > 0) {
            onSelectionChange?.([]);
          }
          break;
        case 'a':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const allKeys = data.map(getRowKey);
            onSelectionChange?.(allKeys);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedRows, data, onSelectionChange, getRowKey]);

  // Render error state
  if (error) {
    return (
      <div className={cn('bg-white rounded-lg shadow-sm overflow-hidden', className)}>
        <ErrorState error={error} />
      </div>
    );
  }

  // Render loading state
  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow-sm overflow-hidden', className)}>
        <TableSkeleton columns={columns.length + (selectable ? 1 : 0)} size={size} />
      </div>
    );
  }

  // Check if mobile view should be used
  if (isMobile) {
    return (
      <div 
        ref={tableRef}
        className={cn('bg-white rounded-lg shadow-sm overflow-hidden', className)}
        role="region"
        aria-label={ariaLabel}
        aria-description={ariaDescription}
      >
        {/* Filters */}
        {filters.length > 0 && (
          <DataTableFilterBar
            filters={filters}
            activeFilters={activeFilters}
            onFiltersChange={onFiltersChange || (() => {})}
            onClearFilters={() => onFiltersChange?.({})}
          />
        )}

        {/* Bulk Actions */}
        <AnimatePresence>
          {bulkActions.length > 0 && selectedRows.length > 0 && (
            <DataTableBulkActions
              selectedCount={selectedRows.length}
              totalCount={data.length}
              bulkActions={bulkActions}
              selectedRows={data.filter(item => 
                selectedRows.includes(getRowKey(item))
              )}
              onBulkAction={(action, rows) => onBulkAction?.(action, rows)}
              onClearSelection={() => onSelectionChange?.([])}
            />
          )}
        </AnimatePresence>

        {/* Search and Export Bar */}
        {(searchable || exportOptions.length > 0) && (
          <div className="flex flex-col gap-3 p-4 border-b border-machinery-200">
            {searchable && (
              <div className="relative">
                <Icon 
                  icon="tabler:search" 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-machinery-400" 
                />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  className={cn(
                    'w-full pl-10 pr-4 py-3 text-base border border-machinery-300 rounded-md',
                    'focus:ring-2 focus:ring-steel-500 focus:border-steel-500',
                    'placeholder:text-machinery-400'
                  )}
                />
              </div>
            )}
            
            {exportOptions.length > 0 && (
              <div className="flex justify-end">
                <DataTableExportMenu
                  exportOptions={exportOptions}
                  data={data}
                  selectedData={data.filter(item => 
                    selectedRows.includes(getRowKey(item))
                  )}
                  onExport={(format, exportData) => onExport?.(format, exportData)}
                />
              </div>
            )}
          </div>
        )}

        {/* Mobile Table */}
        <DataTableMobile
          data={data}
          columns={columns}
          selectedRows={selectedRows}
          onSelectionChange={onSelectionChange}
          onRowClick={onRowClick}
          loading={loading}
          emptyText={emptyText}
          emptyIcon={emptyIcon}
          emptyAction={emptyAction}
          rowKey={rowKey}
          expandableRows={expandableRows}
          renderExpandedRow={renderExpandedRow}
        />
      </div>
    );
  }

  return (
    <div 
      ref={tableRef}
      className={cn('bg-white rounded-lg shadow-sm overflow-hidden', className)}
      role="region"
      aria-label={ariaLabel}
      aria-description={ariaDescription}
    >
      {/* Filters */}
      {filters.length > 0 && (
        <DataTableFilterBar
          filters={filters}
          activeFilters={activeFilters}
          onFiltersChange={onFiltersChange || (() => {})}
          onClearFilters={() => onFiltersChange?.({})}
        />
      )}

      {/* Bulk Actions */}
      <AnimatePresence>
        {bulkActions.length > 0 && selectedRows.length > 0 && (
          <DataTableBulkActions
            selectedCount={selectedRows.length}
            totalCount={data.length}
            bulkActions={bulkActions}
            selectedRows={data.filter(item => 
              selectedRows.includes(getRowKey(item))
            )}
            onBulkAction={(action, rows) => onBulkAction?.(action, rows)}
            onClearSelection={() => onSelectionChange?.([])}
          />
        )}
      </AnimatePresence>

      {/* Search and Export Bar */}
      {(searchable || exportOptions.length > 0) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-b border-machinery-200">
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <Icon 
                icon="tabler:search" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-machinery-400" 
              />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className={cn(
                  'w-full pl-10 pr-4 py-2 text-sm border border-machinery-300 rounded-md',
                  'focus:ring-2 focus:ring-steel-500 focus:border-steel-500',
                  'placeholder:text-machinery-400'
                )}
              />
            </div>
          )}
          
          {exportOptions.length > 0 && (
            <DataTableExportMenu
              exportOptions={exportOptions}
              data={data}
              selectedData={data.filter(item => 
                selectedRows.includes(getRowKey(item))
              )}
              onExport={(format, exportData) => onExport?.(format, exportData)}
            />
          )}
        </div>
      )}

      {/* Desktop Table Container */}
      <div 
        className={cn(
          'overflow-x-auto',
          maxHeight && 'overflow-y-auto'
        )}
        style={{ maxHeight }}
      >
        <table 
          className={cn(
            'w-full',
            bordered && 'border-collapse',
            tableClassName
          )}
        >
          <TableHeader
            columns={columns}
            sortConfig={sortConfig}
            onSort={handleSort}
            selectable={selectable}
            allSelected={allSelected}
            indeterminate={indeterminate}
            onSelectAll={handleSelectAll}
            size={size}
            stickyHeader={stickyHeader}
          />
          <tbody className={bodyClassName}>
            <AnimatePresence>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0) + (expandableRows ? 1 : 0)}
                    className="p-0"
                  >
                    <EmptyState
                      icon={emptyIcon}
                      title={emptyText}
                      action={emptyAction}
                    />
                  </td>
                </tr>
              ) : (
                data.map((record, index) => {
                  const key = getRowKey(record);
                  const isExpanded = expandedRows.has(key);
                  
                  return (
                    <React.Fragment key={key}>
                      <TableRow
                        record={record}
                        index={index}
                        columns={columns}
                        rowKey={key}
                        selected={selectedRows.includes(key)}
                        onSelect={() => handleSelectRow(record)}
                        onClick={onRowClick ? () => onRowClick(record, index) : undefined}
                        selectable={selectable}
                        size={size}
                        striped={striped}
                        expandable={expandableRows}
                        expanded={isExpanded}
                        onToggleExpand={() => handleToggleExpand(record)}
                      />
                      {expandableRows && isExpanded && renderExpandedRow && (
                        <tr>
                          <td
                            colSpan={columns.length + (selectable ? 1 : 0) + 1}
                            className="p-0 bg-machinery-25"
                          >
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4">
                                {renderExpandedRow(record)}
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default EnhancedProfessionalDataTable;
export type { 
  EnhancedDataTableProps,
  TableColumn,
  FilterOption,
  ColumnFilter,
  BulkAction,
  ExportOption,
  SortConfig,
};