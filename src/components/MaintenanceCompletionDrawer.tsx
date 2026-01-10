
import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    CheckmarkCircle01Icon,
    Cancel01Icon,
    AlertCircleIcon,
    Archive02Icon // Using Archive/Save icon for completion
} from '@hugeicons/core-free-icons';
import { WorkOrderPart } from '@/types/supabase';
import { WorkOrderPartsUsedCard } from '@/components/work-order-details/WorkOrderPartsUsedCard';
import { useDensitySpacing } from '@/hooks/useDensitySpacing';

interface MaintenanceCompletionDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { faultCode: string; maintenanceNotes: string }) => void;
    usedParts: WorkOrderPart[];
    onAddPart: (itemId: string, quantity: number) => void;
    onRemovePart: (partId: string) => void;
    onAddPartClick: () => void;
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
    const spacing = useDensitySpacing();

    // Reset form when opening
    useEffect(() => {
        if (isOpen) {
            setFaultCode(initialFaultCode || '');
            setMaintenanceNotes(initialMaintenanceNotes || '');
        }
    }, [isOpen, initialFaultCode, initialMaintenanceNotes]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!faultCode || !maintenanceNotes.trim()) return;
        onSave({ faultCode, maintenanceNotes });
    };

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
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <form onSubmit={handleSubmit} className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-2xl">
                                        <div className="flex min-h-0 flex-1 flex-col overflow-y-scroll py-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                            <div className="px-4 sm:px-6">
                                                <div className="flex items-start justify-between">
                                                    <Dialog.Title className="text-lg font-semibold leading-6 text-gray-900">
                                                        Complete Maintenance
                                                    </Dialog.Title>
                                                    <div className="ml-3 flex h-7 items-center">
                                                        <button
                                                            type="button"
                                                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                                            onClick={onClose}
                                                        >
                                                            <span className="sr-only">Close panel</span>
                                                            <HugeiconsIcon icon={Cancel01Icon} size={24} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mt-1">
                                                    <p className="text-sm text-gray-500">
                                                        Please provide final resolution details and verify parts used before closing this work order.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="relative mt-6 flex-1 px-4 sm:px-6 space-y-6">

                                                {/* Fault Code Selection */}
                                                <div>
                                                    <label htmlFor="fault-code" className="block text-sm font-medium text-gray-900">
                                                        Resolution Code <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="mt-1">
                                                        <select
                                                            id="fault-code"
                                                            name="fault-code"
                                                            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${spacing.input}`}
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
                                                            rows={6}
                                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm resize-none"
                                                            placeholder="Describe the work performed, any issues found, and the final solution..."
                                                            value={maintenanceNotes}
                                                            onChange={(e) => setMaintenanceNotes(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {/* Parts Used Verification */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                                        Parts & Materials Used
                                                    </label>
                                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                        <WorkOrderPartsUsedCard
                                                            usedParts={usedParts}
                                                            setIsAddPartDialogOpen={(open) => {
                                                                if (open) onAddPartClick();
                                                            }}
                                                            handleAddPart={onAddPart}
                                                            handleRemovePart={onRemovePart}
                                                        />
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

                                            </div>
                                        </div>

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
