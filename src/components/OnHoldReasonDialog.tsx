import React from 'react';

export const OnHoldReasonDialog = ({ isOpen, onClose, onSave }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md backdrop-saturate-150">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">On Hold Reason</h3>
                <p className="text-gray-600 mb-4">This feature is not yet fully implemented.</p>
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};
