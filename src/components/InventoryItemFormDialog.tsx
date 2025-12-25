import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { InventoryItem, ItemCategory, UnitOfMeasure } from '@/types/supabase';
import { CategoryMultiSelect } from './CategoryMultiSelect';
import { SupplierSelect } from './SupplierSelect';
import { StorageLocationFields } from './StorageLocationFields';
import { UnitOfMeasureSelect } from './UnitOfMeasureSelect';

interface InventoryItemFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Partial<InventoryItem>) => void;
  item?: InventoryItem | null;
}

export const InventoryItemFormDialog: React.FC<InventoryItemFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  item
}) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    sku: '',
    description: '',
    quantity_on_hand: 0,
    reorder_level: 0,
    unit_price: 0,
    categories: [],
    supplier_id: null,
    unit_of_measure: 'each',
    units_per_package: 1,
    warehouse: null,
    zone: null,
    aisle: null,
    bin: null,
    shelf: null,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with item data when editing
  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id,
        name: item.name || '',
        sku: item.sku || '',
        description: item.description || '',
        quantity_on_hand: item.quantity_on_hand || 0,
        reorder_level: item.reorder_level || 0,
        unit_price: item.unit_price || 0,
        categories: item.categories || [],
        supplier_id: item.supplier_id || null,
        unit_of_measure: item.unit_of_measure || 'each',
        units_per_package: item.units_per_package || 1,
        warehouse: item.warehouse || null,
        zone: item.zone || null,
        aisle: item.aisle || null,
        bin: item.bin || null,
        shelf: item.shelf || null,
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        description: '',
        quantity_on_hand: 0,
        reorder_level: 0,
        unit_price: 0,
        categories: [],
        supplier_id: null,
        unit_of_measure: 'each',
        units_per_package: 1,
        warehouse: null,
        zone: null,
        aisle: null,
        bin: null,
        shelf: null,
      });
    }
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.sku) {
      alert('Please provide item name and SKU');
      return;
    }
    
    if (formData.unit_price === undefined || formData.unit_price < 0) {
      alert('Please provide a valid unit price');
      return;
    }
    
    if (formData.quantity_on_hand === undefined || formData.quantity_on_hand < 0) {
      alert('Please provide a valid quantity on hand');
      return;
    }
    
    if (formData.reorder_level === undefined || formData.reorder_level < 0) {
      alert('Please provide a valid reorder level');
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(formData);
      
      // Reset form and close dialog
      setFormData({
        name: '',
        sku: '',
        description: '',
        quantity_on_hand: 0,
        reorder_level: 0,
        unit_price: 0,
      });
      onClose();
    } catch (error) {
      console.error('Error saving inventory item:', error);
      alert('Failed to save inventory item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      
      {/* Dialog */}
      <div className="absolute inset-y-0 right-0 flex max-w-full">
        <div 
          className="w-screen max-w-lg bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div>
              <div className="flex items-center gap-2">
                <Icon icon="tabler:package" className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {item ? 'Edit Inventory Item' : 'Add New Inventory Item'}
                </h2>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {item ? 'Update item details' : 'Add a new item to inventory'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Icon icon="tabler:x" className="w-5 h-5" />
            </button>
          </div>

          {/* Form - Scrollable */}
          <form id="inventory-item-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              
              {/* Basic Information */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon icon="tabler:info-circle" className="w-5 h-5 text-purple-600" />
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter item name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter SKU"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter item description (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Categorization */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon icon="tabler:tags" className="w-5 h-5 text-purple-600" />
                  Categorization
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categories
                    </label>
                    <CategoryMultiSelect
                      value={formData.categories || []}
                      onChange={(categories) => setFormData({ ...formData, categories })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier
                    </label>
                    <SupplierSelect
                      value={formData.supplier_id || null}
                      onChange={(supplier_id) => setFormData({ ...formData, supplier_id })}
                    />
                  </div>
                </div>
              </div>

              {/* Unit of Measure */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon icon="tabler:ruler-measure" className="w-5 h-5 text-purple-600" />
                  Unit of Measure
                </h3>
                <UnitOfMeasureSelect
                  unit={formData.unit_of_measure || 'each'}
                  unitsPerPackage={formData.units_per_package || 1}
                  onUnitChange={(unit_of_measure) => setFormData({ ...formData, unit_of_measure })}
                  onUnitsPerPackageChange={(units_per_package) => setFormData({ ...formData, units_per_package })}
                />
              </div>

              {/* Storage Location */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon icon="tabler:map-pin" className="w-5 h-5 text-purple-600" />
                  Storage Location
                </h3>
                <StorageLocationFields
                  warehouse={formData.warehouse || null}
                  zone={formData.zone || null}
                  aisle={formData.aisle || null}
                  bin={formData.bin || null}
                  shelf={formData.shelf || null}
                  onChange={(field, value) => setFormData({ ...formData, [field]: value })}
                />
              </div>

              {/* Stock Information */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon icon="tabler:package" className="w-5 h-5 text-purple-600" />
                  Stock Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity on Hand <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.quantity_on_hand || ''}
                        onChange={(e) => setFormData({ ...formData, quantity_on_hand: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reorder Level <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.reorder_level || ''}
                        onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.unit_price || ''}
                        onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Stock Status Indicator */}
                  {formData.quantity_on_hand !== undefined && formData.reorder_level !== undefined && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Icon 
                          icon={
                            formData.quantity_on_hand === 0 ? "tabler:alert-triangle" :
                            formData.quantity_on_hand <= formData.reorder_level ? "tabler:alert-circle" :
                            "tabler:check-circle"
                          } 
                          className={`w-4 h-4 ${
                            formData.quantity_on_hand === 0 ? "text-red-600" :
                            formData.quantity_on_hand <= formData.reorder_level ? "text-orange-600" :
                            "text-emerald-600"
                          }`} 
                        />
                        <span className={`text-sm font-medium ${
                          formData.quantity_on_hand === 0 ? "text-red-900" :
                          formData.quantity_on_hand <= formData.reorder_level ? "text-orange-900" :
                          "text-emerald-900"
                        }`}>
                          {formData.quantity_on_hand === 0 ? "Out of Stock" :
                           formData.quantity_on_hand <= formData.reorder_level ? "Low Stock" :
                           "In Stock"}
                        </span>
                      </div>
                      {formData.quantity_on_hand > 0 && formData.quantity_on_hand <= formData.reorder_level && (
                        <p className="text-xs text-orange-700 mt-1">
                          Stock level is at or below reorder point. Consider restocking.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Total Value */}
                  {formData.quantity_on_hand !== undefined && formData.unit_price !== undefined && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-900">Total Inventory Value</span>
                        <span className="text-lg font-bold text-blue-900">
                          ${((formData.quantity_on_hand || 0) * (formData.unit_price || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </form>

          {/* Footer Actions - Sticky */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              form="inventory-item-form"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSaving && <Icon icon="tabler:loader-2" className="w-4 h-4 animate-spin" />}
              {item ? 'Update Item' : 'Create Item'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};