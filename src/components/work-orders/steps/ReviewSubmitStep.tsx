import React from 'react';
import { Send, Loader2 } from 'lucide-react';
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
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Submit button clicked');
        onSubmit();
    };

    return (
        <div className="space-y-6 py-4">
            <div className="text-sm text-muted-foreground">
                Review the information above. Click any section to make changes before submitting.
            </div>

            <Button
                type="button"
                onClick={handleClick}
                disabled={isSubmitting}
                size="lg"
                className="w-full"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Work Order...
                    </>
                ) : (
                    <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Work Order
                    </>
                )}
            </Button>
        </div>
    );
};


