import React from 'react';
import { Technician } from '@/types/supabase';

export interface ModernTechnicianCardData extends Technician {
    location?: any;
    openTasks: number;
    completedTasks: number;
    averageCompletionTime: number;
    efficiency: number;
    workload: 'light' | 'moderate' | 'heavy' | 'overloaded';
    lastActivity?: string;
    skillsCount: number;
    rating: number;
}

interface ModernTechnicianCardProps {
    technician: ModernTechnicianCardData;
    onEdit: (tech: Technician) => void;
    onDelete: (tech: Technician) => void;
    onViewProfile?: (id: string) => void;
    onUpdateStatus?: (id: string, status: any) => void;
    onAssignWorkOrder?: (tech: Technician) => void;
    compact?: boolean;
}

export const ModernTechnicianCard: React.FC<ModernTechnicianCardProps> = ({ technician }) => {
    return (
        <div className="p-4 border rounded shadow bg-white">
            <h3 className="font-bold">{technician.name}</h3>
            <p className="text-sm text-gray-500">{technician.status}</p>
        </div>
    );
};
