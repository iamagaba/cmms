import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, User, Search } from 'lucide-react';
import { Technician } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
                    <div className="flex items-center justify-between border-b border-border px-6 py-4">
                        <Dialog.Title className="text-base font-semibold text-foreground">
                            Assign Technician
                        </Dialog.Title>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="p-6">
                        <div className="bg-muted text-muted-foreground p-3 rounded-lg text-sm mb-4">
                            Assigning a technician will automatically move this work order to <strong>In Progress</strong>.
                        </div>

                        {/* Search */}
                        <div className="relative mb-4">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search technicians..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* List */}
                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                            {filteredTechnicians.map((tech) => (
                                <Button
                                    key={tech.id}
                                    variant="outline"
                                    onClick={() => onAssign(tech.id)}
                                    disabled={isAssigning}
                                    className="flex w-full items-center gap-3 h-auto p-3 justify-start hover:border-primary/20 hover:bg-primary/5"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium text-foreground">{tech.name}</div>
                                        <div className="text-xs text-muted-foreground">{tech.email || 'No email'}</div>
                                    </div>
                                </Button>
                            ))}

                            {filteredTechnicians.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-sm">
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



