import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  UserIcon, 
  Call02Icon, 
  Mail01Icon, 
  Location01Icon,
  Cancel01Icon,
  Tick01Icon,
  RecordIcon,
  ClipboardIcon,
  Wrench01Icon,
  Add01Icon,
  ToolsIcon,
  FloppyDiskIcon
} from '@hugeicons/core-free-icons';
import { Technician, Location } from '@/types/supabase';
import { Input } from '@/components/ui/enterprise';
import { useDensitySpacing } from '@/hooks/useDensitySpacing';
import { useDensity } from '@/context/DensityContext';

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
    const spacing = useDensitySpacing();
    const { isCompact } = useDensity();

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
                <div className={`flex items-center justify-between ${spacing.card} border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0`}>
                    <div>
                        <h2 className={`${spacing.text.heading} font-semibold text-gray-900 dark:text-gray-100`}>
                            {technician ? 'Edit Technician' : 'Add New Technician'}
                        </h2>
                        <p className={`${spacing.text.caption} text-gray-500 dark:text-gray-400 mt-0.5`}>
                            {technician ? 'Update technician information and assignments' : 'Create a new technician profile'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`${isCompact ? 'p-1.5' : 'p-2'} text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors`}
                    >
                        <HugeiconsIcon icon={Cancel01Icon} size={spacing.icon.lg} />
                    </button>
                </div>

                {/* Form Content - Scrollable */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    <div className={`${spacing.card} ${spacing.section}`}>
                        {/* Basic Information Section */}
                        <div>
                            <h3 className={`${spacing.text.label} text-gray-500 dark:text-gray-400 ${spacing.mb}`}>Basic Information</h3>
                            <div className={spacing.section}>
                                {/* Name */}
                                <div>
                                    <label className={`block ${spacing.text.body} font-medium text-gray-700 dark:text-gray-300 mb-1.5`}>
                                        Full Name <span className="text-error-600">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        required
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter technician name"
                                        leftIcon={<HugeiconsIcon icon={UserIcon} size={spacing.icon.sm} className="text-gray-400" />}
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className={`block ${spacing.text.body} font-medium text-gray-700 dark:text-gray-300 mb-1.5`}>
                                        Email Address
                                    </label>
                                    <Input
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="technician@example.com"
                                        leftIcon={<HugeiconsIcon icon={Mail01Icon} size={spacing.icon.sm} className="text-gray-400" />}
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className={`block ${spacing.text.body} font-medium text-gray-700 dark:text-gray-300 mb-1.5`}>
                                        Phone Number
                                    </label>
                                    <Input
                                        type="tel"
                                        value={formData.phone || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        placeholder="+256 XXX XXX XXX"
                                        leftIcon={<HugeiconsIcon icon={Call02Icon} size={spacing.icon.sm} className="text-gray-400" />}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Assignment Section */}
                        <div className={`pt-4 border-t border-gray-200 dark:border-gray-800`}>
                            <h3 className={`${spacing.text.label} text-gray-500 dark:text-gray-400 ${spacing.mb}`}>Assignment Details</h3>
                            <div className={spacing.section}>
                                {/* Status */}
                                <div>
                                    <label className={`block ${spacing.text.body} font-medium text-gray-700 dark:text-gray-300 mb-1.5`}>
                                        Status
                                    </label>
                                    <div className="relative">
                                        <HugeiconsIcon icon={RecordIcon} size={spacing.icon.sm} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        <select
                                            value={formData.status || 'available'}
                                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'available' | 'busy' | 'offline' }))}
                                            className={`w-full pl-10 pr-4 ${spacing.input} bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 ${spacing.rounded} text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                                        >
                                            <option value="available">Available</option>
                                            <option value="busy">Busy</option>
                                            <option value="offline">Offline</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className={`block ${spacing.text.body} font-medium text-gray-700 dark:text-gray-300 mb-1.5`}>
                                        Location
                                    </label>
                                    <div className="relative">
                                        <HugeiconsIcon icon={Location01Icon} size={spacing.icon.sm} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        <select
                                            value={formData.location_id || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, location_id: e.target.value }))}
                                            className={`w-full pl-10 pr-4 ${spacing.input} bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 ${spacing.rounded} text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
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
                                    <label className={`block ${spacing.text.body} font-medium text-gray-700 dark:text-gray-300 mb-1.5`}>
                                        Max Concurrent Work Orders
                                    </label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={formData.max_concurrent_orders || 5}
                                        onChange={(e) => setFormData(prev => ({ ...prev, max_concurrent_orders: parseInt(e.target.value) }))}
                                        leftIcon={<HugeiconsIcon icon={ClipboardIcon} size={spacing.icon.sm} className="text-gray-400" />}
                                    />
                                    <p className={`mt-1.5 ${spacing.text.caption} text-gray-500 dark:text-gray-400`}>
                                        Maximum number of work orders this technician can handle simultaneously
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Specializations Section */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                            <h3 className={`${spacing.text.label} text-gray-500 dark:text-gray-400 ${spacing.mb}`}>Specializations & Skills</h3>
                            <div className={spacing.section}>
                                <div className={`flex ${spacing.gap}`}>
                                    <Input
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                        placeholder="Add a specialization (e.g., Electrical, Engine)"
                                        leftIcon={<HugeiconsIcon icon={Wrench01Icon} size={spacing.icon.sm} className="text-gray-400" />}
                                        className="flex-1"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddSkill}
                                        className={`${spacing.button} bg-primary-600 hover:bg-primary-700 text-white ${spacing.rounded} transition-colors flex items-center ${spacing.gap} font-medium`}
                                    >
                                        <HugeiconsIcon icon={Add01Icon} size={spacing.icon.sm} />
                                        Add
                                    </button>
                                </div>
                                {formData.specializations && formData.specializations.length > 0 && (
                                    <div className={`bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 ${spacing.roundedLg} ${spacing.card}`}>
                                        <div className={`flex flex-wrap ${spacing.gap}`}>
                                            {formData.specializations.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className={`inline-flex items-center ${spacing.gap} px-3 py-1.5 ${spacing.rounded} ${spacing.text.body} font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800`}
                                                >
                                                    <HugeiconsIcon icon={Tick01Icon} size={spacing.icon.xs} />
                                                    {skill}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveSkill(skill)}
                                                        className="ml-1 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                                                    >
                                                        <HugeiconsIcon icon={Cancel01Icon} size={spacing.icon.xs} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {(!formData.specializations || formData.specializations.length === 0) && (
                                    <div className={`text-center ${spacing.card} bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 ${spacing.roundedLg}`}>
                                        <HugeiconsIcon icon={ToolsIcon} size={spacing.icon.xl} className="text-gray-400 mx-auto mb-2" />
                                        <p className={`${spacing.text.body} text-gray-500 dark:text-gray-400`}>No specializations added yet</p>
                                        <p className={`${spacing.text.caption} text-gray-400 dark:text-gray-500 mt-1`}>Add skills to help with work order assignment</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer - Fixed at bottom */}
                <div className={`${spacing.card} border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex-shrink-0`}>
                    <div className={`flex items-center justify-between ${spacing.gap}`}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`${spacing.button} border border-gray-300 dark:border-gray-700 ${spacing.rounded} font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className={`${spacing.button} bg-primary-600 hover:bg-primary-700 text-white font-medium ${spacing.rounded} transition-colors flex items-center ${spacing.gap}`}
                        >
                            <HugeiconsIcon icon={technician ? FloppyDiskIcon : Add01Icon} size={spacing.icon.sm} />
                            {technician ? 'Update Technician' : 'Create Technician'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
