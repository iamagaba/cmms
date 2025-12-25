import React from 'react';

export const IssueConfirmationDialog = ({ isOpen, onClose }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md backdrop-saturate-150" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg">Issue Confirmation Dialog Stub</div>
        </div>
    );
};
