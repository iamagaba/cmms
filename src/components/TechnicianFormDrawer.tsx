import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Technician, Location } from '@/types/supabase';
import { Input } from '@/components/ui/enterprise';

interface TechnicianFormDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Technician>) => void;
    technician?: Technician | null;
    locations: Location[];
}

export const TechnicianFormDrawer: React.FC<TechnicianFormDrawerProps> = ({
    isOpen,
    onClose,
    onSubmit,
    technician,
    locations
}) => {
    const [formData, setFormData] = useState<Partial<Technician>>({
        name: '',
        email: '',
        phone: '',
        status: 'available',
        specializations: [],
        location_id: '',
        max_concurrent_orders: 5,
    });

    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        if (technician) {
            setFormData({
                id: technician.id,
                name: technician.name || '',
                email: technician.email || '',
                phone: technician.phone || '',
                status: technician.status || 'available',
                specializations: technician.specializations || [],
                location_id: technician.location_id || '',
                max_concurrent_orders: technician.max_concurrent_orders || 5,
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                status: 'available',
                specializations: [],
                location_id: '',
                max_concurrent_orders: 5,
            });
        }
    }, [technician, isOpen]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleAddSkill = () => {
        if (newSkill.trim() && !formData.specializations?.includes(newSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                specializations: [...(prev.specializations || []), newSkill.trim()]
            }));
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            specializations: prev.specializations?.filter(skill => skill !== skillToRemove) || []
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

            {/* Drawer */}
            <div
                className="relative w-full max-w-lg bg-white dark:bg-gray-950 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {technician ? 'Edit Technician' : 'Add New Technician'}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {technician ? 'Update technician information and assignments' : 'Create a new technician profile'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <Icon icon="tabler:x" className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Content - Scrollable */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    <div className="p-6 space-y-6">
                        {/* Basic Information Section */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Basic Information</h3>
                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Full Name <span className="text-error-600">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        required
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter technician name"
                                        leftIcon={<Icon icon="tabler:user" className="w-4 h-4 text-gray-400" />}
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Email Address
                                    </label>
                                    <Input
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="technician@example.com"
                                        leftIcon={<Icon icon="tabler:mail" className="w-4 h-4 text-gray-400" />}
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Phone Number
                                    </label>
                                    <Input
                                        type="tel"
                                        value={formData.phone || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        placeholder="+256 XXX XXX XXX"
                                        leftIcon={<Icon icon="tabler:phone" className="w-4 h-4 text-gray-400" />}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Assignment Section */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Assignment Details</h3>
                            <div className="space-y-4">
                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Status
                                    </label>
                                    <div className="relative">
                                        <Icon icon="tabler:circle-dot" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        <select
                                            value={formData.status || 'available'}
                                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'available' | 'busy' | 'offline' }))}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            <option value="available">Available</option>
                                            <option value="busy">Busy</option>
                                            <option value="offline">Offline</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Location
                                    </label>
                                    <div className="relative">
                                        <Icon icon="tabler:map-pin" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        <select
                                            value={formData.location_id || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, location_id: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            <option value="">Select a location</option>
                                            {locations.map(location => (
                                                <option key={location.id} value={location.id}>
                                                    {location.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Max Concurrent Orders */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Max Concurrent Work Orders
                                    </label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={formData.max_concurrent_orders || 5}
                                        onChange={(e) => setFormData(prev => ({ ...prev, max_concurrent_orders: parseInt(e.target.value) }))}
                                        leftIcon={<Icon icon="tabler:clipboard-list" className="w-4 h-4 text-gray-400" />}
                                    />
                                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                        Maximum number of work orders this technician can handle simultaneously
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Specializations Section */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Specializations & Skills</h3>
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                        placeholder="Add a specialization (e.g., Electrical, Engine)"
                                        leftIcon={<Icon icon="tabler:tool" className="w-4 h-4 text-gray-400" />}
                                        className="flex-1"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddSkill}
                                        className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                                    >
                                        <Icon icon="tabler:plus" className="w-4 h-4" />
                                        Add
                                    </button>
                                </div>
                                {formData.specializations && formData.specializations.length > 0 && (
                                    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {formData.specializations.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
                                                >
                                                    <Icon icon="tabler:check" className="w-3.5 h-3.5" />
                                                    {skill}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveSkill(skill)}
                                                        className="ml-1 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                                                    >
                                                        <Icon icon="tabler:x" className="w-3.5 h-3.5" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {(!formData.specializations || formData.specializations.length === 0) && (
                                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                        <Icon icon="tabler:tools-off" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No specializations added yet</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add skills to help with work order assignment</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer - Fixed at bottom */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
                    <div className="flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Icon icon={technician ? "tabler:device-floppy" : "tabler:plus"} className="w-4 h-4" />
                            {technician ? 'Update Technician' : 'Create Technician'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
