import React from 'react';
import { Icon } from '@iconify/react';
import { UnitOfMeasure, UNIT_OF_MEASURE_LABELS } from '@/types/supabase';
import { ALL_UNITS } from '@/utils/inventory-categorization-helpers';

interface UnitOfMeasureSelectProps {
  unit: UnitOfMeasure;
  unitsPerPackage: number;
  onUnitChange: (unit: UnitOfMeasure) => void;
  onUnitsPerPackageChange: (count: number) => void;
}

export const UnitOfMeasureSelect: React.FC<UnitOfMeasureSelectProps> = ({
  unit,
  unitsPerPackage,
  onUnitChange,
  onUnitsPerPackageChange,
}) => {
  const showConversionFactor = unit !== 'each';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {/* Unit Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Unit of Measure <span className="text-red-500">*</span>
          </label>
          <select
            value={unit}
            onChange={(e) => {
              const newUnit = e.target.value as UnitOfMeasure;
              onUnitChange(newUnit);
              // Reset conversion factor when switching to 'each'
              if (newUnit === 'each') {
                onUnitsPerPackageChange(1);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {ALL_UNITS.map(u => (
              <option key={u} value={u}>{UNIT_OF_MEASURE_LABELS[u]}</option>
            ))}
          </select>
        </div>

        {/* Conversion Factor */}
        {showConversionFactor && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Items per {UNIT_OF_MEASURE_LABELS[unit]} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={unitsPerPackage}
              onChange={(e) => onUnitsPerPackageChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="1"
            />
          </div>
        )}
      </div>

      {/* Info Box */}
      {showConversionFactor && unitsPerPackage > 1 && (
        <div className="flex items-start gap-2 text-sm bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
          <Icon icon="tabler:info-circle" className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <span className="text-blue-700 dark:text-blue-300">
            1 {UNIT_OF_MEASURE_LABELS[unit].toLowerCase()} = {unitsPerPackage} individual items
          </span>
        </div>
      )}
    </div>
  );
};
