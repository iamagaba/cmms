import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, User, Search, MapPin } from 'lucide-react';
import { Technician } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AssignTechnicianModalProps {
    open: boolean;
    onClose: () => void;
    technicians: Technician[];
    onAssign: (technicianId: string) => void;
    isAssigning?: boolean;
    locations?: any[]; // Add locations prop to get service center names
}

export const AssignTechnicianModal: React.FC<AssignTechnicianModalProps> = ({
    open,
    onClose,
    technicians = [],
    onAssign,
    isAssigning = false,
    locations = []
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTechnicians = technicians.filter(tech =>
        tech.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get technician initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Get status dot color
    const getStatusDotColor = (status?: string) => {
        switch (status) {
            case 'available':
                return 'bg-emerald-500';
            case 'busy':
                return 'bg-amber-500';
            case 'offline':
                return 'bg-gray-400';
            default:
                return 'bg-gray-400';
        }
    };

    // Get location name
    const getLocationName = (locationId?: string | null) => {
        if (!locationId) return 'No service center';
        const location = locations.find(loc => loc.id === locationId);
        return location?.name || 'Unknown location';
    };

    return (
        <Dialog open={open} onClose={onClose} className="relative z-[110]">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-md rounded-lg bg-card shadow-sm border border-border">
                    <div className="flex items-center justify-between border-b border-border px-6 py-4">
                        <Dialog.Title className="text-base font-semibold text-foreground">
                            Assign Technician
                        </Dialog.Title>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8"
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
                                <button
                                    key={tech.id}
                                    onClick={() => onAssign(tech.id)}
                                    disabled={isAssigning || tech.status === 'offline'}
                                    className="flex w-full items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left group"
                                >
                                    {/* Avatar with initials and status dot */}
                                    <div className="relative shrink-0">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm group-hover:bg-primary/20 transition-colors">
                                            {getInitials(tech.name)}
                                        </div>
                                        {/* Status indicator dot */}
                                        <div className={`w-3 h-3 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-card ${getStatusDotColor(tech.status)}`} />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-foreground">{tech.name}</div>
                                        
                                        {/* Service Center */}
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                            <MapPin className="w-3 h-3" />
                                            <span className="truncate">{getLocationName(tech.location_id)}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}

                            {/* Empty State */}
                            {filteredTechnicians.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                                        <User className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground mb-1">
                                        No technicians found
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {searchQuery 
                                            ? `No results for "${searchQuery}". Try a different search.`
                                            : 'No technicians are available at the moment.'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};



