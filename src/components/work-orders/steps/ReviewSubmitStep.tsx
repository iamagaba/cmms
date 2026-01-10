import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { InformationCircleIcon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';

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
        <div className="space-y-2">
            <div className="rounded-lg bg-blue-50/50 border border-blue-100 p-2 flex gap-2">
                <HugeiconsIcon icon={InformationCircleIcon} size={14} className="text-blue-600 mt-0.5" />
                <div>
                    <h4 className="text-xs font-semibold text-blue-900">Review Details</h4>
                    <p className="text-[10px] text-blue-700 mt-0.5">
                        Review the information in the sections above. Click any completed section header to edit if needed.
                    </p>
                </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
                <Button
                    onClick={onSubmit}
                    loading={isSubmitting}
                    size="xs"
                    leftSection={!isSubmitting && <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} />}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Work Order'}
                </Button>
            </div>
        </div>
    );
};
