import React from 'react';
import { Badge } from '@/components/tailwind-components/feedback/Badge';

export interface StatusBadgeProps {
    status: 'success' | 'warning' | 'error' | 'neutral' | 'info' | string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    children: React.ReactNode;
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', children, className }) => {
    let color: 'primary' | 'gray' | 'red' | 'green' | 'blue' | 'yellow' | 'orange' = 'gray';

    switch (status.toLowerCase()) {
        case 'success':
        case 'completed':
        case 'ready':
            color = 'green';
            break;
        case 'warning':
        case 'pending':
        case 'in progress':
            color = 'orange'; // or yellow
            break;
        case 'error':
        case 'urgent':
        case 'overdue':
            color = 'red';
            break;
        case 'info':
        case 'new':
            color = 'blue';
            break;
        case 'neutral':
        default:
            color = 'gray';
            break;
    }

    return (
        <Badge color={color} size={size} radius="full" className={className}>
            {children}
        </Badge>
    );
};
