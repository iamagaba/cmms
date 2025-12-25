import React from 'react';

export const MaintenanceCompletionDrawer = ({ open, onClose }: any) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-md backdrop-saturate-150" onClick={onClose}>
            <div className="bg-white p-6 w-96 h-full">Maintenance Completion Stub</div>
        </div>
    );
};
