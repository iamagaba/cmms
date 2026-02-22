
import React, { Fragment, useState, useEffect, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckCircle, X, AlertCircle, Plus, Search, Trash2, Package, ArrowLeft } from 'lucide-react';
import { Loader } from '@/components/tailwind-components';
import { WorkOrderPart, InventoryItem } from '@/types/supabase';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { snakeToCamelCase } from '@/utils/data-helpers';
import { formatQuantityWithUnit } from '@/utils/inventory-categorization-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
            <Dialog as="div" className="relative z-[150]" onClose={onClose}>
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
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={showAddPartsPanel ? () => setShowAddPartsPanel(false) : onClose}
                                                            className="h-7 w-7"
                                                        >
                                                            <span className="sr-only">Close panel</span>
                                                            {showAddPartsPanel ? <ArrowLeft className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="mt-1">
                                                    <p className="text-sm text-gray-500">
                                                        {showAddPartsPanel
                                                            ? 'Search and add parts used for this work order.'
                                                            : 'Provide final resolution details and verify parts used before closing this work order.'
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
                                                            <Label htmlFor="search-inventory" className="text-xs mb-1.5">
                                                                Search Inventory
                                                            </Label>
                                                            <div className="relative">
                                                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                                                <Input
                                                                    id="search-inventory"
                                                                    type="text"
                                                                    value={searchTerm}
                                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                                    placeholder="Search by name or SKU..."
                                                                    className="pl-10"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Item Selection */}
                                                        <div className="max-h-48 overflow-auto border border-gray-200 rounded-lg">
                                                            {filteredItems.length === 0 ? (
                                                                <div className="p-4 text-center text-sm text-gray-500 flex justify-center">
                                                                    {inventoryItems ? 'No items found' : <Loader size="sm" />}
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
                                                                                ? 'bg-primary/5'
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
                                                                                <p className={`text-sm font-medium ${isOutOfStock ? 'text-destructive' : 'text-gray-900'}`}>
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
                                                            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <div>
                                                                        <p className="font-medium text-foreground">{selectedItem.name}</p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            Available: {(selectedItem as any).quantityOnHand ?? selectedItem.quantity_on_hand ?? 0} |
                                                                            Price: UGX {((selectedItem as any).unitPrice ?? selectedItem.unit_price ?? 0).toLocaleString()}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div>
                                                                        <Label htmlFor="quantity" className="text-xs mb-1.5">
                                                                            Quantity
                                                                        </Label>
                                                                        <Input
                                                                            id="quantity"
                                                                            type="number"
                                                                            min="1"
                                                                            max={(selectedItem as any).quantityOnHand ?? selectedItem.quantity_on_hand ?? 999}
                                                                            value={quantity}
                                                                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-xs mb-1.5">
                                                                            Total Cost
                                                                        </Label>
                                                                        <div className="px-3 py-2 bg-muted rounded-lg text-sm font-medium h-10 flex items-center">
                                                                            UGX {(quantity * ((selectedItem as any).unitPrice ?? selectedItem.unit_price ?? 0)).toLocaleString()}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    onClick={handleAddPartToWorkOrder}
                                                                    className="mt-4 w-full"
                                                                >
                                                                    <Plus className="w-4 h-4 mr-1.5" />
                                                                    Add Part to Work Order
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {/* Back to main form button */}
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setShowAddPartsPanel(false)}
                                                            className="w-full"
                                                        >
                                                            <ArrowLeft className="w-4 h-4 mr-1.5" />
                                                            Back to Completion Form
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    /* Main Completion Form */
                                                    <>
                                                        {/* Fault Code Selection */}
                                                        <div>
                                                            <Label htmlFor="fault-code" className="text-xs mb-1.5">
                                                                Resolution Code <span className="text-destructive">*</span>
                                                            </Label>
                                                            <Select value={faultCode} onValueChange={setFaultCode} required>
                                                                <SelectTrigger id="fault-code">
                                                                    <SelectValue placeholder="Select a resolution code" />
                                                                </SelectTrigger>
                                                                <SelectContent className="z-[200]">
                                                                    {FAULT_CODES.map((code) => (
                                                                        <SelectItem key={code.value} value={code.value}>
                                                                            {code.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                Select the primary outcome of this maintenance service.
                                                            </p>
                                                        </div>

                                                        {/* Maintenance Notes */}
                                                        <div>
                                                            <Label htmlFor="maintenance-notes" className="text-xs mb-1.5">
                                                                Maintenance Notes <span className="text-destructive">*</span>
                                                            </Label>
                                                            <Textarea
                                                                id="maintenance-notes"
                                                                rows={4}
                                                                placeholder="Describe the work performed, any issues found, and the final solution..."
                                                                value={maintenanceNotes}
                                                                onChange={(e) => setMaintenanceNotes(e.target.value)}
                                                                required
                                                            />
                                                        </div>

                                                        {/* Parts Used Section */}
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <Label className="text-xs">
                                                                    Parts & Materials Used
                                                                </Label>
                                                                <Button
                                                                    type="button"
                                                                    variant="link"
                                                                    size="sm"
                                                                    onClick={() => setShowAddPartsPanel(true)}
                                                                    className="h-auto p-0 text-xs"
                                                                >
                                                                    <Plus className="w-4 h-4 mr-1" />
                                                                    Add Parts
                                                                </Button>
                                                            </div>
                                                            <div className="border border-border rounded-lg overflow-hidden">
                                                                {usedParts.length === 0 ? (
                                                                    <div className="text-center py-6">
                                                                        <Package className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                                                                        <p className="text-xs text-muted-foreground">No parts used yet</p>
                                                                        <Button
                                                                            type="button"
                                                                            variant="link"
                                                                            size="sm"
                                                                            onClick={() => setShowAddPartsPanel(true)}
                                                                            className="mt-2 h-auto p-0 text-xs"
                                                                        >
                                                                            Add first part
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="divide-y divide-border">
                                                                        {usedParts.map((part) => {
                                                                            const p = part as any;
                                                                            const item = p.inventory_items || p.inventoryItems || p.inventory_item || p.inventoryItem;
                                                                            const price = p.price_at_time_of_use || p.priceAtTimeOfUse || item?.unit_price || item?.unitPrice || 0;
                                                                            const qty = p.quantity_used ?? p.quantityUsed ?? 0;
                                                                            const lineTotal = price * qty;

                                                                            return (
                                                                                <div key={part.id} className="flex items-start gap-2 p-3 group">
                                                                                    <div className="w-6 h-6 bg-background border border-border rounded flex items-center justify-center flex-shrink-0">
                                                                                        <Package className="w-4 h-4 text-muted-foreground" />
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="flex items-start justify-between gap-2">
                                                                                            <div className="flex-1 min-w-0">
                                                                                                <p className="text-xs font-medium truncate">
                                                                                                    {item?.name || 'Unknown Part'}
                                                                                                </p>
                                                                                                {item?.sku && <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>}
                                                                                            </div>
                                                                                            <Button
                                                                                                type="button"
                                                                                                variant="ghost"
                                                                                                size="icon"
                                                                                                onClick={() => onRemovePart(part.id)}
                                                                                                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                                                                                                title="Remove part"
                                                                                            >
                                                                                                <Trash2 className="w-4 h-4" />
                                                                                            </Button>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-3 mt-1 text-xs">
                                                                                            <span className="text-muted-foreground">
                                                                                                Qty: <span className="font-medium text-foreground">{qty}</span>
                                                                                            </span>
                                                                                            <span className="text-muted-foreground">
                                                                                                @ <span className="font-medium text-foreground">UGX {price.toLocaleString()}</span>
                                                                                            </span>
                                                                                            <span className="font-semibold ml-auto">UGX {lineTotal.toLocaleString()}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                        {/* Total */}
                                                                        <div className="p-3 bg-muted flex items-center justify-between">
                                                                            <span className="text-xs font-medium text-muted-foreground">Total Parts Cost</span>
                                                                            <span className="text-sm font-bold">UGX {totalPartsCost.toLocaleString()}</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {usedParts.length === 0 && (
                                                                <div className="mt-2 flex items-start gap-2 p-2 bg-amber-50 rounded-md">
                                                                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                                                    <p className="text-xs text-amber-700">
                                                                        No parts recorded. If parts were used, add them before completing.
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
                                            <div className="flex flex-shrink-0 justify-end px-4 py-4 gap-3 bg-muted border-t border-border">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={onClose}
                                                    disabled={isSaving}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    className="bg-emerald-600 hover:bg-emerald-500"
                                                    disabled={isSaving || !faultCode || !maintenanceNotes.trim()}
                                                >
                                                    {isSaving ? 'Completing...' : 'Complete Work Order'}
                                                    {!isSaving && <CheckCircle className="w-4 h-4 ml-1.5" />}
                                                </Button>
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


