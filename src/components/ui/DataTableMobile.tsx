/**
 * Mobile Data Table Component
 * 
 * A mobile-optimized view for the Enhanced Professional Data Table.
 * Provides touch-friendly interactions and responsive card layouts.
 */

import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TableColumn } from './EnhancedDataTable';
import { Button } from '@/components/ui/button';
import Icon from '../icons/Icon';

// ============================================
// INTERFACES
// ============================================

interface MobileTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  selectedRows: string[];
  onSelectionChange?: (keys: string[]) => void;
  onRowClick?: (record: T) => void;
  loading?: boolean;
  emptyText?: string;
  emptyIcon?: string;
  emptyAction?: React.ReactNode;
  rowKey?: keyof T | ((record: T) => string);
  expandableRows?: boolean;
  renderExpandedRow?: (record: T) => React.ReactNode;
  className?: string;
}

interface MobileCardProps<T> {
  record: T;
  index: number;
  columns: TableColumn<T>[];
  rowKey: string;
  selected: boolean;
  onSelect?: () => void;
  onClick?: () => void;
  expandable?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  renderExpandedRow?: (record: T) => React.ReactNode;
}

// ============================================
// MOBILE CARD COMPONENT
// ============================================

const MobileCard = <T extends Record<string, any>>({
  record,
  index,
  columns,
  rowKey,
  selected,
  onSelect,
  onClick,
  expandable,
  expanded,
  onToggleExpand,
  renderExpandedRow,
}: MobileCardProps<T>) => {
  // Filter columns for mobile display (prioritize high and medium priority)
  const displayColumns = columns
    .filter(col => col.key !== '__expand__' && col.key !== 'actions')
    .sort((a, b) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priority || 'medium'];
      const bPriority = priorityOrder[b.priority || 'medium'];
      return aPriority - bPriority;
    })
    .slice(0, 4); // Show max 4 fields on mobile

  // Find actions column
  const actionsColumn = columns.find(col => col.key === 'actions');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        'bg-white border border-machinery-200 rounded-lg shadow-sm',
        'transition-all duration-200',
        selected && 'border-steel-300 bg-steel-50 shadow-md',
        onClick && 'cursor-pointer active:scale-[0.98]',
        'touch-manipulation' // Optimize for touch
      )}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          {onSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={onSelect}
              onClick={(e) => e.stopPropagation()}
              className="w-5 h-5 text-steel-600 border-machinery-300 rounded focus:ring-steel-500 focus:ring-2"
              aria-label={`Select item ${index + 1}`}
            />
          )}
          
          {/* Primary identifier (usually first column) */}
          {displayColumns[0] && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-machinery-900 truncate">
                {displayColumns[0].render 
                  ? displayColumns[0].render(
                      displayColumns[0].dataIndex ? record[displayColumns[0].dataIndex] : undefined,
                      record,
                      index
                    )
                  : displayColumns[0].dataIndex 
                    ? record[displayColumns[0].dataIndex]
                    : ''
                }
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Actions */}
          {actionsColumn && (
            <div onClick={(e) => e.stopPropagation()}>
              {actionsColumn.render?.(undefined, record, index)}
            </div>
          )}
          
          {/* Expand button */}
          {expandable && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand?.();
              }}
              aria-label={expanded ? "Collapse details" : "Expand details"}
            >
              <Icon
                icon={expanded ? "tabler:chevron-up" : "tabler:chevron-down"}
                className="w-4 h-4 text-machinery-500"
              />
            </Button>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div 
        className="px-4 pb-4 space-y-3"
        onClick={onClick}
      >
        {displayColumns.slice(1).map((column) => {
          if (column.key === '__expand__' || column.key === 'actions') return null;
          
          const value = column.dataIndex ? record[column.dataIndex] : undefined;
          const content = column.render ? column.render(value, record, index) : value;
          
          // Skip empty values
          if (!content && content !== 0) return null;
          
          return (
            <div key={column.key} className="flex items-start justify-between gap-3">
              <span className="text-sm font-medium text-machinery-600 flex-shrink-0 min-w-0">
                {column.title}:
              </span>
              <div className="text-sm text-machinery-900 text-right min-w-0 flex-1">
                {content}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expandable && expanded && renderExpandedRow && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-machinery-200"
          >
            <div className="p-4 bg-machinery-25">
              {renderExpandedRow(record)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================
// MOBILE EMPTY STATE
// ============================================

interface MobileEmptyStateProps {
  icon?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const MobileEmptyState: React.FC<MobileEmptyStateProps> = ({
  icon = "tabler:database-off",
  title = "No data available",
  description = "There are no items to display at the moment.",
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-20 h-20 bg-machinery-100 rounded-full flex items-center justify-center mb-6">
      {/* TODO: Convert icon prop to use HugeiconsIcon component */}
    </div>
    <h3 className="text-lg font-semibold text-machinery-700 mb-3">{title}</h3>
    <p className="text-machinery-500 text-center max-w-sm mb-6 leading-relaxed">{description}</p>
    {action}
  </div>
);

// ============================================
// MOBILE LOADING STATE
// ============================================

const MobileLoadingState: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4 p-4">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="bg-white border border-machinery-200 rounded-lg p-4 animate-pulse"
      >
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-machinery-200 rounded" />
            <div className="h-4 bg-machinery-200 rounded w-32" />
          </div>
          <div className="w-8 h-8 bg-machinery-200 rounded" />
        </div>
        
        {/* Content skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-3 bg-machinery-200 rounded w-20" />
              <div className="h-3 bg-machinery-200 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// ============================================
// MOBILE SELECTION HEADER
// ============================================

interface MobileSelectionHeaderProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

const MobileSelectionHeader: React.FC<MobileSelectionHeaderProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-steel-50 border-b border-steel-200 px-4 py-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Check className="w-4 h-4 text-steel-600" />
          <span className="text-sm font-medium text-steel-700">
            {selectedCount} of {totalCount} selected
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedCount < totalCount && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelectAll}
            >
              Select all
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// MAIN MOBILE TABLE COMPONENT
// ============================================

const DataTableMobile = <T extends Record<string, any>>({
  data,
  columns,
  selectedRows,
  onSelectionChange,
  onRowClick,
  loading = false,
  emptyText = "No data available",
  emptyIcon = "tabler:database-off",
  emptyAction,
  rowKey = 'id',
  expandableRows = false,
  renderExpandedRow,
  className,
}: MobileTableProps<T>) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Get row key function
  const getRowKey = useCallback((record: T): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey]);
  }, [rowKey]);

  // Handle selection
  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;
    
    const allKeys = data.map(getRowKey);
    onSelectionChange(allKeys);
  }, [data, onSelectionChange, getRowKey]);

  const handleClearSelection = useCallback(() => {
    onSelectionChange?.([]);
  }, [onSelectionChange]);

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

  // Render loading state
  if (loading) {
    return (
      <div className={className}>
        <MobileLoadingState />
      </div>
    );
  }

  // Render empty state
  if (data.length === 0) {
    return (
      <div className={className}>
        <MobileEmptyState
          icon={emptyIcon}
          title={emptyText}
          action={emptyAction}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Selection Header */}
      <AnimatePresence>
        {onSelectionChange && (
          <MobileSelectionHeader
            selectedCount={selectedRows.length}
            totalCount={data.length}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
          />
        )}
      </AnimatePresence>

      {/* Cards */}
      <div className="space-y-3 p-4">
        {data.map((record, index) => {
          const key = getRowKey(record);
          const isSelected = selectedRows.includes(key);
          const isExpanded = expandedRows.has(key);
          
          return (
            <MobileCard
              key={key}
              record={record}
              index={index}
              columns={columns}
              rowKey={key}
              selected={isSelected}
              onSelect={onSelectionChange ? () => handleSelectRow(record) : undefined}
              onClick={onRowClick ? () => onRowClick(record) : undefined}
              expandable={expandableRows}
              expanded={isExpanded}
              onToggleExpand={() => handleToggleExpand(record)}
              renderExpandedRow={renderExpandedRow}
            />
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default DataTableMobile;
export type { MobileTableProps };
