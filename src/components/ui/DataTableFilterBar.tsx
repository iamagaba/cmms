/**
 * Data Table Filter Bar Component
 * 
 * A comprehensive filtering interface for the Enhanced Professional Data Table.
 * Provides advanced filtering capabilities with shadcn/ui design compliance.
 */

import React, { useState, useCallback } from 'react';
import { Filter, X } from 'lucide-react';
import { Icon } from '@/components/icons/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ColumnFilter, FilterOption } from './EnhancedDataTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ============================================
// INTERFACES
// ============================================

interface FilterBarProps {
  filters: ColumnFilter[];
  activeFilters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
  className?: string;
}

interface FilterInputProps {
  filter: ColumnFilter;
  value: any;
  onChange: (value: any) => void;
}

// ============================================
// INDIVIDUAL FILTER COMPONENTS
// ============================================

const TextFilter: React.FC<FilterInputProps> = ({ filter, value, onChange }) => (
  <Input
    type="text"
    placeholder={filter.placeholder || `Filter by ${filter.label.toLowerCase()}...`}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
  />
);

const SelectFilter: React.FC<FilterInputProps> = ({ filter, value, onChange }) => (
  <select
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    className={cn(
      'flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/30 focus-visible:ring-offset-0',
      'disabled:cursor-not-allowed disabled:opacity-50'
    )}
  >
    <option value="">{filter.placeholder || 'All'}</option>
    {filter.options?.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
        {option.count !== undefined && ` (${option.count})`}
      </option>
    ))}
  </select>
);

const MultiSelectFilter: React.FC<FilterInputProps> = ({ filter, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedValues = Array.isArray(value) ? value : [];

  const handleToggleOption = (optionValue: string | number) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];
    onChange(newValues);
  };

  const selectedCount = selectedValues.length;
  const displayText = selectedCount === 0 
    ? filter.placeholder || 'Select options...'
    : `${selectedCount} selected`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/30 focus-visible:ring-offset-0',
          'items-center justify-between'
        )}
      >
        <span className={selectedCount === 0 ? 'text-muted-foreground' : ''}>
          {displayText}
        </span>
        <Icon 
          icon={isOpen ? "tabler:chevron-up" : "tabler:chevron-down"} 
          className="w-4 h-4 text-muted-foreground" 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute top-full left-0 right-0 mt-1 z-50',
                'bg-background border border-border rounded-md shadow-lg',
                'max-h-60 overflow-y-auto'
              )}
            >
              <div className="p-2 space-y-1">
                {filter.options?.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      'flex items-center gap-3 px-2 py-1.5 rounded cursor-pointer',
                      'hover:bg-accent transition-colors'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option.value)}
                      onChange={() => handleToggleOption(option.value)}
                      className="w-4 h-4 rounded border-input focus:ring-ring"
                    />
                    <span className="text-sm flex-1">
                      {option.label}
                    </span>
                    {option.count !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        {option.count}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </motion.div>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const DateFilter: React.FC<FilterInputProps> = ({ filter, value, onChange }) => (
  <Input
    type="date"
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
  />
);

const DateRangeFilter: React.FC<FilterInputProps> = ({ filter, value, onChange }) => {
  const rangeValue = value || { start: '', end: '' };

  const handleStartChange = (start: string) => {
    onChange({ ...rangeValue, start });
  };

  const handleEndChange = (end: string) => {
    onChange({ ...rangeValue, end });
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Input
        type="date"
        placeholder="Start date"
        value={rangeValue.start || ''}
        onChange={(e) => handleStartChange(e.target.value)}
      />
      <Input
        type="date"
        placeholder="End date"
        value={rangeValue.end || ''}
        onChange={(e) => handleEndChange(e.target.value)}
      />
    </div>
  );
};

const NumberFilter: React.FC<FilterInputProps> = ({ filter, value, onChange }) => (
  <Input
    type="number"
    placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}...`}
    value={value || ''}
    min={filter.min}
    max={filter.max}
    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
  />
);

const BooleanFilter: React.FC<FilterInputProps> = ({ filter, value, onChange }) => (
  <select
    value={value === undefined ? '' : String(value)}
    onChange={(e) => {
      const val = e.target.value;
      onChange(val === '' ? undefined : val === 'true');
    }}
    className={cn(
      'flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/30 focus-visible:ring-offset-0',
      'disabled:cursor-not-allowed disabled:opacity-50'
    )}
  >
    <option value="">All</option>
    <option value="true">Yes</option>
    <option value="false">No</option>
  </select>
);

// ============================================
// FILTER COMPONENT RENDERER
// ============================================

const FilterInput: React.FC<FilterInputProps> = ({ filter, value, onChange }) => {
  switch (filter.type) {
    case 'text':
      return <TextFilter filter={filter} value={value} onChange={onChange} />;
    case 'select':
      return <SelectFilter filter={filter} value={value} onChange={onChange} />;
    case 'multiselect':
      return <MultiSelectFilter filter={filter} value={value} onChange={onChange} />;
    case 'date':
      return <DateFilter filter={filter} value={value} onChange={onChange} />;
    case 'daterange':
      return <DateRangeFilter filter={filter} value={value} onChange={onChange} />;
    case 'number':
      return <NumberFilter filter={filter} value={value} onChange={onChange} />;
    case 'boolean':
      return <BooleanFilter filter={filter} value={value} onChange={onChange} />;
    default:
      return <TextFilter filter={filter} value={value} onChange={onChange} />;
  }
};

// ============================================
// MAIN FILTER BAR COMPONENT
// ============================================

const DataTableFilterBar: React.FC<FilterBarProps> = ({
  filters,
  activeFilters,
  onFiltersChange,
  onClearFilters,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate active filter count
  const activeFilterCount = Object.keys(activeFilters).filter(key => {
    const value = activeFilters[key];
    if (value === undefined || value === '' || value === null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value.start === '' && value.end === '') return false;
    return true;
  }).length;

  // Handle individual filter changes
  const handleFilterChange = useCallback((key: string, value: any) => {
    onFiltersChange({
      ...activeFilters,
      [key]: value,
    });
  }, [activeFilters, onFiltersChange]);

  // Handle clear all filters
  const handleClearAll = useCallback(() => {
    onClearFilters();
    setIsExpanded(false);
  }, [onClearFilters]);

  if (filters.length === 0) return null;

  return (
    <div className={cn('border-b border-border bg-muted/30', className)}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2"
          >
            <Icon 
              icon={isExpanded ? "tabler:chevron-up" : "tabler:chevron-down"} 
              className="w-4 h-4" 
            />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="default" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          
          {activeFilterCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Clear all</span>
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
          </span>
        </div>
      </div>
      
      {/* Filter Controls */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filters.map((filter) => (
                  <div key={filter.key} className="space-y-2">
                    <label className="block text-sm font-medium">
                      {filter.label}
                    </label>
                    <FilterInput
                      filter={filter}
                      value={activeFilters[filter.key]}
                      onChange={(value) => handleFilterChange(filter.key, value)}
                    />
                  </div>
                ))}
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Use filters to narrow down your results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearAll}
                  >
                    Clear All
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export default DataTableFilterBar;
export type { FilterBarProps };