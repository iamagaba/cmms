import React from 'react';
export const AssignTechnicianModal = ({ open, onClose }: any) => open ? <div className="fixed inset-0 bg-black/40 backdrop-blur-md backdrop-saturate-150 flex items-center justify-center"><div className="bg-white p-4">Assign Tech Modal Stub <button onClick={onClose}>Close</button></div></div> : null;
