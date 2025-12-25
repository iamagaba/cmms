import React from 'react';
import { Icon } from '@iconify/react';

import { Button } from '@/components/tailwind-components';



interface ReviewSubmitStepProps {
    data: {
        customerId: string;
        vehicleId: string;
        customerLocation: { address: string; lat: number; lng: number } | null;
        contactPhone: string;
        alternatePhone?: string;
        diagnosticSession: any;
        priority: 'low' | 'medium' | 'high' | 'urgent';
        serviceLocationId: string;
        scheduledDate?: string;
        customerNotes?: string;
    };
    onSubmit: () => void;
    isSubmitting: boolean;
}

export const ReviewSubmitStep: React.FC<ReviewSubmitStepProps> = ({
    onSubmit,
    isSubmitting
}) => {
    return (
        <div className="space-y-4">
            <div className="rounded-lg bg-blue-50/50 border border-blue-100 p-3 flex gap-2.5">
                <Icon icon="mdi:information-slab-circle" width={24} className="text-blue-600 mt-0.5" />
                <div>
                    <h4 className="text-sm font-semibold text-blue-900">Review Details</h4>
                    <p className="text-sm text-blue-700 mt-0.5">
                        Review the information in the sections above. Click any completed section header to edit if needed.
                    </p>
                </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
                <Button
                    onClick={onSubmit}
                    loading={isSubmitting}
                    className="w-full sm:w-auto px-8 py-2.5 h-11 text-base shadow-sm hover:shadow-md transition-all"
                    leftSection={!isSubmitting && <Icon icon="mdi:check-circle" width={20} />}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
            </div>
        </div>
    );
};
