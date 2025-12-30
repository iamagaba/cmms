import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  ArrowUp01Icon,
  ArrowDown01Icon,
  Tick01Icon
} from '@hugeicons/core-free-icons';
import { ItemCategory, ITEM_CATEGORY_LABELS } from '@/types/supabase';
import { getCategoryBadgeColor, getCategoryIcon, ALL_CATEGORIES } from '@/utils/inventory-categorization-helpers';

interface CategoryMultiSelectProps {
  value: ItemCategory[];
  onChange: (categories: ItemCategory[]) => void;
}

export const CategoryMultiSelect: React.FC<CategoryMultiSelectProps> = ({
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (category: ItemCategory) => {
    if (value.includes(category)) {
      onChange(value.filter(c => c !== category));
    } else {
      onChange([...value, category]);
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <div className="relative">
      {/* Selected Categories Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[42px] px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-between gap-2"
      >
        <div className="flex-1 flex flex-wrap gap-1">
          {value.length === 0 ? (
            <span className="text-gray-500 dark:text-gray-400">Select categories...</span>
          ) : (
            value.map(category => (
              <span
                key={category}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getCategoryBadgeColor(category)}`}
              >
                <HugeiconsIcon icon={getCategoryIcon(category)} size={12} />
                {ITEM_CATEGORY_LABELS[category]}
              </span>
            ))
          )}
        </div>
        <HugeiconsIcon 
          icon={isOpen ? ArrowUp01Icon : ArrowDown01Icon} 
          size={16}
          className="text-gray-400 flex-shrink-0" 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          {/* Header with Clear */}
          {value.length > 0 && (
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {value.length} selected
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Options */}
          <div className="max-h-48 overflow-auto p-1">
            {ALL_CATEGORIES.map(category => {
              const isSelected = value.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleToggle(category)}
                  className={`w-full px-3 py-2 text-left text-sm rounded flex items-center gap-2 ${
                    isSelected 
                      ? 'bg-purple-50 dark:bg-purple-900/30' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    isSelected 
                      ? 'bg-purple-600 border-purple-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {isSelected && (
                      <HugeiconsIcon icon={Tick01Icon} size={12} className="text-white" />
                    )}
                  </div>
                  <HugeiconsIcon 
                    icon={getCategoryIcon(category)} 
                    size={16}
                    className={isSelected ? 'text-purple-600' : 'text-gray-400'} 
                  />
                  <span className="text-gray-900 dark:text-gray-100">
                    {ITEM_CATEGORY_LABELS[category]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsOpen(false)} 
        />
      )}
    </div>
  );
};

// Simple badge component for displaying a single category
interface CategoryBadgeProps {
  category: ItemCategory;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'sm',
  showIcon = true,
}) => {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm';
  
  return (
    <span className={`inline-flex items-center gap-1 rounded border font-medium ${getCategoryBadgeColor(category)} ${sizeClasses}`}>
      {showIcon && <HugeiconsIcon icon={getCategoryIcon(category)} size={size === 'sm' ? 12 : 16} className="text-current" />}
      {ITEM_CATEGORY_LABELS[category]}
    </span>
  );
};
