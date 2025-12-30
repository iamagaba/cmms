/**
 * Data Table Filter Bar Component
 * 
 * A comprehensive filtering interface for the Enhanced Professional Data Table.
 * Provides advanced filtering capabilities with professional industrial styling.
 */

import React, { useState, useCallback } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { FilterIcon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { Icon } from '@/components/icons/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ColumnFilter, FilterOption } from './EnhancedProfessionalDataTable';

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
  <input
    type="text"
    placeholder={filter.placeholder || `Filter by ${filter.label.toLowerCase()}...`}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    className={cn(
      'w-full px-3 py-2 text-sm border border-machinery-300 rounded-md',
      'focus:ring-2 focus:ring-steel-500 focus:border-steel-500',
      'placeholder:text-machinery-400',
      'transition-colors duration-200'
    )}
  />
);

const SelectFilter: React.FC<FilterInputProps> = ({ filter, value, onChange }) => (
  <select
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    className={cn(
      'w-full px-3 py-2 text-sm border border-machinery-300 rounded-md',
      'focus:ring-2 focus:ring-steel-500 focus:border-steel-500',
      'bg-white transition-colors duration-200'
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
          'w-full px-3 py-2 text-sm border border-machinery-300 rounded-md',
          'focus:ring-2 focus:ring-steel-500 focus:border-steel-500',
          'bg-white text-left flex items-center justify-between',
          'transition-colors duration-200'
        )}
      >
        <span className={selectedCount === 0 ? 'text-machinery-400' : 'text-machinery-700'}>
          {displayText}
        </span>
        <Icon 
          icon={isOpen ? "tabler:chevron-up" : "tabler:chevron-down"} 
          className="w-4 h-4 text-machinery-500" 
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
                'bg-white border border-machinery-200 rounded-md shadow-lg',
                'max-h-60 overflow-y-auto'
              )}
            >
              <div className="p-2 space-y-1">
                {filter.options?.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      'flex items-center gap-3 px-2 py-1.5 rounded cursor-pointer',
                      'hover:bg-machinery-50 transition-colors'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option.value)}
                      onChange={() => handleToggleOption(option.value)}
                      className="w-4 h-4 text-steel-600 border-machinery-300 rounded focus:ring-steel-500"
                    />
                    <span className="text-sm text-machinery-700 flex-1">
                      {option.label}
                    </span>
                    {option.count !== undefined && (
                      <span className="text-xs text-machinery-500">
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
  <input
    type="date"
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    className={cn(
      'w-full px-3 py-2 text-sm border border-machinery-300 rounded-md',
      'focus:ring-2 focus:ring-steel-500 focus:border-steel-500',
      'bg-white transition-colors duration-200'
    )}
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
      <input
        type="date"
        placeholder="Start date"
        value={rangeValue.start || ''}
        onChange={(e) => handleStartChange(e.target.value)}
        className={cn(
          'px-3 py-2 text-sm border border-machinery-300 rounded-md',
          'focus:ring-2 focus:ring-steel-500 focus:border-steel-500',
          'bg-white transition-colors duration-200'
        )}
      />
      <input
        type="date"
        placeholder="End date"
        value={rangeValue.end || ''}
        onChange={(e) => handleEndChange(e.target.value)}
        className={cn(
          'px-3 py-2 text-sm border border-machinery-300 rounded-md',
          'focus:ring-2 focus:ring-steel-500 focus:border-steel-500',
          'bg-white transition-colors duration-200'
        )}
      />
    </div>
  );
};

const NumberFilter: React.FC<FilterInputProps> = ({ filter, value, onChange }) => (
  <input
    type="number"
    placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}...`}
    value={value || ''}
    min={filter.min}
    max={filter.max}
    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
    className={cn(
      'w-full px-3 py-2 text-sm border border-machinery-300 rounded-md',
      'focus:ring-2 focus:ring-steel-500 focus:border-steel-500',
      'placeholder:text-machinery-400',
      'transition-colors duration-200'
    )}
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
      'w-full px-3 py-2 text-sm border border-machinery-300 rounded-md',
      'focus:ring-2 focus:ring-steel-500 focus:border-steel-500',
      'bg-white transition-colors duration-200'
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
    <div className={cn('border-b border-machinery-200 bg-machinery-25', className)}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 text-sm font-medium',
              'text-machinery-700 hover:text-steel-600',
              'border border-machinery-300 rounded-md hover:border-steel-400',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-steel-500'
            )}
          >
            <Icon 
              icon={isExpanded ? "tabler:chevron-up" : "tabler:chevron-down"} 
              className="w-4 h-4" 
            />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-steel-600 text-white rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
          
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 text-sm',
                'text-machinery-600 hover:text-warning-600',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-steel-500 rounded'
              )}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={12} />
              <span>Clear all</span>
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-machinery-600">
          <HugeiconsIcon icon={FilterIcon} size={16} />
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
            <div className="p-4 pt-0 border-t border-machinery-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filters.map((filter) => (
                  <div key={filter.key} className="space-y-2">
                    <label className="block text-sm font-medium text-machinery-700">
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
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-machinery-200">
                <div className="text-sm text-machinery-500">
                  Use filters to narrow down your results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className={cn(
                      'px-3 py-1.5 text-sm text-machinery-600 hover:text-warning-600',
                      'border border-machinery-300 rounded-md hover:border-warning-400',
                      'transition-colors duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-steel-500'
                    )}
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className={cn(
                      'px-3 py-1.5 text-sm text-white bg-steel-600 hover:bg-steel-700',
                      'rounded-md transition-colors duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-steel-500'
                    )}
                  >
                    Apply Filters
                  </button>
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