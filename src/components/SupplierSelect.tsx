import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { useSuppliers, useCreateSupplier } from '@/hooks/useSuppliers';
import { Supplier } from '@/types/supabase';

interface SupplierSelectProps {
  value: string | null;
  onChange: (supplierId: string | null) => void;
  allowCreate?: boolean;
}

export const SupplierSelect: React.FC<SupplierSelectProps> = ({
  value,
  onChange,
  allowCreate = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');

  const { data: suppliers, isLoading } = useSuppliers();
  const createMutation = useCreateSupplier();

  const selectedSupplier = useMemo(() => {
    if (!value || !suppliers) return null;
    return suppliers.find(s => s.id === value) || null;
  }, [value, suppliers]);

  const filteredSuppliers = useMemo(() => {
    if (!suppliers) return [];
    if (!searchTerm) return suppliers;
    const query = searchTerm.toLowerCase();
    return suppliers.filter(s => 
      s.name.toLowerCase().includes(query) ||
      s.contact_name?.toLowerCase().includes(query)
    );
  }, [suppliers, searchTerm]);

  const handleSelect = (supplier: Supplier | null) => {
    onChange(supplier?.id || null);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateSupplier = async () => {
    if (!newSupplierName.trim()) return;

    try {
      const newSupplier = await createMutation.mutateAsync({
        name: newSupplierName.trim(),
        contact_name: null,
        phone: null,
        email: null,
        address: null,
        notes: null,
      });
      onChange(newSupplier.id);
      setShowCreateForm(false);
      setNewSupplierName('');
      setIsOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="relative">
      {/* Selected Value Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex items-center justify-between"
      >
        <span className={selectedSupplier ? '' : 'text-gray-500 dark:text-gray-400'}>
          {selectedSupplier?.name || 'Select supplier...'}
        </span>
        <Icon 
          icon={isOpen ? 'tabler:chevron-up' : 'tabler:chevron-down'} 
          className="w-4 h-4 text-gray-400" 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Icon 
                icon="tabler:search" 
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" 
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search suppliers..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-40 overflow-auto">
            {/* Clear Option */}
            {value && (
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className="w-full px-3 py-2 text-left text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Icon icon="tabler:x" className="w-4 h-4" />
                Clear selection
              </button>
            )}

            {isLoading ? (
              <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Loading suppliers...
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No suppliers found
              </div>
            ) : (
              filteredSuppliers.map(supplier => (
                <button
                  key={supplier.id}
                  type="button"
                  onClick={() => handleSelect(supplier)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between ${
                    supplier.id === value ? 'bg-purple-50 dark:bg-purple-900/30' : ''
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{supplier.name}</p>
                    {supplier.contact_name && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{supplier.contact_name}</p>
                    )}
                  </div>
                  {supplier.id === value && (
                    <Icon icon="tabler:check" className="w-4 h-4 text-purple-600" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Create New Supplier */}
          {allowCreate && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-2">
              {showCreateForm ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                    placeholder="Supplier name"
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCreateSupplier}
                      disabled={!newSupplierName.trim() || createMutation.isPending}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50"
                    >
                      {createMutation.isPending ? 'Creating...' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewSupplierName('');
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="w-full px-3 py-1.5 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded flex items-center gap-2"
                >
                  <Icon icon="tabler:plus" className="w-4 h-4" />
                  Add new supplier
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => {
            setIsOpen(false);
            setShowCreateForm(false);
            setNewSupplierName('');
          }} 
        />
      )}
    </div>
  );
};
