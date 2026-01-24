import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Add01Icon } from '@hugeicons/core-free-icons';
import { Technician, Location } from '@/types/supabase';


interface TechnicianFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Technician>) => void;
  technician?: Technician | null;
  locations: Location[];
}

export const TechnicianFormDialog: React.FC<TechnicianFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  technician,
  locations
}) => {
  technician,
    locations
}) => {
  const [formData, setFormData] = useState<Partial<Technician>>({
    name: '',
    email: '',
    phone: '',
    status: 'available',
    specializations: [],
    locationId: '',
    maxConcurrentOrders: 5,
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
        locationId: technician.locationId || '',
        maxConcurrentOrders: technician.maxConcurrentOrders || 5,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        status: 'available',
        specializations: [],
        locationId: '',
        maxConcurrentOrders: 5,
      });
    }
  }, [technician]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md backdrop-saturate-150" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {technician ? 'Edit Technician' : 'Add New Technician'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter technician name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter email address"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter phone number"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'available' | 'busy' | 'offline' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <select
              value={formData.locationId}
              onChange={(e) => setFormData(prev => ({ ...prev, locationId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a location</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          {/* Max Concurrent Orders */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Concurrent Orders
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.maxConcurrentOrders}
              onChange={(e) => setFormData(prev => ({ ...prev, maxConcurrentOrders: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Specializations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specializations
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a specialization"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <HugeiconsIcon icon={Add01Icon} size={16} />
              </button>
            </div>
            {formData.specializations && formData.specializations.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.specializations.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
            >
              {technician ? 'Update' : 'Create'} Technician
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
