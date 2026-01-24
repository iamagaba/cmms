import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, UserIcon, Search01Icon } from '@hugeicons/core-free-icons';
import { Technician } from '@/types/supabase';
import { Button } from '@/components/tailwind-components';

interface AssignTechnicianModalProps {
    open: boolean;
    onClose: () => void;
    technicians: Technician[];
    onAssign: (technicianId: string) => void;
    isAssigning?: boolean;
}

export const AssignTechnicianModal: React.FC<AssignTechnicianModalProps> = ({
    open,
    onClose,
    technicians = [],
    onAssign,
    isAssigning = false
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTechnicians = technicians.filter(tech =>
        tech.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={open} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-md rounded-lg bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                        <Dialog.Title className="text-lg font-semibold text-gray-900">
                            Assign Technician
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-500"
                        >
                            <HugeiconsIcon icon={Cancel01Icon} size={20} />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm mb-4">
                            Assigning a technician will automatically move this work order to <strong>In Progress</strong>.
                        </div>

                        {/* Search */}
                        <div className="relative mb-4">
                            <HugeiconsIcon
                                icon={Search01Icon}
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Search technicians..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-purple-500 focus:bg-white focus:ring-1 focus:ring-purple-500"
                            />
                        </div>

                        {/* List */}
                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                            {filteredTechnicians.map((tech) => (
                                <button
                                    key={tech.id}
                                    onClick={() => onAssign(tech.id)}
                                    disabled={isAssigning}
                                    className="flex w-full items-center gap-3 rounded-lg border border-gray-100 p-3 hover:border-purple-200 hover:bg-purple-50 transition-colors text-left disabled:opacity-50"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                                        <HugeiconsIcon icon={UserIcon} size={20} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{tech.name}</div>
                                        <div className="text-xs text-gray-500">{tech.email || 'No email'}</div>
                                    </div>
                                </button>
                            ))}

                            {filteredTechnicians.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-sm">
                                    No technicians found matching "{searchQuery}"
                                </div>
                            )}
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};
