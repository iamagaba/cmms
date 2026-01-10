import React from 'react';
import { useDensitySpacing } from '@/hooks/useDensitySpacing';
import { useDensity } from '@/context/DensityContext';

export const OnHoldReasonDialog = ({ isOpen, onClose, onSave }: any) => {
    const spacing = useDensitySpacing();
    const { isCompact } = useDensity();
    
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm backdrop-saturate-150">
            <div className={`bg-white ${spacing.card} ${spacing.roundedLg} shadow-xl max-w-md w-full`}>
                <h3 className={`${spacing.text.heading} font-semibold ${spacing.mb}`}>On Hold Reason</h3>
                <p className={`${spacing.text.body} text-gray-600 ${spacing.mb}`}>This feature is not yet fully implemented.</p>
                <button
                    onClick={onClose}
                    className={`${spacing.button} bg-gray-100 hover:bg-gray-200 ${spacing.rounded} font-medium transition-colors`}
                >
                    Close
                </button>
            </div>
        </div>
    );
};
