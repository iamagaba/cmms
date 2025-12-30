import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/tailwind-components';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Cancel01Icon,
  Tick01Icon,
  ArrowRight01Icon
} from '@hugeicons/core-free-icons';
import { DiagnosticSession } from '@/types/diagnostic';
import { CustomerVehicleStep } from './steps/CustomerVehicleStep';
import { DiagnosticStep } from './steps/DiagnosticStep';
import { AdditionalDetailsStep } from './steps/AdditionalDetailsStep';
import { ReviewSubmitStep } from './steps/ReviewSubmitStep';
import { SectionCard } from './SectionCard';
import { VehicleSummary } from './summaries/VehicleSummary';
import { DiagnosticSummary } from './summaries/DiagnosticSummary';
import { DetailsSummary } from './summaries/DetailsSummary';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useQueryClient, useQuery } from '@tanstack/react-query';

interface WorkOrderFormData {
  // Step 1
  customerId: string;
  vehicleId: string;
  customerLocation: { address: string; lat: number; lng: number } | null;
  contactPhone: string;
  alternatePhone: string;

  // Step 2
  diagnosticSession: DiagnosticSession | null;

  // Step 3
  priority: 'low' | 'medium' | 'high' | 'urgent';
  serviceLocationId: string;
  scheduledDate: string;
  customerNotes: string;
}

interface CreateWorkOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<WorkOrderFormData & { licensePlate?: string }>;
}

export const CreateWorkOrderForm: React.FC<CreateWorkOrderFormProps> = ({
  isOpen,
  onClose,
  initialData
}) => {
  const queryClient = useQueryClient();

  //State for section tracking
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [activeSection, setActiveSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sectionErrors, setSectionErrors] = useState<Record<number, boolean>>({});

  const [formData, setFormData] = useState<WorkOrderFormData>({
    customerId: initialData?.customerId || '',
    vehicleId: initialData?.vehicleId || '',
    customerLocation: initialData?.customerLocation || null,
    contactPhone: initialData?.contactPhone || '',
    alternatePhone: initialData?.alternatePhone || '',
    diagnosticSession: initialData?.diagnosticSession || null,
    priority: initialData?.priority || 'medium',
    serviceLocationId: initialData?.serviceLocationId || '',
    scheduledDate: initialData?.scheduledDate || '',
    customerNotes: initialData?.customerNotes || ''
  });

  // Fetch vehicle info for summary
  const { data: vehicleInfo } = useQuery({
    queryKey: ['vehicle', formData.vehicleId],
    queryFn: async () => {
      if (!formData.vehicleId) return null;
      const { data } = await supabase
        .from('vehicles')
        .select('make, model, license_plate')
        .eq('id', formData.vehicleId)
        .single();
      return data;
    },
    enabled: !!formData.vehicleId
  });

  const updateFormData = (updates: Partial<WorkOrderFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Validation functions for each section
  const validateVehicleSection = (): boolean => {
    const errors = !formData.vehicleId || !formData.customerLocation || !formData.contactPhone;
    setSectionErrors(prev => ({ ...prev, 0: errors }));
    return !errors;
  };

  const validateDiagnosticSection = (): boolean => {
    const errors = !formData.diagnosticSession;
    setSectionErrors(prev => ({ ...prev, 1: errors }));
    return !errors;
  };

  const validateDetailsSection = (): boolean => {
    const errors = !formData.serviceLocationId;
    setSectionErrors(prev => ({ ...prev, 2: errors }));
    return !errors;
  };

  // Handler for opening/toggling a section
  const handleToggleSection = (targetIndex: number) => {
    // If clicking the current active section, do nothing
    if (targetIndex === activeSection) return;

    // Validate all sections BEFORE the target index
    let canProceed = true;

    for (let i = 0; i < targetIndex; i++) {
      let isSectionValid = false;
      switch (i) {
        case 0: isSectionValid = validateVehicleSection(); break;
        case 1: isSectionValid = validateDiagnosticSection(); break;
        case 2: isSectionValid = validateDetailsSection(); break;
        default: isSectionValid = true;
      }

      if (!isSectionValid) {
        canProceed = false;
        setSectionErrors(prev => ({ ...prev, [i]: true }));
        // If trying to jump ahead, go back to the first invalid section
        if (activeSection > i) {
          setActiveSection(i);
        }
        showError(`Please complete the ${['Vehicle', 'Diagnostic', 'Details'][i]} section first`);
        break;
      } else {
        // Mark valid sections as completed if not already
        if (!completedSections.includes(i)) {
          setCompletedSections(prev => [...prev, i]);
        }
        setSectionErrors(prev => ({ ...prev, [i]: false }));
      }
    }

    if (canProceed) {
      setActiveSection(targetIndex);
    }
  };

  // Handler for stepper clicks
  const handleStepperClick = (stepIndex: number) => {
    handleToggleSection(stepIndex);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.customerId || !formData.vehicleId) throw new Error('Customer and vehicle are required');
      if (!formData.serviceLocationId) throw new Error('Service location is required');

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const workOrderNumber = `WO-${dateStr}-${randomNum}`;

      const workOrderData: Record<string, unknown> = {
        work_order_number: workOrderNumber,
        customer_id: formData.customerId,
        vehicle_id: formData.vehicleId,
        status: 'Open',
        priority: formData.priority || 'Medium',
        location_id: formData.serviceLocationId,
        customer_address: formData.customerLocation?.address || null,
        customer_lat: formData.customerLocation?.lat || null,
        customer_lng: formData.customerLocation?.lng || null,
        diagnostic_data: formData.diagnosticSession || null,
        category: formData.diagnosticSession?.finalCategory || null,
        subcategory: formData.diagnosticSession?.finalSubcategory || null,
        solution_attempted: formData.diagnosticSession?.solutionAttempted || false,
        needs_confirmation_call: true
      };

      if (formData.diagnosticSession?.summary) workOrderData.initial_diagnosis = formData.diagnosticSession.summary;
      workOrderData.service = formData.diagnosticSession?.finalCategory || 'General Service';
      if (formData.customerNotes) workOrderData.service_notes = formData.customerNotes;

      const { error } = await supabase.from('work_orders').insert([workOrderData]);
      if (error) throw error;

      showSuccess(`Work Order ${workOrderNumber} created successfully!`);
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });

      onClose();
    } catch (error: any) {
      console.error('❌ Error creating work order:', error);
      showError(error.message || 'Failed to create work order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        customerId: initialData?.customerId || '',
        vehicleId: initialData?.vehicleId || '',
        customerLocation: initialData?.customerLocation || null,
        contactPhone: initialData?.contactPhone || '',
        alternatePhone: initialData?.alternatePhone || '',
        diagnosticSession: initialData?.diagnosticSession || null,
        priority: initialData?.priority || 'medium',
        serviceLocationId: initialData?.serviceLocationId || '',
        scheduledDate: initialData?.scheduledDate || '',
        customerNotes: initialData?.customerNotes || ''
      });
      setCompletedSections([]);
      setActiveSection(0);
      setSectionErrors({});
    }
  }, [isOpen, initialData]);



  if (!isOpen) return null;

  const sections = [
    { title: 'Vehicle & Customer Information', label: 'Vehicle' },
    { title: 'Diagnostic Information', label: 'Diagnostic' },
    { title: 'Additional Details', label: 'Details' },
    { title: 'Submit', label: 'Submit' }
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-3xl bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create Work Order</h2>
            <p className="text-sm text-gray-500 mt-0.5">Fill in the details below</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <HugeiconsIcon icon={Cancel01Icon} size={24} />
          </button>
        </div>

        {/* Clickable Stepper */}
        <div className="px-6 py-3 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-2">
            {sections.map((step, idx) => (
              <React.Fragment key={idx}>
                <div
                  onClick={() => handleStepperClick(idx)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${idx === activeSection
                    ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                    : completedSections.includes(idx)
                      ? 'bg-success-600 text-white'
                      : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600'
                    }`}>
                    {completedSections.includes(idx) && idx !== activeSection ? <HugeiconsIcon icon={Tick01Icon} size={16} /> : idx + 1}
                  </div>
                  <span className={`text-sm font-medium whitespace-nowrap hidden sm:block ${idx === activeSection
                    ? 'text-brand-600'
                    : completedSections.includes(idx)
                      ? 'text-success-600'
                      : 'text-gray-500 group-hover:text-purple-600'
                    }`}>
                    {step.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-0.5 min-w-[20px] mx-1 rounded transition-all ${completedSections.includes(idx) ? 'bg-success-600' : 'bg-gray-200'
                    }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-20">
          <SectionCard
            index={0}
            title="Vehicle & Customer Information"
            isCompleted={completedSections.includes(0)}
            isActive={activeSection === 0}
            isLocked={false}
            summary={
              formData.vehicleId ? (
                <VehicleSummary data={formData} vehicleInfo={vehicleInfo || undefined} />
              ) : null
            } onToggle={() => handleToggleSection(0)}
            hasErrors={sectionErrors[0]}
          >
            <CustomerVehicleStep data={formData} onChange={updateFormData} initialLicensePlate={initialData?.licensePlate} />
            <div className="flex justify-end pt-4 border-t border-gray-100 mt-4">
              <Button onClick={() => handleToggleSection(1)} size="sm">
                Next: Diagnostic
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-2" />
                </motion.div>
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            index={1}
            title="Diagnostic Information"
            isCompleted={completedSections.includes(1)}
            isActive={activeSection === 1}
            isLocked={false}
            summary={formData.diagnosticSession ? <DiagnosticSummary data={formData} /> : null}
            onToggle={() => handleToggleSection(1)}
            hasErrors={sectionErrors[1]}
          >
            <DiagnosticStep data={formData} onChange={updateFormData} />
            <div className="flex justify-end pt-4 border-t border-gray-100 mt-4">
              <Button onClick={() => handleToggleSection(2)} size="sm">
                Next: details
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-2" />
                </motion.div>
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            index={2}
            title="Additional Details"
            isCompleted={completedSections.includes(2)}
            isActive={activeSection === 2}
            isLocked={false}
            summary={formData.serviceLocationId ? <DetailsSummary data={formData} /> : null}
            onToggle={() => handleToggleSection(2)}
            hasErrors={sectionErrors[2]}
          >
            <AdditionalDetailsStep data={formData} onChange={updateFormData} />
            <div className="flex justify-end pt-4 border-t border-gray-100 mt-4">
              <Button onClick={() => handleToggleSection(3)} size="sm">
                Next: Review & Submit
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-2" />
                </motion.div>
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            index={3}
            title="Review & Submit"
            isCompleted={false}
            isActive={activeSection === 3}
            isLocked={false}
            onToggle={() => handleToggleSection(3)}
          >
            <ReviewSubmitStep data={formData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </SectionCard>
        </div>
      </div>
    </>
  );
};
