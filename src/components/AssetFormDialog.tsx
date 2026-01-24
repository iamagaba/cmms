import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Motorbike01Icon,
  Cancel01Icon,
  Tick01Icon,
  UserIcon,
  Search01Icon,
  CheckmarkCircle01Icon,
  InformationCircleIcon,
  Wrench01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Loading01Icon
} from '@hugeicons/core-free-icons';
import { Vehicle, Customer } from '@/types/supabase';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { snakeToCamelCase } from '@/utils/data-helpers';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AssetFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicleData: Partial<Vehicle>) => Promise<void>;
  vehicle?: Vehicle;
  customers?: Customer[];
}

export const AssetFormDialog: React.FC<AssetFormDialogProps> = ({ isOpen, onClose, onSave, vehicle }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    license_plate: '',
    make: '',
    model: '',
    year: new Date().getFullYear(), // Default to current year
    vin: '',
    motor_number: '',
    mileage: undefined,
    status: 'Normal',
    is_emergency_bike: false,
    customer_id: '',
    date_of_manufacture: undefined,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownershipType, setOwnershipType] = useState<'Individual' | 'WATU' | 'Business'>('Individual');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const { toast } = useToast();

  // Validation helper
  const showValidationError = (message: string) => {
    toast({
      title: "Validation Error",
      description: message,
      variant: "destructive"
    });
  };

  // Disable emergency bike flag when ownership type changes to non-Business
  useEffect(() => {
    if (ownershipType !== 'Business' && formData.is_emergency_bike) {
      setFormData(prev => ({ ...prev, is_emergency_bike: false }));
    }
  }, [ownershipType]);

  // Fetch customers for dropdown
  const { data: customers } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      if (error) throw error;
      return (data || []).map(c => snakeToCamelCase(c)) as Customer[];
    },
  });

  // Filter customers based on search query
  const filteredCustomers = customers?.filter(customer => {
    const query = searchQuery.toLowerCase();
    const name = (customer.name || '').toLowerCase();
    const phone = (customer.phone || '').toLowerCase();
    return name.includes(query) || phone.includes(query);
  }) || [];

  // Initialize form with vehicle data when editing
  useEffect(() => {
    if (vehicle) {
      setFormData({
        id: vehicle.id, // CRITICAL: Include ID for updates
        license_plate: vehicle.license_plate || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || undefined,
        vin: vehicle.vin || '',
        motor_number: vehicle.motor_number || '',
        mileage: vehicle.mileage || undefined,
        status: vehicle.status || 'Normal',
        is_emergency_bike: vehicle.is_emergency_bike || false,
        customer_id: vehicle.customer_id || '',
        date_of_manufacture: vehicle.date_of_manufacture || undefined,
      });

      // Set ownership type based on vehicle data
      if (vehicle.is_company_asset) {
        setOwnershipType('Business');
      } else if (vehicle.customer_id && customers) {
        // Try to infer from customer type if possible, or default to Individual
        const customer = customers.find(c => c.id === vehicle.customer_id);
        if (customer?.customer_type === 'WATU') {
          setOwnershipType('WATU');
        } else {
          setOwnershipType('Individual');
        }
      } else {
        setOwnershipType('Individual');
      }

      // Load existing customer data if editing
      if (vehicle.customer_id && customers) {
        const customer = customers.find(c => c.id === vehicle.customer_id);
        if (customer) {
          setOwnerName(customer.name || '');
          setOwnerPhone(customer.phone || '');
        }
      }
    } else {
      setFormData({
        license_plate: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        vin: '',
        motor_number: '',
        mileage: undefined,
        status: 'Normal',
        is_emergency_bike: false,
        customer_id: '',
        date_of_manufacture: undefined,
      });
      setOwnerName('');
      setOwnerPhone('');
      setOwnershipType('Individual');
      setSearchQuery('');
      setCurrentStep(1);
    }
  }, [vehicle, isOpen, customers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!ownerName || !ownerPhone) {
      showValidationError('Please provide owner name and phone number');
      return;
    }

    if (!formData.license_plate || !formData.make || !formData.model || !formData.vin || !formData.year) {
      showValidationError('Please fill in all required fields (License Plate, Make, Model, VIN, Year)');
      return;
    }

    setIsSaving(true);
    try {
      // Create or update customer if name or phone is provided
      let customerId = formData.customer_id;

      if (ownerName || ownerPhone) {
        if (customerId) {
          // Update existing customer
          const { error } = await supabase
            .from('customers')
            .update({
              name: ownerName || null,
              phone: ownerPhone || null,
            })
            .eq('id', customerId);

          if (error) {
            console.error('Error updating customer:', error);
            throw error;
          }
        } else {
          // Create new customer
          const { data: newCustomer, error } = await supabase
            .from('customers')
            .insert({
              name: ownerName || null,
              phone: ownerPhone || null,
            })
            .select()
            .single();

          if (error) {
            console.error('Error creating customer:', error);
            throw error;
          }
          customerId = newCustomer.id;
        }
      }

      // Calculate warranty dates if date_of_manufacture is provided
      const dataToSave = { ...formData, customer_id: customerId };

      // Set is_company_asset based on ownership type
      dataToSave.is_company_asset = ownershipType === 'Business';

      // Ensure optional fields are null if empty (not empty strings)
      if (!dataToSave.motor_number || dataToSave.motor_number.trim() === '') {
        dataToSave.motor_number = null;
      }

      // Ensure mileage is a number or null
      if (dataToSave.mileage === undefined || dataToSave.mileage === null || isNaN(dataToSave.mileage)) {
        dataToSave.mileage = null;
      }

      // VIN and year are required by database - ensure they have values
      if (!dataToSave.vin || dataToSave.vin.trim() === '') {
        showValidationError('VIN is required');
        return;
      }
      if (!dataToSave.year) {
        showValidationError('Year is required');
        return;
      }

      if (formData.date_of_manufacture) {
        const manufactureDate = new Date(formData.date_of_manufacture);
        const warrantyEndDate = new Date(manufactureDate);
        warrantyEndDate.setFullYear(warrantyEndDate.getFullYear() + 1);

        dataToSave.warranty_start_date = formData.date_of_manufacture;
        dataToSave.warranty_end_date = warrantyEndDate.toISOString();
        dataToSave.warranty_months = 12;
      }

      console.log('=== FORM SUBMIT DEBUG ===');
      console.log('Form data before processing:', formData);
      console.log('Owner info:', { ownerName, ownerPhone, ownershipType });
      console.log('Customer ID:', customerId);
      console.log('Final data to save:', dataToSave);

      await onSave(dataToSave);
      console.log('Asset saved successfully, closing dialog');

      // Reset form and close dialog
      setFormData({
        license_plate: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        vin: '',
        motor_number: '',
        mileage: undefined,
        status: 'Normal',
        is_emergency_bike: false,
        customer_id: '',
        date_of_manufacture: undefined,
      });
      setOwnerName('');
      setOwnerPhone('');
      setOwnershipType('Individual');
      setSearchQuery('');
      setCurrentStep(1);
      onClose();
    } catch (error) {
      console.error('Error saving asset:', error);
      toast({
        title: "Error",
        description: "Failed to save asset. Please check the console for details.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setFormData({ ...formData, customer_id: customer.id });
    setOwnerName(customer.name || '');
    setOwnerPhone(customer.phone || '');
    setSearchQuery('');
    setShowCustomerDropdown(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 flex max-w-full">
        <div
          className="w-screen max-w-2xl bg-background shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border bg-muted p-4">
            <div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Motorbike01Icon} size={24} className="text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  {vehicle ? 'Edit Asset' : 'Create New Asset'}
                </h2>
              </div>
              {!vehicle && <p className="text-xs text-muted-foreground mt-0.5">Step {currentStep} of 3</p>}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={20} />
            </button>
          </div>

          {/* Progress Steps - Only show when creating new asset */}
          {!vehicle && (
            <div className="border-b border bg-background p-4">
              <div className="flex items-center justify-between">
                {[
                  { num: 1, label: 'Owner Info', icon: UserIcon },
                  { num: 2, label: 'Bike Details', icon: Motorbike01Icon },
                  { num: 3, label: 'Technical Info', icon: Wrench01Icon }
                ].map((step, idx) => (
                  <div key={step.num} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${step.num === currentStep ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                        step.num < currentStep ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                        {step.num < currentStep ? <HugeiconsIcon icon={Tick01Icon} size={20} /> : <HugeiconsIcon icon={step.icon} size={20} />}
                      </div>
                      <span className={`text-xs mt-1 font-medium ${step.num === currentStep ? 'text-primary' :
                        step.num < currentStep ? 'text-emerald-600' : 'text-muted-foreground'
                        }`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div className={`flex-1 h-1 mx-3 rounded transition-all ${step.num < currentStep ? 'bg-emerald-600' : 'bg-muted'
                        }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form - Scrollable */}
          <form id="asset-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6">

              {/* STEP 1: Owner Information */}
              {(currentStep === 1 || vehicle) && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <HugeiconsIcon icon={UserIcon} size={20} className="text-primary" />
                    Owner Information
                  </h3>
                  <div className="space-y-6">
                    {/* Ownership Type */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Asset Ownership Type <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['Individual', 'WATU', 'Business'] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setOwnershipType(type)}
                            className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${ownershipType === type
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-background text-foreground hover:border-input'
                              }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Search existing customer */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Search Existing Owner
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowCustomerDropdown(e.target.value.length > 0);
                          }}
                          onFocus={() => setShowCustomerDropdown(searchQuery.length > 0)}
                          placeholder="Search by name or phone number"
                          className="w-full px-3 py-2 pl-10 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      </div>

                      {/* Dropdown results */}
                      {showCustomerDropdown && filteredCustomers.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-background border border-input rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredCustomers.map((customer) => (
                            <button
                              key={customer.id}
                              type="button"
                              onClick={() => handleSelectCustomer(customer)}
                              className="w-full px-4 py-2 text-left hover:bg-muted flex items-center justify-between group"
                            >
                              <div>
                                <div className="text-sm font-medium text-foreground">{customer.name || 'No name'}</div>
                                <div className="text-xs text-muted-foreground">{customer.phone || 'No phone'}</div>
                              </div>
                              <HugeiconsIcon icon={Tick01Icon} size={16} className="text-primary opacity-0 group-hover:opacity-100" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-input"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-background text-muted-foreground">or enter new owner details</span>
                      </div>
                    </div>

                    {/* Owner name */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Owner Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter owner's full name"
                      />
                    </div>

                    {/* Owner phone */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Owner Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={ownerPhone}
                        onChange={(e) => setOwnerPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter phone number"
                      />
                    </div>

                    {/* Selected customer indicator */}
                    {formData.customer_id && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-green-600" />
                          <span className="text-sm text-green-900">Existing customer selected</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, customer_id: '' });
                            setOwnerName('');
                            setOwnerPhone('');
                          }}
                          className="text-xs text-green-700 hover:text-green-900 underline"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              )}

              {/* STEP 2: Bike Details */}
              {(currentStep === 2 || vehicle) && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <HugeiconsIcon icon={Motorbike01Icon} size={20} className="text-primary" />
                    Bike Details
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        License Plate <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.license_plate}
                        onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                        className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter license plate"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Make <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.make}
                          onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                          className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="e.g., TVS"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Model <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.model}
                          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                          className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="e.g., iQube"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Production Date</label>
                        <input
                          type="date"
                          value={formData.date_of_manufacture ? formData.date_of_manufacture.split('T')[0] : ''}
                          onChange={(e) => {
                            const dateValue = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                            const year = e.target.value ? new Date(e.target.value).getFullYear() : undefined;
                            setFormData({ ...formData, date_of_manufacture: dateValue, year });
                          }}
                          className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={formData.status || 'Normal'}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="Normal">Normal</option>
                          <option value="In Repair">In Repair</option>
                          <option value="Decommissioned">Decommissioned</option>
                        </select>
                      </div>
                    </div>

                    {/* Warranty Information - Auto-calculated */}
                    {formData.date_of_manufacture && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <HugeiconsIcon icon={InformationCircleIcon} size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">Warranty Information</p>
                            <p className="text-xs text-blue-700 mt-1">
                              A 1-year warranty will be automatically set from the production date ({new Date(formData.date_of_manufacture).toLocaleDateString()}) to {new Date(new Date(formData.date_of_manufacture).setFullYear(new Date(formData.date_of_manufacture).getFullYear() + 1)).toLocaleDateString()}.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Emergency Bike Flag - Only for Business ownership */}
                    {ownershipType === 'Business' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="is_emergency_bike"
                          checked={formData.is_emergency_bike || false}
                          onChange={(e) => setFormData({ ...formData, is_emergency_bike: e.target.checked })}
                          className="w-4 h-4 text-primary border-input rounded focus:ring-primary-500"
                        />
                        <label htmlFor="is_emergency_bike" className="text-sm font-medium text-foreground">
                          Mark as Emergency Bike
                        </label>
                      </div>
                    )}

                    {/* Info message for non-business ownership */}
                    {ownershipType !== 'Business' && (
                      <div className="bg-muted border border-border rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <HugeiconsIcon icon={InformationCircleIcon} size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground">
                            Only company-owned bikes (Business ownership) can be marked as Emergency Bikes.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Technical Information */}
              {(currentStep === 3 || vehicle) && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <HugeiconsIcon icon={Wrench01Icon} size={20} className="text-primary" />
                    Technical Information
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        VIN <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.vin}
                        onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                        className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Vehicle Identification Number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Year <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        value={formData.year || ''}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value ? parseInt(e.target.value) : new Date().getFullYear() })}
                        className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Manufacturing year"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Motor Number</label>
                      <input
                        type="text"
                        value={formData.motor_number || ''}
                        onChange={(e) => setFormData({ ...formData, motor_number: e.target.value })}
                        className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Motor/Engine Number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Mileage (km)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.mileage ?? ''}
                        onChange={(e) => setFormData({ ...formData, mileage: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Current mileage"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </form>

          {/* Footer Actions - Sticky */}
          <div className="flex items-center justify-between border-t border-border bg-muted p-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 font-medium text-foreground bg-background border border-input rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              {/* Back button - only show when not on first step and not editing */}
              {!vehicle && currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  disabled={isSaving}
                  className="px-4 py-2 font-medium text-foreground bg-background border border-input rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                  Back
                </button>
              )}

              {/* Next/Submit button */}
              {!vehicle && currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    // Validate current step before proceeding
                    if (currentStep === 1) {
                      if (!ownerName || !ownerPhone) {
                        showValidationError('Please provide owner name and phone number');
                        return;
                      }
                    } else if (currentStep === 2) {
                      if (!formData.license_plate || !formData.make || !formData.model) {
                        showValidationError('Please fill in License Plate, Make, and Model');
                        return;
                      }
                    } else if (currentStep === 3) {
                      if (!formData.vin || !formData.year) {
                        showValidationError('Please fill in VIN and Year (required fields)');
                        return;
                      }
                    }
                    setCurrentStep(prev => prev + 1);
                  }}
                  className="px-4 py-2 font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  Next
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  form="asset-form"
                  disabled={isSaving}
                  className="px-4 py-2 font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSaving && <HugeiconsIcon icon={Loading01Icon} size={16} className="animate-spin" />}
                  {vehicle ? 'Update Asset' : 'Create Asset'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
