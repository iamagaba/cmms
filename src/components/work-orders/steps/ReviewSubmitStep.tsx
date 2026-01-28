import React from 'react';
import { Info, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';



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
            <div className="rounded-lg bg-muted/50 border border-blue-100 p-2 flex gap-2">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                    <h4 className="text-xs font-semibold text-blue-900">Review Details</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Review the information in the sections above. Click any completed section header to edit if needed.
                    </p>
                </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
                <Button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    size="sm"
                >
                    {!isSubmitting && <CheckCircle className="w-4 h-4 mr-1.5" />}
                    {isSubmitting ? 'Submitting...' : 'Submit Work Order'}
                </Button>
            </div>
        </div>
    );
};


