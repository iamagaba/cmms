import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert01Icon, Loading03Icon } from '@hugeicons/core-free-icons';

interface DeleteConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    itemName?: string;
    isDeleting?: boolean;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    itemName,
    isDeleting = false,
}) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-100 dark:border-gray-700">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-error-50 dark:bg-error-900/30 flex items-center justify-center">
                                        <HugeiconsIcon icon={Alert01Icon} size={20} className="text-error-600 dark:text-error-400" />
                                    </div>
                                    <div className="flex-1">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                                        >
                                            {title}
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {message}
                                            </p>
                                            {itemName && (
                                                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700">
                                                    {itemName}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-6 flex items-center gap-3 justify-end">
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                                                onClick={onClose}
                                                disabled={isDeleting}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-lg border border-transparent bg-error-600 px-4 py-2 text-sm font-medium text-white hover:bg-error-700 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                onClick={onConfirm}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting && <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />}
                                                {isDeleting ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
