
import React, { Fragment, useState, useEffect, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    CheckmarkCircle01Icon,
    Cancel01Icon,
    AlertCircleIcon,
    Add01Icon,
    Search01Icon,
    Delete01Icon,
    PackageIcon,
    ArrowLeft01Icon
} from '@hugeicons/core-free-icons';
import { WorkOrderPart, InventoryItem } from '@/types/supabase';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { snakeToCamelCase } from '@/utils/data-helpers';
import { formatQuantityWithUnit } from '@/utils/inventory-categorization-helpers';

interface MaintenanceCompletionDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { faultCode: string; maintenanceNotes: string }) => void;
    usedParts: WorkOrderPart[];
    onAddPart: (itemId: string, quantity: number) => void;
    onRemovePart: (partId: string) => void;
    onAddPartClick?: () => void; // Keep for backward compatibility but won't be used
    initialFaultCode?: string | null;
    initialMaintenanceNotes?: string | null;
    isSaving?: boolean;
}

const FAULT_CODES = [
    { value: 'REPAIR_COMPLETED', label: 'Standard Repair Completed' },
    { value: 'PART_REPLACEMENT', label: 'Parts Replaced' },
    { value: 'ROUTINE_SERVICE', label: 'Routine Maintenance / Service' },
    { value: 'INSPECTION_ONLY', label: 'Inspection / Diagnosis Only' },
    { value: 'NO_FAULT_FOUND', label: 'No Fault Found' },
    { value: 'TEMPORARY_FIX', label: 'Temporary Fix Applied' },
    { value: 'CUSTOMER_DECLINED', label: 'Customer Declined Further Work' },
];

export const MaintenanceCompletionDrawer: React.FC<MaintenanceCompletionDrawerProps> = ({
    isOpen,
    onClose,
    onSave,
    usedParts,
    onAddPart,
    onRemovePart,
    onAddPartClick,
    initialFaultCode,
    initialMaintenanceNotes,
    isSaving = false,
}) => {
    const [faultCode, setFaultCode] = useState(initialFaultCode || '');
    const [maintenanceNotes, setMaintenanceNotes] = useState(initialMaintenanceNotes || '');
    const [showAddPartsPanel, setShowAddPartsPanel] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

    // Fetch inventory items
    const { data: inventoryItems } = useQuery<InventoryItem[]>({
        queryKey: ['inventory_items'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('inventory_items')
                .select('*')
                .order('name');
            if (error) throw new Error(error.message);
            return (data || []).map(item => snakeToCamelCase(item) as InventoryItem);
        },
        enabled: isOpen && showAddPartsPanel,
    });

    // Filter inventory items
    const filteredItems = useMemo(() => {
        if (!inventoryItems) return [];
        if (!searchTerm) return inventoryItems;

        const query = searchTerm.toLowerCase();
        return inventoryItems.filter(item =>
            item.name?.toLowerCase().includes(query) ||
            item.sku?.toLowerCase().includes(query)
        );
    }, [inventoryItems, searchTerm]);

    const selectedItem = useMemo(() => {
        return inventoryItems?.find(i => i.id === selectedItemId);
    }, [inventoryItems, selectedItemId]);

    // Reset form when opening
    useEffect(() => {
        if (isOpen) {
            setFaultCode(initialFaultCode || '');
            setMaintenanceNotes(initialMaintenanceNotes || '');
            setShowAddPartsPanel(false);
            setSearchTerm('');
            setSelectedItemId(null);
            setQuantity(1);
        }
    }, [isOpen, initialFaultCode, initialMaintenanceNotes]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!faultCode || !maintenanceNotes.trim()) return;
        onSave({ faultCode, maintenanceNotes });
    };

    const handleAddPartToWorkOrder = () => {
        if (!selectedItemId || quantity <= 0) return;
        onAddPart(selectedItemId, quantity);
        // Reset form
        setSelectedItemId(null);
        setQuantity(1);
        setSearchTerm('');
    };

    const totalPartsCost = usedParts.reduce((sum, part) => {
        const p = part as any;
        const item = p.inventory_items || p.inventoryItems || p.inventory_item || p.inventoryItem;
        const price = p.price_at_time_of_use || p.priceAtTimeOfUse || item?.unit_price || item?.unitPrice || 0;
        const qty = p.quantity_used ?? p.quantityUsed ?? 0;
        return sum + (price * qty);
    }, 0);

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-lg">
                                    <form onSubmit={handleSubmit} className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-2xl">
                                        <div className="flex min-h-0 flex-1 flex-col overflow-y-scroll py-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                            <div className="px-4 sm:px-6">
                                                <div className="flex items-start justify-between">
                                                    <Dialog.Title className="text-lg font-semibold leading-6 text-gray-900">
                                                        {showAddPartsPanel ? 'Add Parts' : 'Complete Maintenance'}
                                                    </Dialog.Title>
                                                    <div className="ml-3 flex h-7 items-center">
                                                        <button
                                                            type="button"
                                                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                                            onClick={showAddPartsPanel ? () => setShowAddPartsPanel(false) : onClose}
                                                        >
                                                            <span className="sr-only">Close panel</span>
                                                            <HugeiconsIcon icon={showAddPartsPanel ? ArrowLeft01Icon : Cancel01Icon} size={24} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mt-1">
                                                    <p className="text-sm text-gray-500">
                                                        {showAddPartsPanel
                                                            ? 'Search and add parts used for this work order.'
                                                            : 'Please provide final resolution details and verify parts used before closing this work order.'
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="relative mt-6 flex-1 px-4 sm:px-6 space-y-6">
                                                {showAddPartsPanel ? (
                                                    /* Add Parts Panel */
                                                    <div className="space-y-4">
                                                        {/* Search */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Search Inventory
                                                            </label>
                                                            <div className="relative">
                                                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                                                    <HugeiconsIcon icon={Search01Icon} size={16} className="text-gray-400" />
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    value={searchTerm}
                                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                                    placeholder="Search by name or SKU..."
                                                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Item Selection */}
                                                        <div className="max-h-48 overflow-auto border border-gray-200 rounded-lg">
                                                            {filteredItems.length === 0 ? (
                                                                <div className="p-4 text-center text-sm text-gray-500">
                                                                    {inventoryItems ? 'No items found' : 'Loading...'}
                                                                </div>
                                                            ) : (
                                                                filteredItems.map(item => {
                                                                    const isSelected = selectedItemId === item.id;
                                                                    const qty = (item as any).quantityOnHand ?? item.quantity_on_hand ?? 0;
                                                                    const isOutOfStock = qty === 0;

                                                                    return (
                                                                        <button
                                                                            key={item.id}
                                                                            type="button"
                                                                            onClick={() => setSelectedItemId(item.id)}
                                                                            disabled={isOutOfStock}
                                                                            className={`w-full flex items-center justify-between p-3 text-left border-b border-gray-100 last:border-0 transition-colors ${isSelected
                                                                                ? 'bg-purple-50'
                                                                                : isOutOfStock
                                                                                    ? 'bg-gray-50 opacity-50 cursor-not-allowed'
                                                                                    : 'hover:bg-gray-50'
                                                                                }`}
                                                                        >
                                                                            <div>
                                                                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                                                                <p className="text-xs text-gray-500">{item.sku || 'No SKU'}</p>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <p className={`text-sm font-medium ${isOutOfStock ? 'text-red-600' : 'text-gray-900'}`}>
                                                                                    {formatQuantityWithUnit(qty, (item as any).unitOfMeasure ?? item.unit_of_measure)}
                                                                                </p>
                                                                                <p className="text-xs text-gray-500">UGX {((item as any).unitPrice ?? item.unit_price ?? 0).toLocaleString()}</p>
                                                                            </div>
                                                                        </button>
                                                                    );
                                                                })
                                                            )}
                                                        </div>

                                                        {/* Selected Item Details */}
                                                        {selectedItem && (
                                                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <div>
                                                                        <p className="font-medium text-gray-900">{selectedItem.name}</p>
                                                                        <p className="text-sm text-gray-500">
                                                                            Available: {(selectedItem as any).quantityOnHand ?? selectedItem.quantity_on_hand ?? 0} |
                                                                            Price: UGX {((selectedItem as any).unitPrice ?? selectedItem.unit_price ?? 0).toLocaleString()}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                            Quantity
                                                                        </label>
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            max={(selectedItem as any).quantityOnHand ?? selectedItem.quantity_on_hand ?? 999}
                                                                            value={quantity}
                                                                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                            Total Cost
                                                                        </label>
                                                                        <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium">
                                                                            UGX {(quantity * ((selectedItem as any).unitPrice ?? selectedItem.unit_price ?? 0)).toLocaleString()}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={handleAddPartToWorkOrder}
                                                                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                                >
                                                                    <HugeiconsIcon icon={Add01Icon} size={16} />
                                                                    Add Part to Work Order
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* Back to main form button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowAddPartsPanel(false)}
                                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                                                        >
                                                            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                                                            Back to Completion Form
                                                        </button>
                                                    </div>
                                                ) : (
                                                    /* Main Completion Form */
                                                    <>
                                                        {/* Fault Code Selection */}
                                                        <div>
                                                            <label htmlFor="fault-code" className="block text-sm font-medium text-gray-900">
                                                                Resolution Code <span className="text-red-500">*</span>
                                                            </label>
                                                            <div className="mt-1">
                                                                <select
                                                                    id="fault-code"
                                                                    name="fault-code"
                                                                    className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2"
                                                                    value={faultCode}
                                                                    onChange={(e) => setFaultCode(e.target.value)}
                                                                    required
                                                                >
                                                                    <option value="">Select a resolution code</option>
                                                                    {FAULT_CODES.map((code) => (
                                                                        <option key={code.value} value={code.value}>
                                                                            {code.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                Select the primary outcome of this maintenance service.
                                                            </p>
                                                        </div>

                                                        {/* Maintenance Notes */}
                                                        <div>
                                                            <label htmlFor="maintenance-notes" className="block text-sm font-medium text-gray-900">
                                                                Maintenance Notes <span className="text-red-500">*</span>
                                                            </label>
                                                            <div className="mt-1">
                                                                <textarea
                                                                    id="maintenance-notes"
                                                                    name="maintenance-notes"
                                                                    rows={4}
                                                                    className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm resize-none"
                                                                    placeholder="Describe the work performed, any issues found, and the final solution..."
                                                                    value={maintenanceNotes}
                                                                    onChange={(e) => setMaintenanceNotes(e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Parts Used Section */}
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <label className="block text-sm font-medium text-gray-900">
                                                                    Parts & Materials Used
                                                                </label>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowAddPartsPanel(true)}
                                                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                                                                >
                                                                    <HugeiconsIcon icon={Add01Icon} size={12} />
                                                                    Add Parts
                                                                </button>
                                                            </div>
                                                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                                {usedParts.length === 0 ? (
                                                                    <div className="text-center py-6">
                                                                        <HugeiconsIcon icon={PackageIcon} size={24} className="text-gray-300 mx-auto mb-1" />
                                                                        <p className="text-xs text-gray-400">No parts used yet</p>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setShowAddPartsPanel(true)}
                                                                            className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                                                                        >
                                                                            Add first part
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="divide-y divide-gray-100">
                                                                        {usedParts.map((part) => {
                                                                            const p = part as any;
                                                                            const item = p.inventory_items || p.inventoryItems || p.inventory_item || p.inventoryItem;
                                                                            const price = p.price_at_time_of_use || p.priceAtTimeOfUse || item?.unit_price || item?.unitPrice || 0;
                                                                            const qty = p.quantity_used ?? p.quantityUsed ?? 0;
                                                                            const lineTotal = price * qty;

                                                                            return (
                                                                                <div key={part.id} className="flex items-start gap-2 p-3 group">
                                                                                    <div className="w-6 h-6 bg-white border border-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                                                                        <HugeiconsIcon icon={PackageIcon} size={12} className="text-gray-400" />
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="flex items-start justify-between gap-2">
                                                                                            <div className="flex-1 min-w-0">
                                                                                                <p className="text-xs font-medium text-gray-900 truncate">
                                                                                                    {item?.name || 'Unknown Part'}
                                                                                                </p>
                                                                                                {item?.sku && <p className="text-xs text-gray-500">SKU: {item.sku}</p>}
                                                                                            </div>
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => onRemovePart(part.id)}
                                                                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-gray-400 hover:text-red-500"
                                                                                                title="Remove part"
                                                                                            >
                                                                                                <HugeiconsIcon icon={Delete01Icon} size={12} />
                                                                                            </button>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-3 mt-1 text-xs">
                                                                                            <span className="text-gray-500">
                                                                                                Qty: <span className="font-medium text-gray-700">{qty}</span>
                                                                                            </span>
                                                                                            <span className="text-gray-500">
                                                                                                @ <span className="font-medium text-gray-700">UGX {price.toLocaleString()}</span>
                                                                                            </span>
                                                                                            <span className="text-gray-900 font-semibold ml-auto">UGX {lineTotal.toLocaleString()}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                        {/* Total */}
                                                                        <div className="p-3 bg-gray-50 flex items-center justify-between">
                                                                            <span className="text-xs font-medium text-gray-600">Total Parts Cost</span>
                                                                            <span className="text-sm font-bold text-gray-900">UGX {totalPartsCost.toLocaleString()}</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {usedParts.length === 0 && (
                                                                <div className="mt-2 flex items-start gap-2 p-2 bg-amber-50 rounded-md">
                                                                    <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-amber-600 mt-0.5" />
                                                                    <p className="text-xs text-amber-700">
                                                                        No parts recorded. If parts were used, please add them before completing.
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Footer - only show on main form */}
                                        {!showAddPartsPanel && (
                                            <div className="flex flex-shrink-0 justify-end px-4 py-4 gap-3 bg-gray-50 border-t border-gray-200">
                                                <button
                                                    type="button"
                                                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                                    onClick={onClose}
                                                    disabled={isSaving}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="inline-flex justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50 disabled:cursor-not-allowed gap-2 items-center"
                                                    disabled={isSaving || !faultCode || !maintenanceNotes.trim()}
                                                >
                                                    {isSaving ? 'Completing...' : 'Complete Work Order'}
                                                    {!isSaving && <HugeiconsIcon icon={CheckmarkCircle01Icon} size={18} />}
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};
