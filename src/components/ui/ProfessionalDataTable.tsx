/**
 * Professional CMMS Data Table Component
 * 
 * A comprehensive data table designed for maintenance management workflows.
 * Features sorting, filtering, selection, pagination, and responsive design
 * with professional industrial styling.
 */

import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  ArrowUp01Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Search01Icon,
  DatabaseOffIcon
} from '@hugeicons/core-free-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ProfessionalButton from './ProfessionalButton';
import ProfessionalInput from './ProfessionalInput';
import { WorkOrderStatusBadge, PriorityBadge } from './ProfessionalBadge';

// ============================================
// COMPONENT INTERFACES
// ============================================

export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  className?: string;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  rowKey?: keyof T | ((record: T) => string);
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedKeys: string[]) => void;
  onRowClick?: (record: T, index: number) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  emptyText?: string;
  className?: string;
  size?: 'sm' | 'base' | 'lg';
  striped?: boolean;
  bordered?: boolean;
  // Enhancement #10: Density options
  density?: 'compact' | 'comfortable' | 'spacious';
}

// ============================================
// TABLE HEADER COMPONENT
// ============================================

interface TableHeaderProps<T> {
  columns: TableColumn<T>[];
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  onSort: (key: string) => void;
  selectable: boolean;
  allSelected: boolean;
  onSelectAll: () => void;
  size: 'sm' | 'base' | 'lg';
  density: 'compact' | 'comfortable' | 'spacious';
}

const TableHeader = <T,>({
  columns,
  sortConfig,
  onSort,
  selectable,
  allSelected,
  onSelectAll,
  size,
  density,
}: TableHeaderProps<T>) => {
  // Enhancement #10: Density-based sizing
  const densityClasses = {
    compact: 'px-3 py-1.5 text-xs',
    comfortable: 'px-4 py-3 text-sm',
    spacious: 'px-6 py-4 text-base',
  };

  const sizeClasses = densityClasses[density];

  return (
    <thead className="bg-machinery-50 border-b border-machinery-200">
      <tr>
        {selectable && (
          <th className={cn('w-12', sizeClasses)}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onSelectAll}
              className="w-4 h-4 text-steel-600 border-machinery-300 rounded focus:ring-steel-500"
            />
          </th>
        )}
        {columns.map((column) => (
          <th
            key={column.key}
            className={cn(
              'font-semibold text-machinery-700 text-left',
              'border-b border-machinery-200',
              sizeClasses,
              column.align === 'center' && 'text-center',
              column.align === 'right' && 'text-right',
              column.className
            )}
            style={{ width: column.width }}
          >
            {column.sortable ? (
              <button
                onClick={() => onSort(column.key)}
                className="flex items-center gap-2 hover:text-steel-600 transition-colors"
              >
                <span>{column.title}</span>
                <div className="flex flex-col">
                  <HugeiconsIcon
                    icon={ArrowUp01Icon}
                    size={12}
                    className={cn(
                      'w-3 h-3 -mb-1',
                      sortConfig?.key === column.key && sortConfig.direction === 'asc'
                        ? 'text-steel-600'
                        : 'text-machinery-400'
                    )}
                  />
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    size={12}
                    className={cn(
                      'w-3 h-3',
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
  size: 'sm' | 'base' | 'lg';
  striped: boolean;
  density: 'compact' | 'comfortable' | 'spacious';
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
  density,
}: TableRowProps<T>) => {
  // Enhancement #10: Density-based sizing
  const densityClasses = {
    compact: 'px-3 py-1.5 text-xs',
    comfortable: 'px-4 py-3 text-sm',
    spacious: 'px-6 py-4 text-base',
  };

  const sizeClasses = densityClasses[density];

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className={cn(
        'group border-b border-machinery-100',
        'transition-all duration-200 ease-out',
        // Enhancement #2: Smooth hover with gradient and scale
        'hover:bg-gradient-to-r hover:from-steel-50 hover:to-transparent',
        'hover:shadow-sm hover:scale-[1.002]',
        onClick && 'cursor-pointer',
        selected && 'bg-steel-100 shadow-sm',
        // Enhancement #6: Zebra striping with subtle opacity
        striped && index % 2 === 1 && 'bg-machinery-25/30'
      )}
      onClick={onClick}
    >
      {selectable && (
        <td className={cn('w-12', sizeClasses)}>
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'w-4 h-4 rounded border-2 transition-all',
              'border-machinery-300 text-steel-600',
              'focus:ring-2 focus:ring-steel-500 focus:ring-offset-2',
              'checked:bg-steel-600 checked:border-steel-600',
              'hover:border-steel-400'
            )}
          />
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
              sizeClasses,
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
// PAGINATION COMPONENT
// ============================================

interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
}

const TablePagination: React.FC<PaginationProps> = ({
  current,
  pageSize,
  total,
  onChange,
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (current - 1) * pageSize + 1;
  const endItem = Math.min(current * pageSize, total);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(totalPages - 1, current + delta);
      i++
    ) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-machinery-200">
      <div className="flex items-center text-sm text-machinery-500">
        Showing {startItem} to {endItem} of {total} results
      </div>
      
      <div className="flex items-center gap-2">
        <ProfessionalButton
          variant="outline"
          size="sm"
          icon={ArrowLeft01Icon}
          disabled={current === 1}
          onClick={() => onChange(current - 1, pageSize)}
        >
          Previous
        </ProfessionalButton>

        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-2 py-1 text-machinery-400">...</span>
              ) : (
                <button
                  onClick={() => onChange(page as number, pageSize)}
                  className={cn(
                    'px-3 py-1 text-sm rounded-md transition-colors',
                    page === current
                      ? 'bg-steel-600 text-white'
                      : 'text-machinery-600 hover:bg-machinery-100'
                  )}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <ProfessionalButton
          variant="outline"
          size="sm"
          iconRight={ArrowRight01Icon}
          disabled={current === totalPages}
          onClick={() => onChange(current + 1, pageSize)}
        >
          Next
        </ProfessionalButton>
      </div>
    </div>
  );
};

// ============================================
// MAIN DATA TABLE COMPONENT
// ============================================

const ProfessionalDataTable = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  rowKey = 'id',
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  pagination,
  searchable = false,
  searchPlaceholder = 'Search...',
  onSearch,
  emptyText = 'No data available',
  className,
  size = 'base',
  striped = false,
  bordered = true,
  density = 'comfortable', // Enhancement #10: Default density
}: TableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchValue, setSearchValue] = useState('');

  // Get row key function
  const getRowKey = (record: T): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey]);
  };

  // Handle sorting
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const column = columns.find(col => col.key === sortConfig.key);
      if (!column?.dataIndex) return 0;

      const aValue = a[column.dataIndex];
      const bValue = b[column.dataIndex];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig, columns]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  // Handle selection
  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    
    const allKeys = sortedData.map(getRowKey);
    const isAllSelected = allKeys.every(key => selectedRows.includes(key));
    
    if (isAllSelected) {
      onSelectionChange(selectedRows.filter(key => !allKeys.includes(key)));
    } else {
      onSelectionChange([...new Set([...selectedRows, ...allKeys])]);
    }
  };

  const handleSelectRow = (record: T) => {
    if (!onSelectionChange) return;
    
    const key = getRowKey(record);
    const isSelected = selectedRows.includes(key);
    
    if (isSelected) {
      onSelectionChange(selectedRows.filter(k => k !== key));
    } else {
      onSelectionChange([...selectedRows, key]);
    }
  };

  const allSelected = sortedData.length > 0 && sortedData.every(record => 
    selectedRows.includes(getRowKey(record))
  );

  return (
    <div className={cn(
      // Enhancement #1: Visual hierarchy with depth
      'bg-white rounded-lg overflow-hidden',
      'shadow-md border border-machinery-200',
      'ring-1 ring-black/5',
      className
    )}>
      {/* Search Bar */}
      {searchable && (
        <div className="p-4 border-b border-machinery-200 bg-machinery-25/50">
          <ProfessionalInput
            icon={Search01Icon}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-md"
          />
        </div>
      )}

      {/* Table - Enhancement #1: Add subtle inner shadow for depth */}
      <div className="overflow-x-auto shadow-inner-sm">
        <table className="w-full">
          <TableHeader
            columns={columns}
            sortConfig={sortConfig}
            onSort={handleSort}
            selectable={selectable}
            allSelected={allSelected}
            onSelectAll={handleSelectAll}
            size={size}
            density={density}
          />
          <tbody>
            <AnimatePresence>
              {loading ? (
                // Enhancement #9: Loading skeleton with shimmer
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`loading-${index}`} className="border-b border-machinery-100">
                    {selectable && (
                      <td className={cn(
                        'w-12',
                        density === 'compact' ? 'px-3 py-1.5' : 
                        density === 'comfortable' ? 'px-4 py-3' : 
                        'px-6 py-4'
                      )}>
                        <div className="w-4 h-4 bg-machinery-200 rounded animate-pulse" />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td 
                        key={column.key} 
                        className={cn(
                          density === 'compact' ? 'px-3 py-1.5' : 
                          density === 'comfortable' ? 'px-4 py-3' : 
                          'px-6 py-4'
                        )}
                      >
                        <div 
                          className={cn(
                            'h-4 rounded',
                            'bg-gradient-to-r from-machinery-200 via-machinery-100 to-machinery-200',
                            'bg-[length:1000px_100%]',
                            'animate-shimmer'
                          )}
                          style={{ 
                            animationDelay: `${(index * columns.length + columns.indexOf(column)) * 50}ms` 
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sortedData.length === 0 ? (
                // Empty state
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="px-4 py-12 text-center text-machinery-500"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <HugeiconsIcon icon={DatabaseOffIcon} size={48} className="text-machinery-300" />
                      <span>{emptyText}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                // Data rows
                sortedData.map((record, index) => {
                  const key = getRowKey(record);
                  return (
                    <TableRow
                      key={key}
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
                      density={density}
                    />
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && <TablePagination {...pagination} />}
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default ProfessionalDataTable;
export type { TableColumn, TableProps };