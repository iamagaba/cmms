/**
 * Enhanced Professional Data Table Component
 * 
 * An advanced data table component that extends ProfessionalDataTable with
 * maintenance workflow features, advanced filtering, bulk operations,
 * and responsive design patterns optimized for CMMS applications.
 * 
 * Features:
 * - Advanced filtering with multiple filter types
 * - Bulk operations with confirmation dialogs
 * - Export functionality (CSV, Excel, PDF)
 * - Responsive design with mobile-friendly patterns
 * - Loading states and skeleton patterns
 * - Accessibility compliance (WCAG 2.1 AA)
 * - Keyboard navigation support
 * - Touch-friendly interactions
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, Cancel01Icon, Download01Icon, Database01Icon, ArrowRight01Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ProfessionalDataTable, { TableColumn, TableProps } from './ProfessionalDataTable';
import ProfessionalButton from './ProfessionalButton';
import ProfessionalInput from './ProfessionalInput';
import { WorkOrderStatusBadge, PriorityBadge } from './ProfessionalBadge';
import Icon from '../icons/Icon';

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

export interface EnhancedTableProps<T = any> extends Omit<TableProps<T>, 'searchable'> {
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
  
  // Enhancement #10: Density options
  density?: 'compact' | 'comfortable' | 'spacious';
  
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
            icon={isExpanded ? "tabler:chevron-up" : "tabler:chevron-down"}
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
              icon="tabler:x"
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
                      className="w-full px-3 py-2 text-sm border border-machinery-300 rounded-md focus:ring-2 focus:ring-steel-500 focus:border-steel-500"
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
                      className="w-full px-3 py-2 text-sm border border-machinery-300 rounded-md focus:ring-2 focus:ring-steel-500 focus:border-steel-500"
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
          icon="tabler:x"
          onClick={onClearSelection}
        >
          Clear selection
        </ProfessionalButton>
      </div>
    </motion.div>
  );
};

// ============================================
// DENSITY CONTROL COMPONENT
// ============================================

interface DensityControlProps {
  density: 'compact' | 'comfortable' | 'spacious';
  onDensityChange: (density: 'compact' | 'comfortable' | 'spacious') => void;
}

const DensityControl: React.FC<DensityControlProps> = ({ density, onDensityChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const densityOptions = [
    { value: 'compact' as const, label: 'Compact', icon: 'tabler:list' },
    { value: 'comfortable' as const, label: 'Comfortable', icon: 'tabler:layout-grid' },
    { value: 'spacious' as const, label: 'Spacious', icon: 'tabler:layers' },
  ];

  return (
    <div className="relative">
      <ProfessionalButton
        variant="outline"
        size="sm"
        icon="tabler:layout-grid"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change table density"
      >
        Density
      </ProfessionalButton>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-machinery-200 py-2 z-50"
          >
            {densityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onDensityChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm flex items-center gap-3',
                  'hover:bg-machinery-50 transition-colors',
                  density === option.value && 'bg-steel-50 text-steel-700 font-medium'
                )}
              >
                <Icon icon={option.icon} className="w-4 h-4" />
                {option.label}
                {density === option.value && (
                  <Icon icon="tabler:check" className="w-4 h-4 ml-auto text-steel-600" />
                )}
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
        icon="tabler:download"
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
                className="w-full px-4 py-2 text-left text-sm text-machinery-700 hover:bg-machinery-50 flex items-center gap-3"
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
// RESPONSIVE HOOKS
// ============================================

const useResponsiveTable = (mobileBreakpoint: number) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);
  
  return isMobile;
};

// ============================================
// LOADING SKELETON COMPONENT
// ============================================

const TableSkeleton: React.FC<{ columns: number; rows?: number }> = ({ 
  columns, 
  rows = 5 
}) => (
  <div>
    {/* Header skeleton */}
    <div className="bg-machinery-50 border-b border-machinery-200 p-4">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-machinery-200 rounded flex-1 animate-pulse" />
        ))}
      </div>
    </div>
    
    {/* Enhancement #9: Rows skeleton with shimmer */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="border-b border-machinery-100 p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className={cn(
                'h-4 rounded flex-1',
                'bg-gradient-to-r from-machinery-200 via-machinery-100 to-machinery-200',
                'bg-[length:1000px_100%]',
                'animate-shimmer'
              )}
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

// ============================================
// EMPTY STATE COMPONENT
// ============================================

interface EmptyStateProps {
  icon?: any;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = Database01Icon,
  title = "No data available",
  description = "There are no items to display at the moment.",
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <div className="w-16 h-16 bg-machinery-100 rounded-full flex items-center justify-center mb-4">
      <HugeiconsIcon icon={Database01Icon} size={32} className="text-machinery-400" />
    </div>
    <h3 className="text-lg font-semibold text-machinery-700 mb-2">{title}</h3>
    <p className="text-machinery-500 text-center max-w-md mb-6">{description}</p>
    {action}
  </div>
);

// ============================================
// MOBILE TABLE COMPONENT
// ============================================

interface MobileTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  selectedRows: string[];
  onSelectionChange?: (keys: string[]) => void;
  onRowClick?: (record: T) => void;
  loading?: boolean;
  emptyText?: string;
}

const MobileTable = <T extends Record<string, any>>({
  data,
  columns,
  selectedRows,
  onSelectionChange,
  onRowClick,
  loading,
  emptyText = "No data available",
}: MobileTableProps<T>) => {
  const getRowKey = (record: T): string => String(record.id || record.key);
  
  if (loading) {
    return <TableSkeleton columns={2} rows={3} />;
  }
  
  if (data.length === 0) {
    return <EmptyState title={emptyText} />;
  }
  
  return (
    <div className="space-y-3 p-4">
      {data.map((record, index) => {
        const key = getRowKey(record);
        const isSelected = selectedRows.includes(key);
        
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              // Enhancement #1: Visual depth for mobile cards
              'bg-white border border-machinery-200 rounded-lg p-4',
              'shadow-md ring-1 ring-black/5',
              'transition-all duration-200 ease-out',
              // Enhancement #2: Smooth hover for mobile
              'active:scale-[0.98]',
              isSelected && 'border-steel-300 bg-steel-50 shadow-lg',
              onRowClick && 'cursor-pointer active:shadow-xl'
            )}
            onClick={() => onRowClick?.(record)}
          >
            {/* Selection checkbox */}
            {onSelectionChange && (
              <div className="flex items-center justify-between mb-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {
                    if (isSelected) {
                      onSelectionChange(selectedRows.filter(k => k !== key));
                    } else {
                      onSelectionChange([...selectedRows, key]);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    'w-4 h-4 rounded border-2 transition-all',
                    'border-machinery-300 text-steel-600',
                    'focus:ring-2 focus:ring-steel-500 focus:ring-offset-2',
                    'checked:bg-steel-600 checked:border-steel-600',
                    'hover:border-steel-400'
                  )}
                />
              </div>
            )}
            
            {/* Mobile card content */}
            <div className="space-y-2">
              {columns.slice(0, 4).map((column) => {
                if (column.key === '__expand__') return null;
                
                const value = column.dataIndex ? record[column.dataIndex] : undefined;
                const content = column.render ? column.render(value, record, index) : value;
                
                return (
                  <div key={column.key} className="flex justify-between items-start">
                    <span className="text-sm font-medium text-machinery-600 min-w-0 flex-shrink-0 mr-3">
                      {column.title}:
                    </span>
                    <div className="text-sm text-machinery-900 text-right min-w-0 flex-1">
                      {content}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ============================================
// MAIN ENHANCED DATA TABLE
// ============================================

const EnhancedDataTable = <T extends Record<string, any>>({
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
  density = 'comfortable', // Enhancement #10: Default density
  ariaLabel = "Data table",
  ariaDescription = "A table displaying data with filtering, sorting, and selection capabilities",
  
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
  emptyText = "No data available",
  ...baseProps
}: EnhancedTableProps<T>) => {
  const [localFilters, setLocalFilters] = useState(activeFilters);
  const [searchValue, setSearchValue] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [localDensity, setLocalDensity] = useState<'compact' | 'comfortable' | 'spacious'>(density);
  const tableRef = useRef<HTMLDivElement>(null);
  const isMobile = useResponsiveTable(mobileBreakpoint);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: Record<string, any>) => {
    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters);
  }, [onFiltersChange]);

  // Handle search with debouncing
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
    
    if (expandableRows && !isMobile) {
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
              className="p-1 hover:bg-machinery-100 rounded focus:outline-none focus:ring-2 focus:ring-steel-500"
              aria-label={isExpanded ? "Collapse row" : "Expand row"}
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
  }, [columns, expandableRows, expandedRows, isMobile]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!tableRef.current?.contains(document.activeElement)) return;
      
      // Handle arrow key navigation, Enter for selection, etc.
      switch (event.key) {
        case 'Escape':
          if (selectedRows.length > 0) {
            handleClearSelection();
          }
          break;
        case 'a':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const allKeys = processedData.map(item => String(item.id || item.key));
            onSelectionChange?.(allKeys);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedRows, processedData, handleClearSelection, onSelectionChange]);

  return (
    <div 
      ref={tableRef}
      className={cn(
        // Enhancement #1: Visual hierarchy with depth
        'bg-white rounded-lg overflow-hidden',
        'shadow-md border border-machinery-200',
        'ring-1 ring-black/5',
        className
      )}
      role="region"
      aria-label={ariaLabel}
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
        {bulkActions.length > 0 && selectedRows.length > 0 && (
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-b border-machinery-200 bg-machinery-25/50">
          {searchable && (
            <ProfessionalInput
              icon="tabler:search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full sm:max-w-md"
              size={isMobile ? 'lg' : 'base'}
            />
          )}
          
          <div className="flex items-center gap-2">
            {/* Enhancement #10: Density control */}
            <DensityControl
              density={localDensity}
              onDensityChange={setLocalDensity}
            />
            
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

      {/* Table Content - Enhancement #1: Add subtle inner shadow */}
      {isMobile ? (
        <MobileTable
          data={processedData}
          columns={enhancedColumns}
          selectedRows={selectedRows}
          onSelectionChange={onSelectionChange}
          onRowClick={baseProps.onRowClick}
          loading={loading}
          emptyText={emptyText}
        />
      ) : (
        <div className={cn(
          stickyHeader && 'max-h-96 overflow-y-auto',
          'shadow-inner-sm'
        )}>
          <ProfessionalDataTable
            {...baseProps}
            columns={enhancedColumns}
            data={processedData}
            loading={loading}
            selectedRows={selectedRows}
            onSelectionChange={onSelectionChange}
            size={compactMode ? 'sm' : size}
            searchable={false} // We handle search above
            emptyText={emptyText}
            striped={true} // Enhancement #6: Enable zebra striping
            density={localDensity} // Enhancement #10: Pass density prop
          />
        </div>
      )}
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default EnhancedDataTable;
export type { 
  EnhancedTableProps, 
  FilterOption, 
  ColumnFilter, 
  BulkAction, 
  ExportOption 
};