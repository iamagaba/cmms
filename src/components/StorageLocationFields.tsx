import React from 'react';
import { Icon } from '@iconify/react';

interface StorageLocationFieldsProps {
  warehouse: string | null;
  zone: string | null;
  aisle: string | null;
  bin: string | null;
  shelf: string | null;
  onChange: (field: string, value: string | null) => void;
}

export const StorageLocationFields: React.FC<StorageLocationFieldsProps> = ({
  warehouse,
  zone,
  aisle,
  bin,
  shelf,
  onChange,
}) => {
  const handleChange = (field: string, value: string) => {
    onChange(field, value.trim() || null);
  };

  return (
    <div className="space-y-3">
      {/* Warehouse and Zone */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Warehouse
          </label>
          <input
            type="text"
            value={warehouse || ''}
            onChange={(e) => handleChange('warehouse', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="e.g., Main"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Zone
          </label>
          <input
            type="text"
            value={zone || ''}
            onChange={(e) => handleChange('zone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="e.g., A"
          />
        </div>
      </div>

      {/* Aisle, Bin, Shelf */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Aisle
          </label>
          <input
            type="text"
            value={aisle || ''}
            onChange={(e) => handleChange('aisle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="e.g., 1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bin
          </label>
          <input
            type="text"
            value={bin || ''}
            onChange={(e) => handleChange('bin', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="e.g., B2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Shelf
          </label>
          <input
            type="text"
            value={shelf || ''}
            onChange={(e) => handleChange('shelf', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="e.g., 3"
          />
        </div>
      </div>

      {/* Preview */}
      {(warehouse || zone || aisle || bin || shelf) && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
          <Icon icon="tabler:map-pin" className="w-4 h-4" />
          <span>
            {[
              warehouse,
              zone,
              [aisle, bin, shelf].filter(Boolean).join('-')
            ].filter(Boolean).join(' > ') || 'Location preview'}
          </span>
        </div>
      )}
    </div>
  );
};
