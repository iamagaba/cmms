import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Check, ArrowRight } from 'lucide-react';
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
import { useRealtimeData } from '@/context/RealtimeDataContext';


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
  const { refreshData } = useRealtimeData();

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
        showError(`Complete the ${['Vehicle', 'Diagnostic', 'Details'][i]} section first`);
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
    console.log('🚀 Submit started', { formData });
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.customerId || !formData.vehicleId) {
        throw new Error('Customer and vehicle are required');
      }
      if (!formData.serviceLocationId) {
        throw new Error('Service location is required');
      }

      console.log('✅ Validation passed');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;

      console.log('👤 Current user:', { userId, email: user?.email });

      // Ensure user has a profile (create/update if needed)
      if (userId && user?.email) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', userId)
          .single();
        
        console.log('👤 Existing profile:', existingProfile);

        if (!existingProfile) {
          // Create profile if it doesn't exist
          console.log('📝 Creating profile for user...');
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email,
              updated_at: new Date().toISOString()
            });
          
          if (profileError) {
            console.error('❌ Error creating profile:', profileError);
          } else {
            console.log('✅ Profile created');
          }
        } else if (!existingProfile.full_name && !existingProfile.email) {
          // Update profile if it's missing full_name and email
          console.log('📝 Updating profile with email...');
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
          
          if (updateError) {
            console.error('❌ Error updating profile:', updateError);
          } else {
            console.log('✅ Profile updated');
          }
        }
      }

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const workOrderNumber = `WO-${dateStr}-${randomNum}`;

      console.log('📝 Creating work order:', workOrderNumber);

      const workOrderData: Record<string, unknown> = {
        work_order_number: workOrderNumber,
        customer_id: formData.customerId,
        vehicle_id: formData.vehicleId,
        status: 'New',
        priority: formData.priority || 'Medium',
        location_id: formData.serviceLocationId,
        customer_address: formData.customerLocation?.address || null,
        customer_lat: formData.customerLocation?.lat || null,
        customer_lng: formData.customerLocation?.lng || null,
        diagnostic_data: formData.diagnosticSession || null,
        category: formData.diagnosticSession?.finalCategory || null,
        subcategory: formData.diagnosticSession?.finalSubcategory || null,
        solution_attempted: formData.diagnosticSession?.solutionAttempted || false,
        needs_confirmation_call: true,
        activity_log: [{
          timestamp: new Date().toISOString(),
          activity: 'Work order created.',
          userId: userId
        }]
      };

      if (formData.diagnosticSession?.summary) workOrderData.initial_diagnosis = formData.diagnosticSession.summary;
      workOrderData.service = formData.diagnosticSession?.finalCategory || 'General Service';
      if (formData.customerNotes) workOrderData.service_notes = formData.customerNotes;

      console.log('💾 Inserting to database...', workOrderData);

      const { data, error } = await supabase.from('work_orders').insert([workOrderData]).select();
      
      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Work order created:', data);

      showSuccess(`Work Order ${workOrderNumber} created successfully!`);
      
      // Invalidate all work order queries
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      // Invalidate customer-specific work orders (all customers)
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          Array.isArray(query.queryKey) && 
          query.queryKey[0] === 'customer-work-orders'
      });
      
      await refreshData();

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

  // Auto-complete sections when we have pre-filled data
  useEffect(() => {
    if (isOpen && initialData?.vehicleId && initialData?.customerId) {
      // Don't auto-complete the section, just pre-fill the data
      // User still needs to enter location, so keep them on step 1
      // The section will be marked complete when they fill in location and proceed
    }
  }, [isOpen, initialData?.vehicleId, initialData?.customerId]);



  if (!isOpen) return null;

  const sections = [
    { title: 'Vehicle & Customer', label: 'Vehicle' },
    { title: 'Diagnostic', label: 'Diagnostic' },
    { title: 'Details', label: 'Details' },
    { title: 'Submit', label: 'Submit' }
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-background shadow-2xl z-50 flex flex-col border-l border-border/50">
        {/* Header - Bespoke Industrial Style */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
          <div>
            <h2 className="text-lg font-brand font-bold text-foreground tracking-tight">Create Work Order</h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium tracking-wide uppercase">New Service Request</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted/80">
            <X className="w-5 h-5 text-muted-foreground/70" />
          </Button>
        </div>

        {/* Custom "Tab-like" Stepper */}
        <div className="px-6 py-4 bg-muted/20 border-b border-border/60 flex-shrink-0">
          <div className="flex items-center gap-1">
            {sections.map((step, idx) => {
              const isActive = idx === activeSection;
              const isCompleted = completedSections.includes(idx);
              const isFuture = !isActive && !isCompleted;
              
              return (
                <div 
                  key={idx} 
                  className="flex-1 group"
                  onClick={() => handleStepperClick(idx)}
                >
                  <div className={`
                    relative h-1.5 rounded-full mb-2 transition-all duration-300 ease-out
                    ${isActive ? 'bg-primary w-full shadow-[0_0_10px_-2px_rgba(13,148,136,0.5)]' : ''}
                    ${isCompleted ? 'bg-primary/60 hover:bg-primary/80 cursor-pointer' : ''}
                    ${isFuture ? 'bg-muted hover:bg-muted-foreground/20' : ''}
                  `} />
                  
                  <div className={`
                    flex items-center gap-1.5 text-xs font-medium transition-colors duration-200
                    ${isActive ? 'text-primary font-bold' : ''}
                    ${isCompleted ? 'text-foreground/80 cursor-pointer hover:text-primary' : ''}
                    ${isFuture ? 'text-muted-foreground' : ''}
                  `}>
                    <span className="font-mono opacity-60">0{idx + 1}</span>
                    <span className={isActive ? 'opacity-100' : 'opacity-70'}>{step.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content - Added "paper" texture effect */}
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-20 bg-muted/5">
          <SectionCard
            index={0}
            title="Vehicle & Customer"
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
            <div className="flex justify-end pt-4 border-t border-border/50 mt-4">
              <Button onClick={() => handleToggleSection(1)} size="sm" className="font-medium shadow-sm active:scale-95 transition-transform">
                Next: Diagnostic
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                >
                  <ArrowRight className="w-4 h-4 ml-1.5" />
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
            <div className="flex justify-end pt-4 border-t border-border/50 mt-4">
              <Button onClick={() => handleToggleSection(2)} size="sm" className="font-medium shadow-sm active:scale-95 transition-transform">
                Next: Details
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                >
                  <ArrowRight className="w-4 h-4 ml-1.5" />
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
            <div className="flex justify-end pt-4 border-t border-border/50 mt-4">
              <Button onClick={() => handleToggleSection(3)} size="sm" className="font-medium shadow-sm active:scale-95 transition-transform">
                Next: Review & Submit
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                >
                  <ArrowRight className="w-4 h-4 ml-1.5" />
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




